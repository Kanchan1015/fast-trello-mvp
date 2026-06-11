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
    <form onSubmit={submit} className="w-full">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <div className="flex-1">
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New board name"
            aria-label="Board name"
            aria-invalid={hasError}
            aria-describedby={hasError ? "create-board-error" : undefined}
            className={`field w-full px-3 py-2.5 ${
              hasError ? "border-red-500" : ""
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
          className={`px-4 py-2.5 text-sm ${
            creating
              ? "rounded-lg bg-slate-300 font-semibold text-slate-600"
              : "primary-button"
          }`}
        >
          {creating ? "Creating…" : "Create"}
        </button>
      </div>
    </form>
  );
};
