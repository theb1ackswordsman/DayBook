const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    body: {
      type: String,
      required: true,
      maxlength: 1000,
      trim: true,
    },
    mood: {
      type: String,
      enum: ["🙂", "😌", "😔", "😡", "🌱", "✨"],
    },
    editedAt: {
      type: Date,
      default: null,
    },
    hugCount: { type: Number, default: 0 },
    meTooCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    reportCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Feed: newest first
postSchema.index({ createdAt: -1 });
// User's posts
postSchema.index({ authorId: 1, createdAt: -1 });

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
