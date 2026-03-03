export default function TechloFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#2f2f30] border-t border-[#00f5e01a]">
      <div className="max-w-[1000px] mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">

        {/* Copyright */}
        <p className="font-mono text-[11px] tracking-[0.2em] text-[#ffffff] uppercase">
          © {year} Techlo. All rights reserved.
        </p>

        {/* Powered by */}
        <p className="font-mono text-[11px] tracking-[0.2em] text-[#f7f7f796] uppercase">
          Powered by{" "}
          <span
            className="text-[#00f5e0]"
            style={{ textShadow: "0 0 8px #00f5e055" }}
          >
            Still 45
          </span>{" "}
          ✌
        </p>

      </div>
    </footer>
  );
}