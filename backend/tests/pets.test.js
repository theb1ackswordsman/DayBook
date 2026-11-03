const { test, describe, before, after } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const http = require("node:http");
const app = require("../src/index");
const User = require("../src/models/userModel");
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

describe("Pet Companion Widget & Backend Persistence Tests", () => {
  let userA, userB;
  let tokenA, tokenB;

  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/daybook");
    }

    await User.deleteMany({ email: { $in: ["pet_a@test.com", "pet_b@test.com"] } });

    const hashedPassword = await bcrypt.hash("Password123!", 10);

    userA = await User.create({
      email: "pet_a@test.com",
      firstName: "PetOwnerA",
      password: hashedPassword,
      ownedPets: [],
      activePetIndex: 0,
      petsHidden: false,
    });

    userB = await User.create({
      email: "pet_b@test.com",
      firstName: "PetOwnerB",
      password: hashedPassword,
      ownedPets: [{ type: "dog", name: "Barnaby" }],
      activePetIndex: 0,
      petsHidden: false,
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
    await User.deleteMany({ email: { $in: ["pet_a@test.com", "pet_b@test.com"] } });
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  test("1. Pet name validation - HTML tags stripped", async () => {
    const res = await request("/api/users/me", {
      method: "PATCH",
      token: tokenA,
      body: {
        ownedPets: [{ type: "cat", name: "<b>Whiskers</b>" }],
      },
    });

    assert.equal(res.status, 200);
    assert.equal(res.data.data.ownedPets[0].name, "Whiskers");
  });

  test("2. Pet name validation - rejects name > 20 chars", async () => {
    const res = await request("/api/users/me", {
      method: "PATCH",
      token: tokenA,
      body: {
        ownedPets: [{ type: "fox", name: "ThisNameIsFarTooLongForAPetCompanion" }],
      },
    });

    assert.equal(res.status, 422);
    assert.match(res.data.message, /under 20 characters/i);
  });

  test("3. Pet validation - max 3 pets enforced", async () => {
    const res = await request("/api/users/me", {
      method: "PATCH",
      token: tokenA,
      body: {
        ownedPets: [
          { type: "cat", name: "Milo" },
          { type: "dog", name: "Otis" },
          { type: "fox", name: "Rusty" },
          { type: "duck", name: "Quackers" },
        ],
      },
    });

    assert.equal(res.status, 422);
    assert.match(res.data.message, /at most 3 pets/i);
  });

  test("4. Pet validation - invalid pet type rejected", async () => {
    const res = await request("/api/users/me", {
      method: "PATCH",
      token: tokenA,
      body: {
        ownedPets: [{ type: "dragon", name: "Spyro" }],
      },
    });

    assert.equal(res.status, 422);
    assert.match(res.data.message, /invalid pet type/i);
  });

  test("5. Cannot edit another user's pet fields", async () => {
    // User A updates their own pets
    await request("/api/users/me", {
      method: "PATCH",
      token: tokenA,
      body: {
        ownedPets: [{ type: "cat", name: "Luna" }],
      },
    });

    // Verify User B's pets were unaffected
    const checkB = await request("/api/users/me", {
      method: "GET",
      token: tokenB,
    });

    assert.equal(checkB.status, 200);
    assert.equal(checkB.data.data.ownedPets.length, 1);
    assert.equal(checkB.data.data.ownedPets[0].name, "Barnaby");
  });

  test("6. Hide toggle persists in profile", async () => {
    // Set petsHidden to true
    const patchRes = await request("/api/users/me", {
      method: "PATCH",
      token: tokenA,
      body: {
        petsHidden: true,
      },
    });

    assert.equal(patchRes.status, 200);
    assert.equal(patchRes.data.data.petsHidden, true);

    // Fetch profile and verify
    const getRes = await request("/api/users/me", {
      method: "GET",
      token: tokenA,
    });

    assert.equal(getRes.status, 200);
    assert.equal(getRes.data.data.petsHidden, true);

    // Toggle back to false
    const toggleBack = await request("/api/users/me", {
      method: "PATCH",
      token: tokenA,
      body: {
        petsHidden: false,
      },
    });

    assert.equal(toggleBack.status, 200);
    assert.equal(toggleBack.data.data.petsHidden, false);
  });
});
