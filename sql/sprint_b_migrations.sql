-- Sprint B migrations
-- Run in Supabase SQL Editor (idempotent)

-- 1. webhook_events: add failure tracking columns
alter table webhook_events
  add column if not exists last_error   text,
  add column if not exists attempt_count int  not null default 0,
  add column if not exists payload      jsonb;

-- 2. subscriptions: add grace period and partial unique index
alter table subscriptions
  add column if not exists grace_end_at timestamptz;

-- Only one active/past_due subscription per landlord
create unique index if not exists subscriptions_landlord_active_uniq
  on subscriptions (landlord_id)
  where status in ('active', 'past_due');

-- 3. Contract-limit TOCTOU guard
-- Runs BEFORE INSERT on contracts, counts active contracts for the landlord
-- via the properties join, and raises an exception if the plan limit is exceeded.
create or replace function enforce_contract_limit()
returns trigger language plpgsql as $$
declare
  v_landlord_id uuid;
  v_plan_tier   text;
  v_max         int;
  v_current     int;
begin
  -- resolve landlord from the property being inserted
  select p.landlord_id into v_landlord_id
    from properties p
   where p.id = NEW.property_id;

  if v_landlord_id is null then
    raise exception 'property not found: %', NEW.property_id;
  end if;

  -- resolve active plan tier (free if no active subscription)
  select s.plan_tier into v_plan_tier
    from subscriptions s
   where s.landlord_id = v_landlord_id
     and s.status in ('active', 'past_due')
   order by s.created_at desc
   limit 1;

  v_plan_tier := coalesce(v_plan_tier, 'free');

  -- resolve max_contracts for the tier
  v_max := case v_plan_tier
    when 'pro'      then 20
    when 'business' then 100
    else                   3  -- free
  end;

  -- count current non-archived contracts for the landlord
  select count(*) into v_current
    from contracts c
    join properties p on p.id = c.property_id
   where p.landlord_id = v_landlord_id
     and c.status <> 'archived';

  if v_current >= v_max then
    raise exception 'contract_limit_exceeded:% tier=% max=%',
      v_landlord_id, v_plan_tier, v_max;
  end if;

  return NEW;
end;
$$;

drop trigger if exists trg_enforce_contract_limit on contracts;
create trigger trg_enforce_contract_limit
  before insert on contracts
  for each row execute function enforce_contract_limit();

-- 4. Atomic webhook failure counter
create or replace function increment_webhook_attempt(p_event_id text)
returns void language sql as $$
  update webhook_events
     set attempt_count = attempt_count + 1
   where event_id = p_event_id;
$$;
