/**
 * Mini-IPIP 20-Item Big Five Personality Assessment
 *
 * Citation:
 * Donnellan, M. B., Oswald, F. L., Baird, B. M., & Lucas, R. E. (2006).
 * The Mini-IPIP Scales: Tiny-yet-effective measures of the Big Five factors of personality.
 * Psychological Assessment, 18(2), 192–203.
 * https://doi.org/10.1037/1040-3590.18.2.192
 *
 * Terms of Use:
 * All items in the International Personality Item Pool (IPIP) are in the public domain.
 * Free for non-commercial and commercial use without permission.
 */

export const MINI_IPIP_PROMPT =
  "Describe yourself as you generally are now, not as you wish to be in the future. Describe yourself as you honestly see yourself, in relation to other people you know of the same sex as you are, and roughly your same age.";

export const MINI_IPIP_SCALE = [
  { value: 1, label: "Very Inaccurate", short: "Very Inaccurate" },
  { value: 2, label: "Moderately Inaccurate", short: "Inaccurate" },
  { value: 3, label: "Neither Inaccurate nor Accurate", short: "Neutral" },
  { value: 4, label: "Moderately Accurate", short: "Accurate" },
  { value: 5, label: "Very Accurate", short: "Very Accurate" },
];

export const MINI_IPIP_ITEMS = [
  { id: 1, text: "Am the life of the party.", trait: "extraversion", reverse: false },
  { id: 2, text: "Sympathize with others' feelings.", trait: "agreeableness", reverse: false },
  { id: 3, text: "Get chores done right away.", trait: "conscientiousness", reverse: false },
  { id: 4, text: "Have frequent mood swings.", trait: "neuroticism", reverse: false },
  { id: 5, text: "Have a vivid imagination.", trait: "openness", reverse: false },
  { id: 6, text: "Don't talk a lot.", trait: "extraversion", reverse: true },
  { id: 7, text: "Am not interested in other people's problems.", trait: "agreeableness", reverse: true },
  { id: 8, text: "Often forget to put things back in their proper place.", trait: "conscientiousness", reverse: true },
  { id: 9, text: "Am relaxed most of the time.", trait: "neuroticism", reverse: true },
  { id: 10, text: "Am not interested in abstract ideas.", trait: "openness", reverse: true },
  { id: 11, text: "Talk to a lot of different people at parties.", trait: "extraversion", reverse: false },
  { id: 12, text: "Feel others' emotions.", trait: "agreeableness", reverse: false },
  { id: 13, text: "Like order.", trait: "conscientiousness", reverse: false },
  { id: 14, text: "Get upset easily.", trait: "neuroticism", reverse: false },
  { id: 15, text: "Have difficulty understanding abstract ideas.", trait: "openness", reverse: true },
  { id: 16, text: "Keep in the background.", trait: "extraversion", reverse: true },
  { id: 17, text: "Am not really interested in others.", trait: "agreeableness", reverse: true },
  { id: 18, text: "Make a mess of things.", trait: "conscientiousness", reverse: true },
  { id: 19, text: "Seldom feel blue.", trait: "neuroticism", reverse: true },
  { id: 20, text: "Do not have a good imagination.", trait: "openness", reverse: true },
];

export const TRAIT_META = {
  extraversion: {
    key: "extraversion",
    name: "Extraversion",
    tagline: "Social energy & engagement",
    color: "#38bdf8", // Sky blue
    bgSoft: "bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300",
    lowDesc: "Tends toward introspective, calm spaces and thoughtful one-on-one connections.",
    midDesc: "Tends toward a balanced rhythm of lively social engagement and quiet personal reflection.",
    highDesc: "Tends toward energized social participation, expressive sharing, and vibrant group settings.",
  },
  agreeableness: {
    key: "agreeableness",
    name: "Agreeableness",
    tagline: "Warmth & empathy",
    color: "#34d399", // Emerald green
    bgSoft: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300",
    lowDesc: "Tends toward direct, candid, and independently minded decision-making.",
    midDesc: "Tends toward cooperative relationships while maintaining healthy personal boundaries.",
    highDesc: "Tends toward deep empathy, thoughtful kindness, and supportive attunement with others.",
  },
  conscientiousness: {
    key: "conscientiousness",
    name: "Conscientiousness",
    tagline: "Organization & persistence",
    color: "#a78bfa", // Purple/lavender
    bgSoft: "bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300",
    lowDesc: "Tends toward flexible, spontaneous rhythms and open-ended exploration.",
    midDesc: "Tends toward adaptable planning, pairing creative improvisation with daily follow-through.",
    highDesc: "Tends toward deliberate structure, organized routines, and steady goal completion.",
  },
  neuroticism: {
    key: "neuroticism",
    name: "Emotional Sensitivity",
    tagline: "Reactivity to stress & nuance",
    color: "#f59e0b", // Amber
    bgSoft: "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300",
    lowDesc: "Tends toward steady calm, steady grounding, and ease through shifting circumstances.",
    midDesc: "Tends toward generally even emotional experiences with occasional situational stress.",
    highDesc: "Tends toward deeply felt emotions, high sensitivity to changes, and reflective awareness.",
  },
  openness: {
    key: "openness",
    name: "Openness to Experience",
    tagline: "Curiosity & imagination",
    color: "#ec4899", // Pink
    bgSoft: "bg-pink-50 dark:bg-pink-950/40 text-pink-800 dark:text-pink-300",
    lowDesc: "Tends toward practical, concrete matters and proven, time-tested habits.",
    midDesc: "Tends toward balancing practical daily tasks with curiosity for new ideas.",
    highDesc: "Tends toward rich imagination, philosophical curiosity, and artistic appreciation.",
  },
};

export const getTraitInterpretation = (traitKey, score) => {
  const meta = TRAIT_META[traitKey];
  if (!meta) return "";
  if (score >= 15) return meta.highDesc;
  if (score <= 9) return meta.lowDesc;
  return meta.midDesc;
};

export const MINI_IPIP_CITATION = {
  authors: "Donnellan, M. B., Oswald, F. L., Baird, B. M., & Lucas, R. E.",
  year: 2006,
  title: "The Mini-IPIP Scales: Tiny-yet-effective measures of the Big Five factors of personality.",
  journal: "Psychological Assessment, 18(2), 192–203",
  doi: "https://doi.org/10.1037/1040-3590.18.2.192",
  termsNote: "International Personality Item Pool (IPIP) items are in the public domain.",
};
