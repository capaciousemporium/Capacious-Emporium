import type { Metadata } from "next";
import Link from "next/link";
import NavActions from "@/components/NavActions";
import AIChatCard from "@/components/AIChatCard";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import MaintenanceChecker from "@/components/MaintenanceChecker";
import "./globals.css";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { CartProvider } from "@/context/CartContext";
import SearchBar from "@/components/SearchBar";
import { prisma } from "@/lib/prisma";
import { AuthProvider } from "@/components/providers/AuthProvider";
import Image from "next/image";
import Logo1 from "../../public/images/Logo.png"
import Logo2 from "../../public/images/Hadder.webp"
import MobileMenu from "@/components/MobileMenu";
import SessionManager from "@/components/SessionManager";
import SessionGuard from "@/components/SessionGuard";
import { Session } from "inspector/promises";
export const metadata: Metadata = {
  title: "Capacious Emporium | The Editorial Marketplace",
  description: "A curated, high-end e-commerce experience. Discover products presented with editorial precision.",
};
<meta name="apple-mobile-web-app-title" content="Capacious-Emporium" />
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const session = await getSession();
  console.log(session?.rememberMe);
  
  let extendedSession = null;

  if ( session?.userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { auraCoins: true },
      });
      extendedSession = { ...session, auraCoins: user?.auraCoins || 0 };
    } catch {}
  }
  const head = await headers();
  const locale = head.get("x-detected-locale") || "en-IN";
  const currency = head.get("x-detected-currency") || "USD";
  const isAdmin = session?.role === "admin";
  const isSupport = session?.role === "support";

  let maintenanceMode = false;
  let maintenanceMessage = "";
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "global" },
      select: { maintenanceMode: true, maintenanceMessage: true },
    });
    maintenanceMode = settings?.maintenanceMode || false;
    maintenanceMessage = settings?.maintenanceMessage || "We're currently performing maintenance. Please check back shortly.";
  } catch {
  }

  const isMaintenancePage = maintenanceMode && !isAdmin && !isSupport;

  if (isMaintenancePage) {
    return (
      <html lang={locale}>
        <body>
          <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface-container)", padding: "2rem" }}>
            <div style={{ textAlign: "center", maxWidth: "480px" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1.5rem" }}>🔧</div>
              <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Under Maintenance</h1>
              <p style={{ color: "var(--on-surface-variant)", fontSize: "1rem", lineHeight: "1.6", marginBottom: "2rem" }}>
                {maintenanceMessage}
              </p>
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang={locale}>
      <body>
        <AuthProvider>
          <SessionManager />
            <SessionGuard />
          <CartProvider>
            <AnnouncementBanner />
            <header className="glass-nav">
              <div className="container nav-inner">
                <Link href={`/${locale}`} className="logo">

  {/* Desktop Logo */}
  <Image
    src={Logo1}
    alt="Capacious Emporium Logo"
    width={100}
    height={100}
    className="logo-image desktop-logo"
  />

  {/* Mobile Logo */}
<Image
  src={Logo2}
  alt="Mobile Logo"
  width={200}
  height={160}
  className="mobile-logo"
/>


</Link>

                <nav className="nav-links">
                  <Link href={`/${locale}`} className="nav-link">Home</Link>
                  <Link href={`/${locale}/products`} className="nav-link">Shop</Link>
                  <Link href={`/${locale}/categories`} className="nav-link">Categories</Link>
                  <Link href={`/${locale}/orders`} className="nav-link">Orders</Link>
                  {(isAdmin || isSupport) && (
                    <Link href={isSupport ? "/admin/support" : "/admin"} className="nav-link nav-link-admin">
                      {isSupport ? "Support Panel" : "Admin Dashboard"}
                    </Link>
                  )}
                </nav>
<div
  className="desktop-search"
  style={{
    flex: 1,
    justifyContent: "center",
    margin: "0 2rem",
  }}
>
  <SearchBar />
</div>

<div className="desktop-actions">
  <NavActions
    session={extendedSession as any}
    locale={locale}
    currency={currency}
  />
</div>

<MobileMenu
  locale={locale}
  session={extendedSession as any}
  currency={currency}
/>
              </div>
            </header>

            <main className="main-content">
              {children}
            </main>

            <AIChatCard />
            <MaintenanceChecker />

            <footer className="site-footer">
              <div className="container">
                <div className="footer-grid">
                  <div className="footer-col">
                    <h4 className="footer-heading">Capacious<span className="logo-accent">Emporium</span></h4>
                    <p className="footer-text">A curated marketplace built on the philosophy of The Digital Curator. We present, not just list.</p>
                  </div>
                  <div className="footer-col">
                    <h4 className="footer-heading">Quick Links</h4>
                    <Link href={`/${locale}/products`} className="footer-link">Shop All</Link>
                    <Link href={`/${locale}/categories`} className="footer-link">Categories</Link>
                    <Link href={`/${locale}/orders`} className="footer-link">My Orders</Link>
                  </div>
                  <div className="footer-col">
                    <h4 className="footer-heading">Support</h4>
                    <Link href="#" className="footer-link">Contact Us</Link>
                    <Link href="#" className="footer-link">Shipping Info</Link>
                    <Link href="#" className="footer-link">Returns</Link>
                  </div>
                  <div className="footer-col">
                    <h4 className="footer-heading">Legal</h4>
                    <Link href="#" className="footer-link">Privacy Policy</Link>
                    <Link href="#" className="footer-link">Terms of Service</Link>
                  </div>
                </div>
                <div className="footer-bottom">
                  <p>&copy; 2026 Capacious Emporium. Built with The Digital Curator design philosophy.</p>
                </div>
              </div>
            </footer>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
