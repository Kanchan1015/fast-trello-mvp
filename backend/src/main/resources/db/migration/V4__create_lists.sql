-- V4__create_lists.sql
-- Lists table for boards. position is a numeric/double to allow inserting between items without renumbering.
CREATE TABLE IF NOT EXISTS lists (
  id UUID PRIMARY KEY,
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  title VARCHAR(300) NOT NULL,
  position DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
