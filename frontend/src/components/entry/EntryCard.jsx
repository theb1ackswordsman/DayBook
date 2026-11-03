import React, { useState, useRef, useEffect } from "react";
import EditEntry from "./EditEntry";
import DeleteEntry from "./DeleteEntry";
import ReadMore from "./ReadMore";
import Card from "../ui/Card";
import Chip from "../ui/Chip";
import Avatar from "../ui/Avatar";
import IconButton from "../ui/IconButton";
import {
  FaEllipsisH,
  FaPencilAlt,
  FaTrashAlt,
  FaBookOpen,
  FaLock,
} from "react-icons/fa";

const EntryCard = ({
  id,
  date,
  title,
  mood = "🙂",
  content,
  updatedAt,
  highlightText,
  authorName = "You",
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [readMoreOpen, setReadMoreOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Relative or formatted time
  const formattedDate = new Date(date).toLocaleDateString("default", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const formattedUpdateAt = new Date(updatedAt).toLocaleDateString("default", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // Calculate relative time if today/recent
  const getRelativeTime = (d) => {
    const now = new Date();
    const entryDate = new Date(d);
    const diffHours = Math.round((now - entryDate) / (1000 * 60 * 60));
    if (diffHours >= 0 && diffHours < 1) return "Just now";
    if (diffHours >= 1 && diffHours < 24) return `${diffHours}h ago`;
    return formattedDate;
  };

  const highlightMatch = (text) => {
    if (!highlightText) return text;
    const parts = text.split(new RegExp(`(${highlightText})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === highlightText.toLowerCase() ? (
        <mark
          key={index}
          className="bg-primary/20 text-white font-bold rounded px-1"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Human label for emoji
  const getMoodLabel = (m) => {
    switch (m) {
      case "🙂": return "Happy";
      case "😌": return "Calm";
      case "😔": return "Sad";
      case "😡": return "Frustrated";
      case "🌱": return "Hopeful";
      case "✨": return "Grateful";
      default: return m || "Calm";
    }
  };

  return (
    <>
      <article className="w-full">
        <Card variant="default" className="flex flex-col gap-4 relative p-6">
          {/* Top Row: Avatar + Bold Name + Muted relative time + "..." menu top-right */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar name={authorName} size="md" />
              <div className="flex flex-col">
                <span className="font-bold text-sm text-text leading-tight">
                  {authorName}
                </span>
                <span className="text-xs text-text-muted mt-0.5">
                  {getRelativeTime(date)}
                </span>
              </div>
            </div>

            {/* "..." Action menu */}
            <div className="relative" ref={menuRef}>
              <IconButton
                icon={<FaEllipsisH className="text-sm" />}
                aria-label="Entry actions menu"
                size="sm"
                variant="ghost"
                onClick={() => setMenuOpen((prev) => !prev)}
              />

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-1 w-44 bg-surface border border-border rounded-[20px] shadow-xl py-1.5 z-30 animate-in fade-in"
                >
                  <button
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      setReadMoreOpen(true);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-text hover:bg-surface-raised flex items-center gap-2.5 cursor-pointer"
                  >
                    <FaBookOpen className="text-xs text-text-muted" />
                    Read entry
                  </button>

                  <button
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      setEditOpen(true);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-text hover:bg-surface-raised flex items-center gap-2.5 cursor-pointer"
                  >
                    <FaPencilAlt className="text-xs text-text-muted" />
                    Edit entry
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
                    Delete entry
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Title if present */}
          {title && (
            <h2 className="text-base font-bold text-text leading-snug">
              {highlightMatch(title)}
            </h2>
          )}

          {/* Body text (16px, preserves line breaks) */}
          <p className="text-base text-text leading-relaxed whitespace-pre-wrap break-words">
            {highlightMatch(content)}
          </p>

          {/* Bottom row: Mood pill bottom-left; Lock icon + "Private" bottom-right */}
          <div className="flex items-center justify-between pt-3 border-t border-border mt-1">
            {/* Mood pill: solid fill, bold 13-14px, one hue per mood */}
            <Chip mood={mood} className="text-[13px] py-1 px-3.5">
              <span>{mood}</span>
              <span>{getMoodLabel(mood)}</span>
            </Chip>

            {/* Lock icon + "Private" bottom-right */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-text-muted">
              <FaLock className="text-[10px]" />
              <span>Private</span>
            </div>
          </div>
        </Card>
      </article>

      {/* Edit & Delete Dialogs */}
      <EditEntry
        id={id}
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
      />

      <DeleteEntry
        id={id}
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
      />

      <ReadMore
        isOpen={readMoreOpen}
        onClose={() => setReadMoreOpen(false)}
        formattedDate={formattedDate}
        title={title}
        mood={mood}
        content={content}
        formattedUpdateAt={formattedUpdateAt}
      />
    </>
  );
};

export default EntryCard;
