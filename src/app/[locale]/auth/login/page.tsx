"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Logo from "../../../../../public/images/CE_Logo.png";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useParams() as { locale: string };
const [rememberMe, setRememberMe] = useState(false);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
const result = await signIn("credentials", {
  email,
  password,
  rememberMe,
  redirect: false,
});

if (!result?.error) {
  localStorage.setItem(
    "rememberMe",
    rememberMe ? "true" : "false"
  );

  document.cookie = `rememberMe=${rememberMe}; path=/`;

  if (!rememberMe) {
    document.cookie =
      "sessionMode=temp; path=/";
  } else {
    document.cookie =
      "sessionMode=persistent; path=/";
  }
}
if (rememberMe) {
  localStorage.setItem("rememberMe", "true");
} else {
  localStorage.removeItem("rememberMe");
  sessionStorage.setItem("temp-session", "true");
}
      if (result?.error) {
        throw new Error("Credential mismatch or unrecognized identity.");
      }

      const redirectTo = searchParams.get("redirect");
      const target = redirectTo && redirectTo.startsWith("/")
        ? redirectTo
        : `/${locale}`;
        
      router.push(target);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-in">
        <div className="auth-header">
          <Link href={`/${locale}`} className="logo_login" style={{ marginBottom: '.5rem', display: 'block' }}>
          <Image src={Logo} alt="CapaciousEmporium" width={80} height={80} />
            {/* KODA<span className="logo-accent">STORE</span> */}
          </Link>
          <h1 className="auth-title">Welcome back.</h1>
          <p className="auth-subtitle">Continue your journey with the Digital Curator.</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
                      <div
  style={{
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "0.5rem",
  }}
>
  <Link
    href={`/${locale}/auth/forgot-password`}
    style={{
      fontSize: "0.875rem",
      color: "var(--primary)",
      textDecoration: "none",
    }}
  >
    Forgot Password?
  </Link>
</div>
          </div>

<div className="remember-me">
  <input
    type="checkbox"
    id="rememberMe"
    checked={rememberMe}
    onChange={(e) => setRememberMe(e.target.checked)}
  />
  

  <label htmlFor="rememberMe">
    Remember Me
  </label>
</div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don&apos;t have an account? <Link href={`/${locale}/auth/signup`}>Create one</Link></p>
        </div>
      </div>
    </div>
  );
}
