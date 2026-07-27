'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { 
  User, 
  Award, 
  Briefcase, 
  Coffee, 
  Globe, 
  Heart, 
  Mail, 
  Linkedin, 
  Twitter,
  Quote,
  Sparkles,
  ChevronRight,
  Star,
  MapPin,
  Calendar,
  BookOpen,
  TrendingUp,
  Shield,
  CheckCircle
} from 'lucide-react';

interface ImageItem {
  id: number;
  url: string;
  category: string;
  createdAt: string;
}

const Founder = () => {
  const API = process.env.NEXT_PUBLIC_API_URL;
  const [images, setImages] = useState<ImageItem[]>([]);
  const [activeQuote, setActiveQuote] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const isHeaderInView = useInView(headerRef, { once: true, amount: 0.3 });
  const isImageInView = useInView(imageRef, { once: true, amount: 0.3 });
  const isContentInView = useInView(contentRef, { once: true, amount: 0.3 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const imageParallax = useTransform(scrollYProgress, [0.1, 0.3], ['50px', '0px']);
  const contentParallax = useTransform(scrollYProgress, [0.3, 0.5], ['50px', '0px']);

  const founderData = {
    title: 'Firaol Kebede',
    subtitle:
      'CEO & Founder of Koket, Kofera Coffee Export, Spicy Pulse Export Company, and Fira Link Business Solutions Consulting',
    text:
      'Firaol Kebede is the CEO and founder of Koket – Gifty Import and Export, as well as the owner and visionary behind Kofera Coffee Export and Spicy Pulse Export Company. In addition, he is the founder and owner of Fira Link Business Solutions Consulting, where he provides strategic guidance and business solutions.',
    achievements: [
      'Founded 4 successful companies',
      '5+ years in coffee export industry',
      'Ethiopian Coffee Export Association Member',
      'International Business Consultant'
    ],
    expertise: ['Strategic Planning', 'Export Management', 'Business Development', 'Market Analysis'],
    quote: "Ethiopian coffee isn't just a product it's our heritage, our story, and our gift to the world."
  };

  useEffect(() => {
    if (!API) return;

    const categories = ['founder'];

    const fetchSelectedImages = async () => {
      try {
        const results: ImageItem[] = [];

        for (const cat of categories) {
          const res = await fetch(`${API}/images/latest/${cat}`, { cache: 'no-store' });
          if (res.ok) {
            const data: ImageItem = await res.json();
            results.push(data);
          }
        }

        setImages(results);
      } catch (err) {
        console.error('Failed to load founder image:', err);
        setImages([]);
      }
    };

    fetchSelectedImages();
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


  const quotes = [
    "Ethiopian coffee isn't just a product—it's our heritage.",
    "Quality is never an accident; it is always the result of intention.",
    "Empowering farmers means enriching communities.",
    "Every cup tells a story of Ethiopian tradition.",
  ];

  // Rotate quotes
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveQuote((prev) => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const [particles, setParticles] = useState<
  { id: number; x: number; y: number; size: number; duration: number; delay: number }[]
>([]);


  // Get founder image
  const founderImage = images.find(img => img.category === 'founder');

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
      ref={sectionRef}
      id="founder"
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
          <User className="w-48 h-48 text-green-800" />
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
                <User className="w-8 h-8 text-emerald-600" />
                
                
              </div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-bold text-gray-800 mb-4"
          >
            <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-600 bg-clip-text text-transparent bg-[length:200%] ">
              Founder
            </span>
          </motion.h1>

          {/* Animated Underline */}
          <motion.div 
            className="w-24 h-1 bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-400 mx-auto mb-6 rounded-full"
           
            transition={{ duration: 3, repeat: Infinity }}
          />

          {/* Subtitle with Decorative Elements */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={isHeaderInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="text-gray-600 text-lg max-w-2xl mx-auto relative"
          >
            <motion.span
              className="absolute -left-8 top-1/2 -translate-y-1/2 text-emerald-300"
              animate={{ x: [-5, 0, -5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ✦
            </motion.span>
            The visionary behind Koffera Coffee's journey from Ethiopian highlands to global recognition
            <motion.span
              className="absolute -right-8 top-1/2 -translate-y-1/2 text-green-300"
              animate={{ x: [5, 0, 5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ✦
            </motion.span>
          </motion.p>

          {/* Decorative Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 h-1 bg-emerald-300 rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity }}
              />
            ))}
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row items-stretch gap-12 lg:gap-16">
          {/* Left Column - Image */}
          <motion.div
            ref={imageRef}
            initial={{ opacity: 0, x: -50 }}
            animate={isImageInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="lg:w-1/2 relative"
            style={{ y: imageParallax }}
          >
            <div 
              className="relative h-full"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              {/* Multi-layer Glow Effect */}
              <motion.div 
                className="absolute -inset-6 bg-gradient-to-r from-emerald-600/30 via-green-600/30 to-emerald-600/30 rounded-3xl blur-2xl"
                animate={{ 
                  opacity: isHovering ? 0.6 : 0.3,
                  scale: isHovering ? 1.1 : 1
                }}
                transition={{ duration: 0.4 }}
              />
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-600/20 to-green-600/20 rounded-3xl blur-xl opacity-60" />
              
              <div className="relative overflow-hidden rounded-3xl shadow-2xl h-full">
                {founderImage ? (
                  <motion.img
                    src={founderImage.url}
                    alt={founderData.title}
                    className="w-full h-[600px] object-cover"
                    animate={{ 
                      scale: isHovering ? 1.1 : 1,
                    }}
                    transition={{ duration: 0.6 }}
                  />
                ) : (
                  <div className="w-full h-[600px] bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                    <div className="text-center">
                      <User className="w-24 h-24 text-emerald-400 mx-auto mb-4" />
                      <p className="text-emerald-600 font-medium">Founder Image</p>
                    </div>
                  </div>
                )}
                
                
                
                
              </div>
              
              {/* Decorative Corner Elements */}
              <motion.div 
                className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-emerald-400/50 rounded-tl-3xl"
                animate={{ 
                  opacity: isHovering ? 1 : 0.5,
                  scale: isHovering ? 1.1 : 1
                }}
              />
              <motion.div 
                className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-green-400/50 rounded-br-3xl"
                animate={{ 
                  opacity: isHovering ? 1 : 0.5,
                  scale: isHovering ? 1.1 : 1
                }}
              />
            </div>
          </motion.div>

          {/* Right Column - Content */}
          <motion.div
            ref={contentRef}
            initial={{ opacity: 0, x: 50 }}
            animate={isContentInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:w-1/2 flex flex-col"
            style={{ y: contentParallax }}
          >
            {/* Name & Title */}
            <motion.div 
              className="mb-6"
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3 relative">
                {founderData.title}
               
              </h2>
              
              {/* Company Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { name: 'Koket', icon: Briefcase, color: 'emerald' },
                  { name: 'Kofera', icon: Coffee, color: 'green' },
                  { name: 'Fira Link', icon: TrendingUp, color: 'green' },
                ].map((company, idx) => {
                  const Icon = company.icon;
                  const bgColor = getColorClasses(company.color, 'bg');
                  const textColor = getColorClasses(company.color, 'text');
                  
                  return (
                    <motion.span
                      key={idx}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className={`px-3 py-1.5 ${bgColor} ${textColor} rounded-full text-sm font-medium flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all`}
                    >
                      <Icon className="w-3 h-3" />
                      {company.name}
                    </motion.span>
                  );
                })}
              </div>

              <motion.h3 
                className="text-xl text-gray-600 leading-relaxed relative pl-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <span className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-emerald-400 to-green-400 rounded-full" />
                {founderData.subtitle}
              </motion.h3>
            </motion.div>

            {/* Quote Rotator */}
            <motion.div 
              key={activeQuote}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative mb-8 group"
              whileHover={{ scale: 1.02 }}
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition" />
              <div className="relative bg-gradient-to-br from-emerald-50 to-green-50 p-8 rounded-2xl overflow-hidden">
                <Quote className="absolute top-4 left-4 w-10 h-10 text-emerald-200/50" />
                <Quote className="absolute bottom-4 right-4 w-10 h-10 text-green-200/50 rotate-180" />
                
                <p className="text-gray-700 text-lg italic relative z-10 pl-8 pr-8">
                  "{quotes[activeQuote]}"
                </p>
                
                {/* Quote Navigation Dots */}
                <div className="flex justify-center gap-2 mt-4">
                  {quotes.map((_, i) => (
                    <motion.button
                      key={i}
                      onClick={() => setActiveQuote(i)}
                      className={`rounded-full transition-all ${
                        i === activeQuote 
                          ? 'bg-gradient-to-r from-emerald-500 to-green-500 w-8 h-2' 
                          : 'bg-gray-300 w-2 h-2 hover:bg-gray-400'
                      }`}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Description */}
            <motion.div 
              className="relative mb-8"
              whileHover={{ x: 3 }}
            >
              <p className="text-gray-700 text-lg leading-relaxed">
                {founderData.text}
              </p>
              
              {/* Decorative Highlight */}
              <motion.div 
                className="absolute -left-2 top-0 w-1 h-0 bg-gradient-to-b from-emerald-400 to-green-400 rounded-full"
                animate={{ height: ["100%", "100%", "100%"] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </motion.div>

            

  

            {/* Enhanced Bottom Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              viewport={{ once: true }}
              className="mt-6 max-w-3xl"
            >
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600/20 to-green-600/20 rounded-3xl blur-xl" />
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/50">
                  <div className="grid grid-cols-2 gap-8">
                    {[
                      { number: '4', label: 'Companies Founded', icon: Briefcase, color: 'emerald' },
                      { number: '5+', label: 'Years Experience', icon: Award, color: 'green' },
                    ].map((stat, index) => {
                      const Icon = stat.icon;
                      const bgColor = getColorClasses(stat.color, 'bg');
                      const textColor = getColorClasses(stat.color, 'text');
                      const progressColor = stat.color === 'emerald' ? 'bg-emerald-500' : 'bg-green-500';
                      
                      return (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          className="text-center group"
                        >
                          <div className="flex justify-center mb-3">
                            <motion.div 
                              className={`p-3 ${bgColor} rounded-xl group-hover:shadow-lg transition-all`}
                              animate={{ 
                                y: [0, -5, 0],
                              }}
                              transition={{ 
                                duration: 2,
                                delay: index * 0.5,
                                repeat: Infinity 
                              }}
                            >
                              <Icon className={`w-6 h-6 ${textColor}`} />
                            </motion.div>
                          </div>
                          <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-1">
                            {stat.number}
                          </div>
                          <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                          
                          {/* Progress Bar */}
                          <motion.div 
                            className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden"
                            initial={{ width: 0 }}
                            whileInView={{ width: '100%' }}
                            transition={{ delay: 1 + index * 0.2, duration: 1 }}
                          >
                            <div className={`h-full ${progressColor} rounded-full`} style={{ width: '100%' }} />
                          </motion.div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>

           
          </motion.div>
        </div>

        {/* If no image, show fallback */}
        {images.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full blur-xl opacity-50" />
              <div className="relative bg-white p-6 rounded-full shadow-xl mb-4">
                <User className="w-16 h-16 text-emerald-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Firaol Kebede</h3>
            <p className="text-gray-600">Visionary Leader & Entrepreneur</p>
            
            {/* Placeholder Stats */}
            <div className="flex justify-center gap-8 mt-8">
              <div>
                <div className="text-2xl font-bold text-emerald-600">4</div>
                <div className="text-sm text-gray-500">Companies</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">5+</div>
                <div className="text-sm text-gray-500">Years</div>
              </div>
            </div>
          </motion.div>
        )}
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

export default Founder;