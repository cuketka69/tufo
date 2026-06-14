import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/api/eshop.functions";
import type { Category } from "@/lib/eshop-types";
import { PageHeader, EmptyState } from "@/components/admin/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/categories")({
  component: CategoriesPage,
});

type FormState = { id?: number; slug: string; name: string; sort: number };
const EMPTY: FormState = { slug: "", name: "", sort: 0 };

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function CategoriesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);

  const categories = useQuery({ queryKey: ["admin", "categories"], queryFn: () => listCategories() });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "categories"] });

  const saveMut = useMutation({
    mutationFn: async (f: FormState) => {
      if (f.id) {
        await updateCategory({ data: { id: f.id, slug: f.slug, name: f.name, sort: f.sort } });
      } else {
        await createCategory({ data: { slug: f.slug, name: f.name, sort: f.sort } });
      }
    },
    onSuccess: () => {
      invalidate();
      setOpen(false);
      toast.success(form.id ? "Kategorie uložena" : "Kategorie vytvořena");
    },
    onError: (e: Error) => toast.error(e.message || "Uložení selhalo"),
  });

  const delMut = useMutation({
    mutationFn: (id: number) => deleteCategory({ data: { id } }),
    onSuccess: () => {
      invalidate();
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Kategorie smazána");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openNew = () => {
    setForm(EMPTY);
    setOpen(true);
  };
  const openEdit = (c: Category) => {
    setForm({ id: c.id, slug: c.slug, name: c.name, sort: c.sort });
    setOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Kategorie"
        subtitle={`${categories.data?.length ?? 0} kategorií`}
        action={
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" /> Nová kategorie
          </Button>
        }
      />

      {(categories.data?.length ?? 0) === 0 ? (
        <EmptyState>Žádné kategorie.</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-background">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-medium">Název</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Pořadí</th>
                <th className="px-4 py-3 font-medium">Produktů</th>
                <th className="px-4 py-3 text-right font-medium">Akce</th>
              </tr>
            </thead>
            <tbody>
              {(categories.data ?? []).map((c) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.slug}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.sort}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.product_count ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(`Smazat kategorii „${c.name}"?`)) delMut.mutate(c.id);
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{form.id ? "Upravit kategorii" : "Nová kategorie"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label className="text-xs">Název</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    name: e.target.value,
                    slug: f.id ? f.slug : slugify(e.target.value),
                  }))
                }
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Pořadí</Label>
              <Input
                type="number"
                value={form.sort}
                onChange={(e) => setForm({ ...form, sort: Number(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Zrušit
            </Button>
            <Button
              onClick={() => saveMut.mutate(form)}
              disabled={saveMut.isPending || !form.name || !form.slug}
            >
              {saveMut.isPending ? "Ukládám…" : "Uložit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
