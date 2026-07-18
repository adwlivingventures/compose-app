// The Re-Wire Daily Layer — one authentic Napoleon Hill quote and one
// three-statement “I am” triad per protocol day, shown on the Re-Wire page
// during the daily check-in (founder direction 2026-07-18). Complements the
// oldScript/truth pairs in rewires.ts; does not replace them.
//
// Sourcing (legal): every quote is verbatim from the original 1937 edition
// of Think and Grow Rich — public domain in the US. Provenance, curation
// rationale, and the excluded-material list live in
// docs/research/HILL-QUOTE-LIBRARY.md and docs/research/REWIRE-DAILY-CONTENT.md.
// The Day 68 quote is deliberately partial (trailing ellipsis) — do not
// “fix” it into a full sentence; the trimmed tail is off-tone for §8.
//
// Mechanism: the quote is the day’s external voice (borrowed authority — a
// 1937 text with zero clinical shame-load), the triad is the internal voice
// (identity rehearsal). Statements are grouped in fixed triads so each
// triad becomes a small liturgy; each triad appears exactly once per phase
// (once every ~25 days), which is spaced repetition at the interval where
// familiarity aids encoding without semantic satiation. Deterministic and
// versioned per §7 — no runtime generation.

export interface DailyQuote {
  /** Protocol day, 1-75. */
  day: number;
  /** Verbatim 1937 text. Hill’s emphatic ALL-CAPS is preserved. */
  text: string;
  /** Attribution surface, e.g. “Napoleon Hill, Think and Grow Rich (1937), Ch. 15”. */
  source: string;
}

export interface IAmStatement {
  id: number;
  text: string;
}

export interface Triad {
  id: number;
  /** Internal label — not necessarily shown in UI. */
  name: string;
  statementIds: [number, number, number];
}

export const IAM_STATEMENTS: IAmStatement[] = [
  { id: 1, text: 'I am someone who does hard things and challenges myself every day.' },
  { id: 2, text: 'I move at a calm and steady pace in life.' },
  { id: 3, text: 'I do not rush anxiously when things get uncomfortable.' },
  { id: 4, text: 'I value my time and do not waste it.' },
  { id: 5, text: 'I am generous with my resources.' },
  { id: 6, text: 'I do not indulge in the fleeting, empty pleasures of this world.' },
  { id: 7, text: 'I am intelligent and take care of my brain.' },
  { id: 8, text: 'I am someone others can count on.' },
  { id: 9, text: 'I am present and do not miss the little moments.' },
  { id: 10, text: 'I am not afraid to feel and love deeply.' },
  { id: 11, text: 'I do not do things that harm my soul.' },
  { id: 12, text: 'I am a man of self-control.' },
  { id: 13, text: 'I believe I will reap what I sow.' },
  { id: 14, text: 'I am physically strong and have tons of natural masculine energy.' },
  { id: 15, text: 'I have peace because I live intentionally.' },
  { id: 16, text: 'I immerse myself in creative projects and do not rush.' },
  { id: 17, text: 'I protect my attention like it is the most valuable resource I own.' },
  { id: 18, text: 'I am disciplined.' },
  { id: 19, text: 'I am consistent.' },
  { id: 20, text: 'I feel the power and clarity that comes from my discipline and consistency every single day.' },
  { id: 21, text: 'I am calm in my body, even when life speeds up around me.' },
  { id: 22, text: 'My breath is slow, and my mind follows it.' },
  { id: 23, text: 'I can feel discomfort without needing to escape it.' },
  { id: 24, text: 'I stay when things get hard. Staying is my strength.' },
  { id: 25, text: 'My nervous system is trainable, and I train it every day.' },
  { id: 26, text: 'I am at home in my own body.' },
  { id: 27, text: 'I give the person in front of me my full attention.' },
  { id: 28, text: 'I am where my feet are.' },
  { id: 29, text: 'I do not perform my life. I live it.' },
  { id: 30, text: 'I let good moments be enough without reaching for the next thing.' },
  { id: 31, text: 'I choose what enters my mind with the same care I choose what enters my body.' },
  { id: 32, text: 'I am the gatekeeper of my own thoughts.' },
  { id: 33, text: 'I do not let a screen decide the direction of my day.' },
  { id: 34, text: 'I starve my distractions and feed my focus.' },
  { id: 35, text: 'I consume less and create more.' },
  { id: 36, text: 'I keep the promises I make to myself.' },
  { id: 37, text: 'I do what I said I would do, especially when no one is watching.' },
  { id: 38, text: 'I show up on the days I don\'t feel like it. Those days count double.' },
  { id: 39, text: 'I am building something in myself that compounds daily.' },
  { id: 40, text: 'I trust small daily actions to do big work in me.' },
  { id: 41, text: 'I make decisions promptly and change them slowly.' },
  { id: 42, text: 'I feel fear and move forward anyway.' },
  { id: 43, text: 'I would rather attempt and fail than sit and wonder.' },
  { id: 44, text: 'I walk toward the things I used to avoid.' },
  { id: 45, text: 'I trust myself to handle whatever today brings.' },
  { id: 46, text: 'I am becoming the man I intend to be, one day at a time.' },
  { id: 47, text: 'I talk to myself like a man I respect.' },
  { id: 48, text: 'I am not my worst moments. I am what I do next.' },
  { id: 49, text: 'My past explains me. It does not define me.' },
  { id: 50, text: 'I carry myself like a man who knows where he is going.' },
  { id: 51, text: 'I treat every setback as tuition and collect the lesson.' },
  { id: 52, text: 'One hard day does not undo my work. I continue.' },
  { id: 53, text: 'I bend without breaking.' },
  { id: 54, text: 'I have survived every hard day I have ever had.' },
  { id: 55, text: 'I finish what I start.' },
  { id: 56, text: 'I am safe to be around. My calm settles the people I love.' },
  { id: 57, text: 'I listen more than I speak.' },
  { id: 58, text: 'I say the loving thing while there is still time to say it.' },
  { id: 59, text: 'I am gentle because I am strong.' },
  { id: 60, text: 'I lead with steadiness, not volume.' },
  { id: 61, text: 'I live by design, not by default.' },
  { id: 62, text: 'I know what I want, and I move toward it every day.' },
  { id: 63, text: 'I do fewer things, with more care.' },
  { id: 64, text: 'My days reflect my priorities, not my impulses.' },
  { id: 65, text: 'I am patient with results because I am faithful to the process.' },
  { id: 66, text: 'I sleep like it matters, because it does.' },
  { id: 67, text: 'I move my body every day, and my mind thanks me for it.' },
  { id: 68, text: 'I eat like a man who plans to be here a long time.' },
  { id: 69, text: 'I have energy because I spend it on purpose.' },
  { id: 70, text: 'I plant good seeds daily and let the harvest take its time.' },
  { id: 71, text: 'I water what I want to grow.' },
  { id: 72, text: 'I believe the best is ahead of me, and I live like it.' },
  { id: 73, text: 'I am comfortable in silence.' },
  { id: 74, text: 'I move slowly enough to hear my own life.' },
  { id: 75, text: 'I end each day with a settled mind and a clean conscience.' },
];

export const TRIADS: Triad[] = [
  { id: 1, name: 'Pace', statementIds: [2, 3, 74] },
  { id: 2, name: 'Doing Hard Things', statementIds: [1, 24, 38] },
  { id: 3, name: 'Guarded Attention', statementIds: [17, 31, 32] },
  { id: 4, name: 'Presence', statementIds: [9, 27, 28] },
  { id: 5, name: 'Clean Inputs', statementIds: [6, 33, 35] },
  { id: 6, name: 'Discipline', statementIds: [18, 19, 20] },
  { id: 7, name: 'Self-Promises', statementIds: [36, 37, 55] },
  { id: 8, name: 'Body & Breath', statementIds: [21, 22, 26] },
  { id: 9, name: 'In Training', statementIds: [23, 25, 39] },
  { id: 10, name: 'Decision', statementIds: [41, 45, 62] },
  { id: 11, name: 'Courage', statementIds: [42, 43, 44] },
  { id: 12, name: 'After a Hard Day', statementIds: [48, 51, 52] },
  { id: 13, name: 'Endurance', statementIds: [40, 53, 54] },
  { id: 14, name: 'Depth', statementIds: [10, 58, 59] },
  { id: 15, name: 'Steadiness With Others', statementIds: [56, 57, 60] },
  { id: 16, name: 'Reliability', statementIds: [4, 5, 8] },
  { id: 17, name: 'Self-Command', statementIds: [12, 30, 34] },
  { id: 18, name: 'Intentional Life', statementIds: [15, 61, 64] },
  { id: 19, name: 'Craft', statementIds: [16, 29, 63] },
  { id: 20, name: 'Vitality', statementIds: [14, 67, 69] },
  { id: 21, name: 'Mind & Rest', statementIds: [7, 66, 68] },
  { id: 22, name: 'Sowing', statementIds: [13, 70, 71] },
  { id: 23, name: 'Becoming', statementIds: [46, 47, 50] },
  { id: 24, name: 'Belief', statementIds: [49, 65, 72] },
  { id: 25, name: 'Clean Conscience', statementIds: [11, 73, 75] },
];

export const DAILY_QUOTES: DailyQuote[] = [
  { day: 1, text: 'Fears are nothing more than states of mind. One\'s state of mind is subject to control and direction.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 15' },
  { day: 2, text: 'Worry is a state of mind based upon fear.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 15' },
  { day: 3, text: 'Worry is a form of sustained fear caused by indecision therefore it is a state of mind which can be controlled.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 15' },
  { day: 4, text: 'Nature has endowed man with absolute control over but one thing, and that is THOUGHT.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 15' },
  { day: 5, text: 'You may control your own mind, you have the power to feed it whatever thought impulses you choose.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 15' },
  { day: 6, text: 'Nature has so built man that he has ABSOLUTE CONTROL over the material which reaches his subconscious mind, through his five senses.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 4' },
  { day: 7, text: 'The subconscious mind will translate into reality a thought driven by FEAR just as readily as it will translate into reality a thought driven by COURAGE, or FAITH.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 3' },
  { day: 8, text: 'It has been shown most convincingly that the fear of disease, even where there is not the slightest cause for fear, often produces the physical symptoms of the disease feared.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 15' },
  { day: 9, text: 'Positive and negative emotions cannot occupy the mind at the same time. One or the other must dominate.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 12' },
  { day: 10, text: 'The subconscious mind is more susceptible to influence by impulses of thought mixed with feeling or emotion.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 12' },
  { day: 11, text: 'You must speak its language, or it will not heed your call. It understands best the language of emotion.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 12' },
  { day: 12, text: 'The subconscious mind functions voluntarily, whether you make any effort to influence it or not.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 12' },
  { day: 13, text: 'NO THOUGHT, whether it be negative or positive, CAN ENTER THE SUBCONSCIOUS MIND WITHOUT THE AID OF THE PRINCIPLE OF AUTO-SUGGESTION.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 4' },
  { day: 14, text: 'The subconscious mind takes any orders given it in a spirit of absolute FAITH, and acts upon those orders.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 4' },
  { day: 15, text: 'FAITH is a state of mind which may be induced, or created, by affirmation or repeated instructions to the subconscious mind.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 3' },
  { day: 16, text: 'Repetition of affirmation of orders to your subconscious mind is the only known method of voluntary development of the emotion of faith.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 3' },
  { day: 17, text: 'The subconscious mind may be voluntarily directed only through habit.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 12' },
  { day: 18, text: 'Taking inventory of mental assets and liabilities, you will discover that your greatest weakness is lack of self-confidence. This handicap can be surmounted, and timidity translated into courage, through the aid of the principle of autosuggestion.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 3' },
  { day: 19, text: 'You can voluntarily hand over to it any plan, desire, or purpose which you wish transformed.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 12' },
  { day: 20, text: 'Everything which man creates, BEGINS in the form of a thought impulse.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 12' },
  { day: 21, text: 'Thoughts are truly things, for the reason that every material thing begins in the form of thought-energy.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 12' },
  { day: 22, text: 'The subconscious mind will not remain idle! If you fail to plant DESIRES in your subconscious mind, it will feed upon the thoughts which reach it as the result of your neglect.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 12' },
  { day: 23, text: 'Perfection will come through practice. It cannot come by merely reading instructions.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 3' },
  { day: 24, text: 'There is a difference between WISHING for a thing and being READY to receive it.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 2' },
  { day: 25, text: 'The most practical of all methods for controlling the mind is the habit of keeping it busy with a definite purpose, backed by a definite plan.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 15' },
  { day: 26, text: 'INDECISION is the seedling of FEAR! Remember this, as you read. Indecision crystalizes into DOUBT, the two blend and become FEAR!', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 15' },
  { day: 27, text: 'LACK OF DECISION was near the head of the list of the 30 major causes of FAILURE.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 8' },
  { day: 28, text: 'We do not worry over conditions, once we have reached a decision to follow a definite line of action.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 15' },
  { day: 29, text: 'There is only one known antidote for these germs; it is the habit of prompt and firm DECISION.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 15' },
  { day: 30, text: 'Every one of them had the habit of REACHING DECISIONS PROMPTLY, and of changing these decisions SLOWLY.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 8' },
  { day: 31, text: 'The value of decisions depends upon the courage required to render them.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 8' },
  { day: 32, text: 'Keep your own counsel, when you begin to put into practice the principles described here, by reaching your own decisions.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 8' },
  { day: 33, text: 'Let one of your first decisions be to KEEP A CLOSED MOUTH AND OPEN EARS AND EYES.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 8' },
  { day: 34, text: 'TELL THE WORLD WHAT YOU INTEND TO DO, BUT FIRST SHOW IT.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 8' },
  { day: 35, text: 'Those who reach DECISIONS promptly and definitely, know what they want, and generally get it.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 8' },
  { day: 36, text: 'Deliberately seek the company of people who influence you to THINK AND ACT FOR YOURSELF.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 15' },
  { day: 37, text: 'Your imaginative faculty may have become weak through inaction. It can be revived and made alert through USE.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 6' },
  { day: 38, text: 'Mind control is the result of self-discipline and habit.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 15' },
  { day: 39, text: 'One of the main weaknesses of mankind is the average man\'s familiarity with the word \'impossible.\' He knows all the rules which will NOT work. He knows all the things which CANNOT be done.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 1' },
  { day: 40, text: 'More than five hundred of the most successful men this country has ever known, told the author their greatest success came just one step beyond the point at which defeat had overtaken them.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 1' },
  { day: 41, text: 'Before success comes in any man\'s life, he is sure to meet with much temporary defeat, and perhaps some failure.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 1' },
  { day: 42, text: 'EVERY FAILURE BRINGS WITH IT THE SEED OF AN EQUIVALENT ADVANTAGE.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 9' },
  { day: 43, text: 'Those who pick themselves up after defeat and keep on trying, arrive.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 9' },
  { day: 44, text: 'There may be no heroic connotation to the word \'persistence,\' but the quality is to the character of man what carbon is to steel.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 9' },
  { day: 45, text: 'Kill the habit of worry, in all its forms, by reaching a general, blanket decision that nothing which life has to offer is worth the price of worry.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 15' },
  { day: 46, text: 'When any negative emotion presents itself in one\'s mind, it can be transmuted into a positive emotion by changing one\'s thoughts.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 11' },
  { day: 47, text: 'Weak desires bring weak results, just as a small amount of fire makes a small amount of heat.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 9' },
  { day: 48, text: 'Will-power and desire, when properly combined, make an irresistible pair.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 9' },
  { day: 49, text: 'The ease with which lack of persistence may be conquered will depend entirely upon the INTENSITY OF ONE\'S DESIRE.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 9' },
  { day: 50, text: 'WITH PERSISTENCE WILL COME SUCCESS.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 9' },
  { day: 51, text: 'Success comes to those who become SUCCESS CONSCIOUS. Failure comes to those who indifferently allow themselves to become FAILURE CONSCIOUS.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 1' },
  { day: 52, text: 'It is a well known fact that one comes, finally, to BELIEVE whatever one repeats to one\'s self, whether the statement be true or false.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 3' },
  { day: 53, text: 'Any impulse of thought which is repeatedly passed on to the subconscious mind is, finally, accepted and acted upon by the subconscious mind.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 3' },
  { day: 54, text: 'A state of mind is something that one assumes. It cannot be purchased, it must be created.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 15' },
  { day: 55, text: 'Our brains become magnetized with the dominating thoughts which we hold in our minds, and, by means with which no man is familiar, these \'magnets\' attract to us the forces, the people, the circumstances of life which harmonize with the nature of our dominating thoughts.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 1' },
  { day: 56, text: 'The state of mind must be BELIEF, not mere hope or wish. Open-mindedness is essential for belief.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 2' },
  { day: 57, text: 'FAITH is the only known antidote for FAILURE!', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 3' },
  { day: 58, text: 'Thoughts are things, and powerful things at that, when they are mixed with definiteness of purpose, persistence, and a BURNING DESIRE.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 1' },
  { day: 59, text: 'THE imagination is literally the workshop wherein are fashioned all plans created by man.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 6' },
  { day: 60, text: 'It has been said that man can create anything which he can imagine.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 6' },
  { day: 61, text: 'DREAMS ARE THE SEEDLINGS OF REALITY.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 2' },
  { day: 62, text: 'A BURNING DESIRE TO BE, AND TO DO is the starting point from which the dreamer must take off.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 2' },
  { day: 63, text: 'Verily, there is nothing, right or wrong, which BELIEF, plus BURNING DESIRE, cannot make real.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 2' },
  { day: 64, text: 'Your scepticism will soon be replaced by belief, and this, in turn, will soon become crystallized into ABSOLUTE FAITH.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 4' },
  { day: 65, text: 'One sound idea is all that one needs to achieve success.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 1' },
  { day: 66, text: 'The world has the habit of making room for the man whose words and actions show that he knows where he is going.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 8' },
  { day: 67, text: 'You either control your mind or it controls you. There is no half-way compromise.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 15' },
  { day: 68, text: 'Man may become the master of himself, and of his environment, because he has the POWER TO INFLUENCE HIS OWN SUBCONSCIOUS MIND…', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 4' },
  { day: 69, text: 'We are the Masters of our Fate, the Captains of our Souls, because we have the power to control our thoughts.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 1' },
  { day: 70, text: 'Your mind is your spiritual estate! Protect and use it with the care to which Divine Royalty is entitled.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 15' },
  { day: 71, text: 'When one is truly ready for a thing, it puts in its appearance.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 1' },
  { day: 72, text: 'You are the master of your own earthly destiny just as surely as you have the power to control your own thoughts.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 15' },
  { day: 73, text: 'THERE ARE NO LIMITATIONS TO THE MIND EXCEPT THOSE WE ACKNOWLEDGE.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 4' },
  { day: 74, text: 'Every great leader, from the dawn of civilization down to the present, was a dreamer.', source: 'Napoleon Hill, Think and Grow Rich (1937), Ch. 2' },
  { day: 75, text: 'I am the Master of my Fate, I am the Captain of my Soul.', source: 'W. E. Henley, as quoted in Think and Grow Rich (1937)' },
];

/** Triad id for each protocol day (index = day - 1). Each triad appears
 *  exactly once per 25-day phase; pairings chosen to echo the day’s quote. */
export const DAY_TRIAD_IDS: number[] = [
  8, 1, 10, 3, 5, 17, 9, 22, 15, 14, 23, 18, 25, 24, 6, 7, 2, 11, 13, 19, 21, 20, 12, 16, 4,
  10, 18, 1, 6, 7, 11, 25, 15, 16, 17, 5, 9, 21, 24, 13, 12, 22, 23, 20, 4, 8, 19, 14, 3, 2,
  23, 6, 7, 5, 3, 24, 22, 18, 19, 11, 13, 2, 14, 9, 21, 15, 17, 10, 12, 25, 1, 16, 20, 8, 4,
];

/** Deterministic quote for a protocol day (1-based); clamps out-of-range
 *  days into the 75-day window so Act II/III surfaces reuse cleanly. */
export function quoteForDay(day: number): DailyQuote {
  const index = Math.min(Math.max(day, 1), DAILY_QUOTES.length) - 1;
  return DAILY_QUOTES[index];
}

/** The day’s three “I am” statements, in triad order. */
export function statementsForDay(day: number): IAmStatement[] {
  const index = Math.min(Math.max(day, 1), DAY_TRIAD_IDS.length) - 1;
  const triad = TRIADS[DAY_TRIAD_IDS[index] - 1];
  return triad.statementIds.map((id) => IAM_STATEMENTS[id - 1]);
}
