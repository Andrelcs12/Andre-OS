import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/services/profile.service";

export default async function Home() {
  redirect((await getCurrentProfile()) ? "/today" : "/login");
}
