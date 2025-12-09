import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { listBoards, type Board } from "../api/boards";
import { BoardCard } from "../components/BoardCard";
import { CreateBoardForm } from "../components/CreateBoardForm";
import { Link } from "react-router-dom";
import { useCreateBoard } from "../hooks/useCreateBoard";
import { useDeleteBoard } from "../hooks/useDeleteBoard";

const Dashboard: React.FC = () => {
  const qc = useQueryClient();

  // fetch boards
  const {
    data: boards = [],
    isLoading,
    isError,
  } = useQuery<Board[], Error>({
    queryKey: ["boards"],
    queryFn: listBoards,
  });

  // local state to track which board id is being deleted (for button disabled)
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // CREATE: use centralized optimistic hook
  const createMutation = useCreateBoard();
  // DELETE: use centralized optimistic hook
  const deleteMutation = useDeleteBoard();

  const handleCreate = (name: string) => {
    createMutation.mutate({ name });
  };

  const handleDelete = (id: string) => {
    // simple confirm dialog - replace with modal for nicer UX later
    const ok = window.confirm(
      "Delete this board? This action cannot be undone."
    );
    if (!ok) return;

    // mark which board is being deleted so its button can be disabled
    setDeletingId(id);

    // call mutation and ensure deletingId is cleared after settled
    deleteMutation.mutate(id, {
      onSettled: () => setDeletingId(null),
      onError: () => setDeletingId(null),
    });
  };

  // loading skeleton
  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Your boards</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded p-4 animate-pulse h-28" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    // avoid spamming toasts on every render; show once
    toast.error("Failed to load boards");
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Your boards</h1>
        <div className="text-red-600">
          Could not load boards. Try refreshing.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Your boards</h1>

        <div className="flex items-center gap-4">
          <CreateBoardForm
            onCreate={handleCreate}
            creating={createMutation.isLoading}
          />
          <Link
            to="/boards/new"
            className="text-sm text-gray-500 hover:underline"
          >
            Advanced create
          </Link>
        </div>
      </div>

      {boards.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg">No boards yet — create one to get started.</p>
          <p className="text-sm text-gray-500 mt-2">
            Boards help you organize tasks into lists and cards.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {boards.map((b) => (
            <BoardCard
              key={b.id}
              board={b}
              onDelete={handleDelete}
              deleting={deletingId === b.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
