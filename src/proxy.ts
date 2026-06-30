import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PRO_PROTECTED = [
  "/inicio",
  "/leads",
  "/agenda",
  "/config",
  "/funis",
  "/funil",
  "/planos",
  "/automacoes",
  "/conversas",
  "/onboarding",
];

function isProProtected(pathname: string) {
  return PRO_PROTECTED.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

/**
 * Next.js 16: `middleware` → `proxy` (runtime Node.js). Faz o refresh da sessão
 * Supabase (mantendo os cookies sincronizados) e protege as rotas.
 */
export async function proxy(req: NextRequest) {
  // Rotas de auth (callback OAuth, signout) gerenciam os cookies por conta
  // própria — o proxy não deve refazer a sessão aqui.
  if (req.nextUrl.pathname.startsWith("/auth")) {
    return NextResponse.next({ request: req });
  }

  let res = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANTE: getUser() revalida o token e dispara o refresh dos cookies.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = req.nextUrl;

  // Raiz: logado vai pro app; visitante vê a landing page pública.
  if (pathname === "/" && user) {
    return NextResponse.redirect(new URL("/inicio", req.url));
  }

  if (pathname === "/entrar" && user) {
    return NextResponse.redirect(new URL("/inicio", req.url));
  }

  if (isProProtected(pathname) && !user) {
    return NextResponse.redirect(new URL("/entrar", req.url));
  }

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/entrar") {
      // Já logado E interno → vai pro painel; senão fica no login.
      if (user) {
        const { data: interno } = await supabase.rpc("is_internal");
        if (interno) return NextResponse.redirect(new URL("/admin", req.url));
      }
      return res;
    }
    // Demais rotas admin exigem sessão E papel interno (is_internal()).
    if (!user) {
      return NextResponse.redirect(new URL("/admin/entrar", req.url));
    }
    const { data: interno } = await supabase.rpc("is_internal");
    if (!interno) {
      return NextResponse.redirect(new URL("/admin/entrar", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next|favicon\\.ico|api/|.*\\.).*)"],
};
