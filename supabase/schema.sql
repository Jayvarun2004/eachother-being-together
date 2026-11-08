-- ============================================================
-- supabase/schema.sql
-- Eachother Being Together — Supabase schema
--
-- HOW TO USE:
-- 1. Go to https://supabase.com/dashboard/project/<your-ref>/sql
-- 2. Click "New query"
-- 3. Paste this entire file and click "Run"
-- ============================================================

-- ---- Extensions ----
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---- Rooms table ----
CREATE TABLE IF NOT EXISTS public.rooms (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code          TEXT NOT NULL UNIQUE,                -- 5-char room code
  game          TEXT NOT NULL,                       -- 'truth-or-dare' | 'never-have-i-ever' | 'would-you-rather'
  level         TEXT NOT NULL DEFAULT 'wholesome',
  player1_id    UUID REFERENCES auth.users(id),
  player1_name  TEXT DEFAULT 'Player 1',
  player2_id    UUID REFERENCES auth.users(id),
  player2_name  TEXT DEFAULT 'Player 2',
  state         JSONB NOT NULL DEFAULT '{}',         -- shared game state
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---- Secret answers table ----
-- Each row is one player's answer for one round.
-- The reveal function only returns answers when BOTH players have submitted.
CREATE TABLE IF NOT EXISTS public.answers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id    UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  card_id    TEXT NOT NULL,       -- the card's id field
  player_id  UUID NOT NULL REFERENCES auth.users(id),
  answer     TEXT NOT NULL,       -- 'yes'/'no' for NHIE, 'A'/'B' for WYR
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (room_id, card_id, player_id)
);

-- ---- Auto-update updated_at ----
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS rooms_updated_at ON public.rooms;
CREATE TRIGGER rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---- Expire rooms: delete after 24h of inactivity ----
-- Run this via a Supabase Cron job (pg_cron) or a nightly Edge Function.
-- For now we provide the function; set up the cron in the Supabase dashboard.
CREATE OR REPLACE FUNCTION public.expire_rooms()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM public.rooms
  WHERE updated_at < now() - INTERVAL '24 hours';
END;
$$;

-- ---- Reveal function (enforced server-side) ----
-- Returns both answers ONLY when both players have submitted.
-- The UI calls this instead of reading the answers table directly.
CREATE OR REPLACE FUNCTION public.get_answers_if_both_ready(
  p_room_id UUID,
  p_card_id TEXT
)
RETURNS TABLE (player_id UUID, answer TEXT)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  room_rec public.rooms%ROWTYPE;
  answer_count INT;
BEGIN
  -- Verify caller is a player in the room
  SELECT * INTO room_rec FROM public.rooms WHERE id = p_room_id;
  IF room_rec IS NULL THEN
    RAISE EXCEPTION 'Room not found';
  END IF;
  IF auth.uid() NOT IN (room_rec.player1_id, room_rec.player2_id) THEN
    RAISE EXCEPTION 'Not authorised';
  END IF;

  -- Count answers for this card
  SELECT COUNT(*) INTO answer_count
  FROM public.answers
  WHERE room_id = p_room_id AND card_id = p_card_id;

  -- Only return if both players have answered
  IF answer_count < 2 THEN
    RETURN; -- empty result
  END IF;

  RETURN QUERY
    SELECT a.player_id, a.answer
    FROM public.answers a
    WHERE a.room_id = p_room_id AND a.card_id = p_card_id;
END;
$$;

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE public.rooms  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

-- ---- Rooms RLS ----
-- Anyone can CREATE a room (they will be player1)
DROP POLICY IF EXISTS "rooms_insert" ON public.rooms;
CREATE POLICY "rooms_insert" ON public.rooms
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = player1_id);

-- Only the two players in a room can read it
DROP POLICY IF EXISTS "rooms_select" ON public.rooms;
CREATE POLICY "rooms_select" ON public.rooms
  FOR SELECT TO authenticated
  USING (
    auth.uid() = player1_id
    OR auth.uid() = player2_id
    -- Allow reading by room code for joining (player2 not set yet)
    OR player2_id IS NULL
  );

-- Only the two players can update the room
DROP POLICY IF EXISTS "rooms_update" ON public.rooms;
CREATE POLICY "rooms_update" ON public.rooms
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = player1_id
    OR auth.uid() = player2_id
    OR player2_id IS NULL  -- allow joining
  );

-- ---- Answers RLS ----
-- Players can only write their own answers
DROP POLICY IF EXISTS "answers_insert" ON public.answers;
CREATE POLICY "answers_insert" ON public.answers
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = player_id
    AND EXISTS (
      SELECT 1 FROM public.rooms r
      WHERE r.id = room_id
      AND (r.player1_id = auth.uid() OR r.player2_id = auth.uid())
    )
  );

-- Players can read answers ONLY via the get_answers_if_both_ready() function
-- (direct select is blocked)
DROP POLICY IF EXISTS "answers_select" ON public.answers;
CREATE POLICY "answers_select" ON public.answers
  FOR SELECT TO authenticated
  USING (false); -- blocked; use the function instead

-- ============================================================
-- Realtime
-- Enable Realtime for the rooms table in the Supabase dashboard:
-- Database > Realtime > Enable for table: rooms
-- ============================================================
