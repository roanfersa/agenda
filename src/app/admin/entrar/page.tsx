"use client";

import { useRouter } from "next/navigation";
import { AdminLogin } from "@/components/LadoC";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const handleLogin = async (email: string, senha: string) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) {
      alert("Não foi possível entrar: " + error.message);
      return;
    }
    // O acesso ao /admin é validado server-side por is_internal().
    router.push("/admin");
  };
  return <AdminLogin onLogin={handleLogin} />;
}
