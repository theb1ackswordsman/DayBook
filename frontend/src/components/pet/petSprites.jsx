import React from "react";

/**
 * All pet sprites are original SVG art created for this project.
 * No third-party assets used. See ASSETS.md.
 *
 * Each sprite accepts: pose ("idle" | "walk" | "sleep" | "hop" | "celebrate" | "sit")
 * and a color override. Default size is 48x48.
 */

const CatSprite = ({ pose = "idle", size = 48, className = "" }) => {
  const earTwitch = pose === "idle" || pose === "sit";
  const isSleeping = pose === "sleep";
  const isHopping = pose === "hop" || pose === "celebrate";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Body */}
      <ellipse cx="24" cy="32" rx="12" ry="9" fill="#6B7280" />
      {/* Head */}
      <circle cx="24" cy="20" r="9" fill="#9CA3AF" />
      {/* Left ear */}
      <polygon
        points="17,14 14,6 20,12"
        fill="#9CA3AF"
        stroke="#6B7280"
        strokeWidth="0.5"
        className={earTwitch ? "animate-[petEarTwitch_3s_ease-in-out_infinite]" : ""}
        style={{ transformOrigin: "17px 14px" }}
      />
      {/* Right ear */}
      <polygon
        points="31,14 34,6 28,12"
        fill="#9CA3AF"
        stroke="#6B7280"
        strokeWidth="0.5"
        className={earTwitch ? "animate-[petEarTwitch_3s_ease-in-out_infinite_0.5s]" : ""}
        style={{ transformOrigin: "31px 14px" }}
      />
      {/* Inner ears */}
      <polygon points="17,13 15.5,8 19,12" fill="#F9A8D4" />
      <polygon points="31,13 32.5,8 29,12" fill="#F9A8D4" />
      {/* Eyes */}
      {isSleeping ? (
        <>
          <line x1="20" y1="19" x2="22" y2="19" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="26" y1="19" x2="28" y2="19" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="21" cy="19" r="1.5" fill="#374151" />
          <circle cx="27" cy="19" r="1.5" fill="#374151" />
          <circle cx="21.5" cy="18.5" r="0.5" fill="white" />
          <circle cx="27.5" cy="18.5" r="0.5" fill="white" />
        </>
      )}
      {/* Nose */}
      <ellipse cx="24" cy="22" rx="1" ry="0.7" fill="#F9A8D4" />
      {/* Mouth */}
      <path d="M23 23 Q24 24.5 25 23" stroke="#374151" strokeWidth="0.5" fill="none" />
      {/* Whiskers */}
      <line x1="15" y1="21" x2="20" y2="21" stroke="#D1D5DB" strokeWidth="0.4" />
      <line x1="15" y1="23" x2="20" y2="22.5" stroke="#D1D5DB" strokeWidth="0.4" />
      <line x1="28" y1="21" x2="33" y2="21" stroke="#D1D5DB" strokeWidth="0.4" />
      <line x1="28" y1="22.5" x2="33" y2="23" stroke="#D1D5DB" strokeWidth="0.4" />
      {/* Tail */}
      <path
        d="M36 32 Q40 26 38 20"
        stroke="#6B7280"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        className={pose === "walk" ? "animate-[petTailWag_0.6s_ease-in-out_infinite]" : ""}
        style={{ transformOrigin: "36px 32px" }}
      />
      {/* Legs */}
      <rect x="16" y="38" width="3" height="5" rx="1.5" fill="#6B7280" />
      <rect x="22" y="38" width="3" height="5" rx="1.5" fill="#6B7280" />
      <rect x="29" y="38" width="3" height="5" rx="1.5" fill="#6B7280" />
      {/* Sleep Zzz */}
      {isSleeping && (
        <text
          x="34"
          y="14"
          fontSize="8"
          fill="var(--text-muted)"
          fontWeight="bold"
          className="animate-[petZzz_2s_ease-in-out_infinite]"
        >
          z
        </text>
      )}
    </svg>
  );
};

const DogSprite = ({ pose = "idle", size = 48, className = "" }) => {
  const isSleeping = pose === "sleep";
  const tailWag = pose === "idle" || pose === "walk" || pose === "celebrate";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Body */}
      <ellipse cx="24" cy="32" rx="13" ry="9" fill="#D4A574" />
      {/* Head */}
      <circle cx="24" cy="20" r="9" fill="#E8C9A0" />
      {/* Floppy ears */}
      <ellipse cx="15" cy="20" rx="3.5" ry="6" fill="#C4956A" />
      <ellipse cx="33" cy="20" rx="3.5" ry="6" fill="#C4956A" />
      {/* Eyes */}
      {isSleeping ? (
        <>
          <line x1="20" y1="19" x2="22.5" y2="19" stroke="#5D4037" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="25.5" y1="19" x2="28" y2="19" stroke="#5D4037" strokeWidth="1.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="21" cy="19" r="2" fill="white" />
          <circle cx="27" cy="19" r="2" fill="white" />
          <circle cx="21.5" cy="19" r="1.2" fill="#5D4037" />
          <circle cx="27.5" cy="19" r="1.2" fill="#5D4037" />
          <circle cx="22" cy="18.3" r="0.5" fill="white" />
          <circle cx="28" cy="18.3" r="0.5" fill="white" />
        </>
      )}
      {/* Nose */}
      <ellipse cx="24" cy="22.5" rx="2" ry="1.3" fill="#5D4037" />
      {/* Mouth */}
      <path d="M22 24 Q24 26 26 24" stroke="#5D4037" strokeWidth="0.6" fill="none" />
      {/* Tongue (when happy) */}
      {(pose === "celebrate" || pose === "hop") && (
        <ellipse cx="24" cy="26" rx="1.5" ry="2" fill="#F9A8D4" />
      )}
      {/* Tail */}
      <path
        d="M37 30 Q42 24 40 18"
        stroke="#C4956A"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        className={tailWag ? "animate-[petTailWag_0.4s_ease-in-out_infinite]" : ""}
        style={{ transformOrigin: "37px 30px" }}
      />
      {/* Legs */}
      <rect x="15" y="38" width="3.5" height="5" rx="1.5" fill="#D4A574" />
      <rect x="21" y="38" width="3.5" height="5" rx="1.5" fill="#D4A574" />
      <rect x="27" y="38" width="3.5" height="5" rx="1.5" fill="#D4A574" />
      {/* Sleep Zzz */}
      {isSleeping && (
        <text
          x="34"
          y="14"
          fontSize="8"
          fill="var(--text-muted)"
          fontWeight="bold"
          className="animate-[petZzz_2s_ease-in-out_infinite]"
        >
          z
        </text>
      )}
    </svg>
  );
};

const FoxSprite = ({ pose = "idle", size = 48, className = "" }) => {
  const isSleeping = pose === "sleep";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Body */}
      <ellipse cx="24" cy="32" rx="12" ry="9" fill="#EA580C" />
      {/* Head */}
      <circle cx="24" cy="20" r="9" fill="#F97316" />
      {/* Pointy ears */}
      <polygon points="16,14 12,4 20,11" fill="#F97316" />
      <polygon points="32,14 36,4 28,11" fill="#F97316" />
      {/* Inner ears */}
      <polygon points="16,13 13.5,7 19,11" fill="#1F2937" />
      <polygon points="32,13 34.5,7 29,11" fill="#1F2937" />
      {/* White face marking */}
      <ellipse cx="24" cy="23" rx="5" ry="4" fill="#FED7AA" />
      {/* Eyes */}
      {isSleeping ? (
        <>
          <line x1="20" y1="18.5" x2="22" y2="18.5" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="26" y1="18.5" x2="28" y2="18.5" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <ellipse cx="21" cy="18" rx="1.2" ry="1.5" fill="#1F2937" />
          <ellipse cx="27" cy="18" rx="1.2" ry="1.5" fill="#1F2937" />
          <circle cx="21.5" cy="17.5" r="0.5" fill="white" />
          <circle cx="27.5" cy="17.5" r="0.5" fill="white" />
        </>
      )}
      {/* Nose */}
      <circle cx="24" cy="21" r="1" fill="#1F2937" />
      {/* Bushy tail */}
      <path
        d="M36 32 Q42 26 40 18 Q38 22 36 24"
        fill="#EA580C"
        stroke="#F97316"
        strokeWidth="0.5"
        className={pose === "walk" ? "animate-[petTailWag_0.8s_ease-in-out_infinite]" : ""}
        style={{ transformOrigin: "36px 32px" }}
      />
      {/* White tail tip */}
      <circle cx="40" cy="19" r="2" fill="white" />
      {/* Legs */}
      <rect x="16" y="38" width="3" height="5" rx="1.5" fill="#EA580C" />
      <rect x="22" y="38" width="3" height="5" rx="1.5" fill="#EA580C" />
      <rect x="29" y="38" width="3" height="5" rx="1.5" fill="#EA580C" />
      {/* Paws (dark) */}
      <rect x="16" y="41" width="3" height="2" rx="1" fill="#1F2937" />
      <rect x="22" y="41" width="3" height="2" rx="1" fill="#1F2937" />
      <rect x="29" y="41" width="3" height="2" rx="1" fill="#1F2937" />
      {/* Sleep Zzz */}
      {isSleeping && (
        <text
          x="34"
          y="14"
          fontSize="8"
          fill="var(--text-muted)"
          fontWeight="bold"
          className="animate-[petZzz_2s_ease-in-out_infinite]"
        >
          z
        </text>
      )}
    </svg>
  );
};

const DuckSprite = ({ pose = "idle", size = 48, className = "" }) => {
  const isSleeping = pose === "sleep";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Body */}
      <ellipse cx="24" cy="34" rx="11" ry="8" fill="#FCD34D" />
      {/* Wing */}
      <ellipse
        cx="30"
        cy="32"
        rx="5"
        ry="6"
        fill="#FBBF24"
        className={pose === "celebrate" ? "animate-[petWingFlap_0.3s_ease-in-out_infinite]" : ""}
        style={{ transformOrigin: "30px 28px" }}
      />
      {/* Head */}
      <circle cx="24" cy="20" r="8" fill="#FCD34D" />
      {/* Eyes */}
      {isSleeping ? (
        <>
          <line x1="21" y1="19" x2="23" y2="19" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="25" y1="19" x2="27" y2="19" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="21.5" cy="18.5" r="1.5" fill="#1F2937" />
          <circle cx="26.5" cy="18.5" r="1.5" fill="#1F2937" />
          <circle cx="22" cy="18" r="0.5" fill="white" />
          <circle cx="27" cy="18" r="0.5" fill="white" />
        </>
      )}
      {/* Beak */}
      <ellipse cx="24" cy="23" rx="3.5" ry="1.8" fill="#F97316" />
      {/* Feet */}
      <ellipse cx="20" cy="42" rx="3" ry="1.5" fill="#F97316" />
      <ellipse cx="28" cy="42" rx="3" ry="1.5" fill="#F97316" />
      {/* Tail feathers */}
      <path d="M13 32 Q10 28 12 24" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M12 34 Q9 30 11 26" stroke="#FCD34D" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Sleep Zzz */}
      {isSleeping && (
        <text
          x="32"
          y="14"
          fontSize="8"
          fill="var(--text-muted)"
          fontWeight="bold"
          className="animate-[petZzz_2s_ease-in-out_infinite]"
        >
          z
        </text>
      )}
    </svg>
  );
};

// Map for lookup
export const PET_SPRITES = {
  cat: CatSprite,
  dog: DogSprite,
  fox: FoxSprite,
  duck: DuckSprite,
};

export const PET_TYPES = ["cat", "dog", "fox", "duck"];

export const PET_LABELS = {
  cat: "Cat",
  dog: "Dog",
  fox: "Fox",
  duck: "Duck",
};

export { CatSprite, DogSprite, FoxSprite, DuckSprite };
