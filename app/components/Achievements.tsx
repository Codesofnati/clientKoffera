"use client";
import React from "react";
import { motion } from "framer-motion";
import { HiStar, HiOutlineHand, HiGlobeAlt, HiUsers } from "react-icons/hi";

const achievements = [
  {
    icon: <HiStar className="w-16 h-16 text-amber-400 mx-auto" />,
    title: "Award-Winning Products",
    desc: "Recognized for exceptional quality and flavor profiles of Ethiopian Arabica coffee.",
  },
  {
    icon: <HiOutlineHand className="w-16 h-16 text-amber-400 mx-auto" />,
    title: "Successful Partnerships",
    desc: "Building long-term collaborations with farmers, exporters, and global distributors.",
  },
  {
    icon: <HiGlobeAlt className="w-16 h-16 text-amber-400 mx-auto" />,
    title: "Sustainable Sourcing",
    desc: "Committed to ethical, environmentally responsible, and traceable coffee supply chains.",
  },
  {
    icon: <HiUsers className="w-16 h-16 text-amber-400 mx-auto" />,
    title: "Customer Satisfaction Ratings",
    desc: "Praised by roasters and importers for reliability, quality consistency, and transparency.",
  },
];



export default function Achievements() {
  return (
    <section id="achivements" className="bg-gradient-to-b from-emerald-800 to-emerald-900 text-white py-20 px-6 md:px-20">
      <div className="max-w-6xl mx-auto text-center mb-16">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="uppercase text-amber-400 font-semibold tracking-widest"
        >
          Koffera Coffee
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-4xl font-bold mb-4"
        >
          Achievements
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          viewport={{ once: true }}
          className="text-emerald-100 max-w-3xl mx-auto text-lg leading-relaxed"
        >
          Koffera Coffee has successfully expanded its global footprint by exporting premium Ethiopian Arabica beans to
          specialty markets across Europe, Asia, and North America. Through strong farmer partnerships and a commitment
          to quality and sustainability, the company has earned recognition for delivering traceable, ethically sourced
          coffee that reflects Ethiopia’s rich heritage.
        </motion.p>
      </div>

      {/* Achievement Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
        {achievements.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15, duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white text-gray-900 rounded-2xl shadow-lg overflow-hidden border border-emerald-700 hover:border-amber-400 hover:shadow-amber-400/30 hover:-translate-y-2 transition-all duration-300 p-6 flex flex-col items-center"
          >
            {/* Icon */}
            <div className="mb-6">
              {item.icon}
            </div>

            {/* Content */}
            <div className="text-center">
              <h3 className="text-xl font-semibold text-emerald-800 mb-2">
                {item.title}
              </h3>
              <p className="text-gray-700 leading-relaxed">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer line */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        viewport={{ once: true }}
        className="text-center text-amber-400 text-sm mt-12"
      >
        🌍 Celebrating excellence, partnerships, and sustainability — the essence of Koffera Coffee.
      </motion.p>
    </section>
  );
}
