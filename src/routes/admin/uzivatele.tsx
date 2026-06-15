import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, KeyRound } from "lucide-react";
import { toast } from "sonner";

import { listUsers, createUser, setUserActive, resetUserPassword, deleteUser } from "@/lib/api/auth.functions";
import { formatDate } from "@/lib/format";
import { PageHeader, EmptyState } from "@/components/admin/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/uzivatele")({
  component: UsersPage,
});

type FormState = { email: string; password: string; name: string; company: string };
const EMPTY: FormState = { email: "", password: "", name: "", company: "" };

function UsersPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);

  const users = useQuery({ queryKey: ["admin", "users"], queryFn: () => listUsers() });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "users"] });

  const createMut = useMutation({
    mutationFn: (f: FormState) =>
      createUser({ data: { email: f.email, password: f.password, name: f.name, company: f.company } }),
    onSuccess: () => {
      invalidate();
      setOpen(false);
      setForm(EMPTY);
      toast.success("Účet vytvořen");
    },
    onError: (e: Error) => toast.error(e.message || "Vytvoření selhalo"),
  });

  const activeMut = useMutation({
    mutationFn: (v: { id: number; active: boolean }) => setUserActive({ data: v }),
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const delMut = useMutation({
    mutationFn: (id: number) => deleteUser({ data: { id } }),
    onSuccess: () => {
      invalidate();
      toast.success("Účet smazán");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const resetMut = useMutation({
    mutationFn: (v: { id: number; password: string }) => resetUserPassword({ data: v }),
    onSuccess: () => toast.success("Heslo změněno"),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <PageHeader
        title="B2B účty"
        subtitle={`${users.data?.length ?? 0} účtů · přístup do eshopu`}
        action={
          <Button
            onClick={() => {
              setForm(EMPTY);
              setOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Nový účet
          </Button>
        }
      />

      {(users.data?.length ?? 0) === 0 ? (
        <EmptyState>Žádné účty.</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-background">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-medium">E-mail</th>
                <th className="px-4 py-3 font-medium">Jméno / firma</th>
                <th className="px-4 py-3 font-medium">Vytvořeno</th>
                <th className="px-4 py-3 font-medium">Aktivní</th>
                <th className="px-4 py-3 text-right font-medium">Akce</th>
              </tr>
            </thead>
            <tbody>
              {(users.data ?? []).map((u) => (
                <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{u.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {[u.name, u.company].filter(Boolean).join(" · ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(u.created_at)}</td>
                  <td className="px-4 py-3">
                    <Switch
                      checked={!!u.active}
                      onCheckedChange={(v) => activeMut.mutate({ id: u.id, active: v })}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Změnit heslo"
                        onClick={() => {
                          const pwd = prompt(`Nové heslo pro ${u.email}:`);
                          if (pwd && pwd.length >= 4) resetMut.mutate({ id: u.id, password: pwd });
                          else if (pwd) toast.error("Heslo musí mít alespoň 4 znaky.");
                        }}
                      >
                        <KeyRound className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(`Smazat účet ${u.email}?`)) delMut.mutate(u.id);
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
            <DialogTitle>Nový B2B účet</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label className="text-xs">E-mail</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Heslo</Label>
              <Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Jméno (nepovinné)</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Firma (nepovinné)</Label>
              <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Zrušit
            </Button>
            <Button
              onClick={() => createMut.mutate(form)}
              disabled={createMut.isPending || !form.email || form.password.length < 4}
            >
              {createMut.isPending ? "Vytvářím…" : "Vytvořit účet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
