package com.trello.backend.realtime;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class BoardEventPublisher {
    private final SimpMessagingTemplate messagingTemplate;

    public BoardEventPublisher(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void publish(UUID boardId, String type, Object payload) {
        messagingTemplate.convertAndSend("/topic/boards/" + boardId, BoardEvent.of(type, boardId, payload));
    }
}
