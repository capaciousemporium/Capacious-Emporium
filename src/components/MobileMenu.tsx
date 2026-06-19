"use client";

import { useState } from "react";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import NavActions from "@/components/NavActions";

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
        <div className="mobile-menu">
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
          </nav>
        </div>
      )}
    </>
  );
}