const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Post",
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: "Comment",
    },
    body: {
      type: String,
      required: true,
      maxlength: 500,
      trim: true,
    },
    likeCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    reportCount: {
      type: Number,
      default: 0,
    },
    editedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

commentSchema.index({ postId: 1, parentId: 1, createdAt: 1 });
commentSchema.index({ authorId: 1 });

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
