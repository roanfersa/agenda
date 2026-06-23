"use client";

import { createClient } from "@/lib/supabase/client";

/**
 * Faz upload de uma imagem de branding (logo/avatar/fundo) pro Storage e
 * retorna a URL pública. Os arquivos vão pra pasta do próprio usuário (uid),
 * conforme as policies do bucket "branding".
 */
export async function uploadBranding(userId: string, file: File): Promise<string> {
  const supabase = createClient();
  const ext = (file.name.split(".").pop() || "png").toLowerCase();
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("branding")
    .upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw error;
  return supabase.storage.from("branding").getPublicUrl(path).data.publicUrl;
}
