import apiSlice from "./apiSlice";

const postsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createPost: builder.mutation({
      query: (data) => ({
        url: "/posts",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Posts"],
    }),

    getFeed: builder.query({
      query: ({ cursor, cursorId, mood, limit = 20 } = {}) => {
        const params = new URLSearchParams();
        if (cursor) params.set("cursor", cursor);
        if (cursorId) params.set("cursorId", cursorId);
        if (mood) params.set("mood", mood);
        params.set("limit", limit);
        return `/posts?${params.toString()}`;
      },
      providesTags: ["Posts"],
      serializeQueryArgs: ({ queryArgs }) => {
        return { mood: queryArgs?.mood || "" };
      },
      merge: (currentCache, newItems, { arg }) => {
        if (!arg?.cursor) {
          return newItems;
        }
        return {
          data: [...(currentCache?.data || []), ...(newItems?.data || [])],
          pagination: newItems.pagination,
        };
      },
      forceRefetch: ({ currentArg, previousArg }) => {
        return currentArg !== previousArg;
      },
    }),

    getPost: builder.query({
      query: (id) => `/posts/${id}`,
      providesTags: (result, error, id) => [{ type: "Posts", id }],
    }),

    getMyPosts: builder.query({
      query: ({ cursor, cursorId, limit = 20 } = {}) => {
        const params = new URLSearchParams();
        if (cursor) params.set("cursor", cursor);
        if (cursorId) params.set("cursorId", cursorId);
        params.set("limit", limit);
        return `/posts/mine?${params.toString()}`;
      },
      providesTags: ["Posts"],
      serializeQueryArgs: () => "myPosts",
      merge: (currentCache, newItems, { arg }) => {
        if (!arg?.cursor) return newItems;
        return {
          data: [...(currentCache?.data || []), ...(newItems?.data || [])],
          pagination: newItems.pagination,
        };
      },
      forceRefetch: ({ currentArg, previousArg }) => {
        return currentArg !== previousArg;
      },
    }),

    updatePost: builder.mutation({
      query: ({ id, data }) => ({
        url: `/posts/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => ["Posts", { type: "Posts", id }],
    }),

    deletePost: builder.mutation({
      query: (id) => ({
        url: `/posts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Posts"],
    }),

    addReaction: builder.mutation({
      query: ({ id, type }) => ({
        url: `/posts/${id}/reactions/${type}`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Posts", id }],
    }),

    removeReaction: builder.mutation({
      query: ({ id, type }) => ({
        url: `/posts/${id}/reactions/${type}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Posts", id }],
    }),

    reportPost: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/posts/${id}/report`,
        method: "POST",
        body: { reason },
      }),
    }),

    // Comments
    getPostComments: builder.query({
      query: ({ postId, cursor, cursorId, limit = 20 }) => {
        const params = new URLSearchParams();
        if (cursor) params.set("cursor", cursor);
        if (cursorId) params.set("cursorId", cursorId);
        params.set("limit", limit);
        return `/posts/${postId}/comments?${params.toString()}`;
      },
      providesTags: ["Comments"],
      serializeQueryArgs: ({ queryArgs }) => {
        return { postId: queryArgs?.postId };
      },
      merge: (currentCache, newItems, { arg }) => {
        if (!arg?.cursor) return newItems;
        return {
          data: [...(currentCache?.data || []), ...(newItems?.data || [])],
          pagination: newItems.pagination,
        };
      },
      forceRefetch: ({ currentArg, previousArg }) => currentArg !== previousArg,
    }),

    getCommentReplies: builder.query({
      query: ({ commentId, cursor, cursorId, limit = 20 }) => {
        const params = new URLSearchParams();
        if (cursor) params.set("cursor", cursor);
        if (cursorId) params.set("cursorId", cursorId);
        params.set("limit", limit);
        return `/comments/${commentId}/replies?${params.toString()}`;
      },
    }),

    createComment: builder.mutation({
      query: ({ postId, body, parentId }) => ({
        url: `/posts/${postId}/comments`,
        method: "POST",
        body: { body, parentId },
      }),
      invalidatesTags: (result, error, { postId }) => ["Comments", { type: "Posts", id: postId }],
    }),

    deleteComment: builder.mutation({
      query: (id) => ({
        url: `/comments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Comments", "Posts"],
    }),

    likeComment: builder.mutation({
      query: (id) => ({
        url: `/comments/${id}/like`,
        method: "PUT",
      }),
    }),

    unlikeComment: builder.mutation({
      query: (id) => ({
        url: `/comments/${id}/like`,
        method: "DELETE",
      }),
    }),

    reportComment: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/comments/${id}/report`,
        method: "POST",
        body: { reason },
      }),
    }),
  }),
});

export const {
  useCreatePostMutation,
  useGetFeedQuery,
  useGetPostQuery,
  useGetMyPostsQuery,
  useUpdatePostMutation,
  useDeletePostMutation,
  useAddReactionMutation,
  useRemoveReactionMutation,
  useReportPostMutation,
  useGetPostCommentsQuery,
  useGetCommentRepliesQuery,
  useCreateCommentMutation,
  useDeleteCommentMutation,
  useLikeCommentMutation,
  useUnlikeCommentMutation,
  useReportCommentMutation,
} = postsApiSlice;
