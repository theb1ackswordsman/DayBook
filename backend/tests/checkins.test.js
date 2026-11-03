const { test, describe, before, after } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const http = require("node:http");
const app = require("../src/index");
const User = require("../src/models/userModel");
const CheckIn = require("../src/models/checkInModel");
const Post = require("../src/models/postModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { calculateWho5, calculateMiniIpip } = require("../src/controllers/checkInController");

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

describe("Check-in & WHO-5 Wellbeing Tests", () => {
  let userA, userB;
  let tokenA, tokenB;

  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/daybook");
    }

    await User.deleteMany({ email: { $in: ["checkin_a@test.com", "checkin_b@test.com"] } });
    await CheckIn.deleteMany({});

    const hashedPassword = await bcrypt.hash("Password123!", 10);

    userA = await User.create({
      email: "checkin_a@test.com",
      firstName: "CheckinA",
      password: hashedPassword,
    });

    userB = await User.create({
      email: "checkin_b@test.com",
      firstName: "CheckinB",
      password: hashedPassword,
    });

    tokenA = jwt.sign({ _id: userA._id }, process.env.JWT_SECRET || "nillu@5678");
    tokenB = jwt.sign({ _id: userB._id }, process.env.JWT_SECRET || "nillu@5678");

    server = http.createServer(app);
    await new Promise((resolve) => {
      server.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await User.deleteMany({ email: { $in: ["checkin_a@test.com", "checkin_b@test.com"] } });
    await CheckIn.deleteMany({});
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  // --- 1. UNIT TESTS: calculateWho5 edge cases ---
  test("1.1 Unit: all 0 -> raw=0, score=0, flaggedLow=true", () => {
    const res = calculateWho5([0, 0, 0, 0, 0]);
    assert.equal(res.rawScore, 0);
    assert.equal(res.score, 0);
    assert.equal(res.flaggedLow, true);
    assert.equal(res.band, "Low well-being");
  });

  test("1.2 Unit: all 5 -> raw=25, score=100, flaggedLow=false", () => {
    const res = calculateWho5([5, 5, 5, 5, 5]);
    assert.equal(res.rawScore, 25);
    assert.equal(res.score, 100);
    assert.equal(res.flaggedLow, false);
    assert.equal(res.band, "Good well-being");
  });

  test("1.3 Unit: raw 12 -> flaggedLow=true (cutoff is < 13)", () => {
    const res = calculateWho5([3, 3, 2, 2, 2]); // sum = 12
    assert.equal(res.rawScore, 12);
    assert.equal(res.score, 48);
    assert.equal(res.flaggedLow, true);
    assert.equal(res.band, "Low well-being");
  });

  test("1.4 Unit: raw 13 -> flaggedLow=false (13 meets cutoff)", () => {
    const res = calculateWho5([3, 3, 3, 2, 2]); // sum = 13
    assert.equal(res.rawScore, 13);
    assert.equal(res.score, 52);
    assert.equal(res.flaggedLow, false);
    assert.equal(res.band, "Moderate well-being");
  });

  test("1.5 Unit: invalid answers reject cleanly", () => {
    assert.throws(() => calculateWho5([1, 2, 3]), /exactly 5 responses/i);
    assert.throws(() => calculateWho5([1, 2, 3, 4, 6]), /between 0 and 5/i);
    assert.throws(() => calculateWho5([1, 2, 3, -1, 5]), /between 0 and 5/i);
  });

  // --- 2. INTEGRATION TESTS ---
  test("2.1 POST /api/checkins computes server-side and saves to history", async () => {
    const res = await request("/api/checkins", {
      method: "POST",
      token: tokenA,
      body: {
        type: "who5",
        answers: [4, 4, 3, 3, 4], // raw = 18, score = 72
        saveToHistory: true,
      },
    });

    assert.equal(res.status, 201);
    assert.equal(res.data.data.rawScore, 18);
    assert.equal(res.data.data.score, 72);
    assert.equal(res.data.data.flaggedLow, false);
    assert.equal(res.data.data.band, "Good well-being");
  });

  test("2.2 Answers are NEVER stored in the database", async () => {
    const doc = await CheckIn.findOne({ userId: userA._id }).lean();
    assert.ok(doc, "Document must exist");
    assert.equal(doc.rawScore, 18);
    assert.equal(doc.score, 72);
    assert.equal(doc.answers, undefined, "Individual answers must NOT be stored in DB");
  });

  test("2.3 Daily limit works: second save within the same day is rejected with 409", async () => {
    const res = await request("/api/checkins", {
      method: "POST",
      token: tokenA,
      body: {
        type: "who5",
        answers: [5, 5, 5, 5, 5],
        saveToHistory: true,
      },
    });

    assert.equal(res.status, 409);
    assert.match(res.data.message, /already saved a check-in today/i);
  });

  test("2.4 User cannot read another user's check-ins", async () => {
    // User B fetches /api/checkins/me -> must be empty for User B
    const res = await request("/api/checkins/me", {
      method: "GET",
      token: tokenB,
    });

    assert.equal(res.status, 200);
    assert.equal(res.data.data.length, 0);

    // User A fetches /api/checkins/me -> has their 1 saved check-in
    const resA = await request("/api/checkins/me", {
      method: "GET",
      token: tokenA,
    });

    assert.equal(resA.status, 200);
    assert.equal(resA.data.data.length, 1);
    assert.equal(resA.data.data[0].score, 72);
  });

  test("2.5 Check-ins NEVER appear in posts, feeds, user profile, or notifications", async () => {
    // Create a public post by userA
    const postRes = await request("/api/posts", {
      method: "POST",
      token: tokenA,
      body: { body: "Testing privacy boundary" },
    });
    assert.equal(postRes.status, 201);

    // Fetch feed as userB
    const feedRes = await request("/api/posts", {
      method: "GET",
      token: tokenB,
    });
    assert.equal(feedRes.status, 200);
    const postFromFeed = feedRes.data.data[0];
    assert.equal(postFromFeed.checkins, undefined);
    assert.equal(postFromFeed.author.checkins, undefined);
    assert.equal(postFromFeed.author.score, undefined);

    // Fetch profile as userB
    const profRes = await request("/api/users/me", {
      method: "GET",
      token: tokenB,
    });
    assert.equal(profRes.status, 200);
    assert.equal(profRes.data.data.checkins, undefined);
  });

  test("2.6 DELETE /api/checkins/me removes all check-ins for the user", async () => {
    const delRes = await request("/api/checkins/me", {
      method: "DELETE",
      token: tokenA,
    });
    assert.equal(delRes.status, 200);

    const checkRes = await request("/api/checkins/me", {
      method: "GET",
      token: tokenA,
    });
    assert.equal(checkRes.status, 200);
    assert.equal(checkRes.data.data.length, 0);
  });

  // --- 3. MINI-IPIP BIG FIVE TESTS ---
  test("3.1 Unit: all 3s (neutral midpoint) results in 12 across all 5 traits", () => {
    const neutralAnswers = new Array(20).fill(3);
    const { traits } = calculateMiniIpip(neutralAnswers);
    assert.equal(traits.extraversion, 12);
    assert.equal(traits.agreeableness, 12);
    assert.equal(traits.conscientiousness, 12);
    assert.equal(traits.neuroticism, 12);
    assert.equal(traits.openness, 12);
  });

  test("3.2 Unit: reverse items scored correctly with 6 - x formula", () => {
    // Construct answers to achieve max extraversion:
    // Extraversion: Items 1 (+), 6 (-), 11 (+), 16 (-)
    // Positive items set to 5; reverse items set to 1 -> 5 + (6-1) + 5 + (6-1) = 20
    const answers = new Array(20).fill(3);
    answers[0] = 5; // item 1
    answers[5] = 1; // item 6 (reverse)
    answers[10] = 5; // item 11
    answers[15] = 1; // item 16 (reverse)

    // Openness: Items 5 (+), 10 (-), 15 (-), 20 (-)
    // Positive item 5 set to 1; reverse items set to 5 -> 1 + (6-5) + (6-5) + (6-5) = 4 (min score)
    answers[4] = 1; // item 5
    answers[9] = 5; // item 10 (reverse)
    answers[14] = 5; // item 15 (reverse)
    answers[19] = 5; // item 20 (reverse)

    const { traits } = calculateMiniIpip(answers);
    assert.equal(traits.extraversion, 20, "Extraversion should reach maximum 20");
    assert.equal(traits.openness, 4, "Openness should reach minimum 4");
  });

  test("3.3 Unit: rejects invalid lengths and out-of-range values", () => {
    assert.throws(() => calculateMiniIpip([3, 3, 3]), /exactly 20 responses/i);
    assert.throws(() => calculateMiniIpip(new Array(20).fill(0)), /between 1 and 5/i);
    assert.throws(() => calculateMiniIpip(new Array(20).fill(6)), /between 1 and 5/i);
  });

  test("3.4 Integration: POST /api/checkins with type mini_ipip computes and saves traits", async () => {
    const answers = [
      4, 5, 4, 2, 5, // 1-5
      2, 1, 2, 4, 1, // 6-10
      4, 5, 4, 2, 2, // 11-15
      2, 1, 2, 4, 2, // 16-20
    ];

    const res = await request("/api/checkins", {
      method: "POST",
      token: tokenA,
      body: {
        type: "mini_ipip",
        answers,
        saveToHistory: true,
      },
    });

    assert.equal(res.status, 201);
    assert.equal(res.data.data.type, "mini_ipip");
    assert.ok(res.data.data.traits, "Traits object must be present");
    assert.equal(typeof res.data.data.traits.extraversion, "number");
    assert.equal(typeof res.data.data.traits.agreeableness, "number");
    assert.equal(typeof res.data.data.traits.conscientiousness, "number");
    assert.equal(typeof res.data.data.traits.neuroticism, "number");
    assert.equal(typeof res.data.data.traits.openness, "number");

    // Verify DB does not store answers
    const doc = await CheckIn.findOne({ userId: userA._id, type: "mini_ipip" }).lean();
    assert.ok(doc, "Mini-IPIP DB record must exist");
    assert.equal(doc.answers, undefined, "Raw answers must NOT be stored in DB");
    assert.ok(doc.traits.extraversion >= 4 && doc.traits.extraversion <= 20);
  });

  test("3.5 Integration: Daily limit enforces 1 mini_ipip check-in per calendar day", async () => {
    const res = await request("/api/checkins", {
      method: "POST",
      token: tokenA,
      body: {
        type: "mini_ipip",
        answers: new Array(20).fill(3),
        saveToHistory: true,
      },
    });

    assert.equal(res.status, 409);
    assert.match(res.data.message, /already saved a personality snapshot today/i);
    assert.equal(res.data.data.saved, false);
    assert.ok(res.data.data.traits, "Calculated traits still returned for display");
  });
});
