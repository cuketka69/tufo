import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

import { listOrders, getOrder, updateOrderStatus, deleteOrder } from "@/lib/api/eshop.functions";
import type { Order, OrderItem } from "@/lib/eshop-types";
import { ORDER_STATUSES } from "@/lib/eshop-types";
import { formatPrice, formatDateTime } from "@/lib/format";
import { PageHeader, StatusBadge, EmptyState } from "@/components/admin/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
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

export const Route = createFileRoute("/admin/orders")({
  component: OrdersPage,
});

function OrdersPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [detailId, setDetailId] = useState<number | null>(null);

  const orders = useQuery({ queryKey: ["admin", "orders"], queryFn: () => listOrders() });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin", "orders"] });
    qc.invalidateQueries({ queryKey: ["admin", "stats"] });
  };

  const statusMut = useMutation({
    mutationFn: (v: { id: number; status: (typeof ORDER_STATUSES)[number] }) =>
      updateOrderStatus({ data: v }),
    onSuccess: () => {
      invalidate();
      qc.invalidateQueries({ queryKey: ["admin", "order"] });
      toast.success("Stav objednávky změněn");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const delMut = useMutation({
    mutationFn: (id: number) => deleteOrder({ data: { id } }),
    onSuccess: () => {
      invalidate();
      toast.success("Objednávka smazána");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = useMemo(() => {
    let list = orders.data ?? [];
    if (statusFilter !== "all") list = list.filter((o) => o.status === statusFilter);
    const q = search.trim().toLowerCase();
    if (q)
      list = list.filter(
        (o) =>
          o.order_number.toLowerCase().includes(q) ||
          (o.customer_name ?? "").toLowerCase().includes(q) ||
          (o.customer_email ?? "").toLowerCase().includes(q),
      );
    return list;
  }, [orders.data, statusFilter, search]);

  return (
    <>
      <PageHeader title="Objednávky" subtitle={`${orders.data?.length ?? 0} objednávek celkem`} />

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Hledat číslo / zákazníka…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Všechny stavy</SelectItem>
            {ORDER_STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState>Žádné objednávky.</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-background">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-medium">Číslo</th>
                <th className="px-4 py-3 font-medium">Zákazník</th>
                <th className="px-4 py-3 font-medium">Datum</th>
                <th className="px-4 py-3 font-medium">Položky</th>
                <th className="px-4 py-3 font-medium">Stav</th>
                <th className="px-4 py-3 font-medium">Částka</th>
                <th className="px-4 py-3 text-right font-medium">Akce</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{o.order_number}</td>
                  <td className="px-4 py-3">
                    <div>{o.customer_name ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{o.customer_email}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDateTime(o.created_at)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{o.items_count} ks</td>
                  <td className="px-4 py-3">
                    <Select
                      value={o.status}
                      onValueChange={(v) =>
                        statusMut.mutate({ id: o.id, status: v as (typeof ORDER_STATUSES)[number] })
                      }
                    >
                      <SelectTrigger className="h-7 w-36 border-0 bg-transparent p-0 shadow-none focus:ring-0">
                        <StatusBadge status={o.status} />
                      </SelectTrigger>
                      <SelectContent>
                        {ORDER_STATUSES.map((s) => (
                          <SelectItem key={s} value={s} className="capitalize">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3 font-medium">{formatPrice(o.total)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setDetailId(o.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(`Smazat objednávku ${o.order_number}?`)) delMut.mutate(o.id);
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

      <OrderDetail id={detailId} onClose={() => setDetailId(null)} />
    </>
  );
}

function OrderDetail({ id, onClose }: { id: number | null; onClose: () => void }) {
  const { data } = useQuery({
    queryKey: ["admin", "order", id],
    queryFn: () => getOrder({ data: { id: id! } }),
    enabled: id != null,
  });

  const order = data as
    | (Order & { items?: OrderItem[]; phone?: string; address?: string; city?: string; zip?: string })
    | null
    | undefined;

  return (
    <Dialog open={id != null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {order?.order_number ?? "Objednávka"}
            {order && <StatusBadge status={order.status} />}
          </DialogTitle>
        </DialogHeader>
        {!order ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Načítám…</div>
        ) : (
          <div className="space-y-5 py-2 text-sm">
            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Zákazník
              </div>
              <div className="font-medium">{order.customer_name ?? "—"}</div>
              <div className="text-muted-foreground">{order.customer_email}</div>
              {order.phone && <div className="text-muted-foreground">{order.phone}</div>}
              {(order.address || order.city) && (
                <div className="text-muted-foreground">
                  {[order.address, order.zip, order.city].filter(Boolean).join(", ")}
                </div>
              )}
            </div>

            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Položky
              </div>
              <div className="divide-y rounded-lg border">
                {order.items?.map((it) => (
                  <div key={it.id} className="flex items-center justify-between px-3 py-2">
                    <span>
                      {it.name} <span className="text-muted-foreground">× {it.qty}</span>
                    </span>
                    <span className="font-medium">{formatPrice(it.price * it.qty)}</span>
                  </div>
                ))}
              </div>
            </div>

            {order.note && (
              <div>
                <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Poznámka
                </div>
                <p className="text-muted-foreground">{order.note}</p>
              </div>
            )}

            <div className="flex items-center justify-between border-t pt-3 text-base font-bold">
              <span>Celkem</span>
              <span>{formatPrice(order.total)}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Vytvořeno {formatDateTime(order.created_at)}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
