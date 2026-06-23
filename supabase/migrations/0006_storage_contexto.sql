-- Policies de Storage para o bucket "contexto" (materiais: PDFs, docs, etc.).
-- Mesma regra do branding: leitura pública, escrita só na pasta do próprio uid.
create policy "contexto_read_public" on storage.objects for select
  using (bucket_id = 'contexto');

create policy "contexto_insert_own" on storage.objects for insert to authenticated
  with check (bucket_id = 'contexto' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "contexto_update_own" on storage.objects for update to authenticated
  using (bucket_id = 'contexto' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "contexto_delete_own" on storage.objects for delete to authenticated
  using (bucket_id = 'contexto' and (storage.foldername(name))[1] = auth.uid()::text);
