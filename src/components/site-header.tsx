import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, User, ShoppingBag } from "lucide-react";

import whiteLogo from "@/assets/wlogo.webp";
import blackLogo from "@/assets/blogo.webp";
import { useCart } from "@/lib/cart";
import { CartDrawer } from "@/components/cart-drawer";

const NAV = [
  { label: "Pneu", hash: "shop" },
  { label: "Příslušenství", hash: "shop" },
  { label: "Technologie", hash: "story" },
  { label: "Distributoři", hash: "shop" },
  { label: "Kontakt", hash: "footer" },
];

/**
 * Hlavní header webu. `solid` = vždy světlá varianta (pro stránky bez hero,
 * např. /produkty). Bez `solid` se chová jako na úvodce (průhledný nahoře,
 * po odscrollování světlý).
 */
export function SiteHeader({ solid = false }: { solid?: boolean }) {
  const { count, isOpen, openCart, closeCart } = useCart();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (solid) return;
    const f = () => setScrolled(window.scrollY > 30);
    f();
    window.addEventListener("scroll", f);
    return () => window.removeEventListener("scroll", f);
  }, [solid]);

  const light = solid || scrolled;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          light ? "bg-[var(--cream)]/90 backdrop-blur-md shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <nav
            className={`hidden md:flex gap-7 text-[11px] font-semibold tracking-[0.18em] uppercase ${
              light ? "text-[var(--ink)]" : "text-white"
            }`}
          >
            {NAV.map((item, i) => (
              <Link
                key={i}
                to="/"
                hash={item.hash}
                className="relative after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 after:content-[''] hover:after:scale-x-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link to="/" className="flex items-center" aria-label="TUFO">
            <img
              src={light ? blackLogo : whiteLogo}
              alt="TUFO"
              className="h-8 w-auto"
              width={120}
              height={48}
            />
          </Link>
          <div className={`flex items-center gap-5 ${light ? "text-[var(--ink)]" : "text-white"}`}>
            <Search className="w-5 h-5 cursor-pointer hover:opacity-70" />
            <User className="w-5 h-5 cursor-pointer hover:opacity-70" />
            <button onClick={openCart} className="relative" aria-label="Košík">
              <ShoppingBag className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-[var(--ink)] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
      <CartDrawer open={isOpen} onClose={closeCart} />
    </>
  );
}
