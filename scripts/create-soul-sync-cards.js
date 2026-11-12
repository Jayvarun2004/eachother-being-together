/**
 * scripts/create-soul-sync-cards.js
 * Generates 30 cards per level for the new "Soul Sync" deep couple conversation game.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOUL_DIR = path.resolve(__dirname, '../cards/soul-sync');

if (!fs.existsSync(SOUL_DIR)) {
  fs.mkdirSync(SOUL_DIR, { recursive: true });
}

const WHOLESOME = [
  'What is something I do that makes you feel instantly safe, calm, and grounded?',
  'What was the exact moment you felt our bond transform from "dating" into "family"?',
  'What is a quality in me that you quietly rely on during your toughest days?',
  'What is an unspoken way we communicate (a glance, a touch) that you love most?',
  'What is one dream for our future that brings tears of joy or deep peace to your eyes?',
  'What is your favorite memory of us comforting each other after a hard experience?',
  'What is something about how my mind works that you find genuinely fascinating?',
  'If you could give our relationship an award for one special strength, what would it be?',
  'What is one tradition or small habit you hope we keep doing when we are 80 years old?',
  'When you look at me across a crowded room, what goes through your mind?',
  'What is a part of your personality that only came alive after you met me?',
  'What is something I taught you or introduced you to that you now truly love?',
  'What is a private word or expression that only the two of us understand?',
  'How do you feel when you wake up in the morning and realize I am right beside you?',
  'What is something you forgive me for easily because you love me so deeply?',
  'What is the most vulnerable thing you have ever shared with me, and how did it feel?',
  'If our home had a motto carved above the front door, what should it say?',
  'What is one way I show love that speaks directly to your deepest emotional need?',
  'What is your favorite silly memory of us when things went completely wrong but we laughed anyway?',
  'What is a quiet sacrifice you have made for our relationship that you are glad you made?',
  'What is one question about my past or childhood that you still want to ask me?',
  'What made you realize that I am different from anyone else who has ever been in your life?',
  'What is your favorite way for us to spend an evening when we have zero energy to go out?',
  'What is something you are proud of how we handled together as a couple?',
  'What is a compliment from me that you will never forget as long as you live?',
  'If you could write a one-sentence love letter to my soul right now, what would it say?',
  'What is a place on earth that feels like "ours", where our memories live?',
  'What is one thing about me that you feel protective over?',
  'How has loving me changed the way you see yourself and your future?',
  'Look into my eyes for 10 seconds right now and tell me the truest thing you know about us.',
];

const FLIRTY = [
  'What is something I do with my body language that makes your heart race instantly?',
  'What was our most flirtatious, charged conversation that you still secretly replay?',
  'If you could dress me in any style or outfit for a private night in, what would it look like?',
  'What is the most attractive thing about the way I look right when I wake up?',
  'What is a romantic surprise you have secretly daydreamed about orchestrating for me?',
  'What is your favorite kind of kiss from me: soft and gentle, lingering, or deep and passionate?',
  'What scent, lotion, or perfume on me makes it impossible for you to keep your hands to yourself?',
  'If you had to pick one moment when our physical chemistry felt completely electric, which was it?',
  'What is a flirty compliment about my body or smile that you have been holding back today?',
  'What is something we do while cuddling that always makes you feel romantic and affectionate?',
  'What is one touch from me in public that gives you delicious, secret butterflies?',
  'What was going through your mind the very first time you saw me dressed up for a date?',
  'What is a romantic scene from a movie or book that you wish we could reenact together?',
  'What is your favorite memory of us whispering in the dark before falling asleep?',
  'What is a little teasing look I give you that tells you trouble is coming?',
  'If we were stranded in a cozy cabin during a winter storm, how would we spend the evening?',
  'What is one affectionate habit of mine that you would be devastated if I ever stopped doing?',
  'What is the most romantic slow song that reminds you of how it feels to hold me?',
  'How do you feel when I run my fingers slowly through your hair or down your back?',
  'What is a playful romantic secret you only recently admitted to yourself about me?',
  'If you could take me on a dream getaway anywhere in the world, where would we go first?',
  'What is something I do while cooking, driving, or working that you find surprisingly sexy?',
  'What was our most memorable late-night car ride together?',
  'What is one flirty text message from me that you have never deleted from your phone?',
  'What is a romantic dare or challenge you want to give me right now before we continue?',
  'What makes our kisses feel so different from any other kiss you have ever experienced?',
  'What is your favorite place on your body to feel my gentle kisses landing?',
  'What is something spontaneous and romantic you want us to do together this month?',
  'Describe the feeling of holding my hand in three words.',
  'Lean in right now and whisper the sweetest romantic thought in your mind into my ear.',
];

const SPICY = [
  'What is the most intense, unforgettable moment of intimacy we have ever shared?',
  'What is one secret fantasy or curiosity that you trust me completely to explore with you?',
  'What whisper, touch, or breath against your skin makes you completely surrender control?',
  'What is the most intoxicating thing about the way our bodies fit together in the dark?',
  'If tonight had no boundaries and no bedtime, what would our ideal night look like?',
  'What is something sensual I do that completely drives you crazy with desire?',
  'Where is your secret favorite spot to be kissed that most people would never guess?',
  'What was a moment when the tension between us was so high you could barely breathe?',
  'What is one bold, passionate thing you want me to whisper into your ear tonight?',
  'How has our emotional closeness made our physical connection deeper and more powerful?',
  'What is the most alluring piece of clothing or lingerie you have seen me wear?',
  'What is something sensual you want us to try for the very first time together soon?',
  'What kind of touch from me can instantly switch your mood from tired to passionately alive?',
  'What is a memory of us in bed that still makes your temperature rise just thinking about it?',
  'If you could control my actions for 15 minutes of slow, sensual teasing, what would you ask me to do?',
  'What makes you feel most confident, desired, and worshiped when we are intimate?',
  'What is one passionate promise you want us to renew right now in each other\'s arms?',
  'What is the most vulnerable and beautiful thing about being completely unclothed with me?',
  'What is something subtle I do during passion that tells you I am completely yours?',
  'How does being loved and adored by me affect your inner passion and confidence?',
  'What is a sensual massage or touch ritual you would love for us to introduce into our bedroom?',
  'What is one private wish you have been waiting for the right intimate moment to share with me?',
  'What is your favorite pace: slow, deep, and lingering, or spontaneous, intense, and hungry?',
  'What is the most breathtaking compliment you could hear from me in a moment of passion?',
  'What is something you crave about my lips, breath, or skin when we are close?',
  'What was the best morning of intimacy we have ever woken up to together?',
  'If our bedroom walls could speak, what is the sweetest secret they would tell about us?',
  'What is one sensual boundary that our trust has helped you open up to?',
  'What is a passionate touch you want me to give you as soon as this game ends?',
  'Take a deep breath, look directly into my eyes, and tell me: how deeply do you desire me?',
];

function writeLevel(level, prompts, prefix) {
  const cards = prompts.map((text, i) => ({
    id: `sync-${prefix}-${String(i + 1).padStart(3, '0')}`,
    type: 'soul-sync',
    level,
    text,
    tags: ['soul-sync', 'deep-intimacy'],
  }));

  const filePath = path.join(SOUL_DIR, `${level}.json`);
  fs.writeFileSync(filePath, JSON.stringify(cards, null, 2) + '\n');
  console.log(`Created ${filePath} with ${cards.length} cards.`);
}

writeLevel('wholesome', WHOLESOME, 'w');
writeLevel('flirty', FLIRTY, 'f');
writeLevel('spicy', SPICY, 's');
