const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { unreadCountLimiter } = require("../middleware/rateLimiter");
const notificationController = require("../controllers/notificationController");

router.use(authMiddleware);

// Unread count (rate limited 120/hour for 30s polling)
router.get("/unread-count", unreadCountLimiter, notificationController.getUnreadCount);

// Notifications list
router.get("/", notificationController.getNotifications);

// Mark all read
router.post("/read-all", notificationController.markAllAsRead);

// Mark single notification read
router.patch("/:id/read", notificationController.markAsRead);

module.exports = router;
