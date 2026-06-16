import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export type BoardEvent = {
  type: string;
  boardId: string;
  payload: unknown;
  occurredAt: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export function subscribeToBoard(boardId: string, onEvent: (event: BoardEvent) => void): Client {
  const client = new Client({
    webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`),
    reconnectDelay: 3000,
    onConnect: () => {
      client.subscribe(`/topic/boards/${boardId}`, (message) => {
        onEvent(JSON.parse(message.body) as BoardEvent);
      });
    },
  });

  client.activate();
  return client;
}
