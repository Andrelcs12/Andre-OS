import { redirect } from "next/navigation";

import { getLocalDevSession } from "@/lib/auth/local-session";

export default async function Home() {
  const session = await getLocalDevSession();
  redirect(session ? "/today" : "/login");
}
