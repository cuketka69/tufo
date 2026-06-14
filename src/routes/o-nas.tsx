import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, animate, useInView } from "framer-motion";
import "leaflet/dist/leaflet.css";
import { ArrowLeft, ArrowRight, Award, Factory, Globe, Recycle, MapPin, Phone, Mail, Navigation } from "lucide-react";

import blackLogo from "@/assets/blogo.webp";
import handImg from "@/assets/hand.webp";
import productTire from "@/assets/product-tire.jpg";
import silniceImg from "@/assets/silnice.webp";
import gravelImg from "@/assets/gravel.webp";
import drahaImg from "@/assets/draha.webp";

export const Route = createFileRoute("/o-nas")({
  head: () => ({
    meta: [
      { title: "O nás — TUFO" },
      {
        name: "description",
        content:
          "TUFO — český výrobce závodních cyklistických plášťů a galusek od roku 1991. Tradiční řemeslo a patentovaná technologie bezdušových plášťů.",
      },
    ],
  }),
  component: AboutPage,
});

const STATS = [
  { value: "1991", label: "Založení firmy" },
  { value: "33+", label: "Let zkušeností" },
  { value: "60+", label: "Zemí, kam dodáváme" },
  { value: "200+", label: "Prodejců" },
];

const VALUES = [
  {
    icon: Factory,
    title: "Vlastní výroba v ČR",
    text: "Všechny pláště a galusky vyrábíme ve vlastní továrně v České republice — od směsi gumy po finální kontrolu.",
  },
  {
    icon: Award,
    title: "Patentovaná technologie",
    text: "Jsme průkopníci bezdušových plášťů (Tubeless) a galusek vyztužených naší vlastní technologií.",
  },
  {
    icon: Globe,
    title: "Závodní DNA",
    text: "Na našich pláštích jezdí profesionálové po celém světě — od silnice přes gravel a MTB až po dráhu.",
  },
  {
    icon: Recycle,
    title: "Kvalita a životnost",
    text: "Důraz na trvanlivost, nízký valivý odpor a maximální ochranu proti defektům v každém modelu.",
  },
];

const TIMELINE = [
  {
    year: "1991",
    text: "Založení společnosti TUFO a první výroba galusek.",
    image: handImg,
    detail:
      "Vše začalo v České republice s vizí vyrábět nejkvalitnější galusky. Ruční řemeslo a důraz na detail tvoří základ značky dodnes.",
  },
  {
    year: "1995",
    text: "Vývoj unikátní bezdušové technologie pro plášťovky.",
    image: productTire,
    detail:
      "Stali jsme se jedním z mála výrobců na světě, kteří zvládli patentovanou technologii bezdušových plášťovek (Tubeless).",
  },
  {
    year: "2005",
    text: "Expanze na zahraniční trhy a spolupráce s profi týmy.",
    image: silniceImg,
    detail:
      "Naše pláště začaly jezdit profesionální silniční týmy a značka TUFO se prosadila na trzích po celé Evropě i mimo ni.",
  },
  {
    year: "2015",
    text: "Rozšíření sortimentu o gravel a MTB bezdušové pláště.",
    image: gravelImg,
    detail:
      "Reagovali jsme na boom gravelu a horských kol — přišly nové bezdušové modely pro terén, dobrodružství i závod.",
  },
  {
    year: "Dnes",
    text: "Český výrobce dodávající do více než 60 zemí světa.",
    image: drahaImg,
    detail:
      "Zůstáváme rodinnou českou firmou s vlastní výrobou, která spojuje desítky let zkušeností s neustálým vývojem nových technologií.",
  },
];

function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--cream)] text-[var(--ink)]">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-black/5 bg-[var(--cream)]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center" aria-label="TUFO">
            <img src={blackLogo} alt="TUFO" className="h-7 w-auto" width={105} height={42} />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-[var(--ink)]"
          >
            <ArrowLeft className="h-4 w-4" /> Zpět na úvod
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-12 md:grid-cols-2 md:py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--orange-deep)]">O nás</p>
          <h1 className="mt-4 font-display text-4xl uppercase leading-[0.95] md:text-6xl">
            Nejvyšší kvalita
            <br />
            od roku <span className="text-[var(--orange-deep)]">1991</span>
          </h1>
          <p className="mt-6 max-w-md leading-relaxed text-muted-foreground">
            TUFO je český výrobce závodních cyklistických plášťů a galusek. Více než tři dekády
            kombinujeme tradiční gumárenské řemeslo s patentovanou technologií bezdušových plášťů,
            kterou jezdí profesionálové po celém světě.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative aspect-[4/5] overflow-hidden rounded-3xl hero-gradient"
        >
          <img src={handImg} alt="" className="absolute inset-0 h-full w-full object-cover" />
        </motion.div>
      </section>

      {/* Stats */}
      <section className="border-y border-black/5 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-10 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <CountUp
                value={s.value}
                className="font-display text-4xl text-[var(--orange-deep)] md:text-5xl"
              />
              <div className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <h2 className="font-display text-3xl uppercase md:text-4xl">Náš příběh</h2>
        <div className="mt-6 space-y-4 leading-relaxed text-muted-foreground">
          <p>
            Značka TUFO vznikla v roce 1991 s jasnou vizí — vyrábět nejkvalitnější cyklistické pláště
            přímo v České republice. Začínali jsme výrobou galusek a postupně jsme se stali jedním z
            mála výrobců na světě, kteří zvládli patentovanou technologii bezdušových plášťovek.
          </p>
          <p>
            Naše pláště dnes používají profesionální týmy i amatérští nadšenci ve více než 60 zemích.
            Každý model prochází přísnou kontrolou kvality a vzniká s důrazem na nízký valivý odpor,
            ochranu proti defektům a dlouhou životnost.
          </p>
          <p>
            Zůstáváme rodinnou českou firmou, která spojuje desítky let řemeslné zkušenosti s
            neustálým vývojem nových technologií pro silnici, gravel, MTB, cyklokros, triatlon i dráhu.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
          <h2 className="mb-10 text-center font-display text-3xl uppercase md:text-4xl">Proč TUFO</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <div key={v.title} className="rounded-2xl border border-black/5 bg-[var(--cream)] p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--orange-deep)]/10 text-[var(--orange-deep)]">
                  <v.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-lg uppercase leading-tight">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <h2 className="mb-4 font-display text-3xl uppercase md:text-4xl">Milníky</h2>
        <p className="mb-8 text-sm text-muted-foreground">Najeďte myší na milník pro více informací.</p>
        <div className="space-y-3">
          {TIMELINE.map((t) => (
            <Milestone key={t.year} item={t} />
          ))}
        </div>
      </section>

      {/* Kde nás najdete */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
          <h2 className="mb-10 font-display text-3xl uppercase md:text-4xl">Kde nás najdete</h2>
          <div className="grid gap-8 md:grid-cols-[1fr_1.4fr] md:items-stretch">
            {/* Kontaktní info */}
            <div className="space-y-5">
              <div className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--orange-deep)]/10 text-[var(--orange-deep)]">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-display text-lg uppercase leading-tight">TUFO s.r.o.</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Pražská 2715
                    <br />
                    438 01 Žatec
                    <br />
                    Česká republika
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--orange-deep)]/10 text-[var(--orange-deep)]">
                  <Phone className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Telefon
                  </p>
                  <a href="tel:+420415710811" className="text-sm hover:text-[var(--orange-deep)]">
                    +420 415 710 811
                  </a>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--orange-deep)]/10 text-[var(--orange-deep)]">
                  <Mail className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    E-mail
                  </p>
                  <a href="mailto:tufo@tufo.cz" className="text-sm hover:text-[var(--orange-deep)]">
                    tufo@tufo.cz
                  </a>
                </div>
              </div>

              <a
                href="https://www.google.com/maps/dir/?api=1&destination=TUFO%20s.r.o.%20Pra%C5%BEsk%C3%A1%202715%20%C5%BDatec"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--ink)] px-8 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[var(--orange-deep)]"
              >
                <Navigation className="h-5 w-5" /> Navigovat
              </a>
            </div>

            {/* Mapa (Leaflet, tmavé CARTO dlaždice) */}
            <div className="overflow-hidden rounded-3xl border-2 border-[var(--orange-deep)]/20 shadow-sm">
              <ZatecMap />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[var(--ink)] text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-6 py-16 text-center md:py-20">
          <h2 className="font-display text-3xl uppercase md:text-4xl">Vyzkoušejte kvalitu TUFO</h2>
          <p className="max-w-md text-white/70">
            Objevte naši kolekci závodních plášťů a galusek vyrobených v České republice.
          </p>
          <Link
            to="/"
            hash="shop"
            className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold uppercase tracking-[0.12em] text-[var(--ink)] transition hover:bg-[var(--orange-deep)] hover:text-white"
          >
            Prohlédnout produkty <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function ZatecMap() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: import("leaflet").Map | undefined;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      const el = ref.current as (HTMLDivElement & { _leaflet_id?: number }) | null;
      if (cancelled || !el || el._leaflet_id) return;

      const coords: [number, number] = [50.3274, 13.5453]; // TUFO s.r.o., Žatec
      map = L.map(el, { scrollWheelZoom: false, attributionControl: true }).setView(coords, 15);

      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: "&copy; OpenStreetMap &copy; CARTO",
        maxZoom: 20,
      }).addTo(map);

      const icon = L.divIcon({
        className: "",
        html: `<div style="width:22px;height:22px;border-radius:9999px;background:#f97316;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.5)"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      L.marker(coords, { icon }).addTo(map).bindPopup("TUFO s.r.o.<br>Pražská 2715, Žatec");
    })();

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, []);

  return <div ref={ref} className="h-full min-h-[340px] w-full" />;
}

function CountUp({ value, className }: { value: string; className?: string }) {
  const target = parseInt(value.replace(/\D/g, ""), 10) || 0;
  const suffix = value.replace(/[0-9\s]/g, "");
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, target, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, target]);

  return (
    <div ref={ref} className={className}>
      {display}
      {suffix}
    </div>
  );
}

function Milestone({ item }: { item: (typeof TIMELINE)[number] }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className={`rounded-2xl border transition-colors ${
        open ? "border-[var(--orange-deep)]/30 bg-white" : "border-transparent"
      }`}
    >
      <div className="flex cursor-pointer items-center gap-5 px-4 py-3">
        <div className="w-20 shrink-0 font-display text-xl text-[var(--orange-deep)]">{item.year}</div>
        <div className="border-l-2 border-black/10 pl-5 text-muted-foreground">{item.text}</div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-5 px-4 pb-5 sm:flex-row sm:pl-[6.25rem]">
              <img
                src={item.image}
                alt={item.year}
                className="h-40 w-full shrink-0 rounded-xl object-cover sm:w-56"
              />
              <p className="text-sm leading-relaxed text-muted-foreground">{item.detail}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
