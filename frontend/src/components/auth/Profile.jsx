import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { usePatchProfileMutation } from "../../redux/api/usersApiSlice";
import { userInfo } from "../../redux/features/userSlice";
import { toast } from "react-toastify";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import Button from "../ui/Button";
import Chip from "../ui/Chip";
import Avatar from "../ui/Avatar";
import {
  COVER_PRESETS,
  AVATAR_PRESETS,
  VIBE_PRESETS,
} from "../../config/profilePresets";
import { setPetHidden } from "../pet/petStorage";

const Profile = ({ close, defaultTab = "info" }) => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState(defaultTab); // "info" | "appearance"

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    displayName: "",
    status: "",
    bio: "",
    vibes: [],
    coverPreset: "gradient-twilight",
    avatarPreset: "initials",
    petsHidden: false,
  });

  useEffect(() => {
    if (user?.data) {
      setFormData({
        firstName: user.data.firstName || "",
        lastName: user.data.lastName || "",
        displayName: user.data.displayName || user.data.firstName || "",
        status: user.data.status || "",
        bio: user.data.bio || "",
        vibes: Array.isArray(user.data.vibes) ? user.data.vibes : [],
        coverPreset: user.data.coverPreset || "gradient-twilight",
        avatarPreset: user.data.avatarPreset || "initials",
        petsHidden: user.data.petsHidden || false,
      });
    }
  }, [user]);

  const [patchProfile, { isLoading }] = usePatchProfileMutation();

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleVibe = (vibe) => {
    setFormData((prev) => {
      const exists = prev.vibes.includes(vibe);
      if (exists) {
        return { ...prev, vibes: prev.vibes.filter((v) => v !== vibe) };
      }
      if (prev.vibes.length >= 5) {
        toast.info("You can choose up to 5 vibes.");
        return prev;
      }
      return { ...prev, vibes: [...prev.vibes, vibe] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await patchProfile(formData).unwrap();
      // Keep redux user and localStorage in sync
      dispatch(userInfo(response));
      setPetHidden(formData.petsHidden);
      toast.success(response.message || "Profile updated successfully!");
      close();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update profile.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Sub Tabs: Info vs Style */}
      <div className="flex items-center gap-1 p-1 bg-surface-raised rounded-full border border-border w-fit mx-auto">
        <button
          type="button"
          onClick={() => setActiveTab("info")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
            activeTab === "info"
              ? "bg-surface text-white shadow-sm"
              : "text-text-muted hover:text-white"
          }`}
        >
          Details & Bio
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("appearance")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
            activeTab === "appearance"
              ? "bg-surface text-white shadow-sm"
              : "text-text-muted hover:text-white"
          }`}
        >
          Cover & Avatar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-1">
        {activeTab === "info" ? (
          <div className="flex flex-col gap-3.5 max-h-[60vh] overflow-y-auto pr-1">
            <Input
              id="profileDisplayName"
              name="displayName"
              label="Display Name"
              value={formData.displayName}
              onChange={handleTextChange}
              placeholder="How you wish to be called"
              maxLength={50}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                id="profileFirstName"
                name="firstName"
                label="First Name"
                required
                value={formData.firstName}
                onChange={handleTextChange}
                placeholder="First name"
                maxLength={50}
              />

              <Input
                id="profileLastName"
                name="lastName"
                label="Last Name"
                value={formData.lastName}
                onChange={handleTextChange}
                placeholder="Optional"
                maxLength={50}
              />
            </div>

            <Input
              id="profileStatus"
              name="status"
              label="Current Status"
              value={formData.status}
              onChange={handleTextChange}
              placeholder="e.g. Taking it one day at a time (max 60 chars)"
              maxLength={60}
              helperText={`${formData.status.length}/60 characters`}
            />

            <Textarea
              id="profileBio"
              name="bio"
              label="Bio"
              value={formData.bio}
              onChange={handleTextChange}
              placeholder="Share a gentle reflection or background about yourself (max 300 chars)..."
              maxLength={300}
              minRows={3}
            />

            {/* Vibes Multi-select (up to 5) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-text-muted px-1">
                <span>Select Your Vibes (up to 5)</span>
                <span>{formData.vibes.length}/5 selected</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {VIBE_PRESETS.map((vibe) => {
                  const isSelected = formData.vibes.includes(vibe);
                  return (
                    <button
                      key={vibe}
                      type="button"
                      onClick={() => handleToggleVibe(vibe)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-primary text-white shadow-sm"
                          : "bg-surface-raised text-text-muted hover:text-white"
                      }`}
                    >
                      {vibe}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5 max-h-[60vh] overflow-y-auto pr-1">
            {/* Avatar Preset Picker */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-text-muted px-1">
                Choose an Avatar Preset
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                {AVATAR_PRESETS.map((p) => {
                  const isSelected = formData.avatarPreset === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, avatarPreset: p.id }))
                      }
                      className={`p-2.5 rounded-[20px] flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? "bg-surface-raised ring-2 ring-primary"
                          : "bg-surface hover:bg-surface-raised/50"
                      }`}
                    >
                      <Avatar
                        preset={p.id}
                        name={formData.displayName || formData.firstName}
                        size="md"
                      />
                      <span className="text-[11px] font-medium text-text truncate max-w-full">
                        {p.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cover Preset Picker */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-text-muted px-1">
                Choose a Cover Banner
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {COVER_PRESETS.map((c) => {
                  const isSelected = formData.coverPreset === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, coverPreset: c.id }))
                      }
                      className={`h-16 rounded-[16px] ${c.className} relative flex items-end p-2 transition-all cursor-pointer border ${
                        isSelected
                          ? "ring-2 ring-primary border-transparent"
                          : "border-border hover:opacity-90"
                      }`}
                    >
                      <span className="text-[11px] font-bold text-white bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-xs">
                        {c.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Companion Pet Visibility Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-surface-raised rounded-[20px] border border-border mt-1">
              <div>
                <p className="text-xs font-bold text-text">Companion Pet</p>
                <p className="text-[11px] text-text-muted">
                  Show pet wandering in the right rail
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!formData.petsHidden}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      petsHidden: !e.target.checked,
                    }))
                  }
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border mt-2">
          <Button type="button" variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
