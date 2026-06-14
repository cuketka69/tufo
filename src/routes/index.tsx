import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, useScroll, useTransform, AnimatePresence, useSpring } from "framer-motion";
import { toast } from "sonner";
import {
  Search,
  User,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  Minus,
  Shield,
  CreditCard,
  Store,
  RotateCcw,
  Facebook,
  Youtube,
  Instagram,
  ArrowRight,
} from "lucide-react";
import wheelImg from "@/assets/wheel.png";
import catRoad from "@/assets/silnice.webp";
import catGravel from "@/assets/gravel.webp";
import catMtb from "@/assets/mtb.webp";
import catCx from "@/assets/cyklokros.webp";
import catTri from "@/assets/triatlon.webp";
import catTrack from "@/assets/draha.webp";
import productTire from "@/assets/product-tire.jpg";
import whiteLogo from "@/assets/wlogo.webp";
import blackLogo from "@/assets/blogo.webp";
import { Toaster } from "@/components/ui/sonner";
import { listActiveProducts, createOrder } from "@/lib/api/eshop.functions";
import type { Product } from "@/lib/eshop-types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TUFO — Prémiové cyklistické pláště od roku 1991" },
      {
        name: "description",
        content:
          "Galusky, bezdušové pláště TR a plášťovky. Český výrobce závodních cyklistických plášťů od roku 1991.",
      },
    ],
  }),
  component: Home,
});

const CATEGORIES = [
  { name: "Silnice", img: catRoad },
  { name: "Gravel", img: catGravel },
  { name: "MTB", img: catMtb },
  { name: "Cyklokros", img: catCx },
  { name: "Triatlon", img: catTri },
  { name: "Dráha", img: catTrack },
];

const FILTERS = ["Vše", "Galusky", "Plášťovky", "Pláště", "Bezdušové TR", "Příslušenství"] as const;

// Záložní ukázkové produkty — zobrazí se, když se z databáze nic nenačte
// (např. na Vercelu, kde lokální SQLite neběží). Jakmile bude zapojená cloud
// databáze s produkty, použijí se automaticky reálná data místo těchto.
const DEMO_PRODUCTS: Product[] = [
  { id: -1, sku: "TUF-S33", name: "Tufo S33 Pro", type: "Galusky", category_id: null, category_name: "Silnice", price: 1490, training: 60, racing: 95, stock: 42, image: null, description: null, featured: 1, active: 1, created_at: "" },
  { id: -2, sku: "TUF-CAL", name: "Tufo Calibra Plus", type: "Plášťovky", category_id: null, category_name: "Silnice", price: 890, training: 75, racing: 85, stock: 88, image: null, description: null, featured: 0, active: 1, created_at: "" },
  { id: -3, sku: "TUF-GSP", name: "Tufo Gravel Speedero", type: "Bezdušové TR", category_id: null, category_name: "Gravel", price: 1290, training: 80, racing: 80, stock: 31, image: null, description: null, featured: 1, active: 1, created_at: "" },
  { id: -4, sku: "TUF-XC6", name: "Tufo XC6 TR", type: "Pláště", category_id: null, category_name: "MTB", price: 1390, training: 70, racing: 90, stock: 12, image: null, description: null, featured: 0, active: 1, created_at: "" },
];

function Home() {
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<{ p: Product; qty: number }[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Vše");
  const [catIndex, setCatIndex] = useState(0);

  const productsQuery = useQuery({
    queryKey: ["shop", "products"],
    queryFn: () => listActiveProducts(),
  });
  const products = useMemo(() => {
    if (productsQuery.isLoading) return [];
    const data = productsQuery.data ?? [];
    // Když z DB nic nepřijde (prázdné nebo chyba), ukaž ukázkové produkty.
    return data.length ? data : DEMO_PRODUCTS;
  }, [productsQuery.data, productsQuery.isLoading]);

  const addToCart = (p: Product) => {
    setCart((c) => {
      const ex = c.find((x) => x.p.id === p.id);
      if (ex) return c.map((x) => (x.p.id === p.id ? { ...x, qty: x.qty + 1 } : x));
      return [...c, { p, qty: 1 }];
    });
    setCartOpen(true);
  };

  const filtered = useMemo(
    () => (filter === "Vše" ? products : products.filter((p) => p.type === filter)),
    [filter, products],
  );

  const topProducts = useMemo(() => {
    const featured = products.filter((p) => p.featured);
    return (featured.length ? featured : products).slice(0, 6);
  }, [products]);

  const cartTotal = cart.reduce((s, x) => s + x.p.price * x.qty, 0);
  const cartCount = cart.reduce((s, x) => s + x.qty, 0);

  return (
    <div className="bg-[var(--cream)] text-[var(--ink)] overflow-x-hidden">
      <Header cartCount={cartCount} onCart={() => setCartOpen(true)} />
      <Hero />
      <TrustBar />
      <CategorySection index={catIndex} setIndex={setCatIndex} />
      <ShopSection
        filter={filter}
        setFilter={setFilter}
        products={filtered}
        onAdd={addToCart}
        loading={productsQuery.isLoading}
      />
      <BrandStory />
      <PromoBanner />
      <TopProducts products={topProducts} onAdd={addToCart} />
      <Footer />
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        setCart={setCart}
        total={cartTotal}
        onOrdered={() => setCart([])}
      />
      <Toaster position="top-right" richColors />
    </div>
  );
}

/* ---------------- HEADER ---------------- */
function Header({ cartCount, onCart }: { cartCount: number; onCart: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 30);
    f();
    window.addEventListener("scroll", f);
    return () => window.removeEventListener("scroll", f);
  }, []);
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[var(--cream)]/90 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between text-white">
        <nav
          className={`hidden md:flex gap-7 text-[11px] font-semibold tracking-[0.18em] uppercase ${scrolled ? "text-[var(--ink)]" : "text-white"}`}
        >
          <a href="#shop" className="hover:opacity-70">
            Pneu
          </a>
          <a href="#shop" className="hover:opacity-70">
            Příslušenství
          </a>
          <a href="#story" className="hover:opacity-70">
            Technologie
          </a>
          <a href="#shop" className="hover:opacity-70">
            Distributoři
          </a>
          <a href="#footer" className="hover:opacity-70">
            Kontakt
          </a>
        </nav>
        <a href="/" className="flex items-center" aria-label="TUFO">
          <img
            src={scrolled ? blackLogo : whiteLogo}
            alt="TUFO"
            className="h-8 w-auto"
            width={120}
            height={48}
          />
        </a>
        <div className={`flex items-center gap-5 ${scrolled ? "text-[var(--ink)]" : "text-white"}`}>
          <Search className="w-5 h-5 cursor-pointer hover:opacity-70" />
          <User className="w-5 h-5 cursor-pointer hover:opacity-70" />
          <button onClick={onCart} className="relative">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[var(--ink)] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

/* ---------------- HERO ---------------- */
function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  // Wheel rotation tied to scroll
  const rotateRaw = useTransform(scrollY, [0, 2000], [0, 720]);
  const rotate = useSpring(rotateRaw, { stiffness: 80, damping: 20, mass: 0.5 });

  return (
    <section
      ref={ref}
      className="hero-gradient relative overflow-hidden pt-24 pb-12 md:pt-32 md:pb-20"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.18),_transparent_60%)] pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-6">
        {/* Wheel image */}
        <div className="relative flex items-center justify-center h-[420px] md:h-[560px]">
          <motion.img
            src={wheelImg}
            alt="Cyklistické kolo Tufo"
            style={{ rotate }}
            className="w-[90%] max-w-[640px] drop-shadow-[0_30px_60px_rgba(0,0,0,0.45)] select-none pointer-events-none"
            draggable={false}
            width={1024}
            height={1024}
          />

          {/* Price badge */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="absolute top-6 right-2 md:right-12 bg-white rounded-full px-5 py-2.5 shadow-xl font-black text-[var(--ink)]"
          >
            od 890&nbsp;Kč
          </motion.div>

          {/* Headline overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-white text-4xl sm:text-6xl md:text-7xl leading-[0.95] uppercase font-display tracking-tight max-w-3xl px-4"
              style={{ textShadow: "0 4px 30px rgba(0,0,0,0.35)" }}
            >
              Jeď za
              <br />
              hranice
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-white/90 mt-4 text-xs sm:text-sm uppercase tracking-[0.3em] font-semibold"
            >
              Česká kvalita od roku 1991
            </motion.p>
            <motion.a
              href="#shop"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="pill-btn pill-btn-hover mt-6 pointer-events-auto"
            >
              Nakoupit
            </motion.a>
          </div>
        </div>

        {/* Carousel arrows */}
        <div className="absolute bottom-8 left-6 flex gap-2">
          <button className="w-10 h-10 rounded-full bg-[var(--ink)] text-white flex items-center justify-center hover:scale-105 transition">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="w-10 h-10 rounded-full bg-white/30 text-white border border-white/40 flex items-center justify-center hover:scale-105 transition">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ---------------- TRUST BAR ---------------- */
function TrustBar() {
  const items = [
    { Icon: Shield, label: "2 roky záruka" },
    { Icon: CreditCard, label: "Bezpečná platba" },
    { Icon: Store, label: "200+ prodejců" },
    { Icon: RotateCcw, label: "14 dní na vrácení" },
  ];
  return (
    <div className="bg-white border-y border-black/5">
      <div className="max-w-7xl mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map(({ Icon, label }) => (
          <div key={label} className="flex items-center justify-center gap-3 text-sm">
            <span className="w-8 h-8 rounded-full bg-[var(--orange-deep)]/10 text-[var(--orange-deep)] flex items-center justify-center">
              <Icon className="w-4 h-4" />
            </span>
            <span className="font-semibold text-[var(--ink)]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- CATEGORY SECTION ---------------- */
function CategorySection({ index, setIndex }: { index: number; setIndex: (i: number) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 360, behavior: "smooth" });
    setIndex(Math.min(CATEGORIES.length - 1, Math.max(0, index + dir)));
  };
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-5xl md:text-6xl uppercase font-display">
            Nakupujte podle kategorie
          </h2>
          <p className="text-sm text-muted-foreground mt-3">
            Najděte ideální plášť šitý na míru vaší disciplíně
          </p>
          <svg className="mx-auto mt-3" width="60" height="14" viewBox="0 0 60 14" fill="none">
            <path
              d="M2 7 Q 10 1 18 7 T 34 7 T 50 7 T 60 7"
              stroke="oklch(0.65 0.22 38)"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>

        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-6 -mx-6 px-6 scrollbar-hide"
          style={{ scrollbarWidth: "none" }}
        >
          {CATEGORIES.map((c, i) => (
            <CategoryCard key={c.name} {...c} delay={i * 0.08} />
          ))}
        </div>

        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => scroll(-1)}
              className="w-10 h-10 rounded-full border border-[var(--ink)]/20 flex items-center justify-center hover:bg-[var(--ink)] hover:text-white transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll(1)}
              className="w-10 h-10 rounded-full border border-[var(--ink)]/20 flex items-center justify-center hover:bg-[var(--ink)] hover:text-white transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="w-32 h-[3px] bg-black/10 rounded-full ml-3 overflow-hidden">
              <div
                className="h-full bg-[var(--orange-deep)] rounded-full transition-all"
                style={{ width: `${((index + 1) / CATEGORIES.length) * 100}%` }}
              />
            </div>
          </div>
          <a href="#shop" className="pill-btn pill-btn-hover">
            Zobrazit vše
          </a>
        </div>
      </div>
    </section>
  );
}

function CategoryCard({ name, img, delay }: { name: string; img: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const x = ((e.clientX - r.left) / r.width - 0.5) * 10;
    const y = ((e.clientY - r.top) / r.height - 0.5) * -10;
    setTilt({ x, y });
  };
  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      style={{ transform: `perspective(1000px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)` }}
      className="snap-start shrink-0 w-[280px] sm:w-[340px] h-[420px] rounded-3xl overflow-hidden relative group cursor-pointer shadow-xl transition-transform"
    >
      <img
        src={img}
        alt={name}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/30" />
      <div className="absolute top-5 left-5 right-5 flex justify-between items-start">
        <h3 className="text-white text-2xl uppercase font-display">{name}</h3>
        <svg width="28" height="14" viewBox="0 0 28 14">
          <path
            d="M1 7 Q 7 1 14 7 T 27 7"
            stroke="white"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="absolute bottom-5 left-5">
        <span className="pill-btn pill-btn-hover">Shop now</span>
      </div>
    </motion.div>
  );
}

/* ---------------- SHOP ---------------- */
function ShopSection({
  filter,
  setFilter,
  products,
  onAdd,
  loading,
}: {
  filter: (typeof FILTERS)[number];
  setFilter: (f: (typeof FILTERS)[number]) => void;
  products: Product[];
  onAdd: (p: Product) => void;
  loading?: boolean;
}) {
  return (
    <section id="shop" className="bg-[var(--cream)] py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--orange-deep)] font-bold mb-2">
              Náš sortiment
            </p>
            <h2 className="text-4xl md:text-5xl uppercase">Všechny produkty</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-xs uppercase tracking-[0.12em] font-bold border transition ${
                  filter === f
                    ? "bg-[var(--ink)] text-white border-[var(--ink)]"
                    : "bg-transparent text-[var(--ink)] border-[var(--ink)]/20 hover:border-[var(--ink)]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-black/5 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">
            Žádné produkty v této kategorii.
          </p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <AnimatePresence mode="popLayout">
              {products.map((p, i) => (
                <ProductCard key={p.id} p={p} delay={i * 0.05} onAdd={onAdd} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}

function ProductCard({
  p,
  delay,
  onAdd,
}: {
  p: Product;
  delay: number;
  onAdd: (p: Product) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white rounded-[28px] overflow-hidden shadow-sm hover:shadow-xl transition-shadow group flex flex-col"
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
            onClick={() => onAdd(p)}
            disabled={p.stock <= 0}
            className="rounded-full bg-[var(--ink)] text-white text-xs font-bold uppercase tracking-[0.12em] px-5 py-3 hover:bg-[var(--orange-deep)] transition disabled:opacity-40 disabled:hover:bg-[var(--ink)]"
          >
            Do košíku
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function Bar({ label, value, tone = "orange" }: { label: string; value: number; tone?: "orange" | "ink" }) {
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

/* ---------------- BRAND STORY ---------------- */
function BrandStory() {
  return (
    <section id="story" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--orange-deep)] font-bold mb-4">
            Náš příběh
          </p>
          <h2 className="text-4xl md:text-5xl uppercase leading-[0.95]">
            Nejvyšší
            <br />
            kvalita od
            <br />
            roku <span className="text-[var(--orange-deep)]">1991</span>
          </h2>
          <p className="mt-6 text-muted-foreground leading-relaxed max-w-md">
            TUFO je český výrobce závodních cyklistických plášťů a galusek. Více než tři dekády
            kombinujeme tradiční gumárenské řemeslo s patentovanou technologií bezdušových plášťů,
            kterou jezdí profesionálové po celém světě.
          </p>
          <a href="#shop" className="pill-btn pill-btn-hover mt-8 inline-flex">
            Objevit kolekci <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative aspect-[4/5] rounded-3xl overflow-hidden hero-gradient flex items-center justify-center"
        >
          <img src={wheelImg} alt="" className="w-[80%]" />
          <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Vyrobeno
                </p>
                <p className="font-display text-lg">Česká republika</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Let zkušeností
                </p>
                <p className="font-display text-2xl text-[var(--orange-deep)]">33+</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------- PROMO BANNER ---------------- */
function PromoBanner() {
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="hero-gradient rounded-3xl px-8 md:px-14 py-12 md:py-16 flex flex-col md:flex-row items-center justify-between gap-6 text-white relative overflow-hidden"
        >
          <div className="absolute -right-20 -bottom-20 opacity-30">
            <img src={wheelImg} alt="" className="w-[340px]" />
          </div>
          <div className="relative">
            <p className="text-xs uppercase tracking-[0.3em] font-bold opacity-90">Letní akce</p>
            <h3 className="text-3xl md:text-5xl uppercase mt-2 leading-none">
              Využijte 20% slevu
              <br />s kódem <span className="bg-[var(--ink)] px-3 py-1 rounded-md">LETO20</span>
            </h3>
          </div>
          <a
            href="#shop"
            className="pill-btn pill-btn-hover bg-white !text-[var(--ink)] relative"
            style={{ background: "white", color: "var(--ink)" }}
          >
            Uplatnit slevu
          </a>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------- TOP PRODUCTS ---------------- */
function TopProducts({ products, onAdd }: { products: Product[]; onAdd: (p: Product) => void }) {
  if (products.length === 0) return null;
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--orange-deep)] font-bold mb-2">
              Novinky &amp; bestsellery
            </p>
            <h2 className="text-4xl md:text-5xl uppercase">Top produkty</h2>
          </div>
        </div>
        <div
          className="flex gap-5 overflow-x-auto pb-6 -mx-6 px-6 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none" }}
        >
          {products.map((p, i) => (
            <div key={p.id} className="snap-start shrink-0 w-[260px]">
              <ProductCard p={p} delay={i * 0.05} onAdd={onAdd} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- FOOTER ---------------- */
function Footer() {
  return (
    <footer id="footer" className="bg-[var(--ink)] text-white pt-20 pb-10 mt-10">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-10">
        <div>
          <h3 className="font-display text-2xl tracking-[0.25em] mb-4">TUFO</h3>
          <p className="text-sm text-white/60 leading-relaxed">
            Český výrobce prémiových cyklistických plášťů a galusek od roku 1991.
          </p>
          <div className="flex gap-3 mt-5">
            {[Facebook, Instagram, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-[var(--orange-deep)] hover:border-[var(--orange-deep)] transition"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
        {[
          {
            title: "Produkty",
            links: ["Galusky", "Plášťovky", "Pláště", "Bezdušové TR", "Příslušenství"],
          },
          {
            title: "Společnost",
            links: ["O nás", "Technologie", "Distributoři", "Kariéra", "Tisk"],
          },
          {
            title: "Podpora",
            links: ["Kontakt", "Doprava", "Reklamace", "Obchodní podmínky", "GDPR"],
          },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold mb-4 text-white/80">
              {col.title}
            </h4>
            <ul className="space-y-2 text-sm text-white/60">
              {col.links.map((l) => (
                <li key={l}>
                  <a href="#" className="hover:text-[var(--orange-glow)] transition">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-14 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between gap-3 text-xs text-white/50">
        <p>© {new Date().getFullYear()} TUFO s.r.o. Všechna práva vyhrazena.</p>
        <p>Vyrobeno v České republice 🇨🇿</p>
      </div>
    </footer>
  );
}

/* ---------------- CART DRAWER ---------------- */
type CheckoutForm = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  note: string;
};

const EMPTY_CHECKOUT: CheckoutForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  zip: "",
  note: "",
};

function CartDrawer({
  open,
  onClose,
  cart,
  setCart,
  total,
  onOrdered,
}: {
  open: boolean;
  onClose: () => void;
  cart: { p: Product; qty: number }[];
  setCart: React.Dispatch<React.SetStateAction<{ p: Product; qty: number }[]>>;
  total: number;
  onOrdered: () => void;
}) {
  const [step, setStep] = useState<"cart" | "checkout">("cart");
  const [form, setForm] = useState<CheckoutForm>(EMPTY_CHECKOUT);

  const setQty = (id: number, d: number) =>
    setCart((c) =>
      c.flatMap((x) => {
        if (x.p.id !== id) return [x];
        const q = x.qty + d;
        return q <= 0 ? [] : [{ ...x, qty: q }];
      }),
    );

  const orderMut = useMutation({
    mutationFn: () =>
      createOrder({
        data: {
          customer: {
            name: form.name,
            email: form.email,
            phone: form.phone || undefined,
            address: form.address || undefined,
            city: form.city || undefined,
            zip: form.zip || undefined,
          },
          items: cart.map((x) => ({ product_id: x.p.id, qty: x.qty })),
          note: form.note || undefined,
        },
      }),
    onSuccess: (res) => {
      toast.success(`Objednávka ${res.order_number} odeslána. Děkujeme!`);
      onOrdered();
      setForm(EMPTY_CHECKOUT);
      setStep("cart");
      onClose();
    },
    onError: (e: Error) => toast.error(e.message || "Objednávku se nepodařilo odeslat"),
  });

  const upd = (k: keyof CheckoutForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[60]"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-white z-[70] flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="font-display text-xl uppercase">
                {step === "cart" ? "Košík" : "Pokladna"}
              </h3>
              <button
                onClick={() => {
                  setStep("cart");
                  onClose();
                }}
                className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {step === "cart" ? (
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 && (
                  <p className="text-center text-muted-foreground py-12 text-sm">
                    Váš košík je prázdný.
                  </p>
                )}
                {cart.map(({ p, qty }) => (
                  <div key={p.id} className="flex gap-4 items-center">
                    <img
                      src={p.image || productTire}
                      alt=""
                      className="w-16 h-16 rounded-lg object-cover bg-[var(--cream)]"
                    />
                    <div className="flex-1">
                      <p className="font-display text-sm uppercase">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.type}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => setQty(p.id, -1)}
                          className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-bold w-5 text-center">{qty}</span>
                        <button
                          onClick={() => setQty(p.id, 1)}
                          className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <span className="font-bold">{p.price * qty} Kč</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                <CheckoutInput placeholder="Jméno a příjmení *" value={form.name} onChange={upd("name")} />
                <CheckoutInput placeholder="E-mail *" type="email" value={form.email} onChange={upd("email")} />
                <CheckoutInput placeholder="Telefon" value={form.phone} onChange={upd("phone")} />
                <CheckoutInput placeholder="Ulice a číslo" value={form.address} onChange={upd("address")} />
                <div className="grid grid-cols-2 gap-3">
                  <CheckoutInput placeholder="PSČ" value={form.zip} onChange={upd("zip")} />
                  <CheckoutInput placeholder="Město" value={form.city} onChange={upd("city")} />
                </div>
                <textarea
                  placeholder="Poznámka k objednávce"
                  value={form.note}
                  onChange={upd("note")}
                  rows={3}
                  className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-[var(--ink)]"
                />
                <div className="pt-2 space-y-2 text-sm">
                  {cart.map(({ p, qty }) => (
                    <div key={p.id} className="flex justify-between text-muted-foreground">
                      <span>
                        {p.name} × {qty}
                      </span>
                      <span>{p.price * qty} Kč</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t p-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Celkem</span>
                <span className="font-black text-xl">{total} Kč</span>
              </div>
              {step === "cart" ? (
                <button
                  onClick={() => setStep("checkout")}
                  className="pill-btn pill-btn-hover w-full justify-center"
                  disabled={cart.length === 0}
                >
                  Přejít k pokladně
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => orderMut.mutate()}
                    className="pill-btn pill-btn-hover w-full justify-center"
                    disabled={orderMut.isPending || !form.name || !form.email}
                  >
                    {orderMut.isPending ? "Odesílám…" : "Odeslat objednávku"}
                  </button>
                  <button
                    onClick={() => setStep("cart")}
                    className="w-full text-center text-sm text-muted-foreground hover:text-[var(--ink)]"
                  >
                    ← Zpět do košíku
                  </button>
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function CheckoutInput({
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-[var(--ink)]"
    />
  );
}
