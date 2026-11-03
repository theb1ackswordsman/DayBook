import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EditPost from "./EditPost";
import DeletePost from "./DeletePost";
import ReportPost from "./ReportPost";
import Card from "../ui/Card";
import Chip from "../ui/Chip";
import Avatar from "../ui/Avatar";
import IconButton from "../ui/IconButton";
import {
  useAddReactionMutation,
  useRemoveReactionMutation,
} from "../../redux/api/postsApiSlice";
import { toast } from "react-toastify";
import {
  FaEllipsisH,
  FaPencilAlt,
  FaTrashAlt,
  FaFlag,
  FaGlobeAmericas,
  FaHeart,
  FaRegHeart,
  FaRegComment,
  FaRegSmile,
  FaSmile,
} from "react-icons/fa";

const PostCard = ({
  post,
  currentUserId,
  isDetail = false,
}) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const menuRef = useRef(null);

  const [addReaction] = useAddReactionMutation();
  const [removeReaction] = useRemoveReactionMutation();

  const {
    _id,
    author,
    body,
    mood,
    createdAt,
    editedAt,
    hugCount: initialHugCount = 0,
    meTooCount: initialMeTooCount = 0,
    commentCount: initialCommentCount = 0,
    viewerHasHugged: initialViewerHasHugged = false,
    viewerHasMeToo: initialViewerHasMeToo = false,
  } = post;

  // Local state for optimistic updates
  const [hasHugged, setHasHugged] = useState(initialViewerHasHugged);
  const [hugCount, setHugCount] = useState(initialHugCount);
  const [hasMeToo, setHasMeToo] = useState(initialViewerHasMeToo);
  const [meTooCount, setMeTooCount] = useState(initialMeTooCount);

  useEffect(() => {
    setHasHugged(initialViewerHasHugged);
    setHugCount(initialHugCount);
  }, [initialViewerHasHugged, initialHugCount]);

  useEffect(() => {
    setHasMeToo(initialViewerHasMeToo);
    setMeTooCount(initialMeTooCount);
  }, [initialViewerHasMeToo, initialMeTooCount]);

  const isOwner = currentUserId && author?._id === currentUserId;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getRelativeTime = (d) => {
    const now = new Date();
    const date = new Date(d);
    const diffMs = now - date;
    const diffMins = Math.round(diffMs / (1000 * 60));
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.round(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.round(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("default", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getMoodLabel = (m) => {
    switch (m) {
      case "🙂": return "Happy";
      case "😌": return "Calm";
      case "😔": return "Sad";
      case "😡": return "Frustrated";
      case "🌱": return "Hopeful";
      case "✨": return "Grateful";
      default: return m || "";
    }
  };

  const authorName = author?.displayName || author?.username || "User";

  // Optimistic Hug reaction handler
  const handleToggleHug = async (e) => {
    e.stopPropagation();
    if (!currentUserId) {
      navigate("/login");
      return;
    }

    const previousHugged = hasHugged;
    const previousCount = hugCount;

    // Optimistic state
    setHasHugged(!previousHugged);
    setHugCount(previousHugged ? Math.max(0, previousCount - 1) : previousCount + 1);

    try {
      if (previousHugged) {
        await removeReaction({ id: _id, type: "hug" }).unwrap();
      } else {
        await addReaction({ id: _id, type: "hug" }).unwrap();
      }
    } catch (err) {
      // Rollback
      setHasHugged(previousHugged);
      setHugCount(previousCount);
      toast.error("Couldn't update reaction. Please try again.");
    }
  };

  // Optimistic Me Too reaction handler
  const handleToggleMeToo = async (e) => {
    e.stopPropagation();
    if (!currentUserId) {
      navigate("/login");
      return;
    }

    const previousMeToo = hasMeToo;
    const previousCount = meTooCount;

    // Optimistic state
    setHasMeToo(!previousMeToo);
    setMeTooCount(previousMeToo ? Math.max(0, previousCount - 1) : previousCount + 1);

    try {
      if (previousMeToo) {
        await removeReaction({ id: _id, type: "metoo" }).unwrap();
      } else {
        await addReaction({ id: _id, type: "metoo" }).unwrap();
      }
    } catch (err) {
      // Rollback
      setHasMeToo(previousMeToo);
      setMeTooCount(previousCount);
      toast.error("Couldn't update reaction. Please try again.");
    }
  };

  const handleCardClick = () => {
    if (!isDetail) {
      navigate(`/post/${_id}`);
    }
  };

  return (
    <>
      <article className="w-full">
        <Card
          variant="default"
          className={`flex flex-col gap-4 relative p-6 transition-all ${
            !isDetail ? "cursor-pointer hover:border-text-muted/40" : ""
          }`}
          onClick={handleCardClick}
        >
          {/* Top Row: Avatar + Name + Time + Menu */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar
                name={authorName}
                preset={author?.avatarPreset || "initials"}
                size="md"
              />
              <div className="flex flex-col">
                <span className="font-bold text-sm text-text leading-tight">
                  {authorName}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs text-text-muted">
                    {getRelativeTime(createdAt)}
                  </span>
                  {editedAt && (
                    <span className="text-xs text-text-muted italic">
                      · edited
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* "..." Action menu */}
            <div
              className="relative"
              ref={menuRef}
              onClick={(e) => e.stopPropagation()}
            >
              <IconButton
                icon={<FaEllipsisH className="text-sm" />}
                aria-label="Post actions menu"
                size="sm"
                variant="ghost"
                onClick={() => setMenuOpen((prev) => !prev)}
              />

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-1 w-44 bg-surface border border-border rounded-[20px] shadow-xl py-1.5 z-30 animate-in fade-in"
                >
                  {isOwner ? (
                    <>
                      <button
                        role="menuitem"
                        onClick={() => {
                          setMenuOpen(false);
                          setEditOpen(true);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-text hover:bg-surface-raised flex items-center gap-2.5 cursor-pointer"
                      >
                        <FaPencilAlt className="text-xs text-text-muted" />
                        Edit post
                      </button>

                      <div className="border-t border-border my-1" />

                      <button
                        role="menuitem"
                        onClick={() => {
                          setMenuOpen(false);
                          setDeleteOpen(true);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-danger hover:bg-danger/10 flex items-center gap-2.5 cursor-pointer"
                      >
                        <FaTrashAlt className="text-xs text-danger" />
                        Delete post
                      </button>
                    </>
                  ) : (
                    <button
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false);
                        setReportOpen(true);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-text hover:bg-surface-raised flex items-center gap-2.5 cursor-pointer"
                    >
                      <FaFlag className="text-xs text-text-muted" />
                      Report
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Body text */}
          <p className="text-base text-text leading-relaxed whitespace-pre-wrap break-words">
            {body}
          </p>

          {/* Mood pill + Public tag */}
          <div className="flex items-center justify-between pt-1">
            {mood ? (
              <Chip mood={mood} className="text-[13px] py-1 px-3.5">
                <span>{mood}</span>
                <span>{getMoodLabel(mood)}</span>
              </Chip>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-1.5 text-xs font-semibold text-text-muted">
              <FaGlobeAmericas className="text-[10px]" />
              <span>Public</span>
            </div>
          </div>

          {/* Action Row: Hug, Me Too, Comment */}
          <div
            className="flex items-center gap-4 pt-3 border-t border-border mt-1 select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Hug button (Heart with pulse animation and --accent #F5A65B when active) */}
            <button
              type="button"
              onClick={handleToggleHug}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer motion-safe:duration-200 active:scale-95 motion-safe:hover:scale-105 ${
                hasHugged
                  ? "bg-accent/15 text-[#F5A65B]"
                  : "text-text-muted hover:text-[#F5A65B] hover:bg-surface-raised"
              }`}
              title={hasHugged ? "Remove Hug" : "Send a Hug"}
              aria-label={`Hug (${hugCount})`}
            >
              {hasHugged ? (
                <FaHeart className="text-sm text-[#F5A65B]" />
              ) : (
                <FaRegHeart className="text-sm" />
              )}
              <span>Hug</span>
              {hugCount > 0 && (
                <span className="text-[11px] opacity-80">{hugCount}</span>
              )}
            </button>

            {/* Me too button */}
            <button
              type="button"
              onClick={handleToggleMeToo}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer motion-safe:duration-200 active:scale-95 motion-safe:hover:scale-105 ${
                hasMeToo
                  ? "bg-primary-soft text-primary-dark"
                  : "text-text-muted hover:text-text hover:bg-surface-raised"
              }`}
              title={hasMeToo ? "Remove Me too" : "I feel this too"}
              aria-label={`Me too (${meTooCount})`}
            >
              {hasMeToo ? (
                <FaSmile className="text-sm text-primary-dark" />
              ) : (
                <FaRegSmile className="text-sm" />
              )}
              <span>Me too</span>
              {meTooCount > 0 && (
                <span className="text-[11px] opacity-80">{meTooCount}</span>
              )}
            </button>

            {/* Comment button (opens post details) */}
            <button
              type="button"
              onClick={() => navigate(`/post/${_id}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-text-muted hover:text-text hover:bg-surface-raised transition-all cursor-pointer ml-auto"
              aria-label={`Comments (${initialCommentCount})`}
            >
              <FaRegComment className="text-sm" />
              <span>Comment</span>
              {initialCommentCount > 0 && (
                <span className="text-[11px] opacity-80">
                  {initialCommentCount}
                </span>
              )}
            </button>
          </div>
        </Card>
      </article>

      {/* Dialogs */}
      {isOwner && (
        <>
          <EditPost
            post={post}
            isOpen={editOpen}
            onClose={() => setEditOpen(false)}
          />
          <DeletePost
            id={_id}
            isOpen={deleteOpen}
            onClose={() => {
              setDeleteOpen(false);
              if (isDetail) {
                navigate("/");
              }
            }}
          />
        </>
      )}

      {!isOwner && (
        <ReportPost
          postId={_id}
          isOpen={reportOpen}
          onClose={() => setReportOpen(false)}
        />
      )}
    </>
  );
};

export default PostCard;
