import apiSlice from "./apiSlice";

const notificationsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: ({ cursor, cursorId, limit = 20 } = {}) => {
        const params = new URLSearchParams();
        if (cursor) params.set("cursor", cursor);
        if (cursorId) params.set("cursorId", cursorId);
        params.set("limit", limit);
        return `/notifications?${params.toString()}`;
      },
      providesTags: ["Notifications"],
      serializeQueryArgs: () => "notificationsList",
      merge: (currentCache, newItems, { arg }) => {
        if (!arg?.cursor) {
          return newItems;
        }
        return {
          data: [...(currentCache?.data || []), ...(newItems?.data || [])],
          pagination: newItems.pagination,
        };
      },
      forceRefetch: ({ currentArg, previousArg }) => currentArg !== previousArg,
    }),

    getUnreadCount: builder.query({
      query: () => "/notifications/unread-count",
      providesTags: ["Notifications"],
    }),

    markAsRead: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications"],
    }),

    markAllAsRead: builder.mutation({
      query: () => ({
        url: "/notifications/read-all",
        method: "POST",
      }),
      invalidatesTags: ["Notifications"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} = notificationsApiSlice;
