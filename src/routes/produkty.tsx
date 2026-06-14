import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence } from "framer-motion";
import { ArrowLeft, Search } from "lucide-react";
import { toast } from "sonner";

import { Toaster } from "@/components/ui/sonner";
import { ProductCard } from "@/components/product-card";
import { SiteHeader } from "@/components/site-header";
import { useShopProducts } from "@/lib/shop";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/eshop-types";

export const Route = createFileRoute("/produkty")({
  head: () => ({
    meta: [
      { title: "Všechny produkty — TUFO" },
      { name: "description", content: "Kompletní nabídka cyklistických plášťů a galusek TUFO." },
    ],
  }),
  component: ProductsPage,
});

const FILTERS = ["Vše", "Galusky", "Plášťovky", "Pláště", "Bezdušové TR", "Příslušenství"] as const;

function ProductsPage() {
  const navigate = useNavigate();
  const { products, isLoading } = useShopProducts();
  const { addToCart } = useCart();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Vše");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = filter === "Vše" ? products : products.filter((p) => p.type === filter);
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q));
    return list;
  }, [products, filter, search]);

  const openProduct = (p: Product) =>
    navigate({ to: "/produkt/$id", params: { id: String(p.id) } });

  return (
    <div className="min-h-screen bg-[var(--cream)] text-[var(--ink)]">
      <SiteHeader solid />

      <main className="mx-auto max-w-7xl px-6 pt-24 pb-10 md:pb-14">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-[var(--ink)]"
        >
          <ArrowLeft className="h-4 w-4" /> Zpět na úvod
        </Link>

        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-[var(--orange-deep)]">
              Náš sortiment
            </p>
            <h1 className="font-display text-4xl uppercase md:text-5xl">Všechny produkty</h1>
          </div>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Hledat produkt…"
              className="w-full rounded-full border border-black/10 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[var(--ink)]"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-10 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] transition ${
                filter === f
                  ? "border-[var(--ink)] bg-[var(--ink)] text-white"
                  : "border-[var(--ink)]/20 bg-transparent text-[var(--ink)] hover:border-[var(--ink)]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-black/5" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">Žádné produkty neodpovídají výběru.</p>
        ) : (
          <>
            <p className="mb-5 text-sm text-muted-foreground">{filtered.length} produktů</p>
            <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {filtered.map((p, i) => (
                  <ProductCard
                    key={p.id}
                    p={p}
                    delay={i * 0.04}
                    onAdd={(prod) => {
                      addToCart(prod);
                      toast.success(`${prod.name} přidán do košíku`);
                    }}
                    onOpen={openProduct}
                  />
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
}
