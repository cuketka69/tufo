import silniceImg from "@/assets/silnice.webp";
import gravelImg from "@/assets/gravel.webp";
import mtbImg from "@/assets/mtb.webp";
import cyklokrosImg from "@/assets/cyklokros.webp";
import triatlonImg from "@/assets/triatlon.webp";
import drahaImg from "@/assets/draha.webp";

// Klientská taxonomie eshopu (sekce → kategorie). Slouží jako spolehlivý
// zdroj pro navigaci a filtry (funguje i bez databáze, např. na Vercelu).
// Kategorie v DB mají odpovídající pole `group` (pneu | prislusenstvi).

export type TaxCategory = { slug: string; name: string; img: string | null };
export type TaxSection = { key: "pneu" | "prislusenstvi"; label: string; categories: TaxCategory[] };

export const SECTIONS: TaxSection[] = [
  {
    key: "pneu",
    label: "Pneu",
    categories: [
      { slug: "silnice", name: "Silnice", img: silniceImg },
      { slug: "gravel", name: "Gravel", img: gravelImg },
      { slug: "mtb", name: "MTB", img: mtbImg },
      { slug: "cyklokros", name: "Cyklokros", img: cyklokrosImg },
      { slug: "triatlon", name: "Triatlon", img: triatlonImg },
      { slug: "draha", name: "Dráha", img: drahaImg },
      { slug: "voziky", name: "Vozíčky", img: null },
      { slug: "kolova", name: "Kolová / krasojízda", img: null },
    ],
  },
  {
    key: "prislusenstvi",
    label: "Příslušenství",
    categories: [
      { slug: "tmely", name: "Tmely a lepení", img: null },
      { slug: "ventilky", name: "Ventilky", img: null },
      { slug: "duse", name: "Duše", img: null },
      { slug: "rafkove-pasky", name: "Ráfkové pásky", img: null },
      { slug: "nahradni-dily", name: "Náhradní díly", img: null },
    ],
  },
];

export const PNEU_SECTION = SECTIONS[0];
export const PRISLUSENSTVI_SECTION = SECTIONS[1];

/** Barevný fallback pro kategorie bez obrázku (dle prvního písmene). */
export function categoryFallbackColor(name: string): string {
  const colors = ["#f97316", "#1a1a1a", "#8b5e3c", "#2563eb", "#16a34a", "#9333ea"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return colors[h % colors.length];
}
