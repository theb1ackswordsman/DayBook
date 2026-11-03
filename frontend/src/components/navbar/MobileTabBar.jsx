import React from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaBookOpen, FaPlus, FaHeartbeat, FaUser } from "react-icons/fa";

const MobileTabBar = ({ onOpenComposer, onOpenProfile, onOpenSearch, user }) => {
  const activeClass =
    "flex flex-col items-center justify-center flex-1 h-full text-white font-bold text-xs gap-1 select-none focus-visible:outline-2 focus-visible:outline-primary";
  const inactiveClass =
    "flex flex-col items-center justify-center flex-1 h-full text-text-muted hover:text-text font-medium text-xs gap-1 select-none focus-visible:outline-2 focus-visible:outline-primary";

  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border shadow-lg pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
        {/* Home */}
        <NavLink
          to="/"
          end
          className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
          aria-label="Home"
        >
          <FaHome className="text-lg" />
          <span>Home</span>
        </NavLink>

        {/* Journal */}
        <NavLink
          to="/entries"
          className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
          aria-label="Journal"
        >
          <FaBookOpen className="text-lg" />
          <span>Journal</span>
        </NavLink>

        {/* Center + (New Entry) */}
        <div className="flex items-center justify-center flex-1">
          <button
            type="button"
            onClick={onOpenComposer}
            className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center shadow-md active:scale-95 transition-transform cursor-pointer focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            aria-label="Create new entry"
          >
            <FaPlus className="text-base" />
          </button>
        </div>

        {/* Check-in */}
        <NavLink
          to={user ? "/check-in" : "/login"}
          className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
          aria-label="Check-in"
        >
          <FaHeartbeat className="text-lg" />
          <span>Check-in</span>
        </NavLink>

        {/* Profile */}
        <NavLink
          to={user ? "/profile" : "/login"}
          className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
          aria-label={user ? `${user.data.firstName} Profile` : "Profile / Login"}
        >
          <FaUser className="text-lg" />
          <span>{user ? user.data.firstName : "Profile"}</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default MobileTabBar;
