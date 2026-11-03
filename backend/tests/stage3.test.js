const { test, describe, before, after } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const http = require("node:http");
const app = require("../src/index");
const User = require("../src/models/userModel");
const Entry = require("../src/models/entryModel");
const Post = require("../src/models/postModel");
const Reaction = require("../src/models/reactionModel");
const Comment = require("../src/models/commentModel");
const CommentLike = require("../src/models/commentLikeModel");
const Report = require("../src/models/reportModel");
const Notification = require("../src/models/notificationModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

let server;
let baseUrl;

async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const headers = options.headers || {};
  if (options.token) {
    headers["Cookie"] = `token=${options.token}`;
  }
  if (options.body && typeof options.body === "object") {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(options.body);
  }

  const res = await fetch(url, {
    method: options.method || "GET",
    headers,
    body: options.body,
  });

  let data = null;
  const text = await res.text();
  try {
    data = JSON.parse(text);
  } catch (e) {
    data = text;
  }

  return { status: res.status, data, headers: res.headers };
}

describe("Stage 3 Notifications Integration Tests", () => {
  let userA, userB, userC;
  let tokenA, tokenB, tokenC;

  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/daybook");
    }

    await User.deleteMany({ email: { $in: ["s3_a@test.com", "s3_b@test.com", "s3_c@test.com"] } });
    await Entry.deleteMany({});
    await Post.deleteMany({});
    await Reaction.deleteMany({});
    await Comment.deleteMany({});
    await CommentLike.deleteMany({});
    await Report.deleteMany({});
    await Notification.deleteMany({});

    const hashed = await bcrypt.hash("Password123!", 10);
    userA = await User.create({
      firstName: "UserA",
      displayName: "Alice",
      email: "s3_a@test.com",
      password: hashed,
      avatarPreset: "preset-a",
    });

    userB = await User.create({
      firstName: "UserB",
      displayName: "Bob",
      email: "s3_b@test.com",
      password: hashed,
      avatarPreset: "preset-b",
    });

    userC = await User.create({
      firstName: "UserC",
      displayName: "Charlie",
      email: "s3_c@test.com",
      password: hashed,
      avatarPreset: "preset-c",
    });

    const secret = process.env.JWT_SECRET || "nillu@5678";
    tokenA = jwt.sign({ _id: userA._id }, secret);
    tokenB = jwt.sign({ _id: userB._id }, secret);
    tokenC = jwt.sign({ _id: userC._id }, secret);

    await new Promise((resolve) => {
      server = http.createServer(app);
      server.listen(0, () => {
        baseUrl = `http://127.0.0.1:${server.address().port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await User.deleteMany({ email: { $in: ["s3_a@test.com", "s3_b@test.com", "s3_c@test.com"] } });
    await Entry.deleteMany({});
    await Post.deleteMany({});
    await Reaction.deleteMany({});
    await Comment.deleteMany({});
    await CommentLike.deleteMany({});
    await Report.deleteMany({});
    await Notification.deleteMany({});
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await mongoose.connection.close();
  });

  test("1. Hugging your own post creates no notification", async () => {
    // User A creates post
    const postRes = await request("/api/posts", {
      method: "POST",
      token: tokenA,
      body: { body: "Alice's own post" },
    });
    const postId = postRes.data.data._id;

    // User A hugs their own post
    await request(`/api/posts/${postId}/reactions/hug`, {
      method: "PUT",
      token: tokenA,
    });

    // Check notifications for User A
    const count = await Notification.countDocuments({ recipientId: userA._id });
    assert.equal(count, 0, "No notification should be sent for self-hug");
  });

  test("2. Double-liking a comment (parallel requests) creates exactly one notification", async () => {
    // User A creates post
    const postRes = await request("/api/posts", {
      method: "POST",
      token: tokenA,
      body: { body: "Post for comment like dedupe" },
    });
    const postId = postRes.data.data._id;

    // User A creates comment
    const commentRes = await request(`/api/posts/${postId}/comments`, {
      method: "POST",
      token: tokenA,
      body: { body: "Alice's comment" },
    });
    const commentId = commentRes.data.data._id;

    // User B double-likes comment in parallel
    await Promise.all([
      request(`/api/comments/${commentId}/like`, { method: "PUT", token: tokenB }),
      request(`/api/comments/${commentId}/like`, { method: "PUT", token: tokenB }),
    ]);

    // Check notifications for Alice
    const notifs = await Notification.find({
      recipientId: userA._id,
      type: "comment_like",
      commentId,
    });
    assert.equal(notifs.length, 1, "Exactly one notification should exist for like");
  });

  test("3. Unlike removes the unread notification; leaves a read one in place", async () => {
    const postRes = await request("/api/posts", {
      method: "POST",
      token: tokenA,
      body: { body: "Post for unlike notification test" },
    });
    const postId = postRes.data.data._id;

    const commentRes = await request(`/api/posts/${postId}/comments`, {
      method: "POST",
      token: tokenA,
      body: { body: "Alice's test comment" },
    });
    const commentId = commentRes.data.data._id;

    // 1. User C likes the comment -> unread notification created for A
    await request(`/api/comments/${commentId}/like`, { method: "PUT", token: tokenC });
    let notif = await Notification.findOne({
      recipientId: userA._id,
      actorId: userC._id,
      type: "comment_like",
    });
    assert.ok(notif, "Notification should exist");
    assert.equal(notif.read, false);

    // User C unlikes while still unread -> notification removed
    await request(`/api/comments/${commentId}/like`, { method: "DELETE", token: tokenC });
    notif = await Notification.findOne({
      recipientId: userA._id,
      actorId: userC._id,
      type: "comment_like",
    });
    assert.equal(notif, null, "Unread notification must be removed on unlike");

    // 2. User C likes again
    await request(`/api/comments/${commentId}/like`, { method: "PUT", token: tokenC });
    notif = await Notification.findOne({
      recipientId: userA._id,
      actorId: userC._id,
      type: "comment_like",
    });
    assert.ok(notif);

    // User A marks it read
    await request(`/api/notifications/${notif._id}/read`, { method: "PATCH", token: tokenA });
    const readCheck = await Notification.findById(notif._id);
    assert.equal(readCheck.read, true);

    // User C unlikes after it was marked read -> notification STAYS in place
    await request(`/api/comments/${commentId}/like`, { method: "DELETE", token: tokenC });
    const stillExists = await Notification.findById(notif._id);
    assert.ok(stillExists, "Already-read notification must remain in place on unlike");
  });

  test("4. Reply notifies the parent comment's author, and the post author when it's a different person", async () => {
    // User A creates post
    const postRes = await request("/api/posts", {
      method: "POST",
      token: tokenA,
      body: { body: "Alice's thread post" },
    });
    const postId = postRes.data.data._id;

    // User B writes a comment
    const commentRes = await request(`/api/posts/${postId}/comments`, {
      method: "POST",
      token: tokenB,
      body: { body: "Bob's comment" },
    });
    const parentCommentId = commentRes.data.data._id;

    // User C replies to Bob's comment
    const replyRes = await request(`/api/posts/${postId}/comments`, {
      method: "POST",
      token: tokenC,
      body: { body: "Charlie's reply to Bob", parentId: parentCommentId },
    });
    assert.equal(replyRes.status, 201);
    const replyCommentId = replyRes.data.data._id;

    // Check Bob (parent comment author) got notification
    const bobNotif = await Notification.findOne({
      recipientId: userB._id,
      actorId: userC._id,
      type: "comment_reply",
      commentId: replyCommentId,
    });
    assert.ok(bobNotif, "Bob (parent comment author) must receive notification");

    // Check Alice (post author) also got notification because she is distinct from Bob and Charlie
    const aliceNotif = await Notification.findOne({
      recipientId: userA._id,
      actorId: userC._id,
      type: "comment_reply",
      commentId: replyCommentId,
    });
    assert.ok(aliceNotif, "Alice (post author) must receive notification");
  });

  test("5. User A cannot read or mark user B's notifications (403/404)", async () => {
    // Create notification for User B
    const notifForB = await Notification.create({
      recipientId: userB._id,
      actorId: userC._id,
      type: "post_hug",
      postId: new mongoose.Types.ObjectId(),
    });

    // User A attempts to mark B's notification as read -> 403
    const patchRes = await request(`/api/notifications/${notifForB._id}/read`, {
      method: "PATCH",
      token: tokenA,
    });
    assert.equal(patchRes.status, 403, "User A cannot modify User B's notification");

    // User A fetches their notifications: B's notification must not be there
    const listRes = await request("/api/notifications", {
      method: "GET",
      token: tokenA,
    });
    assert.equal(listRes.status, 200);
    const hasBNotif = listRes.data.data.some((n) => n._id === notifForB._id.toString());
    assert.equal(hasBNotif, false, "User A must not see User B's notifications");
  });

  test("6. Deleting a post removes its notifications", async () => {
    // User A creates post
    const postRes = await request("/api/posts", {
      method: "POST",
      token: tokenA,
      body: { body: "Post to be deleted with notifs" },
    });
    const postId = postRes.data.data._id;

    // User B hugs
    await request(`/api/posts/${postId}/reactions/hug`, { method: "PUT", token: tokenB });

    // Verify notification was created for Alice
    const countBefore = await Notification.countDocuments({ postId });
    assert.ok(countBefore > 0);

    // Alice deletes her post
    const deleteRes = await request(`/api/posts/${postId}`, {
      method: "DELETE",
      token: tokenA,
    });
    assert.equal(deleteRes.status, 200);

    // Verify related notifications were deleted
    const countAfter = await Notification.countDocuments({ postId });
    assert.equal(countAfter, 0, "Deleting post must remove all its notifications");
  });

  test("7. Notification payloads never include email or private fields", async () => {
    // User A creates post
    const postRes = await request("/api/posts", {
      method: "POST",
      token: tokenA,
      body: { body: "Public snippet test post with enough text to verify snippet length" },
    });
    const postId = postRes.data.data._id;

    // User B comments
    await request(`/api/posts/${postId}/comments`, {
      method: "POST",
      token: tokenB,
      body: { body: "Kind words from Bob" },
    });

    // Alice reads her notifications
    const res = await request("/api/notifications", {
      method: "GET",
      token: tokenA,
    });
    assert.equal(res.status, 200);
    assert.ok(res.data.data.length > 0);

    const json = JSON.stringify(res.data);
    assert.ok(!json.includes("s3_b@test.com"), "Actor email must NOT appear in notification payload");
    assert.ok(!json.includes("password"), "Password must NOT appear");

    const item = res.data.data[0];
    assert.ok(item.actor);
    assert.ok(item.postSnippet);
    assert.deepEqual(
      Object.keys(item.actor).sort(),
      ["_id", "avatarPreset", "displayName", "username"].sort()
    );
  });

  test("8. Unread count matches the number of unread rows", async () => {
    // Check initial unread count for Alice
    const unreadCountRes = await request("/api/notifications/unread-count", {
      method: "GET",
      token: tokenA,
    });
    assert.equal(unreadCountRes.status, 200);

    const actualUnreadDocs = await Notification.countDocuments({
      recipientId: userA._id,
      read: false,
    });
    assert.equal(unreadCountRes.data.unreadCount, actualUnreadDocs);

    // Alice calls read-all
    const readAllRes = await request("/api/notifications/read-all", {
      method: "POST",
      token: tokenA,
    });
    assert.equal(readAllRes.status, 200);

    // Unread count is now 0
    const finalCountRes = await request("/api/notifications/unread-count", {
      method: "GET",
      token: tokenA,
    });
    assert.equal(finalCountRes.data.unreadCount, 0);
  });
});
