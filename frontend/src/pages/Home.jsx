import React, { useState, useRef, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetFeedQuery } from "../redux/api/postsApiSlice";
import PostCard from "../components/post/PostCard";
import AddEntry from "../components/entry/AddEntry";
import Avatar from "../components/ui/Avatar";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { CardSkeleton } from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import { FaPen, FaFeatherAlt } from "react-icons/fa";

const MOOD_FILTERS = [
  { key: "all", label: "All" },
  { key: "🙂", label: "Happy" },
  { key: "😌", label: "Calm" },
  { key: "😔", label: "Sad" },
  { key: "😡", label: "Frustrated" },
  { key: "🌱", label: "Hopeful" },
  { key: "✨", label: "Grateful" },
];

const Home = () => {
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("recent"); // "recent" | "byMood"
  const [selectedMood, setSelectedMood] = useState("all");
  const [composerOpen, setComposerOpen] = useState(false);

  // Pagination state
  const [cursor, setCursor] = useState(null);
  const [cursorId, setCursorId] = useState(null);

  // Compute mood query param
  const moodParam = activeTab === "byMood" && selectedMood !== "all" ? selectedMood : undefined;

  const {
    data: feedData,
    isLoading,
    isFetching,
  } = useGetFeedQuery(
    { cursor, cursorId, mood: moodParam },
    { skip: !user }
  );

  const posts = feedData?.data || [];
  const hasMore = feedData?.pagination?.hasMore || false;

  // Reset pagination when mood filter changes
  useEffect(() => {
    setCursor(null);
    setCursorId(null);
  }, [moodParam]);

  // Infinite scroll with IntersectionObserver
  const observerRef = useRef(null);
  const sentinelRef = useCallback(
    (node) => {
      if (isFetching) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && feedData?.pagination) {
          setCursor(feedData.pagination.nextCursor);
          setCursorId(feedData.pagination.nextCursorId);
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isFetching, hasMore, feedData]
  );

  const handleOpenComposer = () => {
    if (!user) {
      navigate("/login");
    } else {
      setComposerOpen(true);
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Top Pill Tab Bar: [Recent | By mood] */}
      <section aria-label="Feed filters" className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2 p-1.5 bg-surface rounded-full border border-border">
          {/* Tabs */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab("recent");
                setSelectedMood("all");
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-150 cursor-pointer ${
                activeTab === "recent"
                  ? "bg-surface-raised text-white shadow-sm"
                  : "text-text-muted hover:text-white"
              }`}
            >
              Recent
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("byMood")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-150 cursor-pointer ${
                activeTab === "byMood"
                  ? "bg-surface-raised text-white shadow-sm"
                  : "text-text-muted hover:text-white"
              }`}
            >
              By mood
            </button>
          </div>
        </div>

        {/* By Mood Pill Selector */}
        {activeTab === "byMood" && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 px-1">
            {MOOD_FILTERS.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setSelectedMood(m.key)}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedMood === m.key
                    ? "bg-surface-raised text-white"
                    : "bg-surface border border-border text-text-muted hover:text-white"
                }`}
              >
                {m.key !== "all" && <span className="mr-1">{m.key}</span>}
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Compact "How are you feeling today?" Bar */}
      <section aria-label="Thought composer bar">
        <button
          type="button"
          onClick={handleOpenComposer}
          className="w-full p-4 bg-surface rounded-[24px] border border-border flex items-center gap-3.5 hover:border-text-muted/60 hover:bg-surface/90 transition-all cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-primary shadow-sm select-none"
        >
          <Avatar
            name={user ? user.data.firstName : "You"}
            size="md"
          />
          <div className="flex-1">
            <span className="text-sm font-medium text-text-muted">
              How are you feeling today?
            </span>
          </div>
          <div className="w-9 h-9 rounded-full bg-surface-raised text-text-muted flex items-center justify-center shrink-0">
            <FaPen className="text-xs text-text-muted" />
          </div>
        </button>
      </section>

      {/* Post Feed */}
      <section aria-label="Public feed" className="flex flex-col gap-4">
        {isLoading && !posts.length ? (
          <div className="flex flex-col gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : !user ? (
          /* Logged-out Banner */
          <Card variant="default" className="text-center p-8">
            <div className="w-12 h-12 rounded-full bg-surface-raised text-text mx-auto flex items-center justify-center text-xl mb-3">
              <FaFeatherAlt />
            </div>
            <h2 className="text-xl font-bold text-text mb-2">
              Welcome to DayBook
            </h2>
            <p className="text-sm text-text-muted max-w-md mx-auto leading-relaxed mb-5">
              A quiet space for your thoughts. Journal privately or share with the community.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link to="/login">
                <Button variant="primary" size="md">
                  Log in
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="outline" size="md">
                  Sign up
                </Button>
              </Link>
            </div>
          </Card>
        ) : posts.length === 0 && !isFetching ? (
          <EmptyState
            icon={<FaFeatherAlt />}
            title={
              moodParam
                ? `No ${selectedMood} posts yet`
                : "No posts yet"
            }
            description="Be the first to share a thought with the DayBook community."
            actionLabel="Share a thought"
            onAction={handleOpenComposer}
          />
        ) : (
          <>
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                currentUserId={user?.data?._id}
              />
            ))}

            {/* Infinite scroll sentinel */}
            {hasMore && (
              <div ref={sentinelRef} className="flex flex-col gap-4">
                <CardSkeleton />
              </div>
            )}

            {isFetching && posts.length > 0 && !hasMore && (
              <div className="flex flex-col gap-4">
                <CardSkeleton />
              </div>
            )}
          </>
        )}
      </section>

      {/* Global Add Entry Modal (composer) */}
      <AddEntry
        isOpen={composerOpen}
        onClose={() => setComposerOpen(false)}
      />
    </div>
  );
};

export default Home;
