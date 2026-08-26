import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/services/profile.service";

export const dynamic = "force-dynamic";

export default async function Home() {
  redirect((await getCurrentProfile()) ? "/today" : "/login");
}
