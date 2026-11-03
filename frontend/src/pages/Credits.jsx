import React from "react";
import Card from "../components/ui/Card";
import { FaHeart, FaPaw, FaInfoCircle } from "react-icons/fa";

const Credits = () => {
  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto pb-8">
      <header className="flex items-center gap-3 p-2 px-4 bg-surface rounded-full border border-border">
        <FaInfoCircle className="text-primary text-sm" />
        <h1 className="font-bold text-sm text-text">Credits & Asset Attribution</h1>
      </header>

      <Card variant="default" className="p-6 flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-bold text-text mb-2">
            Asset Attribution
          </h2>
          <p className="text-sm text-text-muted leading-relaxed">
            All creative works, icons, and sprite art used in DayBook adhere to open-source and public-domain licensing standards.
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-soft text-primary flex items-center justify-center shrink-0 mt-0.5">
              <FaPaw className="text-xs" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text mb-1">Companion Pets (Cat, Dog, Fox, Duck)</h3>
              <p className="text-xs text-text-muted leading-relaxed mb-1">
                <strong>Author:</strong> DayBook Team (Original creation)
              </p>
              <p className="text-xs text-text-muted leading-relaxed mb-1">
                <strong>License:</strong> CC0 1.0 Universal (Public Domain Dedication)
              </p>
              <p className="text-xs text-text-muted leading-relaxed">
                Handcrafted inline SVG graphics designed cleanly for low CPU overhead and high accessibility. No external spritesheets or third-party game assets were copied or modified.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-soft text-primary flex items-center justify-center shrink-0 mt-0.5">
              <FaHeart className="text-xs" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text mb-1">Brand & Iconography</h3>
              <p className="text-xs text-text-muted leading-relaxed mb-1">
                <strong>React Icons:</strong> MIT License & SIL Open Font License (Font Awesome Free & React Icons community).
              </p>
              <p className="text-xs text-text-muted leading-relaxed">
                <strong>DayBook Logo:</strong> Original design by DayBook Team, CC0 Public Domain.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border text-xs text-text-muted">
          For full machine-readable licensing details, consult the <code>ASSETS.md</code> file in the repository root.
        </div>
      </Card>
    </div>
  );
};

export default Credits;
