// frontend/src/hooks/useCreateBoard.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createBoard,
  type CreateBoardPayload,
  type Board,
} from "../api/boards";
import toast from "react-hot-toast";

/**
 * useCreateBoard
 * - performs optimistic UI update when creating a board
 * - returns the mutation object from useMutation directly
 *
 * Behavior:
 * - onMutate: cancel queries, snapshot current boards, insert a temp board
 * - onError: rollback to snapshot + toast error
 * - onSuccess: replace temp board (by temp id) with server response
 * - onSettled: invalidate ['boards'] to sync with server
 */
export function useCreateBoard() {
  const qc = useQueryClient();

  return useMutation<Board, unknown, CreateBoardPayload>({
    mutationFn: (payload) => createBoard(payload),
    onMutate: async (payload) => {
      await qc.cancelQueries({ queryKey: ["boards"] });
      const previous = qc.getQueryData<Board[]>(["boards"]) ?? [];

      const tempId = `temp-${Date.now()}`;
      const optimistic: Board = {
        id: tempId,
        name: payload.name,
        ownerId: "", // unknown client-side; server will provide real value
        createdAt: new Date().toISOString(),
      };

      qc.setQueryData<Board[]>(["boards"], (old = []) => [optimistic, ...old]);

      // return context to rollback if needed
      return { previous, tempId };
    },
    onError: (err, payload, context: any) => {
      qc.setQueryData(["boards"], context?.previous ?? []);
      toast.error("Could not create board — please try again.");
    },
    onSuccess: (data, payload, context: any) => {
      // Replace the temp item with the real one returned by server
      qc.setQueryData<Board[]>(["boards"], (old = []) => {
        // map temp id to real id
        return old.map((b) => (b.id === context?.tempId ? data : b));
      });
      toast.success("Board created");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["boards"] });
    },
  });
}
