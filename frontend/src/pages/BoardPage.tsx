import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  closestCorners,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent, DragOverEvent } from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import toast from "react-hot-toast";
import { format } from "date-fns";

import { getBoard, type Board } from "../api/boards";
import { listLists, patchList, type ListItem } from "../api/lists";
import { listCards, patchCard, type CardItem } from "../api/cards";
import { subscribeToBoard } from "../api/realtime";
import { ListColumn } from "../components/ListColumn";
import { AddList } from "../components/AddList";
import { BoardMembers } from "../components/BoardMembers";

/**
 * BoardPage
 * - fetches board info
 * - fetches lists for board
 * - renders horizontal lists layout
 */

const BoardPage: React.FC = () => {
  const { id: boardId } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  /* ---------------- Board query ---------------- */
  const {
    data: board,
    isLoading: boardLoading,
    isError: boardError,
  } = useQuery<Board, Error>({
    queryKey: ["boards", boardId],
    queryFn: () => {
      if (!boardId) throw new Error("Missing board id");
      return getBoard(boardId);
    },
    enabled: !!boardId,
    retry: false,
  });

  /* ---------------- Lists query ---------------- */
  const { data: lists = [], isLoading: listsLoading } = useQuery<ListItem[]>({
    queryKey: ["lists", boardId],
    queryFn: () => listLists(boardId!),
    enabled: !!boardId,
  });

  const { data: cards = [], isLoading: cardsLoading } = useQuery<CardItem[]>({
    queryKey: ["cards", boardId],
    queryFn: () => listCards(boardId!),
    enabled: !!boardId,
  });

  /* ---------------- Error handling ---------------- */
  React.useEffect(() => {
    if (boardError) {
      toast.error("Could not load board");
    }
  }, [boardError]);

  React.useEffect(() => {
    if (!boardId) return;
    const client = subscribeToBoard(boardId, () => {
      qc.invalidateQueries({ queryKey: ["boards", boardId] });
      qc.invalidateQueries({ queryKey: ["lists", boardId] });
      qc.invalidateQueries({ queryKey: ["cards", boardId] });
      qc.invalidateQueries({ queryKey: ["members", boardId] });
    });
    return () => {
      client.deactivate();
    };
  }, [boardId, qc]);

  const positionBetween = (items: { position: number }[], index: number) => {
    const previous = items[index - 1]?.position;
    const next = items[index + 1]?.position;
    if (previous == null && next == null) return 1000;
    if (previous == null) return next / 2;
    if (next == null) return previous + 1000;
    return (previous + next) / 2;
  };

  const cardsForList = React.useCallback(
    (listId: string) =>
      cards
        .filter((card) => card.listId === listId)
        .sort((a, b) => a.position - b.position),
    [cards]
  );

  const handleDragOver = (event: DragOverEvent) => {
    const activeType = event.active.data.current?.type;
    if (activeType !== "card" || !event.over) return;

    const activeCard = event.active.data.current?.card as CardItem | undefined;
    if (!activeCard) return;

    const overType = event.over.data.current?.type;
    const overCard = event.over.data.current?.card as CardItem | undefined;
    const overListId =
      overType === "card"
        ? overCard?.listId
        : overType === "list-drop"
          ? (event.over.data.current?.listId as string)
          : undefined;

    if (!overListId || activeCard.listId === overListId) return;

    qc.setQueryData<CardItem[]>(["cards", boardId], (old = []) =>
      old.map((card) => (card.id === activeCard.id ? { ...card, listId: overListId } : card))
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !boardId) return;

    const activeType = active.data.current?.type;
    if (activeType === "list") {
      const oldIndex = lists.findIndex((list) => list.id === active.id);
      const newIndex = lists.findIndex((list) => list.id === over.id);
      if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return;

      const reordered = arrayMove(lists, oldIndex, newIndex);
      const moved = reordered[newIndex];
      const newPosition = positionBetween(reordered, newIndex);
      qc.setQueryData<ListItem[]>(
        ["lists", boardId],
        reordered.map((list) =>
          list.id === moved.id ? { ...list, position: newPosition } : list
        )
      );
      patchList(boardId, moved.id, { position: newPosition })
        .catch(() => toast.error("List reorder failed"))
        .finally(() => qc.invalidateQueries({ queryKey: ["lists", boardId] }));
      return;
    }

    if (activeType !== "card") return;

    const activeCard = cards.find((card) => card.id === active.id);
    if (!activeCard) return;

    const overType = over.data.current?.type;
    const overCard = over.data.current?.card as CardItem | undefined;
    const destinationListId =
      overType === "card"
        ? overCard?.listId
        : overType === "list-drop"
          ? (over.data.current?.listId as string)
          : undefined;

    if (!destinationListId) return;

    const sourceListCards = cardsForList(activeCard.listId).filter(
      (card) => card.id !== activeCard.id
    );
    const destinationCards = (
      activeCard.listId === destinationListId ? sourceListCards : cardsForList(destinationListId)
    ).filter((card) => card.id !== activeCard.id);

    const overIndex =
      overType === "card"
        ? Math.max(0, destinationCards.findIndex((card) => card.id === over.id))
        : destinationCards.length;
    const insertIndex = overIndex < 0 ? destinationCards.length : overIndex;
    const movedCard = { ...activeCard, listId: destinationListId };
    const reorderedDestination = [
      ...destinationCards.slice(0, insertIndex),
      movedCard,
      ...destinationCards.slice(insertIndex),
    ];
    const newPosition = positionBetween(reorderedDestination, insertIndex);

    qc.setQueryData<CardItem[]>(["cards", boardId], (old = []) =>
      old.map((card) =>
        card.id === activeCard.id ? { ...card, listId: destinationListId, position: newPosition } : card
      )
    );
    patchCard(boardId, activeCard.listId, activeCard.id, {
      listId: destinationListId,
      position: newPosition,
    })
      .catch(() => toast.error("Card reorder failed"))
      .finally(() => qc.invalidateQueries({ queryKey: ["cards", boardId] }));
  };

  /* ---------------- Loading ---------------- */
  if (boardLoading) {
    return (
      <div className="py-4">
        <Link to="/dashboard" className="text-sm font-medium text-[#5f7f72]">
          ← Back
        </Link>
        <div className="app-panel mt-6 rounded-xl p-5 text-slate-600">
          Loading board...
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="py-4">
        <Link to="/dashboard" className="text-sm font-medium text-[#5f7f72]">
          ← Back
        </Link>
        <div className="app-panel mt-6 rounded-xl p-5 text-red-600">
          Board not found.
        </div>
      </div>
    );
  }

  /* ---------------- Main UI ---------------- */
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="quiet-panel rounded-xl p-5">
        <Link to="/dashboard" className="text-sm font-medium text-[#5f7f72]">
          ← Back
        </Link>

        <h1 className="mt-3 text-3xl font-semibold text-slate-800" tabIndex={-1}>
          {board.name}
        </h1>

        <div className="text-xs text-slate-500 mt-1">
          Created:{" "}
          {board.createdAt ? format(new Date(board.createdAt), "PPP p") : "—"}
        </div>
        <BoardMembers boardId={boardId!} />
      </div>

      {/* Lists area */}
      <div className="mt-5 flex-1 overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={lists.map((list) => list.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex min-h-[28rem] items-start gap-4 pb-4">
              {listsLoading || cardsLoading ? (
                <div className="app-panel rounded-xl p-4 text-slate-600">
                  Loading lists...
                </div>
              ) : lists.length === 0 ? (
                <>
                  <div className="app-panel rounded-xl p-4 text-sm text-slate-600">
                    No lists yet. Add your first list.
                  </div>
                  <AddList boardId={boardId!} />
                </>
              ) : (
                <>
                  {lists.map((list) => (
                    <ListColumn
                      key={list.id}
                      list={list}
                      boardId={boardId!}
                      cards={cardsForList(list.id)}
                    />
                  ))}
                  <AddList boardId={boardId!} />
                </>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};

export default BoardPage;
