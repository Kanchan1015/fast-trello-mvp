// small presentational card for a board
import React from "react";
import { Link } from "react-router-dom";
import type { Board } from "../api/boards";
import { format } from "date-fns";

type Props = {
  board: Board;
  onDelete: (id: string) => void;
  deleting?: boolean;
};

export const BoardCard: React.FC<Props> = ({ board, onDelete, deleting }) => {
  const created = board.createdAt
    ? format(new Date(board.createdAt), "PPP")
    : "";

  return (
    <div className="app-panel group flex min-h-36 flex-col justify-between rounded-xl p-4 transition hover:-translate-y-0.5 hover:shadow-xl">
      <div>
        <Link to={`/boards/${board.id}`} className="block">
          <div className="mb-4 h-2 w-16 rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition group-hover:w-24" />
          <h3 className="text-lg font-semibold text-slate-900">
            {board.name}
          </h3>
        </Link>

        <div className="mt-2 text-xs text-slate-500">Created: {created}</div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <Link
          to={`/boards/${board.id}`}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Open board
        </Link>
        <button
          onClick={() => onDelete(board.id)}
          disabled={deleting}
          aria-label={`Delete board ${board.name}`}
          className={`px-3 py-1.5 text-sm ${
            deleting
              ? "rounded-lg bg-slate-200 text-slate-500"
              : "danger-button"
          }`}
        >
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </div>
  );
};
