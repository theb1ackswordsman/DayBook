import React, { useEffect, useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import Chip from "../ui/Chip";
import {
  useGetEntryQuery,
  useUpdateEntryMutation,
} from "../../redux/api/entriesApiSlice";
import { toast } from "react-toastify";

const MOODS = [
  { emoji: "🙂", label: "Happy" },
  { emoji: "😌", label: "Calm" },
  { emoji: "😔", label: "Sad" },
  { emoji: "😡", label: "Frustrated" },
  { emoji: "🌱", label: "Hopeful" },
  { emoji: "✨", label: "Grateful" },
];

const EditEntry = ({ id, isOpen, onClose }) => {
  const { data: getEntry, isLoading: entryLoading } = useGetEntryQuery(id, {
    skip: !isOpen,
  });
  const [updateEntry, { isLoading: entryUpdating }] = useUpdateEntryMutation();
  const isLoading = entryLoading || entryUpdating;

  const [formData, setFormData] = useState({
    title: "",
    mood: "🙂",
    content: "",
    date: "",
  });

  useEffect(() => {
    if (getEntry?.data) {
      setFormData({
        title: getEntry.data.title || "",
        mood: getEntry.data.mood || "🙂",
        content: getEntry.data.content || "",
        date: getEntry.data.date
          ? new Date(getEntry.data.date).toISOString().slice(0, 10)
          : "",
      });
    }
  }, [getEntry]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await updateEntry({ id, data: formData }).unwrap();
      toast.success(response.message || "Entry updated successfully");
      onClose && onClose();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update entry.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Journal Entry"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id={`editTitle-${id}`}
          name="title"
          label="Title"
          required
          value={formData.title}
          onChange={handleChange}
          placeholder="Entry title"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id={`editDate-${id}`}
            name="date"
            label="Date"
            type="date"
            required
            value={formData.date}
            onChange={handleChange}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text">Mood</label>
            <div className="flex flex-wrap gap-1.5">
              {MOODS.map((m) => (
                <Chip
                  key={m.emoji}
                  clickable
                  active={formData.mood === m.emoji}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, mood: m.emoji }))
                  }
                  variant={formData.mood === m.emoji ? "default" : "outline"}
                  className="text-xs"
                >
                  <span>{m.emoji}</span>
                </Chip>
              ))}
            </div>
          </div>
        </div>

        <Textarea
          id={`editContent-${id}`}
          name="content"
          label="Content"
          required
          value={formData.content}
          onChange={handleChange}
          placeholder="Write your thoughts..."
          minRows={5}
          maxLength={1000}
        />

        <div className="flex justify-end gap-3 pt-3 border-t border-border mt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? "Saving changes..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditEntry;
