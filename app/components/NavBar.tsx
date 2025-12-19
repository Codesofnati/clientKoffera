"use client";
import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaBars, FaTimes } from "react-icons/fa";

const NavBar = () => {
  const [mobileMenu, setMobileMenu] = useState(false);

  const links = [
    { text: "About Us", id: "about" },
    { text: "Products & Services", id: "products" },
    { text: "Target Market", id: "market" },
    { text: "Achievements", id: "achievements" },
    { text: "Benefits With Us", id: "benefits" },
    { text: "Contact Us", id: "contact" },
  ];

 const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    const yOffset = -90; // navbar height (adjust if your navbar is taller)
    const y =
      element.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: "smooth" });
  }
  setMobileMenu(false);
};


  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-emerald-100 shadow-sm"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between h-[90px] px-5 md:px-10 relative">
        {/* Left Links */}
        <nav className="hidden md:flex items-center space-x-8">
          {links.slice(0, 3).map((link, index) => (
            <button
              key={index}
              onClick={() => scrollToSection(link.id)}
              className="text-emerald-800 font-semibold hover:text-emerald-600 transition-colors duration-300"
            >
              {link.text}
            </button>
          ))}
        </nav>

        {/* Logo in center */}
<div className="transition-transform duration-300 hover:scale-105 hover:rotate-1">
  <Image
    src="/hero-logo.png"
    alt="Logo"
    width={140}
    height={60}
    className="w-auto h-auto"
    priority
  />
</div>



        {/* Right Links */}
        <nav className="hidden md:flex items-center space-x-8">
          {links.slice(3).map((link, index) => (
            <button
              key={index}
              onClick={() => scrollToSection(link.id)}
              className="text-emerald-800 font-semibold hover:text-emerald-600 transition-colors duration-300"
            >
              {link.text}
            </button>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden ml-auto">
          <button onClick={() => setMobileMenu(!mobileMenu)} className="text-emerald-700">
            {mobileMenu ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenu && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-white border-t border-emerald-100 shadow-lg rounded-b-2xl py-4 text-center space-y-3"
        >
          {links.map((link, index) => (
            <button
              key={index}
              onClick={() => scrollToSection(link.id)}
              className="block text-emerald-800 font-medium hover:text-emerald-600 transition duration-200"
            >
              {link.text}
            </button>
          ))}
        </motion.div>
      )}
    </motion.header>
  );
};

export default NavBar;
