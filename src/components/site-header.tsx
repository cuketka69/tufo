import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Search, User, ShoppingBag, ChevronDown } from "lucide-react";

import whiteLogo from "@/assets/wlogo.webp";
import blackLogo from "@/assets/blogo.webp";
import silniceImg from "@/assets/silnice.webp";
import gravelImg from "@/assets/gravel.webp";
import mtbImg from "@/assets/mtb.webp";
import cyklokrosImg from "@/assets/cyklokros.webp";
import triatlonImg from "@/assets/triatlon.webp";
import drahaImg from "@/assets/draha.webp";
import { useCart } from "@/lib/cart";
import { CartDrawer } from "@/components/cart-drawer";

const NAV = [
  { label: "Pneu", hash: "shop", dropdown: true },
  { label: "Příslušenství", hash: "shop" },
  { label: "Technologie", hash: "story" },
  { label: "Distributoři", hash: "shop" },
  { label: "Kontakt", hash: "footer" },
];

const CATEGORIES = [
  { name: "Silnice", img: silniceImg },
  { name: "Gravel", img: gravelImg },
  { name: "MTB", img: mtbImg },
  { name: "Cyklokros", img: cyklokrosImg },
  { name: "Triatlon", img: triatlonImg },
  { name: "Dráha", img: drahaImg },
];

const navLinkClass =
  "relative after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 after:content-[''] hover:after:scale-x-100";

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
            {NAV.map((item, i) =>
              item.dropdown ? (
                <NavDropdown key={i} label={item.label} />
              ) : (
                <Link key={i} to="/" hash={item.hash} className={navLinkClass}>
                  {item.label}
                </Link>
              ),
            )}
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

function NavDropdown({ label }: { label: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link to="/" hash="shop" className={`${navLinkClass} inline-flex items-center gap-1`}>
        {label}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </Link>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-5"
          >
            <div className="w-[460px] rounded-2xl border border-black/5 bg-white p-3 text-[var(--ink)] shadow-2xl">
              <p className="px-2 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Kategorie
              </p>
              <div className="grid grid-cols-2 gap-1">
                {CATEGORIES.map((c) => (
                  <Link
                    key={c.name}
                    to="/produkty"
                    className="group/item flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-[var(--cream)]"
                  >
                    <img
                      src={c.img}
                      alt=""
                      className="h-12 w-12 rounded-lg object-cover"
                      loading="lazy"
                    />
                    <span className="text-sm font-semibold transition-colors group-hover/item:text-[var(--orange-deep)]">
                      {c.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
