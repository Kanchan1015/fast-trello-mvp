import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  const handleSignOut = () => {
    logout(true); // clears token and redirects to /login
    toast.success("Signed out");
  };

  return (
    <header className="sticky top-0 z-10 border-b border-white/60 bg-white/55 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/dashboard" className="flex items-center gap-3">
          <span className="brand-band flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold">
            FT
          </span>
          <div>
            <div className="text-base font-semibold text-slate-800">
              Fast Trello
            </div>
            <div className="text-xs text-slate-500">Board workspace</div>
          </div>
        </Link>

        {user && (
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-600 sm:inline">
              {user.name}
            </span>

            <button
              onClick={handleSignOut}
              className="danger-button px-3 py-2 text-sm"
              aria-label="Sign out"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
