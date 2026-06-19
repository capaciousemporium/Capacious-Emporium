"use client";

import { useState } from "react";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import NavActions from "@/components/NavActions";
import { UserRoundKey } from "lucide-react";
interface Props {
  locale: string;
  session: any;
  currency: string;
}

export default function MobileMenu({
  locale,
  session,
  currency,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="mobile-menu-btn"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

     {open && (
  <>
    <div
      className="mobile-menu-overlay"
      onClick={() => setOpen(false)}
    />

    <div className="mobile-menu">
      <button
        className="mobile-close-btn"
        onClick={() => setOpen(false)}
      >
        ✕
      </button>

      <div className="mobile-menu-header">
        {session ? (
          <>
            <div className="mobile-avatar">
              {(session?.name || "M")[0]}
            </div>

            <div>
              <h4>{session?.name || "Member"}</h4>
              <p>{session?.email}</p>
            </div>
          </>
        ) : (
          <div className="guest-box">
            <h4>Welcome Guest</h4>
            <p>Login to access your account</p>
          </div>
        )}
      </div>

      <div className="mobile-search">
        <SearchBar />
      </div>

      <div className="mobile-actions">
        <NavActions
          session={session}
          locale={locale}
          currency={currency}
        />
      </div>

      <div className="mobile-divider" />

      <nav className="mobile-nav-links">
        <Link href={`/${locale}`} onClick={() => setOpen(false)}>
          Home
        </Link>

        <Link
          href={`/${locale}/products`}
          onClick={() => setOpen(false)}
        >
          Shop
        </Link>

        <Link
          href={`/${locale}/categories`}
          onClick={() => setOpen(false)}
        >
          Categories
        </Link>

        <Link
          href={`/${locale}/orders`}
          onClick={() => setOpen(false)}
        >
          Orders
        </Link>

        {session?.role === "admin" && (
          <Link
            href="/admin"
            onClick={() => setOpen(false)}
          >
            Admin Dashboard
          </Link>
        )}
      </nav>
    </div>
  </>
)}
    </>
  );
}