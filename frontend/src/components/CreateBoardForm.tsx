// small inline create form used in Dashboard
import React, { useState } from "react";

type Props = {
  onCreate: (name: string) => void;
  creating?: boolean;
};

export const CreateBoardForm: React.FC<Props> = ({ onCreate, creating }) => {
  const [name, setName] = useState("");

  const submit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate(trimmed);
    setName("");
  };

  return (
    <form onSubmit={submit} className="w-full max-w-md">
      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New board name"
          aria-label="Board name"
          className="flex-1 border rounded p-2"
        />
        <button
          type="submit"
          disabled={creating}
          className={`px-4 rounded text-white ${
            creating ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {creating ? "Creating…" : "Create"}
        </button>
      </div>
    </form>
  );
};
