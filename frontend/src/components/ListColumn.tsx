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
    mutationFn: () => patchList(boardId, list.id, { title }),
    onSuccess: () => {
      toast.success("List renamed");
      setEditing(false);
      qc.invalidateQueries(["lists", boardId]);
    },
    onError: () => toast.error("Rename failed"),
  });

  /* -------- Delete list -------- */
  const deleteMutation = useMutation({
    mutationFn: () => deleteList(boardId, list.id),
    onSuccess: () => {
      toast.success("List deleted");
      qc.invalidateQueries(["lists", boardId]);
    },
    onError: () => toast.error("Delete failed"),
  });

  const onBlurSave = () => {
    if (title.trim() && title !== list.title) {
      renameMutation.mutate();
    } else {
      setEditing(false);
      setTitle(list.title);
    }
  };

  return (
    <div className="w-64 bg-gray-100 rounded p-3 flex-shrink-0">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        {editing ? (
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={onBlurSave}
            onKeyDown={(e) => e.key === "Enter" && onBlurSave()}
            className="w-full p-1 rounded text-sm"
            autoFocus
            aria-label="Edit list title"
          />
        ) : (
          <h3
            className="font-semibold text-sm cursor-pointer"
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
          className="text-gray-500 hover:text-red-600 text-sm"
        >
          ✕
        </button>
      </div>

      {/* Cards placeholder */}
      <div className="text-xs text-gray-500 mt-4">Cards coming next…</div>
    </div>
  );
};
