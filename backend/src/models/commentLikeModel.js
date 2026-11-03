const mongoose = require("mongoose");

const commentLikeSchema = new mongoose.Schema(
  {
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Comment",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { timestamps: true }
);

commentLikeSchema.index({ commentId: 1, userId: 1 }, { unique: true });

const CommentLike = mongoose.model("CommentLike", commentLikeSchema);

module.exports = CommentLike;
