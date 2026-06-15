import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { getSettings, saveSettings } from "@/lib/api/eshop.functions";
import { DEFAULT_SETTINGS, type ShopSettings } from "@/lib/eshop-types";
import { PageHeader } from "@/components/admin/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/nastaveni")({
  component: SettingsPage,
});

function SettingsPage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin", "settings"], queryFn: () => getSettings() });
  const [s, setS] = useState<ShopSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    if (data) setS(data);
  }, [data]);

  const save = useMutation({
    mutationFn: () => saveSettings({ data: s }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "settings"] });
      toast.success("Nastavení uloženo");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <PageHeader
        title="Nastavení"
        subtitle="Základní údaje obchodu, doprava, platba a DPH"
        action={
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? "Ukládám…" : "Uložit změny"}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Obchod */}
        <Card title="Údaje obchodu">
          <Row label="Název obchodu">
            <Input value={s.shopName} onChange={(e) => setS({ ...s, shopName: e.target.value })} />
          </Row>
          <Row label="E-mail">
            <Input value={s.email} onChange={(e) => setS({ ...s, email: e.target.value })} />
          </Row>
          <Row label="Telefon">
            <Input value={s.phone} onChange={(e) => setS({ ...s, phone: e.target.value })} />
          </Row>
          <Row label="Sazby DPH (%)">
            <Input
              value={s.vatRates.join(", ")}
              onChange={(e) =>
                setS({
                  ...s,
                  vatRates: e.target.value
                    .split(",")
                    .map((x) => parseInt(x.trim(), 10))
                    .filter((n) => !isNaN(n)),
                })
              }
            />
          </Row>
        </Card>

        {/* Doprava */}
        <Card title="Způsoby dopravy">
          <div className="space-y-2">
            {s.deliveryMethods.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={d.name}
                  placeholder="Název"
                  onChange={(e) => {
                    const dm = [...s.deliveryMethods];
                    dm[i] = { ...dm[i], name: e.target.value };
                    setS({ ...s, deliveryMethods: dm });
                  }}
                />
                <Input
                  type="number"
                  className="w-28"
                  value={d.price}
                  onChange={(e) => {
                    const dm = [...s.deliveryMethods];
                    dm[i] = { ...dm[i], price: Number(e.target.value) };
                    setS({ ...s, deliveryMethods: dm });
                  }}
                />
                <span className="text-sm text-muted-foreground">Kč</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setS({ ...s, deliveryMethods: s.deliveryMethods.filter((_, j) => j !== i) })
                  }
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setS({ ...s, deliveryMethods: [...s.deliveryMethods, { name: "", price: 0 }] })
              }
            >
              <Plus className="h-4 w-4" /> Přidat dopravu
            </Button>
          </div>
        </Card>

        {/* Platba */}
        <Card title="Způsoby platby">
          <div className="space-y-2">
            {s.paymentMethods.map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={p}
                  placeholder="Název"
                  onChange={(e) => {
                    const pm = [...s.paymentMethods];
                    pm[i] = e.target.value;
                    setS({ ...s, paymentMethods: pm });
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setS({ ...s, paymentMethods: s.paymentMethods.filter((_, j) => j !== i) })
                  }
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setS({ ...s, paymentMethods: [...s.paymentMethods, ""] })}
            >
              <Plus className="h-4 w-4" /> Přidat platbu
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-background p-5">
      <h2 className="mb-4 font-display text-lg uppercase">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
