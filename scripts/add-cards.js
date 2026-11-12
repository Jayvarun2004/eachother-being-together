/**
 * scripts/add-cards.js
 * Adds 25+ new cards per level to existing games and creates cards for new games.
 * Run: node scripts/add-cards.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CARDS_DIR = path.resolve(__dirname, '../cards');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function loadCards(game, level) {
  const p = path.join(CARDS_DIR, game, `${level}.json`);
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function saveCards(game, level, cards) {
  const dir = path.join(CARDS_DIR, game);
  ensureDir(dir);
  const p = path.join(dir, `${level}.json`);
  fs.writeFileSync(p, JSON.stringify(cards, null, 2) + '\n', 'utf8');
  console.log(`Saved ${cards.length} cards to ${game}/${level}.json`);
}

// ==========================================
// 1. TRUTH OR DARE (Wholesome: +25, Flirty: +25, Spicy: +25)
// ==========================================
const todWholesomeNew = [
  { type: 'truth', text: "What's the silliest nickname you've ever had?", tags: ['silly'] },
  { type: 'dare', text: 'Do your best, most dramatic impression of me right now.', tags: ['funny'] },
  { type: 'truth', text: "What's one creative hobby you'd love us to try learning together?", tags: ['future'] },
  { type: 'dare', text: 'Send a cute text to one of your closest friends telling them we are the cutest couple.', tags: ['sweet'] },
  { type: 'truth', text: "What's the most embarrassing pop song you secretly know every word to?", tags: ['music'] },
  { type: 'dare', text: 'Serenade me with 15 seconds of your favorite song using full concert passion.', tags: ['music', 'funny'] },
  { type: 'truth', text: "What's something on your bucket list you've never told anyone else?", tags: ['deep'] },
  { type: 'dare', text: 'Show me the oldest photo of you currently stored on your camera roll.', tags: ['memory'] },
  { type: 'truth', text: 'Which animal best captures my personality and quirks?', tags: ['playful'] },
  { type: 'dare', text: 'Describe me using only gourmet food adjectives for the next 30 seconds.', tags: ['funny'] },
  { type: 'truth', text: "What's a tiny everyday thing I do that reliably brightens your day?", tags: ['sweet'] },
  { type: 'dare', text: 'Give me an enthusiastic standing ovation as if I just won an Oscar.', tags: ['funny'] },
  { type: 'truth', text: "If we could travel anywhere together next weekend, where would we fly?", tags: ['travel'] },
  { type: 'dare', text: 'Spell out my full name in the air using only your nose.', tags: ['silly'] },
  { type: 'truth', text: "What's the funniest misunderstanding we've ever had between us?", tags: ['memory'] },
  { type: 'dare', text: 'Teach me one unique skill or trick you know in under 60 seconds.', tags: ['skill'] },
  { type: 'truth', text: "What's your single favorite memory of us from the past month?", tags: ['memory'] },
  { type: 'dare', text: 'Perform a dramatic Shakespearean reading of the last text message you sent me.', tags: ['acting'] },
  { type: 'truth', text: "If we adopted a golden retriever tomorrow, what would you name it?", tags: ['pets'] },
  { type: 'dare', text: 'Let me style your hair into the most avant-garde look possible.', tags: ['hair'] },
  { type: 'truth', text: "What dish do you think we would cook best together from scratch?", tags: ['food'] },
  { type: 'dare', text: 'Walk across the room like a high-fashion runway model for 20 seconds.', tags: ['modeling'] },
  { type: 'truth', text: "What's the most thoughtful surprise someone has ever given you?", tags: ['gratitude'] },
  { type: 'dare', text: 'Invent a secret couple handshake with 4 distinct moves right now.', tags: ['bonding'] },
  { type: 'truth', text: 'If our love story had a title, what book or movie title would it be?', tags: ['romantic'] },
];

const todFlirtyNew = [
  { type: 'truth', text: "What is something I wear that makes it impossible for you to focus?", tags: ['attraction'] },
  { type: 'dare', text: 'Look into my eyes for 60 seconds straight without speaking or looking away.', tags: ['intimacy'] },
  { type: 'truth', text: 'Describe what your dream surprise date with me would look like from sunrise to night.', tags: ['date'] },
  { type: 'dare', text: 'Whisper into my ear the sweetest romantic thought you had about me this week.', tags: ['whisper'] },
  { type: 'truth', text: "What's a flirty romantic gesture you've daydreamed about trying with me?", tags: ['fantasy'] },
  { type: 'dare', text: 'Trace a slow heart shape on my arm with your fingertip.', tags: ['touch'] },
  { type: 'truth', text: 'What was running through your mind the very first time our hands brushed together?', tags: ['memory'] },
  { type: 'dare', text: 'Slow dance with me in place for 45 seconds, even without any music playing.', tags: ['dance'] },
  { type: 'truth', text: "What is your favorite physical feature of mine when I'm smiling?", tags: ['compliment'] },
  { type: 'dare', text: 'Give me 5 distinct compliments about my soul, mind, and style in under 30 seconds.', tags: ['words'] },
  { type: 'truth', text: "What is an adorable habit of mine that I probably don't know I have?", tags: ['sweet'] },
  { type: 'dare', text: 'Re-enact our first kiss with the exact same excitement and nervousness.', tags: ['kiss'] },
  { type: 'truth', text: 'If I were a melody or song, what would I sound like to you?', tags: ['music'] },
  { type: 'dare', text: 'Hold both of my hands and tell me what you feel when you look at me right now.', tags: ['vulnerability'] },
  { type: 'truth', text: "What's a moment when you felt an overwhelming wave of romantic butterflies for me?", tags: ['butterflies'] },
  { type: 'dare', text: 'Write your initials and mine inside a heart on a piece of paper and hand it to me.', tags: ['keepsake'] },
  { type: 'truth', text: "What's your favorite time of day to be wrapped in a blanket with me?", tags: ['cozy'] },
  { type: 'dare', text: 'Give me a tender hug that lasts for a full unhurried 30 seconds.', tags: ['hug'] },
  { type: 'truth', text: "What's something romantic you've always wanted to experience under the stars?", tags: ['dreams'] },
  { type: 'dare', text: 'Describe me in 5 romantic words and explain why you chose each one.', tags: ['words'] },
  { type: 'truth', text: 'What is the most attractive quality about my mind and conversation?', tags: ['intellect'] },
  { type: 'dare', text: 'Give me a gentle kiss on each eyelid and then on my cheek.', tags: ['tender'] },
  { type: 'truth', text: "When did you first realize our connection was truly different from anyone else?", tags: ['milestone'] },
  { type: 'dare', text: 'Write a two-line romantic poem about my smile right now on your phone.', tags: ['poetry'] },
  { type: 'truth', text: "What's your favorite photo of the two of us and why does it touch you?", tags: ['photo'] },
];

const todSpicyNew = [
  { type: 'truth', text: "What's a secret thought about me that made your heart race recently?", tags: ['heat'] },
  { type: 'dare', text: 'Whisper in my ear the exact romantic thing you want to do once this game ends.', tags: ['whisper'] },
  { type: 'truth', text: "What was the most electrifying moment of physical tension between us?", tags: ['tension'] },
  { type: 'dare', text: 'Trace a slow line from my jawline down to my collarbone with your fingertip.', tags: ['touch'] },
  { type: 'truth', text: "What's a private romantic fantasy location where you'd love for us to be alone?", tags: ['fantasy'] },
  { type: 'dare', text: 'Give me a slow, passionate kiss that lasts at least 15 uninterrupted seconds.', tags: ['kiss'] },
  { type: 'truth', text: "What's something I do naturally that drives you wild without me realizing it?", tags: ['allure'] },
  { type: 'dare', text: 'Unbutton or adjust one item of your clothing while keeping unwavering eye contact.', tags: ['tease'] },
  { type: 'truth', text: "What's the most thrilling thing about the way our bodies fit together?", tags: ['closeness'] },
  { type: 'dare', text: 'Give me a relaxing 60-second neck and shoulder massage with your warm hands.', tags: ['massage'] },
  { type: 'truth', text: "When was the last time you saw me and felt an immediate surge of desire?", tags: ['desire'] },
  { type: 'dare', text: 'Kiss 3 different spots on my neck, each slower and softer than the last.', tags: ['kisses'] },
  { type: 'truth', text: "What is your favorite memory of us being completely alone behind closed doors?", tags: ['memory'] },
  { type: 'dare', text: 'Bite your lower lip and tell me the one thing you crave most from me tonight.', tags: ['tease'] },
  { type: 'truth', text: "What is an outfit or style of mine that you find irresistibly magnetic?", tags: ['outfit'] },
  { type: 'dare', text: 'Trace the outline of my lips gently with your thumb while looking into my eyes.', tags: ['intimacy'] },
  { type: 'truth', text: "What's a private adventure you want to try together where nobody can interrupt us?", tags: ['adventure'] },
  { type: 'dare', text: 'Describe in vivid sensual detail how you would spend 24 uninterrupted hours with me.', tags: ['story'] },
  { type: 'truth', text: "What is your favorite physical touch of mine when we are settling down in bed?", tags: ['bedtime'] },
  { type: 'dare', text: 'Lean in until our lips are half an inch apart for 10 seconds before finally kissing me.', tags: ['tension'] },
  { type: 'truth', text: "What's a spicy compliment you've wanted to give me but were too shy to say?", tags: ['compliment'] },
  { type: 'dare', text: 'Whisper your deepest, most honest wish for our intimacy in my left ear.', tags: ['whisper'] },
  { type: 'truth', text: "What is the most passionate kiss we have ever shared in your memory?", tags: ['kiss'] },
  { type: 'dare', text: 'Let me run my fingers slowly through your hair while you close your eyes.', tags: ['touch'] },
  { type: 'truth', text: "What makes you feel most safe, cherished, and deeply wanted by me?", tags: ['vulnerability'] },
];

function expandTruthOrDare() {
  const wholesome = loadCards('truth-or-dare', 'wholesome');
  const startW = wholesome.length + 1;
  todWholesomeNew.forEach((item, i) => {
    const num = String(startW + i).padStart(3, '0');
    wholesome.push({ id: `tod-w-${num}`, level: 'wholesome', ...item });
  });
  saveCards('truth-or-dare', 'wholesome', wholesome);

  const flirty = loadCards('truth-or-dare', 'flirty');
  const startF = flirty.length + 1;
  todFlirtyNew.forEach((item, i) => {
    const num = String(startF + i).padStart(3, '0');
    flirty.push({ id: `tod-f-${num}`, level: 'flirty', ...item });
  });
  saveCards('truth-or-dare', 'flirty', flirty);

  const spicy = loadCards('truth-or-dare', 'spicy');
  const startS = spicy.length + 1;
  todSpicyNew.forEach((item, i) => {
    const num = String(startS + i).padStart(3, '0');
    spicy.push({ id: `tod-s-${num}`, level: 'spicy', ...item });
  });
  saveCards('truth-or-dare', 'spicy', spicy);
}

// ==========================================
// 2. NEVER HAVE I EVER (+25 wholesome, +25 flirty, +25 spicy)
// ==========================================
const nhieWholesomeNew = [
  'Never have I ever binge-watched an entire season of a show in a single day',
  'Never have I ever tried to cook a fancy recipe and completely set off the smoke alarm',
  'Never have I ever laughed at a completely inappropriate moment and had to cover my mouth',
  'Never have I ever pretended to know a song when everyone else was singing along',
  'Never have I ever bought something online late at night that I immediately regretted',
  'Never have I ever gotten completely lost while following a GPS navigation app',
  'Never have I ever re-read old journal entries or high school notes and cringed',
  'Never have I ever eaten dessert for breakfast when nobody was watching',
  'Never have I ever made up an elaborate excuse to leave a social event early',
  'Never have I ever taken a quiz online to see what kind of bread or pasta I am',
  'Never have I ever sung loudly in the shower thinking nobody could hear me',
  'Never have I ever cried during an animated Pixar or Disney movie',
  'Never have I ever stayed in bed for a full 14 hours over a weekend',
  'Never have I ever practiced an award acceptance speech in front of the bathroom mirror',
  'Never have I ever dropped my phone directly onto my face while lying down in bed',
  'Never have I ever tried to cut my own hair or bangs with kitchen scissors',
  'Never have I ever looked up the plot of a thriller movie before finishing it',
  'Never have I ever worn mismatched socks on purpose just because I was too lazy',
  'Never have I ever bought plane tickets on pure impulse for an adventure',
  'Never have I ever waved back enthusiastically at someone who was waving at someone else',
  'Never have I ever hid snacks in my room so I would not have to share them',
  'Never have I ever accidentally walked into a glass door or sliding window',
  'Never have I ever stayed up past 3 AM talking about life and the universe',
  'Never have I ever re-gifted a holiday present that I had zero use for',
  'Never have I ever fallen asleep in the movie theater during a noisy blockbuster',
];

const nhieFlirtyNew = [
  'Never have I ever spent an entire day waiting by my phone for a text from you',
  'Never have I ever stalked your social media back to years before we even met',
  'Never have I ever smelled your jacket or hoodie when you left it behind',
  'Never have I ever re-read our first conversations late at night just to smile',
  'Never have I ever planned our dream wedding or vacation in my head secretively',
  'Never have I ever practiced what I was going to say before calling you',
  'Never have I ever gotten butterflies simply from seeing your name light up on my phone',
  'Never have I ever checked my reflection five times before opening the door for you',
  'Never have I ever listened to a love song and instantly thought of you the whole time',
  'Never have I ever worn a specific scent or perfume just because you loved it',
  'Never have I ever felt a wave of jealousy when someone was being overly friendly with you',
  'Never have I ever saved a screenshot of a sweet message you sent me to look at later',
  'Never have I ever bragged about how attractive or talented my partner is to friends',
  'Never have I ever daydreamed about kissing you in the middle of a mundane work day',
  'Never have I ever taken a photo of you when you were asleep or looking cute',
  'Never have I ever felt weak in the knees after a particularly good embrace with you',
  'Never have I ever bought something cute at a store solely because it reminded me of you',
  'Never have I ever wanted to hold hands in public just to show everyone we are together',
  'Never have I ever gotten flustered trying to make eye contact across a dinner table',
  'Never have I ever made a playlist of romantic songs specifically curated for you',
  'Never have I ever smiled at my phone in public so hard people looked at me weirdly',
  'Never have I ever whispered "I love you" while you were sleeping soundly',
  'Never have I ever canceled other casual plans just to spend quiet time with you',
  'Never have I ever stared at your lips while you were talking about your day',
  'Never have I ever known I was falling in love before I had the courage to say it',
];

const nhieSpicyNew = [
  'Never have I ever had a steamy dream about my partner that felt intensely real',
  'Never have I ever sent a suggestive or teasing photo while my partner was at work',
  'Never have I ever wanted to pull my partner into a quiet corner or elevator for a quick kiss',
  'Never have I ever worn special lingerie or clothing hoping my partner would notice immediately',
  'Never have I ever undressed slowly just to catch my partner watching me',
  'Never have I ever kissed my partner so passionately we almost forgot dinner reservations',
  'Never have I ever whispered something provocative in public just to see my partner blush',
  'Never have I ever thought about making out in the ocean or a secluded hot tub under the stars',
  'Never have I ever lingered in the shower wishing my partner would step inside with me',
  'Never have I ever wanted to play a romantic game with zero clothes involved',
  'Never have I ever felt an electric shiver from my partner kissing the back of my neck',
  'Never have I ever fantasized about being swept away to an intimate mountain cabin for a week',
  'Never have I ever gently bitten my partner on the neck or collarbone during a passionate hug',
  'Never have I ever sent a flirty text message describing exactly what I want tonight',
  'Never have I ever wished morning cuddles could turn into an all-day bedroom marathon',
  'Never have I ever wanted my partner to take full charge and lead our evening',
  'Never have I ever fallen asleep with my partner skin-to-skin and felt completely at home',
  'Never have I ever touched my partner under the dinner table when nobody was looking',
  'Never have I ever fantasized about an impromptu romantic rendezvous in the middle of the day',
  'Never have I ever had my breath taken away by how breathtaking my partner looked in bed',
  'Never have I ever kissed my partner all the way from their forehead down to their shoulders',
  'Never have I ever stayed up past 4 AM purely caught up in romantic passion together',
  'Never have I ever wanted to lock the bedroom door and ignore the entire world for 24 hours',
  'Never have I ever felt my pulse racing from a single lingering glance across the room',
  'Never have I ever felt that our physical chemistry was pure, undeniable magic',
];

function expandNeverHaveIEver() {
  const wholesome = loadCards('never-have-i-ever', 'wholesome');
  const startW = wholesome.length + 1;
  nhieWholesomeNew.forEach((text, i) => {
    const num = String(startW + i).padStart(3, '0');
    wholesome.push({ id: `nhie-w-${num}`, text, level: 'wholesome', tags: ['habits'] });
  });
  saveCards('never-have-i-ever', 'wholesome', wholesome);

  const flirty = loadCards('never-have-i-ever', 'flirty');
  const startF = flirty.length + 1;
  nhieFlirtyNew.forEach((text, i) => {
    const num = String(startF + i).padStart(3, '0');
    flirty.push({ id: `nhie-f-${num}`, text, level: 'flirty', tags: ['romance'] });
  });
  saveCards('never-have-i-ever', 'flirty', flirty);

  const spicy = loadCards('never-have-i-ever', 'spicy');
  const startS = spicy.length + 1;
  nhieSpicyNew.forEach((text, i) => {
    const num = String(startS + i).padStart(3, '0');
    spicy.push({ id: `nhie-s-${num}`, text, level: 'spicy', tags: ['passion'] });
  });
  saveCards('never-have-i-ever', 'spicy', spicy);
}

// ==========================================
// 3. WOULD YOU RATHER (+25 wholesome, +25 flirty, +25 spicy)
// ==========================================
const wyrWholesomeNew = [
  { optionA: 'Adopt a rescue puppy together', optionB: 'Adopt two mischievous rescue kittens together' },
  { optionA: 'Live in a quiet seaside cottage', optionB: 'Live in a cozy rustic mountain chalet' },
  { optionA: 'Take an authentic pasta cooking class in Italy', optionB: 'Take a sushi making masterclass in Japan' },
  { optionA: 'Have a weekly breakfast in bed tradition', optionB: 'Have a weekly midnight dessert run tradition' },
  { optionA: 'Spend a rainy Sunday doing a 1000-piece puzzle', optionB: 'Spend a rainy Sunday having a movie marathon' },
  { optionA: 'Go on a wild cross-country road trip in an RV', optionB: 'Go island-hopping on tropical ferry rides' },
  { optionA: 'Build an enormous pillow fort in the living room', optionB: 'Set up a tent and sleep under backyard stars' },
  { optionA: 'Cook an elaborate 4-course dinner together', optionB: 'Order takeout from 3 different favorite places' },
  { optionA: 'Have a private couple book club', optionB: 'Have a couple video game co-op night' },
  { optionA: 'Wake up early to catch a breathtaking sunrise', optionB: 'Pack wine and blankets for a sunset picnic' },
  { optionA: 'Go on a whimsical thrift store date', optionB: 'Go on a cozy independent bookstore date' },
  { optionA: 'Have unlimited free coffee together for life', optionB: 'Have unlimited free artisan pizza together for life' },
  { optionA: 'Learn salsa dancing together in a noisy studio', optionB: 'Learn pottery together in a serene workshop' },
  { optionA: 'Visit an amusement park and ride every coaster', optionB: 'Visit a tranquil botanical garden and café' },
  { optionA: 'Spend New Years Eve in a vibrant snowy cabin', optionB: 'Spend New Years Eve on a warm sandy beach' },
  { optionA: 'Sing a hilarious karaoke duet in front of friends', optionB: 'Slow dance in the kitchen while cooking dinner' },
  { optionA: 'Have a personal chef cook for you on anniversaries', optionB: 'Have a personal masseuse give couples massages' },
  { optionA: 'Take an unplanned midnight drive with no map', optionB: 'Wake up early for a spontaneous farmer market run' },
  { optionA: 'Have an attic turned into a cozy stargazing loft', optionB: 'Have a basement turned into a luxury home cinema' },
  { optionA: 'Own matching romantic holiday pajamas', optionB: 'Own matching custom embroidered couple hoodies' },
  { optionA: 'Travel back in time to relive our very first date', optionB: 'Get a sneak preview of our happy life together in 10 years' },
  { optionA: 'Spend a day with no phones or screens at all', optionB: 'Spend a day playing arcade and board games together' },
  { optionA: 'Have an outdoor movie screen in the backyard', optionB: 'Have a warm bubbling cedar hot tub on the deck' },
  { optionA: 'Take an architectural walking tour of Paris', optionB: 'Hike through misty green mossy forests in Oregon' },
  { optionA: 'Receive a handwritten romantic letter once a month', optionB: 'Receive a surprise bouquet or pastry once a week' },
];

const wyrFlirtyNew = [
  { optionA: 'Receive a heartfelt 3-page handwritten love letter', optionB: 'Have your partner serenade you with an acoustic song' },
  { optionA: 'Share a passionate kiss in the pouring rain', optionB: 'Share a romantic slow dance on a moonlit rooftop' },
  { optionA: 'Wake up wrapped tightly in your partner embrace', optionB: 'Fall asleep with your partner fingers through your hair' },
  { optionA: 'Have your partner plan an entire secret weekend trip', optionB: 'Pack a suitcase together and pick a city at the airport' },
  { optionA: 'Be told you are the most stunning person in the room', optionB: 'Be told your mind and spirit are completely irreplaceable' },
  { optionA: 'Spend an hour whispering sweet secrets under blankets', optionB: 'Take a long romantic midnight walk holding hands' },
  { optionA: 'Have your partner remember every detail of your outfit', optionB: 'Have your partner remember every funny story you told' },
  { optionA: 'Get a gentle kiss on your forehead every morning', optionB: 'Get a tight warm hug from behind while making coffee' },
  { optionA: 'Have your partner write a song or poem about you', optionB: 'Have your partner frame their favorite candid photo of you' },
  { optionA: 'Steal kisses at a crowded party across the room', optionB: 'Slip away early together to share dessert in privacy' },
  { optionA: 'Have a partner who always makes you laugh until you cry', optionB: 'Have a partner who always makes you feel deeply heard' },
  { optionA: 'Spend an evening looking through all our old photos', optionB: 'Spend an evening making vision boards of our future together' },
  { optionA: 'Have breakfast in bed served with freshly cut roses', optionB: 'Have candlelit wine and chocolate fondue at midnight' },
  { optionA: 'Hold hands everywhere you go in public', optionB: 'Have a secret wink and glance that only you two understand' },
  { optionA: 'Get a surprise romantic massage after a hard day', optionB: 'Get a warm bubble bath prepared with candles waiting' },
  { optionA: 'Hear your partner say what made them fall in love with you', optionB: 'Hear your partner describe what they love about you today' },
  { optionA: 'Have an intimate candlelit dinner on the beach', optionB: 'Have a luxurious picnic in a sunlit vineyard' },
  { optionA: 'Spend an hour softly brushing each other hair', optionB: 'Spend an hour tracing constellations on each other skin' },
  { optionA: 'Have your partner surprise you at work with lunch', optionB: 'Have your partner leave sweet sticky notes in your bag' },
  { optionA: 'Be kissed softly with eyes closed and deep focus', optionB: 'Be kissed passionately while maintaining intense eye contact' },
  { optionA: 'Have your partner wear your favorite cologne or scent', optionB: 'Have your partner wear the shirt you find most attractive' },
  { optionA: 'Share a long dessert with one spoon at a quaint bistro', optionB: 'Split a vintage milkshake with two straws like an old movie' },
  { optionA: 'Have your partner whisper how much they adore you in public', optionB: 'Have your partner squeeze your hand three times for "I love you"' },
  { optionA: 'Take an impromptu couples photoshoot together', optionB: 'Take silly photo booth strips in a vintage cinema lobby' },
  { optionA: 'Spend an entire weekend without leaving each other side', optionB: 'Have an intense reunion after a brief couple days apart' },
];

const wyrSpicyNew = [
  { optionA: 'Spend an entire rainy weekend in bed with no phones', optionB: 'Escape to a secluded luxury villa with a private plunge pool' },
  { optionA: 'Have a slow, tender 30-minute full body massage', optionB: 'Have an intense, spontaneous encounter against the doorway' },
  { optionA: 'Whisper raw secrets in the dark before touching', optionB: 'Keep the lights on and maintain eye contact the entire time' },
  { optionA: 'Be blindfolded and guided purely by your partner touch', optionB: 'Guide your partner hands everywhere you want them to touch' },
  { optionA: 'Take an indulgent candlelit bath together with champagne', optionB: 'Share a steamy shower with lingering embraces' },
  { optionA: 'Have your partner tease you with gentle touches for hours', optionB: 'Have your partner take full control with sudden passion' },
  { optionA: 'Spend an evening kissing in complete secluded darkness', optionB: 'Spend an evening kissing under the soft glow of candlelight' },
  { optionA: 'Have your neck kissed until you shiver with desire', optionB: 'Have your lips kissed until your heart beats out of your chest' },
  { optionA: 'Wake up in the morning to gentle, passionate caresses', optionB: 'Stay up until 3 AM caught in mutual breathless romance' },
  { optionA: 'Play a game of strip poker or truth-or-dare', optionB: 'Share your deepest secret fantasies with total vulnerability' },
  { optionA: 'Kiss under a warm outdoor shower beneath the stars', optionB: 'Kiss in a private hot tub overlooking snowcapped mountains' },
  { optionA: 'Have your partner whisper what they want in graphic detail', optionB: 'Have your partner show you without speaking a single word' },
  { optionA: 'Feed each other chilled strawberries and melted chocolate', optionB: 'Sip champagne and share slow lingering kisses between sips' },
  { optionA: 'Wear silk blindfolds to heighten every touch and sound', optionB: 'Use warm scented massage oils on each other back and legs' },
  { optionA: 'Have a passionate rendezvous in the middle of a lazy afternoon', optionB: 'Wait in eager anticipation for a late-night candlelit reunion' },
  { optionA: 'Be embraced tightly with undeniable strength and longing', optionB: 'Be caressed softly with featherlight, teasing fingertips' },
  { optionA: 'Have an intimate private weekend in a bustling city hotel suite', optionB: 'Have an intimate private weekend in a rustic secluded forest cabin' },
  { optionA: 'Kiss continuously for 10 unhurried, breathless minutes', optionB: 'Explore every sensitive spot on each other neck and shoulders' },
  { optionA: 'Let your partner pick out your nightwear for the evening', optionB: 'Surprise your partner with an alluring new look they have never seen' },
  { optionA: 'Hear your partner heart pounding against your chest after kissing', optionB: 'Feel your partner hands gripping your hips with deep desire' },
  { optionA: 'Engage in a passionate make-out session on the living room rug', optionB: 'Share an intimate embrace right on top of the kitchen counter' },
  { optionA: 'Start with slow, tender romance and build to wild passion', optionB: 'Start with sudden electrifying urgency from the moment the door shuts' },
  { optionA: 'Share a secret touch when sitting beside each other in public', optionB: 'Exchange steamy texts while in the exact same room' },
  { optionA: 'Have your partner kiss you softly awake before your alarm goes off', optionB: 'Have your partner hold you tight and breathe into your ear before sleep' },
  { optionA: 'Spend the entire night exploring new ways to please your partner', optionB: 'Let your partner dedicate the entire night to spoiling and worshipping you' },
];

function expandWouldYouRather() {
  const wholesome = loadCards('would-you-rather', 'wholesome');
  const startW = wholesome.length + 1;
  wyrWholesomeNew.forEach((item, i) => {
    const num = String(startW + i).padStart(3, '0');
    wholesome.push({ id: `wyr-w-${num}`, level: 'wholesome', ...item });
  });
  saveCards('would-you-rather', 'wholesome', wholesome);

  const flirty = loadCards('would-you-rather', 'flirty');
  const startF = flirty.length + 1;
  wyrFlirtyNew.forEach((item, i) => {
    const num = String(startF + i).padStart(3, '0');
    flirty.push({ id: `wyr-f-${num}`, level: 'flirty', ...item });
  });
  saveCards('would-you-rather', 'flirty', flirty);

  const spicy = loadCards('would-you-rather', 'spicy');
  const startS = spicy.length + 1;
  wyrSpicyNew.forEach((item, i) => {
    const num = String(startS + i).padStart(3, '0');
    spicy.push({ id: `wyr-s-${num}`, level: 'spicy', ...item });
  });
  saveCards('would-you-rather', 'spicy', spicy);
}

// ==========================================
// 4. FINISH THE SENTENCE (30 wholesome, 30 flirty, 30 spicy)
// ==========================================
const ftsWholesome = [
  "My absolute favorite memory with you so far has to be...",
  "The first thing I noticed when I laid eyes on you was...",
  "One tiny thing you do that never fails to make me smile is...",
  "If our relationship were an adventure movie, the plot would be...",
  "A dish or meal that will always remind me of our early dates is...",
  "The funniest thing we have ever experienced together was when...",
  "If we could adopt any exotic animal together tomorrow, it would be...",
  "Something I have learned from you that made me a better person is...",
  "When I am having a stressful day, the best thing you can do is...",
  "A place I dream of visiting hand-in-hand with you is...",
  "Our perfect lazy Sunday morning consists of...",
  "The soundtrack to our relationship would definitely include...",
  "One quirky habit of yours that I secretly find endearing is...",
  "If we opened a cozy small business together, we would sell...",
  "The most thoughtful gesture you have ever made for me was...",
  "A shared inside joke that nobody else understands is...",
  "When you laugh uncontrollably, it always sounds like...",
  "Something I love doing with you that most people find boring is...",
  "If I could relive one single 24-hour day with you, I would pick...",
  "The silliest nickname I have ever thought of calling you is...",
  "A recipe we should definitely try cooking together soon is...",
  "One goal I want us to accomplish together in the next year is...",
  "When we are old and gray, I picture the two of us...",
  "The best hug you ever gave me felt like...",
  "A tradition we have started together that I truly cherish is...",
  "You make our home feel warmer simply by...",
  "If we built a secret treehouse together, it would have...",
  "A quality of yours that constantly amazes me is...",
  "The sweetest thing you ever said when I was down was...",
  "No matter how busy life gets, I always look forward to...",
];

const ftsFlirty = [
  "You look undeniably most irresistible to me when you wear...",
  "The exact moment I knew I had caught serious feelings for you was...",
  "The look you gave me that still makes my heart skip a beat was...",
  "If I could steal a kiss from you anywhere in the world right now, it would be...",
  "Something you do without realizing that gives me butterflies is...",
  "When you whisper close to my ear, I immediately feel...",
  "The scent of your perfume or skin always makes me think of...",
  "My favorite way you touch me when we are walking together is...",
  "If we had a secret romantic code word, it would mean...",
  "The song that makes me want to pull you close and slow dance is...",
  "What makes your smile so magnetic to me is...",
  "I was trying so hard to act cool and impress you on our first date when...",
  "A flirty thought about you that crossed my mind today was...",
  "When you hold my hand in yours, I instantly feel...",
  "The romantic compliment I secretly love hearing from you most is...",
  "If we were the only two people left in a rainy city, we would...",
  "A daydream I frequently have about us running away together is...",
  "The way you look at me across a crowded room makes me feel...",
  "My favorite kiss we have ever shared took place when...",
  "If I could freeze one romantic moment between us forever, it would be...",
  "The thing that makes our romantic chemistry so special is...",
  "When you wrap your arms around my waist from behind, my heart...",
  "A romantic surprise I have secretly imagined planning for you is...",
  "The sweetest thing about the way you say my name is...",
  "When our eyes lock across the table over dinner, I always think...",
  "Something about your lips that I find completely captivating is...",
  "If I could write a love note on your mirror right now, it would say...",
  "You give me butterflies most intensely whenever you...",
  "The way you smile right before you lean in to kiss me is...",
  "Falling in love with you feels like...",
];

const ftsSpicy = [
  "The single most electrifying moment of physical tension between us was...",
  "When your fingers slowly trace down my neck and shoulders, I...",
  "The one spot on my body where a soft kiss drives me wild is...",
  "A private fantasy about us that makes my pulse race is...",
  "Tonight after this game is over, the first thing I want you to do is...",
  "The way your hands feel gripping my hips makes me...",
  "If we locked the bedroom door for an entire undisturbed afternoon, we would...",
  "Something you whispered in bed that I still haven't forgotten was...",
  "When you pull me close and press your body against mine, I feel...",
  "The outfit or style of yours that makes it hardest for me to behave is...",
  "A gentle bite on my lower lip or neck always makes me...",
  "The most passionate, breathless kiss we have ever shared was...",
  "When the lights are dim and we are completely alone, I crave...",
  "The thing about our physical intimacy that connects us deepest is...",
  "When you look at me with raw, unfiltered desire in your eyes, I...",
  "A place in our home where I have daydreamed about kissing you is...",
  "If I could ask for one sensual favor from you with zero hesitation, it would be...",
  "The sound of your voice when you are breathless and close makes me...",
  "Something adventurous you have wanted us to explore together is...",
  "The warmth of your skin against mine when we wake up feels like...",
  "A teasing gesture you do that instantly turns on the heat between us is...",
  "When you kiss down my collarbone and linger there, I...",
  "The most magnetic thing about our bedroom chemistry is...",
  "If we were caught alone in an empty elevator for ten minutes, I would...",
  "The way you touch my waist when nobody is looking makes me...",
  "A sensual massage from your warm hands on my back sounds like...",
  "The feeling of your breath against my skin right before a kiss makes me...",
  "Something I find irresistibly attractive about your confidence in bed is...",
  "When we are lost in each other with nowhere to be, time feels like...",
  "The thing I desire most about our love behind closed doors is...",
];

function createFinishTheSentence() {
  const w = ftsWholesome.map((text, i) => ({
    id: `fts-w-${String(i + 1).padStart(3, '0')}`,
    text,
    level: 'wholesome',
    tags: ['prompt'],
  }));
  saveCards('finish-the-sentence', 'wholesome', w);

  const f = ftsFlirty.map((text, i) => ({
    id: `fts-f-${String(i + 1).padStart(3, '0')}`,
    text,
    level: 'flirty',
    tags: ['romance'],
  }));
  saveCards('finish-the-sentence', 'flirty', f);

  const s = ftsSpicy.map((text, i) => ({
    id: `fts-s-${String(i + 1).padStart(3, '0')}`,
    text,
    level: 'spicy',
    tags: ['passion'],
  }));
  saveCards('finish-the-sentence', 'spicy', s);
}

// ==========================================
// 5. THIS OR THAT (30 wholesome, 30 flirty, 30 spicy)
// ==========================================
const totWholesome = [
  { optionA: "Early Morning Person", optionB: "Late Night Owl" },
  { optionA: "Sweet Dessert Lover", optionB: "Savory Snack Lover" },
  { optionA: "Beach Vacation", optionB: "Mountain Getaway" },
  { optionA: "Cooking at Home", optionB: "Dining Out at Bistro" },
  { optionA: "Dogs as Pets", optionB: "Cats as Pets" },
  { optionA: "Action & Sci-Fi Movies", optionB: "Comedy & Drama Movies" },
  { optionA: "Road Trip by Car", optionB: "Flying by Plane" },
  { optionA: "Hot Coffee in Morning", optionB: "Iced Tea in Afternoon" },
  { optionA: "Board Games Night", optionB: "Video Games Night" },
  { optionA: "Amusement Park Coasters", optionB: "Tranquil Waterpark Lazy River" },
  { optionA: "Cozy Winter Snow", optionB: "Warm Summer Sun" },
  { optionA: "City Penthouse", optionB: "Country Farmhouse" },
  { optionA: "Reading a Good Book", optionB: "Listening to a Podcast" },
  { optionA: "Spontaneous Adventures", optionB: "Carefully Planned Itinerary" },
  { optionA: "Big Lively Party", optionB: "Intimate Dinner with Close Friends" },
  { optionA: "Watching Sunrises", optionB: "Watching Sunsets" },
  { optionA: "Handwritten Letters", optionB: "Long Voice Notes" },
  { optionA: "Camping in a Tent", optionB: "Glamping in a Cabin" },
  { optionA: "Breakfast for Dinner", optionB: "Leftovers for Breakfast" },
  { optionA: "Live Concert in Stadium", optionB: "Acoustic Set in Small Lounge" },
  { optionA: "Crisp Autumn Leaves", optionB: "Blooming Spring Flowers" },
  { optionA: "Sweet Milk Chocolate", optionB: "Rich Dark Chocolate" },
  { optionA: "Physical Paper Books", optionB: "Convenient E-Reader" },
  { optionA: "Theme Park Fun", optionB: "Museum & Art Gallery Walk" },
  { optionA: "Baking Fresh Cookies", optionB: "Grilling Savory BBQ" },
  { optionA: "Sleeping with Window Open", optionB: "Sleeping with AC on Full" },
  { optionA: "Pancake Breakfast", optionB: "Waffle Breakfast" },
  { optionA: "Cozy Cardigan Sweater", optionB: "Comfy Oversized Hoodie" },
  { optionA: "Singing Aloud in Car", optionB: "Quiet Scenic Drive" },
  { optionA: "Watching Old Cartoons", optionB: "Watching True Crime Docs" },
];

const totFlirty = [
  { optionA: "Forehead Kisses", optionB: "Kisses on the Neck" },
  { optionA: "Holding Hands Everywhere", optionB: "Arms Wrapped Around Waist" },
  { optionA: "Breakfast in Bed Together", optionB: "Midnight Snack Runs in Pajamas" },
  { optionA: "Surprise Love Notes in Pocket", optionB: "Sweet Random Texts During Day" },
  { optionA: "Slow Dancing in Kitchen", optionB: "Cuddling Under Heavy Blankets" },
  { optionA: "Candid Photos of You", optionB: "Cute Posed Selfies Together" },
  { optionA: "Whispered Sweet Nothings", optionB: "Heartfelt Long Speeches" },
  { optionA: "Stealing Kisses in Elevator", optionB: "Stealing Kisses in the Rain" },
  { optionA: "Matching Outfits Silly Fun", optionB: "Subtly Coordinated Colors" },
  { optionA: "Fingers Entangled in Hair", optionB: "Gentle Hand on Lower Back" },
  { optionA: "Playful Teasing Banter", optionB: "Deep Serious Emotional Chats" },
  { optionA: "Being Spoiled with Gifts", optionB: "Being Spoiled with Touch and Time" },
  { optionA: "Candlelit Wine Dinner", optionB: "Stargazing with Warm Cider" },
  { optionA: "Long Lingering Kisses", optionB: "Flurry of Cute Pecks Everywhere" },
  { optionA: "Watching Partner Sleep", optionB: "Waking Partner Up with Kisses" },
  { optionA: "Sharing One Thick Milkshake", optionB: "Sharing a Single Huge Blanket" },
  { optionA: "Intense Eye Contact Across Room", optionB: "Secret Knee Bumps Under Table" },
  { optionA: "Romantic Handwritten Poem", optionB: "Curated 20-Song Playlist" },
  { optionA: "Big Dramatic Movie Reunited Hug", optionB: "Quiet Squeeze After Long Day" },
  { optionA: "Bathing in Natural Hot Spring", optionB: "Warm Foam Bubble Bath at Home" },
  { optionA: "Whispering While Falling Asleep", optionB: "Morning Pillow Talk Conversations" },
  { optionA: "Walking Close Under One Umbrella", optionB: "Splashing in Puddles Together" },
  { optionA: "Playful Wink Across Dinner", optionB: "Subtle Bite of Lower Lip" },
  { optionA: "Giving Full Foot Rub", optionB: "Giving Gentle Scalp Massage" },
  { optionA: "Cooking Together in Aprons", optionB: "Feeding Each Other Bites of Food" },
  { optionA: "Resting Head on Partner Chest", optionB: "Resting Head in Partner Lap" },
  { optionA: "Warm Sunset Rooftop Drinks", optionB: "Cozy Fireplace Hot Chocolate" },
  { optionA: "Saying 'I Love You' First", optionB: "Showing 'I Love You' in Actions" },
  { optionA: "Surprise Bouquet of Flowers", optionB: "Surprise Box of Favorite Pastries" },
  { optionA: "Stealing Partner Hoodie", optionB: "Wearing Partner Flannel Shirt" },
];

const totSpicy = [
  { optionA: "Gentle Slow Romance", optionB: "Intense Urgent Passion" },
  { optionA: "Lights Completely Off in Dark", optionB: "Soft Warm Candlelight Glow" },
  { optionA: "Morning Bedroom Cuddles", optionB: "Midnight Seduction in Bed" },
  { optionA: "Taking Full Charge and Leading", optionB: "Letting Your Partner Take Control" },
  { optionA: "Whispering Desires in the Ear", optionB: "Showing What You Want with Touch" },
  { optionA: "Sensual Warm Oil Massage", optionB: "Deep Steamy Shower Together" },
  { optionA: "Teasing with Slow Touches", optionB: "Bold Direct Physical Advances" },
  { optionA: "Kissing from Behind the Neck", optionB: "Face-to-Face with Eye Contact" },
  { optionA: "Soft Bites on Lower Lip", optionB: "Lingering Kisses on Collarbone" },
  { optionA: "Silk Blindfold Game", optionB: "Hands Pinned Above Pillow" },
  { optionA: "Bedroom Door Locked All Day", optionB: "Spontaneous Kissing in Kitchen" },
  { optionA: "Alluring Matching Lingerie", optionB: "Wearing Barely Anything at All" },
  { optionA: "Breathless Midnight Makeout", optionB: "Lazy Afternoon Under Sheets" },
  { optionA: "Strawberries & Dark Chocolate", optionB: "Sipping Wine from Same Glass" },
  { optionA: "Hands Gripping Partner Waist", optionB: "Hands Running Through Partner Hair" },
  { optionA: "Slow Unhurried Undressing", optionB: "Eager Clumsy Rushed Undressing" },
  { optionA: "Whispering Provocative Words", optionB: "Deep Heavy Breathing Close to Skin" },
  { optionA: "Cozy Secluded Forest Cabin", optionB: "Luxury High-Rise Penthouse Suite" },
  { optionA: "Teasing Texts Throughout the Day", optionB: "Surprising Partner at Doorstep" },
  { optionA: "Skin-to-Skin All Night Sleep", optionB: "Waking Each Other Up with Kisses" },
  { optionA: "Warm Jacuzzi Tub Under Stars", optionB: "Cozy Bedroom with Soft Music" },
  { optionA: "Gentle Caresses on Back and Hips", optionB: "Firm Grips and Deep Hugs" },
  { optionA: "Exploring Partner Whole Body", optionB: "Letting Partner Worship Your Body" },
  { optionA: "Making Out on Living Room Rug", optionB: "Making Out Against Bedroom Wall" },
  { optionA: "Eyes Open Watching Partner", optionB: "Eyes Closed Savoring Every Sensation" },
  { optionA: "Featherlight Butterfly Touches", optionB: "Deep Passionate Firm Embraces" },
  { optionA: "Sweet Whispers in the Dark", optionB: "Spicy Promises for Later Tonight" },
  { optionA: "Sharing One Small Towel", optionB: "Drying Off Each Other Gently" },
  { optionA: "Intimacy Fueled by Romance", optionB: "Intimacy Fueled by Wild Chemistry" },
  { optionA: "Never Wanting the Night to End", optionB: "Eager for Round Two in the Morning" },
];

function createThisOrThat() {
  const w = totWholesome.map((item, i) => ({
    id: `tot-w-${String(i + 1).padStart(3, '0')}`,
    ...item,
    level: 'wholesome',
  }));
  saveCards('this-or-that', 'wholesome', w);

  const f = totFlirty.map((item, i) => ({
    id: `tot-f-${String(i + 1).padStart(3, '0')}`,
    ...item,
    level: 'flirty',
  }));
  saveCards('this-or-that', 'flirty', f);

  const s = totSpicy.map((item, i) => ({
    id: `tot-s-${String(i + 1).padStart(3, '0')}`,
    ...item,
    level: 'spicy',
  }));
  saveCards('this-or-that', 'spicy', s);
}

// ==========================================
// 6. HOW WELL DO YOU KNOW ME? (15 wholesome, 15 flirty, 15 spicy = 45 total)
// ==========================================
const hwdWholesome = [
  { question: "What is my absolute favorite way to unwind after a brutal day?", options: ["Taking a hot shower & sleeping early", "Watching comfort shows in bed with snacks", "Talking it through or venting together"] },
  { question: "Which pet would I adopt in a heartbeat if we had a huge yard?", options: ["A giant fluffy golden retriever", "A couple of friendly barnyard goats", "A sleek rescue house cat"] },
  { question: "What is my biggest comfort food weakness?", options: ["Hot piping pizza with garlic crust", "A huge bowl of creamy pasta", "Warm cookies or ice cream sundae"] },
  { question: "If I could wake up with one superpower, which would I pick?", options: ["Flying wherever I want instantly", "Reading minds and understanding emotions", "Pausing time to sleep extra hours"] },
  { question: "What annoys me fastest when we are out in public?", options: ["People walking painfully slow in front of me", "Rude behavior to restaurant staff", "Loud phone calls on speaker"] },
  { question: "Which chore around our home do I secretly dislike doing most?", options: ["Washing mountains of greasy dishes", "Folding and putting away piles of laundry", "Taking out trash and recycling"] },
  { question: "What is my ideal vacation style?", options: ["Packed schedule with tours & historic spots", "100% relaxation on beach chairs with drinks", "Cozy cabin in nature with zero noise"] },
  { question: "What genre of music do I always sing loudest to in the car?", options: ["90s & 2000s Pop and R&B throwbacks", "Acoustic indie or classic rock", "High energy dance & electronic beats"] },
  { question: "How do I handle having a common head cold?", options: ["Like a stoic soldier who claims they are fine", "Like a dramatic Victorian orphan in need of soup", "Sleeping 18 hours straight like a bear"] },
  { question: "What is my biggest irrational fear?", options: ["Spiders, insects, or creepy crawlies", "Heights and rickety suspension bridges", "Dark deep ocean water where I can't see"] },
  { question: "If we won a million dollars tomorrow, what is the first thing I would buy?", options: ["A dream home with a big kitchen and garden", "First class tickets around the entire world", "Paying off every debt and investing safely"] },
  { question: "What is my favorite hot drink order at a café?", options: ["Classic creamy vanilla latte or cappuccino", "Hot chai tea or matcha latte", "Rich hot chocolate with extra whipped cream"] },
  { question: "What type of movies do I secretly get teary-eyed watching?", options: ["Emotional films with loyal dogs or animals", "Heartwarming family reunion moments", "Heartbreaking tragic romance stories"] },
  { question: "What was my favorite subject back in school?", options: ["English literature or creative writing", "History, geography, or social studies", "Science, biology, or art & design"] },
  { question: "How many alarms do I normally need to actually get out of bed?", options: ["Exactly one — I am up on the first ring", "Two to three alarms with snoozes", "At least five alarms every ten minutes"] },
];

const hwdFlirty = [
  { question: "What was the very first thought that crossed my mind when I met you?", options: ["'Wow, they are even cuter in person than photos'", "'Their smile and voice are so warm and inviting'", "'I really hope I don't say something awkward'"] },
  { question: "Which romantic gesture makes me feel most adored?", options: ["A long heartfelt letter or unexpected message", "Being held tightly with no rush to let go", "Having coffee or dinner surprised for me"] },
  { question: "What is my favorite physical feature of yours?", options: ["Your warm, captivating eyes and glance", "Your genuine smile and laugh", "Your hands and the way you hold mine"] },
  { question: "When did I realize I was completely smitten with you?", options: ["On our first really long late-night phone call", "During a funny moment where we both laughed uncontrollably", "When you did something extraordinarily thoughtful for me"] },
  { question: "What outfit or style of yours makes my heart flutter fastest?", options: ["Dressed up in elegant evening wear", "Cozy and casual in an oversized hoodie or sweater", "Freshly showered in simple relaxed loungewear"] },
  { question: "What type of kiss from you is my secret weakness?", options: ["A gentle kiss on the forehead or eyelids", "A soft, lingering kiss on the side of the neck", "A deep, slow kiss directly on the lips"] },
  { question: "How do I act when I am feeling extra affectionate and needy?", options: ["I become a clingy koala and lean on your shoulder", "I get super playful and start teasing you", "I get quiet and just gaze at you until you hug me"] },
  { question: "What would be my ultimate surprise romantic evening?", options: ["Candlelit dinner at home cooked by you", "A surprise drive to a scenic viewpoint under stars", "A weekend getaway booked at a boutique hotel"] },
  { question: "What love language do I naturally express most often?", options: ["Physical touch — constant cuddles and hand-holding", "Words of affirmation — compliments and sweet texts", "Acts of service — making your life easier in small ways"] },
  { question: "What song lyric or romantic quote reminds me most of us?", options: ["'I have loved you for a thousand years'", "'You are my favorite place to be'", "'All of me loves all of you'"] },
  { question: "If I get a sweet text from you in the middle of a workday, what do I do?", options: ["Smile like an idiot and re-read it three times", "Immediately reply with five heart emojis", "Screenshot it to save to my private album"] },
  { question: "What is my favorite way for us to fall asleep at night?", options: ["Tightly spooned together skin-to-skin", "Facing each other with hands touching softly", "Back-to-back with our feet playing footsie"] },
  { question: "What is an inside joke between us that never gets old to me?", options: ["A silly voice or impression we always make", "A funny face you pull when you are surprised", "A mispronounced word from an early date"] },
  { question: "What romantic nickname do I secretly love you calling me most?", options: ["Baby / Babe", "Honey / Sweetheart", "My Love / Darling"] },
  { question: "What makes me feel most confident and loved in our relationship?", options: ["When you brag about me to other people", "When you look at me like nobody else exists", "When you trust me with your deepest secrets"] },
];

const hwdSpicy = [
  { question: "Where on my body am I most sensitive to your soft kisses?", options: ["Along the side of my neck and earlobe", "Right on my collarbone and shoulder line", "Down my lower back and waist"] },
  { question: "What type of intimate mood do I crave most on a Friday night?", options: ["Slow, candlelit romance with soft music", "Spontaneous, breathless passion the second we get home", "Playful teasing under blankets for hours"] },
  { question: "What is my biggest physical turn-on during our kisses?", options: ["When your hands run through my hair and hold my face", "When you gently bite or nibble my lip", "When you pull me tightly against your body"] },
  { question: "What kind of teasing drives me craziest throughout the day?", options: ["A suggestive text hinting at tonight", "A sudden unexpected kiss and squeeze in the kitchen", "A lingering whispered promise in my ear"] },
  { question: "What is my ideal lighting for an intimate night together?", options: ["Soft golden candlelight flickering softly", "Complete darkness where every touch is heightened", "Subtle warm glow from a bedside lamp"] },
  { question: "What is my favorite part of winding down together after intimacy?", options: ["Resting my head on your chest listening to your heartbeat", "Whispering about how much we love each other in the dark", "Falling into a deep, uninterrupted embrace until morning"] },
  { question: "Which sensual massage would I choose first from you?", options: ["A deep tension-relieving shoulder and neck massage", "A warm oil massage along my full back and legs", "Gentle featherlight scratches along my scalp and arms"] },
  { question: "When do I feel the strongest rush of physical desire for you?", options: ["When you step out of the shower looking fresh and alluring", "When you are all dressed up looking breathtakingly confident", "When you look at me with hungry, undeniable passion"] },
  { question: "What is an intimate fantasy location I have always found exciting?", options: ["A secluded hot tub under a starry mountain sky", "A luxury suite balcony on a warm tropical night", "A rustic wooden cabin with a roaring fireplace"] },
  { question: "What bedroom dynamic do I secretly love most?", options: ["When you take full control and lead the way", "When I take control and shower you with passion", "A completely equal, fluid give-and-take dance"] },
  { question: "What is something you do in bed that makes me instantly melt?", options: ["The gentle, warm way you look into my eyes before kissing", "The rhythm of your hands tracing my waist", "The soft breathless sounds you make when you are close"] },
  { question: "What piece of clothing on you drives me wild fastest?", options: ["A crisp button-down shirt with sleeves rolled up", "Soft form-fitting loungewear that shows off your shape", "Nothing more than a towel loosely wrapped"] },
  { question: "What kind of kiss makes my knees go weak instantly?", options: ["A slow, deep kiss that leaves both of us breathless", "A sudden, hungry kiss against the wall or doorway", "A gentle, soft kiss that lingers for ages"] },
  { question: "What scent or smell of yours do I find most intoxicating?", options: ["Your signature perfume or cologne", "Your freshly washed hair after a shower", "The warm, natural scent of your skin in bed"] },
  { question: "What makes our physical chemistry so unforgettable to me?", options: ["The absolute emotional safety and trust we share", "The undeniable raw magnetic spark between us", "How natural and effortless every touch feels"] },
];

function createHowWellDoYouKnowMe() {
  const w = hwdWholesome.map((item, i) => ({
    id: `hwd-w-${String(i + 1).padStart(3, '0')}`,
    ...item,
    level: 'wholesome',
  }));
  saveCards('how-well-do-you-know-me', 'wholesome', w);

  const f = hwdFlirty.map((item, i) => ({
    id: `hwd-f-${String(i + 1).padStart(3, '0')}`,
    ...item,
    level: 'flirty',
  }));
  saveCards('how-well-do-you-know-me', 'flirty', f);

  const s = hwdSpicy.map((item, i) => ({
    id: `hwd-s-${String(i + 1).padStart(3, '0')}`,
    ...item,
    level: 'spicy',
  }));
  saveCards('how-well-do-you-know-me', 'spicy', s);
}

// RUN ALL
console.log('--- Expanding Truth or Dare ---');
expandTruthOrDare();

console.log('--- Expanding Never Have I Ever ---');
expandNeverHaveIEver();

console.log('--- Expanding Would You Rather ---');
expandWouldYouRather();

console.log('--- Creating Finish the Sentence ---');
createFinishTheSentence();

console.log('--- Creating This or That ---');
createThisOrThat();

console.log('--- Creating How Well Do You Know Me ---');
createHowWellDoYouKnowMe();

console.log('All card expansion completed successfully! ✨');
