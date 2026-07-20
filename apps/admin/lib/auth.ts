import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_VALUE,
} from "@/lib/auth-constants";

export {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_VALUE,
} from "@/lib/auth-constants";

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || "admin123";
}

export async function isAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  return jar.get(ADMIN_SESSION_COOKIE)?.value === ADMIN_SESSION_VALUE;
}
