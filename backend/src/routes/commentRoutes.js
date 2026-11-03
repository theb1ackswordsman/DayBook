const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { reportLimiter } = require("../middleware/rateLimiter");
const commentController = require("../controllers/commentController");

router.use(authMiddleware);

// Get replies for a comment
router.get("/:id/replies", commentController.getCommentReplies);

// Delete comment (comment author OR post author)
router.delete("/:id", commentController.deleteComment);

// Likes (idempotent PUT/DELETE)
router.put("/:id/like", commentController.likeComment);
router.delete("/:id/like", commentController.unlikeComment);

// Report comment
router.post("/:id/report", reportLimiter, commentController.reportComment);

module.exports = router;
