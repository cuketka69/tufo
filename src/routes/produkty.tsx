import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence } from "framer-motion";
import { ArrowLeft, Search } from "lucide-react";
import { toast } from "sonner";

import { Toaster } from "@/components/ui/sonner";
import { Slider } from "@/components/ui/slider";
import { ProductCard } from "@/components/product-card";
import { SiteHeader } from "@/components/site-header";
import { useShopProducts } from "@/lib/shop";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
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

const SORTS = [
  { value: "featured", label: "Doporučené" },
  { value: "price-asc", label: "Cena: nejlevnější" },
  { value: "price-desc", label: "Cena: nejdražší" },
  { value: "name", label: "Název A–Z" },
] as const;

const COLOR_HEX: Record<string, string> = {
  Černá: "#1a1a1a",
  Bílá: "#f4f1ea",
  Oranžová: "#f97316",
  Hnědá: "#8b5e3c",
  Modrá: "#2563eb",
  Červená: "#dc2626",
  Zelená: "#16a34a",
  Šedá: "#9ca3af",
};

function ProductsPage() {
  const navigate = useNavigate();
  const { products, isLoading } = useShopProducts();
  const { addToCart } = useCart();

  const [types, setTypes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [sort, setSort] = useState<(typeof SORTS)[number]["value"]>("featured");
  const [search, setSearch] = useState("");

  // Dostupné hodnoty filtrů a cenové meze z produktů
  const { allTypes, allColors, priceMin, priceMax } = useMemo(() => {
    const t = [...new Set(products.map((p) => p.type))];
    const c = [...new Set(products.map((p) => p.color).filter((x): x is string => !!x))];
    const prices = products.map((p) => p.price);
    return {
      allTypes: t,
      allColors: c,
      priceMin: prices.length ? Math.min(...prices) : 0,
      priceMax: prices.length ? Math.max(...prices) : 0,
    };
  }, [products]);

  const effectiveMax = maxPrice ?? priceMax;

  const toggle = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (types.length && !types.includes(p.type)) return false;
      if (colors.length && (!p.color || !colors.includes(p.color))) return false;
      if (p.price > effectiveMax) return false;
      const q = search.trim().toLowerCase();
      if (q && !p.name.toLowerCase().includes(q)) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "name") return a.name.localeCompare(b.name, "cs");
      return Number(b.featured) - Number(a.featured) || a.id - b.id;
    });
    return list;
  }, [products, types, colors, effectiveMax, sort, search]);

  const openProduct = (p: Product) =>
    navigate({ to: "/produkt/$id", params: { id: String(p.id) } });

  const activeFilters = types.length + colors.length + (maxPrice !== null && maxPrice < priceMax ? 1 : 0);
  const resetFilters = () => {
    setTypes([]);
    setColors([]);
    setMaxPrice(null);
    setSearch("");
  };

  return (
    <div className="min-h-screen bg-[var(--cream)] text-[var(--ink)]">
      <SiteHeader solid />

      <main className="mx-auto max-w-7xl px-6 pt-24 pb-14">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-[var(--ink)]"
        >
          <ArrowLeft className="h-4 w-4" /> Zpět na úvod
        </Link>

        <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-[var(--orange-deep)]">
          Náš sortiment
        </p>
        <h1 className="mb-8 font-display text-4xl uppercase md:text-5xl">Všechny produkty</h1>

        <div className="grid gap-8 md:grid-cols-[250px_1fr]">
          {/* Sidebar filtry */}
          <aside className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg uppercase">Filtry</h2>
              {activeFilters > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-xs font-semibold text-[var(--orange-deep)] hover:underline"
                >
                  Zrušit ({activeFilters})
                </button>
              )}
            </div>

            {/* Typ */}
            <FilterGroup title="Typ">
              <div className="space-y-2">
                {allTypes.map((t) => (
                  <label key={t} className="flex cursor-pointer items-center gap-2.5 text-sm">
                    <input
                      type="checkbox"
                      checked={types.includes(t)}
                      onChange={() => toggle(types, setTypes, t)}
                      className="h-4 w-4 rounded border-black/20 accent-[var(--orange-deep)]"
                    />
                    {t}
                  </label>
                ))}
              </div>
            </FilterGroup>

            {/* Barva */}
            {allColors.length > 0 && (
              <FilterGroup title="Barva">
                <div className="flex flex-wrap gap-2.5">
                  {allColors.map((c) => {
                    const active = colors.includes(c);
                    return (
                      <button
                        key={c}
                        title={c}
                        aria-label={c}
                        onClick={() => toggle(colors, setColors, c)}
                        className={`h-8 w-8 rounded-full border transition ${
                          active
                            ? "ring-2 ring-[var(--ink)] ring-offset-2 ring-offset-[var(--cream)]"
                            : "border-black/15 hover:scale-110"
                        }`}
                        style={{ backgroundColor: COLOR_HEX[c] ?? "#cbd5e1" }}
                      />
                    );
                  })}
                </div>
              </FilterGroup>
            )}

            {/* Cena */}
            <FilterGroup title="Cena">
              <p className="mb-3 text-sm text-muted-foreground">
                Do <span className="font-bold text-[var(--ink)]">{formatPrice(effectiveMax)}</span>
              </p>
              <Slider
                min={priceMin}
                max={priceMax}
                step={10}
                value={[effectiveMax]}
                onValueChange={(v) => setMaxPrice(v[0])}
              />
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>{formatPrice(priceMin)}</span>
                <span>{formatPrice(priceMax)}</span>
              </div>
            </FilterGroup>
          </aside>

          {/* Obsah */}
          <div>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Hledat produkt…"
                  className="w-full rounded-full border border-black/10 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[var(--ink)]"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{filtered.length} produktů</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as typeof sort)}
                  className="rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:border-[var(--ink)]"
                >
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 gap-5 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-black/5" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-black/10 py-20 text-center text-muted-foreground">
                Žádné produkty neodpovídají filtrům.
                <div>
                  <button onClick={resetFilters} className="mt-3 text-sm font-semibold text-[var(--orange-deep)] hover:underline">
                    Zrušit filtry
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-5 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {filtered.map((p, i) => (
                    <ProductCard
                      key={p.id}
                      p={p}
                      delay={i * 0.03}
                      onAdd={(prod) => {
                        addToCart(prod);
                        toast.success(`${prod.name} přidán do košíku`);
                      }}
                      onOpen={openProduct}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</h3>
      {children}
    </div>
  );
}
