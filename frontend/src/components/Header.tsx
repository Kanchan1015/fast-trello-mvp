import React from "react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  const handleSignOut = () => {
    logout(true); // clears token and redirects to /login
    toast.success("Signed out");
  };

  return (
    <header className="w-full px-4 py-3 bg-white shadow flex justify-between items-center">
      <div className="text-lg font-semibold">Fast Trello</div>

      {user && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-700">{user.name}</span>

          <button
            onClick={handleSignOut}
            className="px-3 py-1 rounded bg-red-600 text-white text-sm hover:bg-red-700"
            aria-label="Sign out"
          >
            Sign out
          </button>
        </div>
      )}
    </header>
  );
};
