import React, { useState, useRef, useEffect } from "react";
import Avatar from "../ui/Avatar";
import IconButton from "../ui/IconButton";
import Button from "../ui/Button";
import Textarea from "../ui/Textarea";
import ReportCommentModal from "./ReportCommentModal";
import {
  useDeleteCommentMutation,
  useLikeCommentMutation,
  useUnlikeCommentMutation,
  useCreateCommentMutation,
  useGetCommentRepliesQuery,
} from "../../redux/api/postsApiSlice";
import { toast } from "react-toastify";
import {
  FaHeart,
  FaRegHeart,
  FaEllipsisH,
  FaTrashAlt,
  FaFlag,
  FaReply,
} from "react-icons/fa";

const CommentItem = ({
  comment,
  postId,
  postAuthorId,
  currentUserId,
  isReply = false,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [showAllReplies, setShowAllReplies] = useState(false);
  const menuRef = useRef(null);

  const [deleteComment, { isLoading: isDeleting }] = useDeleteCommentMutation();
  const [likeComment] = useLikeCommentMutation();
  const [unlikeComment] = useUnlikeCommentMutation();
  const [createComment, { isLoading: isReplying }] = useCreateCommentMutation();

  const {
    _id,
    author,
    body,
    likeCount: initialLikeCount = 0,
    viewerHasLiked: initialViewerHasLiked = false,
    replyCount = 0,
    replies: initialReplies = [],
    createdAt,
  } = comment;

  // Optimistic like state
  const [hasLiked, setHasLiked] = useState(initialViewerHasLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);

  useEffect(() => {
    setHasLiked(initialViewerHasLiked);
    setLikeCount(initialLikeCount);
  }, [initialViewerHasLiked, initialLikeCount]);

  // Query additional replies if user clicks "View N more replies"
  const { data: moreRepliesData, isLoading: isLoadingMoreReplies } = useGetCommentRepliesQuery(
    { commentId: _id, limit: 50 },
    { skip: !showAllReplies || replyCount <= initialReplies.length }
  );

  const displayedReplies = showAllReplies && moreRepliesData?.data
    ? moreRepliesData.data
    : initialReplies;

  const isCommentAuthor = currentUserId && author?._id === currentUserId;
  const isPostAuthor = currentUserId && postAuthorId === currentUserId;
  const canDelete = isCommentAuthor || isPostAuthor;

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
    const diffMins = Math.round((now - date) / (1000 * 60));
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.round(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.round(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("default", {
      day: "numeric",
      month: "short",
    });
  };

  const handleToggleLike = async () => {
    if (!currentUserId) {
      toast.info("Please log in to like comments");
      return;
    }

    const previousLiked = hasLiked;
    const previousCount = likeCount;

    setHasLiked(!previousLiked);
    setLikeCount(previousLiked ? Math.max(0, previousCount - 1) : previousCount + 1);

    try {
      if (previousLiked) {
        await unlikeComment(_id).unwrap();
      } else {
        await likeComment(_id).unwrap();
      }
    } catch (err) {
      setHasLiked(previousLiked);
      setLikeCount(previousCount);
      toast.error("Couldn't update like.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteComment(_id).unwrap();
      toast.success("Comment deleted");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete comment");
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyBody.trim()) return;

    try {
      await createComment({
        postId,
        parentId: _id,
        body: replyBody.trim(),
      }).unwrap();
      setReplyBody("");
      setReplyOpen(false);
      toast.success("Reply posted");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to post reply");
    }
  };

  const authorName = author?.displayName || author?.username || "User";

  return (
    <div className={`flex flex-col gap-2.5 ${isReply ? "ml-8 sm:ml-12 border-l-2 border-border/60 pl-3.5 my-1" : ""}`}>
      {/* Comment Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <Avatar
            name={authorName}
            preset={author?.avatarPreset || "initials"}
            size={isReply ? "xs" : "sm"}
          />
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs sm:text-sm text-text leading-tight">
              {authorName}
            </span>
            <span className="text-[11px] text-text-muted">
              {getRelativeTime(createdAt)}
            </span>
          </div>
        </div>

        {/* Comment Menu */}
        <div className="relative" ref={menuRef}>
          <IconButton
            icon={<FaEllipsisH className="text-xs" />}
            aria-label="Comment actions"
            size="sm"
            variant="ghost"
            onClick={() => setMenuOpen((prev) => !prev)}
          />

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-1 w-40 bg-surface border border-border rounded-[18px] shadow-xl py-1.5 z-30 animate-in fade-in"
            >
              {canDelete ? (
                <button
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    handleDelete();
                  }}
                  disabled={isDeleting}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-danger hover:bg-danger/10 flex items-center gap-2.5 cursor-pointer"
                >
                  <FaTrashAlt className="text-xs text-danger" />
                  <span>Delete</span>
                </button>
              ) : (
                <button
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    setReportOpen(true);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-text hover:bg-surface-raised flex items-center gap-2.5 cursor-pointer"
                >
                  <FaFlag className="text-xs text-text-muted" />
                  <span>Report</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Comment Body */}
      <p className="text-sm text-text leading-relaxed whitespace-pre-wrap break-words pl-1 sm:pl-2">
        {body}
      </p>

      {/* Action Row: Heart Like + Reply */}
      <div className="flex items-center gap-4 pl-1 sm:pl-2 pt-1">
        <button
          type="button"
          onClick={handleToggleLike}
          className={`flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${
            hasLiked ? "text-danger" : "text-text-muted hover:text-danger"
          }`}
          aria-label={`Like (${likeCount})`}
        >
          {hasLiked ? <FaHeart className="text-xs" /> : <FaRegHeart className="text-xs" />}
          {likeCount > 0 && <span className="text-[11px] opacity-80">{likeCount}</span>}
        </button>

        {!isReply && (
          <button
            type="button"
            onClick={() => setReplyOpen((prev) => !prev)}
            className="flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text transition-colors cursor-pointer"
          >
            <FaReply className="text-[10px]" />
            <span>Reply</span>
          </button>
        )}
      </div>

      {/* Inline Reply Composer */}
      {replyOpen && (
        <form onSubmit={handleSendReply} className="flex flex-col gap-2 mt-2 ml-4">
          <Textarea
            id={`reply-${_id}`}
            name="reply"
            placeholder={`Reply to ${authorName}...`}
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            minRows={2}
            maxLength={500}
            required
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setReplyOpen(false);
                setReplyBody("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!replyBody.trim() || isReplying}
            >
              {isReplying ? "Replying..." : "Reply"}
            </Button>
          </div>
        </form>
      )}

      {/* Display Replies */}
      {displayedReplies.length > 0 && (
        <div className="flex flex-col gap-2 mt-1">
          {displayedReplies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              postId={postId}
              postAuthorId={postAuthorId}
              currentUserId={currentUserId}
              isReply
            />
          ))}
        </div>
      )}

      {/* "View N more replies" button */}
      {!showAllReplies && replyCount > initialReplies.length && (
        <button
          type="button"
          onClick={() => setShowAllReplies(true)}
          className="text-xs font-semibold text-primary-dark hover:underline cursor-pointer w-fit ml-8 sm:ml-12 mt-1"
        >
          {isLoadingMoreReplies
            ? "Loading replies..."
            : `View ${replyCount - initialReplies.length} more ${
                replyCount - initialReplies.length === 1 ? "reply" : "replies"
              }`}
        </button>
      )}

      {/* Report Modal */}
      <ReportCommentModal
        commentId={_id}
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
      />
    </div>
  );
};

export default CommentItem;
