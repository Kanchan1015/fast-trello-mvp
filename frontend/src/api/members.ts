import api from "./axios";

export type BoardMember = {
  userId: string;
  name?: string | null;
  email: string;
  role: "OWNER" | "EDITOR";
  createdAt: string;
};

export function listMembers(boardId: string): Promise<BoardMember[]> {
  return api.get<BoardMember[]>(`/api/boards/${boardId}/members`).then((r) => r.data);
}

export function addMember(boardId: string, email: string): Promise<BoardMember> {
  return api
    .post<BoardMember>(`/api/boards/${boardId}/members`, { email })
    .then((r) => r.data);
}

export function removeMember(boardId: string, userId: string): Promise<void> {
  return api.delete(`/api/boards/${boardId}/members/${userId}`).then(() => undefined);
}
