import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useAddEntryMutation } from "../../redux/api/entriesApiSlice";
import { useCreatePostMutation } from "../../redux/api/postsApiSlice";
import { containsCrisisLanguage } from "../../config/crisisKeywords";
import { toast } from "react-toastify";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import Chip from "../ui/Chip";
import {
  FaLock,
  FaCalendarAlt,
  FaGlobeAmericas,
  FaHeart,
} from "react-icons/fa";

const MOODS = [
  { emoji: "🙂", label: "Happy" },
  { emoji: "😌", label: "Calm" },
  { emoji: "😔", label: "Sad" },
  { emoji: "😡", label: "Frustrated" },
  { emoji: "🌱", label: "Hopeful" },
  { emoji: "✨", label: "Grateful" },
];

const MAX_BODY = 1000;

const EntryComposer = ({ onSuccess, onCancel, isModal = false }) => {
  const user = useSelector((state) => state.user);
  const [addEntry, { isLoading: isAddingEntry }] = useAddEntryMutation();
  const [createPost, { isLoading: isCreatingPost }] = useCreatePostMutation();

  const [audience, setAudience] = useState("private"); // "private" | "public"
  const [formData, setFormData] = useState({
    title: "",
    mood: "🙂",
    content: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const isLoading = isAddingEntry || isCreatingPost;
  const isPublic = audience === "public";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMoodSelect = (moodEmoji) => {
    setFormData((prev) => ({
      ...prev,
      mood: moodEmoji,
    }));
  };

  // Crisis banner detection
  const showCrisisBanner = useMemo(() => {
    return containsCrisisLanguage(formData.content) || containsCrisisLanguage(formData.title);
  }, [formData.content, formData.title]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isPublic) {
      // Public post — only needs body
      if (!formData.content.trim()) return;

      try {
        const response = await createPost({
          body: formData.content.trim(),
          mood: formData.mood,
        }).unwrap();
        toast.success(response.message || "Shared to DayBook!");
        setFormData({
          title: "",
          mood: "🙂",
          content: "",
          date: new Date().toISOString().slice(0, 10),
        });
        setAudience("private");
        window.dispatchEvent(new CustomEvent("daybook:entry-saved"));
        onSuccess && onSuccess();
      } catch (error) {
        toast.error(error?.data?.message || "An error occurred while sharing.");
      }
    } else {
      // Private journal entry — needs title and content
      if (!formData.title.trim() || !formData.content.trim()) return;

      try {
        const response = await addEntry(formData).unwrap();
        toast.success(response.message || "Entry saved to your private journal");
        setFormData({
          title: "",
          mood: "🙂",
          content: "",
          date: new Date().toISOString().slice(0, 10),
        });
        window.dispatchEvent(new CustomEvent("daybook:entry-saved"));
        onSuccess && onSuccess();
      } catch (error) {
        toast.error(error.data?.message || "An error occurred while saving.");
      }
    }
  };

  if (!user) {
    return (
      <div className="p-6 bg-surface border border-border rounded-[24px] text-center">
        <div className="w-12 h-12 rounded-[28%] bg-surface-raised ring-2 ring-border text-text mx-auto flex items-center justify-center text-lg mb-3">
          <FaLock />
        </div>
        <h3 className="text-base font-bold text-text mb-1">
          Sign in to journal your thoughts
        </h3>
        <p className="text-xs text-text-muted mb-4 max-w-sm mx-auto leading-relaxed">
          Your entries are private, secure, and encrypted. Log in to start writing.
        </p>
        <Link to="/login">
          <Button variant="primary">Log in to write</Button>
        </Link>
      </div>
    );
  }

  const isFormValid = isPublic
    ? formData.content.trim().length > 0
    : formData.title.trim() && formData.content.trim();

  const charCount = formData.content.length;
  const showCounter = charCount >= MAX_BODY * 0.8;

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col gap-4 ${
        isModal
          ? ""
          : "p-6 bg-surface border border-border rounded-[24px] shadow-card"
      }`}
    >
      {/* Audience Segmented Control */}
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div className="flex items-center gap-1 p-1 bg-surface-raised rounded-full">
          <button
            type="button"
            onClick={() => setAudience("private")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-150 cursor-pointer ${
              !isPublic
                ? "bg-surface text-white shadow-sm"
                : "text-text-muted hover:text-white"
            }`}
          >
            <FaLock className="text-[10px]" />
            <span>Private journal (only me)</span>
          </button>

          <button
            type="button"
            onClick={() => setAudience("public")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-150 cursor-pointer ${
              isPublic
                ? "bg-surface text-white shadow-sm"
                : "text-text-muted hover:text-white"
            }`}
          >
            <FaGlobeAmericas className="text-[10px]" />
            <span>Public (everyone)</span>
          </button>
        </div>

        {/* Date picker — only for private */}
        {!isPublic && (
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <FaCalendarAlt className="text-[10px]" />
            <input
              type="date"
              name="date"
              id="composerDate"
              value={formData.date}
              onChange={handleChange}
              className="bg-transparent text-text-muted text-xs border-0 p-0 focus-visible:outline-none cursor-pointer"
              aria-label="Entry date"
            />
          </div>
        )}
      </div>

      {/* Public helper text */}
      {isPublic && (
        <div className="flex items-center gap-2 px-3 py-2 bg-primary-soft rounded-full">
          <FaGlobeAmericas className="text-xs text-primary-dark shrink-0" />
          <span className="text-xs font-medium text-primary-dark">
            Visible to everyone on DayBook
          </span>
        </div>
      )}

      {/* Title — only for private */}
      {!isPublic && (
        <Input
          id="composerTitle"
          name="title"
          placeholder="Give your reflection a title..."
          value={formData.title}
          onChange={handleChange}
          required
          className="font-medium"
        />
      )}

      {/* Content Textarea */}
      <Textarea
        id="composerContent"
        name="content"
        placeholder={isPublic ? "How are you feeling today?" : "How are you feeling today?"}
        value={formData.content}
        onChange={handleChange}
        required
        minRows={isModal ? 5 : 3}
        maxLength={MAX_BODY}
      />

      {/* Character counter */}
      {showCounter && (
        <div className={`text-xs font-semibold text-right -mt-2 ${
          charCount >= MAX_BODY ? "text-danger" : "text-text-muted"
        }`}>
          {charCount}/{MAX_BODY}
        </div>
      )}

      {/* Crisis Banner — soft, non-blocking, never shaming */}
      {showCrisisBanner && (
        <div className="flex items-start gap-3 p-4 bg-primary-soft rounded-[16px] border border-primary/20">
          <FaHeart className="text-primary-dark text-sm shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-primary-dark">
              You're not alone
            </span>
            <span className="text-xs text-primary-dark/80 leading-relaxed">
              If you're going through a difficult time, support is available.
            </span>
            <Link
              to="/about"
              className="text-xs font-bold text-primary-dark hover:underline mt-1 w-fit"
              onClick={(e) => e.stopPropagation()}
            >
              I need help →
            </Link>
          </div>
        </div>
      )}

      {/* Mood Selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-text-muted px-1">
          Select Mood
        </label>
        <div className="flex flex-wrap gap-2">
          {MOODS.map((m) => (
            <Chip
              key={m.emoji}
              clickable
              active={formData.mood === m.emoji}
              mood={formData.mood === m.emoji ? m.emoji : undefined}
              variant={formData.mood === m.emoji ? undefined : "default"}
              onClick={() => handleMoodSelect(m.emoji)}
              className="text-xs py-1"
            >
              <span>{m.emoji}</span>
              <span>{m.label}</span>
            </Chip>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-border mt-1">
        <div className="text-xs text-text-muted">
          {isPublic
            ? "This will be visible to all DayBook users"
            : "Only you can see this reflection"}
        </div>

        <div className="flex items-center gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!isFormValid || isLoading}
          >
            {isLoading
              ? "Saving..."
              : isPublic
              ? "Share"
              : "Save to journal"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default EntryComposer;
