import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createCard, type CardItem } from "../api/cards";

type Props = {
  boardId: string;
  listId: string;
};

export const AddCard: React.FC<Props> = ({ boardId, listId }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => createCard(boardId, listId, { title: title.trim() }),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["cards", boardId] });
      const previous = qc.getQueryData<CardItem[]>(["cards", boardId]) ?? [];
      const listCards = previous.filter((card) => card.listId === listId);
      const lastPosition = listCards.at(-1)?.position ?? 0;
      const tempCard: CardItem = {
        id: `temp-card-${Date.now()}`,
        listId,
        title: title.trim(),
        description: "",
        position: lastPosition + 1000,
        createdAt: new Date().toISOString(),
      };
      qc.setQueryData<CardItem[]>(["cards", boardId], [...previous, tempCard]);
      return { previous, tempId: tempCard.id };
    },
    onError: (_, __, ctx) => {
      qc.setQueryData(["cards", boardId], ctx?.previous);
      toast.error("Failed to create card");
    },
    onSuccess: (card, _, ctx) => {
      qc.setQueryData<CardItem[]>(["cards", boardId], (old = []) =>
        old.map((item) => (item.id === ctx?.tempId ? card : item))
      );
      setTitle("");
      setOpen(false);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["cards", boardId] });
    },
  });

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-2 w-full rounded-lg px-3 py-2 text-left text-sm text-slate-500 hover:bg-white/70 hover:text-slate-700"
      >
        + Add a card
      </button>
    );
  }

  return (
    <div className="mt-2 space-y-2">
      <textarea
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        className="field min-h-20 w-full resize-none px-3 py-2 text-sm"
        placeholder="Card title"
        autoFocus
      />
      <div className="flex gap-2">
        <button
          onClick={() => mutation.mutate()}
          disabled={!title.trim() || mutation.isPending}
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
