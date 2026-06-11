import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { listBoards, type Board } from "../api/boards";
import { BoardCard } from "../components/BoardCard";
import { CreateBoardForm } from "../components/CreateBoardForm";
import { useCreateBoard } from "../hooks/useCreateBoard";
import { useDeleteBoard } from "../hooks/useDeleteBoard";

const Dashboard: React.FC = () => {
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

  if (isLoading) {
    return (
      <section className="py-4">
        <div className="mb-6">
          <p className="text-sm font-medium text-blue-600">Workspace</p>
          <h1 className="text-3xl font-semibold text-slate-950">
            Your boards
          </h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="app-panel h-36 animate-pulse rounded-xl p-4"
            />
          ))}
        </div>
      </section>
    );
  }

  if (isError) {
    toast.error("Failed to load boards");
    return (
      <section className="py-4">
        <h1 className="mb-4 text-3xl font-semibold text-slate-950">
          Your boards
        </h1>
        <div className="app-panel rounded-xl p-5 text-red-600">
          Could not load boards. Try refreshing.
        </div>
      </section>
    );
  }

  return (
    <section className="py-4">
      <div className="brand-band mb-8 grid gap-5 rounded-2xl p-6 lg:grid-cols-[1fr_26rem] lg:items-end">
        <div>
          <p className="text-sm font-medium text-blue-100">Workspace</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">
            Your boards
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-blue-50">
            Create boards for projects, then organize the work into lists.
          </p>
        </div>

        <div className="rounded-xl bg-white/95 p-3 text-slate-900 shadow-sm">
          <CreateBoardForm
            onCreate={handleCreate}
            creating={createMutation.isPending}
          />
        </div>
      </div>

      {boards.length === 0 ? (
        <div className="soft-blue-panel rounded-xl px-6 py-14 text-center">
          <p className="text-lg font-semibold text-slate-800">
            No boards yet.
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Boards help you organize tasks into lists and cards.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Use the form above to create your first one.
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
    </section>
  );
};

export default Dashboard;
