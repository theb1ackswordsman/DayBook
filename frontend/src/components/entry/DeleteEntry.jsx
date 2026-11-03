import React from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { useDeleteEntryMutation } from "../../redux/api/entriesApiSlice";
import { toast } from "react-toastify";
import { FaTrashAlt } from "react-icons/fa";

const DeleteEntry = ({ id, isOpen, onClose }) => {
  const [deleteEntry, { isLoading }] = useDeleteEntryMutation();

  const handleDelete = async () => {
    try {
      const response = await deleteEntry(id).unwrap();
      toast.success(response.message || "Entry deleted successfully");
      onClose && onClose();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete the entry.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Journal Entry"
      maxWidth="max-w-md"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-danger/10 text-danger flex items-center justify-center shrink-0">
            <FaTrashAlt />
          </div>
          <div>
            <p className="text-base font-semibold text-text">
              Are you sure you want to delete this entry?
            </p>
            <p className="text-sm text-text-muted mt-1 leading-relaxed">
              This action cannot be undone. This entry will be permanently removed from your private journal.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border mt-2">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? "Deleting..." : "Delete Entry"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteEntry;
