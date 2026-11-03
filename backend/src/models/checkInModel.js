const mongoose = require("mongoose");

/**
 * CheckIn Model
 * Stores only aggregated scores and bands.
 * Individual assessment answers are NEVER persisted to maintain privacy.
 */
const checkInSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["who5", "mini_ipip"],
      required: true,
      default: "who5",
    },
    rawScore: {
      type: Number,
      min: 0,
      max: 25,
      required: function () {
        return this.type === "who5";
      },
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      required: function () {
        return this.type === "who5";
      },
    },
    band: {
      type: String,
      required: function () {
        return this.type === "who5";
      },
    },
    flaggedLow: {
      type: Boolean,
      default: false,
    },
    traits: {
      extraversion: { type: Number, min: 4, max: 20 },
      agreeableness: { type: Number, min: 4, max: 20 },
      conscientiousness: { type: Number, min: 4, max: 20 },
      neuroticism: { type: Number, min: 4, max: 20 },
      openness: { type: Number, min: 4, max: 20 },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

checkInSchema.index({ userId: 1, createdAt: -1 });
checkInSchema.index({ userId: 1, type: 1, createdAt: -1 });

const CheckIn = mongoose.model("CheckIn", checkInSchema);

module.exports = CheckIn;
