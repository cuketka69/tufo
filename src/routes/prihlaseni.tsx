import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Mail, Lock, User as UserIcon } from "lucide-react";

import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/prihlaseni")({
  head: () => ({
    meta: [{ title: "Přihlášení — TUFO" }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info("Přihlašování zatím není aktivní — připravujeme.");
  };

  return (
    <div className="min-h-screen bg-[var(--cream)] text-[var(--ink)]">
      <SiteHeader solid />

      <main className="mx-auto flex max-w-md flex-col px-6 pt-28 pb-16">
        <h1 className="mb-2 text-center font-display text-4xl uppercase">
          {mode === "login" ? "Přihlášení" : "Registrace"}
        </h1>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          {mode === "login"
            ? "Přihlaste se ke svému účtu TUFO."
            : "Vytvořte si nový účet TUFO."}
        </p>

        {/* Přepínač */}
        <div className="mb-6 grid grid-cols-2 rounded-full border border-black/10 bg-white p-1 text-sm font-bold uppercase tracking-wider">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-full py-2.5 transition-colors ${
                mode === m ? "bg-[var(--ink)] text-white" : "text-muted-foreground hover:text-[var(--ink)]"
              }`}
            >
              {m === "login" ? "Přihlásit" : "Registrovat"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-3 rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
          {mode === "register" && (
            <AuthInput icon={UserIcon} type="text" placeholder="Jméno a příjmení" />
          )}
          <AuthInput icon={Mail} type="email" placeholder="E-mail" />
          <AuthInput icon={Lock} type="password" placeholder="Heslo" />

          {mode === "login" && (
            <div className="text-right">
              <button type="button" className="text-xs font-semibold text-[var(--orange-deep)] hover:underline">
                Zapomněli jste heslo?
              </button>
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-full bg-[var(--ink)] px-8 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[var(--orange-deep)]"
          >
            {mode === "login" ? "Přihlásit se" : "Vytvořit účet"}
          </button>

          <p className="pt-1 text-center text-sm text-muted-foreground">
            {mode === "login" ? "Nemáte účet? " : "Už máte účet? "}
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="font-semibold text-[var(--ink)] hover:text-[var(--orange-deep)]"
            >
              {mode === "login" ? "Zaregistrujte se" : "Přihlaste se"}
            </button>
          </p>
        </form>
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
}

function AuthInput({
  icon: Icon,
  type,
  placeholder,
}: {
  icon: React.ComponentType<{ className?: string }>;
  type: string;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type={type}
        placeholder={placeholder}
        className="w-full rounded-xl border border-black/10 py-3 pl-11 pr-4 text-sm outline-none focus:border-[var(--ink)]"
      />
    </div>
  );
}
