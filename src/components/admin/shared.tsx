import type { ReactNode } from "react";
import type { OrderStatus } from "@/lib/eshop-types";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  nová: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  zaplacená: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  odeslaná: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  doručená: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  zrušená: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
        STATUS_STYLES[status] ?? "bg-muted text-muted-foreground",
      )}
    >
      {status}
    </span>
  );
}

export function StockBadge({ stock }: { stock: number }) {
  const tone =
    stock <= 0
      ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
      : stock <= 10
        ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300";
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", tone)}>
      {stock <= 0 ? "Vyprodáno" : `${stock} ks`}
    </span>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed bg-background py-16 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}
