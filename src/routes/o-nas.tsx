import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Award, Factory, Globe, Recycle, MapPin, Phone, Mail } from "lucide-react";

import blackLogo from "@/assets/blogo.webp";
import handImg from "@/assets/hand.webp";

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
  { year: "1991", text: "Založení společnosti TUFO a první výroba galusek." },
  { year: "1995", text: "Vývoj unikátní bezdušové technologie pro plášťovky." },
  { year: "2005", text: "Expanze na zahraniční trhy a spolupráce s profi týmy." },
  { year: "2015", text: "Rozšíření sortimentu o gravel a MTB bezdušové pláště." },
  { year: "Dnes", text: "Český výrobce dodávající do více než 60 zemí světa." },
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
              <div className="font-display text-4xl text-[var(--orange-deep)] md:text-5xl">{s.value}</div>
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
        <h2 className="mb-10 font-display text-3xl uppercase md:text-4xl">Milníky</h2>
        <div className="space-y-6">
          {TIMELINE.map((t) => (
            <div key={t.year} className="flex gap-5">
              <div className="w-20 shrink-0 font-display text-xl text-[var(--orange-deep)]">{t.year}</div>
              <div className="border-l-2 border-black/10 pl-5 text-muted-foreground">{t.text}</div>
            </div>
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
            </div>

            {/* Mapa */}
            <div className="overflow-hidden rounded-3xl border border-black/5 shadow-sm">
              <iframe
                title="Mapa — TUFO s.r.o., Žatec"
                src="https://www.google.com/maps?q=TUFO%20s.r.o.%20Pra%C5%BEsk%C3%A1%202715%20%C5%BDatec&z=15&output=embed"
                className="h-full min-h-[340px] w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
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
