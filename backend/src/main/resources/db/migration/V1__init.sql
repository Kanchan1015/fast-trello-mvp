CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE boards (
  id UUID PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE lists (
  id UUID PRIMARY KEY,
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  position INTEGER NOT NULL DEFAULT 0, -- used for ordering
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE cards (
  id UUID PRIMARY KEY,
  list_id UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  position INTEGER NOT NULL DEFAULT 0, -- used for ordering within a list
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Useful indexes
CREATE INDEX idx_boards_owner ON boards(owner_id);
CREATE INDEX idx_lists_board ON lists(board_id);
CREATE INDEX idx_cards_list ON cards(list_id);
