import type { NextRequest } from "next/server";
import { ok, withUser } from "@/lib/labs/store/http";
import { Bad } from "@/lib/labs/store/validate";
import { adminEmails } from "@/lib/labs/ai/config";
import { usage } from "@/lib/labs/ai/jobs";

/** Spending totals for the owner's admin use. Limited to AI_ADMIN_EMAILS when that is set. */
export async function GET(request: NextRequest) {
  return withUser(request, async (user) => {
    const admins = adminEmails();
    if (admins.length && !admins.includes(user.email.toLowerCase())) throw new Bad("forbidden", "That is not open to you.", 403);
    return ok(await usage(user.email));
  });
}
