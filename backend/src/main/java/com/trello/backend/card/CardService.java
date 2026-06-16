package com.trello.backend.card;

import com.trello.backend.list.ListEntity;
import com.trello.backend.list.ListNotFoundException;
import com.trello.backend.list.ListRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class CardService {
    private static final double STEP = 1000.0;
    private static final double EPSILON = 1e-6;

    private final CardRepository cardRepository;
    private final ListRepository listRepository;

    public CardService(CardRepository cardRepository, ListRepository listRepository) {
        this.cardRepository = cardRepository;
        this.listRepository = listRepository;
    }

    @Transactional(readOnly = true)
    public List<CardEntity> listForBoard(UUID boardId) {
        List<UUID> listIds = listRepository.findByBoardIdOrderByPositionAsc(boardId)
                .stream()
                .map(ListEntity::getId)
                .toList();
        if (listIds.isEmpty()) {
            return List.of();
        }
        return cardRepository.findByListIdInOrderByPositionAsc(listIds);
    }

    @Transactional
    public CardEntity createCard(UUID boardId, UUID listId, String title, String description, Double position) {
        ensureListOnBoard(boardId, listId);
        if (position == null) {
            List<CardEntity> existing = cardRepository.findByListIdOrderByPositionAsc(listId);
            position = existing.isEmpty() ? STEP : existing.get(existing.size() - 1).getPosition() + STEP;
        }
        return cardRepository.save(CardEntity.create(listId, title, description, position));
    }

    @Transactional
    public CardEntity updateCard(UUID boardId, UUID currentListId, UUID cardId, UpdateCardRequest request) {
        ensureListOnBoard(boardId, currentListId);
        CardEntity card = cardRepository.findByIdAndListId(cardId, currentListId).orElseThrow(CardNotFoundException::new);
        if (request.getListId() != null) {
            ensureListOnBoard(boardId, request.getListId());
            card.setListId(request.getListId());
        }
        if (request.getTitle() != null) {
            card.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            card.setDescription(request.getDescription());
        }
        if (request.getPosition() != null) {
            card.setPosition(request.getPosition());
        }
        CardEntity saved = cardRepository.save(card);
        if (needsCompaction(saved.getListId())) {
            compactPositions(saved.getListId());
        }
        return saved;
    }

    @Transactional
    public void deleteCard(UUID boardId, UUID listId, UUID cardId) {
        ensureListOnBoard(boardId, listId);
        long removed = cardRepository.deleteByIdAndListId(cardId, listId);
        if (removed == 0) {
            throw new CardNotFoundException();
        }
    }

    private void ensureListOnBoard(UUID boardId, UUID listId) {
        listRepository.findByIdAndBoardId(listId, boardId).orElseThrow(ListNotFoundException::new);
    }

    private boolean needsCompaction(UUID listId) {
        List<CardEntity> cards = cardRepository.findByListIdOrderByPositionAsc(listId);
        for (int i = 1; i < cards.size(); i++) {
            if (Math.abs(cards.get(i).getPosition() - cards.get(i - 1).getPosition()) < EPSILON) {
                return true;
            }
        }
        return false;
    }

    private void compactPositions(UUID listId) {
        List<CardEntity> cards = cardRepository.findByListIdOrderByPositionAsc(listId);
        double position = STEP;
        for (CardEntity card : cards) {
            card.setPosition(position);
            position += STEP;
        }
        cardRepository.saveAll(cards);
    }
}
