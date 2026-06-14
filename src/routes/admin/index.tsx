import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Banknote,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  Clock,
  AlertTriangle,
} from "lucide-react";

import { getDashboardStats } from "@/lib/api/eshop.functions";
import { formatPrice, formatDate } from "@/lib/format";
import { PageHeader, StatusBadge } from "@/components/admin/shared";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

const STATUS_COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#f43f5e"];

function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => getDashboardStats(),
  });

  if (isLoading || !data) {
    return (
      <>
        <PageHeader title="Přehled" subtitle="Souhrn výkonu eshopu" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl border bg-background" />
          ))}
        </div>
      </>
    );
  }

  const cards = [
    { label: "Tržby", value: formatPrice(data.revenue), icon: Banknote, hint: `Ø ${formatPrice(data.avgOrderValue)} / obj.` },
    { label: "Objednávky", value: String(data.orderCount), icon: ShoppingCart, hint: `${data.pendingOrders} nových` },
    { label: "Zákazníci", value: String(data.customerCount), icon: Users },
    { label: "Produkty", value: String(data.productCount), icon: Package, hint: `${data.lowStockCount} dochází` },
  ];

  return (
    <>
      <PageHeader title="Přehled" subtitle="Souhrn výkonu eshopu" />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border bg-background p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{c.label}</span>
              <c.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2 text-2xl font-bold">{c.value}</div>
            {c.hint && <div className="mt-1 text-xs text-muted-foreground">{c.hint}</div>}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border bg-background p-5 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <TrendingUp className="h-4 w-4 text-muted-foreground" /> Tržby (30 dní)
          </div>
          {data.revenueByDay.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data.revenueByDay} margin={{ left: -10, right: 8 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                <XAxis
                  dataKey="day"
                  tickFormatter={(d) => formatDate(d).replace(/\.\d{4}$/, ".")}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis fontSize={11} tickLine={false} axisLine={false} width={48} />
                <Tooltip
                  formatter={(v: number) => [formatPrice(v), "Tržby"]}
                  labelFormatter={(d) => formatDate(d as string)}
                />
                <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl border bg-background p-5">
          <div className="mb-4 text-sm font-semibold">Objednávky dle stavu</div>
          {data.statusCounts.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={data.statusCounts}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {data.statusCounts.map((_, i) => (
                    <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="mt-2 flex flex-wrap gap-3 text-xs">
            {data.statusCounts.map((s, i) => (
              <span key={s.status} className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: STATUS_COLORS[i % STATUS_COLORS.length] }}
                />
                {s.status} ({s.count})
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* Top products */}
        <div className="rounded-xl border bg-background p-5">
          <div className="mb-4 text-sm font-semibold">Nejprodávanější produkty</div>
          {data.topProducts.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.topProducts} layout="vertical" margin={{ left: 10, right: 16 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={130}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip formatter={(v: number) => [`${v} ks`, "Prodáno"]} />
                <Bar dataKey="qty" fill="#f97316" radius={[0, 4, 4, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Low stock */}
        <div className="rounded-xl border bg-background p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <AlertTriangle className="h-4 w-4 text-amber-500" /> Docházející sklad
          </div>
          <ul className="divide-y">
            {data.lowStock.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2.5 text-sm">
                <span className="truncate">
                  {p.name} <span className="text-muted-foreground">· {p.sku}</span>
                </span>
                <span
                  className={
                    p.stock <= 10 ? "font-semibold text-amber-600" : "text-muted-foreground"
                  }
                >
                  {p.stock} ks
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recent orders */}
      <div className="mt-6 rounded-xl border bg-background p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Clock className="h-4 w-4 text-muted-foreground" /> Poslední objednávky
          </div>
          <Link to="/admin/orders" className="text-sm text-primary hover:underline">
            Vše →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="pb-2 font-medium">Číslo</th>
                <th className="pb-2 font-medium">Zákazník</th>
                <th className="pb-2 font-medium">Datum</th>
                <th className="pb-2 font-medium">Stav</th>
                <th className="pb-2 text-right font-medium">Částka</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((o) => (
                <tr key={o.id} className="border-b last:border-0">
                  <td className="py-2.5 font-medium">{o.order_number}</td>
                  <td className="py-2.5">{o.customer_name ?? "—"}</td>
                  <td className="py-2.5 text-muted-foreground">{formatDate(o.created_at)}</td>
                  <td className="py-2.5">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="py-2.5 text-right font-medium">{formatPrice(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
      Zatím nejsou žádná data
    </div>
  );
}
