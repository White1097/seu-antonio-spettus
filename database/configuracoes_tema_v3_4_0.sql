-- Seu Antônio Spettus v3.4.0
-- Execute no Supabase: SQL Editor > New query > Run

create table if not exists public.configuracoes_sistema (
    id integer primary key default 1 check (id = 1),
    nome_sistema text not null default 'Seu Antônio Spettus',
    logo_url text not null default '/logo-seu-antonio.png',
    tema text not null default 'claro' check (tema in ('claro','escuro','automatico')),
    cor_primaria text not null default '#3A083E',
    cor_secundaria text not null default '#D4AF37',
    cor_sidebar text not null default '#3A083E',
    cor_botoes text not null default '#3A083E',
    cor_cards text not null default '#FFFFFF',
    cor_tabela_cabecalho text not null default '#F5EDF6',
    cor_tabela_linhas text not null default '#FFFFFF',
    cor_tabela_hover text not null default '#FFF8DC',
    cor_texto_primario text not null default '#1F2937',
    cor_texto_secundario text not null default '#6B7280',
    meta_diaria numeric(12,2) not null default 2000 check (meta_diaria >= 0),
    atualizado_em timestamptz not null default now()
);

insert into public.configuracoes_sistema (id)
values (1)
on conflict (id) do nothing;

alter table public.configuracoes_sistema enable row level security;

drop policy if exists "configuracoes leitura autenticada" on public.configuracoes_sistema;
create policy "configuracoes leitura autenticada"
on public.configuracoes_sistema for select
to authenticated
using (true);

drop policy if exists "configuracoes administrador atualiza" on public.configuracoes_sistema;
create policy "configuracoes administrador atualiza"
on public.configuracoes_sistema for all
to authenticated
using (
    exists (
        select 1 from public.perfis
        where perfis.id = auth.uid()
          and perfis.cargo = 'administrador'
    )
)
with check (
    exists (
        select 1 from public.perfis
        where perfis.id = auth.uid()
          and perfis.cargo = 'administrador'
    )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'identidade-visual',
    'identidade-visual',
    true,
    3145728,
    array['image/png','image/jpeg','image/webp','image/svg+xml']
)
on conflict (id) do update set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "logos leitura publica" on storage.objects;
create policy "logos leitura publica"
on storage.objects for select
to public
using (bucket_id = 'identidade-visual');

drop policy if exists "logos administrador gerencia" on storage.objects;
create policy "logos administrador gerencia"
on storage.objects for all
to authenticated
using (
    bucket_id = 'identidade-visual'
    and exists (
        select 1 from public.perfis
        where perfis.id = auth.uid()
          and perfis.cargo = 'administrador'
    )
)
with check (
    bucket_id = 'identidade-visual'
    and exists (
        select 1 from public.perfis
        where perfis.id = auth.uid()
          and perfis.cargo = 'administrador'
    )
);
