const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { postLimiter, reportLimiter, commentLimiter } = require("../middleware/rateLimiter");
const postController = require("../controllers/postController");
const commentController = require("../controllers/commentController");

// All post routes require authentication
router.use(authMiddleware);

// Own posts
router.get("/mine", postController.getMyPosts);

// Feed
router.get("/", postController.getFeed);

// Create post (rate limited)
router.post("/", postLimiter, postController.createPost);

// Single post
router.get("/:id", postController.getPost);

// Update & Delete (author-only)
router.patch("/:id", postController.updatePost);
router.delete("/:id", postController.deletePost);

// Reactions (idempotent PUT/DELETE)
router.put("/:id/reactions/:type", postController.addReaction);
router.delete("/:id/reactions/:type", postController.removeReaction);

// Comments for a post
router.get("/:id/comments", commentController.getPostComments);
router.post("/:id/comments", commentLimiter, commentController.createComment);

// Report post
router.post("/:id/report", reportLimiter, postController.reportPost);

module.exports = router;
