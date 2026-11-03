const Notification = require("../models/notificationModel");

/**
 * Safely create a notification if actor is not recipient.
 * Deduplicates via upsert with $setOnInsert so already-read notifications stay read.
 * Never throws an error that could fail the parent operation.
 */
const createNotification = async ({
  recipientId,
  actorId,
  type,
  postId,
  commentId = null,
}) => {
  if (!recipientId || !actorId) return null;
  // Never notify yourself
  if (recipientId.toString() === actorId.toString()) return null;

  try {
    await Notification.updateOne(
      {
        recipientId,
        actorId,
        type,
        postId,
        commentId: commentId || null,
      },
      {
        $setOnInsert: {
          recipientId,
          actorId,
          type,
          postId,
          commentId: commentId || null,
          read: false,
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );
  } catch (error) {
    // Duplicate key or concurrent upsert errors are safely ignored
    if (error.code !== 11000) {
      console.error("Error creating notification (non-fatal):", error);
    }
  }
};

/**
 * Remove an unread notification when an action is reverted (e.g. unhug, unlike).
 * Leaves already-read notifications intact.
 */
const removeUnreadNotification = async ({
  recipientId,
  actorId,
  type,
  postId,
  commentId = null,
}) => {
  if (!recipientId || !actorId) return;

  try {
    await Notification.findOneAndDelete({
      recipientId,
      actorId,
      type,
      postId,
      commentId: commentId || null,
      read: false,
    });
  } catch (error) {
    console.error("Error removing unread notification (non-fatal):", error);
  }
};

module.exports = {
  createNotification,
  removeUnreadNotification,
};
