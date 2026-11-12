# Eachother Being Together 💕

> A private, romantic game room and keepsake web app crafted exclusively for one couple. Play party games, discover new conversations, save memories, and celebrate milestones — on one device in person or across two devices online.

Deployed at: **[https://eachother-being-together.netlify.app/](https://eachother-being-together.netlify.app/)**

---

## ✨ Features

- 🎲 **7 Couple Games**:
  - **Truth or Dare**: Playful truths and romantic dares with optional 30s/60s timer and tactile buzz.
  - **Never Have I Ever**: Secret simultaneous reveals.
  - **Would You Rather**: Fun dilemma choices with agreement percentages.
  - **Who Is Most Likely**: Point fingers and laugh at cute quirks.
  - **Finish the Sentence**: Open-ended romantic prompts.
  - **This or That**: Rapid-fire couples preference matching.
  - **How Well Do You Know Me?**: 3-option secret guess quiz to test your compatibility.
- 🎚️ **Moods & Intensity**:
  - Wholesome 🌸 · Flirty 💋 · Spicy 🔥 (age-gated)
  - **"Mix it up"** mode: Dynamic escalator that gently transitions intensity from wholesome to flirty to spicy as the rounds progress.
- 🔄 **Skips & Turn Controls**:
  - 3 skips per player per game with remaining counter.
  - Local pass-and-play **Handover Screen** prevents the next player from seeing incoming cards early.
- 💌 **Secret Custom Cards**:
  - Add your own cards without your partner seeing them in advance; stamped with a "💌 from your partner" banner during gameplay.
- 🎡 **Date Night Roulette**:
  - Spinning reels for Activity, Food, and Movie genre with budget filters (free, cheap, treat-yourself), indoor/outdoor toggles, slot locking, and editable custom choices.
- ⏳ **Days Together Counter**:
  - Track relationship milestones (100, 365, 500, 1,000 days) with milestone confetti and next anniversary countdowns.
- 🍯 **Love Notes Jar**:
  - Write sweet digital notes and draw random surprises, with "Open when..." seals for special moments.
- 📷 **Memory Lane**:
  - On-device relationship timeline stored privately in browser IndexedDB (never silently uploaded to the cloud).
- 🏆 **Scoreboard & Streaks**:
  - Trophies for games played, dares completed, and playing streak count.
- 📸 **Recap Card & Awards**:
  - End-of-game summary with "Most Brave 🦁" and "Most Honest 💬" badges and instant downloadable recap PNG canvas.
- 🔒 **Privacy & Safety First**:
  - Optional salted SHA-256 PIN passcode lock.
  - One-tap "Clear my data on this device" emergency wipe.
  - `noindex, nofollow` meta tags.
- 📲 **Progressive Web App (PWA)**:
  - Installable home screen app with service worker offline caching for pass-and-play.

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/eachother-being-together.git
cd eachother-being-together

# 2. Install dependencies
npm install

# 3. (Optional) Set up Supabase for online multiplayer
cp .env.example .env
# Edit .env with your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# 4. Start the dev server
npm run dev
```

Open `http://localhost:5173` in your browser. Local pass-and-play works 100% offline without Supabase!

---

## 🌐 Deploying to Netlify

The repository is pre-configured with `netlify.toml` for single-page app redirects and caching headers.

### Step-by-Step Deployment:
1. Connect your repository to [Netlify](https://app.netlify.com).
2. Set the build settings:
   - **Base directory**: `.` (or leave empty)
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
3. Configure Environment Variables in **Site configuration → Environment variables**:
   - `VITE_SUPABASE_URL`: `https://<your-project-ref>.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `<your-anon-key>`
4. Deploy site!

---

## ✍️ How to Add New Cards

Card packs are stored as clean JSON files inside `cards/<game>/<level>.json`.

### 1. File Structure
```
cards/
├── truth-or-dare/       (wholesome.json, flirty.json, spicy.json)
├── never-have-i-ever/   (wholesome.json, flirty.json, spicy.json)
├── would-you-rather/    (wholesome.json, flirty.json, spicy.json)
├── who-is-most-likely/  (wholesome.json, flirty.json, spicy.json)
├── finish-the-sentence/ (wholesome.json, flirty.json, spicy.json)
├── this-or-that/        (wholesome.json, flirty.json, spicy.json)
└── how-well-do-you-know-me/ (wholesome.json, flirty.json, spicy.json)
```

### 2. Card JSON Format & ID Conventions

Each card object requires a unique `id` following the format `<game-abbr>-<level-abbr>-<number>`:
- **Game abbreviations**: `tod`, `nhie`, `wyr`, `wiml`, `fts`, `tot`, `kme`
- **Level abbreviations**: `w` (Wholesome), `f` (Flirty), `s` (Spicy)

#### Standard Prompt Card (Truth or Dare, NHIE, Finish the Sentence):
```json
{
  "id": "tod-w-076",
  "type": "truth",
  "level": "wholesome",
  "text": "What is your happiest childhood memory that you still smile about?"
}
```

#### Binary / Choice Card (Would You Rather):
```json
{
  "id": "wyr-f-051",
  "type": "wyr",
  "level": "flirty",
  "optionA": "Wake up to breakfast in bed together every Sunday",
  "optionB": "Fall asleep watching the stars wrapped in one warm blanket"
}
```

#### Dual Match Card (This or That):
```json
{
  "id": "tot-w-031",
  "type": "this-or-that",
  "level": "wholesome",
  "optionA": "Morning Coffee",
  "optionB": "Midnight Tea"
}
```

#### Multiple Choice Quiz Card (How Well Do You Know Me?):
```json
{
  "id": "kme-w-016",
  "type": "how-well-do-you-know-me",
  "level": "wholesome",
  "question": "What is my absolute go-to comfort meal when I have had a tiring day?",
  "options": [
    "Warm creamy pasta",
    "Spicy noodles or ramen",
    "Crispy cheesy pizza"
  ]
}
```

### 3. Validate Cards
After editing or adding any cards, run the card validator:
```bash
npm run validate-cards
```
It ensures all IDs are strictly formatted and unique, required fields exist, and no empty prompts exist.

> ⚠️ Always check [CONTENT_GUIDELINES.md](CONTENT_GUIDELINES.md) before writing cards: spicy content must remain suggestive and consensual, never explicit, non-consensual, or degrading.

---

## 🔒 Security & Supabase Row Level Security (RLS)

- **Anonymous Authentication**: Online multiplayer uses Supabase Anonymous Auth; no email, password, or third-party login required.
- **Strict Row Level Security (RLS)**:
  - Rooms are isolated strictly to `player1_id` and `player2_id`.
  - Secret answers are blocked from direct queries (`USING (false)` policy) and are revealed server-side via the stored SQL procedure `get_answers_if_both_ready()` only after both partners submit.
  - Automatic expiration purges inactive rooms after 24 hours.

---

## 🛠️ Developer Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite development server |
| `npm run build` | Produce optimized production bundle in `/dist` |
| `npm run preview` | Locally preview the production build |
| `npm run lint` | Run ESLint checks across JavaScript files |
| `npm run format` | Prettier check and format |
| `npm run validate-cards` | Run automated validation on all 21 card decks |

---

## 📄 License
Private project for couples. Distributed under the MIT License.
