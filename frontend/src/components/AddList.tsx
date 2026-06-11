import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { createList, type ListItem } from "../api/lists";

type Props = {
  boardId: string;
};

/**
 * AddList
 * - rightmost column
 * - toggles input form
 * - backend computes default position
 */
export const AddList: React.FC<Props> = ({ boardId }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => createList(boardId, { title }),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["lists", boardId] });

      const previous = qc.getQueryData<ListItem[]>(["lists", boardId]) ?? [];

      const lastPos =
        previous.length > 0 ? previous[previous.length - 1].position : 0;

      const tempList: ListItem = {
        id: `temp-${Date.now()}`,
        boardId,
        title,
        position: lastPos + 1000,
        createdAt: new Date().toISOString(),
      };

      qc.setQueryData<ListItem[]>(["lists", boardId], [...previous, tempList]);

      return { previous, tempId: tempList.id };
    },
    onError: (_, __, ctx) => {
      qc.setQueryData(["lists", boardId], ctx?.previous);
      toast.error("Failed to create list");
    },
    onSuccess: (data, _, ctx) => {
      qc.setQueryData<ListItem[]>(["lists", boardId], (old = []) =>
        old.map((l) => (l.id === ctx?.tempId ? data : l))
      );
      toast.success("List created");
      setTitle("");
      setOpen(false);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["lists", boardId] });
    },
  });

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-68 flex-shrink-0 rounded-xl border border-dashed border-blue-300 bg-blue-50/80 p-4 text-left text-sm font-semibold text-blue-700 transition hover:border-blue-500 hover:bg-white"
        aria-label="Add list"
      >
        + Add a list
      </button>
    );
  }

  return (
    <div className="app-panel w-68 flex-shrink-0 rounded-xl p-3">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="List title"
        className="field mb-2 w-full px-3 py-2 text-sm"
        autoFocus
        aria-label="List title"
      />

      <div className="flex gap-2">
        <button
          onClick={() => mutation.mutate()}
          disabled={!title.trim()}
          className="primary-button px-3 py-1.5 text-sm disabled:bg-slate-300 disabled:shadow-none"
        >
          Add
        </button>
        <button
          onClick={() => {
            setOpen(false);
            setTitle("");
          }}
          className="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
