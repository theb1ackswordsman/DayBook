const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    type: {
      type: String,
      required: true,
      enum: [
        "post_hug",
        "post_metoo",
        "post_comment",
        "comment_reply",
        "comment_like",
      ],
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Post",
    },
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: "Comment",
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes
// Fast query for unread count & user's notifications chronologically
notificationSchema.index({ recipientId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, createdAt: -1 });

// Deduplication index: prevents duplicate notifications for the same interaction
notificationSchema.index(
  { recipientId: 1, actorId: 1, type: 1, postId: 1, commentId: 1 },
  { unique: true }
);

// Auto-delete notifications older than 60 days
notificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 24 * 60 * 60 }
);

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
