'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { 
  Leaf, 
  Target, 
  Heart, 
  Shield, 
  Users, 
  Award,
  Coffee,
  Sparkles,
  Globe,
  ChevronRight,
  Star,
  Droplets,
  Sun,
  MapPin,
  Quote,
  Eye,
  Compass,
  Gem,
  TrendingUp,
  BookOpen,
  Wind,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import AboutUsHeroVideo from './video';

interface ImageItem {
  id: number;
  url: string;
  category: string;
  createdAt: string;
}

const values = [
  { 
    title: 'Quality', 
    desc: 'Delivering Ethiopian coffee that reflects exceptional craftsmanship and rich flavor.',
    icon: Award,
    color: 'from-emerald-500 to-green-600',
    pattern: '✨',
    lightColor: 'emerald'
  },
  { 
    title: 'Sustainability', 
    desc: 'Promoting environmentally responsible practices from farm to export.',
    icon: Leaf,
    color: 'from-green-500 to-emerald-600',
    pattern: '🌱',
    lightColor: 'green'
  },
  { 
    title: 'Integrity', 
    desc: 'Upholding transparency, ethical trade, and trust in every partnership.',
    icon: Shield,
    color: 'from-emerald-600 to-green-600',
    pattern: '🤝',
    lightColor: 'emerald'
  },
  { 
    title: 'Empowerment', 
    desc: 'Supporting local farmers and communities to grow economically and socially.',
    icon: Users,
    color: 'from-green-600 to-emerald-500',
    pattern: '⚡',
    lightColor: 'green'
  },
  { 
    title: 'Innovation', 
    desc: 'Embracing modern processes and global trends while honoring tradition.',
    icon: Sparkles,
    color: 'from-emerald-500 to-green-500',
    pattern: '💡',
    lightColor: 'emerald'
  },
  { 
    title: 'Cultural Pride', 
    desc: 'Showcasing Ethiopia\'s coffee heritage to inspire global appreciation.',
    icon: Coffee,
    color: 'from-green-600 to-emerald-500',
    pattern: '🎭',
    lightColor: 'green'
  },
];

const categories = ['vision', 'mission'];

const AboutUs = () => {
  const API = process.env.NEXT_PUBLIC_API_URL;
  const [images, setImages] = useState<ImageItem[]>([]);
  const [cacheBuster, setCacheBuster] = useState('');
  const [activeValue, setActiveValue] = useState<number | null>(null);
  const [activeVisionFeature, setActiveVisionFeature] = useState(0);
    const headerRef = useRef<HTMLDivElement>(null);
  
    const isHeaderInView = useInView(headerRef, { once: true, amount: 0.3 });

  const sectionRef = useRef<HTMLElement>(null);
  const visionRef = useRef<HTMLDivElement>(null);
  const missionRef = useRef<HTMLDivElement>(null);
  const valuesRef = useRef<HTMLDivElement>(null);
  
  const isVisionInView = useInView(visionRef, { once: true, amount: 0.3 });
  const isMissionInView = useInView(missionRef, { once: true, amount: 0.3 });
  const isValuesInView = useInView(valuesRef, { once: true, amount: 0.1 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const imageParallax = useTransform(scrollYProgress, [0.1, 0.3], ['50px', '0px']);
  const contentParallax = useTransform(scrollYProgress, [0.3, 0.5], ['50px', '0px']);

  useEffect(() => {
    if (!API) return;

    const fetchSelectedImages = async () => {
      try {
        const results: ImageItem[] = [];

        for (const cat of categories) {
          const res = await fetch(`${API}/images/latest/${cat}`, {
            cache: 'no-store',
          });

          if (res.ok) {
            const data = await res.json();
            results.push(data);
          }
        }

        setImages(results);
      } catch (err) {
        console.error('Failed to load About images:', err);
        setImages([]);
      }
    };

    fetchSelectedImages();
    setCacheBuster(`?t=${Date.now()}`);
  }, [API]);
  useEffect(() => {
  const generated = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 8 + 2,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  setParticles(generated);
}, []);


  const visionImage = images.find(img => img.category === 'vision');
  const missionImage = images.find(img => img.category === 'mission');

  const vision = {
    title: 'Our Vision',
    desc: 'To be a globally recognized leader in the export of premium Ethiopian coffee, celebrated for our commitment to quality, sustainability, and equitable partnerships. We envision a world where the rich flavors of Ethiopian coffee inspire deeper appreciation for our culture, empower our farmers, and connect communities across continents through every cup.',
    fallback: '/cof1.jpg',
    features: ['Global Recognition', 'Sustainable Growth', 'Cultural Connection']
  };

  const mission = {
    title: 'Our Mission',
    desc: 'At Koffera Coffee, our mission is to share Ethiopia\'s rich coffee heritage with the world by exporting ethically sourced, high-quality Arabica beans. We are committed to empowering local farmers, preserving environmental sustainability, and delivering traceable coffee that reflects the unique flavors of Ethiopia\'s renowned growing regions. Through integrity, excellence, and innovation, we aim to build lasting partnerships and elevate the global appreciation of Ethiopian coffee.',
    fallback: '/buna1.jpg',
    stats: [
      { label: 'Farmers Empowered', value: '1000+' },
      { label: 'Growing Regions', value: '5' },
      { label: 'Quality Rating', value: 'A+' }
    ]
  };

  // Floating particles animation
  const [particles, setParticles] = useState<
  { id: number; x: number; y: number; size: number; duration: number; delay: number }[]
>([]);


  // Rotate vision features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveVisionFeature((prev) => (prev + 1) % vision.features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section 
      id="about" 
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
              x: [0, 40, -40, 0],
              y: [0, -40, 40, 0],
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
          className="absolute top-40 left-20 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-20"
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 15, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-40 right-20 w-96 h-96 bg-green-100 rounded-full blur-3xl opacity-20"
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 18, repeat: Infinity }}
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
          {/* Animated Icon */}
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
                <Coffee className="w-8 h-8 text-emerald-600" />
                
               
              </div>
            </div>
          </motion.div>

          {/* Title with Gradient */}
          <motion.h1 
            className="text-5xl md:text-6xl font-bold text-gray-800 mb-4 relative"
            animate={{ textShadow: ["0 0 0 rgba(16,185,129,0)", "0 0 20px rgba(16,185,129,0.2)", "0 0 0 rgba(16,185,129,0)"] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            About{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-600 bg-clip-text text-transparent bg-[length:200%] ">
              Koffera
            </span>
          </motion.h1>

          {/* Animated Underline */}
          <motion.div 
            className="w-32 h-1 bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-400 mx-auto rounded-full mb-6"
           
            transition={{ duration: 3, repeat: Infinity }}
          />

          {/* Subtitle with Decorative Elements */}
          <motion.p 
            className="text-gray-600 mt-6 max-w-2xl mx-auto text-lg font-light relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.span
              className="absolute -left-8 top-1/2 -translate-y-1/2 text-emerald-300"
              animate={{ x: [-5, 0, -5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ✦
            </motion.span>
            Crafting excellence from the birthplace of coffee
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

        {/* Vision Section */}
        <motion.div
          ref={visionRef}
          className="relative mb-32"
          initial={{ opacity: 0 }}
          animate={isVisionInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Image Container */}
            <motion.div
              className="w-full lg:w-1/2 relative group"
              style={{ y: imageParallax }}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <AboutUsHeroVideo/>
              
            </motion.div>

            {/* Content */}
            <motion.div
              className="lg:w-1/2 space-y-6"
              style={{ y: contentParallax }}
              initial={{ x: 50, opacity: 0 }}
              animate={isVisionInView ? { x: 0, opacity: 1 } : {}}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="flex items-center gap-4 mb-4">
                <motion.div 
                  className="p-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg relative group"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Target className="w-8 h-8 text-white" />
                 
                </motion.div>
                <div>
                  <motion.span 
                    className="text-sm font-semibold text-emerald-600 uppercase tracking-wider"
                    animate={{ letterSpacing: ["0.05em", "0.1em", "0.05em"] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    Looking Ahead
                  </motion.span>
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-800 flex items-center gap-2">
                    {vision.title}
                  </h2>
                </div>
              </div>
              
              <motion.p 
                className="text-gray-700 text-lg leading-relaxed"
                initial={{ opacity: 0 }}
                animate={isVisionInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.4 }}
              >
                {vision.desc}
              </motion.p>

              {/* Stats Line with Icons */}
              <motion.div 
                className="flex gap-8 pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={isVisionInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5 }}
              >
                {[
                  { text: 'Excellence', icon: Gem },
                  { text: 'Innovation', icon: Zap },
                  { text: 'Impact', icon: TrendingUp }
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <div className="p-1.5 bg-emerald-100 rounded-lg">
                        <Icon className="w-3 h-3 text-emerald-600" />
                      </div>
                      <span className="text-sm text-gray-600">{item.text}</span>
                    </div>
                  );
                })}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Mission Section */}
        <motion.div
          ref={missionRef}
          className="relative mb-32"
          initial={{ opacity: 0 }}
          animate={isMissionInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-16">
            {/* Image Container */}
            <motion.div
              className="w-full lg:w-1/2 relative group"
              style={{ y: imageParallax }}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                className="absolute -inset-6 bg-gradient-to-l from-emerald-600/10 via-green-600/10 to-emerald-600/10 rounded-3xl blur-2xl"
                animate={{ 
                  opacity: [0.3, 0.5, 0.3],
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <div className="absolute -inset-4 bg-gradient-to-l from-emerald-600/10 to-green-600/10 rounded-3xl blur-xl opacity-60" />
              
              <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                <motion.img
                  src={`${missionImage?.url ?? mission.fallback}${cacheBuster}`}
                  alt="Mission"
                  className="w-full h-[500px] object-cover"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                  
                </div>
                
                {/* Company Logo and Name - Now at the bottom */}
          <motion.div 
            className="absolute bottom-6 left-6 right-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-5 shadow-xl">
              <div className="flex items-center gap-4">
                {/* Logo Placeholder - Replace with your actual logo */}
                <div className="w-16 h-16 b-white  rounded-2xl flex items-center justify-center shadow-lg">
                  <img src="/hero-logo.png"/>
                </div>
                
                {/* Company Name and Tagline */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800 mb-1">Koffera Coffee</h3>
                  <p className="text-sm text-emerald-600 font-medium">Ethiopian Coffee Export</p>
                  
                  {/* Optional: Add a decorative line */}
                  <div className="w-12 h-0.5 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full mt-2"></div>
                </div>
              </div>
            </div>
          </motion.div>

                {/* Decorative Corner Elements */}
                <motion.div 
                  className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-green-400/50 rounded-tr-3xl"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div 
                  className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-emerald-400/50 rounded-bl-3xl"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                />
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              className="lg:w-1/2 space-y-6"
              style={{ y: contentParallax }}
              initial={{ x: -50, opacity: 0 }}
              animate={isMissionInView ? { x: 0, opacity: 1 } : {}}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="flex items-center gap-4 mb-4">
                <motion.div 
                  className="p-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg relative group"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Globe className="w-8 h-8 text-white" />
                  
                </motion.div>
                <div>
                  <motion.span 
                    className="text-sm font-semibold text-green-600 uppercase tracking-wider"
                    animate={{ letterSpacing: ["0.05em", "0.1em", "0.05em"] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    Our Purpose
                  </motion.span>
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-800 flex items-center gap-2">
                    {mission.title}
                  </h2>
                </div>
              </div>
              
              <motion.p 
                className="text-gray-700 text-lg leading-relaxed"
                initial={{ opacity: 0 }}
                animate={isMissionInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.4 }}
              >
                {mission.desc}
              </motion.p>
            </motion.div>
          </div>
        </motion.div>

        {/* Values Section */}
        <motion.div
          ref={valuesRef}
          className="relative max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={isValuesInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          {/* Section Header */}
          <div className="text-center mb-16 relative">
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-emerald-200/30 to-green-200/30 rounded-full blur-3xl"
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            
           
            <motion.h2 
              className="text-5xl md:text-6xl font-bold text-gray-800 mb-4"
              initial={{ scale: 0.9 }}
              animate={isValuesInView ? { scale: 1 } : {}}
              transition={{ type: "spring" }}
            >
              Our Core{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-600 bg-clip-text text-transparent bg-[length:200%] animate-gradient">
                Values
              </span>
            </motion.h2>
            
            <motion.p 
              className="text-gray-600 max-w-2xl mx-auto text-lg relative"
              initial={{ opacity: 0 }}
              animate={isValuesInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.2 }}
            >
              <Quote className="absolute -left-8 top-0 w-4 h-4 text-emerald-300 rotate-180" />
              The principles that guide our journey from Ethiopian highlands to cups worldwide
              <Quote className="absolute -right-8 bottom-0 w-4 h-4 text-green-300" />
            </motion.p>
          </div>

          {/* Values Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 ">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  className="group relative"
                  initial={{ opacity: 0, y: 30 }}
                  animate={isValuesInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  onHoverStart={() => setActiveValue(index)}
                  onHoverEnd={() => setActiveValue(null)}
                >
                  {/* Animated Background */}
                  <motion.div 
                    className="absolute -inset-0.5 bg-gradient-to-r from-emerald-200/30 to-green-200/30 rounded-2xl blur"
                    animate={{ 
                      opacity: activeValue === index ? 0.5 : 0,
                      scale: activeValue === index ? 1.05 : 1
                    }}
                    transition={{ duration: 0.3 }}
                  />
                  
                  {/* Main Card */}
                  <motion.div 
                    className="relative  p-8  overflow-hidden"
                    whileHover={{ y: -8 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    
                    {/* Icon with Animation */}
                    <motion.div 
                      className={`inline-flex p-5 bg-gradient-to-r ${value.color} rounded-2xl mb-6 shadow-lg relative z-10`}
                      transition={{ duration: 0.6 }}
                    >
                      <Icon className="w-8 h-8 text-white" />
                      
                    
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-emerald-600 transition flex items-center gap-2">
                      {value.title}
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: activeValue === index ? 1 : 0, x: 0 }}
                      >
                        ✦
                      </motion.span>
                    </h3>
                    
                    <p className="text-gray-600 leading-relaxed relative z-10">
                      {value.desc}
                    </p>

                    {/* Animated Border */}
                    <motion.div 
                      className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-emerald-600 to-green-600"
                      initial={{ width: 0 }}
                      whileHover={{ width: '100%' }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>
                </motion.div>
                
                
              );
            })}
          </div>
          <Link className='text-center flex-col mt-12 text-sm flex items-center justify-center gap-2 text-gray-600' href="/contact">
          <motion.button
            className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center gap-2 group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Start Your Partnership</span>
            <TrendingUp className="w-4 h-4 group-hover:translate-x-1 transition" />
          </motion.button></Link>

          
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
};

export default AboutUs;