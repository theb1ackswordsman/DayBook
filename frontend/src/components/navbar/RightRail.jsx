import React from "react";
import Card from "../ui/Card";
import { FaHeart, FaExternalLinkAlt, FaShieldAlt } from "react-icons/fa";

const RightRail = () => {
  return (
    <aside
      aria-label="Support and resources"
      className="hidden lg:flex flex-col gap-5 w-[300px] shrink-0 sticky top-20 self-start"
    >
      {/* Real static Crisis Support Card per user instruction #5 */}
      <Card variant="default" className="border-border">
        <div className="flex items-center gap-2.5 mb-3 text-text">
          <div className="w-8 h-8 rounded-full bg-primary-soft text-primary-dark flex items-center justify-center text-sm">
            <FaHeart />
          </div>
          <h2 className="text-base font-semibold">Need support now?</h2>
        </div>

        <p className="text-sm text-text-muted leading-relaxed mb-4">
          If you are going through a difficult time or feeling overwhelmed, please know you are not alone. Confidential, free help is available 24/7.
        </p>

        <div className="flex flex-col gap-2.5 text-sm">
          <div className="p-3 bg-bg rounded-button border border-border">
            <div className="font-medium text-text flex items-center justify-between">
              <span>988 Suicide & Crisis Lifeline</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-chip bg-primary-soft text-primary-dark">24/7</span>
            </div>
            <p className="text-xs text-text-muted mt-1">
              Call or text <strong className="text-text">988</strong> (US & Canada)
            </p>
          </div>

          <div className="p-3 bg-bg rounded-button border border-border">
            <div className="font-medium text-text flex items-center justify-between">
              <span>Crisis Text Line</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-chip bg-primary-soft text-primary-dark">Free</span>
            </div>
            <p className="text-xs text-text-muted mt-1">
              Text <strong className="text-text">HOME</strong> to <strong className="text-text">741741</strong>
            </p>
          </div>

          <div className="p-3 bg-bg rounded-button border border-border">
            <div className="font-medium text-text flex items-center justify-between">
              <span>International Resources</span>
            </div>
            <a
              href="https://findahelpline.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary-dark hover:underline inline-flex items-center gap-1 mt-1 font-medium"
            >
              findahelpline.com <FaExternalLinkAlt className="text-[10px]" />
            </a>
          </div>
        </div>
      </Card>

      {/* Community Guidelines Card */}
      <Card variant="flat" className="bg-surface/50 border-border text-xs text-text-muted">
        <div className="flex items-center gap-2 font-medium text-text mb-1.5">
          <FaShieldAlt className="text-primary-dark" />
          <span>Community Sanctuary</span>
        </div>
        <p className="leading-relaxed">
          This is a calm, judgment-free space. Be gentle with yourself and others.
        </p>
        <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-xs">
          <span>&copy; DayBook Journal</span>
          <span className="text-text-muted">Private & Secure</span>
        </div>
      </Card>
    </aside>
  );
};

export default RightRail;
