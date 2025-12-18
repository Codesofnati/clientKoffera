import type { Metadata } from "next";

import HeroSection from "./components/HeroSection";
import Founder from "./components/Founder";
import AboutUs from "./components/AboutUs";
import Product from "./components/Product";
import TargetMarket from "./components/TargetMarket";
import Achievements from "./components/Achievements";
import BenefitsSection from "./components/Benefits";
import ContactUs from "./components/ContactUs";

export const metadata: Metadata = {
  title: "Premium Ethiopian Coffee Exporter",
  description:
    "Discover Koffera Coffee – exporting premium Ethiopian Arabica coffee worldwide with sustainability and quality.",
};

<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Koffera Coffee",
      url: "https://koffera.vercel.app",
      logo: "https://koffera.vercel.app/hero-logo.png",
      sameAs: [
        "https://www.facebook.com/share/1BmywZfzue/?mibextid=wwXIfr",
        "https://www.instagram.com/fira_link_business_solution?igsh=b3BlZ3R1aWlwMTE3&utm_source=qr",
        "https://t.me/Fira_Link",
        "https://youtube.com/@fira-linkbusinesssolutionstube?si=8afre4ZAqfod6u3R"
      ],
    }),
  }}
/>


export default function Home() {



  
  return (
    <div className="scroll-smooth">
      {/* Hero Section */}
      <section id="hero" className="min-h-screen">
        <HeroSection />
      </section>

      {/* Founder Section */}
      <section id="founder" className="min-h-screen bg-gray-50">
        <Founder />
      </section>

      {/* About Us Section */}
      <section id="about" className="min-h-screen bg-white">
        <AboutUs />
      </section>

      {/* Products Section */}
      <section id="products" className="min-h-screen bg-gray-50">
        <Product />
      </section>

      {/* Target Market Section */}
      <section id="market" className="min-h-screen bg-white">
        <TargetMarket />
      </section>

      {/* Achievements Section */}
      <section id="achievements" className="min-h-screen bg-emerald-50">
        <Achievements />
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="min-h-screen bg-white">
        <BenefitsSection />
      </section>

      {/* Contact Section */}
      <section id="contact" className="min-h-screen bg-gray-50">
        <ContactUs />
      </section>
    </div>
  );
}
