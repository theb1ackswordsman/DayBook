import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useGetPostQuery,
  useGetPostCommentsQuery,
  useCreateCommentMutation,
} from "../redux/api/postsApiSlice";
import PostCard from "../components/post/PostCard";
import CommentItem from "../components/comment/CommentItem";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Textarea from "../components/ui/Textarea";
import EmptyState from "../components/ui/EmptyState";
import { CardSkeleton } from "../components/ui/Skeleton";
import { toast } from "react-toastify";
import { FaArrowLeft, FaComments, FaRedo } from "react-icons/fa";

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.user);
  const currentUserId = user?.data?._id;

  const [commentText, setCommentText] = useState("");
  const initialHighlightId = location.state?.highlightCommentId || null;
  const [highlightedId, setHighlightedId] = useState(initialHighlightId);

  const {
    data: postData,
    isLoading: isLoadingPost,
    isError: isPostError,
    refetch: refetchPost,
  } = useGetPostQuery(id);

  const {
    data: commentsData,
    isLoading: isLoadingComments,
    isError: isCommentsError,
    refetch: refetchComments,
  } = useGetPostCommentsQuery({ postId: id }, { skip: !id });

  const [createComment, { isLoading: isPostingComment }] = useCreateCommentMutation();

  const post = postData?.data;
  const comments = commentsData?.data || [];

  // Scroll to and briefly highlight comment from notification
  useEffect(() => {
    if (initialHighlightId && comments.length > 0) {
      setHighlightedId(initialHighlightId);
      const timer = setTimeout(() => {
        const el = document.getElementById(`comment-${initialHighlightId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);

      const fadeTimer = setTimeout(() => {
        setHighlightedId(null);
      }, 3500);

      return () => {
        clearTimeout(timer);
        clearTimeout(fadeTimer);
      };
    }
  }, [initialHighlightId, comments]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (!user) {
      navigate("/login");
      return;
    }

    try {
      await createComment({
        postId: id,
        body: commentText.trim(),
      }).unwrap();
      setCommentText("");
      toast.success("Comment added");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to post comment");
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto pb-12">
      {/* Top Header with Back Button */}
      <header className="flex items-center gap-3 p-2 px-4 bg-surface rounded-full border border-border">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-white hover:bg-surface-raised transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
          aria-label="Go back"
        >
          <FaArrowLeft className="text-xs" />
        </button>
        <h1 className="font-bold text-sm text-text">Post & Discussion</h1>
      </header>

      {/* Main Post Section */}
      {isLoadingPost ? (
        <CardSkeleton />
      ) : isPostError || !post ? (
        <Card variant="default" className="p-8 text-center flex flex-col items-center gap-3">
          <h2 className="text-base font-bold text-text">
            This post is no longer available
          </h2>
          <p className="text-xs text-text-muted max-w-sm leading-relaxed">
            It may have been removed by its author or is no longer accessible.
          </p>
          <div className="flex items-center gap-3 mt-2">
            <Button variant="outline" size="sm" onClick={() => refetchPost()}>
              <FaRedo className="text-xs" />
              <span>Retry</span>
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate("/")}>
              Back to feed
            </Button>
          </div>
        </Card>
      ) : (
        <PostCard post={post} currentUserId={currentUserId} isDetail />
      )}

      {/* Comment Composer */}
      {post && (
        <Card variant="default" className="p-5 flex flex-col gap-3">
          <h2 className="text-sm font-bold text-text">Join the discussion</h2>
          <form onSubmit={handleAddComment} className="flex flex-col gap-3">
            <Textarea
              id="topCommentInput"
              name="comment"
              placeholder={user ? "Write something kind..." : "Log in to leave a kind comment..."}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={!user || isPostingComment}
              minRows={3}
              maxLength={500}
              required
            />
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-text-muted">
                Keep the conversation safe and supportive
              </span>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!commentText.trim() || !user || isPostingComment}
              >
                {isPostingComment ? "Posting..." : "Comment"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Comments List */}
      {post && (
        <section aria-label="Comments" className="flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted px-2">
            Comments ({comments.length})
          </h3>

          {isLoadingComments ? (
            <div className="flex flex-col gap-3">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : isCommentsError ? (
            <Card variant="default" className="p-6 text-center flex flex-col items-center gap-2">
              <p className="text-xs text-text-muted">
                Failed to load comments.
              </p>
              <Button variant="ghost" size="sm" onClick={() => refetchComments()}>
                Retry
              </Button>
            </Card>
          ) : comments.length === 0 ? (
            <EmptyState
              icon={<FaComments />}
              title="No comments yet"
              description="Be the first to say something kind."
            />
          ) : (
            <Card variant="default" className="p-6 flex flex-col gap-5 divide-y divide-border">
              {comments.map((comment, index) => {
                const isTargetComment = highlightedId === comment._id;

                return (
                  <div
                    key={comment._id}
                    id={`comment-${comment._id}`}
                    className={`transition-all duration-700 ${index > 0 ? "pt-4" : ""} ${
                      isTargetComment
                        ? "bg-primary-soft/60 ring-2 ring-primary/60 rounded-2xl p-3 -m-1"
                        : ""
                    }`}
                  >
                    <CommentItem
                      comment={comment}
                      postId={id}
                      postAuthorId={post.author?._id}
                      currentUserId={currentUserId}
                    />
                  </div>
                );
              })}
            </Card>
          )}
        </section>
      )}
    </div>
  );
};

export default PostDetail;
