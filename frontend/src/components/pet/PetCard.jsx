import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import { PET_SPRITES, PET_TYPES, PET_LABELS } from "./petSprites";
import { usePetAnimation } from "../../hooks/usePetAnimation";
import {
  getStoredPets,
  setStoredPets,
  getActiveIndex,
  setActiveIndex,
  isPetHidden,
  setPetHidden,
  addPet,
  removePet,
  renamePet,
  sanitizePetName,
  isOnboarded,
  setOnboarded,
} from "./petStorage";
import { usePatchProfileMutation } from "../../redux/api/usersApiSlice";
import { useGetEntriesQuery, useAddEntryMutation } from "../../redux/api/entriesApiSlice";
import useUnreadNotifications from "../../hooks/useUnreadNotifications";
import "../../components/pet/petAnimations.css";
import {
  FaPaw,
  FaPlus,
  FaTrash,
  FaPen,
  FaChevronLeft,
  FaChevronRight,
  FaEyeSlash,
  FaTimes,
  FaCheck,
  FaLock,
} from "react-icons/fa";

const ONBOARDING_MOODS = [
  { emoji: "🙂", label: "Happy" },
  { emoji: "😌", label: "Calm" },
  { emoji: "😔", label: "Sad" },
  { emoji: "😡", label: "Frustrated" },
  { emoji: "🌱", label: "Hopeful" },
  { emoji: "✨", label: "Grateful" },
];

const PetCard = () => {
  const user = useSelector((state) => state.user);
  const [patchProfile] = usePatchProfileMutation();
  const [addEntry, { isLoading: isSavingFirstEntry }] = useAddEntryMutation();
  const { data: entriesData } = useGetEntriesQuery(undefined, { skip: !user });
  const { unreadCount } = useUnreadNotifications();

  const [pets, setPets] = useState(getStoredPets);
  const [activeIdx, setActiveIdx] = useState(getActiveIndex);
  const [hidden, setHidden] = useState(isPetHidden);
  const [showOnboarding, setShowOnboarding] = useState(!isOnboarded() && pets.length === 0);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [showAddPet, setShowAddPet] = useState(false);
  const [newPetType, setNewPetType] = useState("cat");
  const [newPetName, setNewPetName] = useState("");

  // Onboarding state
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [onboardingType, setOnboardingType] = useState("cat");
  const [onboardingName, setOnboardingName] = useState("");
  const [onboardingMood, setOnboardingMood] = useState("🙂");
  const [onboardingEntryText, setOnboardingEntryText] = useState("");

  const activePet = pets[activeIdx] || null;
  const {
    pose,
    position,
    direction,
    friendlyLine,
    handleInteraction,
    triggerReaction,
  } = usePetAnimation();

  // Track previous unread count to detect notifications -> celebrate
  const prevUnreadRef = useRef(unreadCount);
  useEffect(() => {
    if (unreadCount > prevUnreadRef.current) {
      triggerReaction("celebrate");
    }
    prevUnreadRef.current = unreadCount;
  }, [unreadCount, triggerReaction]);

  // Listen for entry saved event -> hop
  useEffect(() => {
    const handleEntrySaved = () => {
      triggerReaction("hop");
    };
    window.addEventListener("daybook:entry-saved", handleEntrySaved);
    return () => window.removeEventListener("daybook:entry-saved", handleEntrySaved);
  }, [triggerReaction]);

  // Client-side mood check from recent entries -> sit close if sad or frustrated
  useEffect(() => {
    if (entriesData?.data && entriesData.data.length > 0) {
      const latestMood = entriesData.data[0].mood;
      if (latestMood === "😔" || latestMood === "😡") {
        // Sit close when feeling down or frustrated
        triggerReaction("sit");
      }
    }
  }, [entriesData, triggerReaction]);

  // Migrate / Sync with backend on user load
  const hasMigratedRef = useRef(false);
  useEffect(() => {
    if (!user?.data || hasMigratedRef.current) return;
    hasMigratedRef.current = true;

    const serverPets = user.data.ownedPets;
    const serverHidden = user.data.petsHidden;
    const serverActive = user.data.activePetIndex;

    if (serverPets && serverPets.length > 0) {
      // Backend has pets -> load into state and localStorage
      setPets(serverPets);
      setStoredPets(serverPets);
      if (typeof serverActive === "number") {
        setActiveIdx(serverActive);
        setActiveIndex(serverActive);
      }
      if (typeof serverHidden === "boolean") {
        setHidden(serverHidden);
        setPetHidden(serverHidden);
      }
    } else if (pets.length > 0) {
      // Server has no pets, but local has pets -> migrate local to server
      patchProfile({
        ownedPets: pets,
        activePetIndex: activeIdx,
        petsHidden: hidden,
      }).catch(() => {});
    }
  }, [user, pets, activeIdx, hidden, patchProfile]);

  // Helper to persist updates to localStorage and backend
  const persistChanges = useCallback(
    (newPets, newActiveIdx, newHidden) => {
      setStoredPets(newPets);
      setActiveIndex(newActiveIdx);
      setPetHidden(newHidden);

      if (user) {
        patchProfile({
          ownedPets: newPets,
          activePetIndex: newActiveIdx,
          petsHidden: newHidden,
        }).catch(() => {});
      }
    },
    [user, patchProfile]
  );

  const handleToggleHide = useCallback(() => {
    const next = !hidden;
    setHidden(next);
    persistChanges(pets, activeIdx, next);
  }, [hidden, pets, activeIdx, persistChanges]);

  const handleSwitchPet = useCallback(
    (dir) => {
      if (pets.length <= 1) return;
      const next = (activeIdx + dir + pets.length) % pets.length;
      setActiveIdx(next);
      persistChanges(pets, next, hidden);
    },
    [activeIdx, pets, hidden, persistChanges]
  );

  const handleRemovePet = useCallback(() => {
    if (!activePet) return;
    if (!window.confirm(`Remove ${activePet.name}?`)) return;
    const updated = removePet(activeIdx);
    const nextActive = getActiveIndex();
    setPets(updated);
    setActiveIdx(nextActive);
    persistChanges(updated, nextActive, hidden);
  }, [activeIdx, activePet, hidden, persistChanges]);

  const handleStartRename = useCallback(() => {
    if (!activePet) return;
    setNameInput(activePet.name);
    setEditingName(true);
  }, [activePet]);

  const handleSaveRename = useCallback(() => {
    const updated = renamePet(activeIdx, nameInput);
    setPets(updated);
    setEditingName(false);
    persistChanges(updated, activeIdx, hidden);
  }, [activeIdx, nameInput, hidden, persistChanges]);

  const handleAddPet = useCallback(() => {
    if (pets.length >= 3) return;
    const updated = addPet(newPetType, newPetName || "Buddy");
    const nextActive = updated.length - 1;
    setPets(updated);
    setActiveIdx(nextActive);
    setShowAddPet(false);
    setNewPetName("");
    persistChanges(updated, nextActive, hidden);
  }, [pets.length, newPetType, newPetName, hidden, persistChanges]);

  // Onboarding handlers
  const handleFinishOnboarding = useCallback(async () => {
    const name = sanitizePetName(onboardingName || "Buddy");
    const updated = addPet(onboardingType, name);
    setPets(updated);
    setActiveIdx(0);
    setOnboarded();
    setShowOnboarding(false);
    persistChanges(updated, 0, false);

    // If an optional one-line first entry was entered, save it privately
    if (onboardingEntryText.trim()) {
      try {
        await addEntry({
          title: `Reflections with ${name}`,
          content: onboardingEntryText.trim(),
          mood: onboardingMood,
          date: new Date().toISOString().slice(0, 10),
        }).unwrap();
        window.dispatchEvent(new CustomEvent("daybook:entry-saved"));
      } catch (err) {
        console.error("Failed to save first entry:", err);
      }
    }
  }, [
    onboardingType,
    onboardingName,
    onboardingMood,
    onboardingEntryText,
    addEntry,
    persistChanges,
  ]);

  const handleSkipOnboarding = useCallback(() => {
    setOnboarded();
    setShowOnboarding(false);
  }, []);

  const SpriteComponent = activePet ? PET_SPRITES[activePet.type] : null;

  // --- ONBOARDING FLOW (4 Steps) ---
  if (showOnboarding) {
    return (
      <div className="bg-surface border border-border rounded-[24px] p-5 select-none shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FaPaw className="text-primary text-base" />
            <span className="text-sm font-bold text-text">
              Meet your companion
            </span>
          </div>
          <button
            type="button"
            onClick={handleSkipOnboarding}
            className="text-xs text-text-muted hover:text-text font-medium cursor-pointer"
          >
            Skip
          </button>
        </div>

        {/* Step 1: Pick a pet */}
        {onboardingStep === 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-text-muted">
              Choose a companion to keep you company while you reflect.
            </p>
            <div className="grid grid-cols-4 gap-2">
              {PET_TYPES.map((type) => {
                const Sprite = PET_SPRITES[type];
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setOnboardingType(type)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-[16px] border transition-all cursor-pointer ${
                      onboardingType === type
                        ? "border-primary bg-primary-soft"
                        : "border-border hover:border-text-muted/50"
                    }`}
                  >
                    <Sprite size={36} pose="idle" />
                    <span className="text-[10px] font-bold text-text">
                      {PET_LABELS[type]}
                    </span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => setOnboardingStep(1)}
              className="mt-2 px-4 py-2 bg-primary text-white text-xs font-bold rounded-full hover:bg-primary-dark transition-colors cursor-pointer"
            >
              Next: Name pet &rarr;
            </button>
          </div>
        )}

        {/* Step 2: Name it */}
        {onboardingStep === 1 && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-text-muted">
              Give your {PET_LABELS[onboardingType].toLowerCase()} a name (max 20 characters):
            </p>
            <div className="flex items-center gap-3 p-2 bg-surface-raised rounded-[18px]">
              {(() => {
                const Sprite = PET_SPRITES[onboardingType];
                return <Sprite size={36} pose="idle" />;
              })()}
              <input
                type="text"
                value={onboardingName}
                onChange={(e) => setOnboardingName(e.target.value.slice(0, 20))}
                placeholder="Buddy"
                maxLength={20}
                className="flex-1 px-3 py-1.5 bg-surface border border-border rounded-full text-xs text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOnboardingStep(0)}
                className="px-3 py-1.5 text-xs font-bold text-text-muted hover:text-text rounded-full cursor-pointer"
              >
                &larr; Back
              </button>
              <button
                type="button"
                onClick={() => setOnboardingStep(2)}
                className="flex-1 px-4 py-2 bg-primary text-white text-xs font-bold rounded-full hover:bg-primary-dark transition-colors cursor-pointer"
              >
                Next: Check-in &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Mood pick */}
        {onboardingStep === 2 && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-text-muted">
              How are you feeling today?
            </p>
            <div className="grid grid-cols-3 gap-2">
              {ONBOARDING_MOODS.map((m) => (
                <button
                  key={m.emoji}
                  type="button"
                  onClick={() => setOnboardingMood(m.emoji)}
                  className={`flex items-center gap-1.5 p-2 rounded-[14px] border transition-all cursor-pointer text-left ${
                    onboardingMood === m.emoji
                      ? "border-primary bg-primary-soft text-text font-bold"
                      : "border-border hover:border-text-muted/50 text-text-muted"
                  }`}
                >
                  <span className="text-sm">{m.emoji}</span>
                  <span className="text-[11px] truncate">{m.label}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-1">
              <button
                type="button"
                onClick={() => setOnboardingStep(1)}
                className="px-3 py-1.5 text-xs font-bold text-text-muted hover:text-text rounded-full cursor-pointer"
              >
                &larr; Back
              </button>
              <button
                type="button"
                onClick={() => setOnboardingStep(3)}
                className="flex-1 px-4 py-2 bg-primary text-white text-xs font-bold rounded-full hover:bg-primary-dark transition-colors cursor-pointer"
              >
                Next: Optional reflection &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Optional one-line first entry */}
        {onboardingStep === 3 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <FaLock className="text-[10px]" />
              <span>Optional private first reflection:</span>
            </div>
            <textarea
              rows={2}
              value={onboardingEntryText}
              onChange={(e) => setOnboardingEntryText(e.target.value)}
              placeholder="A thought for today... (or leave blank to skip)"
              className="w-full p-2.5 bg-surface-raised border border-border rounded-[16px] text-xs text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary resize-none"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOnboardingStep(2)}
                className="px-3 py-1.5 text-xs font-bold text-text-muted hover:text-text rounded-full cursor-pointer"
              >
                &larr; Back
              </button>
              <button
                type="button"
                disabled={isSavingFirstEntry}
                onClick={handleFinishOnboarding}
                className="flex-1 px-4 py-2 bg-primary text-white text-xs font-bold rounded-full hover:bg-primary-dark transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSavingFirstEntry ? "Saving..." : "Start Journaling ✨"}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- HIDDEN STATE ---
  if (hidden) {
    return (
      <button
        type="button"
        onClick={handleToggleHide}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-surface border border-border rounded-[24px] text-xs font-medium text-text-muted hover:text-text hover:border-text-muted/50 transition-colors cursor-pointer"
        aria-label="Show companion pet"
      >
        <FaPaw className="text-sm" />
        <span>Show companion</span>
      </button>
    );
  }

  // --- NO PETS STATE ---
  if (pets.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-[24px] p-5 text-center">
        <FaPaw className="text-2xl text-text-muted mx-auto mb-2" />
        <p className="text-xs text-text-muted mb-3">
          No companion yet!
        </p>
        <button
          type="button"
          onClick={() => {
            setOnboardingStep(0);
            setShowOnboarding(true);
          }}
          className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-full hover:bg-primary-dark transition-colors cursor-pointer"
        >
          Adopt a pet
        </button>
      </div>
    );
  }

  // --- ADD PET FORM ---
  if (showAddPet) {
    return (
      <div className="bg-surface border border-border rounded-[24px] p-5 select-none shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-text">Add companion ({pets.length}/3)</span>
          <button
            type="button"
            onClick={() => setShowAddPet(false)}
            className="w-7 h-7 rounded-full flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-raised cursor-pointer"
            aria-label="Cancel adding pet"
          >
            <FaTimes className="text-xs" />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {PET_TYPES.map((type) => {
            const Sprite = PET_SPRITES[type];
            return (
              <button
                key={type}
                type="button"
                onClick={() => setNewPetType(type)}
                className={`flex flex-col items-center gap-1 p-2 rounded-[12px] border transition-colors cursor-pointer ${
                  newPetType === type
                    ? "border-primary bg-primary-soft"
                    : "border-border hover:border-text-muted/50"
                }`}
              >
                <Sprite size={28} pose="idle" />
                <span className="text-[9px] font-bold text-text">
                  {PET_LABELS[type]}
                </span>
              </button>
            );
          })}
        </div>
        <input
          type="text"
          value={newPetName}
          onChange={(e) => setNewPetName(e.target.value.slice(0, 20))}
          placeholder="Name your pet"
          maxLength={20}
          className="w-full px-3 py-2 mb-3 bg-surface-raised border border-border rounded-full text-xs text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={handleAddPet}
          className="w-full px-4 py-2 bg-primary text-white text-xs font-bold rounded-full hover:bg-primary-dark transition-colors cursor-pointer"
        >
          Add companion
        </button>
      </div>
    );
  }

  // --- MAIN PET ROOM ---
  return (
    <div className="bg-surface border border-border rounded-[24px] overflow-hidden select-none shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 min-w-0">
          <FaPaw className="text-primary text-sm shrink-0" />
          {editingName ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value.slice(0, 20))}
                maxLength={20}
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleSaveRename()}
                className="w-24 px-2 py-0.5 bg-surface-raised border border-border rounded-full text-xs text-text focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={handleSaveRename}
                className="w-5 h-5 rounded-full flex items-center justify-center text-primary hover:bg-primary-soft cursor-pointer"
                aria-label="Save name"
              >
                <FaCheck className="text-[8px]" />
              </button>
            </div>
          ) : (
            <span className="text-xs font-bold text-text truncate">
              {activePet.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Switch pet arrows */}
          {pets.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => handleSwitchPet(-1)}
                className="w-6 h-6 rounded-full flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-raised cursor-pointer"
                aria-label="Previous pet"
              >
                <FaChevronLeft className="text-[8px]" />
              </button>
              <span className="text-[9px] text-text-muted font-bold">
                {activeIdx + 1}/{pets.length}
              </span>
              <button
                type="button"
                onClick={() => handleSwitchPet(1)}
                className="w-6 h-6 rounded-full flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-raised cursor-pointer"
                aria-label="Next pet"
              >
                <FaChevronRight className="text-[8px]" />
              </button>
            </>
          )}

          {/* Options Dropdown Menu */}
          <div className="relative group">
            <button
              type="button"
              className="w-6 h-6 rounded-full flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-raised cursor-pointer"
              aria-label="Pet options"
            >
              <span className="text-xs">⋯</span>
            </button>
            <div className="absolute right-0 top-full mt-1 bg-surface border border-border rounded-[16px] shadow-lg p-1.5 min-w-[120px] z-10 hidden group-hover:block">
              <button
                type="button"
                onClick={handleStartRename}
                className="w-full text-left px-3 py-1.5 rounded-full text-[10px] font-semibold text-text hover:bg-surface-raised flex items-center gap-2 cursor-pointer"
              >
                <FaPen className="text-[8px]" /> Rename
              </button>
              {pets.length < 3 && (
                <button
                  type="button"
                  onClick={() => setShowAddPet(true)}
                  className="w-full text-left px-3 py-1.5 rounded-full text-[10px] font-semibold text-text hover:bg-surface-raised flex items-center gap-2 cursor-pointer"
                >
                  <FaPlus className="text-[8px]" /> Add pet
                </button>
              )}
              <button
                type="button"
                onClick={handleToggleHide}
                className="w-full text-left px-3 py-1.5 rounded-full text-[10px] font-semibold text-text hover:bg-surface-raised flex items-center gap-2 cursor-pointer"
              >
                <FaEyeSlash className="text-[8px]" /> Hide
              </button>
              <div className="border-t border-border my-1" />
              <button
                type="button"
                onClick={handleRemovePet}
                className="w-full text-left px-3 py-1.5 rounded-full text-[10px] font-semibold text-danger hover:bg-danger/10 flex items-center gap-2 cursor-pointer"
              >
                <FaTrash className="text-[8px]" /> Remove
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pet Room */}
      <div className="pet-room relative h-[130px] mx-3 mb-3 bg-surface-raised/50 rounded-[16px] overflow-hidden">
        {/* Ground line */}
        <div className="absolute bottom-4 left-0 right-0 h-[1px] bg-border/60" />

        {/* Pet interactive button */}
        <button
          type="button"
          onClick={handleInteraction}
          className="absolute bottom-5 transition-all duration-300 ease-out cursor-pointer focus:outline-none"
          style={{
            left: `${position}%`,
            transform: `scaleX(${direction})`,
          }}
          aria-label={`Interact with ${activePet.name}`}
        >
          <div
            className={
              pose === "hop"
                ? "animate-[petBounce_0.6s_ease-out]"
                : pose === "celebrate"
                ? "animate-[petCelebrate_0.8s_ease-in-out_2]"
                : pose === "sit"
                ? "translate-y-1"
                : ""
            }
          >
            {SpriteComponent && <SpriteComponent size={48} pose={pose} />}
          </div>

          {/* Hearts burst on click */}
          {friendlyLine && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-1 pointer-events-none">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="text-sm animate-[petHeartFloat_1s_ease-out_forwards]"
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  💜
                </span>
              ))}
            </div>
          )}
        </button>

        {/* Friendly speech bubble */}
        {friendlyLine && (
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 bg-surface border border-border rounded-full px-3 py-1 text-[10px] font-medium text-text whitespace-nowrap shadow-sm pointer-events-none animate-in fade-in zoom-in-95"
            style={{ maxWidth: "90%" }}
          >
            {friendlyLine}
          </div>
        )}
      </div>
    </div>
  );
};

export default PetCard;
