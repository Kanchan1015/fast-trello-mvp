import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { patchList, deleteList, type ListItem } from "../api/lists";

type Props = {
  list: ListItem;
  boardId: string;
};

/**
 * ListColumn
 * - shows list title
 * - inline rename on click
 * - delete list
 * - cards will be added later
 */
export const ListColumn: React.FC<Props> = ({ list, boardId }) => {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(list.title);

  /* -------- Rename list -------- */
  const renameMutation = useMutation({
    mutationFn: (newTitle: string) =>
      patchList(boardId, list.id, { title: newTitle }),

    onMutate: async (newTitle) => {
      await qc.cancelQueries({ queryKey: ["lists", boardId] });
      const previous = qc.getQueryData<ListItem[]>(["lists", boardId]);

      qc.setQueryData<ListItem[]>(["lists", boardId], (old = []) =>
        old.map((l) => (l.id === list.id ? { ...l, title: newTitle } : l))
      );

      return { previous };
    },

    onError: (_, __, ctx) => {
      qc.setQueryData(["lists", boardId], ctx?.previous);
      toast.error("Rename failed");
    },

    onSuccess: () => {
      toast.success("List renamed");
      setEditing(false);
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["lists", boardId] });
    },
  });

  /* -------- Delete list -------- */
  const deleteMutation = useMutation({
    mutationFn: () => deleteList(boardId, list.id),

    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["lists", boardId] });
      const previous = qc.getQueryData<ListItem[]>(["lists", boardId]);

      qc.setQueryData<ListItem[]>(["lists", boardId], (old = []) =>
        old.filter((l) => l.id !== list.id)
      );

      return { previous };
    },

    onError: (_, __, ctx) => {
      qc.setQueryData(["lists", boardId], ctx?.previous);
      toast.error("Delete failed");
    },

    onSuccess: () => {
      toast.success("List deleted");
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["lists", boardId] });
    },
  });

  const onBlurSave = () => {
    if (title.trim() && title !== list.title) {
      renameMutation.mutate(title.trim());
    } else {
      setEditing(false);
      setTitle(list.title);
    }
  };

  return (
    <div className="app-panel w-68 flex-shrink-0 rounded-xl border-t-4 border-t-[#cdeccf] p-3">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between gap-2">
        {editing ? (
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={onBlurSave}
            onKeyDown={(e) => e.key === "Enter" && onBlurSave()}
            className="field w-full px-2 py-1.5 text-sm"
            autoFocus
            aria-label="Edit list title"
          />
        ) : (
          <h3
            className="cursor-pointer rounded px-1 py-1 text-sm font-semibold text-slate-800 hover:bg-white/70"
            onClick={() => setEditing(true)}
          >
            {list.title}
          </h3>
        )}

        <button
          onClick={() => {
            if (window.confirm("Delete this list?")) {
              deleteMutation.mutate();
            }
          }}
          aria-label="Delete list"
          className="rounded-lg px-2 py-1 text-sm text-slate-400 hover:bg-red-50 hover:text-red-600"
        >
          ✕
        </button>
      </div>

      {/* Cards placeholder */}
      <div className="mt-4 rounded-lg border border-dashed border-slate-200 bg-white/45 px-3 py-4 text-xs text-slate-500">
        Cards coming next...
      </div>
    </div>
  );
};
