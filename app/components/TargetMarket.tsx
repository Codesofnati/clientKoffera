"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useInView, Variants } from "framer-motion";
import { 
  Globe, 
  Coffee, 
  ShoppingBag, 
  Building2, 
  Users, 
  Leaf,
  ArrowRight,
  MapPin,
  TrendingUp,
  Sparkles,
  CheckCircle,
  Star,
  Droplets,
  Sun,
  Wind
} from "lucide-react";
import Link from "next/link";

const targets = [
  {
    icon: <Coffee className="w-6 h-6" />,
    title: "Specialty Coffee Roasters",
    desc: "Seeking traceable, single-origin Ethiopian beans with unique flavor profiles.",
    color: "from-emerald-500 to-green-600",
    lightColor: "emerald",
    features: ["Single Origin", "Flavor Profiling", "Small Batches"]
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "Importers & Distributors",
    desc: "Looking for reliable suppliers of premium green Arabica coffee for wholesale markets.",
    color: "from-green-600 to-emerald-500",
    lightColor: "green",
    features: ["Bulk Orders", "Consistent Supply", "Global Logistics"]
  },
  {
    icon: <Building2 className="w-6 h-6" />,
    title: "Cafés & Coffee Chains",
    desc: "Interested in sourcing high-quality beans for their signature brews and espresso blends.",
    color: "from-emerald-600 to-green-600",
    lightColor: "emerald",
    features: ["Espresso Blends", "Signature Brews", "Brand Support"]
  },
  {
    icon: <ShoppingBag className="w-6 h-6" />,
    title: "Private Label Brands",
    desc: "In need of custom packaging and consistent supply for branded coffee products.",
    color: "from-green-600 to-emerald-600",
    lightColor: "green",
    features: ["Custom Packaging", "Brand Identity"]
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Retailers & Supermarkets",
    desc: "Offering Ethiopian coffee to consumers who value origin and quality.",
    color: "from-emerald-500 to-green-500",
    lightColor: "emerald",
    features: ["Shelf-Ready", "Consumer Focused"]
  },
  {
    icon: <Leaf className="w-6 h-6" />,
    title: "Ethical & Sustainable Buyers",
    desc: "Prioritizing fair trade, organic, and environmentally responsible sourcing.",
    color: "from-green-500 to-emerald-500",
    lightColor: "green",
    features: ["Fair Trade", "Organic Options", "Carbon Neutral"]
  },
];

export default function TargetMarket() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  
  const isHeaderInView = useInView(headerRef, { once: true, amount: 0.3 });
  const isGridInView = useInView(gridRef, { once: true, amount: 0.1 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const cardParallax = useTransform(scrollYProgress, [0.1, 0.3], ['30px', '0px']);

  // Fixed variants with proper typing
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 12,
        duration: 0.6
      }
    }
  };
  useEffect(() => {
  const generated = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 8 + 2,
    duration: Math.random() * 15 + 10,
    delay: Math.random() * 5,
  }));

  setParticles(generated);
}, []);


  // Floating particles animation
  const [particles, setParticles] = useState<
  { id: number; x: number; y: number; size: number; duration: number; delay: number }[]
>([]);


  // Helper function to get color classes
  const getColorClasses = (color: string, type: 'bg' | 'text' | 'from' | 'to' | 'border') => {
    const isEmerald = color === 'emerald';
    switch(type) {
      case 'bg':
        return isEmerald ? 'bg-emerald-50' : 'bg-green-50';
      case 'text':
        return isEmerald ? 'text-emerald-600' : 'text-green-600';
      case 'from':
        return isEmerald ? 'from-emerald-500' : 'from-green-500';
      case 'to':
        return isEmerald ? 'to-green-600' : 'to-emerald-600';
      case 'border':
        return isEmerald ? 'border-emerald-200' : 'border-green-200';
      default:
        return '';
    }
  };

  return (
    <section 
      id="target" 
      ref={sectionRef}
      className="relative w-full bg-gradient-to-b from-white via-emerald-50/20 to-white py-24 px-5 md:px-16 overflow-hidden"
    >
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-gradient-to-r from-emerald-200/20 to-green-200/20"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
            }}
            animate={{
              x: [0, 30, -30, 0],
              y: [0, -30, 30, 0],
              scale: [1, 1.5, 0.8, 1],
              opacity: [0.1, 0.3, 0.1, 0.1],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          className="absolute top-20 left-20 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-20"
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 15, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-20 right-20 w-96 h-96 bg-green-100 rounded-full blur-3xl opacity-20"
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, 20, 0]
          }}
          transition={{ duration: 18, repeat: Infinity }}
        />
        
        
        <div className="absolute bottom-40 left-1/4 opacity-[0.03] -rotate-12">
          <Leaf className="w-48 h-48 text-green-800" />
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto z-10">
        {/* Header Section */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
          style={{ y: backgroundY }}
        >
          {/* Icon Badge */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={isHeaderInView ? { scale: 1, rotate: 0 } : {}}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="flex justify-center mb-6"
          >
            <div className="relative group">
              <motion.div 
                              className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full blur-xl"
                              animate={{ 
                                scale: [1, 1.3, 1],
                                opacity: [0.4, 0.6, 0.4]
                              }}
                              transition={{ duration: 3, repeat: Infinity }}
                            />
              <div className="relative bg-white p-5 rounded-2xl shadow-xl group-hover:shadow-2xl transition-shadow">
                <MapPin className="w-8 h-8 text-emerald-600" />
                
              
              </div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-bold text-gray-800 mb-4"
          >
            Our{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-600 bg-clip-text text-transparent bg-[length:200%] ">
              Target Market
            </span>
          </motion.h2>

          {/* Animated Underline */}
          <motion.div 
            className="w-24 h-1 bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-400 mx-auto mb-6 rounded-full"
            
            transition={{ duration: 3, repeat: Infinity }}
          />

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={isHeaderInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="text-gray-600 text-lg max-w-3xl mx-auto relative"
          >
            <motion.span
              className="absolute -left-8 top-1/2 -translate-y-1/2 text-emerald-300"
              animate={{ x: [-5, 0, -5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ✦
            </motion.span>
            Koffera Coffee serves a diverse global audience focused on quality, 
            traceability, and ethical sourcing.
            <motion.span
              className="absolute -right-8 top-1/2 -translate-y-1/2 text-green-300"
              animate={{ x: [5, 0, 5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ✦
            </motion.span>
          </motion.p>

        
          {/* Decorative Floating Icons */}
          <div className="flex justify-center gap-4 mt-8">
            {[Star, Droplets, Sun, Wind].map((Icon, i) => (
              <motion.div
                key={i}
                animate={{ 
                  y: [0, -8, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 3,
                  delay: i * 0.5,
                  repeat: Infinity 
                }}
              >
                <Icon className="w-5 h-5 text-emerald-400/60" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Cards Grid */}
        <motion.div
          ref={gridRef}
          variants={containerVariants}
          initial="hidden"
          animate={isGridInView ? "visible" : "hidden"}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          style={{ y: cardParallax }}
        >
          {targets.map((target, index) => {
            const isEmerald = target.lightColor === 'emerald';
            const bgColor = getColorClasses(target.lightColor, 'bg');
            const textColor = getColorClasses(target.lightColor, 'text');
            const fromColor = getColorClasses(target.lightColor, 'from');
            const toColor = getColorClasses(target.lightColor, 'to');
            
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group relative"
              >
                {/* Glow Effect */}
                <motion.div 
                  className={`absolute -inset-0.5 bg-gradient-to-r ${fromColor} ${toColor} rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500`}
                  animate={{ 
                    scale: [1, 1.02, 1],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                
                {/* Card */}
                <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 h-full flex flex-col">
                  
                  {/* Top Gradient Bar with Animation */}
                  <motion.div 
                    className={`h-2 w-full bg-gradient-to-r ${fromColor} ${toColor}`}
                    animate={{ 
                      opacity: [1, 0.8, 1],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  
                  <div className="p-8 flex-1 flex flex-col">
                    {/* Icon with Colored Background and Animation */}
                    <motion.div 
                      className={`inline-flex p-3 ${bgColor} rounded-xl mb-5 w-fit relative`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <div className={textColor}>
                        {target.icon}
                      </div>
                      
                      
                    </motion.div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-emerald-700 transition-colors">
                      {target.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-1">
                      {target.desc}
                    </p>

                    {/* Feature Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {target.features.map((feature, i) => (
                        <motion.span
                          key={i}
                          whileHover={{ scale: 1.05, y: -2 }}
                          className={`px-2 py-1 ${bgColor} ${textColor} text-xs rounded-md font-medium shadow-sm`}
                        >
                          {feature}
                        </motion.span>
                      ))}
                    </div>

             
                    {/* Decorative Corner */}
                    <motion.div 
                      className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${isEmerald ? 'from-emerald-100/30' : 'from-green-100/30'} to-transparent rounded-bl-3xl`}
                      animate={{ 
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Market Reach Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-20 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/5 to-green-600/5 rounded-3xl blur-3xl" />
          
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Left Side - Stats */}
              <div>
                <motion.h3 
                  className="text-3xl font-bold text-gray-800 mb-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  Global Market <span className="text-emerald-600">Presence</span>
                </motion.h3>
                
                <motion.p 
                  className="text-gray-600 mb-6"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  We connect Ethiopian coffee producers with discerning buyers across the globe, 
                  ensuring fair trade and exceptional quality every step of the way.
                </motion.p>
                
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { number: "10+", label: "Countries", color: "emerald" },
                    { number: "100%", label: "Traceable", color: "green" },
                  ].map((stat, i) => {
                    const statColor = stat.color === 'emerald' ? 'text-emerald-600' : 'text-green-600';
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 + i * 0.1 }}
                      >
                        <div className={`text-3xl font-bold ${statColor}`}>{stat.number}</div>
                        <div className="text-sm text-gray-500">{stat.label}</div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Right Side - World Map Visualization */}
              <div className="relative h-48 md:h-auto">
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.02, 1]
                  }}
                  transition={{ duration: 10, repeat: Infinity }}
                >
                  <Globe className="w-40 h-40 text-emerald-100" />
                </motion.div>
                
                <div className="relative grid grid-cols-5 gap-2 p-4">
                  {['CHINA', 'CANADA', 'EUROPE', 'US', 'ASIA'].map((continent, i) => (
                    <motion.div
                      key={i}
                      className="text-center"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.0 + i * 0.1 }}
                      whileHover={{ y: -3 }}
                    >
                      <motion.div 
                        className="w-8 h-8 mx-auto bg-gradient-to-br from-emerald-100 to-green-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-700 mb-1 shadow-md"
                        animate={{ 
                          scale: [1, 1.1, 1],
                        }}
                        transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                      >
                        {continent}
                      </motion.div>
                      <div className="text-[10px] text-gray-500">Active</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <motion.div 
              className="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br from-emerald-200/30 to-green-200/30 rounded-full blur-2xl"
              animate={{ 
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16 relative"
        >
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-emerald-600/10 to-green-600/10 rounded-full blur-3xl" />
          
          <motion.div
            className="relative inline-block"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
           
            
            <motion.div 
              className="absolute -inset-5 rounded-full border border-green-600/20"
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.2, 0.4, 0.2],
                rotate: [360, 180, 0]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            
            <div className="relative px-8 py-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-full shadow-xl overflow-hidden group">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-600"
                initial={{ x: '-100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
              
              <Link href="/contact">
              <div className="relative z-10 flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-emerald-600 group-hover:text-white transition-colors" />
                <span className="text-gray-700 font-medium group-hover:text-white transition-colors">
                  Join our growing family of global partners
                </span>
                <Sparkles className="w-4 h-4 text-green-600 group-hover:text-white transition-colors" />
              </div></Link>
            </div>
          </motion.div>

          <motion.p 
            className="text-gray-500 text-sm mt-6 flex items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
          >
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            Connecting Ethiopian coffee producers with global markets — ethically and sustainably
          </motion.p>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
          background-size: 200% 200%;
        }
      `}</style>
    </section>
  );
}