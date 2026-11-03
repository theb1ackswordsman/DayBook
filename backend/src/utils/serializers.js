/**
 * Allowlist serializer for public-facing author data.
 * NEVER exposes email, password, tokens, or journal data.
 */
const serializeAuthor = (user) => {
  if (!user) return null;
  return {
    _id: user._id,
    displayName: user.displayName || `${user.firstName || ""} ${user.lastName || ""}`.trim(),
    username: user.firstName || "User",
    avatarPreset: user.avatarPreset || "initials",
  };
};

/**
 * Serialize a post for public API responses.
 * Only includes safe, allowlisted fields.
 */
const serializePost = (post, authorDoc, viewerFlags = {}) => {
  return {
    _id: post._id,
    author: serializeAuthor(authorDoc),
    body: post.body,
    mood: post.mood || null,
    createdAt: post.createdAt,
    editedAt: post.editedAt || null,
    hugCount: post.hugCount || 0,
    meTooCount: post.meTooCount || 0,
    commentCount: post.commentCount || 0,
    viewerHasHugged: Boolean(viewerFlags.viewerHasHugged),
    viewerHasMeToo: Boolean(viewerFlags.viewerHasMeToo),
  };
};

/**
 * Serialize a comment for public API responses.
 * Only includes safe, allowlisted fields.
 */
const serializeComment = (comment, authorDoc, viewerFlags = {}, replies = [], replyCount = 0) => {
  return {
    _id: comment._id,
    postId: comment.postId,
    author: serializeAuthor(authorDoc),
    parentId: comment.parentId || null,
    body: comment.body,
    likeCount: comment.likeCount || 0,
    viewerHasLiked: Boolean(viewerFlags.viewerHasLiked),
    replyCount: replyCount,
    replies: replies,
    createdAt: comment.createdAt,
    editedAt: comment.editedAt || null,
  };
};

/**
 * Serialize a notification for API response.
 * Includes only allowlisted actor fields and post snippet.
 */
const serializeNotification = (notification, actorDoc, postDoc) => {
  const rawBody = postDoc?.body || "";
  const postSnippet = rawBody.length > 80 ? `${rawBody.slice(0, 80).trim()}...` : rawBody;

  return {
    _id: notification._id,
    type: notification.type,
    postId: notification.postId,
    commentId: notification.commentId || null,
    actor: serializeAuthor(actorDoc),
    postSnippet,
    read: Boolean(notification.read),
    createdAt: notification.createdAt,
  };
};

/**
 * Serialize a check-in for API response.
 * Strictly allowlisted fields. Never exposes individual answers.
 */
const serializeCheckIn = (checkIn) => {
  return {
    _id: checkIn._id,
    type: checkIn.type,
    score: checkIn.score,
    rawScore: checkIn.rawScore,
    band: checkIn.band,
    flaggedLow: Boolean(checkIn.flaggedLow),
    traits: checkIn.traits || undefined,
    createdAt: checkIn.createdAt,
  };
};

module.exports = {
  serializeAuthor,
  serializePost,
  serializeComment,
  serializeNotification,
  serializeCheckIn,
};
