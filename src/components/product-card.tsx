import { motion } from "framer-motion";

import productTire from "@/assets/product-tire.jpg";
import type { Product } from "@/lib/eshop-types";

export function ProductCard({
  p,
  delay = 0,
  onAdd,
  onOpen,
}: {
  p: Product;
  delay?: number;
  onAdd: (p: Product) => void;
  onOpen: (p: Product) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay, duration: 0.4 }}
      onClick={() => onOpen(p)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(p);
        }
      }}
      className="bg-white rounded-[28px] overflow-hidden shadow-sm hover:shadow-xl transition-shadow group flex flex-col cursor-pointer"
    >
      <div className="relative m-2.5 mb-0 aspect-square rounded-[20px] overflow-hidden bg-gradient-to-b from-[#1a1a1a] to-[#2e2e2e]">
        <img
          src={p.image || productTire}
          alt={p.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {!!p.featured && (
          <span className="absolute top-3.5 right-3.5 rounded-full bg-[var(--ink)] text-white text-[11px] font-bold tracking-[0.15em] px-4 py-1.5 shadow-lg">
            TOP
          </span>
        )}
        {p.stock <= 0 && (
          <span className="absolute top-3.5 left-3.5 rounded-full bg-white/90 text-[var(--ink)] text-[11px] font-bold tracking-[0.12em] px-3 py-1.5">
            VYPRODÁNO
          </span>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground font-bold">
          {p.type}
        </p>
        <h3 className="font-display text-lg uppercase mt-1.5 leading-tight">{p.name}</h3>

        <div className="mt-4 space-y-2.5">
          <Bar label="Trénink" value={p.training} tone="orange" />
          <Bar label="Závod" value={p.racing} tone="ink" />
        </div>

        <div className="flex items-center justify-between mt-6 pt-1">
          <span className="font-black text-2xl tracking-tight">
            {new Intl.NumberFormat("cs-CZ").format(p.price)} Kč
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdd(p);
            }}
            disabled={p.stock <= 0}
            className="rounded-full bg-[var(--ink)] text-white text-xs font-bold uppercase tracking-[0.12em] px-5 py-3 transition-[background-color,transform] duration-200 ease-out hover:bg-[var(--orange-deep)] active:scale-[0.97] disabled:opacity-40 disabled:hover:bg-[var(--ink)]"
          >
            Do košíku
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function Bar({
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
      <span className="w-16 shrink-0 text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
        {label}
      </span>
      <div className="h-2 flex-1 bg-black/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true }}
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
