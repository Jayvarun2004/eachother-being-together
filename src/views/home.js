/**
 * src/views/home.js
 * Clean, Simple & Elegant Home View
 * Pure Apple aesthetic: Spacious, uncluttered, light-pink brand accents,
 * easy game selection, and intimate couple keepsakes.
 */

import { state } from '../lib/state.js';
import { navigate } from '../lib/router.js';
import { getVault } from '../lib/vault.js';
import { toast } from '../lib/toast.js';

export function renderHome() {
  const app = document.getElementById('app');
  const level = state.get('level') ?? 'wholesome';
  const p1 = state.get('player1') ?? 'Player 1';
  const p2 = state.get('player2') ?? 'Player 2';
  const vaultCount = getVault().length;
  const selectedGame = state.get('game') ?? 'truth-or-dare';

  const levelLabels = {
    wholesome: '🌸 Wholesome',
    flirty: '💋 Flirty',
    spicy: '🔥 Spicy',
    mix: '⚡ Mix It Up',
  };

  app.innerHTML = /* html */ `
    <div class="view active animate-fade-in" id="view-home">
      <!-- Floating Romantic Hearts & Cute Elements Background -->
      <div class="floating-hearts-bg" aria-hidden="true">
        <span>💕</span>
        <span>💖</span>
        <span>🌸</span>
        <span>✨</span>
        <span>💗</span>
        <span>🌹</span>
        <span>💫</span>
        <span>💝</span>
        <span>⭐</span>
        <span>💓</span>
      </div>

      <!-- Minimalist Apple Top Bar -->
      <header class="app-header">
        <a href="#home" class="header-logo" aria-label="Eachother Being Together">
          <span class="header-logo-heart">💕</span>
          <span class="header-logo-text">Eachother</span>
        </a>
        <div class="header-actions">
          <button class="btn-icon" id="btn-vault" aria-label="Love Vault" title="Love Vault">
            💌${vaultCount > 0 ? `<span class="vault-count-badge">${vaultCount}</span>` : ''}
          </button>
          <button class="btn-icon" id="btn-settings" aria-label="Settings" title="Settings & Privacy">
            ⚙️
          </button>
        </div>
      </header>

      <!-- Couple Greeting Bar -->
      <div class="couple-capsule" style="margin-bottom: 1.25rem;">
        <div style="display:flex; align-items:center; gap:0.5rem; font-weight:600; font-size:var(--text-sm);">
          <span style="font-size:1.15rem;">💕</span>
          <span id="display-names" style="color:var(--text-primary);">${escHtml(p1)} & ${escHtml(p2)}</span>
        </div>
        <button class="couple-edit-btn" id="btn-toggle-edit-names" style="color:#ffb3c6;">
          ✏️ Edit Names
        </button>
      </div>

      <!-- Names Editor Drawer (Hidden by default) -->
      <div class="names-drawer" id="names-drawer" style="margin-bottom: 1.25rem;">
        <div style="display:flex; gap:0.5rem;">
          <input id="inp-p1" type="text" placeholder="Partner 1" value="${escHtml(p1)}" maxlength="20" style="flex:1; padding:0.6rem; border-radius:var(--radius-sm); border:1px solid var(--border); background:var(--bg-card); color:var(--text-primary);" />
          <input id="inp-p2" type="text" placeholder="Partner 2" value="${escHtml(p2)}" maxlength="20" style="flex:1; padding:0.6rem; border-radius:var(--radius-sm); border:1px solid var(--border); background:var(--bg-card); color:var(--text-primary);" />
        </div>
      </div>

      <!-- Intensity (Level) Picker -->
      <div style="margin-bottom: 1.25rem;">
        <div style="display:flex; gap:0.35rem; background:rgba(120, 120, 128, 0.16); padding:3px; border-radius:9999px; overflow-x:auto;">
          ${['wholesome', 'flirty', 'spicy', 'mix']
            .map(
              (lvl) => `
            <button class="segmented-pill level-pill ${level === lvl ? 'active' : ''}" data-level="${lvl}" style="flex:1; padding:0.45rem 0.65rem; font-size:0.8rem; border-radius:9999px;">
              ${levelLabels[lvl]}
            </button>
          `
            )
            .join('')}
        </div>
      </div>

      <!-- Our Daily Question Card -->
      <div class="daily-question-card animate-fade-in">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.45rem;">
          <span style="font-size:0.7rem; font-weight:700; color:#ffb3c6; letter-spacing:0.06em; text-transform:uppercase;">
            ✦ TODAY'S QUESTION FOR US
          </span>
          <span style="font-size:0.9rem;">💌</span>
        </div>
        <p style="font-size:0.92rem; font-weight:600; color:var(--text-primary); margin:0 0 0.65rem 0; line-height:1.45;">
          "${getDailyQuestion()}"
        </p>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.7rem; color:var(--text-muted);">New question every 24 hours</span>
          <button class="btn btn-ghost btn-sm" id="btn-daily-answered" style="font-size:0.72rem; padding:0.25rem 0.65rem; border-radius:9999px; color:#ffb3c6; border-color:rgba(255,179,198,0.35);">
            💖 We Answered Today
          </button>
        </div>
      </div>

      <!-- Clean Couple Games List -->
      <div style="display:flex; flex-direction:column; gap:0.75rem; margin-bottom:1.5rem;" role="list">
        ${renderCleanGameCard({
          game: 'truth-or-dare',
          emoji: '🎲',
          title: 'Truth or Dare',
          tag: 'Romantic',
          desc: 'Deep romantic truths, vulnerability & sweet dares',
          isSelected: selectedGame === 'truth-or-dare',
        })}

        ${renderCleanGameCard({
          game: 'soul-sync',
          emoji: '✨',
          title: 'Soul Sync',
          tag: 'Deep Connection',
          desc: 'Thoughtful questions to bring your hearts closer',
          isSelected: selectedGame === 'soul-sync',
        })}

        ${renderCleanGameCard({
          game: 'how-well-do-you-know-me',
          emoji: '🔮',
          title: 'How Well Do You Know Me?',
          tag: 'Quiz',
          desc: 'Secretly answer questions and guess each other\'s choices',
          isSelected: selectedGame === 'how-well-do-you-know-me',
        })}

        ${renderCleanGameCard({
          game: 'never-have-i-ever',
          emoji: '🙋',
          title: 'Never Have I Ever',
          tag: 'Stories',
          desc: 'Discover sweet secrets and untold memories together',
          isSelected: selectedGame === 'never-have-i-ever',
        })}

        ${renderCleanGameCard({
          game: 'would-you-rather',
          emoji: '🤔',
          title: 'Would You Rather',
          tag: 'Dilemmas',
          desc: 'Playful, romantic, and cozy scenarios for two',
          isSelected: selectedGame === 'would-you-rather',
        })}
      </div>

      <!-- Couple Keepsakes (Simple & Uncluttered Pills) -->
      <div style="margin-bottom: 1.5rem;">
        <div style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--text-muted); margin-bottom:0.6rem; padding-left:0.25rem;">
          Couple Moments & Tools
        </div>
        <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:0.5rem;">
          <button class="btn btn-ghost more-action-btn" data-nav="date-roulette" style="padding:0.65rem 0.4rem; font-size:0.75rem; display:flex; flex-direction:column; align-items:center; gap:0.25rem; min-height:64px; border-radius:18px;">
            <span style="font-size:1.25rem;">🎡</span>
            <span>Roulette</span>
          </button>
          <button class="btn btn-ghost more-action-btn" data-nav="days-together" style="padding:0.65rem 0.4rem; font-size:0.75rem; display:flex; flex-direction:column; align-items:center; gap:0.25rem; min-height:64px; border-radius:18px;">
            <span style="font-size:1.25rem;">📅</span>
            <span>Days</span>
          </button>
          <button class="btn btn-ghost more-action-btn" data-nav="love-notes" style="padding:0.65rem 0.4rem; font-size:0.75rem; display:flex; flex-direction:column; align-items:center; gap:0.25rem; min-height:64px; border-radius:18px;">
            <span style="font-size:1.25rem;">🍯</span>
            <span>Notes</span>
          </button>
          <button class="btn btn-ghost more-action-btn" data-nav="memory-lane" style="padding:0.65rem 0.4rem; font-size:0.75rem; display:flex; flex-direction:column; align-items:center; gap:0.25rem; min-height:64px; border-radius:18px;">
            <span style="font-size:1.25rem;">📸</span>
            <span>Memories</span>
          </button>
        </div>
      </div>

      <!-- Two Clear Primary Play Actions -->
      <div style="display:flex; gap:0.65rem; margin-bottom:1.5rem;">
        <button class="btn btn-primary" id="btn-play-local" style="flex:1;">
          🎮 Pass & Play (1 Phone)
        </button>
        <button class="btn btn-secondary" id="btn-play-online" style="flex:1;">
          📡 Play Online (2 Phones)
        </button>
      </div>

      <footer class="app-footer" style="padding:1.25rem 0; color:var(--text-muted); font-size:0.8rem; text-align:center;">
        Made with love 💕 for just the two of us
      </footer>
    </div>
  `;

  // --- Wire Interactivity ---

  document.getElementById('btn-vault')?.addEventListener('click', () => navigate('vault'));
  document.getElementById('btn-settings')?.addEventListener('click', () => navigate('settings'));

  // Edit Names Drawer Toggle
  document.getElementById('btn-toggle-edit-names')?.addEventListener('click', () => {
    const drawer = document.getElementById('names-drawer');
    drawer?.classList.toggle('open');
  });

  // Save Names
  document.getElementById('inp-p1')?.addEventListener('input', (e) => {
    const val = e.target.value.trim() || 'Player 1';
    state.set('player1', val);
    updateGreeting();
  });
  document.getElementById('inp-p2')?.addEventListener('input', (e) => {
    const val = e.target.value.trim() || 'Player 2';
    state.set('player2', val);
    updateGreeting();
  });

  function updateGreeting() {
    const el = document.getElementById('display-names');
    if (el) {
      el.textContent = `${state.get('player1') || 'Player 1'} & ${state.get('player2') || 'Player 2'}`;
    }
  }

  // Level Selector
  document.querySelectorAll('.level-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.level-pill').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.set('level', btn.dataset.level);
    });
  });

  // Game Card Selection & Direct Launch
  document.querySelectorAll('.clean-game-card').forEach((card) => {
    card.addEventListener('click', () => {
      const g = card.dataset.game;
      state.set('game', g);
      document.querySelectorAll('.clean-game-card').forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');
      navigate('setup');
    });
  });

  // Tool Pills
  document.querySelectorAll('.more-action-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      navigate(btn.dataset.nav);
    });
  });

  // Pass & Play Local
  document.getElementById('btn-play-local')?.addEventListener('click', () => {
    const g = state.get('game') || 'truth-or-dare';
    state.set('game', g);
    state.set('mode', 'local');
    navigate('setup');
  });

  // Play Online
  document.getElementById('btn-play-online')?.addEventListener('click', () => {
    const g = state.get('game') || 'truth-or-dare';
    state.set('game', g);
    state.set('mode', 'online');
    navigate('room');
  });

  // Daily Question Discussed
  document.getElementById('btn-daily-answered')?.addEventListener('click', () => {
    const btn = document.getElementById('btn-daily-answered');
    if (btn) {
      btn.textContent = '✨ Answered! 💕';
      btn.style.background = 'rgba(255, 179, 198, 0.2)';
    }
    toast('💖 Beautiful! Keep nurturing that bond.', 'success', 2000);
  });
}

const DAILY_QUESTIONS = [
  'What is one small thing I did this week that made you feel deeply appreciated?',
  'When was the last time you looked at me and felt a sudden rush of love?',
  'What is your all-time favorite quiet memory of us together?',
  'What is a dream or secret goal of yours that you haven\'t told anyone else, but feel safe telling me?',
  'What is one little habit of mine that never fails to make your heart smile?',
  'What is something thoughtful we can do together this upcoming weekend?',
  'If you could whisper one gentle reassurance to my heart right now, what would it be?',
  'What was the exact moment in our journey when you felt: "Yes, this person is my home"?',
  'What is your favorite picture of us, and what makes that specific moment so special?',
  'What is one promise you make to me in your heart every time you look at me?',
  'What is a silly or funny inside joke of ours that still makes you laugh?',
  'What is one way our relationship has gently helped you grow into a happier person?',
  'What is an affectionate touch of mine that gives you butterflies every single time?',
  'If you had 24 hours alone with me with zero phones or interruptions, how would our day look?',
  'What is something you admire about my heart or personality that you rarely say aloud?',
  'What is one tradition or small everyday habit you hope we still share when we are 80?',
  'What is a song, place, or scent that instantly brings warm thoughts of me?',
  'What made you realize that I am different from anyone else who has ever been in your life?',
  'What is your favorite compliment I ever gave you that truly stuck in your heart?',
  'What is something about our relationship that feels different and more sacred than anything before?',
  'How do you feel when we embrace tightly after a tiring day?',
  'What is one question about my past or childhood that you still want to ask me?',
  'What is your favorite memory of us laughing together until our stomachs hurt?',
  'If our love story was a book, what would be the title of our current chapter?',
  'What is a gentle touch or gesture from me that can instantly melt away your stress?',
  'What is a small everyday ritual of ours (morning coffee, goodnight hugs) that you cherish most?',
  'What is one dream or destination you cannot imagine experiencing without having me by your side?',
  'What is a compliment you have always wanted to give me but felt too shy to say?',
  'What is the kindest thing I have ever whispered to you that you still hold close?',
  'Look into my eyes for 10 seconds right now and tell me: what do you love most about us?',
  'What are you most grateful for about our bond today?',
];

function getDailyQuestion() {
  const dayIndex = Math.floor(Date.now() / 86400000) % DAILY_QUESTIONS.length;
  return DAILY_QUESTIONS[dayIndex];
}

function renderCleanGameCard({ game, emoji, title, tag, desc, isSelected }) {
  return /* html */ `
    <div class="clean-game-card ${isSelected ? 'selected' : ''}" data-game="${game}" style="
      background: var(--bg-card);
      border: 1.5px solid ${isSelected ? 'var(--color-rose)' : 'var(--border)'};
      border-radius: 20px;
      padding: 0.95rem 1.15rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.9rem;
      transition: all var(--transition-base);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      box-shadow: ${isSelected ? '0 6px 20px rgba(255, 45, 85, 0.25)' : 'var(--shadow)'};
    ">
      <div style="font-size: 2.1rem; line-height: 1; flex-shrink: 0;">${emoji}</div>
      <div style="flex: 1; min-width: 0;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 0.2rem;">
          <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary); margin: 0; letter-spacing: -0.015em;">
            ${title}
          </h3>
          <span style="font-size: 0.68rem; font-weight: 600; color: #ffb3c6; background: rgba(255, 179, 198, 0.12); padding: 0.15rem 0.5rem; border-radius: 9999px;">
            ${tag}
          </span>
        </div>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0; line-height: 1.35;">
          ${desc}
        </p>
      </div>
      <div style="color: var(--text-muted); font-size: 1rem; flex-shrink: 0;">→</div>
    </div>
  `;
}

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
