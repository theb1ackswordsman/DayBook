import React from "react";
import Modal from "../ui/Modal";
import { SAFETY_RESOURCES } from "../../config/helplines";
import { FaShieldAlt } from "react-icons/fa";

const SafetyModal = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Safety & Community Sanctuary"
      maxWidth="max-w-lg"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 p-4 bg-surface-raised rounded-[20px]">
          <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 text-lg">
            <FaShieldAlt />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text">Your Safety Matters</h3>
            <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
              We are dedicated to maintaining a safe, calm, and supportive space for all journal entries.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {SAFETY_RESOURCES.map((item, idx) => (
            <div
              key={idx}
              className="p-4 bg-surface rounded-[20px] border border-border"
            >
              <h4 className="text-sm font-bold text-text mb-1">{item.title}</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default SafetyModal;
