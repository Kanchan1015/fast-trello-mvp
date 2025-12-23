import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { createList } from "../api/lists";

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
    onSuccess: () => {
      toast.success("List created");
      setTitle("");
      setOpen(false);
      qc.invalidateQueries(["lists", boardId]);
    },
    onError: () => toast.error("Create failed"),
  });

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-64 bg-gray-200 rounded p-3 text-left flex-shrink-0"
        aria-label="Add list"
      >
        + Add a list
      </button>
    );
  }

  return (
    <div className="w-64 bg-gray-200 rounded p-3 flex-shrink-0">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="List title"
        className="w-full p-2 rounded mb-2 text-sm"
        autoFocus
        aria-label="List title"
      />

      <div className="flex gap-2">
        <button
          onClick={() => mutation.mutate()}
          disabled={!title.trim()}
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
        >
          Add
        </button>
        <button
          onClick={() => {
            setOpen(false);
            setTitle("");
          }}
          className="text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
