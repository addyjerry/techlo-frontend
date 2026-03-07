"use client";

import { useState, useEffect } from "react";

/*
  How this works:
  ───────────────
  Browsers fire a "beforeinstallprompt" event when your PWA meets the
  installability criteria (HTTPS + manifest + service worker). We capture
  that event, prevent it from showing the default browser UI, and instead
  show our own styled banner at the bottom of the screen.

  When the user taps "Install", we call prompt() on the captured event,
  which triggers the native browser install dialog. If they accept, the
  app gets added to their home screen.

  iOS doesn't support beforeinstallprompt — Safari handles it differently.
  We detect iOS separately and show manual instructions instead.
*/

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS]               = useState(false);
  const [showBanner, setShowBanner]     = useState(false);
  const [dismissed, setDismissed]       = useState(false);
  const [installed, setInstalled]       = useState(false);

  useEffect(() => {
    // Check if already installed (running in standalone mode)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (isStandalone) return; // Already installed — don't show banner

    // Check if user previously dismissed
    const wasDismissed = localStorage.getItem("techlo-pwa-dismissed");
    if (wasDismissed) return;

    // Detect iOS (iPhone / iPad)
    const ios = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    setIsIOS(ios);

    if (ios) {
      // Show iOS manual instructions after a short delay
      setTimeout(() => setShowBanner(true), 3000);
      return;
    }

    // Android / Chrome: capture the install prompt
    const handler = (e: Event) => {
      e.preventDefault();                                      // Stop the default browser prompt
      setInstallEvent(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowBanner(true), 3000);             // Show our banner after 3s
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Listen for successful install
    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setShowBanner(false);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
      setInstalled(true);
    }
    setInstallEvent(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    // Remember dismissal for 7 days
    localStorage.setItem("techlo-pwa-dismissed", Date.now().toString());
    setTimeout(() => localStorage.removeItem("techlo-pwa-dismissed"), 7 * 24 * 60 * 60 * 1000);
  };

  if (!showBanner || dismissed || installed) return null;

  // ── iOS banner (manual instructions) ──────────────────────────────────────
  if (isIOS) {
    return (
      <div
        className={[
          "fixed bottom-0 left-0 right-0 z-[300] px-4 pb-6 pt-4",
          "transition-transform duration-500",
          showBanner ? "translate-y-0" : "translate-y-full",
        ].join(" ")}
      >
        <div
          className="max-w-md mx-auto bg-[#0d0d1f] border border-[#00f5e033] rounded-2xl p-5 relative"
          style={{ boxShadow: "0 -4px 40px #00f5e011, 0 8px 32px #00000088" }}
        >
          <button onClick={handleDismiss}
            className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg
              bg-[#080810] border border-[#00f5e022] text-[#00f5e055] hover:text-[#00f5e0]
              font-mono text-sm transition-colors duration-200">
            ✕
          </button>

          <div className="flex items-center gap-3 mb-3">
            {/* Techlo mini icon */}
            <div className="w-12 h-12 rounded-xl bg-[#080810] border border-[#00f5e033] flex items-center justify-center flex-shrink-0"
              style={{ boxShadow: "0 0 12px #00f5e022" }}>
              <span className="font-mono font-bold text-xs text-[#00f5e0]">TL</span>
            </div>
            <div>
              <p className="font-mono font-bold text-white text-sm">Install Techlo</p>
              <p className="font-mono text-[10px] text-[#00f5e055] tracking-widest uppercase">Add to Home Screen</p>
            </div>
          </div>

          <p className="font-mono text-[11px] text-[#7baaa8] mb-3 leading-relaxed">
            Get the full app experience — browse offline and access Techlo directly from your home screen.
          </p>

          {/* Step-by-step iOS instructions */}
          <div className="flex flex-col gap-2">
            {[
              { step: "1", text: "Tap the Share button at the bottom of Safari", icon: "↑" },
              { step: "2", text: "Scroll down and tap \"Add to Home Screen\"",    icon: "+" },
              { step: "3", text: "Tap \"Add\" in the top right corner",           icon: "✓" },
            ].map(({ step, text, icon }) => (
              <div key={step} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#080810] border border-[#00f5e01a]">
                <span className="w-6 h-6 rounded-full bg-[#00f5e011] border border-[#00f5e033]
                  flex items-center justify-center font-mono text-[10px] text-[#00f5e0] flex-shrink-0 font-bold">
                  {icon}
                </span>
                <p className="font-mono text-[11px] text-[#7baaa8]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Android / Chrome banner ────────────────────────────────────────────────
  return (
    <div
      className={[
        "fixed bottom-0 left-0 right-0 z-[300] px-4 pb-6 pt-4",
        "transition-transform duration-500",
        showBanner ? "translate-y-0" : "translate-y-full",
      ].join(" ")}
    >
      <div
        className="max-w-md mx-auto bg-[#0d0d1f] border border-[#00f5e033] rounded-2xl p-5"
        style={{ boxShadow: "0 -4px 40px #00f5e011, 0 8px 32px #00000088" }}
      >
        <div className="flex items-center gap-4">
          {/* App icon */}
          <div className="w-14 h-14 rounded-2xl bg-[#080810] border border-[#00f5e033] flex items-center justify-center flex-shrink-0"
            style={{ boxShadow: "0 0 16px #00f5e022" }}>
            <span className="font-mono font-bold text-sm text-[#00f5e0]" style={{ textShadow: "0 0 8px #00f5e066" }}>TL</span>
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="font-mono font-bold text-white text-sm">Install Techlo</p>
            <p className="font-mono text-[10px] text-[#7baaa8] mt-0.5 leading-relaxed">
              Add to your home screen for faster access and offline browsing
            </p>
          </div>

          {/* Dismiss */}
          <button onClick={handleDismiss}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#080810]
              border border-[#00f5e022] text-[#00f5e055] hover:text-[#00f5e0] font-mono text-sm
              transition-colors duration-200 flex-shrink-0">
            ✕
          </button>
        </div>

        {/* Install button */}
        <button
          onClick={handleInstall}
          className="w-full mt-4 h-11 rounded-xl bg-[#00f5e0] text-[#080810]
            font-mono font-bold text-[12px] tracking-widest uppercase
            hover:bg-[#00ddc9] active:scale-95 transition-all duration-200
            flex items-center justify-center gap-2"
          style={{ boxShadow: "0 0 20px #00f5e033" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2v8M4 7l4 4 4-4" stroke="#080810" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12h12" stroke="#080810" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          Install App
        </button>
      </div>
    </div>
  );
}