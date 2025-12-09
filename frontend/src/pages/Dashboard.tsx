import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  listBoards,
  createBoard,
  deleteBoard,
  type Board,
} from "../api/boards";
import { BoardCard } from "../components/BoardCard";
import { CreateBoardForm } from "../components/CreateBoardForm";
import { Link } from "react-router-dom";

/**
 * Dashboard (v5-react-query compatible)
 */

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
  const [creating, setCreating] = useState(false);

  // CREATE mutation (v5 object syntax)
  const createMutation = useMutation({
    mutationFn: (payload: { name: string }) => createBoard(payload),
    onMutate: async (payload) => {
      await qc.cancelQueries({ queryKey: ["boards"] });
      const previous = qc.getQueryData<Board[]>(["boards"]) ?? [];

      const temp: Board = {
        id: `temp-${Date.now()}`,
        name: payload.name,
        ownerId: "",
        createdAt: new Date().toISOString(),
      };

      qc.setQueryData<Board[]>(["boards"], [temp, ...previous]);
      return { previous };
    },
    onError: (err, _variables, context: any) => {
      qc.setQueryData(["boards"], context?.previous ?? []);
      toast.error("Create failed");
    },
    onSuccess: () => {
      toast.success("Board created");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["boards"] });
    },
  });

  // DELETE mutation (v5 object syntax)
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBoard(id),
    onMutate: async (id: string) => {
      setDeletingId(id);
      await qc.cancelQueries({ queryKey: ["boards"] });
      const previous = qc.getQueryData<Board[]>(["boards"]) ?? [];
      qc.setQueryData<Board[]>(
        ["boards"],
        previous.filter((b) => b.id !== id)
      );
      return { previous };
    },
    onError: (err, id, context: any) => {
      qc.setQueryData(["boards"], context?.previous ?? []);
      toast.error("Delete failed");
    },
    onSuccess: () => {
      toast.success("Board deleted");
    },
    onSettled: () => {
      setDeletingId(null);
      qc.invalidateQueries({ queryKey: ["boards"] });
    },
  });

  const handleCreate = (name: string) => {
    setCreating(true);
    createMutation.mutate({ name }, { onSettled: () => setCreating(false) });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
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
            creating={creating || createMutation.isLoading}
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
