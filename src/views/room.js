/**
 * src/views/room.js
 * Online room — play with a friend on any device, any network.
 *
 * Strategy:
 *  1. If Supabase is configured → use Supabase Realtime rooms (full sync)
 *  2. Fallback → PeerJS (WebRTC data channel) for direct peer-to-peer play.
 *     No server or account needed. Works across different phones & networks.
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
        <span class="header-logo">📡 Play With Friend</span>
        <div style="width:44px"></div>
      </header>

      <div class="glass-card mb-4" style="text-align:center; padding: 1.25rem 1rem; background: linear-gradient(135deg, rgba(255,107,157,0.07), rgba(124,58,237,0.07)); border-color: var(--accent);">
        <div style="font-size: 1.5rem; margin-bottom: 0.4rem;">💞</div>
        <div style="font-size: var(--text-sm); font-weight: 600; color: var(--text-primary);">Invite your partner to play</div>
        <div style="font-size: var(--text-xs); color: var(--text-muted); margin-top: 0.25rem;">Works across different phones & Wi-Fi networks</div>
      </div>

      <!-- Create room section -->
      <div class="glass-card mb-4" id="create-section">
        <h2 style="font-size:var(--text-lg); font-weight:700; margin-bottom:var(--space-3); color:var(--text-primary);">
          🏠 Host a Room
        </h2>
        <p style="font-size:var(--text-xs);color:var(--text-muted);margin-bottom:0.75rem">
          Create a room and share the code or link with your friend.
        </p>
        <div class="room-code-display" id="room-code-display" style="display:none; margin-bottom: 0.5rem;"></div>
        <div id="room-share-row" style="display:none; gap:0.5rem; margin-bottom:0.75rem; flex-direction:column; align-items:center;">
          <button class="btn btn-ghost btn-sm w-full" id="btn-copy-link">📋 Copy Invite Link</button>
          <button class="btn btn-ghost btn-sm w-full" id="btn-share-link" style="display:none">📲 Share via Phone</button>
        </div>
        <button class="btn btn-primary w-full" id="btn-create">🎉 Create Room</button>
      </div>

      <!-- Join room section -->
      <div class="glass-card mb-4" id="join-section">
        <h2 style="font-size:var(--text-lg); font-weight:700; margin-bottom:var(--space-3); color:var(--text-primary);">
          🔗 Join a Room
        </h2>
        <p style="font-size:var(--text-xs);color:var(--text-muted);margin-bottom:0.75rem">
          Got a code from your partner? Enter it here.
        </p>
        <div class="room-join-input">
          <input id="inp-room-code" type="text" maxlength="5"
            placeholder="${t('room.joinPlaceholder')}" autocomplete="off"
            style="text-transform:uppercase; letter-spacing:0.15em; font-size:var(--text-xl); font-weight:700;"
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

      <!-- Mode notice -->
      <div id="mode-notice" class="glass-card" style="display:none; margin-top: 0.5rem; border-color: rgba(124,58,237,0.3); padding: 0.85rem;">
        <p style="font-size:var(--text-xs);color:var(--text-muted);text-align:center;" id="mode-notice-text"></p>
      </div>
    </div>
  `;

  document.getElementById('btn-back')?.addEventListener('click', () => navigate('home'));

  // Auto-fill code from URL ?room=XXXXX
  const urlParams = new URLSearchParams(window.location.search);
  const roomFromUrl = urlParams.get('room');
  if (roomFromUrl) {
    const codeInput = document.getElementById('inp-room-code');
    if (codeInput) {
      codeInput.value = roomFromUrl.toUpperCase();
      toast('Room code pre-filled from link!', 'success');
    }
  }

  // Show native share button if Web Share API available
  if (navigator.share) {
    const shareBtn = document.getElementById('btn-share-link');
    if (shareBtn) shareBtn.style.display = 'block';
  }

  // Check Supabase availability, then pick mode
  getSupabase().then(sb => {
    if (sb) {
      const notice = document.getElementById('mode-notice');
      const noticeText = document.getElementById('mode-notice-text');
      if (notice && noticeText) {
        notice.style.display = 'block';
        noticeText.textContent = '✅ Supabase connected — real-time sync active';
        notice.style.borderColor = 'rgba(34,197,94,0.3)';
      }
      initSupabaseRoom(sb, game);
    } else {
      const notice = document.getElementById('mode-notice');
      const noticeText = document.getElementById('mode-notice-text');
      if (notice && noticeText) {
        notice.style.display = 'block';
        noticeText.textContent = '📡 Using P2P mode — no account needed. Works across any network.';
      }
      initPeerRoom(game);
    }
  });
}

// ═══════════════════════════════════════════════════════
// SUPABASE ROOM MODE (full realtime sync)
// ═══════════════════════════════════════════════════════
async function initSupabaseRoom(sb, game) {
  let currentRoomCode = null;

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

      showRoomCode(code);
      showPartnerStatus('waiting');

      sb.channel(`room:${data.id}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${data.id}` },
          payload => handleRoomUpdate(payload.new, 'player1'))
        .subscribe();

      btn.textContent = '✅ Room Created!';
    } catch (e) {
      console.error('create room', e);
      toast(t('errors.generic'), 'error');
      btn.disabled = false;
      btn.textContent = '🎉 Create Room';
    }
  });

  setupShareButtons(() => currentRoomCode);

  document.getElementById('btn-join')?.addEventListener('click', async () => {
    const code = (document.getElementById('inp-room-code')?.value ?? '').trim().toUpperCase();
    if (code.length !== ROOM_CODE_LENGTH) {
      toast(`Please enter a ${ROOM_CODE_LENGTH}-letter code`, 'warning');
      return;
    }
    await joinSupabaseRoom(sb, code);
  });
}

async function joinSupabaseRoom(sb, code) {
  const btn = document.getElementById('btn-join');
  btn.disabled = true;
  btn.textContent = '…';

  try {
    const user = await signInAnonymously();
    if (!user) throw new Error('Sign-in failed');

    const { data: room, error } = await sb
      .from('rooms')
      .select('*')
      .eq('code', code)
      .single();

    if (error || !room) { toast(t('errors.roomNotFound'), 'error'); return; }
    if (room.player2_id && room.player2_id !== user.id) {
      toast(t('room.fullRoom'), 'error'); return;
    }

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

    sb.channel(`room:${room.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${room.id}` },
        payload => handleRoomUpdate(payload.new, 'player2'))
      .subscribe();

    showPartnerStatus('online', room.player1_name);
    toast(t('room.partnerJoined', { name: room.player1_name }), 'success');
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

// ═══════════════════════════════════════════════════════
// P2P PEER.JS ROOM MODE (no backend needed)
// ═══════════════════════════════════════════════════════
let _peer = null;
let _conn = null;

async function initPeerRoom(game) {
  // Lazy-load PeerJS from CDN
  try {
    if (!window.Peer) {
      await loadScript('https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js');
    }
  } catch (e) {
    toast('Could not load P2P library. Check internet connection.', 'error');
    return;
  }

  document.getElementById('btn-create')?.addEventListener('click', () => {
    const btn = document.getElementById('btn-create');
    btn.disabled = true;
    btn.textContent = 'Connecting…';

    const code = generateCode();
    _peer = new window.Peer(`ebt-${code}`, {
      host: '0.peerjs.com',
      port: 443,
      path: '/',
      secure: true,
    });

    _peer.on('open', () => {
      showRoomCode(code);
      showPartnerStatus('waiting');
      btn.textContent = '✅ Room Created!';
      toast('Room created! Share the code with your friend 🎉', 'success');
    });

    _peer.on('connection', (conn) => {
      _conn = conn;
      conn.on('open', () => {
        showPartnerStatus('online', 'Your partner');
        toast('💞 Partner connected!', 'success');
        // Send game settings to partner
        conn.send({ type: 'game-info', game, level: state.get('level'), player1: state.get('player1') });
        setTimeout(() => navigate(`game/${game}`), 1500);
      });
      conn.on('data', handlePeerData);
      conn.on('close', () => showPartnerStatus('offline'));
    });

    _peer.on('error', (err) => {
      console.error('PeerJS error', err);
      toast('Connection error. Try again.', 'error');
      btn.disabled = false;
      btn.textContent = '🎉 Create Room';
    });
  });

  setupShareButtons(() => {
    const codeEl = document.getElementById('room-code-display');
    return codeEl?.textContent?.trim() ?? null;
  });

  document.getElementById('btn-join')?.addEventListener('click', () => {
    const code = (document.getElementById('inp-room-code')?.value ?? '').trim().toUpperCase();
    if (code.length !== ROOM_CODE_LENGTH) {
      toast(`Please enter a ${ROOM_CODE_LENGTH}-letter code`, 'warning');
      return;
    }
    joinPeerRoom(code);
  });
}

function joinPeerRoom(code) {
  const btn = document.getElementById('btn-join');
  btn.disabled = true;
  btn.textContent = 'Connecting…';

  _peer = new window.Peer(undefined, {
    host: '0.peerjs.com',
    port: 443,
    path: '/',
    secure: true,
  });

  _peer.on('open', () => {
    _conn = _peer.connect(`ebt-${code}`, { reliable: true });

    _conn.on('open', () => {
      showPartnerStatus('online', 'Host');
      toast('💞 Connected to room!', 'success');
    });

    _conn.on('data', (data) => {
      if (data.type === 'game-info') {
        state.patch({
          game: data.game,
          level: data.level,
          player1: data.player1,
          mode: 'online',
        });
        setTimeout(() => navigate(`game/${data.game}`), 1200);
      }
      handlePeerData(data);
    });

    _conn.on('close', () => showPartnerStatus('offline'));

    _peer.on('error', (err) => {
      console.error('PeerJS join error', err);
      toast('Could not find room. Check the code and try again.', 'error');
      btn.disabled = false;
      btn.textContent = t('room.btnJoin');
    });
  });
}

function handlePeerData(data) {
  if (data.type === 'game-info') return; // handled inline
  // Future: sync card state across devices
  console.log('Peer data received:', data);
}

// ═══════════════════════════════════════════════════════
// SHARED HELPERS
// ═══════════════════════════════════════════════════════

function showRoomCode(code) {
  const display = document.getElementById('room-code-display');
  const shareRow = document.getElementById('room-share-row');
  if (display) { display.textContent = code; display.style.display = 'block'; }
  if (shareRow) shareRow.style.display = 'flex';
}

function setupShareButtons(getCode) {
  document.getElementById('btn-copy-link')?.addEventListener('click', () => {
    const code = getCode();
    if (!code) return;
    const link = `${window.location.origin}${window.location.pathname}?room=${code}#room`;
    navigator.clipboard?.writeText(link)
      .then(() => toast('💕 Invite link copied! Share it with your partner.', 'success'))
      .catch(() => {
        // Fallback: show the link in a prompt
        window.prompt('Copy this link:', link);
      });
  });

  document.getElementById('btn-share-link')?.addEventListener('click', () => {
    const code = getCode();
    if (!code) return;
    const link = `${window.location.origin}${window.location.pathname}?room=${code}#room`;
    if (navigator.share) {
      navigator.share({
        title: 'Play with me on Eachother Being Together 💕',
        text: `Join my game! Code: ${code}`,
        url: link,
      }).catch(() => {});
    }
  });
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
    text.textContent = name ? `💞 ${name} connected!` : '💕 Partner connected!';
  } else if (status === 'offline') {
    dot.className = 'partner-dot offline';
    text.textContent = t('room.partnerDisconnected');
  }
}

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: ROOM_CODE_LENGTH }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) { resolve(); return; }
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
