-- Add schedule_finalized column to seasons
ALTER TABLE seasons ADD COLUMN IF NOT EXISTS schedule_finalized boolean DEFAULT false;

-- Reset season to unpublished state (admin will redo the full flow)
UPDATE seasons SET schedule_finalized = false, published = false;
