// src/api/lists.ts
// API client for board lists (columns)

import api from "./axios";

/* ---------- Types ---------- */

export type ListItem = {
  id: string;
  boardId: string;
  title: string;
  position: number;
  createdAt: string;
};

export type CreateListPayload = {
  title: string;
  position?: number;
};

export type UpdateListPayload = {
  title?: string;
  position?: number;
};

/* ---------- API functions ---------- */

// POST /api/boards/{boardId}/lists
export function createList(
  boardId: string,
  payload: CreateListPayload
): Promise<ListItem> {
  return api
    .post<ListItem>(`/api/boards/${boardId}/lists`, payload)
    .then((r) => r.data);
}

// GET /api/boards/{boardId}/lists
export function listLists(boardId: string): Promise<ListItem[]> {
  return api
    .get<ListItem[]>(`/api/boards/${boardId}/lists`)
    .then((r) => r.data);
}

// PATCH /api/boards/{boardId}/lists/{id}
export function patchList(
  boardId: string,
  id: string,
  updates: UpdateListPayload
): Promise<ListItem> {
  return api
    .patch<ListItem>(`/api/boards/${boardId}/lists/${id}`, updates)
    .then((r) => r.data);
}

// DELETE /api/boards/{boardId}/lists/{id}
export function deleteList(boardId: string, id: string): Promise<void> {
  return api.delete(`/api/boards/${boardId}/lists/${id}`).then(() => undefined);
}
