-- Biblioteca de contexto no nível do profissional: catálogo de produtos e
-- materiais de referência (arquivos/notas/links) salvos uma vez e reutilizados
-- por todos os funis/links e pela IA.
alter table professionals
  add column if not exists produtos  jsonb not null default '[]'::jsonb,
  add column if not exists materiais jsonb not null default '[]'::jsonb;
