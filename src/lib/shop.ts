import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { listActiveProducts } from "@/lib/api/eshop.functions";
import type { Product } from "@/lib/eshop-types";

// Záložní ukázkové produkty — zobrazí se, když se z databáze nic nenačte
// (např. na Vercelu, kde lokální SQLite neběží). Jakmile bude zapojená cloud
// databáze s produkty, použijí se automaticky reálná data místo těchto.
const demo = (p: Partial<Product> & Pick<Product, "id" | "sku" | "name" | "type" | "price">): Product => ({
  category_id: null,
  category_name: null,
  training: 0,
  racing: 0,
  stock: 0,
  image: null,
  description: null,
  color: null,
  ean: null,
  vat_rate: 21,
  weight: null,
  unit: "ks",
  brand: "TUFO",
  abra_id: null,
  featured: 0,
  active: 1,
  created_at: "",
  ...p,
});

export const DEMO_PRODUCTS: Product[] = [
  demo({ id: -1, sku: "TUF-S33", name: "Tufo S33 Pro", type: "Galusky", category_name: "Silnice", price: 1490, training: 60, racing: 95, stock: 42, color: "Černá", featured: 1 }),
  demo({ id: -2, sku: "TUF-CAL", name: "Tufo Calibra Plus", type: "Plášťovky", category_name: "Silnice", price: 890, training: 75, racing: 85, stock: 88, color: "Bílá" }),
  demo({ id: -3, sku: "TUF-GSP", name: "Tufo Gravel Speedero", type: "Bezdušové TR", category_name: "Gravel", price: 1290, training: 80, racing: 80, stock: 31, color: "Hnědá", featured: 1 }),
  demo({ id: -4, sku: "TUF-XC6", name: "Tufo XC6 TR", type: "Pláště", category_name: "MTB", price: 1390, training: 70, racing: 90, stock: 12, color: "Oranžová" }),
  demo({ id: -5, sku: "TUF-LEP", name: "Tufo Lepenka tmel", type: "Příslušenství", category_name: "Tmely a lepení", price: 290, stock: 120 }),
  demo({ id: -6, sku: "TUF-VENT", name: "Tufo Galuskový ventilek", type: "Příslušenství", category_name: "Ventilky", price: 90, stock: 200 }),
];

/** Načte aktivní produkty z DB; při prázdném/chybném výsledku vrátí demo data. */
export function useShopProducts() {
  const query = useQuery({ queryKey: ["shop", "products"], queryFn: () => listActiveProducts() });
  const products = useMemo<Product[]>(() => {
    if (query.isLoading) return [];
    const data = query.data ?? [];
    return data.length ? data : DEMO_PRODUCTS;
  }, [query.data, query.isLoading]);
  return { products, isLoading: query.isLoading };
}
