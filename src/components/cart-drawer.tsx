import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

import productTire from "@/assets/product-tire.jpg";
import { createOrder } from "@/lib/api/eshop.functions";
import { useCart } from "@/lib/cart";

type CheckoutForm = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  note: string;
};

const EMPTY_CHECKOUT: CheckoutForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  zip: "",
  note: "",
};

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { cart, setCart, total, clear } = useCart();
  const [step, setStep] = useState<"cart" | "checkout">("cart");
  const [form, setForm] = useState<CheckoutForm>(EMPTY_CHECKOUT);

  const setQty = (id: number, d: number) =>
    setCart((c) =>
      c.flatMap((x) => {
        if (x.p.id !== id) return [x];
        const q = x.qty + d;
        return q <= 0 ? [] : [{ ...x, qty: q }];
      }),
    );

  const orderMut = useMutation({
    mutationFn: () =>
      createOrder({
        data: {
          customer: {
            name: form.name,
            email: form.email,
            phone: form.phone || undefined,
            address: form.address || undefined,
            city: form.city || undefined,
            zip: form.zip || undefined,
          },
          items: cart.map((x) => ({ product_id: x.p.id, qty: x.qty })),
          note: form.note || undefined,
        },
      }),
    onSuccess: (res) => {
      toast.success(`Objednávka ${res.order_number} odeslána. Děkujeme!`);
      clear();
      setForm(EMPTY_CHECKOUT);
      setStep("cart");
      onClose();
    },
    onError: (e: Error) => toast.error(e.message || "Objednávku se nepodařilo odeslat"),
  });

  const upd =
    (k: keyof CheckoutForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[60]"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-white z-[70] flex flex-col text-[var(--ink)]"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="font-display text-xl uppercase">
                {step === "cart" ? "Košík" : "Pokladna"}
              </h3>
              <button
                onClick={() => {
                  setStep("cart");
                  onClose();
                }}
                className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {step === "cart" ? (
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 && (
                  <p className="text-center text-muted-foreground py-12 text-sm">
                    Váš košík je prázdný.
                  </p>
                )}
                {cart.map(({ p, qty }) => (
                  <div key={p.id} className="flex gap-4 items-center">
                    <img
                      src={p.image || productTire}
                      alt=""
                      className="w-16 h-16 rounded-lg object-cover bg-[var(--cream)]"
                    />
                    <div className="flex-1">
                      <p className="font-display text-sm uppercase">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.type}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => setQty(p.id, -1)}
                          className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-bold w-5 text-center">{qty}</span>
                        <button
                          onClick={() => setQty(p.id, 1)}
                          className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <span className="font-bold">{p.price * qty} Kč</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                <CheckoutInput placeholder="Jméno a příjmení *" value={form.name} onChange={upd("name")} />
                <CheckoutInput placeholder="E-mail *" type="email" value={form.email} onChange={upd("email")} />
                <CheckoutInput placeholder="Telefon" value={form.phone} onChange={upd("phone")} />
                <CheckoutInput placeholder="Ulice a číslo" value={form.address} onChange={upd("address")} />
                <div className="grid grid-cols-2 gap-3">
                  <CheckoutInput placeholder="PSČ" value={form.zip} onChange={upd("zip")} />
                  <CheckoutInput placeholder="Město" value={form.city} onChange={upd("city")} />
                </div>
                <textarea
                  placeholder="Poznámka k objednávce"
                  value={form.note}
                  onChange={upd("note")}
                  rows={3}
                  className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-[var(--ink)]"
                />
                <div className="pt-2 space-y-2 text-sm">
                  {cart.map(({ p, qty }) => (
                    <div key={p.id} className="flex justify-between text-muted-foreground">
                      <span>
                        {p.name} × {qty}
                      </span>
                      <span>{p.price * qty} Kč</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t p-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Celkem</span>
                <span className="font-black text-xl">{total} Kč</span>
              </div>
              {step === "cart" ? (
                <button
                  onClick={() => setStep("checkout")}
                  className="pill-btn pill-btn-hover w-full justify-center"
                  disabled={cart.length === 0}
                >
                  Přejít k pokladně
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => orderMut.mutate()}
                    className="pill-btn pill-btn-hover w-full justify-center"
                    disabled={orderMut.isPending || !form.name || !form.email}
                  >
                    {orderMut.isPending ? "Odesílám…" : "Odeslat objednávku"}
                  </button>
                  <button
                    onClick={() => setStep("cart")}
                    className="w-full text-center text-sm text-muted-foreground hover:text-[var(--ink)]"
                  >
                    ← Zpět do košíku
                  </button>
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function CheckoutInput({
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-[var(--ink)]"
    />
  );
}
