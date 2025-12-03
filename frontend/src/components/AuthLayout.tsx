// small layout used by login/signup pages (mini-note: consistent look & spacing)
import React from "react";

export const AuthLayout: React.FC<{
  children: React.ReactNode;
  title?: string;
}> = ({ children, title }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-semibold mb-4 text-center">
          {title ?? "Sign in"}
        </h1>
        {children}
        <footer className="text-xs text-center text-gray-500 mt-6">
          Fast Trello MVP — small demo
        </footer>
      </div>
    </div>
  );
};
