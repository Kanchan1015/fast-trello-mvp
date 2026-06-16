import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { addMember, listMembers, removeMember, type BoardMember } from "../api/members";

type Props = {
  boardId: string;
};

export const BoardMembers: React.FC<Props> = ({ boardId }) => {
  const [email, setEmail] = useState("");
  const qc = useQueryClient();
  const { data: members = [] } = useQuery<BoardMember[]>({
    queryKey: ["members", boardId],
    queryFn: () => listMembers(boardId),
  });

  const addMutation = useMutation({
    mutationFn: () => addMember(boardId, email.trim()),
    onSuccess: () => {
      setEmail("");
      qc.invalidateQueries({ queryKey: ["members", boardId] });
      qc.invalidateQueries({ queryKey: ["boards"] });
    },
    onError: () => toast.error("Could not add member"),
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) => removeMember(boardId, userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["members", boardId] }),
    onError: () => toast.error("Could not remove member"),
  });

  return (
    <div className="mt-4 border-t border-white/70 pt-4">
      <div className="flex flex-wrap items-center gap-2">
        {members.map((member) => (
          <div
            key={member.userId}
            className="flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs text-slate-600 shadow-sm"
            title={member.email}
          >
            <span className="max-w-36 truncate">{member.name || member.email}</span>
            <span className="font-semibold text-[#5f7f72]">{member.role.toLowerCase()}</span>
            {member.role !== "OWNER" && (
              <button
                onClick={() => removeMutation.mutate(member.userId)}
                className="text-slate-400 hover:text-red-600"
                aria-label={`Remove ${member.email}`}
              >
                x
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 flex max-w-md gap-2">
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="field flex-1 px-3 py-2 text-sm"
          placeholder="Invite by email"
          type="email"
        />
        <button
          onClick={() => addMutation.mutate()}
          disabled={!email.trim() || addMutation.isPending}
          className="primary-button px-3 py-2 text-sm disabled:bg-slate-300 disabled:shadow-none"
        >
          Add
        </button>
      </div>
    </div>
  );
};
