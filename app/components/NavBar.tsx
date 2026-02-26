"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiHome, 
  FiFileText, 
  FiInfo, 
  FiPackage, 
  FiTarget, 
  FiAward, 
  FiFeather, 
  FiPhone,
  FiUser,
  FiLogOut,
  FiLogIn,
  FiMenu,
  FiX,
  FiChevronDown
} from "react-icons/fi";
import { FaCoffee, FaLeaf, FaRegGem } from "react-icons/fa";
import { useSupabaseAuth } from "@/context/SupabaseAuthContext";
import { LoginModal } from "./Auth/LoginModal";
import { UserNotifications } from './UserNotifications';

const NavBar = () => {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  
  const { user, loading, signOut, getUserName } = useSupabaseAuth();

  const links = [
    { text: "Home", href: "/", icon: FiHome, color: "from-amber-500 to-amber-600" },
    { text: "Posts", href: "/posts", icon: FiFileText, color: "from-emerald-500 to-emerald-600" },
    { text: "About Us", href: "/about", icon: FiInfo, color: "from-blue-500 to-blue-600" },
    { text: "Products", href: "/products", icon: FiPackage, color: "from-purple-500 to-purple-600" },
    { text: "Target Market", href: "/market", icon: FiTarget, color: "from-orange-500 to-orange-600" },
    { text: "Achievements", href: "/achievements", icon: FiAward, color: "from-yellow-500 to-yellow-600" },
    { text: "Benefits", href: "/benefits", icon: FiFeather, color: "from-green-500 to-green-600" },
    { text: "Contact Us", href: "/contact", icon: FiPhone, color: "from-red-500 to-red-600" },
  ];

  // Split links into left (first 4) and right (last 4)
  const leftLinks = links.slice(0, 4);
  const rightLinks = links.slice(4, 8);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenu(false);
    setShowUserMenu(false);
  }, [pathname]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu) {
        const userMenu = document.getElementById('user-menu');
        if (userMenu && !userMenu.contains(event.target as Node)) {
          setShowUserMenu(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  const handleNavigation = (href: string) => {
    router.push(href);
    setMobileMenu(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setShowUserMenu(false);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (href: string) => {
    return pathname === href;
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    const name = getUserName();
    return name.charAt(0).toUpperCase();
  };

  // Navigation link component with responsive behavior
  const NavLink = ({ link, isMobile = false }: { link: typeof links[0]; isMobile?: boolean }) => {
    const Icon = link.icon;
    const isActiveLink = isActive(link.href);
    
    if (isMobile) {
      return (
        <motion.button
          whileHover={{ x: 5 }}
          onClick={() => handleNavigation(link.href)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
            isActiveLink
              ? "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-l-4 border-emerald-500"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <div className={`p-2 rounded-lg ${isActiveLink ? 'bg-emerald-100' : 'bg-gray-100'}`}>
            <Icon className={`w-4 h-4 ${isActiveLink ? 'text-emerald-600' : 'text-gray-500'}`} />
          </div>
          <span className="flex-1 text-left">{link.text}</span>
          {isActiveLink && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-2 h-2 bg-emerald-500 rounded-full"
            />
          )}
        </motion.button>
      );
    }

    // Desktop view - responsive based on screen size
    return (
      <motion.div
        className="relative"
        onHoverStart={() => {
          setHoveredLink(link.href);
          // Show tooltip on lg screens (when text is hidden)
          if (window.innerWidth >= 1024 && window.innerWidth < 1280) {
            setShowTooltip(link.href);
          }
        }}
        onHoverEnd={() => {
          setHoveredLink(null);
          setShowTooltip(null);
        }}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleNavigation(link.href)}
          className={`relative px-3 py-2 rounded-lg font-medium transition-all duration-300 flex flex-col items-center gap-0.5 ${
            isActiveLink
              ? "text-emerald-600"
              : "text-gray-600 hover:text-emerald-600"
          }`}
        >
          {/* Icon */}
          <Icon className="w-5 h-5" />
          
          {/* Text - hidden below xl, shown on xl with smaller text under icon */}
          <span className="hidden xl:inline text-[10px] leading-tight">{link.text}</span>
          
          {/* Active indicator */}
          {isActiveLink && (
            <motion.div
              layoutId="activeNav"
              className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full xl:w-4 xl:h-0.5 xl:rounded-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
          
          {/* Hover effect */}
          {hoveredLink === link.href && !isActiveLink && (
            <motion.div
              layoutId="navHover"
              className="absolute inset-0 bg-emerald-50 rounded-lg -z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </motion.button>

        {/* Tooltip for lg screens (when text is hidden) */}
        {showTooltip === link.href && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50 xl:hidden"
          >
            {link.text}
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45" />
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          scrolled 
            ? "bg-white/95 backdrop-blur-xl border-b border-emerald-100/50 shadow-lg py-2" 
            : "bg-white/80 backdrop-blur-sm border-b border-emerald-100/30 py-3"
        }`}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/50 via-transparent to-amber-50/50 pointer-events-none" />
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl translate-y-1/2" />
        
        <div className="max-w-8xl mx-auto flex items-center justify-between h-16 px-5 md:px-4 relative">
          {/* Logo */}
          <Link href="/" className="relative z-10">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              {/* Logo glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-amber-400 rounded-full blur-xl opacity-50" />
              
              {/* Logo container */}
              <div className="relative flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-200/50 shadow-lg">
                <div className="relative w-10 h-10">
                  <Image
                    src="/hero-logo.png"
                    alt="Koffera Coffee Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <span className="font-bold text-lg bg-gradient-to-r from-emerald-800 to-green-700 bg-clip-text text-transparent hidden sm:block">
                  Koffera
                </span>
              </div>
            </motion.div>
          </Link>

          {/* Navigation Links - Responsive */}
          <nav className="hidden md:flex items-center justify-center flex-1 px-4">
            <div className="flex items-center md:gap-1 lg:gap-3 xl:gap-4">
              {leftLinks.map((link) => (
                <NavLink key={link.href} link={link} />
              ))}
              {rightLinks.map((link) => (
                <NavLink key={link.href} link={link} />
              ))}
            </div>
          </nav>

          {/* Right side - User Menu and Mobile Button */}
          <div className="flex items-center gap-2">
            {/* User Menu */}
            <div className="flex items-center gap-2">
              {loading ? (
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-200 to-green-200 animate-pulse" />
              ) : user ? (
                <>
                  {/* Notifications Bell */}
                  <UserNotifications />
                  
                  {/* User Menu */}
                  <div className="relative" id="user-menu">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 transition-all duration-300 border border-emerald-200/50 shadow-sm"
                    >
                      {/* Avatar with ring */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-600 rounded-full blur-sm opacity-70" />
                        <div className="relative w-8 h-8 rounded-full bg-gradient-to-r from-emerald-600 to-green-600 flex items-center justify-center text-white font-semibold text-sm ring-2 ring-white">
                          {getUserInitials()}
                        </div>
                      </div>
                      
                     
                      
                      <FiChevronDown className={`w-4 h-4 text-emerald-600 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
                    </motion.button>

                    <AnimatePresence>
                      {showUserMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden z-50"
                        >
                          {/* Header with gradient */}
                          <div className="p-4 bg-gradient-to-r from-emerald-600 to-green-600">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-xl border-2 border-white/50">
                                {getUserInitials()}
                              </div>
                              <div className="flex-1">
                                <p className="text-white font-medium truncate">{getUserName()}</p>
                                <p className="text-white/80 text-xs truncate">{user.email}</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Menu items */}
                          <div className="p-2">
                            <button
                              onClick={handleLogout}
                              className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-red-50 rounded-xl transition-colors group"
                            >
                              <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                                <FiLogOut className="w-4 h-4 text-red-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-700">Sign Out</p>
                                <p className="text-xs text-gray-500">End your session</p>
                              </div>
                            </button>
                          </div>
                          
                          {/* Footer */}
                          <div className="p-3 bg-gray-50 border-t border-gray-100">
                            <p className="text-xs text-center text-gray-500 flex items-center justify-center gap-1">
                              <FaCoffee className="w-3 h-3 text-emerald-600" />
                              <span>Koffera Coffee Export</span>
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowLoginModal(true)}
                  className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-full hover:shadow-lg transition-all text-sm font-medium group"
                >
                  <FiLogIn className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  <span className="hidden sm:inline">Sign In</span>
                  <FaLeaf className="w-3 h-3 text-emerald-200" />
                </motion.button>
              )}
            </div>

            {/* Mobile Menu Button - visible on md and below */}
            <div className="lg:hidden">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileMenu(!mobileMenu)}
                className="relative p-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg hover:shadow-xl transition-all"
              >
                <AnimatePresence mode="wait">
                  {mobileMenu ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FiX size={20} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FiMenu size={20} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-emerald-100 shadow-xl overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-5 py-6">
                {/* User info in mobile menu */}
                {user && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-200/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-600 rounded-full blur-sm opacity-70" />
                        <div className="relative w-12 h-12 rounded-full bg-gradient-to-r from-emerald-600 to-green-600 flex items-center justify-center text-white font-bold text-lg ring-2 ring-white">
                          {getUserInitials()}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Welcome back</p>
                        <p className="text-base font-semibold text-emerald-800">{getUserName()}</p>
                        <p className="text-xs text-emerald-600 mt-1">{user.email}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Navigation links grid */}
                <div className="grid grid-cols-2 gap-2">
                  {links.map((link, index) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <NavLink link={link} isMobile={true} />
                    </motion.div>
                  ))}
                </div>

                

                {/* Decorative element */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-6 pt-4 border-t border-emerald-100"
                >
                  <p className="text-xs text-center text-emerald-600 flex items-center justify-center gap-2">
                    <FaCoffee className="w-4 h-4" />
                    <span>✦ Premium Ethiopian Coffee ✦</span>
                    <FaRegGem className="w-4 h-4" />
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          console.log('Login successful');
        }}
      />

      {/* Spacer to prevent content from hiding under fixed navbar */}
      <div className="h-20" />
    </>
  );
};

export default NavBar;