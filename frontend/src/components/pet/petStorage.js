/**
 * Pet persistence layer — localStorage first, then sync to backend.
 * Keys: daybook_pets, daybook_pet_active, daybook_pet_hidden, daybook_pet_onboarded
 */

const STORAGE_KEYS = {
  PETS: "daybook_pets",
  ACTIVE: "daybook_pet_active",
  HIDDEN: "daybook_pet_hidden",
  ONBOARDED: "daybook_pet_onboarded",
};

/** @typedef {{ type: string, name: string }} Pet */

/**
 * Get all pets from localStorage.
 * @returns {Pet[]}
 */
export function getStoredPets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PETS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, 3) : [];
  } catch {
    return [];
  }
}

/**
 * Save pets to localStorage.
 * @param {Pet[]} pets
 */
export function setStoredPets(pets) {
  localStorage.setItem(STORAGE_KEYS.PETS, JSON.stringify(pets.slice(0, 3)));
}

/** Get index of active (shown) pet */
export function getActiveIndex() {
  const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE);
  const idx = parseInt(raw, 10);
  return Number.isNaN(idx) ? 0 : idx;
}

/** Set active pet index */
export function setActiveIndex(idx) {
  localStorage.setItem(STORAGE_KEYS.ACTIVE, String(idx));
}

/** Whether pets are hidden via toggle */
export function isPetHidden() {
  return localStorage.getItem(STORAGE_KEYS.HIDDEN) === "true";
}

/** Set hide toggle */
export function setPetHidden(hidden) {
  localStorage.setItem(STORAGE_KEYS.HIDDEN, hidden ? "true" : "false");
}

/** Whether onboarding has been completed or skipped */
export function isOnboarded() {
  return localStorage.getItem(STORAGE_KEYS.ONBOARDED) === "true";
}

/** Mark onboarding as done */
export function setOnboarded() {
  localStorage.setItem(STORAGE_KEYS.ONBOARDED, "true");
}

/** Add a pet (max 3) */
export function addPet(type, name) {
  const pets = getStoredPets();
  if (pets.length >= 3) return pets;
  const cleanName = sanitizePetName(name);
  const updated = [...pets, { type, name: cleanName }];
  setStoredPets(updated);
  setActiveIndex(updated.length - 1);
  return updated;
}

/** Remove a pet by index */
export function removePet(index) {
  const pets = getStoredPets();
  if (index < 0 || index >= pets.length) return pets;
  const updated = pets.filter((_, i) => i !== index);
  setStoredPets(updated);
  const active = getActiveIndex();
  if (active >= updated.length) {
    setActiveIndex(Math.max(0, updated.length - 1));
  }
  return updated;
}

/** Rename a pet */
export function renamePet(index, newName) {
  const pets = getStoredPets();
  if (index < 0 || index >= pets.length) return pets;
  const updated = [...pets];
  updated[index] = { ...updated[index], name: sanitizePetName(newName) };
  setStoredPets(updated);
  return updated;
}

/** Strip HTML, trim, enforce max 20 chars */
export function sanitizePetName(name) {
  if (typeof name !== "string") return "Buddy";
  const clean = name.replace(/<[^>]*>?/gm, "").trim();
  return clean.slice(0, 20) || "Buddy";
}
