"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LogOut, ShoppingCart, Settings, Globe, ChevronDown, Coins, Gift, House , ShoppingBag , ChartColumnStacked , ShoppingBasket, UserRoundKey  } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { signOut } from "next-auth/react";

interface NavActionsProps {
  locale: string;
  currency: string;
  session: any;
  user?: any;
}

export default function NavActions({ locale, currency, session, user }: NavActionsProps) {
  console.log("NavActions session:", session);
  const router = useRouter();
  const { cartCount } = useCart();
  const [currentAura, setCurrentAura] = useState<number>(session?.auraCoins ?? user?.auraCoins ?? 0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (session) {
      fetch("/api/user/profile")
        .then(res => res.json())
        .then(data => {
          if (data && data.auraCoins !== undefined) {
            setCurrentAura(data.auraCoins);
          }
        })
        .catch(err => console.error("Failed to sync aura coins:", err));
    }
  }, [session]);

  const clearCloseTimer = () => {
    if (dropdownTimerRef.current) {
      clearTimeout(dropdownTimerRef.current);
      dropdownTimerRef.current = null;
    }
  };

  const openDropdown = () => {
    clearCloseTimer();
    setIsDropdownOpen(true);
  };

  const closeDropdown = (delay = 300) => {
    clearCloseTimer();
    dropdownTimerRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, delay);
  };

  useEffect(() => {
    return () => clearCloseTimer();
  }, []);

const handleLogout = async () => {
  document.cookie =
    "rememberMe=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";

  document.cookie =
    "sessionMode=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";

  localStorage.removeItem("rememberMe");

  await signOut({ redirect: false });

  router.push(`/${locale}`);
  router.refresh();
};

  return (
    <div className="nav-actions">
      <Link href={`/${locale}/cart`} className="btn btn-secondary cart-btn">
        <ShoppingCart size={18} />
        Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
      </Link>

      {!session ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link href={`/${locale}/auth/login`} className="btn btn-tertiary" style={{ fontSize: '0.875rem' }}>Log In</Link>
          <Link href={`/${locale}/auth/signup`} className="btn btn-primary">Sign Up</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href={`/${locale}/referrals`} className="btn btn-secondary" style={{ fontSize: '0.8125rem', gap: '0.375rem' }}>
            <Gift size={16} /> Invite & Earn
          </Link>
          <div
            className="profile-menu"
            onMouseEnter={openDropdown}
            onMouseLeave={() => closeDropdown()}
          >
            <button
              type="button"
              className="profile-trigger"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="avatar-placeholder">
                <User size={16} />
              </div>
              <span className="profile-name">{user?.name || "Member"}</span>
              <ChevronDown size={14} className={`chevron-icon ${isDropdownOpen ? 'open' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div 
                className="profile-dropdown animate-scale-up"
                onMouseEnter={openDropdown}
                onMouseLeave={() => closeDropdown(100)}
              >
                <div className="dropdown-header">
                  <span className="user-email">{user?.email || session?.email}</span>
                  <div className="aura-coin-balance">
                    <span className="coin-icon-circle">
                      <Coins size={18} />
                    </span>
                    <span>{session?.auraCoins ?? user?.auraCoins ?? 0} Aura Coins</span>
                  </div>
                </div>
                
                <div className="dropdown-divider"></div>
                
                <Link href={`/${locale}/rewards`} className="dropdown-link">
                  <Coins size={14} /> Rewards Store
                </Link>
                <Link href={`/${locale}/referrals`} className="dropdown-link">
                  <User size={14} /> Refer & Earn
                </Link>
                <Link href={`/${locale}/orders`} className="dropdown-link">
                  <ShoppingCart size={14} /> Order History
                </Link>
                <Link href={`/${locale}/account/settings`} className="dropdown-link">
                  <Settings size={14} /> Account Settings
                </Link>
                <div className="dropdown-divider"></div>

{/* Tablet Menu */}
<Link href={`/${locale}`} className="dropdown-link tablet-only">
 <House size={14}/> Home
</Link>

<Link href={`/${locale}/shop`} className="dropdown-link tablet-only">
 <ShoppingBag size={14}/> Shop
</Link>

<Link href={`/${locale}/categories`} className="dropdown-link tablet-only">
 
 <ChartColumnStacked size={14} /> Categories
</Link>

<Link href={`/${locale}/orders`} className="dropdown-link tablet-only">
 <ShoppingBasket size={14} /> Orders
</Link>

{session?.role === "admin" && (
  <Link
    href="/admin"
    className="dropdown-link tablet-only"
  >
  <UserRoundKey size={14} />  Admin Dashboard
  </Link>
)}
                <button 
                  className="dropdown-link logout"
                  onClick={handleLogout}
                >
                  <LogOut size={14} /> Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
