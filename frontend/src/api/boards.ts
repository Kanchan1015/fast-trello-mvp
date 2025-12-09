// src/api/boards.ts
// Small typed client for boards endpoints.
// Uses the central axios instance (which attaches Authorization header).

import api from "./axios";

export type Board = {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
};

export type CreateBoardPayload = {
  name: string;
};

// Create a board -> returns created Board
export function createBoard(payload: CreateBoardPayload): Promise<Board> {
  return api.post<Board>("/api/boards", payload).then((r) => r.data);
}

// List boards for current user
export function listBoards(): Promise<Board[]> {
  return api.get<Board[]>("/api/boards").then((r) => r.data);
}

// Get a single board by id
export function getBoard(id: string): Promise<Board> {
  return api.get<Board>(`/api/boards/${id}`).then((r) => r.data);
}

// Delete a board by id (returns void / 204)
export function deleteBoard(id: string): Promise<void> {
  return api.delete(`/api/boards/${id}`).then(() => undefined);
}
