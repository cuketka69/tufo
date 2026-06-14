import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ShoppingBag, ArrowLeft, Shield, RotateCcw, CreditCard } from "lucide-react";
import { toast } from "sonner";

import productTire from "@/assets/product-tire.jpg";
import blackLogo from "@/assets/blogo.webp";
import { Toaster } from "@/components/ui/sonner";
import { useShopProducts } from "@/lib/shop";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/eshop-types";

export const Route = createFileRoute("/produkt/$id")({
  component: ProductPage,
});

function ProductPage() {
  const { id } = useParams({ from: "/produkt/$id" });
  const { products, isLoading } = useShopProducts();
  const { addToCart, count } = useCart();

  const product = products.find((p) => String(p.id) === id);

  return (
    <div className="min-h-screen bg-[var(--cream)] text-[var(--ink)]">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-black/5 bg-[var(--cream)]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center" aria-label="TUFO">
            <img src={blackLogo} alt="TUFO" className="h-7 w-auto" width={105} height={42} />
          </Link>
          <Link to="/" className="relative" aria-label="Košík">
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--ink)] text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 md:py-12">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-[var(--ink)]"
        >
          <ArrowLeft className="h-4 w-4" /> Zpět na produkty
        </Link>

        {isLoading ? (
          <div className="grid gap-10 md:grid-cols-2">
            <div className="aspect-square animate-pulse rounded-3xl bg-black/5" />
            <div className="space-y-4">
              <div className="h-4 w-32 animate-pulse rounded bg-black/5" />
              <div className="h-10 w-3/4 animate-pulse rounded bg-black/5" />
              <div className="h-24 animate-pulse rounded bg-black/5" />
            </div>
          </div>
        ) : !product ? (
          <div className="py-24 text-center">
            <h1 className="font-display text-3xl uppercase">Produkt nenalezen</h1>
            <p className="mt-3 text-muted-foreground">Tento produkt neexistuje nebo byl odebrán.</p>
            <Link to="/" className="pill-btn pill-btn-hover mt-8 inline-flex">
              Zpět do obchodu
            </Link>
          </div>
        ) : (
          <ProductDetail product={product} onAdd={addToCart} />
        )}
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
}

function ProductDetail({ product, onAdd }: { product: Product; onAdd: (p: Product) => void }) {
  return (
    <div className="grid gap-10 md:grid-cols-2">
      {/* Image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative aspect-square overflow-hidden rounded-3xl bg-gradient-to-b from-[#1a1a1a] to-[#2e2e2e]"
      >
        <img src={product.image || productTire} alt={product.name} className="h-full w-full object-cover" />
        {!!product.featured && (
          <span className="absolute right-4 top-4 rounded-full bg-[var(--ink)] px-4 py-1.5 text-[11px] font-bold tracking-[0.15em] text-white shadow-lg">
            TOP
          </span>
        )}
      </motion.div>

      {/* Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-col"
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--orange-deep)]">
          {product.type}
          {product.category_name ? ` · ${product.category_name}` : ""}
        </p>
        <h1 className="mt-2 font-display text-4xl uppercase leading-[0.95] md:text-5xl">
          {product.name}
        </h1>

        <p className="mt-5 leading-relaxed text-muted-foreground">
          {product.description ||
            "Prémiový cyklistický plášť TUFO vyrobený v České republice. Spojení tradičního gumárenského řemesla a patentované technologie bezdušových plášťů pro maximální výkon na trati i v závodě."}
        </p>

        {/* Bars */}
        <div className="mt-7 space-y-3">
          <DetailBar label="Trénink" value={product.training} tone="orange" />
          <DetailBar label="Závod" value={product.racing} tone="ink" />
        </div>

        {/* Stock */}
        <div className="mt-6 text-sm">
          {product.stock > 0 ? (
            <span className="font-semibold text-emerald-600">Skladem ({product.stock} ks)</span>
          ) : (
            <span className="font-semibold text-rose-600">Vyprodáno</span>
          )}
          <span className="ml-3 text-muted-foreground">SKU: {product.sku}</span>
        </div>

        {/* Price + CTA */}
        <div className="mt-8 flex items-center gap-4">
          <span className="font-black text-4xl tracking-tight">
            {new Intl.NumberFormat("cs-CZ").format(product.price)} Kč
          </span>
          <button
            onClick={() => {
              onAdd(product);
              toast.success(`${product.name} přidán do košíku`);
            }}
            disabled={product.stock <= 0}
            className="ml-auto rounded-full bg-[var(--ink)] px-8 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[var(--orange-deep)] disabled:opacity-40 disabled:hover:bg-[var(--ink)]"
          >
            Do košíku
          </button>
        </div>

        {/* Trust */}
        <div className="mt-8 grid grid-cols-3 gap-3 border-t border-black/10 pt-6 text-center text-xs">
          <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
            <Shield className="h-5 w-5" /> Záruka 2 roky
          </div>
          <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
            <CreditCard className="h-5 w-5" /> Bezpečná platba
          </div>
          <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
            <RotateCcw className="h-5 w-5" /> Vrácení do 30 dní
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function DetailBar({
  label,
  value,
  tone = "orange",
}: {
  label: string;
  value: number;
  tone?: "orange" | "ink";
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 shrink-0 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full ${
            tone === "orange"
              ? "bg-gradient-to-r from-[var(--orange-deep)] to-[var(--orange-glow)]"
              : "bg-[var(--ink)]"
          }`}
        />
      </div>
      <span
        className={`w-9 text-right text-xs font-bold ${tone === "orange" ? "text-[var(--orange-deep)]" : "text-[var(--ink)]"}`}
      >
        {value}%
      </span>
    </div>
  );
}
