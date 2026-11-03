import React, { useEffect, useRef } from "react";
import IconButton from "./IconButton";
import { FaTimes } from "react-icons/fa";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-lg",
  showCloseButton = true,
  className = "",
}) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialogElement = dialogRef.current;
    if (!dialogElement) return;

    if (isOpen) {
      if (!dialogElement.open) {
        dialogElement.showModal();
      }
    } else {
      if (dialogElement.open) {
        dialogElement.close();
      }
    }
  }, [isOpen]);

  // Handle native cancel event (pressing Escape)
  const handleCancel = (e) => {
    e.preventDefault();
    onClose && onClose();
  };

  // Close when clicking directly on the backdrop area
  const handleBackdropClick = (e) => {
    if (e.target === dialogRef.current) {
      onClose && onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      className={`fixed inset-0 m-auto bg-surface text-text border border-border rounded-card p-0 shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-xs w-[92vw] ${maxWidth} overflow-hidden transition-all duration-200 open:animate-in open:fade-in open:zoom-in-95 ${className}`}
    >
      <div className="flex flex-col max-h-[90vh]">
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-border">
            {title ? (
              <h2 className="text-xl font-semibold text-text">{title}</h2>
            ) : (
              <div />
            )}
            {showCloseButton && (
              <IconButton
                icon={<FaTimes className="text-base" />}
                aria-label="Close dialog"
                size="sm"
                onClick={onClose}
              />
            )}
          </div>
        )}

        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </dialog>
  );
};

export default Modal;
