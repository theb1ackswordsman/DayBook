const CheckIn = require("../models/checkInModel");
const { serializeCheckIn } = require("../utils/serializers");

/**
 * Score a WHO-5 assessment server-side.
 * Official WHO-5 calculation:
 * - raw = sum of 5 items (each 0-5), range 0-25.
 * - score = raw * 4, range 0-100.
 * - raw < 13 indicates low well-being (depression risk cutoff).
 * - raw >= 13 is non-flagged.
 */
const calculateWho5 = (answers) => {
  if (!Array.isArray(answers) || answers.length !== 5) {
    throw new Error("WHO-5 requires exactly 5 responses.");
  }

  let raw = 0;
  for (const a of answers) {
    const val = Number(a);
    if (!Number.isInteger(val) || val < 0 || val > 5) {
      throw new Error("Each answer must be an integer between 0 and 5.");
    }
    raw += val;
  }

  const score = raw * 4;
  const flaggedLow = raw < 13;

  let band = "Good well-being";
  if (raw < 13) {
    band = "Low well-being";
  } else if (score < 70) {
    band = "Moderate well-being";
  }

  return { rawScore: raw, score, band, flaggedLow };
};

/**
 * Score a Mini-IPIP 20-item personality assessment.
 * Official calculation (Donnellan et al., 2006):
 * Scale 1-5.
 * Returns { extraversion, agreeableness, conscientiousness, neuroticism, openness } (each 4-20).
 */
const calculateMiniIpip = (answers) => {
  if (!Array.isArray(answers) || answers.length !== 20) {
    throw new Error("Mini-IPIP requires exactly 20 responses.");
  }

  const clean = [];
  for (const a of answers) {
    const val = Number(a);
    if (!Number.isInteger(val) || val < 1 || val > 5) {
      throw new Error("Each answer must be an integer between 1 and 5.");
    }
    clean.push(val);
  }

  // Reverse scoring helper: reverse(x) = 6 - x
  const rev = (x) => 6 - x;

  // Extraversion: Items 1 (+), 6 (-), 11 (+), 16 (-)
  const extraversion = clean[0] + rev(clean[5]) + clean[10] + rev(clean[15]);

  // Agreeableness: Items 2 (+), 7 (-), 12 (+), 17 (-)
  const agreeableness = clean[1] + rev(clean[6]) + clean[11] + rev(clean[16]);

  // Conscientiousness: Items 3 (+), 8 (-), 13 (+), 18 (-)
  const conscientiousness = clean[2] + rev(clean[7]) + clean[12] + rev(clean[17]);

  // Neuroticism: Items 4 (+), 9 (-), 14 (+), 19 (-)
  const neuroticism = clean[3] + rev(clean[8]) + clean[13] + rev(clean[18]);

  // Openness / Intellect: Items 5 (+), 10 (-), 15 (-), 20 (-)
  const openness = clean[4] + rev(clean[9]) + rev(clean[14]) + rev(clean[19]);

  return {
    traits: {
      extraversion,
      agreeableness,
      conscientiousness,
      neuroticism,
      openness,
    },
  };
};

/**
 * POST /api/checkins
 * Calculate score server-side and optionally save to history (max 1 per day).
 * Individual answers are NEVER saved to the database.
 */
const createCheckIn = async (req, res) => {
  try {
    const { type = "who5", answers, saveToHistory = true } = req.body;
    const userId = req.user._id;

    if (type !== "who5" && type !== "mini_ipip") {
      return res.status(422).json({ message: "Unsupported check-in type." });
    }

    if (type === "mini_ipip") {
      let calculation;
      try {
        calculation = calculateMiniIpip(answers);
      } catch (err) {
        return res.status(422).json({ message: err.message });
      }

      const { traits } = calculation;
      let savedDoc = null;

      if (saveToHistory) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const existingToday = await CheckIn.findOne({
          userId,
          type: "mini_ipip",
          createdAt: { $gte: startOfDay },
        });

        if (existingToday) {
          return res.status(409).json({
            message: "You have already saved a personality snapshot today. Only one saved result per day is allowed.",
            data: {
              type: "mini_ipip",
              traits,
              saved: false,
            },
          });
        }

        savedDoc = await CheckIn.create({
          userId,
          type: "mini_ipip",
          traits,
        });
      }

      return res.status(201).json({
        message: "Personality snapshot completed successfully.",
        data: savedDoc
          ? serializeCheckIn(savedDoc)
          : {
              type: "mini_ipip",
              traits,
              saved: false,
            },
      });
    }

    let calculation;
    try {
      calculation = calculateWho5(answers);
    } catch (err) {
      return res.status(422).json({ message: err.message });
    }

    const { rawScore, score, band, flaggedLow } = calculation;

    let savedDoc = null;

    if (saveToHistory) {
      // Enforce daily limit server-side: 1 check-in per calendar day
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const existingToday = await CheckIn.findOne({
        userId,
        type,
        createdAt: { $gte: startOfDay },
      });

      if (existingToday) {
        return res.status(409).json({
          message: "You have already saved a check-in today. Only one saved result per day is allowed.",
          data: {
            rawScore,
            score,
            band,
            flaggedLow,
            saved: false,
          },
        });
      }

      savedDoc = await CheckIn.create({
        userId,
        type,
        rawScore,
        score,
        band,
        flaggedLow,
      });
    }

    res.status(201).json({
      message: "Check-in completed successfully.",
      data: savedDoc
        ? serializeCheckIn(savedDoc)
        : {
            type,
            rawScore,
            score,
            band,
            flaggedLow,
            saved: false,
          },
    });
  } catch (error) {
    console.error("Error creating check-in:", error);
    res.status(500).json({ message: "Something went wrong! Please try again later." });
  }
};

/**
 * GET /api/checkins/me
 * Fetch own check-in history sorted newest first.
 */
const getMyCheckIns = async (req, res) => {
  try {
    const userId = req.user._id;
    const checkIns = await CheckIn.find({ userId }).sort({ createdAt: -1 }).limit(100);

    res.status(200).json({
      data: checkIns.map(serializeCheckIn),
    });
  } catch (error) {
    console.error("Error fetching check-ins:", error);
    res.status(500).json({ message: "Something went wrong! Please try again later." });
  }
};

/**
 * DELETE /api/checkins/me
 * Delete all check-in history for the logged-in user.
 */
const deleteMyCheckIns = async (req, res) => {
  try {
    const userId = req.user._id;
    await CheckIn.deleteMany({ userId });

    res.status(200).json({
      message: "Your check-in history has been deleted.",
    });
  } catch (error) {
    console.error("Error deleting check-ins:", error);
    res.status(500).json({ message: "Something went wrong! Please try again later." });
/**
 * GET /api/checkins/insights
 * Read-only aggregate stats across the community.
 * Purely aggregated numbers; never reveals individual identifiers or private records.
 */
const getInsights = async (req, res) => {
  try {
    const totalCheckIns = await CheckIn.countDocuments();
    const who5Docs = await CheckIn.find({ type: "who5" }).select("score band").lean();
    const ipipDocs = await CheckIn.find({ type: "mini_ipip" }).select("traits").lean();

    const who5Count = who5Docs.length;
    const miniIpipCount = ipipDocs.length;

    const avgWho5Score = who5Count > 0
      ? Math.round((who5Docs.reduce((acc, d) => acc + (d.score || 0), 0) / who5Count) * 10) / 10
      : 0;

    const bandDistribution = {
      "Good well-being": 0,
      "Moderate well-being": 0,
      "Low well-being": 0,
    };
    for (const d of who5Docs) {
      if (bandDistribution[d.band] !== undefined) {
        bandDistribution[d.band]++;
      }
    }

    const traitSums = { extraversion: 0, agreeableness: 0, conscientiousness: 0, neuroticism: 0, openness: 0 };
    for (const d of ipipDocs) {
      if (d.traits) {
        for (const k of Object.keys(traitSums)) {
          traitSums[k] += (d.traits[k] || 0);
        }
      }
    }
    const avgTraits = {};
    for (const k of Object.keys(traitSums)) {
      avgTraits[k] = miniIpipCount > 0 ? Math.round((traitSums[k] / miniIpipCount) * 10) / 10 : 0;
    }

    const Post = require("../models/postModel");
    const Reaction = require("../models/reactionModel");
    const User = require("../models/userModel");

    const totalPosts = await Post.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalHugs = await Reaction.countDocuments({ type: "hug" });
    const totalMeToos = await Reaction.countDocuments({ type: "metoo" });

    return res.status(200).json({
      success: true,
      data: {
        totalCheckIns,
        who5Count,
        miniIpipCount,
        avgWho5Score,
        bandDistribution,
        avgTraits,
        totalPosts,
        totalUsers,
        totalHugs,
        totalMeToos,
      },
    });
  } catch (error) {
    console.error("Error fetching insights:", error);
    res.status(500).json({ message: "Failed to load aggregate insights." });
  }
};

module.exports = {
  calculateWho5,
  calculateMiniIpip,
  createCheckIn,
  getMyCheckIns,
  deleteMyCheckIns,
  getInsights,
};
