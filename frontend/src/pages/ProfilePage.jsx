import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Navigate } from "react-router-dom";
import { useGetEntriesQuery } from "../redux/api/entriesApiSlice";
import { useGetMyPostsQuery } from "../redux/api/postsApiSlice";
import PostCard from "../components/post/PostCard";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Chip from "../components/ui/Chip";
import Avatar from "../components/ui/Avatar";
import Modal from "../components/ui/Modal";
import EntryCard from "../components/entry/EntryCard";
import Profile from "../components/auth/Profile";
import Password from "../components/auth/Password";
import Logout from "../components/auth/Logout";
import EmptyState from "../components/ui/EmptyState";
import { CardSkeleton } from "../components/ui/Skeleton";
import { COVER_PRESETS } from "../config/profilePresets";
import {
  FaArrowLeft,
  FaEllipsisH,
  FaCamera,
  FaCalendarAlt,
  FaLock,
  FaPencilAlt,
  FaChartPie,
  FaBookOpen,
  FaShieldAlt,
  FaGlobeAmericas,
} from "react-icons/fa";

const ProfilePage = () => {
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("entries"); // "entries" | "publicPosts" | "moodLog"
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editTab, setEditTab] = useState("info");
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const { data: getEntries, isLoading } = useGetEntriesQuery();
  const entries = getEntries?.data || [];

  const { data: myPostsData, isLoading: isLoadingPosts } = useGetMyPostsQuery({});
  const myPosts = myPostsData?.data || [];

  // Compute Client-Side Stats
  const now = new Date();
  const thisMonthCount = entries.filter((e) => {
    const d = new Date(e.date);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  }).length;

  // Mood frequency breakdown
  const moodCounts = entries.reduce((acc, entry) => {
    const m = entry.mood || "🙂";
    acc[m] = (acc[m] || 0) + 1;
    return acc;
  }, {});

  const sortedMoods = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]);
  const topMood = sortedMoods.length > 0 ? sortedMoods[0][0] : "🙂";
  const currentMood = entries.length > 0 ? entries[0].mood || "🙂" : "🙂";

  // Journaling since month year
  const joinDate = user.data.createdAt ? new Date(user.data.createdAt) : new Date();
  const journalingSince = joinDate.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  // Find cover preset class
  const activeCover =
    COVER_PRESETS.find((c) => c.id === user.data.coverPreset) ||
    COVER_PRESETS[0];

  const displayName =
    user.data.displayName ||
    `${user.data.firstName} ${user.data.lastName || ""}`.trim();

  return (
    <div className="flex flex-col gap-6 w-full pb-8">
      {/* 1. Header Pill Bar: back arrow, display name, "..." menu */}
      <header className="flex items-center justify-between p-2 px-4 bg-surface rounded-full border border-border">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-white hover:bg-surface-raised transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
            aria-label="Go back"
          >
            <FaArrowLeft className="text-xs" />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-text truncate max-w-[200px] sm:max-w-xs">
              {displayName}
            </span>
            <span className="text-xs text-text-muted font-normal">
              ({entries.length} reflections)
            </span>
          </div>
        </div>

        {/* "..." Header Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-white hover:bg-surface-raised transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
            aria-label="Profile actions"
          >
            <FaEllipsisH className="text-xs" />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-1 w-44 bg-surface border border-border rounded-[20px] shadow-xl py-1.5 z-30 animate-in fade-in"
            >
              <button
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  setEditTab("info");
                  setEditProfileOpen(true);
                }}
                className="w-full text-left px-4 py-2 text-xs font-semibold text-text hover:bg-surface-raised flex items-center gap-2.5 cursor-pointer"
              >
                <FaPencilAlt className="text-xs text-text-muted" />
                Edit Profile
              </button>

              <button
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  setPasswordOpen(true);
                }}
                className="w-full text-left px-4 py-2 text-xs font-semibold text-text hover:bg-surface-raised flex items-center gap-2.5 cursor-pointer"
              >
                <FaLock className="text-xs text-text-muted" />
                Change Password
              </button>

              <div className="border-t border-border my-1" />

              <button
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  setLogoutOpen(true);
                }}
                className="w-full text-left px-4 py-2 text-xs font-semibold text-danger hover:bg-danger/10 flex items-center gap-2.5 cursor-pointer"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 2. Cover Banner + Overlapping Squircle Avatar */}
      <section className="relative">
        {/* Large 24px-radius cover banner */}
        <div
          className={`w-full h-44 sm:h-56 md:h-64 rounded-[24px] ${activeCover.className} relative p-4 flex flex-col justify-between overflow-hidden shadow-card border border-border/50`}
        >
          {/* Top-left Chips: Current Mood + Journaling Since */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-black/50 text-white backdrop-blur-md">
              <span>{currentMood}</span>
              <span>Current Mood</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-black/50 text-white backdrop-blur-md">
              <FaCalendarAlt className="text-[10px]" />
              <span>Journaling since {journalingSince}</span>
            </span>
          </div>

          {/* Change cover button bottom-right */}
          <div className="self-end">
            <button
              type="button"
              onClick={() => {
                setEditTab("appearance");
                setEditProfileOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-black/60 hover:bg-black/80 text-white text-xs font-bold rounded-full backdrop-blur-md transition-colors cursor-pointer"
            >
              <FaCamera className="text-[10px]" />
              <span>Change cover</span>
            </button>
          </div>
        </div>

        {/* Squircle Avatar Overlapping the Cover */}
        <div className="flex items-end justify-between px-6 -mt-12 sm:-mt-14 relative z-10">
          <div className="relative">
            <Avatar
              name={displayName}
              preset={user.data.avatarPreset}
              size="2xl"
              className="shadow-xl"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditTab("info");
              setEditProfileOpen(true);
            }}
            className="mb-1"
          >
            <FaPencilAlt className="text-xs" />
            <span>Edit Profile</span>
          </Button>
        </div>
      </section>

      {/* Notice: "Only you can see your profile for now." */}
      <div
        role="status"
        className="flex items-center gap-2.5 p-3 px-4 bg-surface-raised/70 rounded-full border border-border text-xs font-medium text-text-muted"
      >
        <FaShieldAlt className="text-text-muted text-xs shrink-0" />
        <span>
          <strong className="text-white">Private Sanctuary:</strong> Only you can see your profile for now.
        </span>
      </div>

      {/* 3. Below: Two Columns */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column (Card): Bio, Status, Vibes, Stats */}
        <aside className="md:col-span-5 flex flex-col gap-4">
          <Card variant="default" className="p-5 flex flex-col gap-4">
            {/* Display Name & Email */}
            <div>
              <h2 className="text-xl font-bold text-text tracking-tight">
                {displayName}
              </h2>
              <p className="text-xs text-text-muted mt-0.5">{user.data.email}</p>
            </div>

            {/* Status ("Add status" link if empty) */}
            <div className="p-3 bg-surface-raised rounded-[18px]">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                Status
              </span>
              {user.data.status ? (
                <p className="text-xs font-semibold text-text leading-relaxed">
                  "{user.data.status}"
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setEditTab("info");
                    setEditProfileOpen(true);
                  }}
                  className="text-xs text-primary-dark font-bold hover:underline cursor-pointer"
                >
                  + Add a status
                </button>
              )}
            </div>

            {/* Bio */}
            {user.data.bio && (
              <div>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                  About
                </span>
                <p className="text-xs text-text leading-relaxed whitespace-pre-wrap">
                  {user.data.bio}
                </p>
              </div>
            )}

            {/* Vibes Chips */}
            {user.data.vibes && user.data.vibes.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-2">
                  Vibes
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {user.data.vibes.map((vibe) => (
                    <Chip key={vibe} variant="raised" className="text-[11px] py-0.5">
                      {vibe}
                    </Chip>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-border pt-2" />

            {/* Stats (Entries, This month, Top mood) computed client-side */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 bg-surface-raised rounded-[16px]">
                <span className="block text-base font-bold text-text">
                  {entries.length}
                </span>
                <span className="text-[10px] font-semibold text-text-muted">
                  Entries
                </span>
              </div>

              <div className="p-2.5 bg-surface-raised rounded-[16px]">
                <span className="block text-base font-bold text-text">
                  {thisMonthCount}
                </span>
                <span className="text-[10px] font-semibold text-text-muted">
                  This month
                </span>
              </div>

              <div className="p-2.5 bg-surface-raised rounded-[16px]">
                <span className="block text-base font-bold text-text">
                  {topMood}
                </span>
                <span className="text-[10px] font-semibold text-text-muted">
                  Top mood
                </span>
              </div>
            </div>
          </Card>
        </aside>

        {/* Right Column: Tabs "Entries (n)" and "Mood log" */}
        <section className="md:col-span-7 flex flex-col gap-4">
          {/* Pill Tabs */}
          <div className="flex items-center gap-1 p-1 bg-surface rounded-full border border-border w-fit">
            <button
              type="button"
              onClick={() => setActiveTab("entries")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === "entries"
                  ? "bg-surface-raised text-white shadow-sm"
                  : "text-text-muted hover:text-white"
              }`}
            >
              <FaBookOpen className="text-xs" />
              <span>Entries ({entries.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("publicPosts")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === "publicPosts"
                  ? "bg-surface-raised text-white shadow-sm"
                  : "text-text-muted hover:text-white"
              }`}
            >
              <FaGlobeAmericas className="text-xs" />
              <span>Public posts ({myPosts.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("moodLog")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === "moodLog"
                  ? "bg-surface-raised text-white shadow-sm"
                  : "text-text-muted hover:text-white"
              }`}
            >
              <FaChartPie className="text-xs" />
              <span>Mood log</span>
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "entries" ? (
            <div className="flex flex-col gap-4">
              {isLoading ? (
                <div className="flex flex-col gap-4">
                  <CardSkeleton />
                  <CardSkeleton />
                </div>
              ) : entries.length === 0 ? (
                <EmptyState
                  title="No reflections recorded yet"
                  description="When you write thoughts, they will be preserved here."
                  actionLabel="Write an entry"
                  onAction={() => {
                    const btn = document.querySelector('button[aria-label="Write a new entry"]');
                    if (btn) btn.click();
                  }}
                />
              ) : (
                entries.map((entry) => (
                  <EntryCard
                    key={entry._id}
                    id={entry._id}
                    date={entry.date}
                    title={entry.title}
                    mood={entry.mood}
                    content={entry.content}
                    updatedAt={entry.updatedAt}
                    authorName={displayName}
                  />
                ))
              )}
            </div>
          ) : activeTab === "publicPosts" ? (
            <div className="flex flex-col gap-4">
              {isLoadingPosts ? (
                <div className="flex flex-col gap-4">
                  <CardSkeleton />
                  <CardSkeleton />
                </div>
              ) : myPosts.length === 0 ? (
                <EmptyState
                  title="No public posts yet"
                  description="When you share thoughts publicly, they'll appear here."
                />
              ) : (
                myPosts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    currentUserId={user?.data?._id}
                  />
                ))
              )}
            </div>
          ) : (
            <Card variant="default" className="p-6 flex flex-col gap-5">
              <div>
                <h3 className="text-base font-bold text-text">Mood Insights</h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Client-side summary of feelings captured in your reflections
                </p>
              </div>

              {entries.length === 0 ? (
                <p className="text-xs text-text-muted py-4 text-center">
                  Record your first journal entry to start seeing your mood trends.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {sortedMoods.map(([m, count]) => {
                    const percentage = Math.round((count / entries.length) * 100);
                    return (
                      <div
                        key={m}
                        className="flex flex-col gap-1.5 p-3 bg-surface-raised rounded-[16px]"
                      >
                        <div className="flex items-center justify-between text-xs font-bold">
                          <Chip mood={m} className="py-0.5 text-xs">
                            <span>{m}</span>
                          </Chip>
                          <span className="text-text-muted">
                            {count} {count === 1 ? "reflection" : "reflections"} ({percentage}%)
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full h-2 rounded-full bg-surface overflow-hidden">
                          <div
                            style={{ width: `${percentage}%` }}
                            className="h-full rounded-full bg-primary"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          )}
        </section>
      </div>

      {/* Extended Profile Modal */}
      <Modal
        isOpen={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        title="Edit Profile"
      >
        <Profile
          close={() => setEditProfileOpen(false)}
          defaultTab={editTab}
        />
      </Modal>

      {/* Password Modal */}
      <Modal
        isOpen={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        title="Update Password"
      >
        <Password close={() => setPasswordOpen(false)} />
      </Modal>

      {/* Logout Modal */}
      <Modal
        isOpen={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        title="Confirm Log Out"
      >
        <Logout close={() => setLogoutOpen(false)} />
      </Modal>
    </div>
  );
};

export default ProfilePage;
