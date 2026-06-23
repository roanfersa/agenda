import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractMaterial } from "@/lib/ai/extract";
import { hasFeature } from "@/lib/features";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { data: prof } = await supabase
    .from("professionals")
    .select("plano, feature_flags")
    .eq("id", user.id)
    .single();
  if (!prof || !hasFeature({ plano: prof.plano, featureFlags: prof.feature_flags ?? {} }, "gerar_ia")) {
    return NextResponse.json({ error: "Recurso não habilitado no seu plano." }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    tipo?: "arquivo" | "texto" | "link";
    url?: string;
    mime?: string;
    titulo?: string;
    descricao?: string;
  };

  try {
    const conteudo = await extractMaterial({
      tipo: body.tipo ?? "arquivo",
      url: body.url,
      mime: body.mime,
      titulo: body.titulo,
      descricao: body.descricao,
    });
    return NextResponse.json({ conteudo });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "falha na leitura" },
      { status: 502 },
    );
  }
}
