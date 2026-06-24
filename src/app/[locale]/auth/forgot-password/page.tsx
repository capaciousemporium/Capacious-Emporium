"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const { locale } = useParams() as {
    locale: string;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setMsg("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      setMsg(
        data.message || "Reset link sent successfully."
      );
    } catch (error) {
      setMsg("Unable to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-in">
        <div className="auth-header">
          <h1 className="auth-title">
            Forgot Password
          </h1>

          <p className="auth-subtitle">
            Enter your registered email address and
            we'll send you a password reset link.
          </p>
        </div>

        {msg && (
          <div
            style={{
              padding: "12px",
              borderRadius: "10px",
              marginBottom: "1rem",
              background: "rgba(25,135,84,.1)",
              border: "1px solid rgba(25,135,84,.25)",
              color: "#22c55e",
              fontSize: ".9rem",
            }}
          >
            {msg}
          </div>
        )}

        <form className="auth-form" onSubmit={submit}>
          <div className="form-group">
            <label htmlFor="email">
              Registered Email
            </label>

            <div style={{ position: "relative" }}>
              <Mail
                size={16}
                style={{
                  position: "absolute",
                  left: "1rem",
                  top: "1rem",
                  color:
                    "var(--on-surface-variant)",
                }}
              />

              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
                style={{
                  paddingLeft: "2.75rem",
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{
              width: "100%",
              marginTop: "1rem",
            }}
          >
            {loading
              ? "Sending..."
              : "Send Reset Link"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Remember your password?{" "}
            <Link href={`/${locale}/auth/login`}>
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}