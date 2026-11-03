import React, { useState, useEffect } from "react";
import PetPlayground from "../playground/PetPlayground";
import { FaPaw, FaTimes } from "react-icons/fa";
import { isPetHidden, setPetHidden } from "../pet/petStorage";

/**
 * Right rail for desktop (~380px wide on >=1280px).
 * Sticky, full viewport height (minus padding).
 * Below 1280px: floating pets button that opens a near-full-screen bottom sheet.
 * Only rendered on Home and Journal pages.
 */
const RightRail = () => {
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [hidden, setHidden] = useState(isPetHidden);

  useEffect(() => {
    const handleStorage = () => {
      setHidden(isPetHidden());
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleToggleHide = () => {
    const next = !hidden;
    setHidden(next);
    setPetHidden(next);
  };

  if (hidden) {
    return (
      <aside
        aria-label="Companion playground collapsed"
        className="hidden xl:flex flex-col w-[380px] shrink-0 sticky top-4 h-[calc(100vh-2rem)] py-2 pr-2"
      >
        <button
          type="button"
          onClick={handleToggleHide}
          className="w-full flex items-center justify-center gap-2 p-4 bg-surface border border-border rounded-[24px] text-xs font-semibold text-text-muted hover:text-text hover:border-text-muted/50 transition-colors cursor-pointer"
        >
          <FaPaw className="text-primary text-sm" />
          <span>Show Companion Playground</span>
        </button>
      </aside>
    );
  }

  return (
    <>
      {/* Desktop Right Rail (~380px wide, sticky, full viewport height minus padding) */}
      <aside
        aria-label="Companion playground rail"
        className="hidden xl:flex flex-col w-[380px] shrink-0 sticky top-4 h-[calc(100vh-2rem)] py-2 pr-2"
      >
        <div className="w-full h-full flex flex-col">
          <PetPlayground onClose={handleToggleHide} />
        </div>
      </aside>

      {/* Mobile floating pets button — shown below 1280px (xl) */}
      <div className="xl:hidden fixed bottom-20 left-5 z-30 md:bottom-8">
        <button
          type="button"
          onClick={() => setMobileSheetOpen(true)}
          className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary-dark active:scale-95 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          aria-label="Open pet companion playground"
        >
          <FaPaw className="text-lg" />
        </button>
      </div>

      {/* Mobile near-full-screen bottom sheet */}
      {mobileSheetOpen && (
        <>
          {/* Backdrop */}
          <div
            className="xl:hidden fixed inset-0 bg-black/50 backdrop-blur-xs z-40 transition-opacity"
            onClick={() => setMobileSheetOpen(false)}
          />

          {/* Near-full-screen sheet */}
          <div className="xl:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg border-t border-border rounded-t-[24px] p-3 pb-[calc(1rem+env(safe-area-inset-bottom))] h-[85vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 shadow-2xl">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border mb-2">
              <div className="flex items-center gap-2">
                <FaPaw className="text-primary text-sm" />
                <span className="text-sm font-bold text-text">
                  Companion Playground
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileSheetOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-raised cursor-pointer"
                aria-label="Close playground"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>

            <div className="flex-1 w-full overflow-hidden">
              <PetPlayground onClose={() => setMobileSheetOpen(false)} />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default RightRail;
