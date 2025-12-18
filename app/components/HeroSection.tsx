"use client";

import { useEffect, useState } from "react";

export default function Hero() {
  const API = process.env.NEXT_PUBLIC_API_URL;

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!API) {
      setVideoUrl(null);
      setLoading(false);
      return;
    }

    async function loadVideo() {
      try {
        const res = await fetch(`${API}/videos/latest`, {
          cache: "no-store",
        });

        if (!res.ok) {
          console.warn("Backend error → no video available");
          setVideoUrl(null);
          return;
        }

        const data = await res.json();

        if (data?.url) {
          // prevent caching
          setVideoUrl(`${data.url}?t=${Date.now()}`);
        } else {
          setVideoUrl(null);
        }
      } catch (err) {
        console.error("Failed to load hero video:", err);
        setVideoUrl(null);
      } finally {
        setLoading(false);
      }
    }

    loadVideo();
  }, [API]);

  return (
    <div className="w-full h-screen relative bg-black text-white overflow-hidden">
      {/* Loading */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <p className="text-xl animate-pulse">Loading hero content...</p>
        </div>
      )}

      {/* Video */}
      {!loading && videoUrl && (
        <video
          src={videoUrl}
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
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
