import { isAuthenticated } from "@/lib/auth";

export class AdminAuthError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "AdminAuthError";
  }
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAuthenticated())) {
    throw new AdminAuthError();
  }
}
