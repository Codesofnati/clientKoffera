'use client';

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaVolumeMute, FaVolumeUp, FaPlay, FaPause, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Coffee, Leaf, Award, Heart, Droplet } from "lucide-react";
import Link from "next/link";

type Slide =
  | { type: "video"; src: string }
  | { type: "image"; src: string };

export default function Hero() {
  const API = process.env.NEXT_PUBLIC_API_URL;

  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [loading, setLoading] = useState(true);
  const [videoFailed, setVideoFailed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showText, setShowText] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isVideoEnded, setIsVideoEnded] = useState(false);
  
  // State for hero images from database
  const [heroFirstImage, setHeroFirstImage] = useState<string>('/buna2.jpg');

  const videoRef = useRef<HTMLVideoElement>(null);
  const fadeTimeout = useRef<NodeJS.Timeout | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const slideTimeout = useRef<NodeJS.Timeout | null>(null);
const [floatingBeans, setFloatingBeans] = useState<
  { left: string; top: string }[]
>([]);

useEffect(() => {
  const beans = Array.from({ length: 6 }).map(() => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
  }));
  setFloatingBeans(beans);
}, []);
  /* --------------------------------------------------
     FETCH HERO IMAGES FROM DATABASE
  -------------------------------------------------- */
  useEffect(() => {
    async function fetchHeroImages() {
      try {
        const res1 = await fetch(`${API}/images/latest/heroImages/heroFirstImage`, {
          cache: "no-store",
        });

        if (res1.ok) {
          const data1 = await res1.json();
          if (data1?.url) {
            setHeroFirstImage(data1.url);
          }
        }

       

        
      } catch (err) {
        console.warn("Hero images unavailable, using default fallbacks");
      }
    }

    fetchHeroImages();
  }, [API]);

  /* --------------------------------------------------
     LOAD HERO SLIDES
  -------------------------------------------------- */
  useEffect(() => {
    async function loadHero() {
      // ✅ FIX: Only include images that exist
      const imageSlides: Slide[] = [];
      
      // Add heroFirstImage if it exists (always true as it has fallback)
      if (heroFirstImage) {
        imageSlides.push({ type: "image", src: heroFirstImage });
      }
      
     
      try {
        const res = await fetch(`${API}/videos/latest`, {
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Video fetch failed");
        const data = await res.json();
        if (!data?.url) throw new Error("No video URL");

        // If video exists, add it at the beginning
        setSlides([{ type: "video", src: `${data.url}?t=${Date.now()}` }, ...imageSlides]);
      } catch (err) {
        console.warn("Video unavailable, using images only");
        setVideoFailed(true);
        // ✅ FIX: Only use the actual images we have, no hardcoded third image
        setSlides(imageSlides);
        setCurrentIndex(0);
      } finally {
        setLoading(false);
        setTimeout(() => setShowText(true), 300);
      }
    }

    // Only load when we have at least the fallback images
    if (heroFirstImage ) {
      loadHero();
    }
  }, [API, heroFirstImage]);

  /* --------------------------------------------------
     CLEAR ALL TIMEOUTS/INTERVALS
  -------------------------------------------------- */
  const clearAllTimers = () => {
    if (fadeTimeout.current) {
      clearTimeout(fadeTimeout.current);
      fadeTimeout.current = null;
    }
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
    if (slideTimeout.current) {
      clearTimeout(slideTimeout.current);
      slideTimeout.current = null;
    }
  };

  /* --------------------------------------------------
     HANDLE SLIDE TRANSITIONS
  -------------------------------------------------- */
  const goToNextSlide = () => {
    setFade(false);
    setProgress(0);
    
    fadeTimeout.current = setTimeout(() => {
      const nextIndex = (currentIndex + 1) % slides.length;
      setCurrentIndex(nextIndex);
      setFade(true);
      setIsVideoEnded(false);
      
      if (slides[nextIndex].type === "video") {
        setIsPlaying(true);
      }
    }, 500);
  };

  /* --------------------------------------------------
     PROGRESS BAR & AUTO-SLIDE LOGIC
  -------------------------------------------------- */
  useEffect(() => {
    if (!slides.length) return;
    
    clearAllTimers();
    setProgress(0);

    const currentSlide = slides[currentIndex];
    
    if (currentSlide.type === "video") {
      if (videoRef.current && !isVideoEnded) {
        return;
      }
    } else {
      const imageDuration = 10000; // 10 seconds
      
      let startTime = Date.now();
      progressInterval.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const percentage = Math.min((elapsed / imageDuration) * 100, 100);
        setProgress(percentage);
        
        if (percentage >= 100) {
          clearInterval(progressInterval.current!);
          goToNextSlide();
        }
      }, 100);

      slideTimeout.current = setTimeout(() => {
        goToNextSlide();
      }, imageDuration);
    }

    return () => {
      clearAllTimers();
    };
  }, [currentIndex, slides.length, isVideoEnded]);

  /* --------------------------------------------------
     VIDEO HANDLERS
  -------------------------------------------------- */
  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const togglePlay = () => {
    if (!videoRef.current || slides[currentIndex].type !== "video") return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleCanPlay = () => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.0;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleVideoEnd = () => {
    setIsVideoEnded(true);
    setProgress(100);
    
    setTimeout(() => {
      goToNextSlide();
    }, 500);
  };

  const handleVideoTimeUpdate = () => {
    if (!videoRef.current || slides[currentIndex].type !== "video") return;
    
    const video = videoRef.current;
    const percentage = (video.currentTime / video.duration) * 100;
    setProgress(percentage);
  };

  const handleVideoError = () => {
    console.warn("Video playback error, switching to images");
    setVideoFailed(true);
    setSlides(prev => prev.filter(s => s.type === "image"));
    setCurrentIndex(0);
    setIsVideoEnded(false);
  };

  const nextSlide = () => {
    clearAllTimers();
    goToNextSlide();
  };

  const prevSlide = () => {
    clearAllTimers();
    setFade(false);
    setProgress(0);
    
    fadeTimeout.current = setTimeout(() => {
      const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
      setCurrentIndex(prevIndex);
      setFade(true);
      setIsVideoEnded(false);
      setIsPlaying(prevIndex === 0);
    }, 500);
  };

  const goToSlide = (index: number) => {
    clearAllTimers();
    setFade(false);
    setProgress(0);
    
    fadeTimeout.current = setTimeout(() => {
      setCurrentIndex(index);
      setFade(true);
      setIsVideoEnded(false);
      setIsPlaying(slides[index].type === "video");
    }, 500);
  };

  /* --------------------------------------------------
     SIMPLIFIED LOADING UI - Only hero content
  -------------------------------------------------- */
  if (loading) {
    return (
      <section className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-emerald-950 to-green-950">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffffff'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z'/%3E%3C/svg%3E\")",
            backgroundRepeat: "repeat",
            backgroundSize: "60px",
          }} />
        </div>

        {/* Animated coffee beans */}
        <div className="absolute inset-0 overflow-hidden">
          {floatingBeans.map((bean, i) => (
  <motion.div
    key={i}
    className="absolute"
    style={{
      left: bean.left,
      top: bean.top,
    }}
              animate={{ 
                y: [0, -30, 0],
                rotate: [0, 180, 360],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                delay: i * 1
              }}
            >
              <Coffee className="text-emerald-200/20" size={40 + i * 10} />
            </motion.div>
          ))}
        </div>

        {/* Centered Loading Content */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center max-w-2xl px-4">
            {/* Animated Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <div className="relative w-32 h-32 mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full blur-xl opacity-50 animate-pulse" />
                <div className="relative w-full h-full bg-gradient-to-br from-emerald-600 to-green-600 rounded-full flex items-center justify-center">
                  <Coffee className="w-16 h-16 text-white" strokeWidth={1.5} />
                </div>
              </div>
            </motion.div>

            {/* Title with gradient */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold mb-4"
            >
              <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-green-400 bg-clip-text text-transparent">
                KOFFERA
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-emerald-200/80 mb-8"
            >
              Ethiopian Premium Coffee
            </motion.p>

            {/* Simple loading indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="flex gap-2">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
                  className="w-3 h-3 bg-emerald-500 rounded-full"
                />
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                  className="w-3 h-3 bg-emerald-500 rounded-full"
                />
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                  className="w-3 h-3 bg-emerald-500 rounded-full"
                />
              </div>
              <p className="text-sm text-emerald-200/60">Brewing your experience...</p>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-3 gap-4 mt-12 max-w-md mx-auto"
            >
              {[
                { icon: Leaf, label: "Ethical" },
                { icon: Award, label: "Premium" },
                { icon: Heart, label: "Crafted" },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-10 h-10 mx-auto mb-2 bg-emerald-900/30 rounded-full flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <p className="text-xs text-emerald-200/60">{item.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-emerald-950 to-transparent" />
      </section>
    );
  }

  const currentSlide = slides[currentIndex];
  const isVideo = currentSlide.type === "video";

  return (
    <section id="home" className="relative w-full h-screen overflow-hidden bg-[#0A1F0A]">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full h-full"
          >
            {isVideo ? (
              <video
                ref={videoRef}
                src={currentSlide.src}
                autoPlay
                muted={isMuted}
                playsInline
                loop={false}
                onEnded={handleVideoEnd}
                onError={handleVideoError}
                onCanPlay={handleCanPlay}
                onTimeUpdate={handleVideoTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={currentSlide.src}
                alt="Hero Background"
                className="w-full h-full object-cover"
              />
            )}
            
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 via-transparent to-green-950/50" />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/10 via-emerald-900/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/30 via-transparent to-transparent" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl w-full">
          <div className="flex flex-col items-center text-center">
            
            {/* Main Title */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: showText ? 1 : 0, y: showText ? 0 : 30 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-4">
                <span className="font-ubuntu bg-gradient-to-r from-emerald-400 via-emerald-300 to-green-400 bg-clip-text text-transparent">
                  KOFFERA
                </span>
                <br />
                <span className="font-ubuntu bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
                  COFFEE
                </span>
              </h1>
            </motion.div>

            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: showText ? 1 : 0, y: showText ? 0 : 20 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="flex items-center gap-3 justify-center mb-6"
            >
              <div className="h-px w-16 bg-gradient-to-r from-emerald-500 to-transparent" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">High-quality Arabica</span>
                <span className="text-white">  beans</span>
              </h2>
              <div className="h-px w-16 bg-gradient-to-l from-emerald-500 to-transparent" />
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: showText ? 1 : 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-base sm:text-lg md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed mb-8"
            >
             The company focuses on sustainable practices, traceability, and delivering
specialty-grade green coffee to international markets. Koffera Coffee aims to
promote Ethiopia’s rich coffee heritage while supporting ethical sourcing and global
quality standards
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: showText ? 1 : 0, y: showText ? 0 : 20 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-wrap gap-4 justify-center"
            >
                           <Link href="/contact">

              <button className="group relative px-8 py-3 bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-600 text-white font-semibold rounded-full overflow-hidden transition-all duration-300 transform hover:scale-105 shadow-lg">
                <span className="relative z-10">Contact Us</span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-emerald-400 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
                           </Link>

             <Link href="/posts">
              <button className="px-8 py-3 border-2 border-emerald-700/50 text-emerald-300 hover:bg-emerald-900/30 font-semibold rounded-full transition-all duration-300 transform hover:scale-105">
                Posts
              </button>
             </Link>
            </motion.div>

            {/* Feature Icons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: showText ? 1 : 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex gap-6 mt-12"
            >
              {[
                { icon: Leaf, label: "Ethical Sourcing" },
                { icon: Award, label: "Premium Quality" },
                { icon: Droplet, label: "Perfect Brew" },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-emerald-200/80">
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 bg-emerald-950/80 backdrop-blur-sm rounded-full px-4 py-2 border border-emerald-800/30">
        {/* Play/Pause */}
        {isVideo && (
          <button
            onClick={togglePlay}
            className="p-2 bg-gradient-to-r from-emerald-600 to-green-600 rounded-full text-white hover:from-emerald-700 hover:to-green-700 transition-all"
          >
            {isPlaying ? <FaPause className="w-3 h-3" /> : <FaPlay className="w-3 h-3" />}
          </button>
        )}

        {/* Mute Button */}
        {isVideo && !videoFailed && (
          <button
            onClick={toggleMute}
            className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all"
          >
            {isMuted ? <FaVolumeMute className="w-3 h-3" /> : <FaVolumeUp className="w-3 h-3" />}
          </button>
        )}

        {/* Slide Dots */}
        <div className="flex items-center gap-1">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                currentIndex === index 
                  ? "w-6 bg-gradient-to-r from-emerald-500 to-green-500" 
                  : "bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all"
        >
          <FaChevronLeft className="w-3 h-3" />
        </button>
        <button
          onClick={nextSlide}
          className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all"
        >
          <FaChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30 z-20">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-600"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "linear" }}
        />
      </div>
    </section>
  );
}