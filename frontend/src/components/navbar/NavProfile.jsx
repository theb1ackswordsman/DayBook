import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FaChevronDown, FaUser, FaSignOutAlt, FaLock } from "react-icons/fa";
import Modal from "../ui/Modal";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";
import Profile from "../auth/Profile";
import Password from "../auth/Password";
import Logout from "../auth/Logout";

const NavProfile = () => {
  const user = useSelector((state) => state.user);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [openPassword, setOpenPassword] = useState(false);
  const [openLogout, setOpenLogout] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {user ? (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
            aria-label={`User menu for ${user.data.firstName}`}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-button border border-border bg-surface text-text hover:bg-bg transition-colors cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-primary min-h-[44px]"
          >
            <Avatar name={user.data.firstName} size="sm" />
            <span className="font-medium text-sm hidden sm:inline max-w-[120px] truncate">
              {user.data.firstName}
            </span>
            <FaChevronDown
              className={`text-xs text-text-muted transition-transform duration-150 ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {dropdownOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-card shadow-lg py-1.5 z-50 animate-in fade-in"
            >
              <div className="px-4 py-2 border-b border-border">
                <p className="text-sm font-semibold text-text truncate">
                  {user.data.firstName} {user.data.lastName || ""}
                </p>
                <p className="text-xs text-text-muted truncate">
                  {user.data.email}
                </p>
              </div>

              <button
                role="menuitem"
                onClick={() => {
                  setDropdownOpen(false);
                  setOpenProfile(true);
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-text hover:bg-bg flex items-center gap-2.5 cursor-pointer focus-visible:bg-bg"
              >
                <FaUser className="text-text-muted text-xs" />
                Profile Information
              </button>

              <button
                role="menuitem"
                onClick={() => {
                  setDropdownOpen(false);
                  setOpenPassword(true);
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-text hover:bg-bg flex items-center gap-2.5 cursor-pointer focus-visible:bg-bg"
              >
                <FaLock className="text-text-muted text-xs" />
                Change Password
              </button>

              <div className="border-t border-border my-1" />

              <button
                role="menuitem"
                onClick={() => {
                  setDropdownOpen(false);
                  setOpenLogout(true);
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-danger hover:bg-danger/10 flex items-center gap-2.5 cursor-pointer focus-visible:bg-danger/10"
              >
                <FaSignOutAlt className="text-danger text-xs" />
                Log out
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Link to="/signup" className="hidden sm:inline-block">
            <Button variant="ghost" size="sm">
              Sign Up
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="primary" size="sm">
              Log In
            </Button>
          </Link>
        </div>
      )}

      {/* Modals using native <dialog> */}
      <Modal
        isOpen={openProfile}
        onClose={() => setOpenProfile(false)}
        title="Your Profile"
      >
        <Profile close={() => setOpenProfile(false)} />
      </Modal>

      <Modal
        isOpen={openPassword}
        onClose={() => setOpenPassword(false)}
        title="Security & Password"
      >
        <Password close={() => setOpenPassword(false)} />
      </Modal>

      <Modal
        isOpen={openLogout}
        onClose={() => setOpenLogout(false)}
        title="Confirm Log Out"
      >
        <Logout close={() => setOpenLogout(false)} />
      </Modal>
    </>
  );
};

export default NavProfile;
