import React from "react";
import { NavLink, Link } from "react-router-dom";
import {
  FaHome,
  FaCompass,
  FaLock,
  FaEnvelope,
  FaBell,
  FaInfoCircle,
  FaPen,
} from "react-icons/fa";
import Button from "../ui/Button";
import logo from "../../assets/logo.svg";

const LeftNav = ({ onOpenComposer }) => {
  const activeClass =
    "flex items-center gap-3.5 px-4 py-3 rounded-button text-base font-semibold bg-primary-soft text-primary-dark border-l-4 border-primary transition-colors min-h-[44px]";
  const inactiveClass =
    "flex items-center gap-3.5 px-4 py-3 rounded-button text-base font-medium text-text-muted hover:text-text hover:bg-bg transition-colors min-h-[44px]";

  const privateActiveClass =
    "flex items-center gap-3.5 px-4 py-3 rounded-button text-base font-semibold bg-private-soft text-private border-l-4 border-private transition-colors min-h-[44px]";
  const privateInactiveClass =
    "flex items-center gap-3.5 px-4 py-3 rounded-button text-base font-medium text-private hover:bg-private-soft/60 transition-colors min-h-[44px]";

  return (
    <nav
      aria-label="Primary navigation"
      className="hidden md:flex flex-col gap-6 w-16 lg:w-[240px] shrink-0 sticky top-4 h-[calc(100vh-2rem)] py-2 select-none"
    >
      {/* App Brand Header */}
      <div className="flex items-center gap-3 px-2">
        <Link
          to="/"
          className="flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-primary rounded-button p-1"
          aria-label="DayBook Home"
        >
          <img src={logo} alt="DayBook Logo" className="w-9 h-9 shrink-0" />
          <span className="hidden lg:inline text-xl font-bold tracking-tight text-text">
            DayBook
          </span>
        </Link>
      </div>

      {/* Nav List */}
      <ul className="flex flex-col gap-1.5 list-none p-0 m-0">
        <li>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? activeClass : inactiveClass
            }
            title="Home"
            aria-label="Home"
          >
            <FaHome className="text-xl shrink-0" />
            <span className="hidden lg:inline">Home</span>
          </NavLink>
        </li>

        {/* Explore - Non-functional placeholder */}
        <li>
          <div
            className="flex items-center justify-between px-4 py-3 rounded-button text-base text-text-muted/60 cursor-not-allowed min-h-[44px]"
            title="Explore (Coming soon)"
            aria-label="Explore (Coming soon)"
          >
            <div className="flex items-center gap-3.5">
              <FaCompass className="text-xl shrink-0" />
              <span className="hidden lg:inline">Explore</span>
            </div>
            <span className="hidden lg:inline text-[11px] font-semibold px-2 py-0.5 rounded-chip bg-border text-text-muted">
              Soon
            </span>
          </div>
        </li>

        {/* Private Journal */}
        <li>
          <NavLink
            to="/entries"
            className={({ isActive }) =>
              isActive ? privateActiveClass : privateInactiveClass
            }
            title="Journal (Private)"
            aria-label="Journal (Private)"
          >
            <FaLock className="text-lg shrink-0 text-private" />
            <span className="hidden lg:inline font-semibold">Journal</span>
          </NavLink>
        </li>

        {/* Messages - Non-functional placeholder */}
        <li>
          <div
            className="flex items-center justify-between px-4 py-3 rounded-button text-base text-text-muted/60 cursor-not-allowed min-h-[44px]"
            title="Messages (Coming soon)"
            aria-label="Messages (Coming soon)"
          >
            <div className="flex items-center gap-3.5">
              <FaEnvelope className="text-xl shrink-0" />
              <span className="hidden lg:inline">Messages</span>
            </div>
            <span className="hidden lg:inline text-[11px] font-semibold px-2 py-0.5 rounded-chip bg-border text-text-muted">
              Soon
            </span>
          </div>
        </li>

        {/* Notifications - Non-functional placeholder */}
        <li>
          <div
            className="flex items-center justify-between px-4 py-3 rounded-button text-base text-text-muted/60 cursor-not-allowed min-h-[44px]"
            title="Notifications (Coming soon)"
            aria-label="Notifications (Coming soon)"
          >
            <div className="flex items-center gap-3.5">
              <FaBell className="text-xl shrink-0" />
              <span className="hidden lg:inline">Notifications</span>
            </div>
            <span className="hidden lg:inline text-[11px] font-semibold px-2 py-0.5 rounded-chip bg-border text-text-muted">
              Soon
            </span>
          </div>
        </li>

        {/* About */}
        <li>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive ? activeClass : inactiveClass
            }
            title="About"
            aria-label="About DayBook"
          >
            <FaInfoCircle className="text-xl shrink-0" />
            <span className="hidden lg:inline">About</span>
          </NavLink>
        </li>
      </ul>

      {/* Primary CTA: "Share a thought" */}
      <div className="mt-2">
        <Button
          variant="primary"
          onClick={onOpenComposer}
          className="w-full justify-center hidden lg:flex shadow-md py-3 text-base font-semibold"
          aria-label="Share a thought"
        >
          <FaPen className="text-sm mr-1" />
          Share a thought
        </Button>
        {/* Tablet Icon Button */}
        <button
          onClick={onOpenComposer}
          className="lg:hidden w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-colors shadow-md mx-auto cursor-pointer focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          title="Share a thought"
          aria-label="Share a thought"
        >
          <FaPen className="text-base" />
        </button>
      </div>
    </nav>
  );
};

export default LeftNav;
