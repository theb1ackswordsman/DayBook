/**
 * Crisis keyword detection for the soft safety banner.
 * These keywords trigger a gentle, non-blocking banner with help resources.
 * NEVER block posting, NEVER shame, NEVER auto-report.
 *
 * Keep this list focused on clear self-harm language.
 * False positives are acceptable — the banner is gentle.
 */
const CRISIS_KEYWORDS = [
  "kill myself",
  "want to die",
  "end my life",
  "suicide",
  "suicidal",
  "self-harm",
  "self harm",
  "hurt myself",
  "cutting myself",
  "don't want to live",
  "dont want to live",
  "no reason to live",
  "better off dead",
  "can't go on",
  "cant go on",
  "end it all",
  "not worth living",
  "overdose",
];

/**
 * Check if text contains any crisis keywords.
 * Case-insensitive, checks for substring matches.
 */
export const containsCrisisLanguage = (text) => {
  if (!text) return false;
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some((keyword) => lower.includes(keyword));
};

export default CRISIS_KEYWORDS;
