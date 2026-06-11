// small layout used by login/signup pages (mini-note: consistent look & spacing)
import React from "react";

export const AuthLayout: React.FC<{
  children: React.ReactNode;
  title?: string;
}> = ({ children, title }) => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="app-panel w-full max-w-md rounded-2xl p-7">
        <div className="mb-6 text-center">
          <div className="brand-band mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl font-bold">
            FT
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {title ?? "Sign in"}
          </h1>
          <p className="mt-1 text-sm text-blue-700">
            Manage boards, lists, and work in progress.
          </p>
        </div>
        {children}
        <footer className="text-xs text-center text-slate-500 mt-6">
          Fast Trello MVP - React frontend demo
        </footer>
      </div>
    </div>
  );
};
