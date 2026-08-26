"use server";

import { redirect } from "next/navigation";

import { signOutCurrentUser } from "@/services/auth.service";

export async function signOut() {
  await signOutCurrentUser();
  redirect("/login");
}
