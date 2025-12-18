"use client";

import React, { useState, useEffect, JSX } from "react";
import { motion } from "framer-motion";
import {
  FaFacebookF,
  FaTelegramPlane,
  FaYoutube,
  FaTiktok,
  FaWhatsapp,
  FaInstagram,
} from "react-icons/fa";

// Social Links Interface
interface SocialLink {
  id: number;
  platform: string;
  url: string;
  icon: string;
}

// Icon mapper
const iconMap: Record<string, JSX.Element> = {
  facebook: <FaFacebookF className="text-2xl" />,
  instagram: <FaInstagram className="text-2xl" />,
  telegram: <FaTelegramPlane className="text-2xl" />,
  youtube: <FaYoutube className="text-2xl" />,
  tiktok: <FaTiktok className="text-2xl" />,
  whatsapp: <FaWhatsapp className="text-2xl" />,
};

export default function ContactUs() {
  const API = process.env.NEXT_PUBLIC_API_URL!;
  const [links, setLinks] = useState<SocialLink[]>([]);



useEffect(() => {
  const fetchSocialLinks = async () => {
    try {
      const res = await fetch(`${API}/social`, { cache: "no-store" });
      if (!res.ok) {
        console.error("Failed to fetch social links");
        return;
      }
      const data: SocialLink[] = await res.json();
      setLinks(data);
    } catch (err) {
      console.error("Error fetching social links:", err);
      setLinks([]);
    }
  };

  fetchSocialLinks();
}, [API]); // API is stable from env, can include safely

  return (
    <section id="contact" className="bg-gradient-to-b min-h-screen from-emerald-900 to-emerald-950 text-white py-20 px-6">
      {/* Header */}
      <motion.div
        className="max-w-6xl mx-auto text-center mb-16"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <p className="uppercase text-amber-400 font-semibold tracking-widest">
          Stay Connected
        </p>
        <h2 className="text-4xl font-bold mb-4">Contact Us</h2>
        <p className="text-emerald-100 max-w-2xl mx-auto text-lg leading-relaxed">
          Connect with{" "}
          <span className="text-amber-400 font-semibold">Koffera Coffee</span>{" "}
          on your favorite platforms. Follow us for updates, stories from
          farmers, and insights into Ethiopia’s coffee culture.
        </p>
      </motion.div>

      {/* Social Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
        {links.map((item) => (
          <motion.a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center bg-white text-gray-900 rounded-2xl shadow-lg 
            border border-emerald-700 hover:border-amber-400 hover:shadow-amber-400/30 
            hover:-translate-y-2 transition-all duration-300 p-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-3">
              {iconMap[item.icon] ?? <span className="text-xl">?</span>}
            </div>
            <h3 className="font-semibold text-lg capitalize">
              {item.platform}
            </h3>
          </motion.a>
        ))}
      </div>

      {/* Footer */}
      <motion.p
        className="text-center text-amber-400 text-sm mt-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        ☕ Let’s brew strong connections — one message at a time.
      </motion.p>
    </section>
  );
}
