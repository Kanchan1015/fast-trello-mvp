package com.trello.backend.card;

import com.trello.backend.boardmember.BoardMemberService;
import com.trello.backend.realtime.BoardEventPublisher;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/boards/{boardId}")
public class CardController {

    private final CardService cardService;
    private final BoardMemberService memberService;
    private final BoardEventPublisher eventPublisher;

    public CardController(CardService cardService, BoardMemberService memberService, BoardEventPublisher eventPublisher) {
        this.cardService = cardService;
        this.memberService = memberService;
        this.eventPublisher = eventPublisher;
    }

    @GetMapping("/cards")
    public ResponseEntity<List<CardDto>> list(@PathVariable UUID boardId, Authentication auth) {
        memberService.requireAccess(boardId, userId(auth));
        return ResponseEntity.ok(cardService.listForBoard(boardId).stream().map(CardDto::fromEntity).toList());
    }

    @PostMapping("/lists/{listId}/cards")
    public ResponseEntity<CardDto> create(
            @PathVariable UUID boardId,
            @PathVariable UUID listId,
            @Valid @RequestBody CreateCardRequest request,
            Authentication auth
    ) {
        memberService.requireAccess(boardId, userId(auth));
        CardDto dto = CardDto.fromEntity(cardService.createCard(
                boardId,
                listId,
                request.getTitle(),
                request.getDescription(),
                request.getPosition()
        ));
        eventPublisher.publish(boardId, "CARD_CREATED", dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @PatchMapping("/lists/{listId}/cards/{cardId}")
    public ResponseEntity<CardDto> update(
            @PathVariable UUID boardId,
            @PathVariable UUID listId,
            @PathVariable UUID cardId,
            @RequestBody UpdateCardRequest request,
            Authentication auth
    ) {
        memberService.requireAccess(boardId, userId(auth));
        CardDto dto = CardDto.fromEntity(cardService.updateCard(boardId, listId, cardId, request));
        eventPublisher.publish(boardId, "CARD_UPDATED", dto);
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/lists/{listId}/cards/{cardId}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID boardId,
            @PathVariable UUID listId,
            @PathVariable UUID cardId,
            Authentication auth
    ) {
        memberService.requireAccess(boardId, userId(auth));
        cardService.deleteCard(boardId, listId, cardId);
        eventPublisher.publish(boardId, "CARD_DELETED", java.util.Map.of("id", cardId, "listId", listId));
        return ResponseEntity.noContent().build();
    }

    private UUID userId(Authentication auth) {
        return UUID.fromString(auth.getName());
    }
}
