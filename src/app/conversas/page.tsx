"use client";

import { AppLayout } from "@/components/AppLayout";
import { ConversasScreen } from "@/components/ConversasScreen";

export default function ConversasPage() {
  return (
    <AppLayout screen="conversas" title="Conversas" sub="Assuma a conversa e responda suas DMs do Instagram">
      <ConversasScreen />
    </AppLayout>
  );
}
