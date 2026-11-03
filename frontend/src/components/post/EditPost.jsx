import React, { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Textarea from "../ui/Textarea";
import Chip from "../ui/Chip";
import { useUpdatePostMutation } from "../../redux/api/postsApiSlice";
import { toast } from "react-toastify";

const MOODS = [
  { emoji: "🙂", label: "Happy" },
  { emoji: "😌", label: "Calm" },
  { emoji: "😔", label: "Sad" },
  { emoji: "😡", label: "Frustrated" },
  { emoji: "🌱", label: "Hopeful" },
  { emoji: "✨", label: "Grateful" },
];

const MAX_BODY = 1000;

const EditPost = ({ post, isOpen, onClose }) => {
  const [updatePost, { isLoading }] = useUpdatePostMutation();

  const [body, setBody] = useState("");
  const [mood, setMood] = useState("");

  useEffect(() => {
    if (post && isOpen) {
      setBody(post.body || "");
      setMood(post.mood || "");
    }
  }, [post, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;

    try {
      const response = await updatePost({
        id: post._id,
        data: { body: body.trim(), mood: mood || undefined },
      }).unwrap();
      toast.success(response.message || "Post updated");
      onClose && onClose();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update post.");
    }
  };

  const charCount = body.length;
  const showCounter = charCount >= MAX_BODY * 0.8;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Post"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Textarea
          id="editPostBody"
          name="body"
          placeholder="What's on your mind?"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          minRows={4}
          maxLength={MAX_BODY}
        />

        {showCounter && (
          <div className={`text-xs font-semibold text-right -mt-2 ${
            charCount >= MAX_BODY ? "text-danger" : "text-text-muted"
          }`}>
            {charCount}/{MAX_BODY}
          </div>
        )}

        {/* Mood Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-muted px-1">
            Mood
          </label>
          <div className="flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <Chip
                key={m.emoji}
                clickable
                active={mood === m.emoji}
                mood={mood === m.emoji ? m.emoji : undefined}
                variant={mood === m.emoji ? undefined : "default"}
                onClick={() => setMood(mood === m.emoji ? "" : m.emoji)}
                className="text-xs py-1"
              >
                <span>{m.emoji}</span>
                <span>{m.label}</span>
              </Chip>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-border mt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!body.trim() || isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditPost;
