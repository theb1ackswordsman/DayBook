import apiSlice from "./apiSlice";

const checkInsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createCheckIn: builder.mutation({
      query: (data) => ({
        url: "/checkins",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["CheckIns"],
    }),

    getMyCheckIns: builder.query({
      query: () => "/checkins/me",
      providesTags: ["CheckIns"],
    }),

    deleteMyCheckIns: builder.mutation({
      query: () => ({
        url: "/checkins/me",
        method: "DELETE",
      }),
      invalidatesTags: ["CheckIns"],
    }),

    getInsights: builder.query({
      query: () => "/checkins/insights",
      providesTags: ["CheckIns"],
    }),
  }),
});

export const {
  useCreateCheckInMutation,
  useGetMyCheckInsQuery,
  useDeleteMyCheckInsMutation,
  useGetInsightsQuery,
} = checkInsApiSlice;

export default checkInsApiSlice;
