import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import toast from "react-hot-toast";
import { deleteCard, patchCard, type CardItem as CardItemType } from "../api/cards";

type Props = {
  boardId: string;
  card: CardItemType;
};

export const CardItem: React.FC<Props> = ({ boardId, card }) => {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(card.title);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: "card", card },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const renameMutation = useMutation({
    mutationFn: (newTitle: string) => patchCard(boardId, card.listId, card.id, { title: newTitle }),
    onSuccess: () => {
      setEditing(false);
      qc.invalidateQueries({ queryKey: ["cards", boardId] });
    },
    onError: () => toast.error("Card update failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteCard(boardId, card.listId, card.id),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["cards", boardId] });
      const previous = qc.getQueryData<CardItemType[]>(["cards", boardId]);
      qc.setQueryData<CardItemType[]>(["cards", boardId], (old = []) =>
        old.filter((item) => item.id !== card.id)
      );
      return { previous };
    },
    onError: (_, __, ctx) => {
      qc.setQueryData(["cards", boardId], ctx?.previous);
      toast.error("Delete failed");
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["cards", boardId] }),
  });

  const save = () => {
    if (title.trim() && title.trim() !== card.title) {
      renameMutation.mutate(title.trim());
    } else {
      setTitle(card.title);
      setEditing(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-sm ${
        isDragging ? "opacity-60" : ""
      }`}
      {...attributes}
    >
      <div className="flex items-start gap-2">
        <button
          className="mt-0.5 cursor-grab rounded px-1 text-slate-300 hover:bg-slate-100 hover:text-slate-500"
          aria-label="Drag card"
          {...listeners}
        >
          ::
        </button>
        {editing ? (
          <textarea
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={save}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                save();
              }
            }}
            className="field min-h-16 flex-1 resize-none px-2 py-1 text-sm"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="flex-1 text-left leading-5 text-slate-700"
          >
            {card.title}
          </button>
        )}
        <button
          onClick={() => deleteMutation.mutate()}
          className="rounded px-1.5 py-0.5 text-slate-300 hover:bg-red-50 hover:text-red-600"
          aria-label="Delete card"
        >
          x
        </button>
      </div>
    </div>
  );
};
