import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from "../redux/api/notificationsApiSlice";
import Avatar from "../components/ui/Avatar";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import { CardSkeleton } from "../components/ui/Skeleton";
import { toast } from "react-toastify";
import {
  FaBell,
  FaHeart,
  FaSmile,
  FaComment,
  FaReply,
  FaCheckDouble,
  FaRedo,
} from "react-icons/fa";

const Notifications = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  const {
    data: notifData,
    isLoading,
    isError,
    refetch,
  } = useGetNotificationsQuery(undefined, { skip: !user });

  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAll }] = useMarkAllAsReadMutation();

  const notifications = notifData?.data || [];

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead().unwrap();
      toast.success("All notifications marked as read");
    } catch (err) {
      toast.error("Failed to mark all as read");
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      try {
        await markAsRead(notif._id).unwrap();
      } catch (err) {
        // Continue navigation even if marking read fails
      }
    }

    if (notif.postId) {
      navigate(`/post/${notif.postId}`, {
        state: { highlightCommentId: notif.commentId },
      });
    }
  };

  const getActionIcon = (type) => {
    switch (type) {
      case "post_hug":
        return <FaHeart className="text-xs text-[#F5A65B]" />;
      case "post_metoo":
        return <FaSmile className="text-xs text-primary-dark" />;
      case "post_comment":
        return <FaComment className="text-xs text-text-muted" />;
      case "comment_reply":
        return <FaReply className="text-xs text-primary-dark" />;
      case "comment_like":
        return <FaHeart className="text-xs text-danger" />;
      default:
        return <FaBell className="text-xs text-text-muted" />;
    }
  };

  const getNotificationText = (notif) => {
    const actorName = notif.actor?.displayName || notif.actor?.username || "Someone";
    switch (notif.type) {
      case "post_hug":
        return `${actorName} hugged your post`;
      case "post_metoo":
        return `${actorName} related to your post`;
      case "post_comment":
        return `${actorName} commented on your post`;
      case "comment_reply":
        return `${actorName} replied to your comment`;
      case "comment_like":
        return `${actorName} liked your comment`;
      default:
        return `${actorName} interacted with your post`;
    }
  };

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
      month: "short",
      day: "numeric",
    });
  };

  // Group by Today, This week, Earlier
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const oneWeekAgo = startOfToday - 7 * 24 * 60 * 60 * 1000;

  const groups = {
    Today: [],
    "This week": [],
    Earlier: [],
  };

  for (const n of notifications) {
    const time = new Date(n.createdAt).getTime();
    if (time >= startOfToday) {
      groups.Today.push(n);
    } else if (time >= oneWeekAgo) {
      groups["This week"].push(n);
    } else {
      groups.Earlier.push(n);
    }
  }

  const hasUnread = notifications.some((n) => !n.read);

  if (!user) {
    return (
      <Card variant="default" className="p-8 text-center max-w-lg mx-auto">
        <FaBell className="text-2xl text-text-muted mx-auto mb-3" />
        <h2 className="text-base font-bold text-text mb-1">
          Please log in to view notifications
        </h2>
        <p className="text-xs text-text-muted mb-4">
          Sign in to see when someone hugs, relates to, or comments on your thoughts.
        </p>
        <Button variant="primary" onClick={() => navigate("/login")}>
          Log in
        </Button>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto pb-12">
      {/* Top Header */}
      <header className="flex items-center justify-between p-2 px-4 bg-surface rounded-full border border-border">
        <div className="flex items-center gap-2.5">
          <FaBell className="text-primary-dark text-sm" />
          <h1 className="font-bold text-sm text-text">Notifications</h1>
        </div>

        {hasUnread && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={isMarkingAll}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-text-muted hover:text-white hover:bg-surface-raised transition-colors cursor-pointer disabled:opacity-50"
          >
            <FaCheckDouble className="text-[10px]" />
            <span>Mark all as read</span>
          </button>
        )}
      </header>

      {/* Main Content */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : isError ? (
        <Card variant="default" className="p-8 text-center flex flex-col items-center gap-3">
          <p className="text-sm text-text-muted">
            Failed to load notifications.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <FaRedo className="text-xs" />
            <span>Retry</span>
          </Button>
        </Card>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<FaBell />}
          title="Nothing yet."
          description="Kind words will show up here."
        />
      ) : (
        <div className="flex flex-col gap-6">
          {Object.entries(groups).map(([groupTitle, items]) => {
            if (items.length === 0) return null;

            return (
              <section key={groupTitle} className="flex flex-col gap-2.5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted px-2">
                  {groupTitle}
                </h2>

                <Card variant="default" className="p-0 overflow-hidden divide-y divide-border">
                  {items.map((notif) => {
                    const isUnread = !notif.read;

                    return (
                      <div
                        key={notif._id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`flex items-start gap-3.5 p-4 transition-colors cursor-pointer hover:bg-surface-raised/40 ${
                          isUnread ? "bg-primary-soft/40" : ""
                        }`}
                      >
                        {/* Unread dot indicator (accessible, not color alone) */}
                        <div className="w-2 flex items-center justify-center shrink-0 pt-2.5">
                          {isUnread && (
                            <span
                              className="w-2 h-2 rounded-full bg-primary"
                              title="Unread notification"
                              aria-label="Unread"
                            />
                          )}
                        </div>

                        {/* Actor Avatar with Action Icon Badge */}
                        <div className="relative shrink-0">
                          <Avatar
                            name={notif.actor?.displayName || "User"}
                            preset={notif.actor?.avatarPreset || "initials"}
                            size="md"
                          />
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-surface border border-border flex items-center justify-center shadow-xs">
                            {getActionIcon(notif.type)}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex flex-col flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-xs sm:text-sm font-semibold text-text leading-snug">
                              {getNotificationText(notif)}
                            </span>
                            <span className="text-[11px] text-text-muted shrink-0">
                              {getRelativeTime(notif.createdAt)}
                            </span>
                          </div>

                          {/* Post snippet */}
                          {notif.postSnippet && (
                            <p className="text-xs text-text-muted/80 mt-1 line-clamp-1 italic">
                              "{notif.postSnippet}"
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </Card>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
