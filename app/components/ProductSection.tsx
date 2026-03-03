"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

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

interface CartItem extends Product {
  qty: number;
}

// ── Mock Product Data ─────────────────────────────────────────────────────────
const PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "iPhone 13 Pro",
    category: "Phones",
    price: 2800,
    originalPrice: 4200,
    condition: "Like New",
    image: "/icons/iphone.jpg",
    badge: "Hot Deal",
    specs: ["256GB", "Sierra Blue", "Battery 91%"],
    inStock: 3,
  },
  {
    id: "p2",
    name: "MacBook Pro M1",
    category: "Laptops",
    price: 5500,
    originalPrice: 8900,
    condition: "Good",
    image: "/icons/macbook1.jpg",
    badge: "Popular",
    specs: ["8GB RAM", "256GB SSD", "Space Grey"],
    inStock: 2,
  },
  {
    id: "p3",
    name: "Sony WH-1000XM5",
    category: "Audio",
    price: 950,
    originalPrice: 1800,
    condition: "Like New",
    image: "/icons/sony-headset.jpg",
    specs: ["Noise Cancelling", "30hr Battery", "Black"],
    inStock: 5,
  },
  {
    id: "p4",
    name: "Samsung Galaxy S22",
    category: "Phones",
    price: 1900,
    originalPrice: 3200,
    condition: "Good",
    image: "/icons/samsung.png",
    badge: "Low Stock",
    specs: ["128GB", "Phantom Black", "Battery 88%"],
    inStock: 1,
  },
  {
    id: "p5",
    name: "Canon EOS R50",
    category: "Cameras",
    price: 3400,
    originalPrice: 5200,
    condition: "Like New",
    image: "/icons/camera.jpg",
    specs: ["24.2MP", "4K Video", "White"],
    inStock: 2,
  },
  {
    id: "p6",
    name: "PlayStation 5",
    category: "Gaming",
    price: 3800,
    originalPrice: 5500,
    condition: "Good",
    image: "/icons/ps5.jpg",
    badge: "Rare Find",
    specs: ["825GB SSD", "Disc Edition", "White"],
    inStock: 1,
  },
  {
    id: "p7",
    name: "iPad Air 5th Gen",
    category: "Tablets",
    price: 2100,
    originalPrice: 3400,
    condition: "Like New",
    image: "/icons/iphone.jpg",
    specs: ["64GB", "Wi-Fi", "Starlight"],
    inStock: 4,
  },
  {
    id: "p8",
    name: "Apple Watch Series 8",
    category: "Wearables",
    price: 1400,
    originalPrice: 2300,
    condition: "Like New",
    image: "/icons/apple-watch.webp",
    specs: ["45mm", "GPS", "Midnight"],
    inStock: 3,
  },
];

const CONDITION_COLORS: Record<Product["condition"], string> = {
  "Like New": "text-[#00f5e0] border-[#00f5e033]",
  "Good":     "text-[#a855f7] border-[#a855f733]",
  "Fair":     "text-[#f59e0b] border-[#f59e0b33]",
};

// ── Currency formatter ────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS", maximumFractionDigits: 0 }).format(n);

// ── Cart Toast ────────────────────────────────────────────────────────────────
function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div
      className={[
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-xl ",
        "bg-[#0d0d1f] border border-[#00f5e055] font-mono text-sm text-[#00f5e0]",
        "transition-all duration-300 whitespace-nowrap pointer-events-none",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
      ].join(" ")}
      style={{ boxShadow: "0 0 32px #00f5e022" }}
    >
      ✓ &nbsp;{message}
    </div>
  );
}

// ── Product Modal ─────────────────────────────────────────────────────────────
function ProductModal({
  product,
  qty,
  onQtyChange,
  onAddToCart,
  onBuyNow,
  onClose,
}: {
  product: Product;
  qty: number;
  onQtyChange: (delta: number) => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
  onClose: () => void;
}) {
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#080810]/85 backdrop-blur-md" />

      {/* Panel */}
      <div
        className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto
          bg-[#0d0d1f] border border-[#00f5e033] rounded-2xl "
        style={{ boxShadow: "0 0 80px #00f5e011, 0 32px 64px #00000088" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center
            rounded-lg bg-[#080810] border border-[#00f5e033] text-[#00f5e0]
            hover:bg-[#00f5e011] transition-all duration-200 font-mono text-lg"
        >
          ✕
        </button>

        {/* Image */}
        <div className="relative w-full rounded-t-2xl overflow-hidden bg-[#0a0a14]" style={{ aspectRatio: "16/9" }}>
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 672px) 100vw, 672px"
          />
          {product.badge && (
            <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#00f5e0] text-[#080810] font-mono text-[11px] font-bold tracking-widest uppercase">
              {product.badge}
            </span>
          )}
          {discount > 0 && (
            <span className="absolute top-4 right-12 px-3 py-1 rounded-full bg-[#a855f7] text-white font-mono text-[11px] font-bold">
              -{discount}%
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="font-mono text-[11px] tracking-[0.25em] uppercase text-[#00f5e066] mb-1">
                {product.category}
              </p>
              <h2 className="font-mono font-bold text-xl text-white">{product.name}</h2>
            </div>
            <span className={`flex-shrink-0 px-2.5 py-1 rounded-full border font-mono text-[11px] tracking-widest uppercase ${CONDITION_COLORS[product.condition]}`}>
              {product.condition}
            </span>
          </div>

          {/* Specs */}
          <div className="flex flex-wrap gap-2 mb-5">
            {product.specs.map((s) => (
              <span key={s} className="px-3 py-1 rounded-lg bg-[#080810] border border-[#00f5e022] font-mono text-[11px] text-[#7baaa8]">
                {s}
              </span>
            ))}
          </div>

          {/* Price */}
          <div className="flex items-end gap-3 mb-6">
            <span
              className="font-mono font-bold text-3xl text-[#00f5e0]"
              style={{ textShadow: "0 0 16px #00f5e044" }}
            >
              {fmt(product.price)}
            </span>
            {product.originalPrice && (
              <span className="font-mono text-base text-[#ffffff33] line-through mb-0.5">
                {fmt(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Quantity + Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Qty */}
            <div className="flex items-center gap-0 border border-[#00f5e033] rounded-xl overflow-hidden flex-shrink-0">
              <button
                onClick={() => onQtyChange(-1)}
                disabled={qty <= 1}
                className="w-11 h-11 flex items-center justify-center font-mono text-lg text-[#00f5e0]
                  hover:bg-[#00f5e011] disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150"
              >−</button>
              <span className="w-10 text-center font-mono text-sm text-white tabular-nums">{qty}</span>
              <button
                onClick={() => onQtyChange(1)}
                disabled={qty >= product.inStock}
                className="w-11 h-11 flex items-center justify-center font-mono text-lg text-[#00f5e0]
                  hover:bg-[#00f5e011] disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150"
              >+</button>
            </div>

            {/* Add to basket */}
            <button
              onClick={onAddToCart}
              className="flex-1 h-11 px-5 rounded-xl border border-[#00f5e044] text-[#00f5e0]
                font-mono text-[12px] tracking-widest uppercase
                bg-[#00f5e011] hover:bg-[#00f5e022] hover:border-[#00f5e088]
                transition-all duration-200 active:scale-95"
            >
              Add to Basket
            </button>

            {/* Buy now */}
            <button
              onClick={onBuyNow}
              className="flex-1 h-11 px-5 rounded-xl
                bg-[#00f5e0] text-[#080810] font-mono font-bold text-[12px] tracking-widest uppercase
                hover:bg-[#00ddc9] transition-all duration-200 active:scale-95"
              style={{ boxShadow: "0 0 20px #00f5e033" }}
            >
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
function ProductCard({
  product,
  onOpenModal,
  onAddToCart,
}: {
  product: Product;
  onOpenModal: (p: Product) => void;
  onAddToCart: (p: Product, qty: number) => void;
}) {
  const [qty, setQty] = useState(1);
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <div
      className="group relative flex flex-col bg-[#0d0d1f] border border-[#00f5e01a] max-w-[1000px] mx-auto
        rounded-2xl overflow-hidden
        hover:border-[#00f5e044] hover:shadow-[0_0_32px_#00f5e011]
        transition-all duration-300"
    >
      {/* Image */}
      <div
        className="relative overflow-hidden cursor-pointer flex-shrink-0"
        style={{ aspectRatio: "4/3" }}
        onClick={() => onOpenModal(product)}
        role="button"
        aria-label={`View ${product.name}`}
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onOpenModal(product)}
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-[#080810]/0 group-hover:bg-[#080810]/30 transition-all duration-300 flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300
            px-4 py-2 rounded-full bg-[#00f5e0]/90 text-[#080810] font-mono text-[11px] font-bold tracking-widest uppercase">
            Quick View
          </span>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.badge && (
            <span className="px-2.5 py-1 rounded-full bg-[#00f5e0] text-[#080810] font-mono text-[10px] font-bold tracking-widest uppercase">
              {product.badge}
            </span>
          )}
          {discount > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-[#a855f7] text-white font-mono text-[10px] font-bold">
              -{discount}%
            </span>
          )}
        </div>

        {/* Condition */}
        <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full border bg-[#080810]/80 font-mono text-[10px] tracking-widest uppercase ${CONDITION_COLORS[product.condition]}`}>
          {product.condition}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Name & category */}
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#00f5e055] mb-0.5">
            {product.category}
          </p>
          <h3
            className="font-mono font-bold text-[15px] text-white leading-snug cursor-pointer hover:text-[#00f5e0] transition-colors duration-200"
            onClick={() => onOpenModal(product)}
          >
            {product.name}
          </h3>
        </div>

        {/* Specs */}
        <div className="flex flex-wrap gap-1.5">
          {product.specs.map((s) => (
            <span key={s} className="px-2 py-0.5 rounded-md bg-[#080810] border border-[#00f5e01a] font-mono text-[10px] text-[#7baaa8]">
              {s}
            </span>
          ))}
        </div>

        {/* Price */}
        <div className="flex items-end gap-2 mt-auto">
          <span
            className="font-mono font-bold text-lg text-[#00f5e0]"
            style={{ textShadow: "0 0 12px #00f5e044" }}
          >
            {fmt(product.price)}
          </span>
          {product.originalPrice && (
            <span className="font-mono text-xs text-[#ffffff33] line-through mb-px">
              {fmt(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#00f5e022] to-transparent" />

        {/* Quantity + Add to basket */}
        <div className="flex items-center gap-2">
          {/* Qty stepper */}
          <div className="flex items-center border border-[#00f5e033] rounded-lg overflow-hidden flex-shrink-0">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="w-8 h-8 flex items-center justify-center text-[#00f5e0] font-mono
                hover:bg-[#00f5e011] transition-colors duration-150 text-base leading-none"
            >−</button>
            <span className="w-7 text-center font-mono text-xs text-white tabular-nums">{qty}</span>
            <button
              onClick={() => setQty((q) => Math.min(product.inStock, q + 1))}
              className="w-8 h-8 flex items-center justify-center text-[#00f5e0] font-mono
                hover:bg-[#00f5e011] transition-colors duration-150 text-base leading-none"
            >+</button>
          </div>

          {/* Add to basket */}
          <button
            onClick={() => onAddToCart(product, qty)}
            className="flex-1 h-8 rounded-lg border border-[#00f5e044] text-[#00f5e0]
              font-mono text-[11px] tracking-widest uppercase
              bg-[#00f5e011] hover:bg-[#00f5e022] hover:border-[#00f5e088]
              transition-all duration-200 active:scale-95"
          >
            + Basket
          </button>
        </div>

        {/* Stock warning */}
        {product.inStock <= 2 && (
          <p className="font-mono text-[10px] text-[#f59e0b] tracking-widest">
            ⚠ Only {product.inStock} left
          </p>
        )}
      </div>
    </div>
  );
}

// ── Main Section ──────────────────────────────────────────────────────────────
export default function TechloProductSection() {
  const [cart, setCart]               = useState<CartItem[]>([]);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [modalQty, setModalQty]       = useState(1);
  const [toast, setToast]             = useState({ message: "", visible: false });
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(PRODUCTS.map((p) => p.category)))];
  const filtered = activeCategory === "All"
    ? PRODUCTS
    : PRODUCTS.filter((p) => p.category === activeCategory);

  const showToast = useCallback((msg: string) => {
    setToast({ message: msg, visible: true });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2500);
  }, []);

  const addToCart = useCallback((product: Product, qty: number) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id
            ? { ...i, qty: Math.min(product.inStock, i.qty + qty) }
            : i
        );
      }
      return [...prev, { ...product, qty }];
    });
    showToast(`${product.name} added to basket`);
  }, [showToast]);

  const handleBuyNow = useCallback((product: Product, qty: number) => {
    addToCart(product, qty);
    setModalProduct(null);
    showToast(`Proceeding to checkout…`);
    // router.push("/checkout") here
  }, [addToCart, showToast]);

  const openModal = (product: Product) => {
    setModalProduct(product);
    setModalQty(1);
  };

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

      <section className="w-full bg-[#080810] px-4 md:px-10 lg:px-16 py-12">

        {/* ── Section Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 max-w-[1000px] mx-auto">
          <div>
            <p className="font-mono text-[11px] tracking-[0.35em] uppercase text-[#00f5e066] mb-1.5">
              Browse Inventory
            </p>
            <h2
              className="font-mono font-bold text-2xl md:text-3xl text-white"
              style={{ textShadow: "0 0 30px #00f5e011" }}
            >
              Available{" "}
              <span className="text-[#00f5e0]" style={{ textShadow: "0 0 16px #00f5e066" }}>
                Gadgets
              </span>
            </h2>
          </div>

          {/* Cart badge */}
          {cartCount > 0 && (
            <div
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-[#00f5e033] bg-[#0d0d1f] "
              style={{ boxShadow: "0 0 20px #00f5e011" }}
            >
              <span className="font-mono text-[11px] tracking-widest uppercase text-[#00f5e066]">Basket</span>
              <span
                className="w-7 h-7 rounded-full bg-[#00f5e0] text-[#080810] font-mono font-bold text-sm flex items-center justify-center"
                style={{ boxShadow: "0 0 12px #00f5e066" }}
              >
                {cartCount}
              </span>
            </div>
          )}
        </div>

        {/* ── Category Filter Tabs ── */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide " style={{ scrollbarWidth: "none" }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={[
                "flex-shrink-0 px-4 py-2 rounded-full font-mono text-[11px] tracking-[0.15em] uppercase",
                "border transition-all duration-200",
                activeCategory === cat
                  ? "bg-[#00f5e0] text-[#080810] border-[#00f5e0] font-bold shadow-[0_0_16px_#00f5e044]"
                  : "bg-transparent text-[#7baaa8] border-[#00f5e022] hover:border-[#00f5e055] hover:text-[#00f5e0]",
              ].join(" ")}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── Product Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 max-w-[1000px] mx-auto">
          {filtered.map((product, i) => (
            <div
              key={product.id}
              className="tl-card-anim"
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <ProductCard
                product={product}
                onOpenModal={openModal}
                onAddToCart={addToCart}
              />
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="font-mono text-[#00f5e033] text-lg tracking-widest">No items found.</p>
          </div>
        )}
      </section>

      {/* ── Modal ── */}
      {modalProduct && (
        <ProductModal
          product={modalProduct}
          qty={modalQty}
          onQtyChange={(delta) =>
            setModalQty((q) => Math.max(1, Math.min(modalProduct.inStock, q + delta)))
          }
          onAddToCart={() => {
            addToCart(modalProduct, modalQty);
            setModalProduct(null);
          }}
          onBuyNow={() => handleBuyNow(modalProduct, modalQty)}
          onClose={() => setModalProduct(null)}
        />
      )}

      {/* ── Toast ── */}
      <Toast message={toast.message} visible={toast.visible} />
    </>
  );
}