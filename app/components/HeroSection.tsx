"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

// ── Types ─────────────────────────────────────────────────────────────────────
interface FilterCategory {
  id: string;
  label: string;
  icon: string;
}

interface CarouselSlide {
  src: string;
  alt: string;
}

// ── Data ──────────────────────────────────────────────────────────────────────
const FILTER_CATEGORIES: FilterCategory[] = [
  { id: "all",       label: "All",        icon: "⊞" },
  { id: "phones",    label: "Phones",     icon: "📱" },
  { id: "laptops",   label: "Laptops",    icon: "💻" },
  { id: "tablets",   label: "Tablets",    icon: "⬛" },
  { id: "gaming",    label: "Gaming",     icon: "🎮" },
  { id: "audio",     label: "Audio",      icon: "🎧" },
  { id: "cameras",   label: "Cameras",    icon: "📷" },
  { id: "tvs",       label: "TVs",        icon: "📺" },
  { id: "wearables", label: "Wearables",  icon: "⌚" },
];

const CAROUSEL_SLIDES: CarouselSlide[] = [
  { src: "/icons/bannerone.png", alt: "Top deals on second-hand electronics" },
  { src: "/icons/bannertwo.png", alt: "Welcome to Techlo Electronics" },
];

// ── Search Icon ───────────────────────────────────────────────────────────────
function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 12l3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

// ── Chevron ───────────────────────────────────────────────────────────────────
function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      {direction === "left"
        ? <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        : <path d="M8 4l6 6-6 6"  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      }
    </svg>
  );
}

// ── Hero Section ──────────────────────────────────────────────────────────────
export default function TechloHero() {
  const [query, setQuery]               = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [current, setCurrent]           = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = CAROUSEL_SLIDES.length;

  const goTo = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrent((index + total) % total);
    setTimeout(() => setIsTransitioning(false), 600);
  }, [isTransitioning, total]);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Auto-advance
  useEffect(() => {
    intervalRef.current = setInterval(next, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [next]);

  const resetInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(next, 5000);
  };

  const handlePrev = () => { prev(); resetInterval(); };
  const handleNext = () => { next(); resetInterval(); };
  const handleDot  = (i: number) => { goTo(i); resetInterval(); };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // wire up to your search/router here
    console.log("Search:", query, "| Filter:", activeFilter);
  };

  return (
    <>
      <style>{`
        @keyframes techlo-fadein {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes techlo-scan {
          0%   { transform: translateX(-200%); }
          100% { transform: translateX(400%); }
        }
        @keyframes techlo-pulse-ring {
          0%   { box-shadow: 0 0 0 0 #00f5e044; }
          70%  { box-shadow: 0 0 0 8px #00f5e000; }
          100% { box-shadow: 0 0 0 0 #00f5e000; }
        }
        .hero-animate { animation: techlo-fadein 0.6s ease both; }
        .carousel-slide-enter  { opacity: 0; transform: scale(1.02); }
        .carousel-slide-active { opacity: 1; transform: scale(1); transition: opacity 0.6s ease, transform 0.6s ease; }
        .filter-scroll::-webkit-scrollbar { display: none; }
        .filter-scroll { scrollbar-width: none; }
        .search-glow:focus-within {
          box-shadow: 0 0 0 1px #00f5e055, 0 0 24px #00f5e022;
        }
      `}</style>

      <section className="w-full max-w-[1000px] bg-[#080810] pt-6 pb-10 px-4 md:px-10 lg:px-16 overflow-hidden">

        {/* ── Headline ── */}
        <div className="max-w-4xl mx-auto text-center mb-7 hero-animate" style={{ animationDelay: "0.05s" }}>
          <p className="font-mono text-[11px] tracking-[0.35em] uppercase text-[#00f5e066] mb-2">
            Ghana&apos;s #1 Marketplace
          </p>
          <h1
            className="font-mono font-bold text-2xl md:text-4xl lg:text-5xl text-white leading-tight"
            style={{ textShadow: "0 0 40px #00f5e022" }}
          >
            Find Your Next{" "}
            <span
              className="text-[#00f5e0]"
              style={{ textShadow: "0 0 20px #00f5e077" }}
            >
              Gadget
            </span>
          </h1>
        </div>

        {/* ── Search Bar ── */}
        <div
          className="max-w-2xl mx-auto mb-5 hero-animate"
          style={{ animationDelay: "0.15s" }}
        >
          <form
            onSubmit={handleSearch}
            className="search-glow flex items-center gap-0 bg-[#0d0d1f] border border-[#00f5e033] rounded-2xl overflow-hidden transition-all duration-300"
          >
            {/* Category dropdown */}
            <div className="relative flex-shrink-0">
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                className="appearance-none h-[52px] pl-4 pr-8 bg-transparent text-[#00f5e0]
                  font-mono text-[12px] tracking-widest uppercase cursor-pointer
                  border-r border-[#00f5e022] outline-none
                  focus:bg-[#00f5e00a] transition-colors duration-200"
                aria-label="Filter by category"
              >
                {FILTER_CATEGORIES.map((cat) => (
                  <option
                    key={cat.id}
                    value={cat.id}
                    className="bg-[#0d0d1f] text-[#00f5e0]"
                  >
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
              {/* Dropdown chevron */}
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#00f5e055] pointer-events-none text-xs">▾</span>
            </div>

            {/* Text input */}
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search phones, laptops, cameras…"
              className="flex-1 h-[52px] px-4 bg-transparent text-white placeholder-[#ffffff33]
                font-mono text-sm outline-none"
              aria-label="Search gadgets"
            />

            {/* Search button */}
            <button
              type="submit"
              className="flex-shrink-0 h-[52px] px-6 flex items-center gap-2.5
                bg-[#00f5e0] text-[#080810] font-mono font-bold text-[12px] tracking-widest uppercase
                hover:bg-[#00ddc9] active:scale-95
                transition-all duration-200"
              style={{ animation: "techlo-pulse-ring 2.5s infinite" }}
            >
              <SearchIcon />
              <span className="hidden sm:inline">Search</span>
            </button>
          </form>
        </div>

        {/* ── Filter Pills ── */}
        <div
          className="max-w-2xl mx-auto mb-8 hero-animate"
          style={{ animationDelay: "0.25s" }}
        >
          <div className="filter-scroll flex items-center gap-2 overflow-x-auto pb-1">
            {FILTER_CATEGORIES.map((cat) => {
              const isActive = activeFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveFilter(cat.id)}
                  className={[
                    "flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full",
                    "font-mono text-[11px] tracking-[0.15em] uppercase",
                    "border transition-all duration-200",
                    isActive
                      ? "bg-[#00f5e0] text-[#080810] border-[#00f5e0] font-bold shadow-[0_0_16px_#00f5e044]"
                      : "bg-transparent text-[#7baaa8] border-[#00f5e022] hover:border-[#00f5e066] hover:text-[#00f5e0]",
                  ].join(" ")}
                >
                  <span className="text-sm leading-none">{cat.icon}</span>
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Carousel ── */}
        <div
          className="max-w-5xl mx-auto hero-animate relative"
          style={{ animationDelay: "0.35s" }}
        >
          {/* Track */}
          <div className="relative w-full rounded-2xl overflow-hidden border border-[#00f5e022]"
            style={{ aspectRatio: "16/5.5", boxShadow: "0 0 60px #00f5e011, 0 24px 48px #00000066" }}
          >
            {CAROUSEL_SLIDES.map((slide, i) => (
              <div
                key={slide.src}
                className={[
                  "absolute inset-0 transition-all duration-500 ease-in-out",
                  i === current
                    ? "opacity-100 scale-100 z-10"
                    : "opacity-0 scale-[1.02] z-0",
                ].join(" ")}
              >
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  className="object-cover object-center"
                  priority={i === 0}
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1024px"
                />
                {/* Subtle vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#080810]/40 via-transparent to-transparent pointer-events-none" />
              </div>
            ))}

            {/* Prev button */}
            <button
              onClick={handlePrev}
              aria-label="Previous slide"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20
                w-10 h-10 rounded-full flex items-center justify-center
                bg-[#080810]/70 backdrop-blur-sm border border-[#00f5e033] text-[#00f5e0]
                hover:bg-[#00f5e022] hover:border-[#00f5e077]
                transition-all duration-200 active:scale-90"
            >
              <ChevronIcon direction="left" />
            </button>

            {/* Next button */}
            <button
              onClick={handleNext}
              aria-label="Next slide"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20
                w-10 h-10 rounded-full flex items-center justify-center
                bg-[#080810]/70 backdrop-blur-sm border border-[#00f5e033] text-[#00f5e0]
                hover:bg-[#00f5e022] hover:border-[#00f5e077]
                transition-all duration-200 active:scale-90"
            >
              <ChevronIcon direction="right" />
            </button>

            {/* Scan line accent */}
            <div className="absolute top-0 left-0 right-0 h-px overflow-hidden pointer-events-none z-20">
              <div
                className="absolute top-0 h-px w-1/3 bg-gradient-to-r from-transparent via-[#00f5e055] to-transparent"
                style={{ animation: "techlo-scan 3s linear infinite" }}
              />
            </div>
          </div>

          {/* Dot indicators */}
          <div className="flex items-center justify-center gap-2.5 mt-4">
            {CAROUSEL_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => handleDot(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={[
                  "transition-all duration-300 rounded-full",
                  i === current
                    ? "w-6 h-2 bg-[#00f5e0]"
                    : "w-2 h-2 bg-[#00f5e033] hover:bg-[#00f5e066]",
                ].join(" ")}
                style={i === current ? { boxShadow: "0 0 8px #00f5e088" } : undefined}
              />
            ))}
          </div>

          {/* Slide counter */}
          <div className="absolute bottom-8 right-4 z-20 font-mono text-[11px] text-white/60 tracking-widest">
            <span className="text-[#00f5e0]">{String(current + 1).padStart(2, "0")}</span>
            &nbsp;/&nbsp;{String(total).padStart(2, "0")}
          </div>
        </div>

      </section>
    </>
  );
}