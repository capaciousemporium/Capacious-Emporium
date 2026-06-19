/**
 * NextAuth server-side session wrapper.
 */
import { auth } from "@/auth";

export const SESSION_COOKIE_NAME = "authjs.session-token";

export interface SessionPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
  rememberMe?: boolean;
}

export async function getSession() {
  const session = await auth();
console.log("Session retrieved:", session);
  if (!session?.user) return null;

  return {
    userId: (session.user as any).id,
    email: session.user.email || "",
    role: (session.user as any).role || "customer",
    name: session.user.name || "",
    rememberMe: (session.user as any).rememberMe || false,
  } as SessionPayload;
}