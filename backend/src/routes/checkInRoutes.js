const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { checkInLimiter } = require("../middleware/rateLimiter");
const checkInController = require("../controllers/checkInController");

// All check-in endpoints require authentication and own-data only
router.use(authMiddleware);

router.post("/", checkInLimiter, checkInController.createCheckIn);
router.get("/me", checkInController.getMyCheckIns);
router.delete("/me", checkInController.deleteMyCheckIns);
router.get("/insights", checkInController.getInsights);

module.exports = router;
