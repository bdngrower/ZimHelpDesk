# SUPABASE DATABASE SCHEMA

-- Este arquivo contém os comandos SQL para criar a estrutura do banco de dados no Supabase.
-- Rode este script no Editor SQL do seu projeto Supabase para configurar as tabelas.

-- 1. Criação da tabela de perfis de usuário (clientes e agentes)
-- Esta tabela estende a tabela auth.users padrão do Supabase
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text not null,
  full_name text,
  avatar_url text,
  role text check (role in ('admin', 'agent', 'customer')) default 'customer',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ativar Row Level Security (RLS) para segurança
alter table public.profiles enable row level security;

-- Políticas de acesso para profiles
-- Qualquer um pode ler dados públicos de perfil
create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

-- Usuários só podem editar seu próprio perfil
create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- 2. Criação da tabela de Tickets (Chamados)
create table public.tickets (
  id uuid default gen_random_uuid() primary key,
  ticket_number serial, -- Número sequencial amigável (ex: 1024)
  subject text not null,
  description text,
  status text check (status in ('open', 'in_progress', 'resolved', 'closed')) default 'open',
  priority text check (priority in ('low', 'medium', 'high', 'urgent')) default 'medium',
  requester_id uuid references public.profiles(id) not null,
  assignee_id uuid references public.profiles(id),
  tags text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ativar RLS
alter table public.tickets enable row level security;

-- Políticas de acesso para tickets
-- Agentes e Admins podem ver todos os tickets
create policy "Agents can view all tickets"
  on public.tickets for select
  using ( auth.uid() in (select id from public.profiles where role in ('agent', 'admin')) );

-- Clientes só podem ver seus próprios tickets
create policy "Customers can view own tickets"
  on public.tickets for select
  using ( auth.uid() = requester_id );

-- Clientes podem criar tickets
create policy "Customers can create tickets"
  on public.tickets for insert
  with check ( auth.uid() = requester_id );

-- 3. Criação da tabela de Mensagens (Interações do Ticket)
create table public.ticket_messages (
  id uuid default gen_random_uuid() primary key,
  ticket_id uuid references public.tickets(id) not null,
  sender_id uuid references public.profiles(id) not null,
  content text not null,
  is_internal boolean default false, -- Se verdadeiro, visível apenas para agentes
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ativar RLS
alter table public.ticket_messages enable row level security;

-- Políticas de acesso para mensagens
-- Agentes podem ver todas as mensagens
create policy "Agents can view all messages"
  on public.ticket_messages for select
  using ( auth.uid() in (select id from public.profiles where role in ('agent', 'admin')) );

-- Clientes podem ver mensagens públicas dos seus tickets
create policy "Customers can view public messages on own tickets"
  on public.ticket_messages for select
  using ( 
    ticket_id in (select id from public.tickets where requester_id = auth.uid())
    and is_internal = false 
  );

-- 4. Tabela de configurações (Email, Spam, etc)
-- Apenas admins podem ler/escrever
create table public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.settings enable row level security;

create policy "Admins can manage settings"
  on public.settings for all
  using ( auth.uid() in (select id from public.profiles where role = 'admin') );

-- Função para atualizar o updated_at automaticamente
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_ticket_updated
  before update on public.tickets
  for each row execute procedure public.handle_updated_at();

-- Trigger para criar perfil automaticamente ao se cadastrar no Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'customer');
  return new;
end;
$$ language plpgsql;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
