import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useSearchParams, Link } from "react-router-dom";
import {
  useGetEntriesQuery,
  useSearchEntryQuery,
} from "../redux/api/entriesApiSlice";
import EntryCard from "../components/entry/EntryCard";
import AddEntry from "../components/entry/AddEntry";
import { CardSkeleton } from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import SearchBox from "../components/navbar/SearchBox";
import { FaLock, FaSearch, FaFeatherAlt } from "react-icons/fa";

const Entries = () => {
  const user = useSelector((state) => state.user);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const { data: getEntries, isLoading: isLoadingEntries } = useGetEntriesQuery(
    undefined,
    { skip: searchQuery.length > 0 }
  );

  const { data: searchResult, isLoading: isLoadingSearch } =
    useSearchEntryQuery(searchQuery, {
      skip: searchQuery.length === 0,
    });

  const isLoading = isLoadingEntries || isLoadingSearch;
  const entries =
    searchQuery.length > 0 ? searchResult?.data || [] : getEntries?.data || [];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Journal Header with Lock icon & neutral charcoal styling */}
      <header className="flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[28%] bg-surface-raised ring-2 ring-border flex items-center justify-center text-sm font-bold text-text">
              <FaLock />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text flex items-center gap-2">
                Personal Journal
              </h1>
              <p className="text-xs text-text-muted">
                Private archive of your reflections and memories
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-surface-raised text-text border border-border">
              {entries.length} {entries.length === 1 ? "entry" : "entries"}
            </span>
          </div>
        </div>

        {/* Persistent "Only you can see this" Banner */}
        <div
          role="status"
          className="flex items-center gap-3 p-3.5 bg-surface-raised/80 text-text rounded-[20px] border border-border text-xs font-medium"
        >
          <FaLock className="text-text-muted shrink-0 text-xs" />
          <span>
            <strong className="text-white">Only you can see this:</strong> Your journal entries are private to your account.
          </span>
        </div>

        {/* Search Bar */}
        <div className="w-full mt-1">
          <SearchBox className="w-full" />
        </div>

        {/* Active Search Filter Badge */}
        {searchQuery && (
          <div className="flex items-center justify-between p-3 bg-surface-raised rounded-full text-xs font-semibold">
            <div className="flex items-center gap-2">
              <FaSearch className="text-[10px] text-text-muted" />
              <span>
                Search results for: <strong className="underline">"{searchQuery}"</strong>
              </span>
            </div>
            <Link
              to="/entries"
              className="text-xs text-text-muted hover:text-white font-bold"
            >
              Clear search &times;
            </Link>
          </div>
        )}
      </header>

      {/* Entry Feed List */}
      <section aria-label="Journal reflections" className="flex flex-col gap-4">
        {isLoading ? (
          <div className="flex flex-col gap-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : entries.length === 0 ? (
          searchQuery ? (
            <EmptyState
              icon={<FaSearch />}
              title="No matching reflections"
              description={`We couldn't find any entries matching "${searchQuery}". Try different keywords or browse all reflections.`}
              actionLabel="Show all entries"
              onAction={() => window.location.assign("/entries")}
            />
          ) : (
            <EmptyState
              icon={<FaFeatherAlt />}
              title="Your journal is waiting for you"
              description="A quiet, private haven for your thoughts. Whenever you're ready, write your very first entry."
              actionLabel="Share a thought"
              onAction={() => {
                const btn = document.querySelector('button[aria-label="Write a new entry"]');
                if (btn) btn.click();
              }}
            />
          )
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
              highlightText={searchQuery}
              authorName={user ? user.data.firstName : "You"}
            />
          ))
        )}
      </section>

      {/* Floating Add Entry Trigger on mobile */}
      <div className="md:hidden fixed bottom-20 right-5 z-20">
        <AddEntry />
      </div>
    </div>
  );
};

export default Entries;
