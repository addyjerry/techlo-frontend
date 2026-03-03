import Image from "next/image";
import TechloHero from "./components/HeroSection";
import TechloProductSection from "./components/ProductSection";
import { SearchProvider } from "./context/SearchContext";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black max-w-[1000px] mx-auto">
      <SearchProvider>
      <TechloHero/>
      <TechloProductSection/>
      </SearchProvider>
    </div>
  );
}
