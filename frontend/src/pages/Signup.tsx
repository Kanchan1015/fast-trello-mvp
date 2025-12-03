import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { registerApi } from "../api/auth";
import type { AuthResponse } from "../api/auth";
import { AuthLayout } from "../components/AuthLayout";

const Signup: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();

  const mutation = useMutation<
    AuthResponse,
    any,
    { name: string; email: string; password: string }
  >({
    mutationFn: (payload) => registerApi(payload),
    onSuccess: (data) => {
      localStorage.setItem("ft_token", data.token);
      navigate("/dashboard");
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ name, email, password });
  };

  // v5-safe flags
  const isLoading = mutation.isPending;
  const isError = mutation.isError;

  return (
    <AuthLayout title="Create account">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Full name</label>
          <input
            type="text"
            required
            minLength={2}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
            placeholder="At least 6 characters"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 rounded text-white ${
            isLoading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {isLoading ? "Creating..." : "Create account"}
        </button>

        {isError && (
          <div className="text-sm text-red-600 mt-2">
            {(mutation.error as any)?.response?.data?.message ??
              (mutation.error as any)?.response?.data?.error ??
              "Signup failed"}
          </div>
        )}

        <div className="text-sm text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600">
            Log in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Signup;
