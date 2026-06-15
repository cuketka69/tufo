import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Link2 } from "lucide-react";
import { toast } from "sonner";

import { getSettings, saveSettings } from "@/lib/api/eshop.functions";
import { DEFAULT_SETTINGS, type ShopSettings } from "@/lib/eshop-types";
import { PageHeader } from "@/components/admin/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/admin/abra")({
  component: AbraPage,
});

function AbraPage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin", "settings"], queryFn: () => getSettings() });
  const [s, setS] = useState<ShopSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    if (data) setS(data);
  }, [data]);

  const setAbra = (patch: Partial<ShopSettings["abra"]>) =>
    setS((prev) => ({ ...prev, abra: { ...prev.abra, ...patch } }));

  const save = useMutation({
    mutationFn: () => saveSettings({ data: s }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "settings"] });
      toast.success("Napojení uloženo");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <PageHeader title="ABRA" subtitle="Napojení na ABRA Flexi (ERP)" />

      <div className="max-w-2xl space-y-6">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          <strong>Příprava napojení.</strong> Synchronizace zatím není aktivní — ukládají se jen
          přístupové údaje. ABRA bude „master" pro produkty, ceny a sklad (stahují se do eshopu),
          objednávky se budou odesílat do ABRA.
        </div>

        <div className="rounded-xl border bg-background p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg uppercase">Přístupové údaje</h2>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={s.abra.enabled} onCheckedChange={(v) => setAbra({ enabled: v })} />
              Aktivní
            </label>
          </div>
          <div className="space-y-4">
            <div className="grid gap-1.5">
              <Label className="text-xs">URL serveru</Label>
              <Input
                placeholder="https://demo.flexibee.eu"
                value={s.abra.url}
                onChange={(e) => setAbra({ url: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Firma / evidence (companyId)</Label>
              <Input
                placeholder="napr. tufo_sro"
                value={s.abra.company}
                onChange={(e) => setAbra({ company: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Uživatel</Label>
              <Input
                placeholder="API uživatel"
                value={s.abra.username}
                onChange={(e) => setAbra({ username: e.target.value })}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Heslo / API token se nastaví bezpečně přes serverovou proměnnou prostředí (ne v
              databázi) — doplníme při zprovoznění synchronizace.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 border-t pt-5">
            <Button onClick={() => save.mutate()} disabled={save.isPending}>
              <Link2 className="h-4 w-4" /> {save.isPending ? "Ukládám…" : "Uložit napojení"}
            </Button>
            <Button
              variant="outline"
              disabled
              title="Synchronizace zatím není k dispozici"
            >
              <RefreshCw className="h-4 w-4" /> Synchronizovat (brzy)
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
