"use client";
import React from "react";
import { motion } from "framer-motion";
import { Globe, Coffee, ShoppingBag, Building2, Users, Leaf } from "lucide-react";

const targets = [
  {
    icon: <Coffee className="w-10 h-10 text-amber-600" />,
    title: "Specialty Coffee Roasters",
    desc: "Seeking traceable, single-origin Ethiopian beans with unique flavor profiles.",
  },
  {
    icon: <Globe className="w-10 h-10 text-amber-600" />,
    title: "Importers & Distributors",
    desc: "Looking for reliable suppliers of premium green Arabica coffee for wholesale markets.",
  },
  {
    icon: <Building2 className="w-10 h-10 text-amber-600" />,
    title: "Cafés & Coffee Chains",
    desc: "Interested in sourcing high-quality beans for their signature brews and espresso blends.",
  },
  {
    icon: <ShoppingBag className="w-10 h-10 text-amber-600" />,
    title: "Private Label Brands",
    desc: "In need of custom packaging and consistent supply for branded coffee products.",
  },
  {
    icon: <Users className="w-10 h-10 text-amber-600" />,
    title: "Retailers & Supermarkets",
    desc: "Offering Ethiopian coffee to consumers who value origin and quality.",
  },
  {
    icon: <Leaf className="w-10 h-10 text-amber-600" />,
    title: "Ethical & Sustainable Buyers",
    desc: "Prioritizing fair trade, organic, and environmentally responsible sourcing.",
  },
];

export default function TargetMarket() {
  return (
    <section id="target" className="bg-emerald-50 py-20 px-6 md:px-20">
      <div className="max-w-6xl mx-auto text-center">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-emerald-900 mb-6"
        >
          🎯 Our Target Market
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          viewport={{ once: true }}
          className="text-emerald-800 mb-12 text-lg max-w-3xl mx-auto"
        >
          Koffera Coffee serves a diverse global audience focused on quality, traceability, and ethical sourcing.
        </motion.p>

        {/* Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {targets.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all border border-emerald-100 p-6 text-left hover:-translate-y-2 duration-300"
            >
              <div className="mb-4">{t.icon}</div>
              <h3 className="text-xl font-semibold text-emerald-900 mb-2">
                {t.title}
              </h3>
              <p className="text-emerald-700">{t.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Footer line */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center text-emerald-700 text-sm mt-12"
        >
          🌍 Connecting Ethiopian coffee producers with global markets — ethically and sustainably.
        </motion.p>
      </div>
    </section>
  );
}
