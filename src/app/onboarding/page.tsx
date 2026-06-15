"use client";

import { Suspense, use } from "react";
import { useRouter } from "next/navigation";
import { LadoAOnboarding } from "@/components/LadoAOnboarding";
import { ToastHost } from "@/components/ui";

export default function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ novo?: string }>;
}) {
  return (
    <Suspense>
      <OnboardingInner searchParams={searchParams} />
    </Suspense>
  );
}

function OnboardingInner({
  searchParams,
}: {
  searchParams: Promise<{ novo?: string }>;
}) {
  const router = useRouter();
  const { novo } = use(searchParams);
  const isNovo = novo === "1";
  return (
    <>
      <LadoAOnboarding
        mode={isNovo ? "novo" : "editar"}
        onDone={() => router.push(isNovo ? "/funis" : "/inicio")}
        onExit={() => router.push(isNovo ? "/funis" : "/entrar")}
      />
      <ToastHost />
    </>
  );
}
