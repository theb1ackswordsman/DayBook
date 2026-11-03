const rateLimit = require("express-rate-limit");

/**
 * Rate limiter for post creation: 10 posts per hour per user.
 * Uses authenticated user ID as the key.
 */
const postLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  validate: { keyGeneratorIpFallback: false },
  message: {
    message: "You've shared quite a few thoughts recently. Take a breather and try again in a bit.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for reports: 20 reports per hour per user.
 */
const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  validate: { keyGeneratorIpFallback: false },
  message: {
    message: "Too many reports submitted. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for comments: 30 comments per hour per user.
 */
const commentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  validate: { keyGeneratorIpFallback: false },
  message: {
    message: "You're writing comments quite quickly! Please take a breather and try again in a bit.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for unread count polling: 120 requests per hour per user.
 */
const unreadCountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 120,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  validate: { keyGeneratorIpFallback: false },
  message: {
    message: "Rate limit reached for notification checks.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for check-ins: 10 check-ins per hour per user.
 */
const checkInLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  validate: { keyGeneratorIpFallback: false },
  message: {
    message: "You've checked in several times recently. Please take a pause and try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  postLimiter,
  reportLimiter,
  commentLimiter,
  unreadCountLimiter,
  checkInLimiter,
};
