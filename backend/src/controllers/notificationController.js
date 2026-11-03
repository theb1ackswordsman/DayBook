const Notification = require("../models/notificationModel");
const Post = require("../models/postModel");
const Comment = require("../models/commentModel");
const User = require("../models/userModel");
const { serializeNotification } = require("../utils/serializers");
const mongoose = require("mongoose");

/**
 * GET /notifications — Cursor-paginated notifications, newest first
 */
const getNotifications = async (req, res) => {
  const loggedUser = req.user;
  const { cursor, cursorId } = req.query;
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);

  try {
    const filter = { recipientId: loggedUser._id };

    if (cursor && cursorId) {
      const cursorDate = new Date(cursor);
      if (!isNaN(cursorDate.getTime()) && mongoose.Types.ObjectId.isValid(cursorId)) {
        filter.$or = [
          { createdAt: { $lt: cursorDate } },
          {
            createdAt: cursorDate,
            _id: { $lt: new mongoose.Types.ObjectId(cursorId) },
          },
        ];
      }
    }

    // Fetch extra to detect hasMore
    const notifs = await Notification.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit * 2); // fetch extra to account for any skipped deleted targets

    // Batch-lookup referenced posts, comments, and actors
    const postIds = [...new Set(notifs.map((n) => n.postId.toString()))];
    const commentIds = [
      ...new Set(
        notifs.filter((n) => n.commentId).map((n) => n.commentId.toString())
      ),
    ];
    const actorIds = [...new Set(notifs.map((n) => n.actorId.toString()))];

    const [posts, comments, actors] = await Promise.all([
      Post.find({ _id: { $in: postIds } }),
      Comment.find({ _id: { $in: commentIds } }),
      User.find({ _id: { $in: actorIds } }),
    ]);

    const postMap = new Map(posts.map((p) => [p._id.toString(), p]));
    const commentMap = new Map(comments.map((c) => [c._id.toString(), c]));
    const actorMap = new Map(actors.map((a) => [a._id.toString(), a]));

    const validNotifs = [];
    for (const n of notifs) {
      const post = postMap.get(n.postId.toString());
      if (!post) continue; // Post no longer exists

      if (n.commentId && !commentMap.has(n.commentId.toString())) {
        continue; // Comment no longer exists
      }

      const actor = actorMap.get(n.actorId.toString());
      validNotifs.push({
        raw: n,
        serialized: serializeNotification(n, actor, post),
      });

      if (validNotifs.length === limit) {
        break;
      }
    }

    const hasMore = notifs.length > limit;
    let nextCursor = null;
    let nextCursorId = null;
    if (validNotifs.length > 0) {
      const last = validNotifs[validNotifs.length - 1].raw;
      nextCursor = last.createdAt.toISOString();
      nextCursorId = last._id.toString();
    }

    res.status(200).json({
      data: validNotifs.map((v) => v.serialized),
      pagination: {
        hasMore,
        nextCursor,
        nextCursorId,
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

/**
 * GET /notifications/unread-count — Lightweight count of unread notifications
 */
const getUnreadCount = async (req, res) => {
  const loggedUser = req.user;

  try {
    const unreadCount = await Notification.countDocuments({
      recipientId: loggedUser._id,
      read: false,
    });

    res.status(200).json({ unreadCount });
  } catch (error) {
    console.error("Error counting unread notifications:", error);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

/**
 * PATCH /notifications/:id/read — Mark single notification as read
 */
const markAsRead = async (req, res) => {
  const loggedUser = req.user;
  const notifId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(notifId)) {
    return res.status(400).json({ message: "Invalid notification ID." });
  }

  try {
    const notification = await Notification.findById(notifId);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found." });
    }

    if (notification.recipientId.toString() !== loggedUser._id.toString()) {
      return res.status(403).json({ message: "Unauthorized." });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({ message: "Marked as read." });
  } catch (error) {
    console.error("Error marking notification read:", error);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

/**
 * POST /notifications/read-all — Mark all notifications as read
 */
const markAllAsRead = async (req, res) => {
  const loggedUser = req.user;

  try {
    await Notification.updateMany(
      { recipientId: loggedUser._id, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({ message: "All notifications marked as read." });
  } catch (error) {
    console.error("Error marking all notifications read:", error);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
