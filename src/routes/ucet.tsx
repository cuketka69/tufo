import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { User as UserIcon, Mail, Building2, MapPin, Package } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { StatusBadge } from "@/components/admin/shared";
import { getMyAccount } from "@/lib/api/auth.functions";
import { formatPrice, formatDate } from "@/lib/format";

export const Route = createFileRoute("/ucet")({
  head: () => ({ meta: [{ title: "Můj účet — TUFO" }] }),
  component: AccountPage,
});

function AccountPage() {
  const { data, isLoading } = useQuery({ queryKey: ["account"], queryFn: () => getMyAccount() });

  return (
    <div className="min-h-screen bg-[var(--cream)] text-[var(--ink)]">
      <SiteHeader solid />

      <main className="mx-auto max-w-5xl px-6 pt-24 pb-16">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-[var(--orange-deep)]">
          Můj účet
        </p>
        <h1 className="mb-8 font-display text-4xl uppercase md:text-5xl">
          {data?.user.company || data?.user.name || "Vítejte"}
        </h1>

        {isLoading ? (
          <div className="h-40 animate-pulse rounded-2xl bg-black/5" />
        ) : !data ? (
          <p className="text-muted-foreground">Pro zobrazení účtu se přihlaste.</p>
        ) : (
          <div className="grid gap-8 md:grid-cols-[300px_1fr]">
            {/* Údaje */}
            <aside className="space-y-3 rounded-2xl border border-black/5 bg-white p-6 h-fit">
              <h2 className="mb-2 font-display text-lg uppercase">Údaje</h2>
              <Row icon={Mail} value={data.user.email} />
              {data.user.name && <Row icon={UserIcon} value={data.user.name} />}
              {data.user.company && <Row icon={Building2} value={data.user.company} />}
              {data.customer?.ico && (
                <Row icon={Building2} value={`IČO ${data.customer.ico}${data.customer.dic ? ` · DIČ ${data.customer.dic}` : ""}`} />
              )}
              {(data.customer?.address || data.customer?.city) && (
                <Row
                  icon={MapPin}
                  value={[data.customer?.address, data.customer?.zip, data.customer?.city]
                    .filter(Boolean)
                    .join(", ")}
                />
              )}
            </aside>

            {/* Objednávky */}
            <section>
              <h2 className="mb-4 font-display text-lg uppercase">
                Moje objednávky{" "}
                <span className="text-muted-foreground">({data.orders.length})</span>
              </h2>

              {data.orders.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-black/10 bg-white py-16 text-center text-sm text-muted-foreground">
                  <Package className="mx-auto mb-3 h-8 w-8 opacity-40" />
                  Zatím nemáte žádné objednávky.
                  <div>
                    <Link to="/produkty" className="pill-btn pill-btn-hover mt-5 inline-flex">
                      Nakoupit
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-black/5 bg-white">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                        <th className="px-4 py-3 font-medium">Číslo</th>
                        <th className="px-4 py-3 font-medium">Datum</th>
                        <th className="px-4 py-3 font-medium">Položky</th>
                        <th className="px-4 py-3 font-medium">Stav</th>
                        <th className="px-4 py-3 text-right font-medium">Částka</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.orders.map((o) => (
                        <tr key={o.id} className="border-b last:border-0">
                          <td className="px-4 py-3 font-medium">{o.order_number}</td>
                          <td className="px-4 py-3 text-muted-foreground">{formatDate(o.created_at)}</td>
                          <td className="px-4 py-3 text-muted-foreground">{o.items_count} ks</td>
                          <td className="px-4 py-3">
                            <StatusBadge status={o.status} />
                          </td>
                          <td className="px-4 py-3 text-right font-medium">{formatPrice(o.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

function Row({ icon: Icon, value }: { icon: React.ComponentType<{ className?: string }>; value: string }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <span>{value}</span>
    </div>
  );
}
