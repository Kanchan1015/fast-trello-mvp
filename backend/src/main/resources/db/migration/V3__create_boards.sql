-- V3__create_boards.sql
-- Create boards table; owner_id references users(id) and cascades on user delete.
CREATE TABLE IF NOT EXISTS boards (
  id UUID PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);
