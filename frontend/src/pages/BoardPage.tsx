import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { format } from "date-fns";

import { getBoard, type Board } from "../api/boards";
import { listLists, type ListItem } from "../api/lists";
import { ListColumn } from "../components/ListColumn";
import { AddList } from "../components/AddList";

/**
 * BoardPage
 * - fetches board info
 * - fetches lists for board
 * - renders horizontal lists layout
 */

const BoardPage: React.FC = () => {
  const { id: boardId } = useParams<{ id: string }>();

  /* ---------------- Board query ---------------- */
  const {
    data: board,
    isLoading: boardLoading,
    isError: boardError,
  } = useQuery<Board, Error>({
    queryKey: ["boards", boardId],
    queryFn: () => {
      if (!boardId) throw new Error("Missing board id");
      return getBoard(boardId);
    },
    enabled: !!boardId,
    retry: false,
  });

  /* ---------------- Lists query ---------------- */
  const { data: lists = [], isLoading: listsLoading } = useQuery<ListItem[]>({
    queryKey: ["lists", boardId],
    queryFn: () => listLists(boardId!),
    enabled: !!boardId,
  });

  /* ---------------- Error handling ---------------- */
  React.useEffect(() => {
    if (boardError) {
      toast.error("Could not load board");
    }
  }, [boardError]);

  /* ---------------- Loading ---------------- */
  if (boardLoading) {
    return (
      <div className="py-4">
        <Link to="/dashboard" className="text-sm font-medium text-[#5f7f72]">
          ← Back
        </Link>
        <div className="app-panel mt-6 rounded-xl p-5 text-slate-600">
          Loading board...
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="py-4">
        <Link to="/dashboard" className="text-sm font-medium text-[#5f7f72]">
          ← Back
        </Link>
        <div className="app-panel mt-6 rounded-xl p-5 text-red-600">
          Board not found.
        </div>
      </div>
    );
  }

  /* ---------------- Main UI ---------------- */
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="quiet-panel rounded-xl p-5">
        <Link to="/dashboard" className="text-sm font-medium text-[#5f7f72]">
          ← Back
        </Link>

        <h1 className="mt-3 text-3xl font-semibold text-slate-800" tabIndex={-1}>
          {board.name}
        </h1>

        <div className="text-xs text-slate-500 mt-1">
          Created:{" "}
          {board.createdAt ? format(new Date(board.createdAt), "PPP p") : "—"}
        </div>
      </div>

      {/* Lists area */}
      <div className="mt-5 flex-1 overflow-x-auto">
        <div className="flex min-h-[28rem] items-start gap-4 pb-4">
          {listsLoading ? (
            <div className="app-panel rounded-xl p-4 text-slate-600">
              Loading lists...
            </div>
          ) : lists.length === 0 ? (
            <>
              <div className="app-panel rounded-xl p-4 text-sm text-slate-600">
                No lists yet. Add your first list.
              </div>
              <AddList boardId={boardId!} />
            </>
          ) : (
            <>
              {lists.map((list) => (
                <ListColumn key={list.id} list={list} boardId={boardId!} />
              ))}
              <AddList boardId={boardId!} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoardPage;
