import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence, useSpring } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
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
import handImg from "@/assets/hand.webp";
import catRoad from "@/assets/silnice.webp";
import catGravel from "@/assets/gravel.webp";
import catMtb from "@/assets/mtb.webp";
import catCx from "@/assets/cyklokros.webp";
import catTri from "@/assets/triatlon.webp";
import catTrack from "@/assets/draha.webp";
import whiteLogo from "@/assets/wlogo.webp";
import { Toaster } from "@/components/ui/sonner";
import type { Product } from "@/lib/eshop-types";
import { useShopProducts } from "@/lib/shop";
import { useCart } from "@/lib/cart";
import { ProductCard } from "@/components/product-card";
import { SiteHeader } from "@/components/site-header";

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

function Home() {
  const navigate = useNavigate();
  const { addToCart: addCart, openCart } = useCart();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Vše");
  const [catIndex, setCatIndex] = useState(0);

  const { products, isLoading: productsLoading } = useShopProducts();

  const addToCart = (p: Product) => {
    addCart(p);
    openCart();
  };

  const openProduct = (p: Product) => navigate({ to: "/produkt/$id", params: { id: String(p.id) } });

  const filtered = useMemo(
    () => (filter === "Vše" ? products : products.filter((p) => p.type === filter)),
    [filter, products],
  );

  const topProducts = useMemo(() => {
    const featured = products.filter((p) => p.featured);
    return (featured.length ? featured : products).slice(0, 6);
  }, [products]);

  return (
    <div className="bg-[var(--cream)] text-[var(--ink)] overflow-x-hidden">
      <SiteHeader />
      <Hero />
      <TrustBar />
      <CategorySection index={catIndex} setIndex={setCatIndex} />
      <ShopSection
        filter={filter}
        setFilter={setFilter}
        products={filtered}
        onAdd={addToCart}
        onOpen={openProduct}
        loading={productsLoading}
      />
      <BrandStory />
      <PromoBanner />
      <TopProducts products={topProducts} onAdd={addToCart} onOpen={openProduct} />
      <Footer />
      <Toaster position="top-right" richColors />
    </div>
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
      className="hero-gradient relative overflow-hidden min-h-screen flex flex-col justify-center pt-20 pb-12"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.18),_transparent_60%)] pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-6 w-full">
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

/* ---------------- "Zobrazit všechny produkty" button ---------------- */
function AllProductsButton() {
  const navigate = useNavigate();
  const [filling, setFilling] = useState(false);

  return (
    <button
      onClick={() => setFilling(true)}
      disabled={filling}
      className="relative overflow-hidden rounded-full border-2 border-transparent bg-[var(--ink)] px-8 py-4 text-xs font-bold uppercase tracking-[0.12em] text-white transition-colors hover:border-[var(--orange-deep)]"
    >
      {/* Oranžová výplň zleva po kliknutí */}
      <motion.span
        aria-hidden
        className="absolute inset-0 origin-left bg-[var(--orange-deep)]"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: filling ? 1 : 0 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
        onAnimationComplete={() => {
          if (filling) navigate({ to: "/produkty" });
        }}
      />
      <span className="relative z-10 inline-flex items-center gap-2">
        Zobrazit všechny produkty <ArrowRight className="h-4 w-4" />
      </span>
    </button>
  );
}

/* ---------------- SHOP ---------------- */
function ShopSection({
  filter,
  setFilter,
  products,
  onAdd,
  onOpen,
  loading,
}: {
  filter: (typeof FILTERS)[number];
  setFilter: (f: (typeof FILTERS)[number]) => void;
  products: Product[];
  onAdd: (p: Product) => void;
  onOpen: (p: Product) => void;
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
                <ProductCard key={p.id} p={p} delay={i * 0.05} onAdd={onAdd} onOpen={onOpen} />
              ))}
            </AnimatePresence>
          </div>
        )}

        <div className="mt-12 flex justify-center">
          <AllProductsButton />
        </div>
      </div>
    </section>
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
          <Link to="/o-nas" className="pill-btn pill-btn-hover mt-8 inline-flex">
            Zjistit více o nás <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative aspect-[4/5] rounded-3xl overflow-hidden hero-gradient flex items-center justify-center"
        >
          <img src={handImg} alt="" className="absolute inset-0 w-full h-full object-cover" />
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
function TopProducts({
  products,
  onAdd,
  onOpen,
}: {
  products: Product[];
  onAdd: (p: Product) => void;
  onOpen: (p: Product) => void;
}) {
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
              <ProductCard p={p} delay={i * 0.05} onAdd={onAdd} onOpen={onOpen} />
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
          <img src={whiteLogo} alt="TUFO" className="h-9 w-auto mb-4" width={135} height={54} />
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
