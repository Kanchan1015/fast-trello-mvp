import api from "./axios";

export type CardItem = {
  id: string;
  listId: string;
  title: string;
  description?: string | null;
  position: number;
  createdAt: string;
};

export type CreateCardPayload = {
  title: string;
  description?: string;
  position?: number;
};

export type UpdateCardPayload = {
  title?: string;
  description?: string;
  listId?: string;
  position?: number;
};

export function listCards(boardId: string): Promise<CardItem[]> {
  return api.get<CardItem[]>(`/api/boards/${boardId}/cards`).then((r) => r.data);
}

export function createCard(
  boardId: string,
  listId: string,
  payload: CreateCardPayload
): Promise<CardItem> {
  return api
    .post<CardItem>(`/api/boards/${boardId}/lists/${listId}/cards`, payload)
    .then((r) => r.data);
}

export function patchCard(
  boardId: string,
  listId: string,
  cardId: string,
  updates: UpdateCardPayload
): Promise<CardItem> {
  return api
    .patch<CardItem>(`/api/boards/${boardId}/lists/${listId}/cards/${cardId}`, updates)
    .then((r) => r.data);
}

export function deleteCard(boardId: string, listId: string, cardId: string): Promise<void> {
  return api
    .delete(`/api/boards/${boardId}/lists/${listId}/cards/${cardId}`)
    .then(() => undefined);
}
