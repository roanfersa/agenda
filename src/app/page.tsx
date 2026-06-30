import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { LandingPage } from "@/components/LandingPage";

export const metadata = {
  title: "Revo — Transforme comentários e DMs do Instagram em clientes",
  description:
    "O Revo cria sua página de bio-link, responde automaticamente quem comenta nos seus posts no Instagram e conduz a conversa até virar um lead qualificado.",
};

export default async function Root() {
  const jar = await cookies();
  if (jar.has("agendai_session")) redirect("/inicio");
  return <LandingPage />;
}
