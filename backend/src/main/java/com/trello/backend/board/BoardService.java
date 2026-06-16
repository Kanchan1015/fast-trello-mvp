package com.trello.backend.board;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.trello.backend.boardmember.BoardMemberRepository;

import java.util.List;
import java.util.UUID;

/**
 * BoardService
 *
 * Responsibilities:
 * - Centralize business logic for boards
 * - Enforce owner checks here (not only in controllers)
 *
 * Interview note: keeping auth checks at service layer prevents accidental leaks
 * when other controllers or background jobs call the service.
 */
@Service
public class BoardService {

    private final BoardRepository repo;
    private final BoardMemberRepository memberRepository;

    public BoardService(BoardRepository repo, BoardMemberRepository memberRepository) {
        this.repo = repo;
        this.memberRepository = memberRepository;
    }

    /**
     * Create and persist a board for the given owner.
     */
    @Transactional
    public Board createBoard(String name, UUID ownerId) {
        Board board = Board.create(name, ownerId);
        return repo.save(board);
    }

    /**
     * List boards owned by ownerId.
     */
    @Transactional(readOnly = true)
    public List<Board> listBoards(UUID ownerId) {
        return repo.findAccessibleByUserId(ownerId);
    }

    /**
     * Get a board by id only if it belongs to ownerId.
     * Throws BoardNotFoundException when not found or not owned by user.
     */
    @Transactional(readOnly = true)
    public Board getBoard(UUID boardId, UUID ownerId) {
        Board board = repo.findById(boardId).orElseThrow(BoardNotFoundException::new);
        if (!board.getOwnerId().equals(ownerId)
                && !memberRepository.existsByBoardIdAndUserId(boardId, ownerId)) {
            throw new BoardNotFoundException();
        }
        return board;
    }

    /**
     * Delete a board owned by ownerId (hard delete).
     * Throws BoardNotFoundException if the board does not exist or is not owned by user.
     */
    @Transactional
    public void deleteBoard(UUID boardId, UUID ownerId) {
        long removed = repo.deleteByIdAndOwnerId(boardId, ownerId);
        if (removed == 0) {
            // nothing removed -> either not found or not the owner
            throw new BoardNotFoundException();
        }
    }
}
