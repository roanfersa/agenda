-- Policies de Storage para o bucket "branding".
-- Leitura é pública (bucket público). Upload/atualização/remoção só do dono,
-- restritos à pasta com o próprio uid (path: <uid>/arquivo).

create policy "branding_read_public" on storage.objects for select
  using (bucket_id = 'branding');

create policy "branding_insert_own" on storage.objects for insert to authenticated
  with check (bucket_id = 'branding' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "branding_update_own" on storage.objects for update to authenticated
  using (bucket_id = 'branding' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "branding_delete_own" on storage.objects for delete to authenticated
  using (bucket_id = 'branding' and (storage.foldername(name))[1] = auth.uid()::text);
