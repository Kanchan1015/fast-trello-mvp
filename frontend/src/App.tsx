// src/App.tsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import { Header } from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Board from "./pages/Board";
import BoardPage from "./pages/BoardPage";

/**
 * App acts as the protected layout when wrapped by RequireAuth in main.tsx.
 * It renders Header (which shows sign out) and nested routes for authenticated pages.
 */

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-5xl mx-auto p-4">
        {/* Optional page heading for quick visual check */}
        <h1
          id="main-heading"
          className="text-2xl font-semibold mb-4"
          tabIndex={-1}
        >
          Dashboard
        </h1>

        {/* Nested routes — these are relative to the parent path "/*" */}
        <Routes>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="board" element={<Board />} />
          {/* optionally make the root of protected area redirect to /dashboard */}
          <Route path="" element={<Dashboard />} />
          <Route path="boards/:id" element={<BoardPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
