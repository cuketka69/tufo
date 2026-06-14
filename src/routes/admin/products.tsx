import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, Plus, Star, Search } from "lucide-react";
import { toast } from "sonner";

import {
  listProducts,
  listCategories,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/api/eshop.functions";
import type { Product } from "@/lib/eshop-types";
import { PRODUCT_TYPES } from "@/lib/eshop-types";
import { formatPrice } from "@/lib/format";
import { PageHeader, StockBadge, EmptyState } from "@/components/admin/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/admin/products")({
  component: ProductsPage,
});

type FormState = {
  id?: number;
  sku: string;
  name: string;
  type: string;
  category_id: number | null;
  price: number;
  training: number;
  racing: number;
  stock: number;
  description: string;
  color: string;
  featured: boolean;
  active: boolean;
};

const EMPTY: FormState = {
  sku: "",
  name: "",
  type: "Galusky",
  category_id: null,
  price: 0,
  training: 0,
  racing: 0,
  stock: 0,
  description: "",
  color: "",
  featured: false,
  active: true,
};

function ProductsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);

  const products = useQuery({ queryKey: ["admin", "products"], queryFn: () => listProducts() });
  const categories = useQuery({ queryKey: ["admin", "categories"], queryFn: () => listCategories() });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin", "products"] });
    qc.invalidateQueries({ queryKey: ["admin", "stats"] });
  };

  const saveMut = useMutation({
    mutationFn: async (f: FormState) => {
      const payload = {
        sku: f.sku,
        name: f.name,
        type: f.type,
        category_id: f.category_id,
        price: f.price,
        training: f.training,
        racing: f.racing,
        stock: f.stock,
        description: f.description || null,
        color: f.color || null,
        featured: f.featured,
        active: f.active,
      };
      return f.id
        ? updateProduct({ data: { ...payload, id: f.id } })
        : createProduct({ data: payload });
    },
    onSuccess: () => {
      invalidate();
      setOpen(false);
      toast.success(form.id ? "Produkt uložen" : "Produkt vytvořen");
    },
    onError: (e: Error) => toast.error(e.message || "Uložení selhalo"),
  });

  const delMut = useMutation({
    mutationFn: (id: number) => deleteProduct({ data: { id } }),
    onSuccess: () => {
      invalidate();
      toast.success("Produkt smazán");
    },
    onError: (e: Error) => toast.error(e.message || "Smazání selhalo"),
  });

  const filtered = useMemo(() => {
    const list = products.data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q),
    );
  }, [products.data, search]);

  const openNew = () => {
    setForm(EMPTY);
    setOpen(true);
  };
  const openEdit = (p: Product) => {
    setForm({
      id: p.id,
      sku: p.sku,
      name: p.name,
      type: p.type,
      category_id: p.category_id,
      price: p.price,
      training: p.training,
      racing: p.racing,
      stock: p.stock,
      description: p.description ?? "",
      color: p.color ?? "",
      featured: !!p.featured,
      active: !!p.active,
    });
    setOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Produkty"
        subtitle={`${products.data?.length ?? 0} produktů v katalogu`}
        action={
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" /> Nový produkt
          </Button>
        }
      />

      <div className="mb-4 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Hledat podle názvu nebo SKU…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState>Žádné produkty neodpovídají hledání.</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-background">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-medium">Produkt</th>
                <th className="px-4 py-3 font-medium">Typ</th>
                <th className="px-4 py-3 font-medium">Kategorie</th>
                <th className="px-4 py-3 font-medium">Cena</th>
                <th className="px-4 py-3 font-medium">Sklad</th>
                <th className="px-4 py-3 font-medium">Stav</th>
                <th className="px-4 py-3 text-right font-medium">Akce</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 font-medium">
                      {!!p.featured && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
                      {p.name}
                    </div>
                    <div className="text-xs text-muted-foreground">{p.sku}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.type}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.category_name ?? "—"}</td>
                  <td className="px-4 py-3 font-medium">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3">
                    <StockBadge stock={p.stock} />
                  </td>
                  <td className="px-4 py-3">
                    {p.active ? (
                      <span className="text-xs text-emerald-600">Aktivní</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Skrytý</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(`Smazat produkt „${p.name}"?`)) delMut.mutate(p.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{form.id ? "Upravit produkt" : "Nový produkt"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Název">
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>
              <Field label="SKU">
                <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Typ">
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Kategorie">
                <Select
                  value={form.category_id == null ? "none" : String(form.category_id)}
                  onValueChange={(v) =>
                    setForm({ ...form, category_id: v === "none" ? null : Number(v) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Žádná" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Žádná</SelectItem>
                    {(categories.data ?? []).map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Cena (Kč)">
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                />
              </Field>
              <Field label="Sklad (ks)">
                <Input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label={`Trénink (${form.training}%)`}>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={form.training}
                  onChange={(e) => setForm({ ...form, training: Number(e.target.value) })}
                />
              </Field>
              <Field label={`Závod (${form.racing}%)`}>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={form.racing}
                  onChange={(e) => setForm({ ...form, racing: Number(e.target.value) })}
                />
              </Field>
            </div>

            <Field label="Barva">
              <Input
                placeholder="např. Černá, Bílá, Oranžová"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
              />
            </Field>

            <Field label="Popis">
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </Field>

            <div className="flex items-center gap-8">
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={form.featured}
                  onCheckedChange={(v) => setForm({ ...form, featured: v })}
                />
                TOP produkt
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={form.active}
                  onCheckedChange={(v) => setForm({ ...form, active: v })}
                />
                Aktivní v eshopu
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Zrušit
            </Button>
            <Button
              onClick={() => saveMut.mutate(form)}
              disabled={saveMut.isPending || !form.name || !form.sku}
            >
              {saveMut.isPending ? "Ukládám…" : "Uložit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
