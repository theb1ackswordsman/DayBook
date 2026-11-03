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

describe("Stage 2 Reactions & Comments Integration Tests", () => {
  let userA, userB, userC;
  let tokenA, tokenB, tokenC;

  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/daybook");
    }

    await User.deleteMany({ email: { $in: ["s2_a@test.com", "s2_b@test.com", "s2_c@test.com"] } });
    await Entry.deleteMany({});
    await Post.deleteMany({});
    await Reaction.deleteMany({});
    await Comment.deleteMany({});
    await CommentLike.deleteMany({});
    await Report.deleteMany({});

    const hashed = await bcrypt.hash("Password123!", 10);
    userA = await User.create({
      firstName: "UserA",
      displayName: "Alice",
      email: "s2_a@test.com",
      password: hashed,
      avatarPreset: "preset-a",
    });

    userB = await User.create({
      firstName: "UserB",
      displayName: "Bob",
      email: "s2_b@test.com",
      password: hashed,
      avatarPreset: "preset-b",
    });

    userC = await User.create({
      firstName: "UserC",
      displayName: "Charlie",
      email: "s2_c@test.com",
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
    await User.deleteMany({ email: { $in: ["s2_a@test.com", "s2_b@test.com", "s2_c@test.com"] } });
    await Entry.deleteMany({});
    await Post.deleteMany({});
    await Reaction.deleteMany({});
    await Comment.deleteMany({});
    await CommentLike.deleteMany({});
    await Report.deleteMany({});
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await mongoose.connection.close();
  });

  test("1. Double-clicking hug (parallel requests) leaves hugCount at exactly 1", async () => {
    // User A creates a post
    const postRes = await request("/api/posts", {
      method: "POST",
      token: tokenA,
      body: { body: "Post for parallel hug test" },
    });
    assert.equal(postRes.status, 201);
    const postId = postRes.data.data._id;

    // User B sends 2 simultaneous PUT /reactions/hug requests
    const [res1, res2] = await Promise.all([
      request(`/api/posts/${postId}/reactions/hug`, { method: "PUT", token: tokenB }),
      request(`/api/posts/${postId}/reactions/hug`, { method: "PUT", token: tokenB }),
    ]);

    assert.equal(res1.status, 200);
    assert.equal(res2.status, 200);

    // Verify database state: exactly 1 reaction document and hugCount = 1
    const reactionDocs = await Reaction.find({ postId, userId: userB._id, type: "hug" });
    assert.equal(reactionDocs.length, 1, "Exactly one reaction doc must exist");

    const postDoc = await Post.findById(postId);
    assert.equal(postDoc.hugCount, 1, "hugCount must be exactly 1");
  });

  test("2. Unhug when not hugged doesn't push the count below 0", async () => {
    // User A creates post with 0 hugs
    const postRes = await request("/api/posts", {
      method: "POST",
      token: tokenA,
      body: { body: "Zero hug post" },
    });
    const postId = postRes.data.data._id;

    // User C unhugs a post they never hugged
    const unhugRes = await request(`/api/posts/${postId}/reactions/hug`, {
      method: "DELETE",
      token: tokenC,
    });
    assert.equal(unhugRes.status, 200);

    const postDoc = await Post.findById(postId);
    assert.equal(postDoc.hugCount, 0, "hugCount must remain 0 and not become negative");
  });

  test("3. Replying to a reply attaches to the top-level parent (max 1 level deep)", async () => {
    const postRes = await request("/api/posts", {
      method: "POST",
      token: tokenA,
      body: { body: "Threading post test" },
    });
    const postId = postRes.data.data._id;

    // 1. User B writes a top-level comment
    const topCommentRes = await request(`/api/posts/${postId}/comments`, {
      method: "POST",
      token: tokenB,
      body: { body: "Level 1 Top comment" },
    });
    assert.equal(topCommentRes.status, 201);
    const topCommentId = topCommentRes.data.data._id;
    assert.equal(topCommentRes.data.data.parentId, null);

    // 2. User C replies to top-level comment
    const reply1Res = await request(`/api/posts/${postId}/comments`, {
      method: "POST",
      token: tokenC,
      body: { body: "Level 2 Reply to top comment", parentId: topCommentId },
    });
    assert.equal(reply1Res.status, 201);
    const reply1Id = reply1Res.data.data._id;
    assert.equal(reply1Res.data.data.parentId, topCommentId);

    // 3. User A replies to reply1 (reply to a reply)
    const reply2Res = await request(`/api/posts/${postId}/comments`, {
      method: "POST",
      token: tokenA,
      body: { body: "Reply to reply1 - must flatten", parentId: reply1Id },
    });
    assert.equal(reply2Res.status, 201);

    // Assert reply2 attached to topCommentId, NOT reply1Id
    assert.equal(
      reply2Res.data.data.parentId,
      topCommentId,
      "Replying to a reply must attach to the top-level parent"
    );

    // Check DB doc directly
    const reply2Doc = await Comment.findById(reply2Res.data.data._id);
    assert.equal(reply2Doc.parentId.toString(), topCommentId);
  });

  test("4. Comment/like/reaction responses never leak email or private fields", async () => {
    const postRes = await request("/api/posts", {
      method: "POST",
      token: tokenA,
      body: { body: "Allowlist verification post" },
    });
    const postId = postRes.data.data._id;

    // Add comment
    const commentRes = await request(`/api/posts/${postId}/comments`, {
      method: "POST",
      token: tokenB,
      body: { body: "A kind comment" },
    });
    assert.equal(commentRes.status, 201);
    const commentId = commentRes.data.data._id;

    // Like comment
    const likeRes = await request(`/api/comments/${commentId}/like`, {
      method: "PUT",
      token: tokenC,
    });
    assert.equal(likeRes.status, 200);

    // Fetch comments list
    const commentsListRes = await request(`/api/posts/${postId}/comments`, {
      method: "GET",
      token: tokenA,
    });
    assert.equal(commentsListRes.status, 200);

    const json = JSON.stringify(commentsListRes.data);
    assert.ok(!json.includes("s2_b@test.com"), "Comment author email must not leak");
    assert.ok(!json.includes("password"), "Password must not leak");
    assert.ok(!json.includes("reportCount"), "reportCount should remain internal");

    const author = commentsListRes.data.data[0].author;
    assert.deepEqual(
      Object.keys(author).sort(),
      ["_id", "avatarPreset", "displayName", "username"].sort()
    );
  });

  test("5. Journal entries are still unreachable through any of these endpoints", async () => {
    const SECRET = "MY_INNERMOST_SECRET_JOURNAL_STAGE2_987";
    await request("/api/entries", {
      method: "POST",
      token: tokenA,
      body: {
        date: "2026-11-03",
        title: "Private Secret",
        mood: "😌",
        content: SECRET,
      },
    });

    const postRes = await request("/api/posts", {
      method: "POST",
      token: tokenA,
      body: { body: "Public stage 2 post" },
    });
    const postId = postRes.data.data._id;

    await request(`/api/posts/${postId}/comments`, {
      method: "POST",
      token: tokenB,
      body: { body: "Nice post" },
    });

    // Check single post endpoint
    const singlePost = await request(`/api/posts/${postId}`, { method: "GET", token: tokenB });
    assert.ok(!JSON.stringify(singlePost.data).includes(SECRET));

    // Check comments endpoint
    const postComments = await request(`/api/posts/${postId}/comments`, { method: "GET", token: tokenB });
    assert.ok(!JSON.stringify(postComments.data).includes(SECRET));

    // Check feed endpoint
    const feed = await request("/api/posts", { method: "GET", token: tokenB });
    assert.ok(!JSON.stringify(feed.data).includes(SECRET));
  });

  test("6. User A can't delete user B's comment unless A is the post's author", async () => {
    // User C creates a post
    const postRes = await request("/api/posts", {
      method: "POST",
      token: tokenC,
      body: { body: "Charlie's post" },
    });
    const postId = postRes.data.data._id;

    // User B comments on Charlie's post
    const commentRes = await request(`/api/posts/${postId}/comments`, {
      method: "POST",
      token: tokenB,
      body: { body: "Bob's comment on Charlie's post" },
    });
    const commentId = commentRes.data.data._id;

    // User A (neither comment author nor post author) tries to delete -> 403
    const unauthorizedDelete = await request(`/api/comments/${commentId}`, {
      method: "DELETE",
      token: tokenA,
    });
    assert.equal(unauthorizedDelete.status, 403, "Unrelated user cannot delete comment");

    // User C (post author) CAN delete Bob's comment on their post -> 200
    const postAuthorDelete = await request(`/api/comments/${commentId}`, {
      method: "DELETE",
      token: tokenC,
    });
    assert.equal(postAuthorDelete.status, 200, "Post author can delete any comment on their post");

    // Verify comment deleted
    const checkDoc = await Comment.findById(commentId);
    assert.equal(checkDoc, null);
  });

  test("7. Deleting a post cascades all related documents (reactions, comments, likes, reports)", async () => {
    // User A creates post
    const postRes = await request("/api/posts", {
      method: "POST",
      token: tokenA,
      body: { body: "Post to be cascade deleted" },
    });
    const postId = postRes.data.data._id;

    // User B reacts
    await request(`/api/posts/${postId}/reactions/hug`, { method: "PUT", token: tokenB });

    // User B comments
    const commentRes = await request(`/api/posts/${postId}/comments`, {
      method: "POST",
      token: tokenB,
      body: { body: "Comment on post" },
    });
    const commentId = commentRes.data.data._id;

    // User C likes comment
    await request(`/api/comments/${commentId}/like`, { method: "PUT", token: tokenC });

    // User C reports post
    await request(`/api/posts/${postId}/report`, {
      method: "POST",
      token: tokenC,
      body: { reason: "Inappropriate" },
    });

    // User A reports comment
    await request(`/api/comments/${commentId}/report`, {
      method: "POST",
      token: tokenA,
      body: { reason: "Spam comment" },
    });

    // Delete post
    const deleteRes = await request(`/api/posts/${postId}`, {
      method: "DELETE",
      token: tokenA,
    });
    assert.equal(deleteRes.status, 200);

    // Verify cascades
    assert.equal(await Post.findById(postId), null);
    assert.equal(await Reaction.countDocuments({ postId }), 0, "Reactions must be deleted");
    assert.equal(await Comment.countDocuments({ postId }), 0, "Comments must be deleted");
    assert.equal(await CommentLike.countDocuments({ commentId }), 0, "Comment likes must be deleted");
    assert.equal(await Report.countDocuments({ targetType: "post", targetId: postId }), 0, "Post reports deleted");
    assert.equal(await Report.countDocuments({ targetType: "comment", targetId: commentId }), 0, "Comment reports deleted");
  });

  test("8. A comment on a nonexistent or deleted post returns 404", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const commentRes = await request(`/api/posts/${fakeId}/comments`, {
      method: "POST",
      token: tokenA,
      body: { body: "Comment on ghost post" },
    });
    assert.equal(commentRes.status, 404, "Commenting on nonexistent post must return 404");
  });
});
