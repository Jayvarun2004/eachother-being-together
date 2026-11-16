/**
 * src/lib/multiplayer.js
 * Persistent real-time multiplayer & chat manager.
 * Connects two players across phones and networks using WebRTC (PeerJS)
 * or Supabase Broadcast channels, preserving connection across views.
 */

import { state } from './state.js';
import { sounds } from './sound.js';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
  { urls: 'stun:stun.cloudflare.com:3478' },
  { urls: 'stun:global.stun.twilio.com:3478' },
  { urls: 'stun:stun.services.mozilla.com' },
];

class MultiplayerManager {
  constructor() {
    this._peer = null;
    this._conn = null;
    this._sbChannel = null;
    this._mode = null; // 'peer' | 'supabase'
    this._role = null; // 'host' | 'guest'
    this._roomCode = null;
    this._myName = '';
    this._partnerName = '';
    this._connected = false;
    this._listeners = new Map();
    this._messages = [];
    this._typingTimeout = null;
    this._isPartnerTyping = false;
  }

  // ---- Event emitter ----
  on(event, handler) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event).add(handler);
    return () => this.off(event, handler);
  }

  off(event, handler) {
    this._listeners.get(event)?.delete(handler);
  }

  emit(event, data) {
    const handlers = this._listeners.get(event);
    if (handlers) {
      handlers.forEach((fn) => {
        try {
          fn(data);
        } catch (e) {
          console.error(`Error in multiplayer event handler for "${event}":`, e);
        }
      });
    }
  }

  // ---- Getters ----
  get isConnected() {
    return this._connected;
  }

  get role() {
    return this._role;
  }

  get isHost() {
    return this._role === 'host';
  }

  get roomCode() {
    return this._roomCode;
  }

  get myName() {
    return this._myName || (this.isHost ? (state.get('player1') || 'You') : (state.get('player2') || 'You'));
  }

  get partnerName() {
    return this._partnerName || (this.isHost ? (state.get('player2') || 'Partner') : (state.get('player1') || 'Partner'));
  }

  get messages() {
    return [...this._messages];
  }

  get isPartnerTyping() {
    return this._isPartnerTyping;
  }

  getInviteUrl() {
    if (!this._roomCode) return window.location.href;
    const game = state.get('game') || 'truth-or-dare';
    return `${window.location.origin}${window.location.pathname}?room=${this._roomCode}#game/${game}`;
  }

  async ensureHost() {
    if (this._connected && this._roomCode) return this._roomCode;
    if (this._role === 'host' && this._roomCode) return this._roomCode;
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const code = Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    await this.initHost(code, {
      game: state.get('game') || 'truth-or-dare',
      level: state.get('level') || 'wholesome',
      myName: state.get('player1') || 'Player 1',
    });
    return code;
  }

  // ---- Initialization (PeerJS) ----
  async _loadPeerJs() {
    if (window.Peer) return window.Peer;
    return new Promise((resolve, reject) => {
      const existing = document.querySelector('script[src*="peerjs"]');
      if (existing) {
        if (window.Peer) return resolve(window.Peer);
        existing.addEventListener('load', () => resolve(window.Peer));
        return;
      }
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js';
      s.onload = () => resolve(window.Peer);
      s.onerror = () => reject(new Error('Failed to load PeerJS from CDN'));
      document.head.appendChild(s);
    });
  }

  async initHost(code, { game, level, myName }) {
    this.disconnect();
    this._role = 'host';
    this._roomCode = code.toUpperCase();
    this._myName = myName || state.get('player1') || 'Player 1';
    this._mode = 'peer';

    await this._loadPeerJs();

    return new Promise((resolve, reject) => {
      const peerId = `ebt-${this._roomCode}`;
      this._peer = new window.Peer(peerId, {
        host: '0.peerjs.com',
        port: 443,
        path: '/',
        secure: true,
        config: {
          iceServers: ICE_SERVERS,
        },
      });

      this._peer.on('open', (id) => {
        this.emit('host_ready', { code: this._roomCode, peerId: id });
        resolve(this._roomCode);
      });

      this._peer.on('connection', (conn) => {
        this._setupConnection(conn, () => {
          // Send handshake back to guest
          this.send('handshake_ack', {
            hostName: this._myName,
            game: game || state.get('game'),
            level: level || state.get('level'),
          });
        });
      });

      this._peer.on('error', (err) => {
        console.error('Peer host error:', err);
        this.emit('error', err);
        reject(err);
      });
    });
  }

  async initJoin(code, { myName }) {
    this.disconnect();
    this._role = 'guest';
    this._roomCode = code.toUpperCase();
    this._myName = myName || state.get('player2') || 'Player 2';
    this._mode = 'peer';

    await this._loadPeerJs();

    return new Promise((resolve, reject) => {
      this._peer = new window.Peer(undefined, {
        host: '0.peerjs.com',
        port: 443,
        path: '/',
        secure: true,
        config: {
          iceServers: ICE_SERVERS,
        },
      });

      this._peer.on('open', () => {
        const targetId = `ebt-${this._roomCode}`;
        const conn = this._peer.connect(targetId, {
          reliable: true,
          metadata: { name: this._myName },
        });

        conn.on('open', () => {
          this._setupConnection(conn);
          // Send join handshake
          this.send('handshake', { guestName: this._myName });
          resolve(this._roomCode);
        });

        conn.on('error', (err) => {
          console.error('Connection error:', err);
          this.emit('error', err);
          reject(err);
        });
      });

      this._peer.on('error', (err) => {
        console.error('Peer join error:', err);
        this.emit('error', err);
        reject(err);
      });
    });
  }

  _setupConnection(conn, onOpenCallback) {
    this._conn = conn;

    conn.on('open', () => {
      this._connected = true;
      state.set('mode', 'online');
      this.emit('connected', { partnerName: this.partnerName });
      if (onOpenCallback) onOpenCallback();
    });

    conn.on('data', (packet) => {
      this._handlePacket(packet);
    });

    conn.on('close', () => {
      this._connected = false;
      this.emit('disconnected', { partnerName: this.partnerName });
    });

    conn.on('error', (err) => {
      console.error('Multiplayer channel error:', err);
      this.emit('error', err);
    });
  }

  // ---- Packet Routing ----
  send(type, payload = {}) {
    const packet = {
      type,
      payload,
      sender: this.myName,
      timestamp: Date.now(),
    };

    if (this._conn && this._conn.open) {
      try {
        this._conn.send(packet);
      } catch (e) {
        console.error('Error sending packet via PeerJS:', e);
      }
    } else if (this._sbChannel) {
      try {
        this._sbChannel.send({
          type: 'broadcast',
          event: type,
          payload: packet,
        });
      } catch (e) {
        console.error('Error sending packet via Supabase:', e);
      }
    }
    return packet;
  }

  _handlePacket(packet) {
    if (!packet || typeof packet !== 'object') return;
    const { type, payload, sender, timestamp } = packet;

    switch (type) {
      case 'handshake':
        if (payload.guestName) {
          this._partnerName = payload.guestName;
          state.set('player2', payload.guestName);
        }
        this.emit('partner_joined', { partnerName: this._partnerName });
        break;

      case 'handshake_ack':
        if (payload.hostName) {
          this._partnerName = payload.hostName;
          state.set('player1', payload.hostName);
        }
        if (payload.game) state.set('game', payload.game);
        if (payload.level) state.set('level', payload.level);
        this.emit('partner_joined', { partnerName: this._partnerName });
        break;

      case 'chat': {
        const msg = {
          id: payload.id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          sender: sender || this.partnerName,
          text: payload.text,
          timestamp: timestamp || Date.now(),
          isMe: false,
        };
        this._messages.push(msg);
        this._isPartnerTyping = false;
        sounds.chatReceive();
        this.emit('chat', msg);
        break;
      }

      case 'reaction':
        this.emit('reaction', {
          emoji: payload.emoji,
          sender: sender || this.partnerName,
        });
        break;

      case 'typing':
        this._isPartnerTyping = !!payload.isTyping;
        this.emit('typing', {
          isTyping: this._isPartnerTyping,
          sender: sender || this.partnerName,
        });
        break;

      // Gameplay sync events
      case 'sync_card':
        this.emit('sync_card', payload);
        break;

      case 'sync_flip':
        this.emit('sync_flip', payload);
        break;

      case 'sync_done':
        this.emit('sync_done', payload);
        break;

      case 'sync_skip':
        this.emit('sync_skip', payload);
        break;

      case 'sync_answer':
        this.emit('sync_answer', payload);
        break;

      case 'sync_timer':
        this.emit('sync_timer', payload);
        break;

      default:
        this.emit(type, payload);
        break;
    }
  }

  // ---- Chat API ----
  sendChat(text) {
    const trimmed = (text || '').trim();
    if (!trimmed) return null;

    const msg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      sender: this.myName,
      text: trimmed,
      timestamp: Date.now(),
      isMe: true,
    };

    this._messages.push(msg);
    this.send('chat', { id: msg.id, text: trimmed });
    sounds.chatSend();
    this.emit('chat', msg);
    return msg;
  }

  sendReaction(emoji) {
    if (!emoji) return;
    this.send('reaction', { emoji });
    this.emit('reaction', { emoji, sender: this.myName });
  }

  sendTyping(isTyping) {
    this.send('typing', { isTyping: !!isTyping });
  }

  // ---- Gameplay Sync API ----
  syncCard(card, level, round) {
    this.send('sync_card', { card, level, round });
  }

  syncFlip() {
    this.send('sync_flip', { flipped: true });
  }

  syncDone(scores, turn) {
    this.send('sync_done', { scores, turn });
  }

  syncSkip(skipsLeft, turn) {
    this.send('sync_skip', { skipsLeft, turn });
  }

  syncAnswer(cardId, answer, playerKey) {
    this.send('sync_answer', { cardId, answer, playerKey });
  }

  syncTimer(seconds) {
    this.send('sync_timer', { seconds });
  }

  // ---- Cleanup ----
  disconnect() {
    if (this._conn) {
      try {
        this._conn.close();
      } catch {}
      this._conn = null;
    }
    if (this._peer) {
      try {
        this._peer.destroy();
      } catch {}
      this._peer = null;
    }
    if (this._sbChannel) {
      try {
        this._sbChannel.unsubscribe();
      } catch {}
      this._sbChannel = null;
    }
    this._connected = false;
    this._role = null;
    this._roomCode = null;
    this._isPartnerTyping = false;
  }
}

export const multiplayer = new MultiplayerManager();
