import React, { useState } from "react";
import Modal from "../ui/Modal";
import EntryComposer from "./EntryComposer";
import { FaPlus } from "react-icons/fa";

const AddEntry = ({ isOpen: externalOpen, onClose: externalClose }) => {
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
          className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary-dark transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 active:scale-95"
          aria-label="Create new journal entry"
          title="Share a thought"
        >
          <FaPlus className="text-xl" />
        </button>
      )}

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Share a Thought"
        maxWidth="max-w-xl"
      >
        <EntryComposer
          isModal
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </Modal>
    </>
  );
};

export default AddEntry;
