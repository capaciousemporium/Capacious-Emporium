"use client";

import { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";

export default function SessionGuard() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") return;

   const rememberMe = (session?.user as any)?.rememberMe;

    // Browser reopen hole sessionStorage empty thakbe
    const tempSession = sessionStorage.getItem("temp-session");

    if (rememberMe === false && !tempSession) {
      signOut({ redirect: false });
    }
  }, [session, status]);

  return null;
}