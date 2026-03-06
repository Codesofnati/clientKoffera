"use client";

import React, { useState, useEffect, JSX, useRef } from "react";
import { motion, useInView } from "framer-motion";
import emailjs from '@emailjs/browser';
import {
  FaFacebookF,
  FaTelegramPlane,
  FaYoutube,
  FaTiktok,
  FaWhatsapp,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
} from "react-icons/fa";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  Sparkles,
  Heart,
  Globe,
  CheckCircle,
  AlertCircle
} from "lucide-react";

// Social Links Interface
interface SocialLink {
  id: number;
  platform: string;
  url: string;
  icon: string;
}

// Icon mapper with expanded options
const iconMap: Record<string, JSX.Element> = {
  facebook: <FaFacebookF className="text-xl" />,
  instagram: <FaInstagram className="text-xl" />,
  telegram: <FaTelegramPlane className="text-xl" />,
  youtube: <FaYoutube className="text-xl" />,
  tiktok: <FaTiktok className="text-xl" />,
  whatsapp: <FaWhatsapp className="text-xl" />,
  twitter: <FaTwitter className="text-xl" />,
  linkedin: <FaLinkedinIn className="text-xl" />,
};

// Helper function for color classes
const getColorClasses = (color: string, type: 'bg' | 'text' | 'border' | 'from' | 'to' | 'hover') => {
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
    case 'hover':
      return isEmerald ? 'hover:bg-emerald-50' : 'hover:bg-green-50';
    default:
      return '';
  }
};

export default function ContactUs() {
  const API = process.env.NEXT_PUBLIC_API_URL!;
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  
  const formRef = useRef<HTMLFormElement>(null);
  const sectionRef = React.useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  // EmailJS configuration
  const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!;
  const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!;
  const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!;

  useEffect(() => {
    const fetchSocialLinks = async () => {
      try {
        const res = await fetch(`${API}/social`, { cache: "no-store" });
        if (!res.ok) {
          console.error("Failed to fetch social links");
          return;
        }
        const data: SocialLink[] = await res.json();
        setLinks(data);
      } catch (err) {
        console.error("Error fetching social links:", err);
        setLinks([]);
      }
    };

    fetchSocialLinks();
  }, [API]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      setSubmitStatus({
        type: 'error',
        message: 'Please fill in all fields'
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      // IMPORTANT: These variable names must match your EmailJS template
      const templateParams = {
        from_name: formData.name,      // This will be available as {{from_name}} in template
        from_email: formData.email,    // This will be available as {{from_email}} in template
        message: formData.message,      // This will be available as {{message}} in template
        to_name: 'Koffera Team',
        reply_to: formData.email,
      };

      console.log('Sending email with params:', templateParams); // For debugging

      const result = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      if (result.status === 200) {
        setSubmitStatus({
          type: 'success',
          message: 'Message sent successfully! We\'ll get back to you soon.'
        });
        setFormData({ name: '', email: '', message: '' }); // Clear form
      }
    } catch (error) {
      console.error('EmailJS error:', error);
      setSubmitStatus({
        type: 'error',
        message: 'Failed to send message. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
      
      // Auto-hide success/error message after 5 seconds
      setTimeout(() => {
        setSubmitStatus({ type: null, message: '' });
      }, 5000);
    }
  };

  // Contact info items
  const contactInfo = [
    { icon: Mail, label: 'Email', value: 'firaolkebede777@gmail.com', color: 'emerald' },
    { icon: Phone, label: 'Phone', value: '+251 920318757', color: 'green' },
    { icon: MapPin, label: 'Address', value: 'Addis Ababa, Ethiopia', color: 'emerald' },
  ];

  // Particles for background
  const [particles, setParticles] = useState<
    { id: number; x: number; y: number; size: number; duration: number; delay: number }[]
  >([]);

  useEffect(() => {
    const generated = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 2,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 5,
    }));
    setParticles(generated);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="contact"
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
          className="absolute top-20 right-20 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-20"
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, -30, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 15, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-20 left-20 w-96 h-96 bg-green-100 rounded-full blur-3xl opacity-20"
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, 30, 0],
            y: [0, 20, 0]
          }}
          transition={{ duration: 18, repeat: Infinity }}
        />
        
        <div className="absolute top-40 right-1/4 opacity-[0.03] rotate-12">
          <Mail className="w-48 h-48 text-green-800" />
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          {/* Icon Badge */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={isInView ? { scale: 1, rotate: 0 } : {}}
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
                <Mail className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-bold text-gray-800 mb-4"
          >
            <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-600 bg-clip-text text-transparent bg-[length:200%]">
              Get in Touch
            </span>
          </motion.h1>

          {/* Animated Underline */}
          <motion.div 
            className="w-24 h-1 bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-400 mx-auto mb-6 rounded-full"
            animate={{ 
              scaleX: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
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
            Connect with us on your favorite platforms and be part of our coffee journey
            <motion.span
              className="absolute -right-8 top-1/2 -translate-y-1/2 text-green-300"
              animate={{ x: [5, 0, 5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ✦
            </motion.span>
          </motion.p>
        </motion.div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {contactInfo.map((item, index) => {
            const Icon = item.icon;
            const bgColor = getColorClasses(item.color, 'bg');
            const textColor = getColorClasses(item.color, 'text');
            const borderColor = getColorClasses(item.color, 'border');
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className={`relative group cursor-pointer`}
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition" />
                <div className={`relative bg-white rounded-2xl shadow-xl p-6 border ${borderColor} group-hover:border-emerald-300 transition-all`}>
                  <div className="flex items-center gap-4">
                    <motion.div 
                      className={`p-3 ${bgColor} rounded-xl`}
                      animate={{ 
                        scale: [1, 1.1, 1],
                      }}
                      transition={{ 
                        duration: 2,
                        delay: index * 0.3,
                        repeat: Infinity 
                      }}
                    >
                      <Icon className={`w-6 h-6 ${textColor}`} />
                    </motion.div>
                    <div>
                      <p className="text-sm text-gray-500">{item.label}</p>
                      <p className="text-gray-800 font-semibold">{item.value}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Social Grid - Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5 }}
          className="relative"
        >
          {/* Section Label */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-emerald-300" />
            <span className="flex items-center gap-2 text-emerald-600 font-semibold">
              <Sparkles className="w-4 h-4" />
              FOLLOW OUR JOURNEY
              <Sparkles className="w-4 h-4" />
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-green-300" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
            {links.map((item, index) => (
              <motion.a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative group"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.6 + index * 0.1 }}
                onHoverStart={() => setHoveredId(item.id)}
                onHoverEnd={() => setHoveredId(null)}
                whileHover={{ y: -8 }}
              >
                {/* Glow Effect */}
                <motion.div 
                  className="absolute -inset-2 bg-gradient-to-r from-emerald-400 to-green-400 rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity"
                  animate={hoveredId === item.id ? { scale: 1.1 } : { scale: 1 }}
                />
                
                {/* Card */}
                <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden">
                  {/* Top Gradient Bar */}
                  <motion.div 
                    className="h-1 bg-gradient-to-r from-emerald-500 to-green-500"
                    initial={{ width: "0%" }}
                    whileInView={{ width: "100%" }}
                    transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                  />
                  
                  <div className="p-8 flex flex-col items-center">
                    {/* Icon Container */}
                    <motion.div 
                      className={`mb-4 p-4 rounded-xl transition-all duration-300 ${
                        hoveredId === item.id 
                          ? 'bg-gradient-to-br from-emerald-50 to-green-50 scale-110' 
                          : 'bg-gray-50'
                      }`}
                      animate={{ 
                        rotate: hoveredId === item.id ? [0, 5, -5, 0] : 0,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className={`transition-colors duration-300 ${
                        hoveredId === item.id ? 'text-emerald-600' : 'text-gray-600'
                      }`}>
                        {iconMap[item.icon] ?? <span className="text-xl">?</span>}
                      </div>
                    </motion.div>
                    
                    {/* Platform Name */}
                    <h3 className={`font-semibold text-lg capitalize mb-2 transition-colors duration-300 ${
                      hoveredId === item.id ? 'text-emerald-600' : 'text-gray-800'
                    }`}>
                      {item.platform}
                    </h3>
                    
                    {/* Follow Button */}
                    <motion.div 
                      className={`text-xs font-medium px-3 py-1 rounded-full transition-all duration-300 ${
                        hoveredId === item.id 
                          ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white' 
                          : 'bg-gray-100 text-gray-600'
                      }`}
                      animate={{ scale: hoveredId === item.id ? 1.05 : 1 }}
                    >
                      {hoveredId === item.id ? 'Follow Now →' : 'Connect'}
                    </motion.div>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Quick Contact Form with EmailJS Integration */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
          className="mt-20 max-w-3xl mx-auto"
        >
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600/20 to-green-600/20 rounded-3xl blur-xl" />
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 md:p-10 border border-white/50">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Send us a message</h3>
                <p className="text-gray-600">We'd love to hear from you</p>
              </div>
              
              {/* Status Message */}
              {submitStatus.type && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                    submitStatus.type === 'success' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {submitStatus.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  )}
                  <p className="text-sm">{submitStatus.message}</p>
                </motion.div>
              )}

              <form ref={formRef} onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your Name"
                    disabled={isSubmitting}
                    className="px-4 py-3 text-black rounded-xl border border-gray-200 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Your Email"
                    disabled={isSubmitting}
                    className="px-4 py-3 text-black rounded-xl border border-gray-200 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                  />
                </div>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Your Message"
                  rows={4}
                  disabled={isSubmitting}
                  className="w-full px-4 text-black py-3 rounded-xl border border-gray-200 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200 outline-none transition-all mb-4 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                />
                
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                  whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                  className={`w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group ${
                    isSubmitting 
                      ? 'opacity-70 cursor-not-allowed' 
                      : 'hover:shadow-xl'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      Send Message
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </div>
        </motion.div>

        {/* Footer Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1 }}
          className="text-center mt-16"
        >
          <motion.p 
            className="text-emerald-600 text-sm flex items-center justify-center gap-2"
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <Heart className="w-4 h-4 fill-current" />
            Let's brew strong connections — one message at a time.
            <Heart className="w-4 h-4 fill-current" />
          </motion.p>
          
          {/* Coffee Cup Animation */}
          <motion.div 
            className="mt-4 text-4xl"
            animate={{ 
              rotate: [0, 5, -5, 0],
              y: [0, -3, 3, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            ☕
          </motion.div>
        </motion.div>

        {/* Show fallback if no links */}
        {links.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full blur-xl opacity-50" />
              <div className="relative bg-white p-6 rounded-full shadow-xl mb-4">
                <Globe className="w-16 h-16 text-emerald-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Connect With Us</h3>
            <p className="text-gray-600">Follow us on social media for updates</p>
            
            <div className="flex justify-center gap-4 mt-6">
              {['facebook', 'instagram', 'telegram'].map((platform, i) => (
                <div key={i} className="p-3 bg-gray-100 rounded-full text-gray-400">
                  {iconMap[platform]}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}