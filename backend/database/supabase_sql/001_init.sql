-- Supabase schema initialization for alfa-it-solution
-- Tables: users, tokens, requests, contacts, reviews, news, uploads, audit

create extension if not exists pgcrypto;

-- users
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password text not null,
  name text,
  role text default 'client',
  verified boolean default false,
  suspended boolean default false,
  deleted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- tokens (verification / reset)
create table if not exists public.tokens (
  id uuid primary key default gen_random_uuid(),
  token text not null,
  user_id uuid references public.users(id) on delete cascade,
  type text,
  expires_at bigint,
  consumed boolean default false,
  created_at timestamptz default now()
);

-- requests
create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  subject text,
  body text,
  status text default 'pending',
  handled_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- contacts
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  message text,
  response text,
  responded_by text,
  responded_at timestamptz,
  created_at timestamptz default now()
);

-- reviews
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  rating int,
  comment text,
  status text default 'pending',
  moderated_by text,
  created_at timestamptz default now()
);

-- news
create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text,
  body text,
  published boolean default false,
  published_by text,
  published_at timestamptz,
  created_at timestamptz default now()
);

-- uploads metadata
create table if not exists public.uploads (
  id uuid primary key default gen_random_uuid(),
  filename text,
  path text,
  size bigint,
  content_type text,
  uploaded_by uuid references public.users(id),
  created_at timestamptz default now()
);

-- audit trail
create table if not exists public.audit (
  id bigserial primary key,
  actor_id text,
  actor_email text,
  action text,
  resource text,
  resource_id text,
  details jsonb,
  created_at timestamptz default now()
);

-- indexes
create index if not exists idx_users_email on public.users(email);
create index if not exists idx_requests_user on public.requests(user_id);
create index if not exists idx_audit_created on public.audit(created_at);

-- Row Level Security (RLS) policies
-- Enable RLS where appropriate and allow admins or owners
alter table public.users enable row level security;
create policy "users_self_or_admin_select" on public.users for select using (
  (current_setting('request.jwt.claims', true)::json->>'role') = 'admin' OR (current_setting('request.jwt.claims', true)::json->>'sub') = id::text
);
create policy "users_self_or_admin_update" on public.users for update using (
  (current_setting('request.jwt.claims', true)::json->>'role') = 'admin' OR (current_setting('request.jwt.claims', true)::json->>'sub') = id::text
);

alter table public.requests enable row level security;
create policy "requests_admin_or_owner" on public.requests for all using (
  (current_setting('request.jwt.claims', true)::json->>'role') = 'admin' OR (current_setting('request.jwt.claims', true)::json->>'sub') = user_id::text
);

-- Allow public to insert contacts
alter table public.contacts enable row level security;
create policy "contacts_public_insert" on public.contacts for insert using (true);
create policy "contacts_admin_select" on public.contacts for select using (
  (current_setting('request.jwt.claims', true)::json->>'role') = 'admin'
);

-- Similar policies for reviews, news, uploads as needed
alter table public.reviews enable row level security;
create policy "reviews_public_insert" on public.reviews for insert using (true);
create policy "reviews_admin_select_update" on public.reviews for select using ((current_setting('request.jwt.claims', true)::json->>'role') = 'admin');
create policy "reviews_admin_update" on public.reviews for update using ((current_setting('request.jwt.claims', true)::json->>'role') = 'admin');

alter table public.news enable row level security;
create policy "news_admin_all" on public.news for all using ((current_setting('request.jwt.claims', true)::json->>'role') = 'admin');

alter table public.uploads enable row level security;
create policy "uploads_admin_all" on public.uploads for all using ((current_setting('request.jwt.claims', true)::json->>'role') = 'admin');

-- Trigger: update `updated_at` on update
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_users_updated before update on public.users for each row execute procedure public.set_updated_at();
create trigger trg_requests_updated before update on public.requests for each row execute procedure public.set_updated_at();

-- Audit trigger function
create or replace function public.audit_changes()
returns trigger as $$
begin
  if (tg_op = 'DELETE') then
    insert into public.audit(actor_id, actor_email, action, resource, resource_id, details)
    values (current_setting('request.jwt.claims', true)::json->>'sub', current_setting('request.jwt.claims', true)::json->>'email', tg_op, tg_table_name, row_to_json(old)::text, NULL);
    return old;
  end if;
  insert into public.audit(actor_id, actor_email, action, resource, resource_id, details)
  values (current_setting('request.jwt.claims', true)::json->>'sub', current_setting('request.jwt.claims', true)::json->>'email', tg_op, tg_table_name, row_to_json(new)->> 'id', to_jsonb(new));
  return new;
end;
$$ language plpgsql;

-- attach audit trigger to important tables
create trigger audit_users after insert or update or delete on public.users for each row execute procedure public.audit_changes();
create trigger audit_requests after insert or update or delete on public.requests for each row execute procedure public.audit_changes();
create trigger audit_contacts after insert or update or delete on public.contacts for each row execute procedure public.audit_changes();
create trigger audit_reviews after insert or update or delete on public.reviews for each row execute procedure public.audit_changes();
create trigger audit_news after insert or update or delete on public.news for each row execute procedure public.audit_changes();

-- Retention suggestion: use pg_cron to clean audit older than 90 days (requires pg_cron extension)
-- select cron.schedule('0 3 * * *', $$ delete from public.audit where created_at < now() - interval '90 days' $$);
