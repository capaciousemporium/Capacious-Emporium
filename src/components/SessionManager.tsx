"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function SessionManager() {
  useEffect(() => {
    const rememberMe = localStorage.getItem("rememberMe");

    if (rememberMe !== "true") {
      signOut({ redirect: false });
    }
  }, []);

  return null;
}