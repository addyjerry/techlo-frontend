"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useSearch } from "@/app/context/SearchContext";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  condition: "Like New" | "Good" | "Fair";
  image: string;
  badge?: string;
  specs: string[];
  inStock: number;
}

interface CartItem extends Product { qty: number; }

// ── Data ──────────────────────────────────────────────────────────────────────
const PRODUCTS: Product[] = [
  {
    id: "p1", name: "iPhone 13 Pro", category: "Phones",
    price: 2800, originalPrice: 4200, condition: "Like New",
    image: "/icons/iphone.jpg", badge: "Hot Deal",
    specs: ["256GB", "Sierra Blue", "Battery 91%"], inStock: 3,
  },
  {
    id: "p2", name: "MacBook Pro M1", category: "Laptops",
    price: 5500, originalPrice: 8900, condition: "Good",
    image: "/icons/macbook1.jpg", badge: "Popular",
    specs: ["8GB RAM", "256GB SSD", "Space Grey"], inStock: 2,
  },
  {
    id: "p3", name: "Sony WH-1000XM5", category: "Audio",
    price: 950, originalPrice: 1800, condition: "Like New",
    image: "/icons/sony-headset.jpg",
    specs: ["Noise Cancelling", "30hr Battery", "Black"], inStock: 5,
  },
  {
    id: "p4", name: "Samsung Galaxy S22", category: "Phones",
    price: 1900, originalPrice: 3200, condition: "Good",
    image: "/icons/samsung.png", badge: "Low Stock",
    specs: ["128GB", "Phantom Black", "Battery 88%"], inStock: 1,
  },
  {
    id: "p5", name: "Canon EOS R50", category: "Cameras",
    price: 3400, originalPrice: 5200, condition: "Like New",
    image: "/icons/camera.jpg",
    specs: ["24.2MP", "4K Video", "White"], inStock: 2,
  },
  {
    id: "p6", name: "PlayStation 5", category: "Gaming",
    price: 3800, originalPrice: 5500, condition: "Good",
    image: "/icons/ps5.jpg", badge: "Rare Find",
    specs: ["825GB SSD", "Disc Edition", "White"], inStock: 1,
  },
  {
    id: "p7", name: "iPad Air 5th Gen", category: "Tablets",
    price: 2100, originalPrice: 3400, condition: "Like New",
    image: "/icons/ipad.jpg",
    specs: ["64GB", "Wi-Fi", "Starlight"], inStock: 4,
  },
  {
    id: "p8", name: "Apple Watch Series 8", category: "Wearables",
    price: 1400, originalPrice: 2300, condition: "Like New",
    image: "/icons/apple-watch.webp",
    specs: ["45mm", "GPS", "Midnight"], inStock: 3,
  },
];

const CONDITION_COLORS: Record<Product["condition"], string> = {
  "Like New": "text-[#00f5e0] border-[#00f5e033]",
  "Good":     "text-[#a855f7] border-[#a855f733]",
  "Fair":     "text-[#f59e0b] border-[#f59e0b33]",
};

const DELIVERY_FEE = 30;

const fmt = (n: number) =>
  new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS", maximumFractionDigits: 0 }).format(n);

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div
      className={["fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-xl",
        "bg-[#0d0d1f] border border-[#00f5e055] font-mono text-sm text-[#00f5e0]",
        "transition-all duration-300 whitespace-nowrap pointer-events-none",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"].join(" ")}
      style={{ boxShadow: "0 0 32px #00f5e022" }}
    >
      ✓ &nbsp;{message}
    </div>
  );
}

// ── Basket Modal ──────────────────────────────────────────────────────────────
function BasketModal({
  cart, onUpdateQty, onRemove, onClose, onCheckout,
}: {
  cart: CartItem[];
  onUpdateQty: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
  onCheckout: () => void;
}) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const total    = subtotal + DELIVERY_FEE;
  const totalItems = cart.reduce((a, i) => a + i.qty, 0);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-[#080810]/85 backdrop-blur-md" />

      <div
        className="relative z-10 w-full max-w-lg max-h-[90vh] flex flex-col
          bg-[#0d0d1f] border border-[#00f5e033] rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 0 80px #00f5e011, 0 32px 64px #00000099" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#00f5e01a] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#00f5e011] border border-[#00f5e033] flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M2 3h1.5l2 8h7l2-6H5.5" stroke="#00f5e0" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="7.5" cy="14" r="1" fill="#00f5e0"/>
                <circle cx="12" cy="14" r="1" fill="#00f5e0"/>
              </svg>
            </div>
            <div>
              <h2 className="font-mono font-bold text-white text-base tracking-wide">Your Basket</h2>
              <p className="font-mono text-[10px] text-[#00f5e055] tracking-widest uppercase">
                {totalItems} item{totalItems !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#080810] border border-[#00f5e022]
              text-[#00f5e0] hover:bg-[#00f5e011] transition-all duration-200 font-mono text-base"
          >✕</button>
        </div>

        {/* ── Items list ── */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-[#080810] border border-[#00f5e01a]
                hover:border-[#00f5e033] transition-colors duration-200"
            >
              {/* Thumbnail */}
              <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-[#00f5e022]">
                <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#00f5e055] mb-0.5">{item.category}</p>
                <p className="font-mono font-bold text-[13px] text-white truncate">{item.name}</p>
                <p className="font-mono text-[11px] text-[#00f5e0] mt-0.5">
                  {fmt(item.price)} × {item.qty}{" "}
                  <span className="text-[#ffffff44]">=</span>{" "}
                  <span className="text-white font-bold">{fmt(item.price * item.qty)}</span>
                </p>
              </div>

              {/* Qty + Remove */}
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <div className="flex items-center border border-[#00f5e033] rounded-lg overflow-hidden">
                  <button
                    onClick={() => onUpdateQty(item.id, -1)}
                    disabled={item.qty <= 1}
                    className="w-7 h-7 flex items-center justify-center font-mono text-sm text-[#00f5e0]
                      hover:bg-[#00f5e011] disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150"
                  >−</button>
                  <span className="w-7 text-center font-mono text-xs text-white tabular-nums">{item.qty}</span>
                  <button
                    onClick={() => onUpdateQty(item.id, 1)}
                    disabled={item.qty >= item.inStock}
                    className="w-7 h-7 flex items-center justify-center font-mono text-sm text-[#00f5e0]
                      hover:bg-[#00f5e011] disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150"
                  >+</button>
                </div>
                <button
                  onClick={() => onRemove(item.id)}
                  className="font-mono text-[10px] tracking-widest uppercase text-[#ffffff33]
                    hover:text-[#f87171] transition-colors duration-200"
                >Remove</button>
              </div>
            </div>
          ))}
        </div>

        {/* ── Order summary ── */}
        <div className="flex-shrink-0 border-t border-[#00f5e01a] px-6 pt-4 pb-6 bg-[#080810]/60">
          <div className="flex flex-col gap-2.5 mb-5">
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className="font-mono text-[12px] text-[#7baaa8] tracking-widest uppercase">Subtotal</span>
              <span className="font-mono text-[13px] text-white">{fmt(subtotal)}</span>
            </div>

            {/* Delivery */}
            <div className="flex items-center justify-between">
              <span className="font-mono text-[12px] text-[#7baaa8] tracking-widest uppercase flex items-center gap-2">
                Delivery
                <span className="px-1.5 py-0.5 rounded bg-[#00f5e011] border border-[#00f5e022] text-[#00f5e066] text-[9px] tracking-widest">
                  FLAT RATE
                </span>
              </span>
              <span className="font-mono text-[13px] text-white">{fmt(DELIVERY_FEE)}</span>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-[#00f5e022] to-transparent" />

            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-[13px] text-white tracking-widest uppercase">Total</span>
              <span
                className="font-mono font-bold text-2xl text-[#00f5e0]"
                style={{ textShadow: "0 0 16px #00f5e044" }}
              >{fmt(total)}</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-[#00f5e033] text-[#7baaa8]
                font-mono text-[11px] tracking-widest uppercase
                hover:border-[#00f5e055] hover:text-[#00f5e0] transition-all duration-200"
            >Continue</button>
            <button
              onClick={onCheckout}
              className="flex-1 h-11 rounded-xl bg-[#00f5e0] text-[#080810]
                font-mono font-bold text-[12px] tracking-widest uppercase
                hover:bg-[#00ddc9] active:scale-95 transition-all duration-200"
              style={{ boxShadow: "0 0 20px #00f5e033" }}
            >Checkout</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Product Modal ─────────────────────────────────────────────────────────────
function ProductModal({ product, qty, onQtyChange, onAddToCart, onBuyNow, onClose }: {
  product: Product; qty: number;
  onQtyChange: (d: number) => void;
  onAddToCart: () => void; onBuyNow: () => void; onClose: () => void;
}) {
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-[#080810]/85 backdrop-blur-md" />
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0d0d1f] border border-[#00f5e033] rounded-2xl"
        style={{ boxShadow: "0 0 80px #00f5e011, 0 32px 64px #00000088" }}
        onClick={(e) => e.stopPropagation()}>

        <button onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-lg bg-[#080810] border border-[#00f5e033] text-[#00f5e0] hover:bg-[#00f5e011] transition-all duration-200 font-mono text-lg">✕</button>

        <div className="relative w-full rounded-t-2xl overflow-hidden bg-[#0a0a14]" style={{ aspectRatio: "16/9" }}>
          <Image src={product.image} alt={product.name} fill className="object-cover" sizes="(max-width: 672px) 100vw, 672px" />
          {product.badge && (
            <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#00f5e0] text-[#080810] font-mono text-[11px] font-bold tracking-widest uppercase">{product.badge}</span>
          )}
          {discount > 0 && (
            <span className="absolute top-4 right-12 px-3 py-1 rounded-full bg-[#a855f7] text-white font-mono text-[11px] font-bold">-{discount}%</span>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="font-mono text-[11px] tracking-[0.25em] uppercase text-[#00f5e066] mb-1">{product.category}</p>
              <h2 className="font-mono font-bold text-xl text-white">{product.name}</h2>
            </div>
            <span className={`flex-shrink-0 px-2.5 py-1 rounded-full border font-mono text-[11px] tracking-widest uppercase ${CONDITION_COLORS[product.condition]}`}>
              {product.condition}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mb-5">
            {product.specs.map((s) => (
              <span key={s} className="px-3 py-1 rounded-lg bg-[#080810] border border-[#00f5e022] font-mono text-[11px] text-[#7baaa8]">{s}</span>
            ))}
          </div>
          <div className="flex items-end gap-3 mb-6">
            <span className="font-mono font-bold text-3xl text-[#00f5e0]" style={{ textShadow: "0 0 16px #00f5e044" }}>{fmt(product.price)}</span>
            {product.originalPrice && (
              <span className="font-mono text-base text-[#ffffff33] line-through mb-0.5">{fmt(product.originalPrice)}</span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center border border-[#00f5e033] rounded-xl overflow-hidden flex-shrink-0">
              <button onClick={() => onQtyChange(-1)} disabled={qty <= 1}
                className="w-11 h-11 flex items-center justify-center font-mono text-lg text-[#00f5e0] hover:bg-[#00f5e011] disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150">−</button>
              <span className="w-10 text-center font-mono text-sm text-white tabular-nums">{qty}</span>
              <button onClick={() => onQtyChange(1)} disabled={qty >= product.inStock}
                className="w-11 h-11 flex items-center justify-center font-mono text-lg text-[#00f5e0] hover:bg-[#00f5e011] disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150">+</button>
            </div>
            <button onClick={onAddToCart}
              className="flex-1 h-11 px-5 rounded-xl border border-[#00f5e044] text-[#00f5e0] font-mono text-[12px] tracking-widest uppercase bg-[#00f5e011] hover:bg-[#00f5e022] hover:border-[#00f5e088] transition-all duration-200 active:scale-95">
              Add to Basket
            </button>
            <button onClick={onBuyNow}
              className="flex-1 h-11 px-5 rounded-xl bg-[#00f5e0] text-[#080810] font-mono font-bold text-[12px] tracking-widest uppercase hover:bg-[#00ddc9] transition-all duration-200 active:scale-95"
              style={{ boxShadow: "0 0 20px #00f5e033" }}>
              Buy Now
            </button>
          </div>
          <p className="mt-3 font-mono text-[11px] text-[#ffffff33] text-center">
            {product.inStock} unit{product.inStock !== 1 ? "s" : ""} in stock
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Product Card ──────────────────────────────────────────────────────────────
function ProductCard({ product, onOpenModal, onAddToCart }: {
  product: Product;
  onOpenModal: (p: Product) => void;
  onAddToCart: (p: Product, qty: number) => void;
}) {
  const [qty, setQty] = useState(1);
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  return (
    <div className="group relative flex flex-col bg-[#0d0d1f] border border-[#00f5e01a] rounded-2xl overflow-hidden hover:border-[#00f5e044] hover:shadow-[0_0_32px_#00f5e011] transition-all duration-300">
      <div className="relative overflow-hidden cursor-pointer flex-shrink-0" style={{ aspectRatio: "4/3" }}
        onClick={() => onOpenModal(product)} role="button" aria-label={`View ${product.name}`}
        tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onOpenModal(product)}>
        <Image src={product.image} alt={product.name} fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
        <div className="absolute inset-0 bg-[#080810]/0 group-hover:bg-[#080810]/30 transition-all duration-300 flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-4 py-2 rounded-full bg-[#00f5e0]/90 text-[#080810] font-mono text-[11px] font-bold tracking-widest uppercase">Quick View</span>
        </div>
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.badge && <span className="px-2.5 py-1 rounded-full bg-[#00f5e0] text-[#080810] font-mono text-[10px] font-bold tracking-widest uppercase">{product.badge}</span>}
          {discount > 0 && <span className="px-2.5 py-1 rounded-full bg-[#a855f7] text-white font-mono text-[10px] font-bold">-{discount}%</span>}
        </div>
        <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full border bg-[#080810]/80 font-mono text-[10px] tracking-widest uppercase ${CONDITION_COLORS[product.condition]}`}>
          {product.condition}
        </span>
      </div>

      <div className="flex flex-col flex-1 p-4 gap-3">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#00f5e055] mb-0.5">{product.category}</p>
          <h3 className="font-mono font-bold text-[15px] text-white leading-snug cursor-pointer hover:text-[#00f5e0] transition-colors duration-200"
            onClick={() => onOpenModal(product)}>{product.name}</h3>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {product.specs.map((s) => (
            <span key={s} className="px-2 py-0.5 rounded-md bg-[#080810] border border-[#00f5e01a] font-mono text-[10px] text-[#7baaa8]">{s}</span>
          ))}
        </div>
        <div className="flex items-end gap-2 mt-auto">
          <span className="font-mono font-bold text-lg text-[#00f5e0]" style={{ textShadow: "0 0 12px #00f5e044" }}>{fmt(product.price)}</span>
          {product.originalPrice && <span className="font-mono text-xs text-[#ffffff33] line-through mb-px">{fmt(product.originalPrice)}</span>}
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-[#00f5e022] to-transparent" />
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-[#00f5e033] rounded-lg overflow-hidden flex-shrink-0">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="w-8 h-8 flex items-center justify-center text-[#00f5e0] font-mono hover:bg-[#00f5e011] transition-colors duration-150 text-base leading-none">−</button>
            <span className="w-7 text-center font-mono text-xs text-white tabular-nums">{qty}</span>
            <button onClick={() => setQty((q) => Math.min(product.inStock, q + 1))}
              className="w-8 h-8 flex items-center justify-center text-[#00f5e0] font-mono hover:bg-[#00f5e011] transition-colors duration-150 text-base leading-none">+</button>
          </div>
          <button onClick={() => onAddToCart(product, qty)}
            className="flex-1 h-8 rounded-lg border border-[#00f5e044] text-[#00f5e0] font-mono text-[11px] tracking-widest uppercase bg-[#00f5e011] hover:bg-[#00f5e022] hover:border-[#00f5e088] transition-all duration-200 active:scale-95">
            + Basket
          </button>
        </div>
        {product.inStock <= 2 && (
          <p className="font-mono text-[10px] text-[#f59e0b] tracking-widest">⚠ Only {product.inStock} left</p>
        )}
      </div>
    </div>
  );
}

// ── Main Section ──────────────────────────────────────────────────────────────
export default function TechloProductSection() {
  const { query, activeFilter } = useSearch();

  const [cart, setCart]                 = useState<CartItem[]>([]);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [modalQty, setModalQty]         = useState(1);
  const [basketOpen, setBasketOpen]     = useState(false);
  const [toast, setToast]               = useState({ message: "", visible: false });

  const filtered = PRODUCTS.filter((p) => {
    const matchesCategory =
      activeFilter === "all" || p.category.toLowerCase() === activeFilter.toLowerCase();
    const matchesQuery =
      query.trim() === "" ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase()) ||
      p.specs.some((s) => s.toLowerCase().includes(query.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  const showToast = useCallback((msg: string) => {
    setToast({ message: msg, visible: true });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2500);
  }, []);

  const addToCart = useCallback((product: Product, qty: number) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) return prev.map((i) => i.id === product.id
        ? { ...i, qty: Math.min(product.inStock, i.qty + qty) } : i);
      return [...prev, { ...product, qty }];
    });
    showToast(`${product.name} added to basket`);
  }, [showToast]);

  const updateCartQty = useCallback((id: string, delta: number) => {
    setCart((prev) =>
      prev.map((i) => i.id === id
        ? { ...i, qty: Math.max(1, Math.min(i.inStock, i.qty + delta)) }
        : i
      )
    );
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => {
      const next = prev.filter((i) => i.id !== id);
      if (next.length === 0) setBasketOpen(false);
      return next;
    });
  }, []);

  const handleBuyNow = useCallback((product: Product, qty: number) => {
    addToCart(product, qty);
    setModalProduct(null);
    showToast("Proceeding to checkout…");
  }, [addToCart, showToast]);

  const handleCheckout = useCallback(() => {
    setBasketOpen(false);
    showToast("Proceeding to checkout…");
    // router.push("/checkout")
  }, [showToast]);

  const openModal = (product: Product) => { setModalProduct(product); setModalQty(1); };
  const cartCount = cart.reduce((acc, i) => acc + i.qty, 0);

  return (
    <>
      <style>{`
        @keyframes tl-fadein {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .tl-card-anim { animation: tl-fadein 0.5s ease both; }
      `}</style>

      <section id="product-section" className="w-full bg-[#080810] px-4 md:px-10 lg:px-16 py-12">
        <div className="max-w-[1000px] mx-auto">

          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <p className="font-mono text-[11px] tracking-[0.35em] uppercase text-[#00f5e066] mb-1.5">Browse Inventory</p>
              <h2 className="font-mono font-bold text-2xl md:text-3xl text-white" style={{ textShadow: "0 0 30px #00f5e011" }}>
                Available{" "}
                <span className="text-[#00f5e0]" style={{ textShadow: "0 0 16px #00f5e066" }}>Gadgets</span>
              </h2>
              {(query.trim() !== "" || activeFilter !== "all") && (
                <p className="font-mono text-[11px] text-[#00f5e055] mt-1.5 tracking-widest">
                  {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                  {query.trim() !== "" && <> for &quot;<span className="text-[#00f5e0]">{query}</span>&quot;</>}
                  {activeFilter !== "all" && <> in <span className="text-[#00f5e0] capitalize">{activeFilter}</span></>}
                </p>
              )}
            </div>

            {/* ── Clickable basket button ── */}
            {cartCount > 0 && (
              <button
                onClick={() => setBasketOpen(true)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-[#00f5e033] bg-[#0d0d1f]
                  hover:border-[#00f5e066] hover:bg-[#00f5e00a] active:scale-95
                  transition-all duration-200 group"
                style={{ boxShadow: "0 0 20px #00f5e011" }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-[#00f5e0]">
                  <path d="M2 3h1.5l2 8h7l2-6H5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="7.5" cy="14" r="1" fill="currentColor"/>
                  <circle cx="12" cy="14" r="1" fill="currentColor"/>
                </svg>
                <span className="font-mono text-[11px] tracking-widest uppercase text-[#00f5e066] group-hover:text-[#00f5e0] transition-colors duration-200">
                  Basket
                </span>
                <span
                  className="w-7 h-7 rounded-full bg-[#00f5e0] text-[#080810] font-mono font-bold text-sm flex items-center justify-center"
                  style={{ boxShadow: "0 0 12px #00f5e066" }}
                >{cartCount}</span>
              </button>
            )}
          </div>

          {/* Product Grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((product, i) => (
                <div key={product.id} className="tl-card-anim" style={{ animationDelay: `${i * 0.07}s` }}>
                  <ProductCard product={product} onOpenModal={openModal} onAddToCart={addToCart} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-16 h-16 rounded-full border border-[#00f5e022] flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <circle cx="12" cy="12" r="8" stroke="#00f5e033" strokeWidth="1.5" />
                  <path d="M18 18l5 5" stroke="#00f5e033" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <p className="font-mono text-[#00f5e033] text-sm tracking-widest">No results found</p>
              {query && (
                <p className="font-mono text-[#ffffff22] text-[11px] tracking-widest">
                  Try a different search term or category
                </p>
              )}
            </div>
          )}

        </div>
      </section>

      {/* ── Product Quick-View Modal ── */}
      {modalProduct && (
        <ProductModal
          product={modalProduct} qty={modalQty}
          onQtyChange={(delta) => setModalQty((q) => Math.max(1, Math.min(modalProduct.inStock, q + delta)))}
          onAddToCart={() => { addToCart(modalProduct, modalQty); setModalProduct(null); }}
          onBuyNow={() => handleBuyNow(modalProduct, modalQty)}
          onClose={() => setModalProduct(null)}
        />
      )}

      {/* ── Basket Modal ── */}
      {basketOpen && cart.length > 0 && (
        <BasketModal
          cart={cart}
          onUpdateQty={updateCartQty}
          onRemove={removeFromCart}
          onClose={() => setBasketOpen(false)}
          onCheckout={handleCheckout}
        />
      )}

      <Toast message={toast.message} visible={toast.visible} />
    </>
  );
}