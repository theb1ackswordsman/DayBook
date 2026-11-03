import React, { useState } from "react";
import Modal from "../ui/Modal";
import Chip from "../ui/Chip";
import Button from "../ui/Button";
import { FaLock, FaCalendarAlt } from "react-icons/fa";

const ReadMore = ({
  formattedDate,
  title,
  mood,
  content,
  formattedUpdateAt,
  isOpen: externalOpen,
  onClose: externalClose,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = typeof externalOpen === "boolean";
  const open = isControlled ? externalOpen : internalOpen;
  const setOpen = (val) => {
    if (isControlled) {
      if (!val && externalClose) externalClose();
    } else {
      setInternalOpen(val);
    }
  };

  return (
    <>
      {!isControlled && (
        <button
          onClick={() => setOpen(true)}
          className="text-xs font-semibold text-primary-dark hover:underline cursor-pointer focus-visible:outline-2 focus-visible:outline-primary rounded-button px-2 py-1"
        >
          Read full entry
        </button>
      )}

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        maxWidth="max-w-2xl"
      >
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-2xl select-none">{mood}</span>
              <Chip variant="private" className="text-xs">
                <FaLock className="text-[10px]" /> Private Journal
              </Chip>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
              <FaCalendarAlt />
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-text leading-snug">
            {title}
          </h1>

          {/* Content */}
          <div className="text-base text-text leading-relaxed whitespace-pre-wrap py-2 border-y border-border/50 max-h-[60vh] overflow-y-auto">
            {content}
          </div>

          {/* Footer info */}
          <div className="flex items-center justify-between pt-2 text-xs text-text-muted">
            <span>Last edited: {formattedUpdateAt}</span>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ReadMore;
