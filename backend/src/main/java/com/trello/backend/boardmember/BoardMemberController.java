package com.trello.backend.boardmember;

import jakarta.validation.Valid;
import com.trello.backend.realtime.BoardEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/boards/{boardId}/members")
public class BoardMemberController {

    private final BoardMemberService memberService;
    private final BoardEventPublisher eventPublisher;

    public BoardMemberController(BoardMemberService memberService, BoardEventPublisher eventPublisher) {
        this.memberService = memberService;
        this.eventPublisher = eventPublisher;
    }

    @GetMapping
    public ResponseEntity<List<BoardMemberDto>> list(@PathVariable UUID boardId, Authentication auth) {
        return ResponseEntity.ok(memberService.listMembers(boardId, userId(auth)));
    }

    @PostMapping
    public ResponseEntity<BoardMemberDto> add(
            @PathVariable UUID boardId,
            @Valid @RequestBody AddBoardMemberRequest request,
            Authentication auth
    ) {
        BoardMemberDto dto = memberService.addMember(boardId, userId(auth), request.getEmail());
        eventPublisher.publish(boardId, "MEMBER_ADDED", dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> remove(
            @PathVariable UUID boardId,
            @PathVariable UUID userId,
            Authentication auth
    ) {
        memberService.removeMember(boardId, userId(auth), userId);
        eventPublisher.publish(boardId, "MEMBER_REMOVED", java.util.Map.of("userId", userId));
        return ResponseEntity.noContent().build();
    }

    private UUID userId(Authentication auth) {
        return UUID.fromString(auth.getName());
    }
}
