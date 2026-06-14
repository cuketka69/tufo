import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

/**
 * Černé tlačítko: na hover oranžové ohraničení (zůstává černé), po kliknutí
 * se zleva vyplní oranžovou a po dokončení animace zavolá `onComplete`.
 */
export function FillButton({
  children,
  onComplete,
  className,
}: {
  children: ReactNode;
  onComplete: () => void;
  className?: string;
}) {
  const [filling, setFilling] = useState(false);

  return (
    <button
      onClick={() => setFilling(true)}
      disabled={filling}
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden rounded-full border-2 border-transparent bg-[var(--ink)] px-8 py-4 text-xs font-bold uppercase tracking-[0.12em] text-white transition-colors hover:border-[var(--orange-deep)]",
        className,
      )}
    >
      <motion.span
        aria-hidden
        className="absolute inset-0 origin-left bg-[var(--orange-deep)]"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: filling ? 1 : 0 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
        onAnimationComplete={() => {
          if (filling) onComplete();
        }}
      />
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </button>
  );
}
