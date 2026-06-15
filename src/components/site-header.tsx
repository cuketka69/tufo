import { useEffect, useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import { User, ShoppingBag, ChevronDown, LogOut } from "lucide-react";

import whiteLogo from "@/assets/wlogo.webp";
import blackLogo from "@/assets/blogo.webp";
import { useCart } from "@/lib/cart";
import { CartDrawer } from "@/components/cart-drawer";
import { HeaderSearch } from "@/components/header-search";
import { getCurrentUser, logout } from "@/lib/api/auth.functions";
import { PNEU_SECTION, PRISLUSENSTVI_SECTION, categoryFallbackColor, type TaxSection } from "@/lib/taxonomy";

const NAV = [
  { label: "Technologie", hash: "story" },
  { label: "Distributoři", hash: "shop" },
  { label: "Kontakt", hash: "footer" },
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
  const router = useRouter();
  const { data: user } = useQuery({ queryKey: ["auth", "me"], queryFn: () => getCurrentUser() });
  const logoutMut = useMutation({
    mutationFn: () => logout(),
    onSuccess: async () => {
      try {
        sessionStorage.removeItem("tufo-tab-auth");
      } catch {
        /* ignore */
      }
      await router.invalidate();
      router.navigate({ to: "/prihlaseni" });
    },
  });

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
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
          light ? "bg-[var(--cream)]/90 backdrop-blur-md shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <nav
            className={`hidden md:flex gap-7 text-[11px] font-semibold tracking-[0.18em] uppercase ${
              light ? "text-[var(--ink)]" : "text-white"
            }`}
          >
            <NavDropdown section={PNEU_SECTION} />
            <NavDropdown section={PRISLUSENSTVI_SECTION} />
            {NAV.map((item, i) => (
              <Link key={i} to="/" hash={item.hash} className={navLinkClass}>
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
            <HeaderSearch />
            {user ? (
              <button
                onClick={() => logoutMut.mutate()}
                aria-label="Odhlásit se"
                title={`Odhlásit (${user.email})`}
                className="hover:opacity-70"
              >
                <LogOut className="w-5 h-5" />
              </button>
            ) : (
              <Link to="/prihlaseni" aria-label="Přihlášení" className="hover:opacity-70">
                <User className="w-5 h-5" />
              </Link>
            )}
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
      </motion.header>
      <CartDrawer open={isOpen} onClose={closeCart} />
    </>
  );
}

function NavDropdown({ section }: { section: TaxSection }) {
  const [open, setOpen] = useState(false);
  const cols = Math.min(section.categories.length, 4);

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <Link
        to="/produkty"
        search={{ sekce: section.key }}
        className={`${navLinkClass} inline-flex items-center gap-1`}
      >
        {section.label}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </Link>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            style={{ transformOrigin: "top left" }}
            className="absolute left-0 top-full z-50 pt-5"
          >
            <div className="max-w-[92vw] rounded-2xl border border-black/5 bg-white p-4 text-[var(--ink)] shadow-2xl">
              <p className="px-1 pb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                {section.label}
              </p>
              <div
                className="grid gap-3"
                style={{ gridTemplateColumns: `repeat(${cols}, 8rem)` }}
              >
                {section.categories.map((c) => (
                  <Link
                    key={c.slug}
                    to="/produkty"
                    search={{ sekce: section.key, kategorie: c.name }}
                    className="group/item flex flex-col items-center gap-2 rounded-xl p-2 transition-colors hover:bg-[var(--cream)]"
                  >
                    {c.img ? (
                      <img
                        src={c.img}
                        alt=""
                        className="aspect-square w-full rounded-xl object-cover transition-transform duration-300 group-hover/item:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <span
                        className="flex aspect-square w-full items-center justify-center rounded-xl font-display text-3xl text-white transition-transform duration-300 group-hover/item:scale-105"
                        style={{ backgroundColor: categoryFallbackColor(c.name) }}
                      >
                        {c.name.charAt(0)}
                      </span>
                    )}
                    <span className="text-center text-xs font-semibold leading-tight transition-colors group-hover/item:text-[var(--orange-deep)]">
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
