-- Polar webhook idempotency table
-- Run in Supabase SQL Editor after billing schema

create extension if not exists "uuid-ossp";

create table if not exists webhook_events (
  id            uuid        default uuid_generate_v4() primary key,
  event_id      text        not null unique,
  event_type    text        not null,
  processed_at  timestamptz default now() not null
);

create index if not exists webhook_events_event_id_idx on webhook_events (event_id);

-- No RLS policies = service role only; anon/authenticated cannot read or write
alter table webhook_events enable row level security;
