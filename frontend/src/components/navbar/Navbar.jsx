import React from "react";
import { Link } from "react-router-dom";
import ThemeController from "../ThemeController";
import NavProfile from "./NavProfile";
import SearchBox from "./SearchBox";
import IconButton from "../ui/IconButton";
import { FaBell } from "react-icons/fa";
import logo from "../../assets/logo.svg";

const Navbar = ({ onOpenSearch }) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-surface/90 backdrop-blur-md border-b border-border">
      <div className="max-w-[1280px] mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Mobile / Tablet Logo brand */}
        <div className="flex items-center gap-3 md:hidden">
          <Link
            to="/"
            className="flex items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-primary rounded-button p-1"
            aria-label="DayBook Home"
          >
            <img src={logo} alt="DayBook Logo" className="w-8 h-8 shrink-0" />
            <span className="text-lg font-bold text-text">DayBook</span>
          </Link>
        </div>

        {/* Desktop / Tablet Search Box */}
        <div className="hidden md:flex flex-1 max-w-md">
          <SearchBox className="w-full" />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {/* Notifications placeholder */}
          <div className="relative">
            <IconButton
              icon={<FaBell className="text-base text-text-muted" />}
              aria-label="Notifications (Coming soon)"
              title="Notifications (Coming soon)"
              variant="ghost"
              size="md"
              disabled
              className="opacity-50 cursor-not-allowed"
            />
          </div>

          <ThemeController />
          <NavProfile />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
