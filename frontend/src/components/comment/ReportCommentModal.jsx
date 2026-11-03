import React, { useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Textarea from "../ui/Textarea";
import { useReportCommentMutation } from "../../redux/api/postsApiSlice";
import { toast } from "react-toastify";

const ReportCommentModal = ({ commentId, isOpen, onClose }) => {
  const [reportComment, { isLoading }] = useReportCommentMutation();
  const [reason, setReason] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return;

    try {
      const response = await reportComment({
        id: commentId,
        reason: reason.trim(),
      }).unwrap();
      toast.success(response.message || "Report submitted");
      setReason("");
      onClose && onClose();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to submit report.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Report Comment"
      maxWidth="max-w-sm"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-xs text-text-muted leading-relaxed">
          Help us keep DayBook safe. Let us know why you're reporting this comment.
        </p>

        <Textarea
          id="reportCommentReason"
          name="reason"
          placeholder="What's the concern?"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          minRows={3}
          maxLength={500}
        />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!reason.trim() || isLoading}
          >
            {isLoading ? "Submitting..." : "Submit Report"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReportCommentModal;
