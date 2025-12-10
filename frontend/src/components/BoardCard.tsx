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
    <div className="bg-white rounded shadow p-4 flex flex-col justify-between">
      <div>
        <Link to={`/boards/${board.id}`} className="block">
          <h3 className="font-medium">{board.name}</h3>
        </Link>

        <div className="text-xs text-gray-500 mt-2">Created: {created}</div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={() => onDelete(board.id)}
          disabled={deleting}
          aria-label={`Delete board ${board.name}`}
          className={`px-3 py-1 text-sm rounded ${
            deleting ? "bg-gray-300" : "bg-red-600 text-white hover:bg-red-700"
          }`}
        >
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </div>
  );
};
