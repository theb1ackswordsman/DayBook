/**
 * Official WHO-5 Well-Being Index (1998)
 *
 * Citation:
 * World Health Organization Collaborating Centre for Mental Health,
 * Psychiatric Research Unit, Mental Health Centre North Zealand, Hillerød, Denmark.
 *
 * Terms of Use:
 * The WHO-5 is in the public domain and is free to use without permission from the WHO.
 */

export const WHO5_PROMPT =
  "Please indicate for each of the five statements which is closest to how you have been feeling over the last two weeks.";

export const WHO5_ITEMS = [
  {
    id: 1,
    text: "I have felt cheerful and in good spirits",
  },
  {
    id: 2,
    text: "I have felt calm and relaxed",
  },
  {
    id: 3,
    text: "I have felt active and vigorous",
  },
  {
    id: 4,
    text: "I have felt fresh and rested when waking up",
  },
  {
    id: 5,
    text: "My daily life has been filled with things that interest me",
  },
];

export const WHO5_SCALE = [
  { value: 5, label: "All of the time", description: "Constant or continuous" },
  { value: 4, label: "Most of the time", description: "A large part of the time" },
  { value: 3, label: "More than half of the time", description: "Often" },
  { value: 2, label: "Less than half of the time", description: "Occasionally" },
  { value: 1, label: "Some of the time", description: "Rarely" },
  { value: 0, label: "At no time", description: "Not at all" },
];

export const WHO5_CITATION = {
  authors: "World Health Organization Collaborating Centre for Mental Health",
  year: 1998,
  source: "Psychiatric Research Unit, Mental Health Centre North Zealand, Denmark",
  termsNote: "Free, no permission needed (public domain).",
};
