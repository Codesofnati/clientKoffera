"use client";

import React, { useEffect, useState, JSX } from "react";
import {
  FaFacebookF,
  FaTelegramPlane,
  FaYoutube,
  FaTiktok,
  FaWhatsapp,
  FaInstagram,
} from "react-icons/fa";

interface SocialLink {
  id: number;
  platform: string;
  url: string;
  icon: string;
}

// Map DB icon name → React Icon
const iconMap: Record<string, JSX.Element> = {
  facebook: <FaFacebookF />,
  instagram: <FaInstagram />,
  telegram: <FaTelegramPlane />,
  youtube: <FaYoutube />,
  tiktok: <FaTiktok />,
  whatsapp: <FaWhatsapp />,
};

const Footer = () => {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchSocialLinks = async () => {
      try {
        if (!API) return console.error("API URL not defined");
        const res = await fetch(`${API}/social`);
        if (!res.ok) {
          console.error("Failed to fetch social links");
          return;
        }
        const data: SocialLink[] = await res.json();
        setLinks(data);
      } catch (err) {
        console.error("Failed to load social links", err);
        setLinks([]);
      }
    };

    fetchSocialLinks();
  }, [API]); // safe, only runs when API changes

  return (
    <footer className="bg-gray-900 text-gray-200 py-12 px-6 md:px-16">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
        {/* Brand */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-amber-400 mb-4">
            Koffera Coffee
          </h1>
          <p className="text-gray-400 max-w-sm">
            Premium Ethiopian coffee exported globally with a commitment to
            quality, sustainability, and fair partnerships.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-col md:flex-row gap-10">
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Company</h3>
            <ul className="space-y-2">
              <li>
                <a href="#about" className="hover:text-amber-400">
                  About Us
                </a>
              </li>
              <li>
                <a href="#products" className="hover:text-amber-400">
                  Products
                </a>
              </li>
              <li>
                <a href="#achievements" className="hover:text-amber-400">
                  Achievements
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-amber-400">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Follow Us</h3>
            <div className="flex gap-4 mt-2 flex-wrap">
              {links.length > 0 ? (
                links.map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.platform}
                    className="text-xl hover:text-amber-400 transition-colors"
                  >
                    {iconMap[item.icon.toLowerCase()] ?? "?"}
                  </a>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No social links available.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="mt-10 border-t border-gray-700 pt-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Koffera Coffee. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
