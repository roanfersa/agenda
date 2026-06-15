"use client";

import * as React from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import { LeadDetail } from "@/components/LadoA";
import { AppLayout } from "@/components/AppLayout";
import { useStore } from "@/lib/store";

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const lead = useStore((s) => s.leads.find((l) => l.id === id));
  const markLeadRead = useStore((s) => s.markLeadRead);
  React.useEffect(() => {
    if (lead?._novo) markLeadRead(id);
  }, [id, lead?._novo, markLeadRead]);
  return (
    <AppLayout screen="leads" title="Lead" onBack={() => router.push("/leads")}>
      <LeadDetail lead={lead} go={(s) => router.push(`/${s}`)} />
    </AppLayout>
  );
}
