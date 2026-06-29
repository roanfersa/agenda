-- Post (media) específico ao qual a automação responde. Quando definido, o
-- webhook só dispara para comentários naquela publicação.
alter table automations
  add column if not exists post_id text;
