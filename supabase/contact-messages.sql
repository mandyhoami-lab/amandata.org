-- Contact form storage for amandata.org
-- Run this in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- Project: amandata-blog (https://latblgczhvpmvhuewczt.supabase.co)

create table if not exists public.contact_messages (
  id         bigint generated always as identity primary key,
  name       text not null check (char_length(name) between 1 and 128),
  company    text check (char_length(company) <= 128),
  email      text not null check (char_length(email) between 3 and 128),
  phone      text check (char_length(phone) <= 28),
  message    text not null check (char_length(message) between 1 and 16384),
  emailed    boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

-- No public policies: only the send-contact edge function (service_role,
-- which bypasses RLS) reads/writes this table. Visitors can submit solely
-- through the edge function, which validates before inserting.
