"use client";

import { useEffect, useState, useRef } from "react";

export default function Hero() {
  const API = process.env.NEXT_PUBLIC_API_URL;
  const fallbackImage = "/hero.jpg"; // put this in /public
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!API) {
      setVideoUrl(null);
      setLoading(false);
      return;
    }

    async function loadVideo() {
      try {
        const res = await fetch(`${API}/videos/latest`, { cache: "no-store" });
        if (!res.ok) {
          setVideoUrl(null);
          return;
        }

        const data = await res.json();
        if (data?.url) {
          setVideoUrl(`${data.url}?t=${Date.now()}`);
        } else {
          setVideoUrl(null);
        }
      } catch (err) {
        console.error("Failed to load video:", err);
        setVideoUrl(null);
      }
    }

    loadVideo();
  }, [API]);

  // Once video can play, stop showing the loading fallback
  const handleCanPlay = () => {
    setLoading(false);
  };

  return (
    <div className="w-full h-screen relative bg-black text-white overflow-hidden">
      {/* Fallback Image */}
      {loading && (
        <img
          src={fallbackImage}
          alt="Hero Background"
          className="w-full h-full object-cover"
        />
      )}

      {/* Video */}
      {videoUrl && (
        <video
          ref={videoRef}
          src={videoUrl}
          className={`w-full h-full object-cover ${loading ? "hidden" : "block"}`}
          autoPlay
          muted
          loop
          playsInline
          onCanPlay={handleCanPlay}
        />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
        <h1 className="text-4xl md:text-6xl font-bold text-center px-4">
          Welcome to Koffera Coffee
        </h1>
      </div>
    </div>
  );
}
