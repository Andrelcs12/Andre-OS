import { cookies } from "next/headers";

import { getApiUrl } from "./api-client";

export async function serverApiFetch(path: string) {
  const cookieStore = await cookies();
  return fetch(`${getApiUrl()}${path}`, {
    headers: { Cookie: cookieStore.toString(), Accept: "application/json" },
    cache: "no-store",
  });
}
