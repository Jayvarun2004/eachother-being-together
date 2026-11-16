/**
 * src/lib/chat-panel.js
 * In-game Romantic Side Panel Chat & Live Floating Reactions.
 * Perfectly styled according to the webpage's romantic Apple-Studio theme.
 * Works seamlessly across mobile, tablet, and desktop devices on the internet.
 */

import { multiplayer } from './multiplayer.js';
import { toast } from './toast.js';

let _containerEl = null;
let _cleanupFns = [];
let _unreadCount = 0;
let _isPanelOpen = true; // default open on desktop, toggleable on mobile
let _typingTimer = null;

export function mountChatPanel(parentEl, { onToggle = null } = {}) {
  unmountChatPanel();

  const isMobile = window.innerWidth < 860;
  _isPanelOpen = !isMobile;
  _unreadCount = 0;

  const panel = document.createElement('aside');
  panel.className = `game-chat-panel ${isMobile ? 'mobile-drawer' : 'desktop-side'} ${_isPanelOpen ? 'open' : 'closed'}`;
  panel.id = 'game-chat-panel';

  const partnerName = escHtml(multiplayer.partnerName || 'Partner');
  const roomCode = multiplayer.roomCode;

  panel.innerHTML = /* html */ `
    <div class="romantic-chat-container">
      <!-- Chat Header -->
      <header class="romantic-chat-header">
        <div class="romantic-user-info">
          <div class="romantic-avatar">
            <span>${partnerName.charAt(0).toUpperCase()}</span>
            <span class="romantic-status-dot ${multiplayer.isConnected ? 'online' : 'offline'}"></span>
          </div>
          <div class="romantic-user-text">
            <div class="romantic-user-name">${partnerName}</div>
            <div class="romantic-user-status" id="chat-partner-status">
              ${
                multiplayer.isConnected
                  ? (roomCode ? `Online · Room ${roomCode}` : 'Online 💕')
                  : 'Playing locally · Tap Invite'
              }
            </div>
          </div>
        </div>

        <div class="romantic-header-actions">
          <button class="romantic-btn-pill" id="btn-chat-share-invite" title="Share invite link with partner">
            <span class="btn-pill-icon">🔗</span>
            <span class="btn-share-text" id="btn-share-label">${roomCode ? roomCode : 'Invite'}</span>
          </button>
          <button class="romantic-btn-icon" id="btn-toggle-reactions" title="Romantic Quick Reactions" aria-label="Toggle reactions">
            💖
          </button>
          <button class="romantic-btn-icon btn-close-chat" id="btn-close-chat" title="Minimize Chat" aria-label="Minimize Chat">
            ✕
          </button>
        </div>
      </header>

      <!-- Connect Banner when not connected -->
      ${
        !multiplayer.isConnected
          ? `
        <div class="romantic-connect-banner" id="chat-connect-banner">
          <div class="connect-banner-icon">💞</div>
          <div class="connect-banner-text">
            <strong>Play online together</strong>
            <span>Invite partner with link to play & chat live</span>
          </div>
          <button type="button" class="romantic-connect-btn" id="btn-connect-partner-now">🔗 Share Link</button>
        </div>
      `
          : ''
      }

      <!-- Quick Reactions Row -->
      <div class="romantic-reactions-bar" id="romantic-reactions-bar">
        <button class="reaction-pill" data-emoji="❤️" title="Love">❤️</button>
        <button class="reaction-pill" data-emoji="🔥" title="Spicy">🔥</button>
        <button class="reaction-pill" data-emoji="🙈" title="Blush">🙈</button>
        <button class="reaction-pill" data-emoji="💋" title="Kiss">💋</button>
        <button class="reaction-pill" data-emoji="😂" title="Haha">😂</button>
        <button class="reaction-pill" data-emoji="🥂" title="Cheers">🥂</button>
        <button class="reaction-pill" data-emoji="🤫" title="Secret">🤫</button>
        <button class="reaction-pill" data-emoji="✨" title="Soul">✨</button>
      </div>

      <!-- Messages Stream -->
      <div class="romantic-messages" id="romantic-messages" role="log" aria-live="polite">
        <div class="romantic-date-pill"><span>TODAY</span></div>
        <div class="romantic-encrypted-pill">
          🔒 Private connection between you and ${partnerName}
        </div>
        <div id="romantic-message-list"></div>
      </div>

      <!-- Chat Input Footer -->
      <footer class="romantic-footer">
        <form class="romantic-input-row" id="romantic-form" autocomplete="off">
          <input
            type="text"
            id="romantic-input"
            class="romantic-input"
            placeholder="Type a sweet message to ${partnerName}..."
            maxlength="400"
          />
          <button type="submit" class="romantic-send-btn" id="btn-send-chat" aria-label="Send Message" title="Send">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
            </svg>
          </button>
        </form>
      </footer>
    </div>
  `;

  // Mobile Backdrop
  const backdrop = document.createElement('div');
  backdrop.className = `chat-backdrop ${_isPanelOpen ? 'active' : ''}`;
  backdrop.id = 'chat-backdrop';

  // Floating Toggle Button (visible on mobile or when closed)
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'chat-floating-fab';
  toggleBtn.id = 'chat-floating-fab';
  toggleBtn.setAttribute('aria-label', 'Open partner chat');
  toggleBtn.innerHTML = `
    <span class="chat-fab-icon">💬</span>
    <span class="chat-fab-label">Chat</span>
    <span class="chat-unread-badge" id="chat-unread-badge" style="display:none">0</span>
  `;

  parentEl.appendChild(backdrop);
  parentEl.appendChild(panel);
  parentEl.appendChild(toggleBtn);
  _containerEl = panel;

  // Render existing message history
  renderMessageHistory();

  // Setup Event Listeners
  setupChatEvents(panel, backdrop, toggleBtn, onToggle);

  return panel;
}

function setupChatEvents(panel, backdrop, toggleBtn, onToggle) {
  const form = panel.querySelector('#romantic-form');
  const input = panel.querySelector('#romantic-input');
  const reactionsBar = panel.querySelector('#romantic-reactions-bar');
  const btnToggleReactions = panel.querySelector('#btn-toggle-reactions');
  const btnClose = panel.querySelector('#btn-close-chat');

  // Handle Share / Invite link
  const handleShareInvite = async () => {
    try {
      const code = await multiplayer.ensureHost();
      const inviteUrl = multiplayer.getInviteUrl();

      const labelEl = panel.querySelector('#btn-share-label');
      if (labelEl) labelEl.textContent = code;

      const statusEl = document.getElementById('chat-partner-status');
      if (statusEl) statusEl.textContent = `Room ${code} · Waiting...`;

      if (navigator.share) {
        navigator.share({
          title: 'Play With Me on Eachother Being Together 💕',
          text: `Join my game! Room Code: ${code}`,
          url: inviteUrl,
        }).catch(() => {});
      } else {
        await navigator.clipboard.writeText(inviteUrl);
        toast(`💞 Invite link copied! Code: ${code} — send it to your partner!`, 'success', 4000);
      }
    } catch (e) {
      console.error('Share error:', e);
      toast('Could not generate invite code. Try again.', 'error');
    }
  };

  panel.querySelector('#btn-chat-share-invite')?.addEventListener('click', handleShareInvite);
  panel.querySelector('#btn-connect-partner-now')?.addEventListener('click', handleShareInvite);

  // Submit message
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input?.value?.trim();
    if (!text) return;

    multiplayer.sendChat(text);
    input.value = '';
    multiplayer.sendTyping(false);

    // If not connected to partner yet, provide an interactive preview response after 1s
    if (!multiplayer.isConnected) {
      setTimeout(() => {
        const autoReplies = [
          "Can't wait to play with you! Tap 'Invite' to share the code with me 💕",
          "Hey handsome / beautiful! Ready for this round? 😉",
          "I dare you to pick the spicy cards tonight! 🔥",
          "Aww sweet! Share the link so we can play live on two phones 💞",
        ];
        const randomReply = autoReplies[Math.floor(Math.random() * autoReplies.length)];
        const simulatedMsg = {
          id: `msg-${Date.now()}-sim`,
          sender: multiplayer.partnerName || 'Partner',
          text: randomReply,
          timestamp: Date.now(),
          isMe: false,
        };
        multiplayer._messages.push(simulatedMsg);
        multiplayer.emit('chat', simulatedMsg);
      }, 1000);
    }
  });

  // Typing event
  input?.addEventListener('input', () => {
    multiplayer.sendTyping(true);
    clearTimeout(_typingTimer);
    _typingTimer = setTimeout(() => {
      multiplayer.sendTyping(false);
    }, 1500);
  });

  // Toggle quick reactions bar
  btnToggleReactions?.addEventListener('click', () => {
    if (reactionsBar) {
      reactionsBar.classList.toggle('visible');
    }
  });

  // Click quick reaction emoji
  panel.querySelectorAll('.reaction-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      const emoji = btn.getAttribute('data-emoji');
      if (emoji) {
        multiplayer.sendReaction(emoji);
        spawnFloatingReaction(emoji);
      }
    });
  });

  // Toggle chat open/close
  const toggleChat = (open) => {
    _isPanelOpen = typeof open === 'boolean' ? open : !_isPanelOpen;
    panel.classList.toggle('open', _isPanelOpen);
    panel.classList.toggle('closed', !_isPanelOpen);
    backdrop.classList.toggle('active', _isPanelOpen && window.innerWidth < 860);

    if (_isPanelOpen) {
      _unreadCount = 0;
      updateUnreadBadge();
      scrollToBottom();
      setTimeout(() => input?.focus(), 200);
    }

    if (onToggle) onToggle(_isPanelOpen);
  };

  toggleBtn?.addEventListener('click', () => toggleChat(true));
  btnClose?.addEventListener('click', () => toggleChat(false));
  backdrop?.addEventListener('click', () => toggleChat(false));

  // Listen to multiplayer network events
  const unsubChat = multiplayer.on('chat', (msg) => {
    appendMessageBubble(msg);
    if (!_isPanelOpen) {
      _unreadCount++;
      updateUnreadBadge();
      showChatNotificationToast(msg);
    }
  });

  const unsubReaction = multiplayer.on('reaction', ({ emoji }) => {
    spawnFloatingReaction(emoji);
  });

  const unsubTyping = multiplayer.on('typing', ({ isTyping }) => {
    const statusEl = document.getElementById('chat-partner-status');
    if (statusEl) {
      if (isTyping) {
        statusEl.innerHTML = `<span class="typing-indicator-text">typing<span class="dot-1">.</span><span class="dot-2">.</span><span class="dot-3">.</span></span>`;
        statusEl.classList.add('typing');
      } else {
        statusEl.textContent = multiplayer.isConnected
          ? (multiplayer.roomCode ? `Online · Room ${multiplayer.roomCode}` : 'Online 💕')
          : 'Playing locally · Tap Invite';
        statusEl.classList.remove('typing');
      }
    }
  });

  const unsubPresence = multiplayer.on('connected', () => {
    const statusEl = document.getElementById('chat-partner-status');
    if (statusEl) statusEl.textContent = multiplayer.roomCode ? `Online · Room ${multiplayer.roomCode}` : 'Online 💕';
    const dot = panel.querySelector('.romantic-status-dot');
    if (dot) dot.className = 'romantic-status-dot online';
    const banner = panel.querySelector('#chat-connect-banner');
    if (banner) banner.style.display = 'none';
    const label = panel.querySelector('#btn-share-label');
    if (label && multiplayer.roomCode) label.textContent = multiplayer.roomCode;
  });

  const unsubDisconnect = multiplayer.on('disconnected', () => {
    const statusEl = document.getElementById('chat-partner-status');
    if (statusEl) statusEl.textContent = 'Disconnected';
    const dot = panel.querySelector('.romantic-status-dot');
    if (dot) dot.className = 'romantic-status-dot offline';
  });

  _cleanupFns.push(unsubChat, unsubReaction, unsubTyping, unsubPresence, unsubDisconnect);
}

function renderMessageHistory() {
  const list = document.getElementById('romantic-message-list');
  if (!list) return;
  list.innerHTML = '';
  multiplayer.messages.forEach((msg) => {
    appendMessageBubble(msg, false);
  });
  scrollToBottom();
}

function appendMessageBubble(msg, scroll = true) {
  const list = document.getElementById('romantic-message-list');
  if (!list) return;

  const bubble = document.createElement('div');
  bubble.className = `romantic-bubble ${msg.isMe ? 'outgoing' : 'incoming'} animate-slide-up`;
  bubble.id = msg.id;

  const timeStr = formatTime(msg.timestamp);

  bubble.innerHTML = /* html */ `
    ${!msg.isMe ? `<div class="bubble-sender">${escHtml(msg.sender)}</div>` : ''}
    <div class="bubble-text">${escHtml(msg.text)}</div>
    <div class="bubble-meta">
      <span class="bubble-time">${timeStr}</span>
      ${msg.isMe ? `<span class="bubble-ticks" title="Delivered">✓✓</span>` : ''}
    </div>
  `;

  list.appendChild(bubble);

  if (scroll) {
    scrollToBottom();
  }
}

function scrollToBottom() {
  const msgs = document.getElementById('romantic-messages');
  if (msgs) {
    requestAnimationFrame(() => {
      msgs.scrollTop = msgs.scrollHeight;
    });
  }
}

function updateUnreadBadge() {
  const badge = document.getElementById('chat-unread-badge');
  if (!badge) return;
  if (_unreadCount > 0) {
    badge.textContent = _unreadCount > 9 ? '9+' : _unreadCount;
    badge.style.display = 'inline-flex';
  } else {
    badge.style.display = 'none';
  }
}

function showChatNotificationToast(msg) {
  const toastEl = document.createElement('div');
  toastEl.className = 'chat-toast-preview animate-slide-down';
  toastEl.innerHTML = `
    <span class="chat-toast-avatar">${escHtml(msg.sender.charAt(0).toUpperCase())}</span>
    <div class="chat-toast-body">
      <strong>${escHtml(msg.sender)}</strong>
      <span>${escHtml(msg.text)}</span>
    </div>
  `;
  document.body.appendChild(toastEl);

  toastEl.addEventListener('click', () => {
    toastEl.remove();
    const panel = document.getElementById('game-chat-panel');
    const backdrop = document.getElementById('chat-backdrop');
    if (panel) {
      _isPanelOpen = true;
      panel.classList.add('open');
      panel.classList.remove('closed');
      backdrop?.classList.add('active');
      _unreadCount = 0;
      updateUnreadBadge();
    }
  });

  setTimeout(() => {
    toastEl.classList.add('fade-out');
    setTimeout(() => toastEl.remove(), 300);
  }, 4000);
}

export function spawnFloatingReaction(emoji) {
  const count = 5;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'floating-reaction-emoji';
    el.textContent = emoji;

    const startX = 20 + Math.random() * 60;
    const duration = 2.2 + Math.random() * 1.0;
    const sway = (Math.random() - 0.5) * 80;
    const delay = i * 0.12;

    el.style.left = `${startX}vw`;
    el.style.bottom = '10vh';
    el.style.animationDuration = `${duration}s`;
    el.style.animationDelay = `${delay}s`;
    el.style.setProperty('--sway', `${sway}px`);

    document.body.appendChild(el);

    setTimeout(() => {
      el.remove();
    }, (duration + delay) * 1000 + 200);
  }
}

export function unmountChatPanel() {
  _cleanupFns.forEach((fn) => fn?.());
  _cleanupFns = [];

  const panel = document.getElementById('game-chat-panel');
  if (panel) panel.remove();

  const backdrop = document.getElementById('chat-backdrop');
  if (backdrop) backdrop.remove();

  const fab = document.getElementById('chat-floating-fab');
  if (fab) fab.remove();

  _containerEl = null;
}

function formatTime(timestamp) {
  const d = new Date(timestamp || Date.now());
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
