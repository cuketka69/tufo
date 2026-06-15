import { useRef, useState } from "react";
import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Mail, Lock, Copy } from "lucide-react";

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
  const [filling, setFilling] = useState(false);
  const [exiting, setExiting] = useState(false);
  const loginOk = useRef(false);
  const fillDone = useRef(false);

  // Naviguj na úvodku až když je tlačítko zaplněné A přihlášení proběhlo
  const finish = () => {
    if (!loginOk.current || !fillDone.current) return;
    setExiting(true);
    setTimeout(() => navigate({ to: "/" }), 360);
  };

  const loginMut = useMutation({
    mutationFn: () => login({ data: { email, password } }),
    onSuccess: async () => {
      try {
        sessionStorage.setItem("tufo-tab-auth", "1");
      } catch {
        /* ignore */
      }
      await router.invalidate();
      loginOk.current = true;
      finish();
    },
    onError: (e: Error) => {
      setFilling(false);
      fillDone.current = false;
      loginOk.current = false;
      toast.error(e.message || "Přihlášení selhalo");
    },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || filling) return;
    fillDone.current = false;
    loginOk.current = false;
    setFilling(true);
    loginMut.mutate();
  };

  const copy = (value: string) => {
    navigator.clipboard?.writeText(value).then(
      () => toast.success("Zkopírováno"),
      () => toast.error("Kopírování selhalo"),
    );
  };

  return (
    <motion.div
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: 0.36, ease: [0.23, 1, 0.32, 1] }}
      className="flex min-h-screen flex-col items-center justify-center bg-[var(--cream)] px-6 text-[var(--ink)]"
    >
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
            disabled={filling || !email || !password}
            className="relative w-full overflow-hidden rounded-full bg-[var(--ink)] px-8 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white transition-transform duration-200 ease-out active:scale-[0.97] disabled:active:scale-100"
          >
            <motion.span
              aria-hidden
              className="absolute inset-0 origin-left bg-[var(--orange-deep)]"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: filling ? 1 : 0 }}
              transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
              onAnimationComplete={() => {
                if (filling) {
                  fillDone.current = true;
                  finish();
                }
              }}
            />
            <span className="relative z-10">{filling ? "Přihlašuji…" : "Přihlásit se"}</span>
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
    </motion.div>
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
