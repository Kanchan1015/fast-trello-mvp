package com.trello.backend.boardmember;

import com.trello.backend.auth.User;
import com.trello.backend.auth.UserRepository;
import com.trello.backend.board.Board;
import com.trello.backend.board.BoardNotFoundException;
import com.trello.backend.board.BoardRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class BoardMemberService {

    private final BoardRepository boardRepository;
    private final BoardMemberRepository memberRepository;
    private final UserRepository userRepository;

    public BoardMemberService(
            BoardRepository boardRepository,
            BoardMemberRepository memberRepository,
            UserRepository userRepository
    ) {
        this.boardRepository = boardRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public Board requireAccess(UUID boardId, UUID userId) {
        Board board = boardRepository.findById(boardId).orElseThrow(BoardNotFoundException::new);
        if (!board.getOwnerId().equals(userId) && !memberRepository.existsByBoardIdAndUserId(boardId, userId)) {
            throw new BoardNotFoundException();
        }
        return board;
    }

    @Transactional(readOnly = true)
    public Board requireOwner(UUID boardId, UUID userId) {
        Board board = boardRepository.findByIdAndOwnerId(boardId, userId).orElseThrow(BoardNotFoundException::new);
        return board;
    }

    @Transactional(readOnly = true)
    public List<BoardMemberDto> listMembers(UUID boardId, UUID requesterId) {
        Board board = requireAccess(boardId, requesterId);
        List<BoardMemberDto> members = new ArrayList<>();
        userRepository.findById(board.getOwnerId()).ifPresent(owner -> members.add(BoardMemberDto.owner(owner)));
        for (BoardMember member : memberRepository.findByBoardIdOrderByCreatedAtAsc(boardId)) {
            userRepository.findById(member.getUserId()).ifPresent(user -> members.add(BoardMemberDto.fromMember(member, user)));
        }
        return members;
    }

    @Transactional
    public BoardMemberDto addMember(UUID boardId, UUID requesterId, String email) {
        Board board = requireOwner(boardId, requesterId);
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (board.getOwnerId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Owner is already a member");
        }
        BoardMember member = memberRepository.findByBoardIdAndUserId(boardId, user.getId())
                .orElseGet(() -> memberRepository.save(BoardMember.create(boardId, user.getId(), BoardMemberRole.EDITOR)));
        return BoardMemberDto.fromMember(member, user);
    }

    @Transactional
    public void removeMember(UUID boardId, UUID requesterId, UUID userId) {
        Board board = requireOwner(boardId, requesterId);
        if (board.getOwnerId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Owner cannot be removed");
        }
        long removed = memberRepository.deleteByBoardIdAndUserId(boardId, userId);
        if (removed == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found");
        }
    }
}
