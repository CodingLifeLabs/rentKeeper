-- RentKeeper DB Schema
-- Run in Supabase SQL Editor

-- Enable UUID
create extension if not exists "uuid-ossp";

-- Landlords
create table landlords (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  name text not null,
  phone text,
  created_at timestamptz default now() not null
);

-- Properties
create table properties (
  id uuid default uuid_generate_v4() primary key,
  landlord_id uuid references landlords(id) on delete cascade not null,
  address text not null,
  unit_number text,
  type text not null check (type in ('원룸', '오피스텔', '다가구')),
  area_sqm numeric,
  created_at timestamptz default now() not null
);

-- Contracts
create table contracts (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references properties(id) on delete cascade not null,
  tenant_name text not null,
  tenant_phone text not null,
  deposit integer not null,
  monthly_rent integer,
  start_date date not null,
  end_date date not null,
  contract_type text not null check (contract_type in ('월세', '전세')),
  status text not null default 'active' check (status in ('active', 'expiring', 'expired', 'renewed', 'vacancy')),
  original_file_url text,
  extracted_data jsonb,
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Renewal Proposals
create table renewal_proposals (
  id uuid default uuid_generate_v4() primary key,
  contract_id uuid references contracts(id) on delete cascade not null,
  proposed_rent integer,
  proposed_deposit integer,
  message text,
  share_token text not null unique default '',
  status text not null default 'sent' check (status in ('sent', 'accepted', 'negotiating', 'rejected')),
  sent_at timestamptz,
  responded_at timestamptz
);

-- Notifications
create table notifications (
  id uuid default uuid_generate_v4() primary key,
  contract_id uuid references contracts(id) on delete cascade not null,
  type text not null check (type in ('d90', 'd60', 'd30', 'd7')),
  sent_at timestamptz default now() not null,
  channel text not null check (channel in ('push', 'email'))
);

-- RLS Policies
alter table landlords enable row level security;
alter table properties enable row level security;
alter table contracts enable row level security;
alter table renewal_proposals enable row level security;
alter table notifications enable row level security;

-- Landlords: users can only see their own
create policy "Landlords can view own data" on landlords
  for select using (user_id = auth.uid());

create policy "Landlords can insert own data" on landlords
  for insert with check (user_id = auth.uid());

create policy "Landlords can update own data" on landlords
  for update using (user_id = auth.uid());

-- Properties: via landlord relationship
create policy "Landlords can view own properties" on properties
  for select using (
    landlord_id in (select id from landlords where user_id = auth.uid())
  );

create policy "Landlords can insert own properties" on properties
  for insert with check (
    landlord_id in (select id from landlords where user_id = auth.uid())
  );

create policy "Landlords can update own properties" on properties
  for update using (
    landlord_id in (select id from landlords where user_id = auth.uid())
  );

create policy "Landlords can delete own properties" on properties
  for delete using (
    landlord_id in (select id from landlords where user_id = auth.uid())
  );

-- Contracts: via property -> landlord relationship
create policy "Landlords can view own contracts" on contracts
  for select using (
    property_id in (
      select p.id from properties p
      join landlords l on p.landlord_id = l.id
      where l.user_id = auth.uid()
    )
  );

create policy "Landlords can insert own contracts" on contracts
  for insert with check (
    property_id in (
      select p.id from properties p
      join landlords l on p.landlord_id = l.id
      where l.user_id = auth.uid()
    )
  );

create policy "Landlords can update own contracts" on contracts
  for update using (
    property_id in (
      select p.id from properties p
      join landlords l on p.landlord_id = l.id
      where l.user_id = auth.uid()
    )
  );

create policy "Landlords can delete own contracts" on contracts
  for delete using (
    property_id in (
      select p.id from properties p
      join landlords l on p.landlord_id = l.id
      where l.user_id = auth.uid()
    )
  );

-- Renewal proposals: via contract -> property -> landlord
create policy "Landlords can view own proposals" on renewal_proposals
  for select using (
    contract_id in (
      select c.id from contracts c
      join properties p on c.property_id = p.id
      join landlords l on p.landlord_id = l.id
      where l.user_id = auth.uid()
    )
  );

create policy "Landlords can insert own proposals" on renewal_proposals
  for insert with check (
    contract_id in (
      select c.id from contracts c
      join properties p on c.property_id = p.id
      join landlords l on p.landlord_id = l.id
      where l.user_id = auth.uid()
    )
  );

create policy "Landlords can update own proposals" on renewal_proposals
  for update using (
    contract_id in (
      select c.id from contracts c
      join properties p on c.property_id = p.id
      join landlords l on p.landlord_id = l.id
      where l.user_id = auth.uid()
    )
  );

-- Public read for share_token (tenant access)
create policy "Public can view proposal by token" on renewal_proposals
  for select using (share_token = current_setting('request.jwt.claims')::json->>'share_token');

-- Notifications: via contract -> property -> landlord
create policy "Landlords can view own notifications" on notifications
  for select using (
    contract_id in (
      select c.id from contracts c
      join properties p on c.property_id = p.id
      join landlords l on p.landlord_id = l.id
      where l.user_id = auth.uid()
    )
  );

create policy "Landlords can insert own notifications" on notifications
  for insert with check (
    contract_id in (
      select c.id from contracts c
      join properties p on c.property_id = p.id
      join landlords l on p.landlord_id = l.id
      where l.user_id = auth.uid()
    )
  );
