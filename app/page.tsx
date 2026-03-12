import type { Metadata } from "next";

import HeroSection from "./components/HeroSection";
import Founder from "./components/Founder";
import AboutUs from "./components/AboutUs";
import Product from "./components/Product";
import TargetMarket from "./components/TargetMarket";
import Achievements from "./components/Achievements";
import BenefitsSection from "./components/Benefits";
import ContactUs from "./components/ContactUs";
import AdminPostsPage from "./components/Posts";

export const metadata: Metadata = {
  title: "Koffera Ethiopian Coffee Exporter",
  description:
    "Discover Koffera Coffee – exporting Ethiopian coffee worldwide with quality.",
};
export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Koffera Coffee",
    url: "https://www.kofferacoffeeexport.com",
    logo: "https://www.kofferacoffeeexport.com/og-image.png",
    sameAs: [
      "https://www.facebook.com/share/1BmywZfzue/?mibextid=wwXIfr",
      "https://www.instagram.com/fira_link_business_solution",
      "https://t.me/Fira_Link",
      "https://youtube.com/@fira-linkbusinesssolutionstube"
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="scroll-smooth">
        <section id="hero" className="min-h-screen">
          <HeroSection />
        </section>

        <section id="founder" className="min-h-screen bg-gray-50">
          <Founder />
        </section>

        <section id="about" className="min-h-screen bg-white">
          <AboutUs />
        </section>

        <section id="products" className="min-h-screen bg-gray-50">
          <Product />
        </section>

        <section id="market" className="min-h-screen bg-white">
          <TargetMarket />
        </section>

        <section id="achievements" className="min-h-screen bg-emerald-50">
          <Achievements />
        </section>

        <section id="benefits" className="min-h-screen bg-white">
          <BenefitsSection />
        </section>
      </div>
    </>
  );
}