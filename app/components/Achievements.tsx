"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { 
  Award, 
  Trophy, 
  Medal, 
  Star, 
  Users, 
  Globe, 
  Heart, 
  Sparkles,
  CheckCircle,
  TrendingUp,
  Coffee,
  Leaf,
  Shield,
  Truck,
  MapPin
} from "lucide-react";
import Link from "next/link";

const achievements = [
  {
    icon: <Award className="w-10 h-10 text-emerald-600" />,
    title: "Award-Winning Products",
    desc: "Recognized for exceptional quality and flavor profiles of Ethiopian Arabica coffee.",
    color: "emerald",
  },
  {
    icon: <Users className="w-10 h-10 text-green-600" />,
    title: "Successful Partnerships",
    desc: "Building long-term collaborations with farmers, exporters, and global distributors.",
    color: "green",
    stats: "100+ Partners",
    year: "Global Network"
  },
  {
    icon: <Globe className="w-10 h-10 text-emerald-600" />,
    title: "Sustainable Sourcing",
    desc: "Committed to ethical, environmentally responsible, and traceable coffee supply chains.",
    color: "emerald",
    stats: "100% Traceable",
    year: "Certified"
  },
  {
    icon: <Star className="w-10 h-10 text-green-600" />,
    title: "Customer Satisfaction",
    desc: "Praised by roasters and importers for reliability, quality consistency, and transparency.",
    color: "green",
    stats: "4.9/5 Rating",
  },
];



export default function Achievements() {
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


  // Helper function for color classes
  const getColorClasses = (color: string, type: 'bg' | 'text' | 'border' | 'from' | 'to') => {
    const isEmerald = color === 'emerald';
    switch(type) {
      case 'bg':
        return isEmerald ? 'bg-emerald-50' : 'bg-green-50';
      case 'text':
        return isEmerald ? 'text-emerald-600' : 'text-green-600';
      case 'border':
        return isEmerald ? 'border-emerald-200' : 'border-green-200';
      case 'from':
        return isEmerald ? 'from-emerald-500' : 'from-green-500';
      case 'to':
        return isEmerald ? 'to-green-600' : 'to-emerald-600';
      default:
        return '';
    }
  };

  return (
    <section 
      id="achievements" 
      ref={sectionRef}
      className="relative w-full bg-gradient-to-b from-white via-gray-50/70 to-white py-24 px-5 md:px-16 overflow-hidden"
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
          className="absolute top-20 right-20 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-20"
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, -30, 0],
            y: [0, 20, 0]
          }}
          transition={{ duration: 15, repeat: Infinity }}
        />
        
        
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
                <Trophy className="w-8 h-8 text-emerald-600" />
                
                
              </div>
            </div>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="text-emerald-600 font-semibold tracking-widest text-sm mb-4"
          >
            KOFFERA COFFEE
          </motion.p>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-6xl font-bold text-gray-800 mb-4"
          >
            Our{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-600 bg-clip-text text-transparent bg-[length:200%]">
              Achievements
            </span>
          </motion.h2>

          {/* Animated Underline */}
          <motion.div 
            className="w-24 h-1 bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-400 mx-auto mb-6 rounded-full"
            
            transition={{ duration: 3, repeat: Infinity }}
          />

          {/* Description */}
<motion.div
  initial={{ opacity: 0 }}
  animate={isHeaderInView ? { opacity: 1 } : {}}
  transition={{ delay: 0.3 }}
  className="relative max-w-3xl mx-auto"
>
  {/* Left Decorative Element */}
  <motion.span
    className="absolute -left-8 top-1/2 -translate-y-1/2 text-emerald-300"
    animate={{ x: [-5, 0, -5] }}
    transition={{ duration: 2, repeat: Infinity }}
  >
    ✦
  </motion.span>
  
  {/* Right Border with Gradient */}
  <div className="absolute "></div>
  
  {/* Text Content */}
  <p className="text-gray-600 text-lg leading-relaxed text-left pr-8">
    Koffera Coffee has successfully expanded its global footprint by exporting premium Ethiopian Arabica beans to
    specialty markets across Europe, Asia, and North America. Through strong farmer partnerships and a commitment
    to quality and sustainability, the company has earned recognition for delivering traceable, ethically sourced
    coffee that reflects Ethiopia's rich heritage.
  </p>
  
  {/* Right Decorative Element */}
  <motion.span
    className="absolute -right-8 top-1/2 -translate-y-1/2 text-green-300"
    animate={{ x: [5, 0, 5] }}
    transition={{ duration: 2, repeat: Infinity }}
  >
    ✦
  </motion.span>
</motion.div>

          
        </motion.div>

        {/* Achievement Cards Grid */}
        <motion.div
          ref={gridRef}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
          initial={{ opacity: 0, y: 50 }}
          animate={isGridInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          style={{ y: cardParallax }}
        >
          {achievements.map((item, index) => {
            const bgColor = getColorClasses(item.color, 'bg');
            const textColor = getColorClasses(item.color, 'text');
            const borderColor = getColorClasses(item.color, 'border');
            const fromColor = getColorClasses(item.color, 'from');
            const toColor = getColorClasses(item.color, 'to');
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isGridInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.15 }}
                whileHover={{ y: -8 }}
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
                <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 h-full">
                  
                  {/* Top Gradient Bar */}
                  <motion.div 
                    className={`h-1 w-full bg-gradient-to-r ${fromColor} ${toColor}`}
                    animate={{ 
                      opacity: [1, 0.8, 1],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  
                  <div className="p-8 flex flex-col items-center">
                    {/* Icon with Background */}
                    <motion.div 
                      className={`w-20 h-20 ${bgColor} rounded-2xl flex items-center justify-center mb-6 relative group-hover:scale-110 transition-transform duration-300`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <div className={textColor}>
                        {item.icon}
                      </div>
                      
                   
                    </motion.div>

                    {/* Title */}
                    <h3 className={`text-xl font-bold text-gray-800 mb-3 text-center group-hover:${textColor} transition-colors`}>
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 text-sm leading-relaxed text-center mb-4">
                      {item.desc}
                    </p>

                    {/* Stats Badge */}
                    <div className={`mt-2 px-3 py-1 ${bgColor} ${textColor} text-xs font-medium rounded-full inline-flex items-center gap-1`}>
                      <CheckCircle className="w-3 h-3" />
                      {item.stats}
                    </div>

                    {/* Year Tag */}
                    <div className="absolute top-3 right-3 text-xs text-gray-400">
                      {item.year}
                    </div>

                    {/* Decorative Corner */}
                    <motion.div 
                      className={`absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-tl ${fromColor}/10 to-transparent rounded-tl-3xl`}
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

   


        {/* Footer Line */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center flex-col mt-12 text-sm flex items-center justify-center gap-2 text-gray-600"
        >
          <Link href="/contact">
          <motion.button
            className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center gap-2 group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Start Your Partnership</span>
            <TrendingUp className="w-4 h-4 group-hover:translate-x-1 transition" />
          </motion.button></Link>
         <div  className="text-center  mt-12 text-sm flex items-center justify-center gap-2 text-gray-600">
           <Sparkles className="w-4 h-4 text-emerald-500" />
          Celebrating excellence, partnerships, and sustainability — the essence of Koffera Coffee.
          <Sparkles className="w-4 h-4 text-green-500" />
         </div>
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