import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useGetUnreadCountQuery } from "../redux/api/notificationsApiSlice";

export const useUnreadNotifications = () => {
  const user = useSelector((state) => state.user);
  const [isTabVisible, setIsTabVisible] = useState(!document.hidden);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const { data, refetch } = useGetUnreadCountQuery(undefined, {
    skip: !user,
    // Poll every 30s when tab is visible; 0 pauses polling when hidden
    pollingInterval: isTabVisible ? 30000 : 0,
  });

  // Refresh immediately on tab focus
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        refetch();
      }
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [user, refetch]);

  const unreadCount = data?.unreadCount || 0;
  return { unreadCount, refetch };
};

export default useUnreadNotifications;
