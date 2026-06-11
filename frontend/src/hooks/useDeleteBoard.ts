// frontend/src/hooks/useDeleteBoard.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteBoard, type Board } from "../api/boards";
import toast from "react-hot-toast";

/**
 * useDeleteBoard
 * - Optimistically removes a board from ['boards'] cache when deleting
 * - Rolls back on error and shows toast
 */
export function useDeleteBoard() {
  const qc = useQueryClient();

  return useMutation<void, unknown, string>({
    mutationFn: (id: string) => deleteBoard(id),
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: ["boards"] });
      const previous = qc.getQueryData<Board[]>(["boards"]) ?? [];
      // optimistic remove
      qc.setQueryData<Board[]>(
        ["boards"],
        previous.filter((b) => b.id !== id)
      );
      return { previous };
    },
    onError: (_err, _id, context: any) => {
      // rollback
      qc.setQueryData(["boards"], context?.previous ?? []);
      toast.error("Delete failed — action undone");
    },
    onSuccess: () => {
      toast.success("Board deleted");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["boards"] });
    },
  });
}
