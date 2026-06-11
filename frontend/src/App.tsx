// src/App.tsx
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
    <div className="min-h-screen">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-6 sm:px-6">
        {/* Optional page heading for quick visual check */}
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
