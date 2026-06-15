"use client";

import { useRouter } from "next/navigation";
import { LoginScreen } from "@/components/LadoA";
import { ToastHost } from "@/components/ui";
import { useHasHydrated } from "@/hooks/useHasHydrated";

export default function EntrarPage() {
  const router = useRouter();
  const hydrated = useHasHydrated();
  if (!hydrated) return null;
  return (
    <>
      <LoginScreen onLogin={() => router.push("/inicio")} onSignup={() => router.push("/onboarding")} />
      <ToastHost />
    </>
  );
}
