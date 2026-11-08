/**
 * src/views/room.js
 * Online room view — create or join a room, show partner status.
 * Uses Supabase for room creation and real-time updates.
 */

import { t } from '../lib/i18n.js';
import { state } from '../lib/state.js';
import { navigate } from '../lib/router.js';
import { toast } from '../lib/toast.js';
import { getSupabase, signInAnonymously } from '../lib/supabase.js';

const ROOM_CODE_LENGTH = 5;

export function renderRoom() {
  const app = document.getElementById('app');
  const game = state.get('game') ?? 'truth-or-dare';

  app.innerHTML = /* html */ `
    <div class="view active animate-slide-up" id="view-room">
      <header class="app-header">
        <button class="btn-icon" id="btn-back" aria-label="Back">←</button>
        <span class="header-logo">📡 Online</span>
        <div style="width:44px"></div>
      </header>

      <!-- Create room section -->
      <div class="glass-card mb-6" id="create-section">
        <h2 class="room-view-title" style="font-size:var(--text-xl);margin-bottom:var(--space-4)">
          ${t('room.createTitle')}
        </h2>
        <div class="room-code-display" id="room-code-display">— — — — —</div>
        <p class="room-code-hint">${t('room.hint')}</p>
        <button class="btn btn-primary mb-4" id="btn-create">${t('room.btnCreate')}</button>
        <button class="btn btn-ghost btn-sm w-full" id="btn-copy-link" disabled>${t('room.btnCopyLink')}</button>
      </div>

      <!-- Join room section -->
      <div class="glass-card mb-6">
        <h2 style="font-size:var(--text-xl);color:var(--color-rose);margin-bottom:var(--space-4);text-align:center">
          ${t('room.joinTitle')}
        </h2>
        <div class="room-join-input">
          <input id="inp-room-code" type="text" maxlength="5"
            placeholder="${t('room.joinPlaceholder')}" autocomplete="off"
            aria-label="Room code" />
          <button class="btn btn-secondary" id="btn-join" style="width:auto;min-height:52px;padding:0 1.5rem">
            ${t('room.btnJoin')}
          </button>
        </div>
      </div>

      <!-- Partner status -->
      <div class="partner-status" id="partner-status" style="display:none" aria-live="polite">
        <div class="partner-dot" id="partner-dot"></div>
        <span id="partner-status-text">${t('room.waiting')}</span>
      </div>

      <!-- Supabase not configured notice -->
      <div id="no-supabase-notice" class="glass-card" style="display:none;border-color:var(--color-coral)">
        <p style="color:var(--color-coral);font-size:var(--text-sm);text-align:center">
          ${t('errors.supabaseNotConfigured')}
        </p>
        <button class="btn btn-ghost btn-sm w-full mt-4" id="btn-fallback-local">
          🎮 Play locally instead
        </button>
      </div>
    </div>
  `;

  document.getElementById('btn-back')?.addEventListener('click', () => navigate('home'));
  document.getElementById('btn-fallback-local')?.addEventListener('click', () => {
    state.set('mode', 'local');
    navigate('setup');
  });

  // Check if Supabase is available
  getSupabase().then(sb => {
    if (!sb) {
      document.getElementById('create-section').style.display = 'none';
      document.querySelector('.glass-card:nth-child(2)').style.display = 'none';
      document.getElementById('no-supabase-notice').style.display = 'block';
      return;
    }
    initRoomActions(sb, game);
  });

  // Auto-join from URL ?room=XXXXX
  const urlParams = new URLSearchParams(window.location.search);
  const roomFromUrl = urlParams.get('room');
  if (roomFromUrl) {
    document.getElementById('inp-room-code').value = roomFromUrl.toUpperCase();
  }
}

async function initRoomActions(sb, game) {
  let currentRoomCode = null;

  // Create room
  document.getElementById('btn-create')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-create');
    btn.disabled = true;
    btn.textContent = 'Creating…';

    try {
      const user = await signInAnonymously();
      if (!user) throw new Error('Sign-in failed');

      const code = generateCode();
      const { data, error } = await sb.from('rooms').insert({
        code,
        game,
        level: state.get('level'),
        player1_id: user.id,
        player1_name: state.get('player1'),
        state: { turn: 0, scores: [0, 0], skipsLeft: [3, 3], vetosLeft: [1, 1] },
      }).select().single();

      if (error) throw error;

      currentRoomCode = code;
      state.patch({ roomId: data.id, roomCode: code, playerId: user.id });

      // Show code
      document.getElementById('room-code-display').textContent = code;
      document.getElementById('btn-copy-link').disabled = false;
      document.getElementById('partner-status').style.display = 'flex';
      showPartnerStatus('waiting');

      // Subscribe to room updates
      sb.channel(`room:${data.id}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${data.id}` },
          payload => handleRoomUpdate(payload.new, 'player1'))
        .subscribe();

      btn.textContent = '✅ Room created!';
    } catch (e) {
      console.error('create room', e);
      toast(t('errors.generic'), 'error');
      btn.disabled = false;
      btn.textContent = t('room.btnCreate');
    }
  });

  // Copy link
  document.getElementById('btn-copy-link')?.addEventListener('click', () => {
    if (!currentRoomCode) return;
    const link = `${window.location.origin}${window.location.pathname}?room=${currentRoomCode}#room`;
    navigator.clipboard?.writeText(link).then(() => toast('Link copied! 📋', 'success'));
  });

  // Join room
  document.getElementById('btn-join')?.addEventListener('click', async () => {
    const code = (document.getElementById('inp-room-code')?.value ?? '').trim().toUpperCase();
    if (code.length !== ROOM_CODE_LENGTH) {
      toast(`Please enter a ${ROOM_CODE_LENGTH}-letter code`, 'warning');
      return;
    }
    await joinRoom(sb, code);
  });
}

async function joinRoom(sb, code) {
  const btn = document.getElementById('btn-join');
  btn.disabled = true;
  btn.textContent = '…';

  try {
    const user = await signInAnonymously();
    if (!user) throw new Error('Sign-in failed');

    // Look up room
    const { data: room, error } = await sb
      .from('rooms')
      .select('*')
      .eq('code', code)
      .single();

    if (error || !room) { toast(t('errors.roomNotFound'), 'error'); return; }
    if (room.player2_id && room.player2_id !== user.id) {
      toast(t('room.fullRoom'), 'error'); return;
    }

    // Join as player 2
    const { error: updateErr } = await sb.from('rooms').update({
      player2_id: user.id,
      player2_name: state.get('player2'),
    }).eq('id', room.id);

    if (updateErr) throw updateErr;

    state.patch({
      roomId: room.id,
      roomCode: code,
      playerId: user.id,
      game: room.game,
      level: room.level,
      player1: room.player1_name,
      mode: 'online',
    });

    // Subscribe
    sb.channel(`room:${room.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${room.id}` },
        payload => handleRoomUpdate(payload.new, 'player2'))
      .subscribe();

    showPartnerStatus('online', room.player1_name);
    toast(t('room.partnerJoined', { name: room.player1_name }), 'success');

    // Navigate to game after a short pause
    setTimeout(() => navigate(`game/${room.game}`), 1500);
  } catch (e) {
    console.error('join room', e);
    toast(t('errors.generic'), 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = t('room.btnJoin');
  }
}

function handleRoomUpdate(room, myRole) {
  if (room.player2_id && myRole === 'player1') {
    showPartnerStatus('online', room.player2_name);
    toast(t('room.partnerJoined', { name: room.player2_name }), 'success');
    setTimeout(() => navigate(`game/${room.game}`), 1500);
  }
}

function showPartnerStatus(status, name = '') {
  const dot = document.getElementById('partner-dot');
  const text = document.getElementById('partner-status-text');
  const wrap = document.getElementById('partner-status');
  if (!dot || !text || !wrap) return;
  wrap.style.display = 'flex';
  if (status === 'waiting') {
    dot.className = 'partner-dot';
    text.textContent = t('room.waiting');
  } else if (status === 'online') {
    dot.className = 'partner-dot online';
    text.textContent = name ? t('room.partnerJoined', { name }) : '💕 Partner connected!';
  } else if (status === 'offline') {
    dot.className = 'partner-dot offline';
    text.textContent = t('room.partnerDisconnected');
  }
}

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars
  return Array.from({ length: ROOM_CODE_LENGTH }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}
