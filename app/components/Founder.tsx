'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ImageItem {
  id: number;
  url: string;
  category: string;
  createdAt: string;
}

const Founder = () => {
  const API = process.env.NEXT_PUBLIC_API_URL;
  const [images, setImages] = useState<ImageItem[]>([]);


  const imageDescriptions: Record<
    string,
    { title: string; subtitle: string; text: string }
  > = {
    founder: {
      title: 'Firaol Kebede',
      subtitle:
        'CEO & Founder of Koket, Kofera Coffee Export, Spicy Pulse Export Company, and Fira Link Business Solutions Consulting',
      text:
        'Firaol Kebede is the CEO and founder of Koket – Gifty Import and Export, as well as the owner and visionary behind Kofera Coffee Export and Spicy Pulse Export Company. In addition, he is the founder and owner of Fira Link Business Solutions Consulting, where he provides strategic guidance and business solutions.',
    },
  };

  useEffect(() => {
  if (!API) return;

  const categories = ['founder']; // moved inside useEffect

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


  return (
    <section
      id="founder"
      className="relative w-full min-h-screen bg-gray-50 py-16 px-5 md:px-16"
    >
      <motion.h1
        className="text-4xl md:text-5xl font-bold text-center mb-16 text-gray-800"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Founder
      </motion.h1>

      <div className="flex flex-col gap-16 max-w-6xl mx-auto">
        {images.map((img) => {
          const desc = imageDescriptions[img.category];

          return (
            <motion.div
              key={img.id}
              className="flex flex-col md:flex-row items-center gap-10 md:gap-16"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              {/* Image */}
              <motion.img
                src={img.url} // removed Date.now()
                alt={img.category}
                className="w-full md:w-1/2 h-80 md:h-[500px] object-cover rounded-2xl shadow-lg hover:scale-105 transition-transform duration-500"
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              />

              {/* Description */}
              {desc && (
                <motion.div
                  className="md:w-1/2"
                  initial={{ x: 50, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                    {desc.title}
                  </h2>

                  <h3 className="text-xl md:text-2xl font-semibold text-gray-600 mb-6">
                    {desc.subtitle}
                  </h3>

                  <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                    {desc.text}
                  </p>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default Founder;
