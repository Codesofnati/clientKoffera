"use client";
import React from "react";
import { motion } from "framer-motion";
import { Coffee, Leaf, Package, Truck, Users } from "lucide-react";

const benefits = [
  {
    icon: <Coffee className="w-10 h-10 text-amber-600" />,
    title: "Consistent Quality",
    desc: "Specialty-grade beans that meet international standards.",
  },
  {
    icon: <Users className="w-10 h-10 text-amber-600" />,
    title: "Direct Sourcing",
    desc: "Transparent supply chain with strong farmer relationships.",
  },
  {
    icon: <Leaf className="w-10 h-10 text-amber-600" />,
    title: "Sustainable Practices",
    desc: "Eco-friendly processing and fair trade principles.",
  },
  {
    icon: <Package className="w-10 h-10 text-amber-600" />,
    title: "Custom Solutions",
    desc: "Flexible packaging and private label options for diverse markets.",
  },
  {
    icon: <Truck className="w-10 h-10 text-amber-600" />,
    title: "Reliable Export Services",
    desc: "Efficient logistics, documentation, and customer support.",
  },
];

export default function BenefitsSection() {
  return (
    <section id="benefits" className="bg-emerald-50 py-20 px-6 md:px-20">
      <div className="max-w-6xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-emerald-900 mb-6"
        >
          🤝 Benefits of Partnering with <span className="text-amber-600">Koffera Coffee</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          viewport={{ once: true }}
          className="text-emerald-800 mb-12 text-lg max-w-3xl mx-auto"
        >
          Experience transparency, quality, and sustainability at every stage — from farm to export.
        </motion.p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6 text-left border border-emerald-100"
            >
              <div className="mb-4">{b.icon}</div>
              <h3 className="text-xl font-semibold text-emerald-900 mb-2">
                {b.title}
              </h3>
              <p className="text-emerald-700">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
