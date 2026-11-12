/**
 * scripts/add-bond-truths.js
 * Appends partner-bonding truths to Truth or Dare decks (wholesome, flirty, spicy).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOD_DIR = path.resolve(__dirname, '../cards/truth-or-dare');

const WHOLESOME_TRUTHS = [
  'What is the very first thing you think of when you hear my name unexpectedly?',
  'What is one way I made you feel emotionally safe during a stressful moment?',
  'What is your favorite picture of us, and what makes that specific memory so precious to you?',
  'What is one little thing I do everyday that makes you feel deeply loved and valued?',
  'If you could relive our first 24 hours knowing what you know now, what would you whisper to your past self?',
  'What is something you admire about my heart or personality that you rarely tell me out loud?',
  'When we are apart, what is the exact thought or feeling that makes you miss me the most?',
  'What is an inside joke or shared ritual of ours that you would never want us to lose?',
  'What has been the most meaningful conversation we have ever had together late at night?',
  'What is a childhood vulnerability of yours that you feel completely comfortable sharing with me?',
  'What is one goal or dream you only started believing in because I believed in you?',
  'Describe a moment when you felt proudest to be by my side holding my hand.',
  'What is your favorite memory of us traveling, walking, or just wandering together without a map?',
  'What is one promise you make to me in your heart every time you look at me sleeping?',
  'What is a quality in me that balances you out when you are feeling overwhelmed or anxious?',
  'What is something about our relationship that feels different and more sacred than anything before?',
  'If you could frame a single 5-second snapshot of our relationship in your mind forever, which snapshot is it?',
  'What is a small act of kindness I did for you that surprised you in the best possible way?',
  'How do you feel when we embrace tightly after not seeing each other for a while?',
  'What is one thing you hope never changes about how we love each other, even when we are old?',
  'What is your favorite compliment I ever gave you that truly stuck in your heart?',
  'What was a time you realized we make an unbeatable, incredible team together?',
  'What is one sweet thing you do in secret or think about just to make my life a little easier?',
  'If our love story was a book, what would be the title of the current chapter we are living?',
  'What is the kindest thing I have ever whispered to you that you still cherish?',
];

const FLIRTY_TRUTHS = [
  'What is the most attractive thing about the way I speak when I am passionate about something?',
  'What was the exact moment you realized you had a massive romantic crush on me?',
  'What is one affectionate touch of mine that sends an electric shiver through you every time?',
  'If we had an entire lazy Sunday in bed together with no alarms, what would be our morning routine?',
  'What is something flirty I did recently that completely caught you off guard and flustered you?',
  'What do you find most magnetic about my scent when you lean in close to hug me?',
  'What is a romantic fantasy date involving the two of us that you have dreamed about?',
  'Which part of my face or body do you find yourself stealing glances at when you think I am not looking?',
  'What is the sweetest romantic nickname or pet phrase I call you that makes your heart flutter?',
  'What was going through your mind the very first time our lips touched in a kiss?',
  'What is one flirty outfit or look of mine that you would love to see me wear tonight?',
  'If you could slow dance with me anywhere in the world right now, where would we be dancing?',
  'What is something I do with my eyes or smile that you find utterly irresistible?',
  'What is a small playful touch (running fingers through hair, holding waist) you crave right now?',
  'What was our most thrilling, butterflies-in-the-stomach romantic moment so far?',
  'What is one playful romantic wish you want to whisper in my ear before we sleep tonight?',
  'How would you describe the chemistry between us when we look deeply at each other in silence?',
  'What is the most alluring quality about my laugh or smile that makes you want to kiss me?',
  'If you had to pick one song that feels like our chemistry and passion, what song is it?',
  'What is one gentle touch from me that can instantly melt away all your daily tension?',
  'What is your favorite way for me to wake you up in the morning?',
  'What is one daring, romantic compliment you have been dying to tell me all day?',
  'What was the most romantic setting we have ever been in together?',
  'How fast does your heart beat when I pull you close and wrap my arms around your waist?',
  'What is one playful romantic challenge you want to give me right now?',
];

const SPICY_TRUTHS = [
  'What is an intimate desire or fantasy you have secretly imagined with me but never said out loud?',
  'What is the most intoxicating and passionate memory we have shared in private that you replay in your mind?',
  'Where is your absolute most sensitive spot that makes you gasp when I press soft, slow kisses there?',
  'What is something bold, sensual, or adventurous you have dreamed of us exploring together in the dark?',
  'What whisper or teasing phrase against your neck or ear drives you completely crazy with anticipation?',
  'If we had 1 hour completely uninterrupted tonight, what is the very first thing you want me to do to you?',
  'What is the most attractive, seductive thing I do without even realizing I am doing it?',
  'What kind of slow touch or kiss from me makes you completely forget about the rest of the world?',
  'What is your favorite memory of us being completely vulnerable and passionate together?',
  'What is one sensual boundary or curiosity you feel safe, excited, and eager to explore with me?',
  'What outfit, fabric, or lack thereof do you find most breathtakingly seductive on me?',
  'How do you like to be held and kissed right after an intense moment of passion between us?',
  'What is the most irresistible urge you feel when we are lying together skin-to-skin?',
  'What is a teasing touch you secretly wish I would surprise you with more often?',
  'If you were to take total, passionate control of me tonight, how would the first 10 minutes unfold?',
  'What is the most thrilling place you have ever daydreamed about stealing a secret kiss with me?',
  'What was the most intense physical chemistry you ever felt with me in public, where we had to hold back?',
  'What part of my body do you crave having your hands on most when we are close?',
  'What is one sensual secret you have never told any other human being, but trust me with?',
  'How does it make you feel knowing how deeply and completely desired you are by me?',
  'What is a passionate dream or waking daydream you have had about us recently?',
  'What pace of passion do you crave most with me: slow, tender, and lingering, or sudden and breathless?',
  'What is one sweet and passionate thing you want us to do under the blankets tonight?',
  'What is the most intense, heart-pounding sensation you have experienced in my arms?',
  'What is one sensual promise you want us to make to each other for tonight?',
];

function appendCards(level, truths, prefix) {
  const filePath = path.join(TOD_DIR, `${level}.json`);
  const cards = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const currentCount = cards.length;

  truths.forEach((text, i) => {
    const num = String(currentCount + i + 1).padStart(3, '0');
    cards.push({
      id: `tod-${prefix}-${num}`,
      type: 'truth',
      level,
      text,
      tags: ['bond-deepener', 'partner-truth'],
    });
  });

  fs.writeFileSync(filePath, JSON.stringify(cards, null, 2) + '\n');
  console.log(`Updated ${level}.json: now ${cards.length} cards.`);
}

appendCards('wholesome', WHOLESOME_TRUTHS, 'w');
appendCards('flirty', FLIRTY_TRUTHS, 'f');
appendCards('spicy', SPICY_TRUTHS, 's');
