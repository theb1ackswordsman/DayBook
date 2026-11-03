const mongoose = require("mongoose");

const reactionSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Post",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    type: {
      type: String,
      required: true,
      enum: ["hug", "metoo"],
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

reactionSchema.index({ postId: 1, userId: 1, type: 1 }, { unique: true });
reactionSchema.index({ postId: 1, type: 1 });

const Reaction = mongoose.model("Reaction", reactionSchema);

module.exports = Reaction;
