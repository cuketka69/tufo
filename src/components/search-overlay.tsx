import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";

import productTire from "@/assets/product-tire.jpg";
import { useShopProducts } from "@/lib/shop";
import { formatPrice } from "@/lib/format";

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { products } = useShopProducts();
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return products
      .filter((p) => p.name.toLowerCase().includes(s) || p.type.toLowerCase().includes(s))
      .slice(0, 8);
  }, [q, products]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ type: "spring", damping: 26, stiffness: 240 }}
            className="fixed left-1/2 top-20 z-[110] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 overflow-hidden rounded-3xl bg-white text-[var(--ink)] shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b px-5 py-4">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Hledat produkty…"
                className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
              />
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5"
                aria-label="Zavřít"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {q.trim() === "" ? (
                <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                  Začněte psát název produktu…
                </p>
              ) : results.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                  Nic nenalezeno pro „{q}".
                </p>
              ) : (
                results.map((p) => (
                  <Link
                    key={p.id}
                    to="/produkt/$id"
                    params={{ id: String(p.id) }}
                    onClick={onClose}
                    className="flex items-center gap-4 rounded-xl p-2.5 transition-colors hover:bg-[var(--cream)]"
                  >
                    <img
                      src={p.image || productTire}
                      alt=""
                      className="h-14 w-14 shrink-0 rounded-lg object-cover bg-[var(--cream)]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{p.name}</p>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">{p.type}</p>
                    </div>
                    <span className="shrink-0 font-bold">{formatPrice(p.price)}</span>
                  </Link>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
