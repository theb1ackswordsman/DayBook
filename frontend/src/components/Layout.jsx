import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useProfileQuery } from "../redux/api/usersApiSlice";
import { useDispatch, useSelector } from "react-redux";
import { removeUserInfo, userInfo } from "../redux/features/userSlice";
import LeftSidebar from "./navbar/LeftSidebar";
import MobileTopBar from "./navbar/MobileTopBar";
import MobileTabBar from "./navbar/MobileTabBar";
import RightRail from "./rail/RightRail";
import AddEntry from "./entry/AddEntry";
import Modal from "./ui/Modal";
import SearchBox from "./navbar/SearchBox";
import Profile from "./auth/Profile";
import Password from "./auth/Password";
import Logout from "./auth/Logout";

const Layout = () => {
  const { data: profile, isError, isLoading } = useProfileQuery();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.user);

  // Show right rail only on Home and Journal pages
  const showRail = location.pathname === "/" || location.pathname === "/entries";

  const [isReady, setIsReady] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
  const [mobilePasswordOpen, setMobilePasswordOpen] = useState(false);
  const [mobileLogoutOpen, setMobileLogoutOpen] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (profile) {
        dispatch(userInfo(profile));
      } else if (isError) {
        dispatch(removeUserInfo());
      }
      setIsReady(true);
    }
  }, [profile, dispatch, isError, isLoading]);

  const handleOpenComposer = () => {
    if (!user) {
      navigate("/login");
    } else {
      setComposerOpen(true);
    }
  };

  const handleOpenMobileProfile = () => {
    if (!user) {
      navigate("/login");
    } else {
      setMobileProfileOpen(true);
    }
  };

  if (!isReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-bg p-6 gap-3">
        <div className="w-10 h-10 rounded-full border-3 border-primary border-t-transparent animate-spin" />
        <p className="text-text-muted text-xs font-semibold animate-pulse">
          Loading sanctuary...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col md:flex-row font-sans selection:bg-surface-raised selection:text-white">
      {/* Mobile Top Bar (No desktop top bar!) */}
      <MobileTopBar onOpenComposer={handleOpenComposer} />

      {/* Left Sidebar (280px, sticky, 1px divider, same bg as page, no card) */}
      <LeftSidebar onOpenComposer={handleOpenComposer} />

      {/* Center Column + optional Right Rail */}
      <div className="flex-1 flex justify-center items-start w-full min-w-0 px-4 sm:px-6 md:px-8 py-6 pb-24 md:pb-8 gap-6 xl:gap-8">
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 max-w-[820px] xl:max-w-[680px] 2xl:max-w-[780px] flex flex-col min-w-0 focus:outline-none"
        >
          <Outlet />
        </main>

        {/* Right Rail (only on Home and Journal, only for logged-in users) */}
        {showRail && user && <RightRail />}
      </div>

      {/* Mobile Bottom Tab Bar */}
      <MobileTabBar
        onOpenComposer={handleOpenComposer}
        onOpenProfile={handleOpenMobileProfile}
        onOpenSearch={() => setMobileSearchOpen(true)}
        user={user}
      />

      {/* Global Composer Modal */}
      <AddEntry
        isOpen={composerOpen}
        onClose={() => setComposerOpen(false)}
      />

      {/* Mobile Search Modal */}
      <Modal
        isOpen={mobileSearchOpen}
        onClose={() => setMobileSearchOpen(false)}
        title="Search Reflections"
        maxWidth="max-w-md"
      >
        <div className="py-2">
          <SearchBox
            autoFocus
            onClose={() => setMobileSearchOpen(false)}
            className="w-full"
          />
        </div>
      </Modal>

      {/* Mobile Profile Modals */}
      {user && (
        <>
          <Modal
            isOpen={mobileProfileOpen}
            onClose={() => setMobileProfileOpen(false)}
            title="Profile Information"
          >
            <Profile close={() => setMobileProfileOpen(false)} />
            <div className="mt-4 pt-3 border-t border-border flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileProfileOpen(false);
                  setMobilePasswordOpen(true);
                }}
                className="text-left text-xs text-text font-bold py-1.5 hover:underline"
              >
                Change password &rarr;
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileProfileOpen(false);
                  setMobileLogoutOpen(true);
                }}
                className="text-left text-xs text-danger font-bold py-1.5 hover:underline"
              >
                Log out
              </button>
            </div>
          </Modal>

          <Modal
            isOpen={mobilePasswordOpen}
            onClose={() => setMobilePasswordOpen(false)}
            title="Update Password"
          >
            <Password close={() => setMobilePasswordOpen(false)} />
          </Modal>

          <Modal
            isOpen={mobileLogoutOpen}
            onClose={() => setMobileLogoutOpen(false)}
            title="Confirm Log Out"
          >
            <Logout close={() => setMobileLogoutOpen(false)} />
          </Modal>
        </>
      )}
    </div>
  );
};

export default Layout;
