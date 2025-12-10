import React, { useState, useRef, useEffect } from "react";

type Props = {
  onCreate: (name: string) => void;
  creating?: boolean;
  error?: string | null; // optional: parent can pass an error
};

export const CreateBoardForm: React.FC<Props> = ({
  onCreate,
  creating,
  error,
}) => {
  const [name, setName] = useState("");

  // Focus input automatically on mount
  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) return;

    onCreate(trimmed);
    setName("");
  };

  const hasError = !!error;

  return (
    <form onSubmit={submit} className="w-full max-w-md">
      <div className="flex gap-2 items-start">
        <div className="flex-1">
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New board name"
            aria-label="Board name"
            aria-invalid={hasError}
            aria-describedby={hasError ? "create-board-error" : undefined}
            className={`w-full border rounded p-2 ${
              hasError ? "border-red-500" : "border-gray-300"
            }`}
          />

          {/* Optional inline error */}
          {hasError && (
            <div
              id="create-board-error"
              role="alert"
              className="text-xs text-red-600 mt-1"
            >
              {error}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={creating}
          aria-busy={creating}
          className={`px-4 py-2 rounded text-white transition ${
            creating
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {creating ? "Creating…" : "Create"}
        </button>
      </div>
    </form>
  );
};
