"use client";

import { useRouter } from "next/navigation";
import { LeadsScreen } from "@/components/LadoA";
import { AppLayout } from "@/components/AppLayout";
import { useStore } from "@/lib/store";

export default function LeadsPage() {
  const router = useRouter();
  const leads = useStore((s) => s.leads);
  return (
    <AppLayout screen="leads" title="Leads" sub={`${leads.length} no total`}>
      <LeadsScreen openLead={(id) => router.push(`/leads/${id}`)} />
    </AppLayout>
  );
}
