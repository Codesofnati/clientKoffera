"use client";

import { useEffect, useState, useRef } from "react";
import { FaVolumeMute, FaVolumeUp } from "react-icons/fa";

export default function Hero() {
  const API = process.env.NEXT_PUBLIC_API_URL;
  const fallbackImage = "/hero.jpg"; // fallback image in /public

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

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
          setLoading(false);
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

  const handleCanPlay = () => {
    setLoading(false);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
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
          muted={isMuted}
          loop
          playsInline
          onCanPlay={handleCanPlay}
        />
      )}

      {/* Overlay Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        <h1 className="text-4xl md:text-6xl font-bold text-center px-4 mb-6">
          Welcome to Koffera Coffee
        </h1>

        {/* Mute/Unmute Button */}
        {!loading && videoUrl && (
          <button
            onClick={toggleMute}
            className="text-black text-4xl absolute right-10 bottom-10 hover:text-amber-400 transition"
          >
            {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
          </button>
        )}
      </div>
    </div>
  );
}
