import { useState } from "react";
import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Mail, Lock, Copy, Loader2 } from "lucide-react";

const DEMO_EMAIL = "b2b@tufo.cz";
const DEMO_PASSWORD = "tufo1234";

import blackLogo from "@/assets/blogo.webp";
import { Toaster } from "@/components/ui/sonner";
import { login } from "@/lib/api/auth.functions";

export const Route = createFileRoute("/prihlaseni")({
  head: () => ({ meta: [{ title: "Přihlášení — TUFO B2B" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);

  const loginMut = useMutation({
    mutationFn: () => login({ data: { email, password } }),
    onSuccess: async () => {
      // per-záložkový příznak: v této kartě jsme přihlášeni
      try {
        sessionStorage.setItem("tufo-tab-auth", "1");
      } catch {
        /* ignore */
      }
      await router.invalidate();
      navigate({ to: "/" });
    },
    onError: (e: Error) => toast.error(e.message || "Přihlášení selhalo"),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) loginMut.mutate();
  };

  const copy = (value: string) => {
    navigator.clipboard?.writeText(value).then(
      () => toast.success("Zkopírováno"),
      () => toast.error("Kopírování selhalo"),
    );
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--cream)] px-6 text-[var(--ink)]">
      <Toaster position="top-right" richColors />

      <img src={blackLogo} alt="TUFO" className="mb-8 h-10 w-auto" />

      <div className="w-full max-w-sm rounded-3xl border border-black/5 bg-white p-7 shadow-sm">
        <h1 className="text-center font-display text-2xl uppercase">B2B přihlášení</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Vstup je určen pouze pro registrované partnery.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-3">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mail"
              autoFocus
              className="w-full rounded-xl border border-black/10 py-3 pl-11 pr-4 text-sm outline-none focus:border-[var(--ink)]"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Heslo"
              className="w-full rounded-xl border border-black/10 py-3 pl-11 pr-4 text-sm outline-none focus:border-[var(--ink)]"
            />
          </div>

          <button
            type="submit"
            disabled={loginMut.isPending || !email || !password}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--ink)] px-8 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white transition-[background-color,transform] duration-200 ease-out hover:bg-[var(--orange-deep)] active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100"
          >
            {loginMut.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {loginMut.isPending ? "Přihlašuji…" : "Přihlásit se"}
          </button>
        </form>

        {/* Testovací přístup */}
        <div className="mt-5 rounded-xl border border-dashed border-[var(--orange-deep)]/30 bg-[var(--cream)] p-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--orange-deep)]">
            Testovací režim — přihlašovací údaje
          </p>
          <CredRow label="E-mail" value={DEMO_EMAIL} onCopy={() => copy(DEMO_EMAIL)} />
          <CredRow label="Heslo" value={DEMO_PASSWORD} onCopy={() => copy(DEMO_PASSWORD)} />
          <button
            type="button"
            onClick={() => {
              setEmail(DEMO_EMAIL);
              setPassword(DEMO_PASSWORD);
            }}
            className="mt-2 w-full rounded-lg border border-[var(--ink)]/20 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-[var(--ink)] hover:text-white"
          >
            Předvyplnit
          </button>
        </div>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          Nemáte přístup? Účet vám vytvoří správce — kontaktujte nás na{" "}
          <a href="mailto:tufo@tufo.cz" className="font-semibold text-[var(--ink)] hover:underline">
            tufo@tufo.cz
          </a>
          .
        </p>
      </div>
    </div>
  );
}

function CredRow({ label, value, onCopy }: { label: string; value: string; onCopy: () => void }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1 text-sm">
      <span className="text-muted-foreground">{label}:</span>
      <div className="flex items-center gap-2">
        <code className="rounded bg-white px-2 py-0.5 font-mono text-xs">{value}</code>
        <button
          type="button"
          onClick={onCopy}
          aria-label={`Kopírovat ${label.toLowerCase()}`}
          className="text-muted-foreground hover:text-[var(--ink)]"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
