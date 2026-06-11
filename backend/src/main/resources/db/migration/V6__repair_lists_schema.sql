-- Keep the lists schema correct on databases that started from V1.
-- V1 created lists.name, V4 used CREATE TABLE IF NOT EXISTS and therefore did
-- not add lists.title when the table already existed, then V5 removed name.
ALTER TABLE lists
ADD COLUMN IF NOT EXISTS title VARCHAR(300) NOT NULL DEFAULT 'Untitled list';

ALTER TABLE lists
ALTER COLUMN position TYPE DOUBLE PRECISION USING position::DOUBLE PRECISION;

ALTER TABLE lists
ALTER COLUMN title DROP DEFAULT;
