import React from "react";
import { useLogoutMutation } from "../../redux/api/usersApiSlice";
import { useDispatch } from "react-redux";
import { removeUserInfo } from "../../redux/features/userSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../ui/Button";

const Logout = ({ close }) => {
  const [logout, { isLoading }] = useLogoutMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await logout().unwrap();
      dispatch(removeUserInfo());
      navigate("/");
      close();
      toast.success(response.message || "Logged out successfully");
    } catch (error) {
      console.error(error);
      toast.error("Logout failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-base text-text leading-relaxed">
        Are you sure you want to log out of your DayBook account?
      </p>

      <div className="flex justify-end gap-3 pt-3 border-t border-border">
        <Button variant="outline" onClick={close} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleLogout} disabled={isLoading}>
          {isLoading ? "Logging out..." : "Log out"}
        </Button>
      </div>
    </div>
  );
};

export default Logout;
