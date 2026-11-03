import React from "react";
import Modal from "../ui/Modal";
import { HELPLINES } from "../../config/helplines";
import { FaHeart, FaExternalLinkAlt, FaPhoneAlt, FaCommentAlt } from "react-icons/fa";

const HelpModal = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Immediate Support & Helplines"
      maxWidth="max-w-xl"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 p-4 bg-surface-raised rounded-[20px]">
          <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 text-lg">
            <FaHeart />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text">You are not alone</h3>
            <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
              If you are feeling overwhelmed, hopeless, or unsafe, free and confidential support is available 24/7.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1">
          {HELPLINES.map((line) => (
            <div
              key={line.id}
              className="p-4 bg-surface rounded-[20px] border border-border flex flex-col gap-2"
            >
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-text">{line.name}</h4>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-surface-raised text-primary-dark">
                  {line.badge}
                </span>
              </div>

              <p className="text-xs text-text-muted leading-relaxed">
                {line.description}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-border mt-1">
                <span className="text-xs text-text-muted font-medium">
                  {line.region}
                </span>

                {line.actionType === "tel" ? (
                  <a
                    href={`tel:${line.actionValue}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors"
                  >
                    <FaPhoneAlt className="text-[10px]" />
                    <span>{line.contact}</span>
                  </a>
                ) : line.actionType === "sms" ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-surface-raised text-text">
                    <FaCommentAlt className="text-[10px]" />
                    <span>{line.contact}</span>
                  </span>
                ) : (
                  <a
                    href={line.actionValue}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors"
                  >
                    <span>Visit website</span>
                    <FaExternalLinkAlt className="text-[10px]" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default HelpModal;
