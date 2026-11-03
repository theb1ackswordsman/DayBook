import React from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaBell } from "react-icons/fa";
import logo from "../../assets/logo.svg";
import useUnreadNotifications from "../../hooks/useUnreadNotifications";

const MobileTopBar = ({ onOpenComposer }) => {
  const { unreadCount } = useUnreadNotifications();

  return (
    <header className="md:hidden sticky top-0 z-30 w-full bg-bg/95 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
      <Link
        to="/"
        className="flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-primary rounded-full p-1"
        aria-label="DayBook Home"
      >
        <img src={logo} alt="DayBook Logo" className="w-7 h-7 shrink-0" />
        <span className="font-bold text-base text-text tracking-tight">
          DayBook
        </span>
      </Link>

      <div className="flex items-center gap-3">
        {/* Notifications Bell */}
        <Link
          to="/notifications"
          className="relative w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-white hover:bg-surface-raised transition-colors"
          aria-label="Notifications"
        >
          <FaBell className="text-sm" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-primary text-white ring-2 ring-bg">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        {/* Write Button */}
        <button
          type="button"
          onClick={onOpenComposer}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-white text-xs font-bold rounded-full hover:bg-primary-dark transition-colors cursor-pointer shadow-sm"
          aria-label="Write a new entry"
        >
          <FaPlus className="text-[10px]" />
          <span>Write</span>
        </button>
      </div>
    </header>
  );
};

export default MobileTopBar;
