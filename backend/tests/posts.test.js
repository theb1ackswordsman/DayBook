const { test, describe, before, after } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const http = require("node:http");
const app = require("../src/index");
const User = require("../src/models/userModel");
const Entry = require("../src/models/entryModel");
const Post = require("../src/models/postModel");
const Report = require("../src/models/reportModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

let server;
let baseUrl;

// Helper to make requests with cookies
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

describe("Stage 1 Post Feed & Safety Tests", () => {
  let userA, userB;
  let tokenA, tokenB;

  before(async () => {
    // Connect to test/local DB
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/daybook");
    }

    // Clean test data
    await User.deleteMany({ email: { $in: ["usera@test.com", "userb@test.com", "pager@test.com"] } });
    await Entry.deleteMany({});
    await Post.deleteMany({});
    await Report.deleteMany({});

    // Create test users
    const hashedPassword = await bcrypt.hash("Password123!", 10);
    userA = await User.create({
      firstName: "Alice",
      lastName: "Wonderland",
      displayName: "AliceW",
      email: "usera@test.com",
      password: hashedPassword,
      avatarPreset: "preset-1",
    });

    userB = await User.create({
      firstName: "Bob",
      lastName: "Builder",
      displayName: "BobB",
      email: "userb@test.com",
      password: hashedPassword,
      avatarPreset: "preset-2",
    });

    tokenA = jwt.sign({ _id: userA._id }, process.env.JWT_SECRET || "nillu@5678");
    tokenB = jwt.sign({ _id: userB._id }, process.env.JWT_SECRET || "nillu@5678");

    // Start ephemeral server
    await new Promise((resolve) => {
      server = http.createServer(app);
      server.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    // Cleanup
    await User.deleteMany({ email: { $in: ["usera@test.com", "userb@test.com", "pager@test.com"] } });
    await Entry.deleteMany({});
    await Post.deleteMany({});
    await Report.deleteMany({});
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await mongoose.connection.close();
  });

  test("1. Journal entries never appear in any posts/feed response", async () => {
    const SECRET_JOURNAL_CONTENT = "SUPER_SECRET_PRIVATE_REFLECTION_XYZ123";
    const SECRET_JOURNAL_TITLE = "Private Confession";

    // Create private entry for User A
    const entryRes = await request("/api/entries", {
      method: "POST",
      token: tokenA,
      body: {
        date: "2026-11-03",
        title: SECRET_JOURNAL_TITLE,
        mood: "🙂",
        content: SECRET_JOURNAL_CONTENT,
      },
    });
    assert.equal(entryRes.status, 201);

    // Create a public post for User A
    const postRes = await request("/api/posts", {
      method: "POST",
      token: tokenA,
      body: {
        body: "Hello public world!",
        mood: "🙂",
      },
    });
    assert.equal(postRes.status, 201);

    // Fetch feed as User B
    const feedRes = await request("/api/posts", {
      method: "GET",
      token: tokenB,
    });
    assert.equal(feedRes.status, 200);

    const feedString = JSON.stringify(feedRes.data);
    assert.ok(
      !feedString.includes(SECRET_JOURNAL_CONTENT),
      "Private journal content must NOT appear in feed"
    );
    assert.ok(
      !feedString.includes(SECRET_JOURNAL_TITLE),
      "Private journal title must NOT appear in feed"
    );

    // Also verify User A's own feed does not mix them in /api/posts
    const ownFeedRes = await request("/api/posts", {
      method: "GET",
      token: tokenA,
    });
    const ownFeedString = JSON.stringify(ownFeedRes.data);
    assert.ok(
      !ownFeedString.includes(SECRET_JOURNAL_CONTENT),
      "Private journal content must NOT appear in own public feed response"
    );
  });

  test("2. Public responses never include email or other private fields", async () => {
    const feedRes = await request("/api/posts", {
      method: "GET",
      token: tokenB,
    });
    assert.equal(feedRes.status, 200);
    assert.ok(feedRes.data.data.length > 0);

    for (const post of feedRes.data.data) {
      // Check top-level post properties
      assert.equal(post.email, undefined);
      assert.equal(post.password, undefined);
      assert.equal(post.reportCount, undefined, "reportCount should be hidden from public");
      assert.ok(post.body);
      assert.ok(post.author);

      // Check author object properties
      const author = post.author;
      assert.equal(author.email, undefined, "Author email must NOT be exposed");
      assert.equal(author.password, undefined, "Author password must NOT be exposed");
      assert.equal(author.bio, undefined);
      assert.equal(author.status, undefined);
      assert.equal(author.vibes, undefined);

      // Verify ONLY allowlisted author fields are present
      const authorKeys = Object.keys(author).sort();
      assert.deepEqual(
        authorKeys,
        ["_id", "avatarPreset", "displayName", "username"].sort()
      );
    }
  });

  test("3. User A cannot edit or delete user B's post (403)", async () => {
    // User B creates a post
    const createRes = await request("/api/posts", {
      method: "POST",
      token: tokenB,
      body: {
        body: "Bob's public thought",
        mood: "🌱",
      },
    });
    assert.equal(createRes.status, 201);
    const postBId = createRes.data.data._id;

    // User A tries to edit Bob's post -> 403 Forbidden
    const editRes = await request(`/api/posts/${postBId}`, {
      method: "PATCH",
      token: tokenA,
      body: {
        body: "Alice trying to hack Bob's post",
      },
    });
    assert.equal(editRes.status, 403, "User A must not be allowed to edit User B's post");

    // User A tries to delete Bob's post -> 403 Forbidden
    const deleteRes = await request(`/api/posts/${postBId}`, {
      method: "DELETE",
      token: tokenA,
    });
    assert.equal(deleteRes.status, 403, "User A must not be allowed to delete User B's post");

    // Verify Bob CAN edit his own post
    const bobEditRes = await request(`/api/posts/${postBId}`, {
      method: "PATCH",
      token: tokenB,
      body: {
        body: "Bob updated his thought",
      },
    });
    assert.equal(bobEditRes.status, 200);
    assert.ok(bobEditRes.data.data.editedAt, "editedAt must be set on update");

    // Verify Bob CAN delete his own post
    const bobDeleteRes = await request(`/api/posts/${postBId}`, {
      method: "DELETE",
      token: tokenB,
    });
    assert.equal(bobDeleteRes.status, 200);
  });

  test("4. Rate limit triggers after 10 posts per hour per user", async () => {
    // User B will create posts until rate limit is reached
    // Note: User B already created 1 post in test 3
    let rateLimitHit = false;
    for (let i = 0; i < 12; i++) {
      const res = await request("/api/posts", {
        method: "POST",
        token: tokenB,
        body: { body: `Post test #${i}` },
      });
      if (res.status === 429) {
        rateLimitHit = true;
        break;
      }
    }
    assert.ok(rateLimitHit, "Rate limit (429) must be triggered when exceeding 10 posts/hr");
  });

  test("5. Pagination returns no duplicates or gaps", async () => {
    // Create a new separate user to avoid rate limit
    const hashed = await bcrypt.hash("Password123!", 10);
    const pagUser = await User.create({
      firstName: "Pager",
      email: "pager@test.com",
      password: hashed,
    });
    const pagToken = jwt.sign({ _id: pagUser._id }, process.env.JWT_SECRET || "nillu@5678");

    // Clean all posts to have an exact test set
    await Post.deleteMany({});

    // Insert 7 distinct posts with slightly staggered createdAt timestamps
    const now = Date.now();
    const createdPostIds = [];
    for (let i = 0; i < 7; i++) {
      const p = await Post.create({
        authorId: pagUser._id,
        body: `Chronological post ${i}`,
        createdAt: new Date(now - (7 - i) * 1000), // oldest to newest
      });
      createdPostIds.unshift(p._id.toString()); // newest first order expected
    }

    // Now fetch page by page with limit=3
    const allFetchedIds = [];
    let nextCursor = null;
    let nextCursorId = null;
    let hasMore = true;
    let pageCount = 0;

    while (hasMore && pageCount < 5) {
      pageCount++;
      let url = "/api/posts?limit=3";
      if (nextCursor && nextCursorId) {
        url += `&cursor=${encodeURIComponent(nextCursor)}&cursorId=${nextCursorId}`;
      }

      const res = await request(url, { method: "GET", token: pagToken });
      assert.equal(res.status, 200);

      const items = res.data.data;
      for (const item of items) {
        allFetchedIds.push(item._id);
      }

      hasMore = res.data.pagination.hasMore;
      nextCursor = res.data.pagination.nextCursor;
      nextCursorId = res.data.pagination.nextCursorId;
    }

    // Assert: No duplicates
    const uniqueIds = new Set(allFetchedIds);
    assert.equal(
      uniqueIds.size,
      allFetchedIds.length,
      "Pagination must not return duplicate items"
    );

    // Assert: No gaps (all 7 posts retrieved in correct order)
    assert.equal(allFetchedIds.length, 7, "All 7 posts must be retrieved without gaps");
    assert.deepEqual(allFetchedIds, createdPostIds, "Items must be returned in exact newest-first order");

    // Clean up pager user
    await User.deleteOne({ _id: pagUser._id });
    await Post.deleteMany({});
  });
});
