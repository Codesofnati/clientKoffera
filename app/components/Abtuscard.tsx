import Image from 'next/image';
import React from 'react';

interface AbtusCardProps {
  image: string;
  title: string;
  desc: string;
}

const AbtusCard: React.FC<AbtusCardProps> = ({ image, title, desc }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden w-full max-w-md">
      {/* Image Section */}
      <div className="relative w-full h-56 overflow-hidden">
        <Image
          src={image}
          alt={title}
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Text Section */}
      <div className="p-5 text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
<p className="text-gray-600 text-sm leading-relaxed text-left">{desc}</p>
      </div>
    </div>
  );
};

export default AbtusCard;
