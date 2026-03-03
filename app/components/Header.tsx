"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────────────────────
interface NavItem {
  label: string;
  href: string;
}

// ── Data ──────────────────────────────────────────────────────────────────────
const NAV_ITEMS: NavItem[] = [
  { label: "Browse", href: "/browse" },
  { label: "Sell", href: "/sell" },
  { label: "Deals", href: "/deals" },
  { label: "About", href: "/about" },
];

// ── Logo ──────────────────────────────────────────────────────────────────────
function TechloLogo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group no-underline">
      <div className="relative w-9 h-9 rounded-lg bg-[#0a0a14] border border-[#00f5e033] flex items-center justify-center overflow-hidden group-hover:border-[#00f5e066] transition-colors duration-300">
        <svg width="22" height="28" viewBox="0 0 22 28" fill="none">
          <rect
            x="3" y="1" width="16" height="26" rx="3"
            stroke="#00f5e0" strokeWidth="1.5" fill="none"
            style={{ filter: "drop-shadow(0 0 4px #00f5e0)" }}
          />
          <path
            d="M11 7 a4 4 0 0 1 3.5 2"
            stroke="#00f5e0" strokeWidth="1.3" strokeLinecap="round" fill="none"
          />
          <path
            d="M14.5 9 a4 4 0 0 1 -7 0"
            stroke="#a855f7" strokeWidth="1.3" strokeLinecap="round" fill="none"
            style={{ filter: "drop-shadow(0 0 4px #a855f7)" }}
          />
          <circle
            cx="11" cy="23" r="1.5" fill="#00f5e0"
            style={{ filter: "drop-shadow(0 0 4px #00f5e0)" }}
          />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-br from-[#00f5e00a] to-transparent pointer-events-none" />
      </div>
      <span
        className="text-[#00f5e0] font-mono font-bold text-xl tracking-[0.25em] uppercase transition-all duration-300 group-hover:tracking-[0.3em]"
        style={{ textShadow: "0 0 12px #00f5e044, 0 0 24px #00f5e022" }}
      >
        Techlo
      </span>
    </Link>
  );
}

// ── Hamburger Icon ────────────────────────────────────────────────────────────
function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <div className="relative w-[22px] h-[16px]">
      <span
        className="absolute left-0 w-full h-[2px] rounded-full bg-[#00f5e0] transition-all duration-300 ease-in-out"
        style={{
          top: 0,
          transform: open ? "translateY(7px) rotate(45deg)" : "none",
          boxShadow: "0 0 6px #00f5e088",
        }}
      />
      <span
        className="absolute left-0 w-full h-[2px] rounded-full bg-[#00f5e0] transition-all duration-300 ease-in-out"
        style={{
          top: "7px",
          opacity: open ? 0 : 1,
          boxShadow: "0 0 6px #00f5e088",
        }}
      />
      <span
        className="absolute left-0 w-full h-[2px] rounded-full bg-[#00f5e0] transition-all duration-300 ease-in-out"
        style={{
          top: "14px",
          transform: open ? "translateY(-7px) rotate(-45deg)" : "none",
          boxShadow: "0 0 6px #00f5e088",
        }}
      />
    </div>
  );
}

// ── Nav Links (shared between mobile & desktop panel) ─────────────────────────
function NavLinks({
  activeItem,
  onSelect,
}: {
  activeItem: string;
  onSelect: (label: string) => void;
}) {
  return (
    <ul className="flex flex-col gap-1 list-none m-0 p-0">
      {NAV_ITEMS.map((item, i) => {
        const isActive = activeItem === item.label;
        return (
          <li key={item.label}>
            <Link
              href={item.href}
              onClick={() => onSelect(item.label)}
              className={[
                "group flex items-center gap-3 px-4 py-3.5 rounded-lg",
                "font-mono text-[13px] tracking-[0.2em] uppercase no-underline",
                "border transition-all duration-200",
                isActive
                  ? "text-[#00f5e0] bg-[#00f5e00a] border-[#00f5e022]"
                  : "text-[#7baaa8] border-transparent hover:text-[#00f5e0] hover:bg-[#00f5e00a] hover:border-[#00f5e022]",
              ].join(" ")}
              style={isActive ? { textShadow: "0 0 8px #00f5e055" } : undefined}
            >
              <span
                className={[
                  "w-[5px] h-[5px] rounded-full bg-[#00f5e0] flex-shrink-0 transition-opacity duration-200",
                  isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                ].join(" ")}
                style={{ boxShadow: "0 0 6px #00f5e0" }}
              />
              {item.label}
            </Link>
            {i < NAV_ITEMS.length - 1 && (
              <div
                className="h-px mx-4 my-1"
                style={{ background: "linear-gradient(90deg, transparent, #00f5e022, transparent)" }}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}

// ── Main Header ───────────────────────────────────────────────────────────────
export default function TechloHeader() {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [activeItem, setActiveItem] = useState<string>("");
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [menuOpen]);

  // Close on Escape
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, []);

  const handleSelect = (label: string) => {
    setActiveItem(label);
    setMenuOpen(false);
  };

  return (
    <div ref={panelRef}>
      <style>{`
        @keyframes techlo-scan {
          0%   { transform: translateX(-200%); }
          100% { transform: translateX(400%); }
        }
      `}</style>

      {/* ── Sticky Header Bar ── */}
      <header
        className={[
          "sticky top-0 z-50 w-full overflow-hidden transition-all duration-300",
          scrolled
            ? "bg-[#080810]/95 backdrop-blur-xl border-b border-[#00f5e033] shadow-[0_2px_32px_#00f5e011]"
            : "bg-[#080810]/70 backdrop-blur-md border-b border-transparent",
        ].join(" ")}
      >
        {/* Scan line */}
        <div className="absolute top-0 left-0 right-0 h-px overflow-hidden pointer-events-none">
          <div
            className="absolute top-0 h-px w-1/3 bg-gradient-to-r from-transparent via-[#00f5e066] to-transparent"
            style={{ animation: "techlo-scan 3s linear infinite" }}
          />
        </div>

        {/* Header inner — narrow on mobile, full-width on md+ */}
        <div className="w-full px-5 md:px-10 lg:px-16 h-[60px] md:h-[68px] flex items-center justify-between">
          <TechloLogo />

          {/* Hamburger — always visible */}
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            aria-controls="techlo-nav-panel"
            className="flex items-center justify-center w-11 h-10 rounded-lg
              border border-[#00f5e033] bg-transparent
              hover:border-[#00f5e0aa] hover:bg-[#00f5e011]
              focus:outline-none focus:ring-1 focus:ring-[#00f5e055]
              transition-all duration-200"
          >
            <HamburgerIcon open={menuOpen} />
          </button>
        </div>
      </header>

      {/* ── Backdrop overlay (both layouts) ── */}
      <div
        onClick={() => setMenuOpen(false)}
        className={[
          "fixed inset-0 z-40 bg-[#080810]/60 backdrop-blur-sm transition-opacity duration-300",
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
      />

      {/* ════════════════════════════════════════════════
          MOBILE  — bottom-up drawer  (hidden on md+)
      ════════════════════════════════════════════════ */}
      <div
        id="techlo-nav-panel"
        role="navigation"
        aria-label="Main navigation"
        className={[
          "md:hidden fixed bottom-0 left-0 right-0 z-50",
          "bg-[#080810]/98 backdrop-blur-xl",
          "border-t border-[#00f5e033] rounded-t-2xl",
          "transition-transform duration-[420ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
          menuOpen ? "translate-y-0" : "translate-y-full",
        ].join(" ")}
        style={{ boxShadow: "0 -8px 40px #00f5e011" }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[#00f5e033]" />
        </div>

        <div className="px-4 pt-2 pb-8">
          <NavLinks activeItem={activeItem} onSelect={handleSelect} />

          <div className="pt-4">
            <Link
              href="/signin"
              onClick={() => setMenuOpen(false)}
              className="block w-full py-3.5 rounded-xl text-center no-underline
                font-mono text-[13px] tracking-[0.2em] uppercase text-[#00f5e0]
                border border-[#00f5e044]
                bg-gradient-to-r from-[#00f5e022] to-[#a855f722]
                hover:from-[#00f5e033] hover:to-[#a855f733]
                transition-all duration-200"
              style={{
                textShadow: "0 0 8px #00f5e066",
                boxShadow: "0 0 16px #00f5e011",
              }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          TABLET / LAPTOP  — right-side slide-in panel
          (hidden on mobile, visible on md+)
      ════════════════════════════════════════════════ */}
      <div
        id="techlo-nav-panel-desktop"
        role="navigation"
        aria-label="Main navigation"
        className={[
          "hidden md:flex flex-col",
          "fixed top-0 right-0 z-50 h-full w-72 lg:w-80",
          "bg-[#080810]/98 backdrop-blur-2xl",
          "border-l border-[#00f5e033]",
          "transition-transform duration-[420ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
          menuOpen ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
        style={{ boxShadow: "-8px 0 40px #00f5e011" }}
      >
        {/* Panel header row */}
        <div className="flex items-center justify-between px-6 h-[68px] border-b border-[#00f5e01a] flex-shrink-0">
          <span
            className="font-mono text-xs tracking-[0.3em] uppercase text-[#00f5e066]"
          >
            Navigation
          </span>
          <button
            onClick={() => setMenuOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg
              border border-[#00f5e033] text-[#00f5e0]
              hover:bg-[#00f5e011] hover:border-[#00f5e066]
              transition-all duration-200 text-lg leading-none"
            aria-label="Close navigation"
          >
            ✕
          </button>
        </div>

        {/* Vertical scan line accent */}
        <div className="absolute top-0 left-0 w-px h-full overflow-hidden pointer-events-none">
          <div
            className="w-px bg-gradient-to-b from-transparent via-[#00f5e055] to-transparent"
            style={{
              height: "40%",
              animation: "techlo-vscan 4s linear infinite",
            }}
          />
        </div>

        {/* Nav links */}
        <div className="flex-1 overflow-y-auto px-5 pt-6">
          <NavLinks activeItem={activeItem} onSelect={handleSelect} />
        </div>

        {/* Bottom CTA */}
        <div className="px-5 pb-8 pt-4 border-t border-[#00f5e01a] flex-shrink-0">
          {/* Version badge */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00f5e0] animate-pulse" style={{ boxShadow: "0 0 6px #00f5e0" }} />
            <span className="font-mono text-[10px] tracking-[0.25em] text-[#00f5e044] uppercase">
              second-hand electronics
            </span>
          </div>

          <Link
            href="/signin"
            onClick={() => setMenuOpen(false)}
            className="block w-full py-3.5 rounded-xl text-center no-underline
              font-mono text-[13px] tracking-[0.2em] uppercase text-[#00f5e0]
              border border-[#00f5e044]
              bg-gradient-to-r from-[#00f5e022] to-[#a855f722]
              hover:from-[#00f5e033] hover:to-[#a855f733]
              hover:shadow-[0_0_24px_#00f5e033]
              transition-all duration-200"
            style={{
              textShadow: "0 0 8px #00f5e066",
              boxShadow: "0 0 16px #00f5e011",
            }}
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Vertical scan keyframe for side panel */}
      <style>{`
        @keyframes techlo-vscan {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(350%); }
        }
      `}</style>
    </div>
  );
}