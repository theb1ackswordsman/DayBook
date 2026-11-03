import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useSignupMutation } from "../redux/api/usersApiSlice";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { userInfo } from "../redux/features/userSlice";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { FaUserPlus } from "react-icons/fa";

const Signup = () => {
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [signup, { isLoading }] = useSignupMutation();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await signup(formData).unwrap();
      dispatch(userInfo(response));
      navigate("/", { replace: true });
      toast.success(
        `Welcome ${response.data.firstName}! Your private journal is ready.`
      );
    } catch (error) {
      toast.error(error?.data?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-8 w-full">
      <Card
        variant="default"
        className="w-full max-w-md p-6 sm:p-8 bg-surface border border-border rounded-[24px] shadow-card"
      >
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-[28%] bg-surface-raised ring-2 ring-border text-text mx-auto flex items-center justify-center text-lg mb-3">
            <FaUserPlus />
          </div>
          <h1 className="text-2xl font-bold text-text tracking-tight">
            Create your account
          </h1>
          <p className="text-xs text-text-muted mt-1.5 leading-relaxed">
            Begin your journey of calm reflection and private journaling.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="signupFirstName"
              name="firstName"
              label="First Name"
              required
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First name"
            />

            <Input
              id="signupLastName"
              name="lastName"
              label="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Optional"
            />
          </div>

          <Input
            id="signupEmail"
            name="email"
            label="Email Address"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            autoComplete="email"
          />

          <Input
            id="signupPassword"
            name="password"
            label="Password"
            type="password"
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="Choose a strong password"
            autoComplete="new-password"
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isLoading}
            className="w-full mt-2 font-bold rounded-full"
          >
            {isLoading ? "Creating account..." : "Sign up for DayBook"}
          </Button>
        </form>

        <div className="text-center text-xs text-text-muted mt-6 pt-5 border-t border-border">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-text font-bold hover:underline"
          >
            Log in
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Signup;
