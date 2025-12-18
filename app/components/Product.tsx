"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
interface Product {
  id: number;
  name: string;
  description: string;
}

interface Service {
  id: number;
  title: string;
  description: string;
}

export default function Product() {
  const API = process.env.NEXT_PUBLIC_API_URL;
  
const [products, setProducts] = useState<Product[]>([]);
const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    if (!API) return;

    fetch(`${API}/products`)
      .then((res) => res.json())
      .then(setProducts)
      .catch(console.error);

    fetch(`${API}/services`)
      .then((res) => res.json())
      .then(setServices)
      .catch(console.error);
  }, [API]);

  return (
    <section id="product" className="bg-gradient-to-b from-emerald-700 to-emerald-900 text-white py-20 px-6 md:px-20">
      <div className="max-w-6xl mx-auto">

        {/* Title */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl font-bold mb-3"
          >
            ☕ Our Products & Services
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
            className="text-emerald-200 text-lg max-w-2xl mx-auto"
          >
            Delivering quality, sustainability, and authenticity from farm to cup.
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-10 mb-16">

          {/* Products */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white text-black rounded-2xl shadow-lg p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-emerald-100"
          >
            <h3 className="text-2xl font-semibold mb-5 text-emerald-700 border-b-2 border-emerald-600 pb-2">
              Products
            </h3>

            <ul className="space-y-4">
              {products.map((item: Product) => (
                <li key={item.id}>
                  <p className="text-gray-800 leading-relaxed">
                    <span className="font-bold text-emerald-700">
                      {item.name}
                    </span>{" "}
                    — {item.description}
                  </p>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white text-black rounded-2xl shadow-lg p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-emerald-100"
          >
            <h3 className="text-2xl font-semibold mb-5 text-emerald-700 border-b-2 border-emerald-600 pb-2">
              Services
            </h3>

            <ul className="space-y-4">
              {services.map((item: Service) => (
                <li key={item.id}>
                  <p className="text-gray-800 leading-relaxed">
                    <span className="font-bold text-emerald-700">
                      {item.title}
                    </span>{" "}
                    — {item.description}
                  </p>
                </li>
              ))}
            </ul>
          </motion.div>

        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center text-emerald-300 text-sm mt-8"
        >
          🌍 Proudly sourcing and exporting Ethiopian coffee to the world.
        </motion.p>
      </div>
    </section>
  );
}
