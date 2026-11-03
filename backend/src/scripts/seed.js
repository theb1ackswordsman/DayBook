const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/userModel");
const Post = require("../models/postModel");
const Comment = require("../models/commentModel");
const Reaction = require("../models/reactionModel");
const Entry = require("../models/entryModel");
const CheckIn = require("../models/checkInModel");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/daybook";

// Helper for dates in the past (daysAgo, hoursOffset, minutesOffset)
const getDateAgo = (daysAgo, hoursOffset = 0, minutesOffset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(d.getHours() - hoursOffset);
  d.setMinutes(d.getMinutes() - minutesOffset);
  return d;
};

// 15 Distinct Personas
const PERSONAS = [
  {
    email: "alex@daybook.app",
    firstName: "Alex",
    lastName: "Rivera",
    displayName: "Alex Rivera",
    status: "Finding calm in early mornings ☕",
    bio: "Morning person, matcha enthusiast, practicing mindful presence. Documenting small victories and learning to breathe through the rush.",
    vibes: ["Mindfulness", "Morning Routine", "Nature"],
    coverPreset: "gradient-twilight",
    avatarPreset: "initials",
    ownedPets: [{ type: "cat", name: "Mochi" }],
    activePetIndex: 0,
  },
  {
    email: "maya@daybook.app",
    firstName: "Maya",
    lastName: "Chen",
    displayName: "Maya Chen",
    status: "Clay on my hands, peace in my mind 🏺",
    bio: "UX designer by day, ceramic potter by night. Learning to embrace the beauty of imperfect shapes and slow evenings.",
    vibes: ["Creative", "Art", "Slow Living"],
    coverPreset: "gradient-sunset",
    avatarPreset: "initials",
    ownedPets: [{ type: "dog", name: "Biscuit" }],
    activePetIndex: 0,
  },
  {
    email: "liam@daybook.app",
    firstName: "Liam",
    lastName: "Taylor",
    displayName: "Liam Taylor",
    status: "One step at a time 🏃",
    bio: "Overthinking less, running more trails. Marathon training, dark roast coffee, and learning to sit comfortably with silence.",
    vibes: ["Fitness", "Journaling", "Books"],
    coverPreset: "gradient-forest",
    avatarPreset: "initials",
    ownedPets: [{ type: "fox", name: "Rusty" }],
    activePetIndex: 0,
  },
  {
    email: "samira@daybook.app",
    firstName: "Samira",
    lastName: "Khan",
    displayName: "Samira Khan",
    status: "Pouring warmth into others & myself 🫖",
    bio: "Therapist-in-training. Writing as an act of self-compassion. Big believer in chamomile tea, rainy afternoons, and gentle boundaries.",
    vibes: ["Self-Care", "Empathy", "Psychology"],
    coverPreset: "gradient-ocean",
    avatarPreset: "initials",
    ownedPets: [{ type: "duck", name: "Waddles" }],
    activePetIndex: 0,
  },
  {
    email: "jordan@daybook.app",
    firstName: "Jordan",
    lastName: "Lee",
    displayName: "Jordan Lee",
    status: "Debugging code & tending houseplants 🌿",
    bio: "Software developer recovering from hustle culture. Learning botany from scratch and discovering life outside of screens.",
    vibes: ["Tech", "Plants", "Balance"],
    coverPreset: "gradient-twilight",
    avatarPreset: "initials",
    ownedPets: [{ type: "dog", name: "Kona" }],
    activePetIndex: 0,
  },
  {
    email: "elena@daybook.app",
    firstName: "Elena",
    lastName: "Gomez",
    displayName: "Elena Gomez",
    status: "Between the pages of old books 📖",
    bio: "Poet, secondhand bookstore browser, and gentle soul. Celebrating little moments of golden hour and heartfelt conversations.",
    vibes: ["Poetry", "Reading", "Reflection"],
    coverPreset: "gradient-sunset",
    avatarPreset: "initials",
    ownedPets: [{ type: "cat", name: "Luna" }],
    activePetIndex: 0,
  },
  {
    email: "noah@daybook.app",
    firstName: "Noah",
    lastName: "Patel",
    displayName: "Noah Patel",
    status: "Rebuilding focus after burnout 🏛️",
    bio: "Architect sketching the world with charcoal. Navigating recovery with patience, daily strolls, and less perfectionism.",
    vibes: ["Architecture", "Recovery", "Sketching"],
    coverPreset: "gradient-forest",
    avatarPreset: "initials",
    ownedPets: [],
  },
  {
    email: "chloe@daybook.app",
    firstName: "Chloe",
    lastName: "Bennett",
    displayName: "Chloe Bennett",
    status: "Piano melodies & sourdough loaves 🎹",
    bio: "Elementary music educator. Believer in kindness, melody, sourdough bubbles, and leaving space for spontaneous laughter.",
    vibes: ["Music", "Baking", "Gratitude"],
    coverPreset: "gradient-ocean",
    avatarPreset: "initials",
    ownedPets: [{ type: "duck", name: "Pip" }],
    activePetIndex: 0,
  },
  {
    email: "david@daybook.app",
    firstName: "David",
    lastName: "Kim",
    displayName: "David Kim",
    status: "Father, reader, student of calm 🏔️",
    bio: "Dad of two curious kids. Exploring stoic philosophy and how to bring quiet resilience into modern family life.",
    vibes: ["Parenting", "Stoicism", "Meditation"],
    coverPreset: "gradient-twilight",
    avatarPreset: "initials",
    ownedPets: [],
  },
  {
    email: "priya@daybook.app",
    firstName: "Priya",
    lastName: "Sharma",
    displayName: "Priya Sharma",
    status: "Leaving the hospital coat behind 🩺",
    bio: "Pediatric resident finding grounding outside clinical walls. Doodling with watercolors and learning to rest without feeling guilty.",
    vibes: ["Healthcare", "Art", "Mindfulness"],
    coverPreset: "gradient-sunset",
    avatarPreset: "initials",
    ownedPets: [{ type: "cat", name: "Chai" }],
    activePetIndex: 0,
  },
  {
    email: "lucas@daybook.app",
    firstName: "Lucas",
    lastName: "Silva",
    displayName: "Lucas Silva",
    status: "Colors, coffee, and quiet reflections 🎨",
    bio: "Freelance illustrator. Exploring the emotional landscapes of solitude, friendship, and quiet Saturday mornings.",
    vibes: ["Illustration", "Rest", "Design"],
    coverPreset: "gradient-forest",
    avatarPreset: "initials",
    ownedPets: [],
  },
  {
    email: "harper@daybook.app",
    firstName: "Harper",
    lastName: "Vance",
    displayName: "Harper Vance",
    status: "Out in the woods with binoculars 🌲",
    bio: "Ecology graduate student. Counting birds, listening to river currents, and finding peace in ecosystems greater than ourselves.",
    vibes: ["Outdoors", "Ecology", "Photography"],
    coverPreset: "gradient-ocean",
    avatarPreset: "initials",
    ownedPets: [{ type: "fox", name: "Ember" }],
    activePetIndex: 0,
  },
  {
    email: "zoe@daybook.app",
    firstName: "Zoe",
    lastName: "Robinson",
    displayName: "Zoe Robinson",
    status: "Embracing messy first drafts ✍️",
    bio: "Writer and recovering perfectionist. Learning that progress isn't linear and showing up imperfectly is enough.",
    vibes: ["Writing", "Growth", "Courage"],
    coverPreset: "gradient-twilight",
    avatarPreset: "initials",
    ownedPets: [],
  },
  {
    email: "tariq@daybook.app",
    firstName: "Tariq",
    lastName: "Mansoor",
    displayName: "Tariq Mansoor",
    status: "Teaching literature & brewing pour-overs 📚",
    bio: "High school English teacher. Passionate about stories that build empathy, warm chai, and handwritten thank-you notes.",
    vibes: ["Teaching", "Literature", "Coffee"],
    coverPreset: "gradient-sunset",
    avatarPreset: "initials",
    ownedPets: [{ type: "dog", name: "Barley" }],
    activePetIndex: 0,
  },
  {
    email: "sofia@daybook.app",
    firstName: "Sofia",
    lastName: "Rossi",
    displayName: "Sofia Rossi",
    status: "Cooking intuitively with warmth 🍲",
    bio: "Pastry apprentice navigating food anxiety and emotional wellness. Cooking food that brings friends together around the table.",
    vibes: ["Cooking", "Wellness", "Community"],
    coverPreset: "gradient-forest",
    avatarPreset: "initials",
    ownedPets: [{ type: "cat", name: "Noodle" }],
    activePetIndex: 0,
  },
];

// 40 Public Posts across 6 moods, spread across 60 days
const POST_TEMPLATES = [
  // Day 0-2 (Recent)
  {
    daysAgo: 0,
    authorIndex: 0, // Alex
    mood: "😌",
    body: "Woke up before the alarm today. Made a cup of warm tea and sat by the window watching the mist lift. No phone, no news, just 20 minutes of pure stillness.",
  },
  {
    daysAgo: 1,
    authorIndex: 1, // Maya
    mood: "✨",
    body: "Finally finished a ceramic bowl that broke twice during firing. Instead of throwing it away, I repaired it with gold lacquer. Flaws can be the prettiest part.",
  },
  {
    daysAgo: 1,
    authorIndex: 2, // Liam
    mood: "🌱",
    body: "Pushed through a 10k run even when my brain tried convincing me to stay in bed. Sometimes self-discipline is the gentlest form of self-respect.",
  },
  {
    daysAgo: 2,
    authorIndex: 3, // Samira
    mood: "🙂",
    body: "A client smiled today realizing how much they've healed over six months. Watching someone slowly forgive themselves is one of the greatest privileges in life.",
  },
  {
    daysAgo: 3,
    authorIndex: 4, // Jordan
    mood: "😡",
    body: "Spent 4 hours tracking a bug only to realize it was a missing environment variable. Frustrated at the wasted time, but taking a deep breath and heading outside for air.",
  },
  {
    daysAgo: 4,
    authorIndex: 5, // Elena
    mood: "😌",
    body: "Found an old copy of Mary Oliver poems at the flea market with handwritten notes in the margins from 1984. Feels like sharing a quiet secret across time.",
  },
  {
    daysAgo: 5,
    authorIndex: 6, // Noah
    mood: "😔",
    body: "Burnout recovery is weird. Some days I feel capable and creative, and other days answering two emails exhausts me completely. Giving myself permission to rest today.",
  },
  {
    daysAgo: 6,
    authorIndex: 7, // Chloe
    mood: "✨",
    body: "My 7-year-old student finally played their first full song on piano without hesitating. The look of pure pride in their eyes lit up the entire room.",
  },
  {
    daysAgo: 7,
    authorIndex: 8, // David
    mood: "🌱",
    body: "Read Marcus Aurelius while the kids were napping: 'You have power over your mind - not outside events. Realize this, and you will find strength.' Simple, timeless grounding.",
  },
  {
    daysAgo: 8,
    authorIndex: 9, // Priya
    mood: "😔",
    body: "A tough night shift in the pediatric ER. Holding space for frightened families takes everything out of you. Grateful for the warm shower and my purring cat right now.",
  },
  {
    daysAgo: 9,
    authorIndex: 10, // Lucas
    mood: "🙂",
    body: "Doodled without any client brief for the first time in months. Bright goofy creatures eating pastries. Reminded me why I fell in love with drawing in the first place.",
  },
  {
    daysAgo: 11,
    authorIndex: 11, // Harper
    mood: "✨",
    body: "Spotted a family of river otters playing along the bank at dusk! Nature has this effortless way of reminding you how joyful and unbothered existence can be.",
  },
  {
    daysAgo: 12,
    authorIndex: 12, // Zoe
    mood: "😡",
    body: "Got another polite manuscript rejection. It stings, not going to lie. But I am going to let myself feel the disappointment for tonight, eat some pasta, and submit again tomorrow.",
  },
  {
    daysAgo: 13,
    authorIndex: 13, // Tariq
    mood: "🙂",
    body: "My students had an impassioned debate today about courage in To Kill a Mockingbird. Seeing young people care deeply about justice restores my faith in tomorrow.",
  },
  {
    daysAgo: 14,
    authorIndex: 14, // Sofia
    mood: "😌",
    body: "Baked rosemary focaccia from scratch today. The slow kneading, the smell of olive oil in a warm oven... cooking really is my favorite form of moving meditation.",
  },
  {
    daysAgo: 16,
    authorIndex: 0, // Alex
    mood: "🌱",
    body: "Set a boundary at work today and logged off right at 5:30. Nobody panicked. The world didn't end. Turns out most urgency is just manufactured noise.",
  },
  {
    daysAgo: 17,
    authorIndex: 1, // Maya
    mood: "😌",
    body: "Turned all notifications off for a 24-hour digital detox. My attention span felt so much longer, and my chest felt noticeably lighter. Doing this every Sunday now.",
  },
  {
    daysAgo: 19,
    authorIndex: 2, // Liam
    mood: "🙂",
    body: "Ran in the light rain this morning. Cold drops on my face and nobody else on the trail. Felt like a kid splashing in puddles again.",
  },
  {
    daysAgo: 21,
    authorIndex: 3, // Samira
    mood: "🌱",
    body: "Friendly reminder to anyone who needs it: you do not need to earn your right to rest. Being a human is already exhausting enough.",
  },
  {
    daysAgo: 22,
    authorIndex: 4, // Jordan
    mood: "✨",
    body: "My monster plant just unfurled its first fenestrated leaf after 6 months of patient watering and moving it between sunny windows! Patience rewarded.",
  },
  {
    daysAgo: 24,
    authorIndex: 5, // Elena
    mood: "😔",
    body: "Feeling a wave of quiet loneliness tonight. Nothing specifically went wrong, just that hollow ache in the ribs. Lighting a candle and putting on soft jazz.",
  },
  {
    daysAgo: 25,
    authorIndex: 6, // Noah
    mood: "🌱",
    body: "Took my sketchbook to a park bench and drew tree trunks instead of blueprints. No straight edges, no clients, just natural curves. Therapeutic afternoon.",
  },
  {
    daysAgo: 27,
    authorIndex: 7, // Chloe
    mood: "🙂",
    body: "Practiced Chopin nocturnes until my fingertips were tired. Music expresses whatever words are too clumsy to articulate.",
  },
  {
    daysAgo: 29,
    authorIndex: 8, // David
    mood: "😌",
    body: "Built a pillow fort in the living room with the kids. We ate apple slices with peanut butter inside with flashlights. Best Friday night in months.",
  },
  {
    daysAgo: 31,
    authorIndex: 9, // Priya
    mood: "🌱",
    body: "Took my first full weekend off in three months. Did not look at hospital emails once. Slept 9 hours and made berry pancakes.",
  },
  {
    daysAgo: 32,
    authorIndex: 10, // Lucas
    mood: "😡",
    body: "Client asking for the 6th round of 'small adjustments' on an invoice that was due 3 weeks ago. Taking deep breaths and standing firm on payment terms.",
  },
  {
    daysAgo: 34,
    authorIndex: 11, // Harper
    mood: "🙂",
    body: "Camping trip under the stars. The air smells like wet pine needles and campfire smoke. So grateful for wide open horizons.",
  },
  {
    daysAgo: 36,
    authorIndex: 12, // Zoe
    mood: "✨",
    body: "Wrote 2,000 words today where the characters felt genuinely alive. Flow state is rare, but when it clicks, nothing else compares.",
  },
  {
    daysAgo: 38,
    authorIndex: 13, // Tariq
    mood: "😌",
    body: "Sitting on the porch listening to gentle thunderstorms. Hot cardamom tea in hand. One of those evenings you wish you could bottle up.",
  },
  {
    daysAgo: 40,
    authorIndex: 14, // Sofia
    mood: "🙂",
    body: "Cooked a huge pot of Tuscan bean stew and invited three neighbors over. Strangers become friends so quickly over warm bread and honest stories.",
  },
  {
    daysAgo: 42,
    authorIndex: 0, // Alex
    mood: "✨",
    body: "Practicing gratitude before sleep: warm socks, fresh clean sheets, a good book, and people who answer the phone when I call.",
  },
  {
    daysAgo: 44,
    authorIndex: 1, // Maya
    mood: "🌱",
    body: "Learned to stop saying 'sorry' when asking for what I need, and start saying 'thank you for your patience' instead. A subtle shift that changes self-perception.",
  },
  {
    daysAgo: 46,
    authorIndex: 2, // Liam
    mood: "😔",
    body: "Sprained my ankle on a root during a trail descent. Off running for at least 3 weeks. Really struggling with having my primary stress release taken away.",
  },
  {
    daysAgo: 48,
    authorIndex: 3, // Samira
    mood: "😌",
    body: "Journaling prompt for anyone feeling overwhelmed: 'What is one thing on your plate right now that belongs to someone else?' Give it back.",
  },
  {
    daysAgo: 50,
    authorIndex: 4, // Jordan
    mood: "🌱",
    body: "Finally cleaned out the garage corner that had been staring at me for a year. It's funny how external order immediately brings internal clarity.",
  },
  {
    daysAgo: 52,
    authorIndex: 5, // Elena
    mood: "✨",
    body: "A flock of cedar waxwings landed in the berry tree right outside my window. Their gentle chatter was like tiny silver bells in the morning breeze.",
  },
  {
    daysAgo: 54,
    authorIndex: 6, // Noah
    mood: "😡",
    body: "City council voted down the community green space project in favor of a commercial parking lot. Disheartening to see short-term profit beat long-term well-being.",
  },
  {
    daysAgo: 56,
    authorIndex: 7, // Chloe
    mood: "😌",
    body: "Sunday evening ritual: lighting a beeswax candle, brewing chamomile tea, and writing three things that went right this week.",
  },
  {
    daysAgo: 57,
    authorIndex: 8, // David
    mood: "🙂",
    body: "Taught my daughter how to ride her bicycle without training wheels today. When she realized I had let go and she was gliding on her own, her smile was everything.",
  },
  {
    daysAgo: 58,
    authorIndex: 11, // Harper
    mood: "🌱",
    body: "Collected water samples from the alpine creek. The data shows signs of ecosystem recovery after last year's drought. Nature heals when given the room.",
  },
];

// Peer support comments templates
const COMMENT_TEMPLATES = [
  "Thank you for sharing this. Really needed to read this reminder today.",
  "Sending you so much warmth and gentle energy right now ❤️",
  "So relatable! I struggled with the exact same thing last week.",
  "What a lovely moment. Savor every second of it!",
  "Take it easy on yourself. You are doing so much better than you give yourself credit for.",
  "This brought a genuine smile to my face. Thank you for putting it into words.",
  "Completely agree. Small consistent boundaries change everything over time.",
  "I love this perspective so much. Bookmarking this thought.",
  "Rest well friend! Tomorrow is a completely clean page.",
  "Proud of you for taking that step. It takes real courage.",
  "That sounds so peaceful. Reminds me to slow down too.",
  "Hugs to you! Be gentle with your heart today.",
];

const REPLY_TEMPLATES = [
  "Thank you so much, your words really comforted me! ❤️",
  "I appreciate that more than you know. Hope you have a restful evening too.",
  "Exactly! Taking it one breath at a time.",
  "Means the world to hear from someone who understands.",
  "Thank you for the encouragement, friend!",
];

async function seedDatabase(options = {}) {
  const isReset = options.reset || process.argv.includes("--reset");

  console.log(`\n🌱 [Seed Script] Connecting to MongoDB: ${MONGO_URI}`);
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB.");

  if (isReset) {
    console.log("🧹 Reset flag specified. Dropping existing collections...");
    await User.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
    await Reaction.deleteMany({});
    await Entry.deleteMany({});
    await CheckIn.deleteMany({});
    console.log("✅ Cleaned existing data.");
  } else {
    // Check if demo users already exist
    const existingCount = await User.countDocuments({ email: "alex@daybook.app" });
    if (existingCount > 0) {
      console.log("ℹ️ Demo data already present. Use --reset to re-seed from scratch.");
      await mongoose.disconnect();
      return;
    }
  }

  // 1. Create Users
  console.log(`\n👤 Creating ${PERSONAS.length} synthetic users...`);
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const createdUsers = [];
  for (let i = 0; i < PERSONAS.length; i++) {
    const p = PERSONAS[i];
    const userDoc = await User.create({
      ...p,
      password: passwordHash,
      createdAt: getDateAgo(60 - i),
      updatedAt: getDateAgo(60 - i),
    });
    createdUsers.push(userDoc);
  }
  console.log(`✅ Created ${createdUsers.length} users successfully.`);

  // 2. Create Public Posts
  console.log(`\n📝 Creating ${POST_TEMPLATES.length} public community posts...`);
  const createdPosts = [];

  for (const t of POST_TEMPLATES) {
    const author = createdUsers[t.authorIndex];
    const createdAt = getDateAgo(t.daysAgo, Math.floor(Math.random() * 8) + 2, Math.floor(Math.random() * 50));

    const postDoc = await Post.create({
      authorId: author._id,
      body: t.body,
      mood: t.mood,
      hugCount: 0,
      meTooCount: 0,
      commentCount: 0,
      createdAt,
      updatedAt: createdAt,
    });
    createdPosts.push(postDoc);
  }
  console.log(`✅ Created ${createdPosts.length} posts.`);

  // 3. Create Comments & 1-Level Nested Replies (target: 65-75 comments)
  console.log("\n💬 Creating realistic peer-support comments & replies...");
  const createdComments = [];
  const rootCommentsByPost = {};

  // For each post, add 1-3 root comments from other users
  for (let pIdx = 0; pIdx < createdPosts.length; pIdx++) {
    const post = createdPosts[pIdx];
    rootCommentsByPost[post._id.toString()] = [];

    // pick 1 or 2 root comments (total ~54 root comments)
    const numComments = (pIdx % 3 === 0) ? 2 : 1;
    const authorIdStr = post.authorId.toString();

    // candidate commenters (not the post author)
    const candidates = createdUsers.filter((u) => u._id.toString() !== authorIdStr);

    for (let c = 0; c < numComments; c++) {
      const commenter = candidates[(pIdx * 3 + c) % candidates.length];
      const commentText = COMMENT_TEMPLATES[(pIdx + c) % COMMENT_TEMPLATES.length];

      // Comment timestamp: 15 mins to 4 hours after post creation
      const commentDate = new Date(post.createdAt.getTime() + (c * 45 + 15) * 60 * 1000);

      const commentDoc = await Comment.create({
        postId: post._id,
        authorId: commenter._id,
        parentId: null, // Root comment
        body: commentText,
        createdAt: commentDate,
        updatedAt: commentDate,
      });

      createdComments.push(commentDoc);
      rootCommentsByPost[post._id.toString()].push(commentDoc);
    }
  }

  // Now add 16 1-level replies (author replying back to a root comment -> total ~70 comments)
  for (let pIdx = 0; pIdx < 32; pIdx += 2) {
    const post = createdPosts[pIdx];
    const roots = rootCommentsByPost[post._id.toString()];
    if (roots && roots.length > 0) {
      const rootComment = roots[0];
      const replyText = REPLY_TEMPLATES[pIdx % REPLY_TEMPLATES.length];
      const replyDate = new Date(rootComment.createdAt.getTime() + 25 * 60 * 1000);

      const replyDoc = await Comment.create({
        postId: post._id,
        authorId: post.authorId, // post author replies to root comment
        parentId: rootComment._id, // Strictly 1 level deep!
        body: replyText,
        createdAt: replyDate,
        updatedAt: replyDate,
      });
      createdComments.push(replyDoc);
    }
  }

  console.log(`✅ Created ${createdComments.length} comments (including root comments & 1-level replies).`);

  // 4. Create Reactions (Hugs & Me-toos) (target: ~120 reactions)
  console.log("\n🫂 Creating ~120 reactions (hugs & me-toos)...");
  let reactionCount = 0;

  for (let pIdx = 0; pIdx < createdPosts.length; pIdx++) {
    const post = createdPosts[pIdx];
    const authorIdStr = post.authorId.toString();
    const otherUsers = createdUsers.filter((u) => u._id.toString() !== authorIdStr);

    // Give each post 2-4 reactions (average 3 -> 120 reactions)
    const countForPost = 2 + (pIdx % 3); // 2, 3, or 4
    for (let r = 0; r < countForPost; r++) {
      const user = otherUsers[(pIdx * 2 + r) % otherUsers.length];
      const type = (r % 2 === 0) ? "hug" : "metoo";

      try {
        await Reaction.create({
          postId: post._id,
          userId: user._id,
          type,
          createdAt: new Date(post.createdAt.getTime() + (r * 30 + 10) * 60 * 1000),
        });
        reactionCount++;
      } catch (err) {
        // Unique index deduplication fallback
      }
    }
  }
  console.log(`✅ Created ${reactionCount} reactions.`);

  // 5. Update Denormalized Counts on all Posts
  console.log("\n🔄 Updating denormalized post counts (hugCount, meTooCount, commentCount)...");
  for (const post of createdPosts) {
    const hugs = await Reaction.countDocuments({ postId: post._id, type: "hug" });
    const meToos = await Reaction.countDocuments({ postId: post._id, type: "metoo" });
    const comments = await Comment.countDocuments({ postId: post._id });

    await Post.findByIdAndUpdate(post._id, {
      hugCount: hugs,
      meTooCount: meToos,
      commentCount: comments,
    });
  }
  console.log("✅ Synchronized denormalized counts on all posts.");

  // 6. Create Private Journal Entries (~30 entries spread across users and 60 days)
  console.log("\n🔒 Creating ~30 strictly private journal entries...");
  const ENTRY_SAMPLES = [
    { title: "Reflecting on boundaries", mood: "🌱", content: "Today I practiced pausing before agreeing to extra commitments. It felt uncomfortable at first, but my evening was peaceful." },
    { title: "Coffee & morning rain", mood: "😌", content: "Listening to the rain against the skylight. Grateful for quiet moments before the city wakes up." },
    { title: "Hard therapy session", mood: "😔", content: "Unpacked some heavy memories today. Feeling emotionally drained, but I know healing requires feeling things fully." },
    { title: "Overcoming creative block", mood: "✨", content: "Finally sat down and sketched without expectations. Three hours flew by in a state of flow." },
    { title: "Frustrated with work pace", mood: "😡", content: "Felt unheard in today's planning meeting. Writing it down to release the tightness in my chest before dinner." },
    { title: "Sunday reset", mood: "🙂", content: "Clean sheets, watered plants, prepped vegetable soup. Starting the week with clear surfaces and a calm mind." },
  ];

  let entryCount = 0;
  for (let i = 0; i < 30; i++) {
    const user = createdUsers[i % createdUsers.length];
    const sample = ENTRY_SAMPLES[i % ENTRY_SAMPLES.length];
    const entryDate = getDateAgo((i * 2) % 58, 2, 0);

    await Entry.create({
      createdBy: user._id,
      date: entryDate,
      title: `${sample.title} #${i + 1}`,
      mood: sample.mood,
      content: sample.content,
      createdAt: entryDate,
      updatedAt: entryDate,
    });
    entryCount++;
  }
  console.log(`✅ Created ${entryCount} private journal entries.`);

  // 7. Create Check-Ins (~22 check-ins: WHO-5 & Mini-IPIP)
  // Enforces 1 check-in per user per type per calendar day!
  console.log("\n📊 Creating ~22 check-in records (WHO-5 & Mini-IPIP Big Five)...");
  let checkInCount = 0;

  // Alex's WHO-5 series across 5 distinct weeks
  const alexScores = [
    { raw: 18, score: 72, band: "Good well-being", flagged: false, daysAgo: 35 },
    { raw: 15, score: 60, band: "Moderate well-being", flagged: false, daysAgo: 28 },
    { raw: 14, score: 56, band: "Moderate well-being", flagged: false, daysAgo: 21 },
    { raw: 17, score: 68, band: "Moderate well-being", flagged: false, daysAgo: 14 },
    { raw: 20, score: 80, band: "Good well-being", flagged: false, daysAgo: 2 },
  ];

  for (const s of alexScores) {
    await CheckIn.create({
      userId: createdUsers[0]._id, // Alex
      type: "who5",
      rawScore: s.raw,
      score: s.score,
      band: s.band,
      flaggedLow: s.flagged,
      createdAt: getDateAgo(s.daysAgo, 9, 30),
    });
    checkInCount++;
  }

  // Alex's Mini-IPIP snapshot
  await CheckIn.create({
    userId: createdUsers[0]._id, // Alex
    type: "mini_ipip",
    traits: {
      extraversion: 16,
      agreeableness: 18,
      conscientiousness: 15,
      neuroticism: 11,
      openness: 17,
    },
    createdAt: getDateAgo(3, 10, 0),
  });
  checkInCount++;

  // Maya's check-ins
  await CheckIn.create({
    userId: createdUsers[1]._id,
    type: "who5",
    rawScore: 19,
    score: 76,
    band: "Good well-being",
    flaggedLow: false,
    createdAt: getDateAgo(15, 8, 0),
  });
  checkInCount++;

  await CheckIn.create({
    userId: createdUsers[1]._id,
    type: "mini_ipip",
    traits: {
      extraversion: 14,
      agreeableness: 17,
      conscientiousness: 14,
      neuroticism: 12,
      openness: 19,
    },
    createdAt: getDateAgo(5, 11, 0),
  });
  checkInCount++;

  // Liam's check-ins
  await CheckIn.create({
    userId: createdUsers[2]._id,
    type: "who5",
    rawScore: 21,
    score: 84,
    band: "Good well-being",
    flaggedLow: false,
    createdAt: getDateAgo(10, 7, 0),
  });
  checkInCount++;

  await CheckIn.create({
    userId: createdUsers[2]._id,
    type: "mini_ipip",
    traits: {
      extraversion: 15,
      agreeableness: 15,
      conscientiousness: 18,
      neuroticism: 9,
      openness: 14,
    },
    createdAt: getDateAgo(4, 14, 0),
  });
  checkInCount++;

  // Samira's check-ins
  await CheckIn.create({
    userId: createdUsers[3]._id,
    type: "who5",
    rawScore: 17,
    score: 68,
    band: "Moderate well-being",
    flaggedLow: false,
    createdAt: getDateAgo(8, 12, 0),
  });
  checkInCount++;

  await CheckIn.create({
    userId: createdUsers[3]._id,
    type: "mini_ipip",
    traits: {
      extraversion: 13,
      agreeableness: 19,
      conscientiousness: 16,
      neuroticism: 10,
      openness: 16,
    },
    createdAt: getDateAgo(1, 9, 0),
  });
  checkInCount++;

  // Noah (burnout recovery check-in with flaggedLow)
  await CheckIn.create({
    userId: createdUsers[6]._id,
    type: "who5",
    rawScore: 11,
    score: 44,
    band: "Low well-being",
    flaggedLow: true,
    createdAt: getDateAgo(25, 10, 0),
  });
  checkInCount++;

  await CheckIn.create({
    userId: createdUsers[6]._id,
    type: "who5",
    rawScore: 14,
    score: 56,
    band: "Moderate well-being",
    flaggedLow: false,
    createdAt: getDateAgo(5, 10, 0),
  });
  checkInCount++;

  // Add WHO-5 check-ins for additional users on separate days
  const otherCheckIns = [
    { uIdx: 4, raw: 16, score: 64, band: "Moderate well-being", flagged: false, daysAgo: 12 },
    { uIdx: 5, raw: 18, score: 72, band: "Good well-being", flagged: false, daysAgo: 7 },
    { uIdx: 7, raw: 22, score: 88, band: "Good well-being", flagged: false, daysAgo: 6 },
    { uIdx: 8, raw: 19, score: 76, band: "Good well-being", flagged: false, daysAgo: 18 },
    { uIdx: 9, raw: 12, score: 48, band: "Low well-being", flagged: true, daysAgo: 9 },
    { uIdx: 10, raw: 15, score: 60, band: "Moderate well-being", flagged: false, daysAgo: 16 },
    { uIdx: 12, raw: 17, score: 68, band: "Moderate well-being", flagged: false, daysAgo: 11 },
    { uIdx: 13, raw: 20, score: 80, band: "Good well-being", flagged: false, daysAgo: 14 },
    { uIdx: 14, raw: 18, score: 72, band: "Good well-being", flagged: false, daysAgo: 13 },
  ];

  for (const c of otherCheckIns) {
    await CheckIn.create({
      userId: createdUsers[c.uIdx]._id,
      type: "who5",
      rawScore: c.raw,
      score: c.score,
      band: c.band,
      flaggedLow: c.flagged,
      createdAt: getDateAgo(c.daysAgo, 8, 0),
    });
    checkInCount++;
  }

  // Elena's personality snapshot
  await CheckIn.create({
    userId: createdUsers[5]._id,
    type: "mini_ipip",
    traits: {
      extraversion: 10,
      agreeableness: 18,
      conscientiousness: 13,
      neuroticism: 13,
      openness: 18,
    },
    createdAt: getDateAgo(8, 15, 0),
  });
  checkInCount++;

  console.log(`✅ Created ${checkInCount} check-in records.`);

  console.log("\n==========================================");
  console.log("🎉 SEEDING COMPLETED SUCCESSFULLY!");
  console.log("==========================================");
  console.log(`👥 Users:         ${createdUsers.length}`);
  console.log(`📝 Posts:         ${createdPosts.length}`);
  console.log(`💬 Comments:      ${createdComments.length}`);
  console.log(`🫂 Reactions:     ${reactionCount}`);
  console.log(`🔒 Entries:       ${entryCount}`);
  console.log(`📊 Check-Ins:     ${checkInCount}`);
  console.log("==========================================");
  console.log("Demo login: alex@daybook.app / Password123!\n");

  await mongoose.disconnect();
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Seeding failed:", err);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
