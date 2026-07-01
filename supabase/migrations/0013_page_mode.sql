-- Modo da página pública por funil: 'pagina' (blocos + entrada de chat) ou 'conversa' (IA).
-- Default 'conversa' preserva o comportamento atual dos funis existentes.
alter table funnels add column if not exists page_mode text not null default 'conversa';
