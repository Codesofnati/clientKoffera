'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ImageItem {
  id: number;
  url: string;
  category: string;
  createdAt: string;
}

const values = [
  { title: 'Quality', desc: 'Delivering premium Ethiopian coffee that reflects exceptional craftsmanship and rich flavor.' },
  { title: 'Sustainability', desc: 'Promoting environmentally responsible practices from farm to export.' },
  { title: 'Integrity', desc: 'Upholding transparency, ethical trade, and trust in every partnership.' },
  { title: 'Empowerment', desc: 'Supporting local farmers and communities to grow economically and socially.' },
  { title: 'Innovation', desc: 'Embracing modern processes and global trends while honoring tradition.' },
  { title: 'Cultural Pride', desc: 'Showcasing Ethiopia’s coffee heritage to inspire global appreciation.' },
];

const categories = ['vision', 'mission'];

const AboutUs = () => {
  const API = process.env.NEXT_PUBLIC_API_URL;
  const [images, setImages] = useState<ImageItem[]>([]);
const [cacheBuster, setCacheBuster] = useState('');

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

  const visionImage = images.find(img => img.category === 'vision');
  const missionImage = images.find(img => img.category === 'mission');

  const vision = {
    title: 'Vision',
    desc:
      'To be a globally recognized leader in the export of premium Ethiopian coffee, celebrated for our commitment to quality, sustainability, and equitable partnerships.',
    fallback: '/cof1.jpg',
  };

  const mission = {
    title: 'Mission',
    desc:
      'At Koffera Coffee, our mission is to share Ethiopia’s rich coffee heritage with the world by exporting ethically sourced, high-quality Arabica beans.',
    fallback: '/buna1.jpg',
  };

  return (
    <section id='about' className="relative w-full bg-gray-50 py-16 px-5 md:px-16">
      {/* Heading */}
      <motion.h1
        className="text-4xl md:text-5xl font-bold text-center mb-16 text-gray-800"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        About Us
      </motion.h1>

      {/* Vision */}
      <motion.div
        className="flex flex-col md:flex-row items-center gap-10 mb-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <motion.img
  src={`${visionImage?.url ?? vision.fallback}${cacheBuster}`}
  alt="Vision"
  className="w-full md:w-1/2 h-64 md:h-96 object-cover rounded-2xl shadow-lg hover:scale-105 transition"
/>

        <div className="md:w-1/2">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
            {vision.title}
          </h2>
          <p className="text-gray-700 text-lg">{vision.desc}</p>
        </div>
      </motion.div>

      {/* Mission */}
      <motion.div
        className="flex flex-col md:flex-row-reverse items-center gap-10 mb-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <motion.img
  src={`${missionImage?.url ?? mission.fallback}${cacheBuster}`}
  alt="Mission"
  className="w-full md:w-1/2 h-64 md:h-96 object-cover rounded-2xl shadow-lg hover:scale-105 transition"
/>

        <div className="md:w-1/2">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
            {mission.title}
          </h2>
          <p className="text-gray-700 text-lg">{mission.desc}</p>
        </div>
      </motion.div>

      {/* Values */}
      <motion.div
        className="bg-white rounded-2xl shadow-lg p-8 md:p-12 max-w-5xl mx-auto"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
          Our Values
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              className="p-4 bg-gray-50 rounded-lg shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
            >
              <h3 className="font-semibold text-lg mb-2">{v.title}</h3>
              <p className="text-gray-700">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default AboutUs;
