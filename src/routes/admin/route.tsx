import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { LayoutDashboard, Package, ShoppingCart, Users, Tags, Store, Settings, Plug } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import blackLogo from "@/assets/blogo.webp";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Přehled", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Produkty", icon: Package },
  { to: "/admin/orders", label: "Objednávky", icon: ShoppingCart },
  { to: "/admin/customers", label: "Zákazníci", icon: Users },
  { to: "/admin/categories", label: "Kategorie", icon: Tags },
  { to: "/admin/nastaveni", label: "Nastavení", icon: Settings },
  { to: "/admin/abra", label: "ABRA", icon: Plug },
] as const;

function AdminLayout() {
  return (
    <div className="min-h-screen bg-muted/30 text-foreground">
      <div className="flex">
        {/* Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r bg-background md:flex">
          <div className="flex h-16 items-center gap-2 border-b px-6">
            <img src={blackLogo} alt="TUFO" className="h-6 w-auto" width={90} height={36} />
            <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
              Admin
            </span>
          </div>
          <nav className="flex flex-1 flex-col gap-1 p-3">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: "exact" in item ? item.exact : false }}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground [&.active]:bg-primary [&.active]:text-primary-foreground"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="border-t p-3">
            <a
              href="/"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Store className="h-4 w-4" />
              Zpět na eshop
            </a>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1">
          {/* Mobile top nav */}
          <div className="flex items-center gap-1 overflow-x-auto border-b bg-background px-3 py-2 md:hidden">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: "exact" in item ? item.exact : false }}
                className="flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent [&.active]:bg-primary [&.active]:text-primary-foreground"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </div>
          <div className="mx-auto max-w-7xl p-4 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}
