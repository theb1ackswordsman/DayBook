const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
      maxlength: 50,
    },
    lastName: {
      type: String,
      maxlength: 50,
    },
    password: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      maxlength: 50,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      maxlength: 60,
      default: "",
      trim: true,
    },
    bio: {
      type: String,
      maxlength: 300,
      default: "",
      trim: true,
    },
    vibes: {
      type: [String],
      default: [],
    },
    coverPreset: {
      type: String,
      default: "gradient-twilight",
    },
    avatarPreset: {
      type: String,
      default: "initials",
    },
    ownedPets: {
      type: [
        {
          type: { type: String, enum: ["cat", "dog", "fox", "duck"], required: true },
          name: { type: String, maxlength: 20, required: true },
        },
      ],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 3;
        },
        message: "You can have at most 3 pets.",
      },
    },
    activePetIndex: {
      type: Number,
      default: 0,
      min: 0,
      max: 2,
    },
    petsHidden: {
      type: Boolean,
      default: false,
    },
    playgroundTime: {
      type: mongoose.Schema.Types.Mixed,
      default: "auto",
      validate: {
        validator: function (val) {
          if (val === "auto") return true;
          const num = Number(val);
          return Number.isInteger(num) && num >= 0 && num <= 1439;
        },
        message: 'playgroundTime must be "auto" or an integer between 0 and 1439.',
      },
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
