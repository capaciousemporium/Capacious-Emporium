"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const token = params.get("token");
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMsg("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            password,
          }),
        }
      );

      const data = await res.json();
      setMsg(data.message);
    } catch {
      setMsg("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-in">
        <div className="auth-header">
          <h1 className="auth-title">
            Reset Password
          </h1>

          <p className="auth-subtitle">
            Create a new password for your
            account.
          </p>
        </div>

        {msg && (
          <div
            style={{
              padding: "12px",
              borderRadius: "10px",
              marginBottom: "1rem",
              background:
                msg.toLowerCase().includes("success")
                  ? "rgba(25,135,84,.1)"
                  : "rgba(220,53,69,.1)",
              border:
                msg.toLowerCase().includes("success")
                  ? "1px solid rgba(25,135,84,.25)"
                  : "1px solid rgba(220,53,69,.25)",
              color:
                msg.toLowerCase().includes("success")
                  ? "#22c55e"
                  : "#ef4444",
            }}
          >
            {msg}
          </div>
        )}

        <form
          className="auth-form"
          onSubmit={submit}
        >
          <div className="form-group">
  <label htmlFor="password">
    New Password
  </label>

  <div style={{ position: "relative" }}>
    <Lock
      size={16}
      style={{
        position: "absolute",
        left: "1rem",
        top: "1rem",
        color: "var(--on-surface-variant)",
      }}
    />

    <input
      id="password"
      type={showPassword ? "text" : "password"}
      placeholder="••••••••"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
      style={{
        paddingLeft: "2.75rem",
        paddingRight: "3rem",
      }}
    />

    <button
      type="button"
      onClick={() =>
        setShowPassword(!showPassword)
      }
      style={{
        position: "absolute",
        right: "1rem",
        top: "50%",
        transform: "translateY(-50%)",
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "var(--on-surface-variant)",
      }}
    >
      {showPassword ? (
        <EyeOff size={18} />
      ) : (
        <Eye size={18} />
      )}
    </button>
  </div>
</div>

         <div className="form-group">
  <label htmlFor="confirmPassword">
    Confirm Password
  </label>

  <div style={{ position: "relative" }}>
    <Lock
      size={16}
      style={{
        position: "absolute",
        left: "1rem",
        top: "1rem",
        color: "var(--on-surface-variant)",
      }}
    />

    <input
      id="confirmPassword"
      type={
        showConfirmPassword
          ? "text"
          : "password"
      }
      placeholder="••••••••"
      value={confirmPassword}
      onChange={(e) =>
        setConfirmPassword(e.target.value)
      }
      required
      style={{
        paddingLeft: "2.75rem",
        paddingRight: "3rem",
      }}
    />

    <button
      type="button"
      onClick={() =>
        setShowConfirmPassword(
          !showConfirmPassword
        )
      }
      style={{
        position: "absolute",
        right: "1rem",
        top: "50%",
        transform: "translateY(-50%)",
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "var(--on-surface-variant)",
      }}
    >
      {showConfirmPassword ? (
        <EyeOff size={18} />
      ) : (
        <Eye size={18} />
      )}
    </button>
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
              ? "Saving..."
              : "Save Password"}
          </button>
        </form>
      </div>
    </div>
  );
}