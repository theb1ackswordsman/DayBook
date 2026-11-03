const Comment = require("../models/commentModel");
const CommentLike = require("../models/commentLikeModel");
const Post = require("../models/postModel");
const User = require("../models/userModel");
const Report = require("../models/reportModel");
const Notification = require("../models/notificationModel");
const { createNotification, removeUnreadNotification } = require("../utils/notificationService");
const { serializeComment } = require("../utils/serializers");
const mongoose = require("mongoose");

/**
 * GET /posts/:id/comments — Top-level comments, cursor-paginated, with first 2 replies
 */
const getPostComments = async (req, res) => {
  const loggedUser = req.user;
  const postId = req.params.id;
  const { cursor, cursorId } = req.query;
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ message: "Invalid post ID." });
  }

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    const filter = { postId, parentId: null };

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

    const topComments = await Comment.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1);

    const hasMore = topComments.length > limit;
    const resultComments = hasMore ? topComments.slice(0, limit) : topComments;
    const topCommentIds = resultComments.map((c) => c._id);

    // Fetch up to 2 oldest replies per top-level comment
    // and total reply counts
    const replies = await Comment.find({
      postId,
      parentId: { $in: topCommentIds },
    }).sort({ createdAt: 1, _id: 1 });

    const replyMap = new Map();
    const replyCountMap = new Map();
    for (const r of replies) {
      const pId = r.parentId.toString();
      const currentReplies = replyMap.get(pId) || [];
      if (currentReplies.length < 2) {
        currentReplies.push(r);
        replyMap.set(pId, currentReplies);
      }
      replyCountMap.set(pId, (replyCountMap.get(pId) || 0) + 1);
    }

    // Collect all author IDs needed (top comments + attached replies)
    const allComments = [...resultComments, ...replies];
    const authorIds = [...new Set(allComments.map((c) => c.authorId.toString()))];
    const authors = await User.find({ _id: { $in: authorIds } });
    const authorMap = new Map(authors.map((a) => [a._id.toString(), a]));

    // Batch-lookup viewer likes on all comments returned
    const allCommentIds = allComments.map((c) => c._id);
    const viewerLikes = await CommentLike.find({
      commentId: { $in: allCommentIds },
      userId: loggedUser._id,
    });
    const likedSet = new Set(viewerLikes.map((l) => l.commentId.toString()));

    const serialized = resultComments.map((comment) => {
      const cId = comment._id.toString();
      const commentReplies = (replyMap.get(cId) || []).map((reply) => {
        return serializeComment(
          reply,
          authorMap.get(reply.authorId.toString()),
          { viewerHasLiked: likedSet.has(reply._id.toString()) },
          [],
          0
        );
      });

      return serializeComment(
        comment,
        authorMap.get(comment.authorId.toString()),
        { viewerHasLiked: likedSet.has(cId) },
        commentReplies,
        replyCountMap.get(cId) || 0
      );
    });

    let nextCursor = null;
    let nextCursorId = null;
    if (hasMore && resultComments.length > 0) {
      const last = resultComments[resultComments.length - 1];
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
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

/**
 * GET /comments/:id/replies — Cursor-paginated replies for a comment
 */
const getCommentReplies = async (req, res) => {
  const loggedUser = req.user;
  const parentId = req.params.id;
  const { cursor, cursorId } = req.query;
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);

  if (!mongoose.Types.ObjectId.isValid(parentId)) {
    return res.status(400).json({ message: "Invalid comment ID." });
  }

  try {
    const parentComment = await Comment.findById(parentId);
    if (!parentComment) {
      return res.status(404).json({ message: "Parent comment not found." });
    }

    const filter = { parentId };

    if (cursor && cursorId) {
      const cursorDate = new Date(cursor);
      if (!isNaN(cursorDate.getTime()) && mongoose.Types.ObjectId.isValid(cursorId)) {
        filter.$or = [
          { createdAt: { $gt: cursorDate } },
          {
            createdAt: cursorDate,
            _id: { $gt: new mongoose.Types.ObjectId(cursorId) },
          },
        ];
      }
    }

    // Replies are listed chronologically (oldest first)
    const replies = await Comment.find(filter)
      .sort({ createdAt: 1, _id: 1 })
      .limit(limit + 1);

    const hasMore = replies.length > limit;
    const resultReplies = hasMore ? replies.slice(0, limit) : replies;

    const authorIds = [...new Set(resultReplies.map((r) => r.authorId.toString()))];
    const authors = await User.find({ _id: { $in: authorIds } });
    const authorMap = new Map(authors.map((a) => [a._id.toString(), a]));

    const replyIds = resultReplies.map((r) => r._id);
    const viewerLikes = await CommentLike.find({
      commentId: { $in: replyIds },
      userId: loggedUser._id,
    });
    const likedSet = new Set(viewerLikes.map((l) => l.commentId.toString()));

    const serialized = resultReplies.map((reply) =>
      serializeComment(
        reply,
        authorMap.get(reply.authorId.toString()),
        { viewerHasLiked: likedSet.has(reply._id.toString()) },
        [],
        0
      )
    );

    let nextCursor = null;
    let nextCursorId = null;
    if (hasMore && resultReplies.length > 0) {
      const last = resultReplies[resultReplies.length - 1];
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
    console.error("Error fetching replies:", error);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

/**
 * POST /posts/:id/comments — Add top-level comment or reply
 */
const createComment = async (req, res) => {
  const loggedUser = req.user;
  const postId = req.params.id;
  let { body, parentId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ message: "Invalid post ID." });
  }

  if (!body || typeof body !== "string" || !body.trim()) {
    return res.status(422).json({ message: "Comment body is required." });
  }

  body = body.trim().slice(0, 500);

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    let finalParentId = null;
    let parentCommentDoc = null;
    if (parentId) {
      if (!mongoose.Types.ObjectId.isValid(parentId)) {
        return res.status(400).json({ message: "Invalid parent comment ID." });
      }
      const parentComment = await Comment.findById(parentId);
      if (!parentComment || parentComment.postId.toString() !== postId) {
        return res.status(404).json({ message: "Parent comment not found." });
      }

      parentCommentDoc = parentComment;
      // If replying to a reply, attach to the top-level parent so threads stay 1 level deep
      finalParentId = parentComment.parentId ? parentComment.parentId : parentComment._id;
    }

    const comment = await Comment.create({
      postId,
      authorId: loggedUser._id,
      parentId: finalParentId,
      body,
    });

    // Increment post commentCount
    await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });

    // Notifications
    if (parentCommentDoc) {
      // 1. Notify the parent comment's author
      await createNotification({
        recipientId: parentCommentDoc.authorId,
        actorId: loggedUser._id,
        type: "comment_reply",
        postId: post._id,
        commentId: comment._id,
      });

      // 2. Also notify the post author (unless they are the parent comment author or the actor)
      if (
        post.authorId.toString() !== parentCommentDoc.authorId.toString() &&
        post.authorId.toString() !== loggedUser._id.toString()
      ) {
        await createNotification({
          recipientId: post.authorId,
          actorId: loggedUser._id,
          type: "comment_reply",
          postId: post._id,
          commentId: comment._id,
        });
      }
    } else {
      // Top-level comment: notify the post author
      await createNotification({
        recipientId: post.authorId,
        actorId: loggedUser._id,
        type: "post_comment",
        postId: post._id,
        commentId: comment._id,
      });
    }

    res.status(201).json({
      message: "Comment added.",
      data: serializeComment(comment, loggedUser, { viewerHasLiked: false }, [], 0),
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

/**
 * DELETE /comments/:id — Delete comment (comment author OR post author)
 */
const deleteComment = async (req, res) => {
  const loggedUser = req.user;
  const commentId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    return res.status(400).json({ message: "Invalid comment ID." });
  }

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    const post = await Post.findById(comment.postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    const isCommentAuthor = comment.authorId.toString() === loggedUser._id.toString();
    const isPostAuthor = post.authorId.toString() === loggedUser._id.toString();

    if (!isCommentAuthor && !isPostAuthor) {
      return res.status(403).json({
        message: "You can only delete your own comments, or comments on your own post.",
      });
    }

    // If deleting a top-level comment, also find all its replies
    const replies = await Comment.find({ parentId: commentId }).select("_id");
    const allDeletedIds = [comment._id, ...replies.map((r) => r._id)];
    const totalDeletedCount = allDeletedIds.length;

    // Delete comments, likes, reports, and notifications
    await Promise.all([
      Comment.deleteMany({ _id: { $in: allDeletedIds } }),
      CommentLike.deleteMany({ commentId: { $in: allDeletedIds } }),
      Report.deleteMany({ targetType: "comment", targetId: { $in: allDeletedIds } }),
      Notification.deleteMany({ commentId: { $in: allDeletedIds } }),
    ]);

    // Decrement post commentCount safely
    await Post.findOneAndUpdate(
      { _id: comment.postId, commentCount: { $gte: totalDeletedCount } },
      { $inc: { commentCount: -totalDeletedCount } }
    );

    res.status(200).json({ message: "Comment deleted successfully." });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

/**
 * PUT /comments/:id/like — Idempotent like
 */
const likeComment = async (req, res) => {
  const loggedUser = req.user;
  const commentId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    return res.status(400).json({ message: "Invalid comment ID." });
  }

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    try {
      await CommentLike.create({
        commentId,
        userId: loggedUser._id,
      });
      await Comment.findByIdAndUpdate(commentId, { $inc: { likeCount: 1 } });
    } catch (err) {
      if (err.code !== 11000) {
        throw err;
      }
    }

    // Notify comment author
    await createNotification({
      recipientId: comment.authorId,
      actorId: loggedUser._id,
      type: "comment_like",
      postId: comment.postId,
      commentId: comment._id,
    });

    const updated = await Comment.findById(commentId);

    res.status(200).json({
      message: "Liked.",
      likeCount: updated.likeCount,
      viewerHasLiked: true,
    });
  } catch (error) {
    console.error("Error liking comment:", error);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

/**
 * DELETE /comments/:id/like — Idempotent unlike
 */
const unlikeComment = async (req, res) => {
  const loggedUser = req.user;
  const commentId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    return res.status(400).json({ message: "Invalid comment ID." });
  }

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    const deleted = await CommentLike.findOneAndDelete({
      commentId,
      userId: loggedUser._id,
    });

    if (deleted) {
      await Comment.findOneAndUpdate(
        { _id: commentId, likeCount: { $gt: 0 } },
        { $inc: { likeCount: -1 } }
      );

      // Remove notification only if unread
      await removeUnreadNotification({
        recipientId: comment.authorId,
        actorId: loggedUser._id,
        type: "comment_like",
        postId: comment.postId,
        commentId: comment._id,
      });
    }

    const updated = await Comment.findById(commentId);

    res.status(200).json({
      message: "Unliked.",
      likeCount: updated.likeCount,
      viewerHasLiked: false,
    });
  } catch (error) {
    console.error("Error unliking comment:", error);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

/**
 * POST /comments/:id/report — Report a comment
 */
const reportComment = async (req, res) => {
  const loggedUser = req.user;
  const commentId = req.params.id;
  let { reason } = req.body;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    return res.status(400).json({ message: "Invalid comment ID." });
  }

  if (!reason || typeof reason !== "string" || !reason.trim()) {
    return res.status(422).json({ message: "A reason is required." });
  }

  reason = reason.trim().slice(0, 500);

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    if (comment.authorId.toString() === loggedUser._id.toString()) {
      return res.status(400).json({ message: "You cannot report your own comment." });
    }

    await Report.create({
      targetType: "comment",
      targetId: commentId,
      reporterId: loggedUser._id,
      reason,
    });

    await Comment.findByIdAndUpdate(commentId, { $inc: { reportCount: 1 } });

    res.status(201).json({ message: "Report submitted. Thank you for keeping DayBook safe." });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "You've already reported this comment." });
    }
    console.error("Error reporting comment:", error);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = {
  getPostComments,
  getCommentReplies,
  createComment,
  deleteComment,
  likeComment,
  unlikeComment,
  reportComment,
};
