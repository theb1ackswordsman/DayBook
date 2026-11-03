const Post = require("../models/postModel");
const User = require("../models/userModel");
const Report = require("../models/reportModel");
const Reaction = require("../models/reactionModel");
const Comment = require("../models/commentModel");
const CommentLike = require("../models/commentLikeModel");
const Notification = require("../models/notificationModel");
const { createNotification, removeUnreadNotification } = require("../utils/notificationService");
const { serializePost } = require("../utils/serializers");
const mongoose = require("mongoose");

/**
 * POST /posts — Create a public post
 */
const createPost = async (req, res) => {
  const loggedUser = req.user;
  let { body, mood } = req.body;

  if (!body || typeof body !== "string" || !body.trim()) {
    return res.status(422).json({ message: "Post body is required." });
  }

  body = body.trim().slice(0, 1000);

  const validMoods = ["🙂", "😌", "😔", "😡", "🌱", "✨"];
  if (mood && !validMoods.includes(mood)) {
    mood = undefined;
  }

  try {
    const post = await Post.create({
      authorId: loggedUser._id,
      body,
      mood: mood || undefined,
    });

    res.status(201).json({
      message: "Shared successfully!",
      data: serializePost(post, loggedUser, { viewerHasHugged: false, viewerHasMeToo: false }),
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

/**
 * GET /posts — Public feed, cursor-paginated, newest first
 * Query params: ?cursor=<createdAt_ISO>&cursorId=<_id>&limit=20&mood=<emoji>
 */
const getFeed = async (req, res) => {
  const loggedUser = req.user;
  const { cursor, cursorId, mood } = req.query;
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);

  try {
    const filter = {};

    const validMoods = ["🙂", "😌", "😔", "😡", "🌱", "✨"];
    if (mood && validMoods.includes(mood)) {
      filter.mood = mood;
    }

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

    const posts = await Post.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1);

    const hasMore = posts.length > limit;
    const resultPosts = hasMore ? posts.slice(0, limit) : posts;

    // Batch-fetch unique authors
    const authorIds = [...new Set(resultPosts.map((p) => p.authorId.toString()))];
    const authors = await User.find({ _id: { $in: authorIds } });
    const authorMap = {};
    authors.forEach((a) => {
      authorMap[a._id.toString()] = a;
    });

    // Batch-fetch viewer reactions to avoid N+1 queries
    const postIds = resultPosts.map((p) => p._id);
    const viewerReactions = await Reaction.find({
      postId: { $in: postIds },
      userId: loggedUser._id,
    });
    const reactionSet = new Set(
      viewerReactions.map((r) => `${r.postId.toString()}_${r.type}`)
    );

    const serialized = resultPosts.map((p) => {
      const flags = {
        viewerHasHugged: reactionSet.has(`${p._id.toString()}_hug`),
        viewerHasMeToo: reactionSet.has(`${p._id.toString()}_metoo`),
      };
      return serializePost(p, authorMap[p.authorId.toString()], flags);
    });

    let nextCursor = null;
    let nextCursorId = null;
    if (hasMore && resultPosts.length > 0) {
      const last = resultPosts[resultPosts.length - 1];
      nextCursor = last.createdAt.toISOString();
      nextCursorId = last._id.toString();
    }

    res.status(200).json({
      data: serialized,
      pagination: {
        hasMore,
        nextCursor,
        nextCursorId,
      },
    });
  } catch (error) {
    console.error("Error fetching feed:", error);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

/**
 * GET /posts/:id — Get single post with viewer reactions
 */
const getPost = async (req, res) => {
  const loggedUser = req.user;
  const postId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ message: "Invalid post ID." });
  }

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    const author = await User.findById(post.authorId);

    const viewerReactions = await Reaction.find({
      postId,
      userId: loggedUser._id,
    });
    const reactionSet = new Set(viewerReactions.map((r) => r.type));

    const flags = {
      viewerHasHugged: reactionSet.has("hug"),
      viewerHasMeToo: reactionSet.has("metoo"),
    };

    res.status(200).json({
      data: serializePost(post, author, flags),
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

/**
 * PATCH /posts/:id — Update own post
 */
const updatePost = async (req, res) => {
  const loggedUser = req.user;
  const postId = req.params.id;
  let { body, mood } = req.body;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ message: "Invalid post ID." });
  }

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    if (post.authorId.toString() !== loggedUser._id.toString()) {
      return res.status(403).json({ message: "You can only edit your own posts." });
    }

    if (body !== undefined) {
      if (typeof body !== "string" || !body.trim()) {
        return res.status(422).json({ message: "Post body cannot be empty." });
      }
      post.body = body.trim().slice(0, 1000);
    }

    const validMoods = ["🙂", "😌", "😔", "😡", "🌱", "✨"];
    if (mood !== undefined) {
      post.mood = validMoods.includes(mood) ? mood : post.mood;
    }

    post.editedAt = new Date();
    await post.save();

    res.status(200).json({
      message: "Post updated successfully!",
      data: serializePost(post, loggedUser),
    });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

/**
 * DELETE /posts/:id — Delete own post
 * Cascades: reactions, comments, comment likes, and reports
 */
const deletePost = async (req, res) => {
  const loggedUser = req.user;
  const postId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ message: "Invalid post ID." });
  }

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    if (post.authorId.toString() !== loggedUser._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own posts." });
    }

    // Find all comments for this post to clean up likes and reports
    const comments = await Comment.find({ postId }).select("_id");
    const commentIds = comments.map((c) => c._id);

    // Cascade delete related records
    await Promise.all([
      Post.findByIdAndDelete(postId),
      Reaction.deleteMany({ postId }),
      Comment.deleteMany({ postId }),
      CommentLike.deleteMany({ commentId: { $in: commentIds } }),
      Report.deleteMany({ targetType: "post", targetId: postId }),
      Report.deleteMany({ targetType: "comment", targetId: { $in: commentIds } }),
      Notification.deleteMany({ postId }),
    ]);

    res.status(200).json({ message: "Post and related content deleted successfully." });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

/**
 * PUT /posts/:id/reactions/:type — Add reaction (hug | metoo)
 * Idempotent: only increments if write changed state
 */
const addReaction = async (req, res) => {
  const loggedUser = req.user;
  const postId = req.params.id;
  let type = req.params.type?.toLowerCase();
  if (type === "me-too") type = "metoo";

  if (!["hug", "metoo"].includes(type)) {
    return res.status(400).json({ message: "Invalid reaction type. Must be 'hug' or 'metoo'." });
  }

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ message: "Invalid post ID." });
  }

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    const countField = type === "hug" ? "hugCount" : "meTooCount";

    try {
      await Reaction.create({
        postId,
        userId: loggedUser._id,
        type,
      });
      // Increment only because write succeeded (new reaction inserted)
      await Post.findByIdAndUpdate(postId, { $inc: { [countField]: 1 } });
    } catch (err) {
      // Duplicate key error silently ignored for idempotency
      if (err.code !== 11000) {
        throw err;
      }
    }

    // Notify post author (never notify yourself, deduplicates via upsert)
    const notifType = type === "hug" ? "post_hug" : "post_metoo";
    await createNotification({
      recipientId: post.authorId,
      actorId: loggedUser._id,
      type: notifType,
      postId: post._id,
    });

    const updated = await Post.findById(postId);

    res.status(200).json({
      message: "Reaction recorded.",
      hugCount: updated.hugCount,
      meTooCount: updated.meTooCount,
      viewerHasHugged: type === "hug" ? true : undefined,
      viewerHasMeToo: type === "metoo" ? true : undefined,
    });
  } catch (error) {
    console.error("Error adding reaction:", error);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

/**
 * DELETE /posts/:id/reactions/:type — Remove reaction
 * Idempotent: only decrements if record actually existed
 */
const removeReaction = async (req, res) => {
  const loggedUser = req.user;
  const postId = req.params.id;
  let type = req.params.type?.toLowerCase();
  if (type === "me-too") type = "metoo";

  if (!["hug", "metoo"].includes(type)) {
    return res.status(400).json({ message: "Invalid reaction type." });
  }

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ message: "Invalid post ID." });
  }

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    const countField = type === "hug" ? "hugCount" : "meTooCount";

    const deleted = await Reaction.findOneAndDelete({
      postId,
      userId: loggedUser._id,
      type,
    });

    if (deleted) {
      await Post.findOneAndUpdate(
        { _id: postId, [countField]: { $gt: 0 } },
        { $inc: { [countField]: -1 } }
      );

      // Un-reacting deletes the notification only if still unread
      const notifType = type === "hug" ? "post_hug" : "post_metoo";
      await removeUnreadNotification({
        recipientId: post.authorId,
        actorId: loggedUser._id,
        type: notifType,
        postId: post._id,
      });
    }

    const updated = await Post.findById(postId);

    res.status(200).json({
      message: "Reaction removed.",
      hugCount: updated.hugCount,
      meTooCount: updated.meTooCount,
      viewerHasHugged: type === "hug" ? false : undefined,
      viewerHasMeToo: type === "metoo" ? false : undefined,
    });
  } catch (error) {
    console.error("Error removing reaction:", error);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

/**
 * POST /posts/:id/report — Report a post
 */
const reportPost = async (req, res) => {
  const loggedUser = req.user;
  const postId = req.params.id;
  let { reason } = req.body;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ message: "Invalid post ID." });
  }

  if (!reason || typeof reason !== "string" || !reason.trim()) {
    return res.status(422).json({ message: "A reason is required." });
  }

  reason = reason.trim().slice(0, 500);

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    if (post.authorId.toString() === loggedUser._id.toString()) {
      return res.status(400).json({ message: "You cannot report your own post." });
    }

    await Report.create({
      targetType: "post",
      targetId: postId,
      reporterId: loggedUser._id,
      reason,
    });

    await Post.findByIdAndUpdate(postId, { $inc: { reportCount: 1 } });

    res.status(201).json({ message: "Report submitted. Thank you for helping keep DayBook safe." });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "You've already reported this post." });
    }
    console.error("Error reporting post:", error);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

/**
 * GET /posts/mine — Get current user's own public posts
 */
const getMyPosts = async (req, res) => {
  const loggedUser = req.user;
  const { cursor, cursorId } = req.query;
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);

  try {
    const filter = { authorId: loggedUser._id };

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

    const posts = await Post.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1);

    const hasMore = posts.length > limit;
    const resultPosts = hasMore ? posts.slice(0, limit) : posts;

    const postIds = resultPosts.map((p) => p._id);
    const viewerReactions = await Reaction.find({
      postId: { $in: postIds },
      userId: loggedUser._id,
    });
    const reactionSet = new Set(
      viewerReactions.map((r) => `${r.postId.toString()}_${r.type}`)
    );

    const serialized = resultPosts.map((p) => {
      const flags = {
        viewerHasHugged: reactionSet.has(`${p._id.toString()}_hug`),
        viewerHasMeToo: reactionSet.has(`${p._id.toString()}_metoo`),
      };
      return serializePost(p, loggedUser, flags);
    });

    let nextCursor = null;
    let nextCursorId = null;
    if (hasMore && resultPosts.length > 0) {
      const last = resultPosts[resultPosts.length - 1];
      nextCursor = last.createdAt.toISOString();
      nextCursorId = last._id.toString();
    }

    res.status(200).json({
      data: serialized,
      pagination: { hasMore, nextCursor, nextCursorId },
    });
  } catch (error) {
    console.error("Error fetching own posts:", error);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = {
  createPost,
  getFeed,
  getPost,
  updatePost,
  deletePost,
  addReaction,
  removeReaction,
  reportPost,
  getMyPosts,
};
