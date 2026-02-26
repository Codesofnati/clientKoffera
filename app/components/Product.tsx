"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { 
  Coffee, 
  Bean, 
  Leaf, 
  Droplets, 
  Thermometer, 
  Shield,
  Truck,
  TrendingUp,
  Award,
  Users,
  Globe,
  Sparkles,
  Star,
  ChevronRight,
  Heart,
  MapPin,
  Clock,
  CheckCircle,
  Zap,
  Sun,
  Wind
} from "lucide-react";
import Link from "next/link";

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
  const [activeTab, setActiveTab] = useState<'products' | 'services'>('products');
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const isHeaderInView = useInView(headerRef, { once: true, amount: 0.3 });
  const isContentInView = useInView(contentRef, { once: true, amount: 0.1 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const cardParallax = useTransform(scrollYProgress, [0.1, 0.3], ['30px', '0px']);

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

    // Check if mobile on client side
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [API]);
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


  // Product categories
  const productCategories = [
    { name: "Specialty Grade", icon: Award, color: "emerald" },
    { name: "Commercial Grade", icon: Bean, color: "emerald" },
  ];

  // Service features
  const serviceFeatures = [
    { icon: Shield, label: "Quality Certified", color: "emerald" },
    { icon: Truck, label: "Global Shipping", color: "green" },
  ];

  // Floating particles animation
 const [particles, setParticles] = useState<
  { id: number; x: number; y: number; size: number; duration: number; delay: number }[]
>([]);


  return (
    <section 
      id="product" 
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
          className="absolute top-20 right-0 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-20"
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, -30, 0],
            y: [0, 20, 0]
          }}
          transition={{ duration: 15, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-20 left-0 w-96 h-96 bg-green-100 rounded-full blur-3xl opacity-20"
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, 30, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 18, repeat: Infinity }}
        />
        
        
        <div className="absolute bottom-40 right-1/4 opacity-[0.03] -rotate-12">
          <Bean className="w-48 h-48 text-green-800" />
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto z-10">
        {/* Header Section */}
        <motion.div
          ref={headerRef}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          style={{ y: backgroundY }}
        >
          {/* Animated Icon */}
          <motion.div
            className="flex justify-center mb-6"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
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
                <Coffee className="w-10 h-10 text-emerald-600" />
                
               
              </div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h2
            className="text-5xl md:text-6xl font-bold text-gray-800 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
          >
            Our{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-600 bg-clip-text text-transparent bg-[length:200%] ">
              Products & Services
            </span>
          </motion.h2>

          {/* Animated Underline */}
          <motion.div 
            className="w-24 h-1 bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-400 mx-auto mb-6 rounded-full"
            
            transition={{ duration: 3, repeat: Infinity }}
          />

          {/* Description */}
          <motion.p
            className="text-gray-600 text-lg max-w-2xl mx-auto relative"
            initial={{ opacity: 0 }}
            animate={isHeaderInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
          >
            <motion.span
              className="absolute -left-8 top-1/2 -translate-y-1/2 text-emerald-300"
              animate={{ x: [-5, 0, -5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ✦
            </motion.span>
            Delivering quality, sustainability, and authenticity from farm to cup.
            <motion.span
              className="absolute -right-8 top-1/2 -translate-y-1/2 text-green-300"
              animate={{ x: [5, 0, 5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ✦
            </motion.span>
          </motion.p>

          
          {/* Decorative Floating Icons */}
          <div className="flex justify-center gap-4 mt-6">
            {[Leaf, Droplets, Sun, Wind].map((Icon, i) => (
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

        {/* Tab Switcher for Mobile */}
        <div className="md:hidden flex justify-center mb-8">
          <div className="bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === 'products' 
                  ? 'bg-white text-emerald-600 shadow-md' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === 'services' 
                  ? 'bg-white text-emerald-600 shadow-md' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Services
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <motion.div
          ref={contentRef}
          className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-20"
          initial={{ opacity: 0, y: 50 }}
          animate={isContentInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          style={{ y: cardParallax }}
        >
          {/* Products Card */}
          <motion.div
            className={`group ${(!isMobile || activeTab === 'products') ? 'block' : 'hidden md:block'}`}
            whileHover={{ y: -8 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="relative h-full">
              {/* Glow Effect */}
              <motion.div 
                className="absolute -inset-1 bg-gradient-to-r from-emerald-600/20 to-green-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition duration-500"
                animate={{ 
                  scale: [1, 1.02, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              
              <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 h-full">
                {/* Header with Pattern */}
                <div className="relative h-32 bg-gradient-to-r from-emerald-600 to-green-600 overflow-hidden">
                  
                  
                  {/* Floating Icons */}
                  <motion.div 
                    className="absolute top-4 left-4"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  >
                    <Bean className="w-8 h-8 text-white/30" />
                  </motion.div>
                  
                 
                  
                  <div className="absolute inset-0 flex items-center px-8">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                      <Award className="w-6 h-6" />
                      Our Products
                    </h3>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  {/* Category Tags */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {productCategories.map((cat, index) => {
                      const Icon = cat.icon;
                      const bgColor = cat.color === 'emerald' ? 'bg-emerald-100' : 'bg-green-100';
                      const textColor = cat.color === 'emerald' ? 'text-emerald-700' : 'text-green-700';
                      return (
                        <motion.span
                          key={index}
                          whileHover={{ scale: 1.05, y: -2 }}
                          className={`flex items-center gap-2 text-sm text-gray-600 ${bgColor} p-2 rounded-lg`}
                        >
                          <Icon className={`w-4 h-4 ${textColor}`} />
                          {cat.name}
                        </motion.span>
                      );
                    })}
                  </div>

                  {/* Products List */}
                  <div className="space-y-5">
                    {products.length > 0 ? (
                      products.map((item: Product, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={isContentInView ? { opacity: 1, x: 0 } : {}}
                          transition={{ delay: index * 0.1 + 0.3 }}
                          onHoverStart={() => setHoveredProduct(item.id)}
                          onHoverEnd={() => setHoveredProduct(null)}
                          className="group/item"
                        >
                          <div className="flex items-start gap-3">
                            <motion.div 
                              className="flex-shrink-0 w-6 h-6 mt-1"
                              animate={{ 
                                scale: hoveredProduct === item.id ? 1.2 : 1,
                                rotate: hoveredProduct === item.id ? 360 : 0
                              }}
                              transition={{ duration: 0.3 }}
                            >
                              <CheckCircle className="w-5 h-5 text-emerald-500" />
                            </motion.div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800 mb-1 group-hover/item:text-emerald-600 transition">
                                {item.name}
                              </h4>
                              <p className="text-gray-600 text-sm leading-relaxed">
                                {item.description}
                              </p>
                            </div>
                          </div>
                          {index < products.length - 1 && (
                            <div className="ml-8 my-3 border-b border-dashed border-gray-200"></div>
                          )}
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Loading products...
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="mt-8 grid grid-cols-2 gap-3 pt-6 border-t border-gray-100">
                    {[
                      { icon: Leaf, label: "100% Arabica", color: "emerald" },
                      { icon: Shield, label: "Certified Quality", color: "green" },
                    ].map((feature, i) => {
                      const FeatureIcon = feature.icon;
                      const textColor = feature.color === 'emerald' ? 'text-emerald-600' : 'text-green-600';
                      return (
                        <motion.div
                          key={i}
                          className="flex items-center gap-2 text-sm text-gray-600"
                          whileHover={{ x: 3 }}
                        >
                          <FeatureIcon className={`w-4 h-4 ${textColor}`} />
                          <span>{feature.label}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Decorative Corner */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-emerald-400/20 to-transparent rounded-bl-3xl"></div>
              </div>
            </div>
          </motion.div>

          {/* Services Card */}
          <motion.div
            className={`group ${(!isMobile || activeTab === 'services') ? 'block' : 'hidden md:block'}`}
            whileHover={{ y: -8 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="relative h-full">
              {/* Glow Effect */}
              <motion.div 
                className="absolute -inset-1 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition duration-500"
                animate={{ 
                  scale: [1, 1.02, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              
              <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 h-full">
                {/* Header with Pattern */}
                <div className="relative h-32 bg-gradient-to-r from-green-600 to-emerald-600 overflow-hidden">
                  <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  }} />
                  
                  {/* Floating Icons */}
                  <motion.div 
                    className="absolute top-4 right-4"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  >
                    <Users className="w-8 h-8 text-white/30" />
                  </motion.div>
                  
                  
                  
                  <div className="absolute inset-0 flex items-center px-8">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                      <Users className="w-6 h-6" />
                      Our Services
                    </h3>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  {/* Service Features */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {serviceFeatures.map((feature, index) => {
                      const Icon = feature.icon;
                      const bgColor = feature.color === 'emerald' ? 'bg-emerald-50' : 'bg-green-50';
                      const textColor = feature.color === 'emerald' ? 'text-emerald-600' : 'text-green-600';
                      return (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.05, y: -2 }}
                          className={`flex items-center gap-2 text-sm text-gray-600 ${bgColor} p-2 rounded-lg`}
                        >
                          <Icon className={`w-4 h-4 ${textColor}`} />
                          <span>{feature.label}</span>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Services List */}
                  <div className="space-y-5">
                    {services.length > 0 ? (
                      services.map((item: Service, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={isContentInView ? { opacity: 1, x: 0 } : {}}
                          transition={{ delay: index * 0.1 + 0.5 }}
                          className="group/item"
                        >
                          <div className="flex items-start gap-3">
                            <motion.div 
                              className="flex-shrink-0 w-6 h-6 mt-1"
                              whileHover={{ scale: 1.2, rotate: 360 }}
                              transition={{ duration: 0.3 }}
                            >
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            </motion.div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800 mb-1 group-hover/item:text-green-600 transition">
                                {item.title}
                              </h4>
                              <p className="text-gray-600 text-sm leading-relaxed">
                                {item.description}
                              </p>
                            </div>
                          </div>
                          {index < services.length - 1 && (
                            <div className="ml-8 my-3 border-b border-dashed border-gray-200"></div>
                          )}
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Loading services...
                      </div>
                    )}
                  </div>

                  {/* Additional Service Features */}
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <div className=" justify-between flex flex-wrap gap-2">
                      {[
                        "Export Documentation",
                        "Logistics Support",
                        "Market Analysis"
                      ].map((text, i) => (
                        <motion.span
                          key={i}
                          whileHover={{ scale: 1.05, y: -2 }}
                          className="px-3 py-1 bg-gray-50 text-xs text-gray-600  hover:shadow-md transition-all"
                        >
                          {text}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Decorative Corner */}
                <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-bl from-green-400/20 to-transparent rounded-br-3xl"></div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="text-center mt-16 relative"
        >
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-emerald-600/10 to-green-600/10 rounded-full blur-3xl" />
          
          <motion.div
            className="relative inline-block"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
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
          </motion.div>

          <motion.p 
            className="text-gray-500 mt-6 text-sm flex items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Heart className="w-4 h-4 text-emerald-500" />
            Proudly sourcing and exporting Ethiopian coffee to the world
            <Heart className="w-4 h-4 text-green-500" />
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