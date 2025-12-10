import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getBoard, type Board } from "../api/boards";
import toast from "react-hot-toast";
import { format } from "date-fns";

/**
 * BoardPage stub:
 * - fetches GET /api/boards/:id via useQuery
 * - shows loading / error / basic board info
 * - ready to be extended with lists/cards later
 */

const BoardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const {
    data: board,
    isLoading,
    isError,
  } = useQuery<Board, Error>({
    queryKey: ["boards", id],
    queryFn: () => {
      if (!id) throw new Error("Missing board id");
      return getBoard(id);
    },
    enabled: !!id,
    retry: false,
  });

  React.useEffect(() => {
    if (isError) {
      toast.error("Could not load board");
    }
  }, [isError]);

  if (isLoading) {
    return (
      <div className="p-6">
        <Link to="/dashboard" className="text-sm text-blue-600">
          ← Back
        </Link>
        <div className="mt-6">Loading board…</div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="p-6">
        <Link to="/dashboard" className="text-sm text-blue-600">
          ← Back
        </Link>
        <div className="mt-6 text-red-600">Board not found.</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Link to="/dashboard" className="text-sm text-blue-600">
        ← Back
      </Link>

      <header className="mt-4 mb-6">
        <h1 className="text-2xl font-semibold" tabIndex={-1}>
          {board.name}
        </h1>
        <div className="text-xs text-gray-500 mt-1">
          Created:{" "}
          {board.createdAt ? format(new Date(board.createdAt), "PPP p") : "—"}
        </div>
      </header>

      <section>
        <p className="text-sm text-gray-700">
          This is a placeholder Board page. Lists and cards will be implemented
          in Day 5/6.
        </p>
      </section>
    </div>
  );
};

export default BoardPage;
