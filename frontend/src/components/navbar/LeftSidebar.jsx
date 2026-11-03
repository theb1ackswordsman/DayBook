import React, { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FaHome,
  FaBookOpen,
  FaCompass,
  FaEnvelope,
  FaBell,
  FaUser,
  FaPlus,
  FaShieldAlt,
  FaHeart,
  FaHeartbeat,
  FaInfoCircle,
  FaFileAlt,
  FaSignOutAlt,
  FaChevronDown,
} from "react-icons/fa";
import Avatar from "../ui/Avatar";
import SegmentedThemeToggle from "./SegmentedThemeToggle";
import HelpModal from "./HelpModal";
import SafetyModal from "./SafetyModal";
import Modal from "../ui/Modal";
import Profile from "../auth/Profile";
import Password from "../auth/Password";
import Logout from "../auth/Logout";
import logo from "../../assets/logo.svg";
import useUnreadNotifications from "../../hooks/useUnreadNotifications";

const LeftSidebar = ({ onOpenComposer }) => {
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  const { unreadCount } = useUnreadNotifications();

  const [helpOpen, setHelpOpen] = useState(false);
  const [safetyOpen, setSafetyOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Active nav item per instruction #2: raised-surface pill with white text/icon. No purple tint, no left indicator bar.
  const activeClass =
    "flex items-center gap-3.5 px-4 py-2.5 rounded-full text-sm font-semibold bg-surface-raised text-white transition-colors duration-150";
  const inactiveClass =
    "flex items-center gap-3.5 px-4 py-2.5 rounded-full text-sm font-medium text-text-muted hover:text-white hover:bg-surface-raised/50 transition-colors duration-150";

  const handleProfileClick = () => {
    if (!user) {
      navigate("/login");
    } else {
      setProfileOpen(true);
    }
  };

  return (
    <>
      <aside
        aria-label="Sidebar Navigation"
        className="hidden md:flex flex-col w-[280px] shrink-0 sticky top-0 h-screen bg-bg border-r border-border p-5 select-none z-20 overflow-y-auto"
      >
        {/* Top Row: Logo left, Pill "+ Write" button right */}
        <div className="flex items-center justify-between gap-3 mb-6 pt-1">
          <Link
            to="/"
            className="flex items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-primary rounded-full p-1"
            aria-label="DayBook Home"
          >
            <img src={logo} alt="DayBook Logo" className="w-8 h-8 shrink-0" />
            <span className="font-bold text-lg text-text tracking-tight">
              DayBook
            </span>
          </Link>

          <button
            type="button"
            onClick={onOpenComposer}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-full hover:bg-primary-dark active:bg-primary-dark transition-colors cursor-pointer shadow-sm focus-visible:outline-2 focus-visible:outline-primary"
            aria-label="Write a new entry"
          >
            <FaPlus className="text-[10px]" />
            <span>Write</span>
          </button>
        </div>

        {/* Primary Navigation */}
        <nav className="flex flex-col gap-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
          >
            <FaHome className="text-base shrink-0" />
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/entries"
            className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
          >
            <FaBookOpen className="text-base shrink-0" />
            <span>Journal</span>
          </NavLink>

          {/* Explore (Soon) */}
          <div
            className="flex items-center justify-between px-4 py-2.5 rounded-full text-sm font-medium text-text-muted/50 cursor-not-allowed"
            title="Explore (Coming soon)"
          >
            <div className="flex items-center gap-3.5">
              <FaCompass className="text-base shrink-0" />
              <span>Explore</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-raised text-text-muted">
              Soon
            </span>
          </div>

          {/* Check-in */}
          <NavLink
            to={user ? "/check-in" : "/login"}
            className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
          >
            <div className="flex items-center gap-3.5">
              <FaHeartbeat className="text-base shrink-0" />
              <span>Check-in</span>
            </div>
          </NavLink>

          {/* Notifications */}
          <NavLink
            to={user ? "/notifications" : "/login"}
            className={({ isActive }) =>
              `${isActive ? activeClass : inactiveClass} justify-between`
            }
          >
            <div className="flex items-center gap-3.5">
              <FaBell className="text-base shrink-0" />
              <span>Notifications</span>
            </div>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </NavLink>

          {/* Profile */}
          <NavLink
            to={user ? "/profile" : "/login"}
            className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
          >
            <FaUser className="text-base shrink-0" />
            <span>{user ? "Profile" : "Log In / Register"}</span>
          </NavLink>
        </nav>

        {/* 1px Divider */}
        <div className="border-t border-border my-4" />

        {/* Secondary Links: Safety Centre, I need help, About */}
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => setSafetyOpen(true)}
            className="flex items-center gap-3.5 px-4 py-2.5 rounded-full text-sm font-medium text-text-muted hover:text-white hover:bg-surface-raised/50 transition-colors w-full text-left cursor-pointer"
          >
            <FaShieldAlt className="text-base shrink-0 text-text-muted" />
            <span>Safety Centre</span>
          </button>

          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            className="flex items-center gap-3.5 px-4 py-2.5 rounded-full text-sm font-semibold text-text hover:text-white hover:bg-surface-raised/50 transition-colors w-full text-left cursor-pointer"
          >
            <FaHeart className="text-base shrink-0 text-danger" />
            <span>I need help</span>
          </button>

          <NavLink
            to="/about"
            className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
          >
            <FaInfoCircle className="text-base shrink-0 text-text-muted" />
            <span>About</span>
          </NavLink>

          <NavLink
            to="/guidelines"
            className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
          >
            <FaFileAlt className="text-base shrink-0 text-text-muted" />
            <span>Guidelines</span>
          </NavLink>

          <NavLink
            to="/credits"
            className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
          >
            <FaInfoCircle className="text-base shrink-0 text-text-muted" />
            <span>Credits</span>
          </NavLink>
        </div>

        {/* Bottom Section: Theme Toggle + User Footer */}
        <div className="mt-auto pt-4 flex flex-col gap-4">
          <SegmentedThemeToggle />

          {/* User Footer */}
          {user ? (
            <div className="relative pt-2 border-t border-border">
              <div className="flex items-center justify-between gap-2 p-1">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2.5 min-w-0 text-left hover:opacity-90 cursor-pointer flex-1"
                  aria-expanded={userDropdownOpen}
                >
                  <Avatar name={user.data.firstName} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-text truncate">
                      {user.data.firstName} {user.data.lastName || ""}
                    </p>
                    <p className="text-[11px] text-text-muted truncate">
                      Personal Journal
                    </p>
                  </div>
                  <FaChevronDown className="text-xs text-text-muted shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => setLogoutOpen(true)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-danger hover:bg-surface-raised transition-colors shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
                  aria-label="Log out"
                  title="Log out"
                >
                  <FaSignOutAlt className="text-xs" />
                </button>
              </div>

              {/* User Dropdown */}
              {userDropdownOpen && (
                <div
                  role="menu"
                  className="absolute bottom-full mb-2 left-0 right-0 bg-surface border border-border rounded-[20px] shadow-xl p-2 z-30 animate-in fade-in"
                >
                  <button
                    role="menuitem"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      setProfileOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 rounded-full text-xs font-semibold text-text hover:bg-surface-raised flex items-center gap-2 cursor-pointer"
                  >
                    <FaUser className="text-xs text-text-muted" />
                    Edit Profile
                  </button>

                  <button
                    role="menuitem"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      setPasswordOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 rounded-full text-xs font-semibold text-text hover:bg-surface-raised flex items-center gap-2 cursor-pointer"
                  >
                    <span>Change Password</span>
                  </button>

                  <div className="border-t border-border my-1" />

                  <button
                    role="menuitem"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      setLogoutOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 rounded-full text-xs font-semibold text-danger hover:bg-danger/10 flex items-center gap-2 cursor-pointer"
                  >
                    <FaSignOutAlt className="text-xs text-danger" />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="pt-2 border-t border-border">
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 py-2 px-4 rounded-full bg-surface-raised text-text font-bold text-xs hover:opacity-90 transition-opacity"
              >
                <FaUser className="text-xs" />
                <span>Log In / Sign Up</span>
              </Link>
            </div>
          )}

          <p className="text-[11px] text-text-muted/70 text-center leading-tight px-1">
            Student project, not a substitute for professional help.
          </p>
        </div>
      </aside>

      {/* Modals */}
      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
      <SafetyModal isOpen={safetyOpen} onClose={() => setSafetyOpen(false)} />

      {user && (
        <>
          <Modal
            isOpen={profileOpen}
            onClose={() => setProfileOpen(false)}
            title="Profile Information"
          >
            <Profile close={() => setProfileOpen(false)} />
          </Modal>

          <Modal
            isOpen={passwordOpen}
            onClose={() => setPasswordOpen(false)}
            title="Update Password"
          >
            <Password close={() => setPasswordOpen(false)} />
          </Modal>

          <Modal
            isOpen={logoutOpen}
            onClose={() => setLogoutOpen(false)}
            title="Confirm Log Out"
          >
            <Logout close={() => setLogoutOpen(false)} />
          </Modal>
        </>
      )}
    </>
  );
};

export default LeftSidebar;
