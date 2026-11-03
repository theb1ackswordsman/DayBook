const User = require("../models/userModel");

const ALLOWED_VIBES = [
  "Gentle",
  "Mindful",
  "Creative",
  "Quiet",
  "Healing",
  "Curious",
  "Grounded",
  "Reflective",
  "Hopeful",
  "Introvert",
  "Resilient",
  "Empathetic",
];

const ALLOWED_COVERS = [
  "gradient-twilight",
  "gradient-sunset",
  "gradient-ocean",
  "gradient-forest",
  "gradient-dawn",
  "solid-charcoal",
];

const ALLOWED_AVATARS = [
  "initials",
  "lotus",
  "sprout",
  "sparkles",
  "moon",
  "sun",
  "wave",
  "mountain",
  "cat",
];

// Helper to strip HTML tags ensuring plain text storage
const toPlainText = (str) => {
  if (typeof str !== "string") return "";
  return str.replace(/<[^>]*>?/gm, "").trim();
};

const viewProfile = (req, res) => {
  const user = req.user;
  res.status(200).json({
    message: "Profile fetch successfully!",
    data: {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName || user.firstName,
      status: user.status || "",
      bio: user.bio || "",
      vibes: user.vibes || [],
      coverPreset: user.coverPreset || "gradient-twilight",
      avatarPreset: user.avatarPreset || "initials",
      ownedPets: user.ownedPets || [],
      activePetIndex: user.activePetIndex || 0,
      petsHidden: user.petsHidden || false,
      playgroundTime: user.playgroundTime !== undefined ? user.playgroundTime : "auto",
      createdAt: user.createdAt,
    },
  });
};

const patchProfile = async (req, res) => {
  const loggedUserId = req.user._id;
  const {
    firstName,
    lastName,
    displayName,
    status,
    bio,
    vibes,
    coverPreset,
    avatarPreset,
  } = req.body;

  const updates = {};

  if (firstName !== undefined) {
    const cleanFirstName = toPlainText(firstName);
    if (!cleanFirstName) {
      return res.status(422).json({ message: "First name cannot be empty." });
    }
    if (cleanFirstName.length > 50) {
      return res.status(422).json({ message: "First name must be under 50 characters." });
    }
    updates.firstName = cleanFirstName;
  }

  if (lastName !== undefined) {
    const cleanLastName = toPlainText(lastName);
    if (cleanLastName.length > 50) {
      return res.status(422).json({ message: "Last name must be under 50 characters." });
    }
    updates.lastName = cleanLastName;
  }

  if (displayName !== undefined) {
    const cleanDisplayName = toPlainText(displayName);
    if (cleanDisplayName.length > 50) {
      return res.status(422).json({ message: "Display name must be under 50 characters." });
    }
    updates.displayName = cleanDisplayName;
  }

  if (status !== undefined) {
    const cleanStatus = toPlainText(status);
    if (cleanStatus.length > 60) {
      return res.status(422).json({ message: "Status must be under 60 characters." });
    }
    updates.status = cleanStatus;
  }

  if (bio !== undefined) {
    const cleanBio = toPlainText(bio);
    if (cleanBio.length > 300) {
      return res.status(422).json({ message: "Bio must be under 300 characters." });
    }
    updates.bio = cleanBio;
  }

  if (vibes !== undefined) {
    if (!Array.isArray(vibes)) {
      return res.status(422).json({ message: "Vibes must be an array." });
    }
    if (vibes.length > 5) {
      return res.status(422).json({ message: "You can select up to 5 vibes." });
    }
    const cleanVibes = vibes
      .map(toPlainText)
      .filter((v) => ALLOWED_VIBES.includes(v));
    updates.vibes = cleanVibes;
  }

  if (coverPreset !== undefined) {
    if (!ALLOWED_COVERS.includes(coverPreset)) {
      return res.status(422).json({ message: "Invalid cover preset." });
    }
    updates.coverPreset = coverPreset;
  }

  if (avatarPreset !== undefined) {
    if (!ALLOWED_AVATARS.includes(avatarPreset)) {
      return res.status(422).json({ message: "Invalid avatar preset." });
    }
    updates.avatarPreset = avatarPreset;
  }

  const ALLOWED_PET_TYPES = ["cat", "dog", "fox", "duck"];

  if (req.body.ownedPets !== undefined) {
    const { ownedPets } = req.body;
    if (!Array.isArray(ownedPets)) {
      return res.status(422).json({ message: "ownedPets must be an array." });
    }
    if (ownedPets.length > 3) {
      return res.status(422).json({ message: "You can have at most 3 pets." });
    }
    const cleanPets = [];
    for (const pet of ownedPets) {
      if (!pet || typeof pet !== "object") {
        return res.status(422).json({ message: "Each pet must be an object." });
      }
      if (!ALLOWED_PET_TYPES.includes(pet.type)) {
        return res.status(422).json({ message: `Invalid pet type: ${pet.type}` });
      }
      const cleanName = toPlainText(pet.name);
      if (!cleanName) {
        return res.status(422).json({ message: "Pet name cannot be empty." });
      }
      if (cleanName.length > 20) {
        return res.status(422).json({ message: "Pet name must be under 20 characters." });
      }
      cleanPets.push({ type: pet.type, name: cleanName });
    }
    updates.ownedPets = cleanPets;
  }

  if (req.body.activePetIndex !== undefined) {
    const idx = parseInt(req.body.activePetIndex, 10);
    if (isNaN(idx) || idx < 0 || idx > 2) {
      return res.status(422).json({ message: "activePetIndex must be between 0 and 2." });
    }
    updates.activePetIndex = idx;
  }

  if (req.body.petsHidden !== undefined) {
    if (typeof req.body.petsHidden !== "boolean") {
      return res.status(422).json({ message: "petsHidden must be a boolean." });
    }
    updates.petsHidden = req.body.petsHidden;
  }

  if (req.body.playgroundTime !== undefined) {
    const pt = req.body.playgroundTime;
    if (pt === "auto") {
      updates.playgroundTime = "auto";
    } else {
      const num = parseInt(pt, 10);
      if (isNaN(num) || num < 0 || num > 1439) {
        return res.status(422).json({
          message: 'playgroundTime must be "auto" or an integer between 0 and 1439.',
        });
      }
      updates.playgroundTime = num;
    }
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(loggedUserId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      message: "Profile updated successfully!",
      data: {
        _id: updatedUser._id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        displayName: updatedUser.displayName || updatedUser.firstName,
        status: updatedUser.status || "",
        bio: updatedUser.bio || "",
        vibes: updatedUser.vibes || [],
        coverPreset: updatedUser.coverPreset,
        avatarPreset: updatedUser.avatarPreset,
        ownedPets: updatedUser.ownedPets || [],
        activePetIndex: updatedUser.activePetIndex || 0,
        petsHidden: updatedUser.petsHidden || false,
        playgroundTime: updatedUser.playgroundTime !== undefined ? updatedUser.playgroundTime : "auto",
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Something went wrong! Please try again later." });
  }
};

const updateProfile = patchProfile;

module.exports = { viewProfile, updateProfile, patchProfile };
