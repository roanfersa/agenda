"use client";

import { createClient } from "@/lib/supabase/client";

/**
 * Faz upload de um arquivo pro Storage (na pasta do próprio uid) e retorna a
 * URL pública. Buckets: "branding" (logo/avatar/fundo) e "contexto" (materiais).
 */
export async function uploadFile(
  bucket: "branding" | "contexto",
  userId: string,
  file: File,
): Promise<string> {
  const supabase = createClient();
  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw error;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

/** Atalho para imagens de branding. */
export const uploadBranding = (userId: string, file: File) =>
  uploadFile("branding", userId, file);
