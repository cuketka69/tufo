import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Trash2, Search, Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";

import { listCustomers, getCustomer, deleteCustomer } from "@/lib/api/eshop.functions";
import type { Customer, Order } from "@/lib/eshop-types";
import { formatPrice, formatDate } from "@/lib/format";
import { PageHeader, StatusBadge, EmptyState } from "@/components/admin/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/customers")({
  component: CustomersPage,
});

function CustomersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [detailId, setDetailId] = useState<number | null>(null);

  const customers = useQuery({ queryKey: ["admin", "customers"], queryFn: () => listCustomers() });

  const delMut = useMutation({
    mutationFn: (id: number) => deleteCustomer({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "customers"] });
      toast.success("Zákazník smazán");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = useMemo(() => {
    const list = customers.data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q),
    );
  }, [customers.data, search]);

  return (
    <>
      <PageHeader title="Zákazníci" subtitle={`${customers.data?.length ?? 0} registrovaných zákazníků`} />

      <div className="mb-4 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Hledat jméno nebo e-mail…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState>Žádní zákazníci.</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-background">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-medium">Zákazník</th>
                <th className="px-4 py-3 font-medium">Kontakt</th>
                <th className="px-4 py-3 font-medium">Objednávky</th>
                <th className="px-4 py-3 font-medium">Útrata</th>
                <th className="px-4 py-3 font-medium">Registrace</th>
                <th className="px-4 py-3 text-right font-medium">Akce</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <div>{c.email}</div>
                    {c.phone && <div className="text-xs">{c.phone}</div>}
                  </td>
                  <td className="px-4 py-3">{c.order_count ?? 0}</td>
                  <td className="px-4 py-3 font-medium">{formatPrice(c.total_spent ?? 0)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(c.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setDetailId(c.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(`Smazat zákazníka „${c.name}"?`)) delMut.mutate(c.id);
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

      <CustomerDetail id={detailId} onClose={() => setDetailId(null)} />
    </>
  );
}

function CustomerDetail({ id, onClose }: { id: number | null; onClose: () => void }) {
  const { data } = useQuery({
    queryKey: ["admin", "customer", id],
    queryFn: () => getCustomer({ data: { id: id! } }),
    enabled: id != null,
  });

  const customer = data as (Customer & { orders?: Order[] }) | null | undefined;

  return (
    <Dialog open={id != null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{customer?.name ?? "Zákazník"}</DialogTitle>
        </DialogHeader>
        {!customer ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Načítám…</div>
        ) : (
          <div className="space-y-5 py-2 text-sm">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" /> {customer.email}
              </div>
              {customer.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" /> {customer.phone}
                </div>
              )}
              {(customer.address || customer.city) && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {[customer.address, customer.zip, customer.city].filter(Boolean).join(", ")}
                </div>
              )}
            </div>

            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Objednávky ({customer.orders?.length ?? 0})
              </div>
              {customer.orders && customer.orders.length > 0 ? (
                <div className="divide-y rounded-lg border">
                  {customer.orders.map((o) => (
                    <div key={o.id} className="flex items-center justify-between px-3 py-2">
                      <div>
                        <div className="font-medium">{o.order_number}</div>
                        <div className="text-xs text-muted-foreground">{formatDate(o.created_at)}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={o.status} />
                        <span className="font-medium">{formatPrice(o.total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Zatím žádné objednávky.</p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
