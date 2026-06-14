import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";

import productTire from "@/assets/product-tire.jpg";
import { useShopProducts } from "@/lib/shop";
import { formatPrice } from "@/lib/format";

/** Rozbalovací vyhledávání přímo u ikony lupy v headeru. */
export function HeaderSearch() {
  const { products } = useShopProducts();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  // zavřít při kliknutí mimo
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    if (open) {
      document.addEventListener("mousedown", onDown);
      document.addEventListener("keydown", onKey);
    }
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return products
      .filter((p) => p.name.toLowerCase().includes(s) || p.type.toLowerCase().includes(s))
      .slice(0, 6);
  }, [q, products]);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-label="Hledat" className="hover:opacity-70">
        <Search className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 top-full z-[60] mt-3 w-[360px] max-w-[90vw] overflow-hidden rounded-2xl border border-black/5 bg-white text-[var(--ink)] shadow-2xl"
          >
            <div className="flex items-center gap-2.5 border-b px-4 py-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Hledat produkty…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>

            {q.trim() !== "" && (
              <div className="max-h-[55vh] overflow-y-auto p-1.5">
                {results.length === 0 ? (
                  <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                    Nic nenalezeno.
                  </p>
                ) : (
                  results.map((p) => (
                    <Link
                      key={p.id}
                      to="/produkt/$id"
                      params={{ id: String(p.id) }}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-[var(--cream)]"
                    >
                      <img
                        src={p.image || productTire}
                        alt=""
                        className="h-11 w-11 shrink-0 rounded-lg bg-[var(--cream)] object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{p.name}</p>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          {p.type}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-bold">{formatPrice(p.price)}</span>
                    </Link>
                  ))
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
