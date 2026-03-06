"use client";

import React, { useEffect, useState, JSX } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import {
  FaFacebookF,
  FaTelegramPlane,
  FaYoutube,
  FaTiktok,
  FaWhatsapp,
  FaInstagram,
  FaCoffee,
  FaLeaf,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";
import { FiHeart } from "react-icons/fi";
import { GiCoffeeBeans } from "react-icons/gi";

interface SocialLink {
  id: number;
  platform: string;
  url: string;
  icon: string;
}

// Map DB icon name → React Icon
const iconMap: Record<string, JSX.Element> = {
  facebook: <FaFacebookF />,
  instagram: <FaInstagram />,
  telegram: <FaTelegramPlane />,
  youtube: <FaYoutube />,
  tiktok: <FaTiktok />,
  whatsapp: <FaWhatsapp />,
};

const Footer = () => {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [currentYear, setCurrentYear] = useState(2024);
  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
    
    const fetchSocialLinks = async () => {
      try {
        if (!API) return console.error("API URL not defined");
        const res = await fetch(`${API}/social`);
        if (!res.ok) {
          console.error("Failed to fetch social links");
          return;
        }
        const data: SocialLink[] = await res.json();
        setLinks(data);
      } catch (err) {
        console.error("Failed to load social links", err);
        setLinks([]);
      }
    };

    fetchSocialLinks();
  }, [API]);

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 100,
        damping: 10 
      },
    },
  };

  return (
    <footer className="relative bg-gradient-to-b from-gray-900 to-gray-950 text-gray-200 pt-12 pb-6 px-6 md:px-16 overflow-hidden">
      {/* Simple background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-10 w-64 h-64 bg-amber-900/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-10 w-80 h-80 bg-emerald-900/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="max-w-6xl mx-auto relative z-10"
      >
        {/* Main footer content - simplified grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-gray-800">
          {/* Brand Column - 6 cols on md */}
          <motion.div variants={itemVariants} className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full blur-lg opacity-60" />
                <div className="relative w-12 h-12 bg-gradient-to-br from-amber-400 to-emerald-600 rounded-full flex items-center justify-center">
                  <FaCoffee className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  <span className="bg-gradient-to-r from-amber-400 to-emerald-400 bg-clip-text text-transparent">
                    Koffera
                  </span>
                </h2>
                <p className="text-emerald-400/70 text-xs tracking-wider">PREMIUM ETHIOPIAN COFFEE</p>
              </div>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              Bringing you the finest Ethiopian coffee beans, sourced directly from 
              sustainable farms in the highlands of Ethiopia.
            </p>

            {/* Contact Info - simplified */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-3 text-gray-400">
                <FaMapMarkerAlt className="w-3 h-3 text-emerald-400" />
                <span className="text-xs">Addis Ababa, Ethiopia</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <FaEnvelope className="w-3 h-3 text-emerald-400" />
                <span className="text-xs">firaolkebede777@gmail.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <FaPhone className="w-3 h-3 text-emerald-400" />
                <span className="text-xs">+251 920318757</span>
              </div>
            </div>
          </motion.div>

          {/* Quick Links - 3 cols on md */}
          <motion.div variants={itemVariants} className="md:col-span-3">
            <h3 className="text-md font-semibold mb-4 text-amber-400">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { name: "Home", href: "/" },
                { name: "About Us", href: "/about" },
                { name: "Products", href: "/products" },
                { name: "Contact", href: "/contact" },
                { name: "Blog", href: "/posts" },
              ].map((link) => (
                <motion.li
                  key={link.name}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-amber-400 transition-colors text-sm flex items-center gap-2"
                  >
                    <span className="w-1 h-1 bg-amber-400/50 rounded-full" />
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Social Links - 3 cols on md */}
          <motion.div variants={itemVariants} className="md:col-span-3">
            <h3 className="text-md font-semibold mb-4 text-emerald-400">Connect</h3>
            <div className="flex flex-wrap gap-3">
              {links.length > 0 ? (
                links.map((item) => (
                  <motion.a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.platform}
                    whileHover={{ y: -3, scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 bg-gray-800/80 hover:bg-gradient-to-r hover:from-amber-600 hover:to-emerald-600 rounded-lg flex items-center justify-center text-gray-300 hover:text-white text-base transition-all duration-300 border border-gray-700"
                  >
                    {iconMap[item.icon.toLowerCase()] ?? "?"}
                  </motion.a>
                ))
              ) : (
                <p className="text-gray-500 text-xs">No social links</p>
              )}
            </div>
            
            {/* Simple trust badge */}
            <div className="mt-4 flex items-center gap-2 text-emerald-400/60">
              <FaLeaf className="w-3 h-3" />
              <span className="text-xs">100% Ethiopian Coffee</span>
            </div>
          </motion.div>
        </div>

        {/* Bottom bar - simplified */}
        <motion.div
          variants={itemVariants}
          className="pt-4 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-gray-500"
        >
          <div className="flex items-center gap-2">
            <FaCoffee className="w-3 h-3 text-amber-600/50" />
            <span>© {currentYear} Koffera Coffee. All rights reserved.</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-amber-400 transition-colors">
              Privacy
            </Link>
            <span className="text-gray-700">•</span>
            <Link href="/" className="hover:text-amber-400 transition-colors">
              Terms
            </Link>
            <span className="text-gray-700">•</span>
            <Link href="/" className="hover:text-amber-400 transition-colors">
              Sitemap
            </Link>
          </div>

          <div className="flex items-center gap-1">
            <span>Provided by</span>
            <FiHeart className="w-3 h-3 text-red-500 mx-0.5" />
            <span className="font-medium text-emerald-400">Nathnael</span>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
};

export default Footer;