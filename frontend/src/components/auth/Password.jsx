import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useChangePasswordMutation } from "../../redux/api/usersApiSlice";
import { toast } from "react-toastify";
import Input from "../ui/Input";
import Button from "../ui/Button";

const Password = ({ close }) => {
  const user = useSelector((state) => state.user);

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (user) {
      setEmail(user?.data?.email || "");
      setFirstName(user?.data?.firstName || "");
    }
  }, [user]);

  useEffect(() => {
    setOldPassword("");
    setNewPassword("");
  }, [close]);

  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await changePassword({
        oldPassword,
        newPassword,
      }).unwrap();
      toast.success(response?.message || "Password changed successfully!");
      close();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to change password.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <p className="text-sm font-medium text-text-muted">{email}</p>
        <p className="text-sm text-text-muted mt-2 leading-relaxed">
          Hello {firstName}, please confirm your current password before setting a new one.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
        <Input
          id="oldPassword"
          type="password"
          label="Current Password"
          required
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          placeholder="Enter current password"
        />

        <Input
          id="newPassword"
          type="password"
          label="New Password"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Enter new password"
        />

        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border">
          <Button type="button" variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? "Updating..." : "Change Password"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Password;
