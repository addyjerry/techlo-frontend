"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";

// ── Constants ─────────────────────────────────────────────────────────────────
const DELIVERY_FEE = 30;

const GHANA_REGIONS = [
  "Greater Accra", "Ashanti", "Western", "Central", "Eastern",
  "Northern", "Upper East", "Upper West", "Volta", "Brong-Ahafo",
  "Western North", "Ahafo", "Bono East", "Oti", "North East", "Savannah",
];

// Mobile money network detection based on Ghanaian number prefixes
const NETWORK_PREFIXES: Record<string, { name: string; provider: string; color: string; bg: string; border: string }> = {
  "024": { name: "MTN", provider: "mtn",       color: "#f59e0b", bg: "#f59e0b11", border: "#f59e0b33" },
  "054": { name: "MTN", provider: "mtn",       color: "#f59e0b", bg: "#f59e0b11", border: "#f59e0b33" },
  "055": { name: "MTN", provider: "mtn",       color: "#f59e0b", bg: "#f59e0b11", border: "#f59e0b33" },
  "059": { name: "MTN", provider: "mtn",       color: "#f59e0b", bg: "#f59e0b11", border: "#f59e0b33" },
  "020": { name: "Vodafone", provider: "vod",  color: "#ef4444", bg: "#ef444411", border: "#ef444433" },
  "050": { name: "Vodafone", provider: "vod",  color: "#ef4444", bg: "#ef444411", border: "#ef444433" },
  "026": { name: "AirtelTigo", provider: "tgo", color: "#3b82f6", bg: "#3b82f611", border: "#3b82f633" },
  "056": { name: "AirtelTigo", provider: "tgo", color: "#3b82f6", bg: "#3b82f611", border: "#3b82f633" },
  "027": { name: "AirtelTigo", provider: "tgo", color: "#3b82f6", bg: "#3b82f611", border: "#3b82f633" },
  "057": { name: "AirtelTigo", provider: "tgo", color: "#3b82f6", bg: "#3b82f611", border: "#3b82f633" },
  "028": { name: "AirtelTigo", provider: "tgo", color: "#3b82f6", bg: "#3b82f611", border: "#3b82f633" },
};

const fmt = (n: number) =>
  new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS", maximumFractionDigits: 0 }).format(n);

// ── Network detection hook ────────────────────────────────────────────────────
function detectNetwork(mobile: string) {
  const digits = mobile.replace(/\D/g, "");
  if (digits.length < 3) return null;
  const prefix = digits.startsWith("0") ? digits.slice(0, 3) : "0" + digits.slice(0, 2);
  return NETWORK_PREFIXES[prefix] ?? null;
}

// ── Network badge ─────────────────────────────────────────────────────────────
function NetworkBadge({ mobile }: { mobile: string }) {
  const network = detectNetwork(mobile);
  if (!network) return null;

  const icons: Record<string, React.ReactNode> = {
    mtn: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="6" fill="#f59e0b" opacity="0.2"/>
        <text x="7" y="10.5" textAnchor="middle" fill="#f59e0b" fontSize="7" fontWeight="bold" fontFamily="monospace">M</text>
      </svg>
    ),
    vod: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="6" fill="#ef4444" opacity="0.2"/>
        <text x="7" y="10.5" textAnchor="middle" fill="#ef4444" fontSize="7" fontWeight="bold" fontFamily="monospace">V</text>
      </svg>
    ),
    tgo: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="6" fill="#3b82f6" opacity="0.2"/>
        <text x="7" y="10.5" textAnchor="middle" fill="#3b82f6" fontSize="7" fontWeight="bold" fontFamily="monospace">A</text>
      </svg>
    ),
  };

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[10px] tracking-widest font-bold transition-all duration-300"
      style={{
        color: network.color,
        background: network.bg,
        border: `1px solid ${network.border}`,
        boxShadow: `0 0 8px ${network.bg}`,
      }}
    >
      {icons[network.provider]}
      {network.name} MoMo detected
    </span>
  );
}

// ── Order summary ─────────────────────────────────────────────────────────────
function OrderSummary({ cart }: { cart: ReturnType<typeof useCart>["cart"] }) {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const total    = subtotal + DELIVERY_FEE;

  return (
    <div
      className="bg-[#0d0d1f] border border-[#00f5e022] rounded-2xl overflow-hidden"
      style={{ boxShadow: "0 0 40px #00f5e008" }}
    >
      <div className="px-5 py-4 border-b border-[#00f5e01a]">
        <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#00f5e055]">Order Summary</p>
        <p className="font-mono font-bold text-white text-base mt-0.5">
          {cart.reduce((a, i) => a + i.qty, 0)} item{cart.reduce((a, i) => a + i.qty, 0) !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="px-5 py-4 flex flex-col gap-3 max-h-[280px] overflow-y-auto">
        {cart.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-[#00f5e01a]">
              <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[12px] text-white truncate font-bold">{item.name}</p>
              <p className="font-mono text-[10px] text-[#7baaa8]">Qty: {item.qty}</p>
            </div>
            <p className="font-mono text-[12px] text-[#00f5e0] flex-shrink-0 font-bold">{fmt(item.price * item.qty)}</p>
          </div>
        ))}
      </div>

      <div className="px-5 py-4 border-t border-[#00f5e01a] flex flex-col gap-2">
        <div className="flex justify-between">
          <span className="font-mono text-[11px] text-[#7baaa8] tracking-widest uppercase">Subtotal</span>
          <span className="font-mono text-[12px] text-white">{fmt(subtotal)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-mono text-[11px] text-[#7baaa8] tracking-widest uppercase flex items-center gap-1.5">
            Delivery
            <span className="px-1.5 py-0.5 rounded bg-[#00f5e011] border border-[#00f5e022] text-[#00f5e066] text-[9px]">FLAT</span>
          </span>
          <span className="font-mono text-[12px] text-white">{fmt(DELIVERY_FEE)}</span>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-[#00f5e022] to-transparent my-1" />
        <div className="flex justify-between items-center">
          <span className="font-mono font-bold text-[12px] text-white tracking-widest uppercase">Total</span>
          <span className="font-mono font-bold text-xl text-[#00f5e0]"
            style={{ textShadow: "0 0 12px #00f5e055" }}>{fmt(total)}</span>
        </div>
      </div>
    </div>
  );
}

// ── MoMo payment status modal ─────────────────────────────────────────────────
function MoMoStatusModal({
  network, mobile, amount, status, onClose,
}: {
  network: NonNullable<ReturnType<typeof detectNetwork>>;
  mobile: string;
  amount: number;
  status: "pending" | "success" | "failed";
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#080810]/90 backdrop-blur-xl" />
      <div
        className="relative z-10 w-full max-w-sm bg-[#0d0d1f] border rounded-2xl p-8 text-center"
        style={{
          borderColor: status === "success" ? "#00f5e055" : status === "failed" ? "#ef444455" : network.border,
          boxShadow: `0 0 80px ${status === "success" ? "#00f5e022" : status === "failed" ? "#ef444422" : network.bg}`,
        }}
      >
        {status === "pending" && (
          <>
            {/* Pulsing network ring */}
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div
                className="absolute inset-0 rounded-full animate-ping opacity-30"
                style={{ background: network.color, animationDuration: "1.4s" }}
              />
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center border-2"
                style={{ borderColor: network.border, background: network.bg }}
              >
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M6 16c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10" stroke={network.color} strokeWidth="2" strokeLinecap="round"/>
                  <path d="M16 10v6l4 2" stroke={network.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <p className="font-mono text-[10px] tracking-[0.3em] uppercase mb-2"
              style={{ color: network.color }}>
              {network.name} Mobile Money
            </p>
            <h3 className="font-mono font-bold text-white text-lg mb-2">Confirm on Your Phone</h3>
            <p className="font-mono text-[12px] text-[#7baaa8] mb-1">
              A prompt has been sent to
            </p>
            <p className="font-mono font-bold text-white text-base mb-4">{mobile}</p>
            <div className="px-4 py-3 rounded-xl mb-6"
              style={{ background: network.bg, border: `1px solid ${network.border}` }}>
              <p className="font-mono text-[11px] tracking-widest uppercase mb-1" style={{ color: network.color }}>
                Amount to approve
              </p>
              <p className="font-mono font-bold text-white text-xl">{fmt(amount)}</p>
            </div>
            <p className="font-mono text-[10px] text-[#ffffff33] tracking-widest">
              Enter your {network.name} MoMo PIN to confirm
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-20 h-20 rounded-full border border-[#00f5e044] bg-[#00f5e011] flex items-center justify-center mx-auto mb-6"
              style={{ boxShadow: "0 0 40px #00f5e033" }}>
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <path d="M8 18l7 7 13-13" stroke="#00f5e0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#00f5e066] mb-2">Payment Confirmed</p>
            <h3 className="font-mono font-bold text-white text-lg mb-2">Payment Successful!</h3>
            <p className="font-mono text-[12px] text-[#7baaa8] mb-6">
              {fmt(amount)} debited from your {network.name} MoMo wallet.
            </p>
            <button onClick={onClose}
              className="w-full h-11 rounded-xl bg-[#00f5e0] text-[#080810] font-mono font-bold text-[12px] tracking-widest uppercase hover:bg-[#00ddc9] active:scale-95 transition-all duration-200"
              style={{ boxShadow: "0 0 20px #00f5e033" }}>
              Done
            </button>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="w-20 h-20 rounded-full border border-[#ef444455] bg-[#ef444411] flex items-center justify-center mx-auto mb-6">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <path d="M11 11l14 14M25 11L11 25" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#ef444488] mb-2">Payment Failed</p>
            <h3 className="font-mono font-bold text-white text-lg mb-2">Transaction Declined</h3>
            <p className="font-mono text-[12px] text-[#7baaa8] mb-6">
              Please check your MoMo PIN or balance and try again.
            </p>
            <button onClick={onClose}
              className="w-full h-11 rounded-xl border border-[#ef444444] text-[#ef4444] font-mono font-bold text-[12px] tracking-widest uppercase hover:bg-[#ef444411] active:scale-95 transition-all duration-200">
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main checkout ─────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();

  const [form, setForm] = useState({
    name: "", location: "", region: "", mobile: "", payment: "",
  });
  const [errors, setErrors]         = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [visible, setVisible]       = useState(false);
  const [momoStatus, setMomoStatus] = useState<"idle" | "pending" | "success" | "failed">("idle");

  const detectedNetwork = useMemo(() => detectNetwork(form.mobile), [form.mobile]);
  const isPaystack      = form.payment === "paystack";
  const isMoMo          = isPaystack && !!detectedNetwork;

  useEffect(() => {
    if (cart.length === 0 && !submitted) router.push("/");
    setTimeout(() => setVisible(true), 50);
  }, [cart, submitted, router]);

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const total    = subtotal + DELIVERY_FEE;

  const set = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())     e.name     = "Full name is required";
    if (!form.location.trim()) e.location = "Delivery location is required";
    if (!form.region)          e.region   = "Please select a region";
    if (!form.mobile.trim())   e.mobile   = "Mobile number is required";
    else if (!/^[0-9]{10}$/.test(form.mobile.replace(/\s/g, "")))
                               e.mobile   = "Enter a valid 10-digit number";
    if (!form.payment)         e.payment  = "Please choose a payment method";
    return e;
  };

  // ── Paystack MoMo charge via API ──────────────────────────────────────────
  const initiatePaystackMoMo = async () => {
    if (!detectedNetwork) return;
    setMomoStatus("pending");

    try {
      // Step 1: Initialise a Paystack charge for mobile money
      const res = await fetch("https://api.paystack.co/charge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Replace with your actual Paystack secret key — keep this server-side in production!
          // In production: route through /api/checkout to keep the secret key hidden
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_PAYSTACK_SECRET_KEY}`,
        },
        body: JSON.stringify({
          email: `${form.mobile}@techlo.gh`,  // Paystack requires an email; use a derived one
          amount: total * 100,                 // Paystack uses pesewas (kobo equivalent)
          currency: "GHS",
          mobile_money: {
            phone: form.mobile,
            provider: detectedNetwork.provider, // "mtn" | "vod" | "tgo"
          },
        }),
      });

      const data = await res.json();

      if (data.status && data.data?.status === "send_otp") {
        // Network sent a prompt — poll for completion
        await pollPaystackCharge(data.data.reference);
      } else if (data.data?.status === "success") {
        setMomoStatus("success");
        setTimeout(() => { clearCart(); setSubmitted(true); }, 1800);
      } else {
        setMomoStatus("failed");
      }
    } catch {
      setMomoStatus("failed");
    }
  };

  const pollPaystackCharge = async (reference: string, attempts = 0) => {
    if (attempts > 20) { setMomoStatus("failed"); return; }

    const res  = await fetch(`https://api.paystack.co/charge/${reference}`, {
      headers: { "Authorization": `Bearer ${process.env.NEXT_PUBLIC_PAYSTACK_SECRET_KEY}` },
    });
    const data = await res.json();
    const status = data.data?.status;

    if (status === "success") {
      setMomoStatus("success");
      setTimeout(() => { clearCart(); setSubmitted(true); }, 1800);
    } else if (status === "failed" || status === "abandoned") {
      setMomoStatus("failed");
    } else {
      // Still pending — retry after 3s
      setTimeout(() => pollPaystackCharge(reference, attempts + 1), 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);

    if (isMoMo) {
      setSubmitting(false);
      await initiatePaystackMoMo();
      return;
    }

    if (isPaystack && !isMoMo) {
      // Non-MoMo Paystack: use Paystack inline JS for card payments
      setSubmitting(false);
      // In production: load Paystack inline popup here
      // For now, simulate card flow
      setSubmitting(true);
      await new Promise((r) => setTimeout(r, 1400));
      setSubmitting(false);
      setSubmitted(true);
      clearCart();
      return;
    }

    // Payment on delivery
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitting(false);
    setSubmitted(true);
    clearCart();
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#080810] flex items-center justify-center px-4">
        <style>{`
          @keyframes co-fadein { from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);} }
          .co-anim { animation: co-fadein 0.6s ease both; }
        `}</style>
        <div className="text-center co-anim max-w-md w-full">
          <div className="w-20 h-20 rounded-full border border-[#00f5e044] bg-[#00f5e011] flex items-center justify-center mx-auto mb-6"
            style={{ boxShadow: "0 0 40px #00f5e033" }}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path d="M8 18l7 7 13-13" stroke="#00f5e0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="font-mono text-[11px] tracking-[0.35em] uppercase text-[#00f5e066] mb-2">Order Placed</p>
          <h1 className="font-mono font-bold text-2xl text-white mb-3" style={{ textShadow: "0 0 20px #00f5e022" }}>
            Thank you, {form.name.split(" ")[0]}!
          </h1>
          <p className="font-mono text-[13px] text-[#7baaa8] mb-2">
            Your order of <span className="text-[#00f5e0]">{fmt(total)}</span> has been received.
          </p>
          <p className="font-mono text-[12px] text-[#ffffff33] mb-8">
            {form.payment === "paystack"
              ? `${detectedNetwork ? detectedNetwork.name + " MoMo" : "Card"} payment confirmed.`
              : `Our team will contact you on ${form.mobile} to confirm delivery.`}
          </p>
          <Link href="/"
            className="inline-block px-8 py-3.5 rounded-xl bg-[#00f5e0] text-[#080810]
              font-mono font-bold text-[12px] tracking-widest uppercase
              hover:bg-[#00ddc9] active:scale-95 transition-all duration-200"
            style={{ boxShadow: "0 0 20px #00f5e033" }}>
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080810]">
      <style>{`
        @keyframes co-fadein { from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);} }
        .co-anim { animation: co-fadein 0.55s ease both; }
        .co-input {
          width:100%; height:48px; padding:0 14px;
          background:#080810; border:1px solid #00f5e022; border-radius:12px;
          color:white; font-family:monospace; font-size:13px; outline:none;
          transition:border-color 0.2s, box-shadow 0.2s;
        }
        .co-input:focus { border-color:#00f5e055; box-shadow:0 0 0 1px #00f5e022; }
        .co-input.error { border-color:#f87171; }
        .co-input::placeholder { color:#ffffff33; }
        select.co-input option { background:#0d0d1f; }
        .co-input.momo-detected { border-color:var(--momo-border); box-shadow:0 0 0 1px var(--momo-border); }
      `}</style>

      {/* Nav */}
      <div className="sticky top-0 z-40 bg-[#080810]/95 backdrop-blur-xl border-b border-[#00f5e01a]">
        <div className="max-w-[1000px] mx-auto px-4 md:px-6 h-[60px] flex items-center justify-between">
          <Link href="/" className="font-mono font-bold text-xl tracking-[0.15em] text-white hover:text-[#00f5e0] transition-colors duration-200">
            TECH<span className="text-[#00f5e0]">LO</span>
          </Link>
          <div className="flex items-center gap-3 font-mono text-[11px] tracking-widest uppercase">
            <span className="text-[#00f5e0]">01 Details</span>
            <div className="h-px w-10 bg-[#00f5e022]" />
            <span className="text-[#ffffff33]">02 Payment</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-4 md:px-6 py-10"
        style={{ opacity: visible ? 1 : 0, transition: "opacity 0.4s ease" }}>

        <div className="mb-8 co-anim" style={{ animationDelay: "0.05s" }}>
          <p className="font-mono text-[11px] tracking-[0.35em] uppercase text-[#00f5e066] mb-1">Checkout</p>
          <h1 className="font-mono font-bold text-2xl md:text-3xl text-white" style={{ textShadow: "0 0 24px #00f5e011" }}>
            Complete Your <span className="text-[#00f5e0]" style={{ textShadow: "0 0 16px #00f5e066" }}>Order</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">

            {/* Delivery details */}
            <div className="co-anim bg-[#0d0d1f] border border-[#00f5e022] rounded-2xl p-6"
              style={{ animationDelay: "0.1s", boxShadow: "0 0 40px #00f5e008" }}>
              <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#00f5e055] mb-5">Delivery Details</p>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="font-mono text-[11px] tracking-widest uppercase text-[#7baaa8] mb-2 block">Full Name</label>
                  <input type="text" placeholder="e.g. Kofi Mensah" value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    className={`co-input${errors.name ? " error" : ""}`} />
                  {errors.name && <p className="font-mono text-[10px] text-[#f87171] mt-1.5">{errors.name}</p>}
                </div>

                <div>
                  <label className="font-mono text-[11px] tracking-widest uppercase text-[#7baaa8] mb-2 block">Delivery Location</label>
                  <input type="text" placeholder="e.g. 14 Osu Oxford St, Accra" value={form.location}
                    onChange={(e) => set("location", e.target.value)}
                    className={`co-input${errors.location ? " error" : ""}`} />
                  {errors.location && <p className="font-mono text-[10px] text-[#f87171] mt-1.5">{errors.location}</p>}
                </div>

                <div>
                  <label className="font-mono text-[11px] tracking-widest uppercase text-[#7baaa8] mb-2 block">Region</label>
                  <select value={form.region} onChange={(e) => set("region", e.target.value)}
                    className={`co-input${errors.region ? " error" : ""}`}>
                    <option value="">Select your region</option>
                    {GHANA_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                  {errors.region && <p className="font-mono text-[10px] text-[#f87171] mt-1.5">{errors.region}</p>}
                </div>

                <div>
                  <label className="font-mono text-[11px] tracking-widest uppercase text-[#7baaa8] mb-2 block">Mobile Number</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-[12px] text-[#00f5e066] pointer-events-none select-none">
                      +233
                    </span>
                    <input
                      type="tel"
                      placeholder="0244 000 000"
                      value={form.mobile}
                      onChange={(e) => set("mobile", e.target.value)}
                      style={detectedNetwork ? {
                        "--momo-border": detectedNetwork.border,
                        borderColor: detectedNetwork.border,
                        boxShadow: `0 0 0 1px ${detectedNetwork.border}`,
                      } as React.CSSProperties : undefined}
                      className={`co-input pl-[52px] transition-all duration-300${errors.mobile ? " error" : ""}`}
                    />
                  </div>
                  {/* Live network detection badge */}
                  <div className="mt-2 min-h-[24px]">
                    {form.mobile.replace(/\D/g, "").length >= 3 && (
                      <NetworkBadge mobile={form.mobile} />
                    )}
                    {!detectedNetwork && form.mobile.replace(/\D/g, "").length >= 3 && (
                      <span className="font-mono text-[10px] text-[#ffffff33] tracking-widest">
                        Network not detected
                      </span>
                    )}
                  </div>
                  {errors.mobile && <p className="font-mono text-[10px] text-[#f87171] mt-1">{errors.mobile}</p>}
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="co-anim bg-[#0d0d1f] border border-[#00f5e022] rounded-2xl p-6"
              style={{ animationDelay: "0.18s", boxShadow: "0 0 40px #00f5e008" }}>
              <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#00f5e055] mb-5">Payment Method</p>

              <div className="flex flex-col gap-3">
                {/* Paystack */}
                <button type="button" onClick={() => set("payment", "paystack")}
                  className={[
                    "flex items-start gap-4 p-4 rounded-xl border text-left transition-all duration-200",
                    form.payment === "paystack"
                      ? "border-[#00f5e066] bg-[#00f5e00a] shadow-[0_0_20px_#00f5e011]"
                      : "border-[#00f5e01a] bg-[#080810] hover:border-[#00f5e033]",
                  ].join(" ")}>
                  <div className={["w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200",
                    form.payment === "paystack" ? "border-[#00f5e0]" : "border-[#00f5e033]"].join(" ")}>
                    {form.payment === "paystack" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#00f5e0]" style={{ boxShadow: "0 0 6px #00f5e0" }} />
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-[#00c3ff11] border border-[#00c3ff22] flex items-center justify-center flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <rect x="2" y="5" width="16" height="10" rx="2" stroke="#00c3ff" strokeWidth="1.4"/>
                      <path d="M2 8h16" stroke="#00c3ff" strokeWidth="1.4"/>
                      <rect x="4" y="11" width="4" height="1.5" rx="0.75" fill="#00c3ff"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-mono font-bold text-[13px] text-white">Pay with Paystack</p>
                      {form.payment === "paystack" && (
                        <span className="px-2 py-0.5 rounded-full bg-[#00f5e0] text-[#080810] font-mono text-[9px] font-bold tracking-widest">SELECTED</span>
                      )}
                    </div>
                    <p className="font-mono text-[10px] text-[#7baaa8] mt-0.5">Card, Mobile Money, Bank Transfer</p>

                    {/* MoMo hint when Paystack + number entered */}
                    {form.payment === "paystack" && isMoMo && (
                      <div className="mt-2 flex items-start gap-2 p-2.5 rounded-lg"
                        style={{ background: detectedNetwork!.bg, border: `1px solid ${detectedNetwork!.border}` }}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 mt-px">
                          <circle cx="7" cy="7" r="6" stroke={detectedNetwork!.color} strokeWidth="1.2"/>
                          <path d="M7 5v4M7 4v.5" stroke={detectedNetwork!.color} strokeWidth="1.2" strokeLinecap="round"/>
                        </svg>
                        <p className="font-mono text-[10px] leading-relaxed" style={{ color: detectedNetwork!.color }}>
                          {detectedNetwork!.name} MoMo detected — we&apos;ll send a payment prompt directly to your phone.
                        </p>
                      </div>
                    )}

                    {/* Non-MoMo fallback hint */}
                    {form.payment === "paystack" && isPaystack && !isMoMo && form.mobile.replace(/\D/g, "").length >= 3 && (
                      <div className="mt-2 p-2.5 rounded-lg bg-[#ffffff08] border border-[#ffffff11]">
                        <p className="font-mono text-[10px] text-[#ffffff44]">
                          You&apos;ll be redirected to Paystack to complete payment by card.
                        </p>
                      </div>
                    )}
                  </div>
                </button>

                {/* Payment on delivery */}
                <button type="button" onClick={() => set("payment", "delivery")}
                  className={[
                    "flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200",
                    form.payment === "delivery"
                      ? "border-[#00f5e066] bg-[#00f5e00a] shadow-[0_0_20px_#00f5e011]"
                      : "border-[#00f5e01a] bg-[#080810] hover:border-[#00f5e033]",
                  ].join(" ")}>
                  <div className={["w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200",
                    form.payment === "delivery" ? "border-[#00f5e0]" : "border-[#00f5e033]"].join(" ")}>
                    {form.payment === "delivery" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#00f5e0]" style={{ boxShadow: "0 0 6px #00f5e0" }} />
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-[#a855f711] border border-[#a855f722] flex items-center justify-center flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <rect x="1" y="7" width="12" height="8" rx="1.5" stroke="#a855f7" strokeWidth="1.4"/>
                      <path d="M13 10h3l2 3v2h-5V10z" stroke="#a855f7" strokeWidth="1.4" strokeLinejoin="round"/>
                      <circle cx="5" cy="15.5" r="1.5" stroke="#a855f7" strokeWidth="1.2"/>
                      <circle cx="15" cy="15.5" r="1.5" stroke="#a855f7" strokeWidth="1.2"/>
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-mono font-bold text-[13px] text-white">Payment on Delivery</p>
                      {form.payment === "delivery" && (
                        <span className="px-2 py-0.5 rounded-full bg-[#00f5e0] text-[#080810] font-mono text-[9px] font-bold tracking-widest">SELECTED</span>
                      )}
                    </div>
                    <p className="font-mono text-[10px] text-[#7baaa8] mt-0.5">Pay cash when your order arrives</p>
                  </div>
                </button>

                {errors.payment && <p className="font-mono text-[10px] text-[#f87171]">{errors.payment}</p>}
              </div>
            </div>

            {/* Mobile submit */}
            <button type="submit" disabled={submitting}
              className="lg:hidden w-full h-14 rounded-2xl bg-[#00f5e0] text-[#080810]
                font-mono font-bold text-[13px] tracking-widest uppercase
                hover:bg-[#00ddc9] active:scale-[0.98] disabled:opacity-60
                transition-all duration-200 flex items-center justify-center gap-3"
              style={{ boxShadow: "0 0 24px #00f5e033" }}>
              {submitting ? (
                <>
                  <svg className="animate-spin" width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <circle cx="9" cy="9" r="7" stroke="#08081066" strokeWidth="2"/>
                    <path d="M9 2a7 7 0 0 1 7 7" stroke="#080810" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Processing…
                </>
              ) : isMoMo ? (
                <>Pay {fmt(total)} via {detectedNetwork!.name} MoMo</>
              ) : (
                <>Place Order · {fmt(total)}</>
              )}
            </button>
          </form>

          {/* ── Sidebar ── */}
          <div className="co-anim flex flex-col gap-4 lg:sticky lg:top-[80px]" style={{ animationDelay: "0.22s" }}>
            <OrderSummary cart={cart} />
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="hidden lg:flex w-full h-14 rounded-2xl bg-[#00f5e0] text-[#080810]
                font-mono font-bold text-[13px] tracking-widest uppercase
                hover:bg-[#00ddc9] active:scale-[0.98] disabled:opacity-60
                transition-all duration-200 items-center justify-center gap-3"
              style={{ boxShadow: "0 0 24px #00f5e033" }}>
              {submitting ? (
                <>
                  <svg className="animate-spin" width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <circle cx="9" cy="9" r="7" stroke="#08081066" strokeWidth="2"/>
                    <path d="M9 2a7 7 0 0 1 7 7" stroke="#080810" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Processing…
                </>
              ) : isMoMo ? (
                <>Pay {fmt(total)} via {detectedNetwork!.name} MoMo</>
              ) : (
                <>Place Order · {fmt(total)}</>
              )}
            </button>
            <p className="font-mono text-[10px] text-[#ffffff22] text-center tracking-widest">
              By placing your order you agree to our terms of service
            </p>
          </div>
        </div>
      </div>

      {/* MoMo status modal */}
      {momoStatus !== "idle" && detectedNetwork && (
        <MoMoStatusModal
          network={detectedNetwork}
          mobile={form.mobile}
          amount={total}
          status={momoStatus as "pending" | "success" | "failed"}
          onClose={() => {
            if (momoStatus === "success") {
              clearCart();
              setSubmitted(true);
            }
            setMomoStatus("idle");
          }}
        />
      )}
    </div>
  );
}