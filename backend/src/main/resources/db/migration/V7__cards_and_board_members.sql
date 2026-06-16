ALTER TABLE cards
ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE cards
ALTER COLUMN position TYPE DOUBLE PRECISION USING position::DOUBLE PRECISION;

CREATE TABLE IF NOT EXISTS board_members (
  id UUID PRIMARY KEY,
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(30) NOT NULL DEFAULT 'EDITOR',
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uk_board_members_board_user UNIQUE (board_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_board_members_board ON board_members(board_id);
CREATE INDEX IF NOT EXISTS idx_board_members_user ON board_members(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_list_position ON cards(list_id, position);
