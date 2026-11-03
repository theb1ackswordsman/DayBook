import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useLoginMutation } from "../redux/api/usersApiSlice";
import { useDispatch, useSelector } from "react-redux";
import { userInfo } from "../redux/features/userSlice";
import { toast } from "react-toastify";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { FaLock } from "react-icons/fa";

const Login = () => {
  const user = useSelector((state) => state.user);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login({ email, password }).unwrap();
      dispatch(userInfo(response));
      navigate("/", { replace: true });
      toast.success(`Welcome back, ${response.data.firstName}`);
    } catch (error) {
      toast.error(error?.data?.message || "Invalid credentials. Please try again.");
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
            <FaLock />
          </div>
          <h1 className="text-2xl font-bold text-text tracking-tight">
            Welcome back
          </h1>
          <p className="text-xs text-text-muted mt-1.5 leading-relaxed">
            Sign in to access your private reflections and thoughts.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="loginEmail"
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />

          <Input
            id="loginPassword"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            autoComplete="current-password"
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isLoading}
            className="w-full mt-2 font-bold rounded-full"
          >
            {isLoading ? "Signing in..." : "Sign in to DayBook"}
          </Button>
        </form>

        <div className="text-center text-xs text-text-muted mt-6 pt-5 border-t border-border">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-text font-bold hover:underline"
          >
            Sign up
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;
