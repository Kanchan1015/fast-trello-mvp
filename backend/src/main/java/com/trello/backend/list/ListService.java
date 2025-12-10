package com.trello.backend.list;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

/**
 * Service for list CRUD and ordering logic.
 *
 * Position strategy:
 * - New appended item -> maxPosition + STEP
 * - Insert between two items -> average positions
 * - If positions converge (difference < EPSILON), compact positions (renumber)
 */
@Service
public class ListService {

    private final ListRepository repo;
    // Large gap to allow many inserts between neighbors before compacting
    private static final double STEP = 1000.0;
    // If two adjacent positions are closer than EPSILON, we consider them converged
    private static final double EPSILON = 1e-6;

    public ListService(ListRepository repo) {
        this.repo = repo;
    }

    @Transactional(readOnly = true)
    public List<ListEntity> listForBoard(UUID boardId) {
        return repo.findByBoardIdOrderByPositionAsc(boardId);
    }

    /**
     * Create list. If position is null -> append (maxPosition + STEP)
     * If position provided, just use it (caller can compute between neighbors)
     */
    @Transactional
    public ListEntity createList(UUID boardId, String title, Double position) {
        if (position == null) {
            // append
            List<ListEntity> existing = repo.findByBoardIdOrderByPositionAsc(boardId);
            double newPos = existing.isEmpty() ? STEP : (existing.get(existing.size() - 1).getPosition() + STEP);
            position = newPos;
        }
        ListEntity ent = ListEntity.create(boardId, title, position);
        return repo.save(ent);
    }

    @Transactional
    public ListEntity updateTitle(UUID listId, UUID boardId, String title) {
        ListEntity ent = repo.findByIdAndBoardId(listId, boardId).orElseThrow(ListNotFoundException::new);
        ent.setTitle(title);
        return repo.save(ent);
    }

    /**
     * Update position for a list (used when reordering).
     * If positions around have converged (very small gaps), we compact.
     */
    @Transactional
    public ListEntity updatePosition(UUID listId, UUID boardId, Double newPosition) {
        ListEntity ent = repo.findByIdAndBoardId(listId, boardId).orElseThrow(ListNotFoundException::new);
        ent.setPosition(newPosition);
        ListEntity saved = repo.save(ent);

        // after saving, check if compacting is needed: look for adjacent tiny gaps
        if (needsCompaction(boardId)) {
            compactPositions(boardId);
        }

        return saved;
    }

    @Transactional
    public void deleteList(UUID listId, UUID boardId) {
        long removed = repo.deleteByIdAndBoardId(listId, boardId);
        if (removed == 0) {
            throw new ListNotFoundException();
        }
    }

    /* ---------- Helper methods ---------- */

    /**
     * Check if any adjacent pairs of positions are closer than EPSILON,
     * indicating we should re-space positions.
     */
    private boolean needsCompaction(UUID boardId) {
        List<ListEntity> lists = repo.findByBoardIdOrderByPositionAsc(boardId);
        for (int i = 1; i < lists.size(); i++) {
            double prev = lists.get(i - 1).getPosition();
            double cur = lists.get(i).getPosition();
            if (Math.abs(cur - prev) < EPSILON) {
                return true;
            }
        }
        return false;
    }

    /**
     * Re-space positions evenly using STEP between items (starting at STEP).
     * This is a safe operation to restore spacing when many inserts made positions too close.
     */
    @Transactional
    protected void compactPositions(UUID boardId) {
        List<ListEntity> lists = repo.findByBoardIdOrderByPositionAsc(boardId);
        double pos = STEP;
        for (ListEntity le : lists) {
            le.setPosition(pos);
            pos += STEP;
        }
        repo.saveAll(lists);
    }

    /* Utility to compute position between two adjacent items (can be used by caller) */
    public static double between(double a, double b) {
        return (a + b) / 2.0;
    }
}
