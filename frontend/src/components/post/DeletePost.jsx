import React from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { useDeletePostMutation } from "../../redux/api/postsApiSlice";
import { toast } from "react-toastify";

const DeletePost = ({ id, isOpen, onClose }) => {
  const [deletePost, { isLoading }] = useDeletePostMutation();

  const handleDelete = async () => {
    try {
      const response = await deletePost(id).unwrap();
      toast.success(response.message || "Post deleted");
      onClose && onClose();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete post.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Post"
      maxWidth="max-w-sm"
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-text leading-relaxed">
          Are you sure you want to delete this post? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeletePost;
