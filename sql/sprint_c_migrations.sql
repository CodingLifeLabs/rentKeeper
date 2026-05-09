-- Sprint C Migrations
-- Adds dead-letter support to webhook_events

-- 1. Add is_dead_letter flag
alter table webhook_events
  add column if not exists is_dead_letter boolean not null default false;

-- 2. Partial index for fast dead-letter queries
create index if not exists webhook_events_dead_letter_idx
  on webhook_events (processed_at)
  where is_dead_letter = true;
