import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Root() {
  const jar = await cookies();
  redirect(jar.has("agendai_session") ? "/inicio" : "/entrar");
}
