import React, { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { Link, useNavigate } from "react-router-dom";
import { registerApi } from "../api/auth";
import type { AuthResponse } from "../api/auth";
import { AuthLayout } from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";

const Signup: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const navigate = useNavigate();
  const nameRef = useRef<HTMLInputElement | null>(null);
  const { signIn } = useAuth();
  type AuthError = {
    error?: string;
    message?: string;
    details?: Record<string, string>;
  };

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const mutation = useMutation<
    AuthResponse,
    AxiosError<AuthError>,
    { name: string; email: string; password: string }
  >({
    mutationFn: (payload) => registerApi(payload),
    onSuccess: (data) => {
      signIn(data.user);
      setFieldErrors({});
      setServerError(null);
      navigate("/dashboard");
    },
    onError: (err) => {
      const resp = err?.response?.data;
      if (!resp) {
        setServerError("Signup failed. Try again.");
        return;
      }
      if (resp.error === "validation_failed" && resp.details) {
        setFieldErrors(resp.details);
        setServerError(null);
        return;
      }
      setServerError(resp.message ?? resp.error ?? "Signup failed");
    },
  });

  // v5 SAFE FLAGS
  const isLoading = mutation.isPending;
  const isError = mutation.isError;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name || name.trim().length < 2) errs.name = "Enter your full name";
    if (!email) errs.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = "Enter a valid email";
    if (!password || password.length < 6)
      errs.password = "Password must be at least 6 characters";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;
    mutation.mutate({ name, email, password });
  };

  return (
    <AuthLayout title="Create account">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div>
          <label className="block text-sm font-medium">Full name</label>
          <input
            ref={nameRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`field mt-1 block w-full px-3 py-2.5 ${
              fieldErrors.name ? "border-red-500" : ""
            }`}
            placeholder="Your name"
          />
          {fieldErrors.name && (
            <div className="text-xs text-red-600 mt-1">{fieldErrors.name}</div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`field mt-1 block w-full px-3 py-2.5 ${
              fieldErrors.email ? "border-red-500" : ""
            }`}
            placeholder="you@example.com"
          />
          {fieldErrors.email && (
            <div className="text-xs text-red-600 mt-1">{fieldErrors.email}</div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`field mt-1 block w-full px-3 py-2.5 ${
              fieldErrors.password ? "border-red-500" : ""
            }`}
            placeholder="At least 6 characters"
          />
          {fieldErrors.password && (
            <div className="text-xs text-red-600 mt-1">
              {fieldErrors.password}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2.5 text-sm ${
            isLoading
              ? "rounded-lg bg-slate-300 font-semibold text-slate-600"
              : "primary-button"
          }`}
        >
          {isLoading ? "Creating..." : "Create account"}
        </button>

        {(isError || serverError) && (
          <div className="text-sm text-red-600 mt-2 text-center">
            {serverError ??
              mutation.error?.response?.data?.message ??
              mutation.error?.response?.data?.error ??
              "Signup failed"}
          </div>
        )}

        <div className="text-sm text-center">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-[#5f7f72]">
            Log in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Signup;
