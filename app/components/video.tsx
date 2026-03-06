'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Play, Pause, Maximize2, Minimize2, SkipBack, SkipForward } from 'lucide-react';

const AboutUsHeroVideo = () => {
  const API = process.env.NEXT_PUBLIC_API_URL;
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fullscreenVideoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [videos, setVideos] = useState<string[]>([]);
  const [iosPlayOverlay, setIosPlayOverlay] = useState(false);

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const fullscreenContainerRef = useRef<HTMLDivElement | null>(null);
  const isInitialMount = useRef(true);
  
  // Store iOS detection in state
  const [isIOS, setIsIOS] = useState(false);
  
  // Track screen orientation for iOS
  const [isLandscape, setIsLandscape] = useState(false);

  // Track if we're in fullscreen mode
  const [isFullscreenMode, setIsFullscreenMode] = useState(false);

  /* --------------------------------------------------
       FETCH LATEST VIDEOS FROM EACH CATEGORY (video1, video2, video3)
  -------------------------------------------------- */
  useEffect(() => {
    async function fetchLatestVideos() {
      if (!API) {
        // Fallback videos if no API
        setVideos(['/flags/vid8.mp4', '/flags/vid7.mp4', '/flags/vid6.mp4']);
        setIsLoading(false);
        return;
      }
      
      try {
        // Fetch latest videos by category
        const categories = ['video1', 'video2', 'video3'];
        const promises = categories.map(category => 
          fetch(`${API}/story/videos/latest/${category}`, {
            cache: "no-store",
          }).then(res => res.ok ? res.json() : null)
            .catch(() => null) // Handle individual fetch failures
        );

        const results = await Promise.all(promises);
        
        const orderedVideos = [];
        
        for (let i = 0; i < results.length; i++) {
          if (results[i]?.success && results[i].video) {
            orderedVideos.push(`${results[i].video.url}?t=${Date.now()}`);
          } else {
            // If no video for this category, use fallback
            orderedVideos.push(`/flags/vid${8 - i}.mp4`); // vid8, vid7, vid6
          }
        }
        
        setVideos(orderedVideos);
        
      } catch (err) {
        console.warn(`Latest videos unavailable from API:`, err);
        // Fallback videos
        setVideos(['/flags/vid8.mp4', '/flags/vid7.mp4', '/flags/vid6.mp4']);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLatestVideos();
  }, [API]);
  
  // IOS DETECTION AND FIX
  useEffect(() => {
    // Check if iOS
    const isIOSDevice = () => {
      if (typeof window === 'undefined') return false;
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isIOS = /iPad|iPhone|iPod/.test(userAgent);
      const isMSStream = !!(window as any).MSStream;
      return isIOS && !isMSStream;
    };
    
    const iosCheck = isIOSDevice();
    setIsIOS(iosCheck);
    
    if (iosCheck && videoRef.current) {
      // iOS requires these attributes
      videoRef.current.setAttribute('playsinline', 'true');
      videoRef.current.setAttribute('webkit-playsinline', 'true');
      videoRef.current.setAttribute('x5-playsinline', 'true');
      videoRef.current.muted = true;
      setIsMuted(true);
      
      // iOS can't autoplay without user interaction, show play button
      setIosPlayOverlay(true);
      
      // Set initial landscape detection
      setIsLandscape(window.innerWidth > window.innerHeight);
      
      // Listen for orientation changes
      const handleResize = () => {
        setIsLandscape(window.innerWidth > window.innerHeight);
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Handle video loading and metadata
  useEffect(() => {
    if (videoRef.current && !isFullscreenMode && videos.length > 0) {
      const handleLoadedData = () => {
        if (videoRef.current) {
          setDuration(videoRef.current.duration);
        }
      };

      const handleTimeUpdate = () => {
        if (videoRef.current && !isFullscreenMode) {
          setCurrentTime(videoRef.current.currentTime);
        }
      };

      videoRef.current.addEventListener('loadeddata', handleLoadedData);
      videoRef.current.addEventListener('timeupdate', handleTimeUpdate);

      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('loadeddata', handleLoadedData);
          videoRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        }
      };
    }
  }, [isFullscreenMode, videos]);

  // Handle video end to auto-play next video
  const handleVideoEnd = () => {
    if (!isFullscreenMode && videos.length > 1) {
      nextVideo();
    }
  };

  // Initialize video on mount
  useEffect(() => {
    if (isInitialMount.current && videos.length > 0) {
      isInitialMount.current = false;
      if (videoRef.current) {
        videoRef.current.src = videos[currentVideoIndex];
        videoRef.current.load();
        
        // Set iOS specific attributes
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('webkit-playsinline', 'true');
        videoRef.current.setAttribute('x5-playsinline', 'true');
        videoRef.current.setAttribute('preload', 'metadata');
        
        // For iOS, don't autoplay - wait for user interaction
        if (!isIOS) {
          setTimeout(() => {
            if (videoRef.current && isPlaying) {
              videoRef.current.play().catch(e => {
                console.log("Initial auto-play prevented:", e);
              });
            }
          }, 500);
        }
      }
    }
  }, [videos, currentVideoIndex, isIOS]);

  // Update video source when currentVideoIndex changes
  useEffect(() => {
    if (videoRef.current && videos.length > 0 && currentVideoIndex < videos.length && !isFullscreenMode) {
      setIsLoading(true);
      videoRef.current.src = videos[currentVideoIndex];
      videoRef.current.load();
      
      videoRef.current.onloadeddata = () => {
        setIsLoading(false);
        if (isPlaying && !isIOS) {
          videoRef.current?.play().catch(e => {
            console.log("Video play failed:", e);
          });
        }
      };
    }
  }, [currentVideoIndex, isIOS, isFullscreenMode]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      
      if (!isNowFullscreen && isFullscreenMode) {
        // Exit fullscreen mode
        setIsFullscreenMode(false);
        setIsFullscreen(false);
        
        // Clean up fullscreen container
        if (fullscreenContainerRef.current) {
          // Pause and clean up fullscreen video
          if (fullscreenVideoRef.current) {
            fullscreenVideoRef.current.pause();
            fullscreenVideoRef.current.src = '';
            fullscreenVideoRef.current.load();
            fullscreenVideoRef.current = null;
          }
          
          // Remove container
          if (document.body.contains(fullscreenContainerRef.current)) {
            document.body.removeChild(fullscreenContainerRef.current);
          }
          fullscreenContainerRef.current = null;
        }
        
        // Resume main video
        if (videoRef.current) {
          videoRef.current.src = videos[activeVideoIndex];
          videoRef.current.currentTime = currentTime;
          videoRef.current.muted = isMuted;
          videoRef.current.load();
          
          // Resume playing if it was playing before fullscreen
          setTimeout(() => {
            if (videoRef.current && isPlaying) {
              videoRef.current.play().catch(e => {
                console.log("Main video resume failed:", e);
              });
            }
          }, 300);
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isFullscreenMode, activeVideoIndex, currentTime, isMuted, isPlaying, videos]);

  const toggleMute = () => {
    if (isFullscreenMode && fullscreenVideoRef.current) {
      fullscreenVideoRef.current.muted = !fullscreenVideoRef.current.muted;
      setIsMuted(!isMuted);
    } else if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const togglePlay = () => {
    if (isFullscreenMode && fullscreenVideoRef.current) {
      if (isPlaying) {
        fullscreenVideoRef.current.pause();
        setIsPlaying(false);
      } else {
        fullscreenVideoRef.current.play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(e => {
            console.log("Play failed:", e);
          });
      }
    } else if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play()
          .then(() => {
            setIsPlaying(true);
            setIosPlayOverlay(false);
          })
          .catch(e => {
            console.log("Play failed:", e);
            if (isIOS) {
              setIosPlayOverlay(true);
            }
          });
      }
    }
  };

  // Handle iOS play button click
  const handleIosPlay = () => {
    if (videoRef.current) {
      videoRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setIosPlayOverlay(false);
        })
        .catch(e => {
          console.log("iOS play failed:", e);
          videoRef.current!.muted = true;
          videoRef.current!.play()
            .then(() => {
              setIsPlaying(true);
              setIosPlayOverlay(false);
            })
            .catch(e2 => console.log("iOS muted play also failed:", e2));
        });
    }
  };

  // iOS Fullscreen Implementation
  const createIOSFullscreen = () => {
    if (!isFullscreenMode) {
      // Pause main video first
      if (videoRef.current) {
        videoRef.current.pause();
      }

      // Create fullscreen container
      const container = document.createElement('div');
      container.className = 'fixed inset-0 bg-black z-[9999] flex items-center justify-center';
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '100vw';
      container.style.height = '100vh';
      container.style.backgroundColor = '#000';
      container.style.zIndex = '9999';
      
      // Create video element
      const video = document.createElement('video');
      video.className = 'w-full h-full object-contain';
      video.style.width = '100%';
      video.style.height = '100%';
      video.style.objectFit = 'contain';
      video.src = videos[activeVideoIndex];
      video.currentTime = currentTime;
      video.muted = isMuted;
      video.setAttribute('playsinline', 'true');
      video.setAttribute('webkit-playsinline', 'true');
      video.setAttribute('x5-playsinline', 'true');
      
      // Store reference
      fullscreenVideoRef.current = video;
      
      // Create controls container (simplified for brevity - you can add your full controls here)
      const controlsContainer = document.createElement('div');
      controlsContainer.className = 'absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/70 to-transparent z-10';
      
      // Create exit button
      const exitBtn = document.createElement('button');
      exitBtn.className = 'absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors z-20';
      exitBtn.innerHTML = '<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>';
      
      exitBtn.addEventListener('click', () => {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          // If not in fullscreen API mode, manually exit
          if (document.body.contains(container)) {
            document.body.removeChild(container);
          }
          setIsFullscreenMode(false);
          setIsFullscreen(false);
          
          // Resume main video
          if (videoRef.current) {
            videoRef.current.src = videos[activeVideoIndex];
            videoRef.current.currentTime = video.currentTime;
            videoRef.current.muted = video.muted;
            videoRef.current.load();
            
            if (isPlaying) {
              setTimeout(() => {
                if (videoRef.current) {
                  videoRef.current.play().catch(e => console.log("Resume failed:", e));
                }
              }, 300);
            }
          }
        }
      });
      
      container.appendChild(video);
      container.appendChild(controlsContainer);
      container.appendChild(exitBtn);
      document.body.appendChild(container);
      fullscreenContainerRef.current = container;
      
      setIsFullscreenMode(true);
      setIsFullscreen(true);
      
      // Try to play
      video.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(e => {
          console.log("iOS fullscreen play failed:", e);
          setIsPlaying(false);
        });
      
      // Try to enter fullscreen
      try {
        if (container.requestFullscreen) {
          container.requestFullscreen();
        } else if ((container as any).webkitRequestFullscreen) {
          (container as any).webkitRequestFullscreen();
        } else if ((container as any).mozRequestFullScreen) {
          (container as any).mozRequestFullScreen();
        } else if ((container as any).msRequestFullscreen) {
          (container as any).msRequestFullscreen();
        }
      } catch (err) {
        console.log("Fullscreen request failed:", err);
      }
    }
  };

  const toggleFullscreen = async () => {
    if (isIOS) {
      createIOSFullscreen();
      return;
    }

    // Standard fullscreen for non-iOS devices
    if (!isFullscreenMode) {
      // Pause main video
      if (videoRef.current) {
        videoRef.current.pause();
      }

      const fullscreenContainer = document.createElement('div');
      fullscreenContainer.className = 'fixed inset-0 bg-black z-50 flex items-center justify-center';
      fullscreenContainerRef.current = fullscreenContainer;
      
      const video = document.createElement('video');
      video.className = 'w-full h-full object-contain';
      video.src = videos[activeVideoIndex];
      video.muted = isMuted;
      video.currentTime = currentTime;
      video.playsInline = true;
      video.setAttribute('playsinline', 'true');
      video.setAttribute('webkit-playsinline', 'true');
      video.setAttribute('x5-playsinline', 'true');
      
      // Store reference
      fullscreenVideoRef.current = video;
      
      // Simple controls for now (you can add your full controls here)
      const exitBtn = document.createElement('button');
      exitBtn.className = 'absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors z-20';
      exitBtn.innerHTML = '<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>';
      
      exitBtn.addEventListener('click', () => {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
      });
      
      fullscreenContainer.appendChild(video);
      fullscreenContainer.appendChild(exitBtn);
      document.body.appendChild(fullscreenContainer);
      
      setIsFullscreenMode(true);
      setIsFullscreen(true);
      
      video.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(e => {
          console.log("Fullscreen play failed:", e);
          setIsPlaying(false);
        });
      
      try {
        const requestFullscreen = 
          fullscreenContainer.requestFullscreen ||
          (fullscreenContainer as any).webkitRequestFullscreen ||
          (fullscreenContainer as any).mozRequestFullScreen ||
          (fullscreenContainer as any).msRequestFullscreen;
        
        if (requestFullscreen) {
          await requestFullscreen.call(fullscreenContainer);
        }
      } catch (err) {
        console.error('Error enabling fullscreen:', err);
      }
    }
  };

  const nextVideo = () => {
    if (videos.length <= 1) return;
    
    const nextIndex = (currentVideoIndex + 1) % videos.length;
    setCurrentVideoIndex(nextIndex);
    setActiveVideoIndex(nextIndex);
  };

  const prevVideo = () => {
    if (videos.length <= 1) return;
    
    const prevIndex = (currentVideoIndex - 1 + videos.length) % videos.length;
    setCurrentVideoIndex(prevIndex);
    setActiveVideoIndex(prevIndex);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current && !isFullscreenMode) {
      videoRef.current.currentTime = time;
    } else if (fullscreenVideoRef.current && isFullscreenMode) {
      fullscreenVideoRef.current.currentTime = time;
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleVideoClick = () => {
    togglePlay();
  };

  // Show loading state while fetching video
  if (isLoading && videos.length === 0) {
    return (
      <section className="relative w-full min-h-[500px] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 md:py-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="logo.png"
            alt="Coffee farm loading background"
            className="w-full h-full object-cover blur-[0.5px]"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/40 via-black/60 to-lime-50/30"></div>
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-green-300">Loading our story videos...</p>
        </div>
      </section>
    );
  }

  // If no videos are available
  if (videos.length === 0) {
    return (
      <section className="relative w-full min-h-[500px] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 md:py-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="logo.png"
            alt="Coffee landscape background"
            className="w-full h-full object-cover blur-[1px]"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/50 via-black/70 to-lime-50/20"></div>
        </div>
        
        <div className="relative z-10 text-center p-8 bg-black/50 rounded-xl backdrop-blur-sm">
          <h3 className="text-2xl font-bold text-white mb-4">Our Story Videos</h3>
          <p className="text-green-300 mb-6">No story videos available for this category yet.</p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Refresh
            </button>
            <a 
              href="/admin" 
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Upload Videos
            </a>
          </div>
        </div>
      </section>
    );
  }

  // CSS to prevent iOS from hijacking video controls
  const iosStyles = `
    video::-webkit-media-controls {
      display: none !important;
    }
    video::-webkit-media-controls-enclosure {
      display: none !important;
    }
    video::-webkit-media-controls-panel {
      display: none !important;
    }
    video::-webkit-media-controls-play-button {
      display: none !important;
    }
    video::-webkit-media-controls-start-playback-button {
      display: none !important;
    }
    video {
      -webkit-tap-highlight-color: transparent;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      user-select: none;
      background-color: #000;
    }
    /* Fix for iOS black screen */
    video:not([poster]) {
      background-color: #000 !important;
    }
  `;

  return (
    <>
      <style>{iosStyles}</style>
      <section className="relative w-full rounded-2xl flex items-center pt-0 justify-center px-4 py-0 md:py-20 overflow-hidden">
        
        <div className="relative z-10 max-w-6xl mx-auto w-full">
          <div className="flex flex-col md:grid md:grid-cols-1 md:gap-12 items-center">
          
            {/* Mobile Video Player */}
            <div className="md:hidden w-full">
              <div className="relative rounded-2xl overflow-hidden shadow-xl bg-black mb-6">
                <video
                  ref={videoRef}
                  className="w-full h-64 object-cover bg-black"
                  muted={isMuted}
                  playsInline
                  preload="metadata"
                  onEnded={handleVideoEnd}
                  onClick={isIOS ? handleIosPlay : togglePlay}
                  onError={(e) => {
                    console.error("Video error:", e);
                    setIsLoading(false);
                  }}
                  poster={isIOS && !isLandscape ? "logo.png" : undefined}
                >
                  <source src={videos[currentVideoIndex]} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                {iosPlayOverlay && !isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-30">
                    <button
                      onClick={handleIosPlay}
                      className="p-6 bg-gradient-to-r from-green-600 to-lime-600 rounded-full text-white hover:from-green-700 hover:to-lime-700 transition-all transform hover:scale-110"
                      aria-label="Play video"
                    >
                      <Play className="w-12 h-12" />
                    </button>
                  </div>
                )}

                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
                    <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-green-900/40 via-transparent to-transparent"></div>

                <div className="absolute top-3 left-3 right-3 z-10">
                  <div className="flex items-center justify-between">
                    
                    <div className="text-white text-xs bg-black/50 px-2 py-1 rounded">
                      Video {currentVideoIndex + 1}/{videos.length}
                    </div>
                  </div>
                </div>

                {!isPlaying && !showControls && !iosPlayOverlay && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <button
                      onClick={togglePlay}
                      className="p-4 bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-sm transition-all transform hover:scale-110"
                      aria-label="Play"
                    >
                      <Play className="w-8 h-8 text-white" />
                    </button>
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={prevVideo}
                        className="p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Previous video"
                        disabled={isFullscreenMode || isLoading || videos.length <= 1}
                      >
                        <SkipBack className="w-4 h-4 text-white" />
                      </button>
                      
                      <button
                        onClick={togglePlay}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={isPlaying ? "Pause" : "Play"}
                        disabled={isLoading}
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5 text-white" />
                        ) : (
                          <Play className="w-5 h-5 text-white" />
                        )}
                      </button>
                      
                      <button
                        onClick={nextVideo}
                        className="p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Next video"
                        disabled={isFullscreenMode || isLoading || videos.length <= 1}
                      >
                        <SkipForward className="w-4 h-4 text-white" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={toggleMute}
                        className="p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                        aria-label={isMuted ? "Unmute" : "Mute"}
                      >
                        {isMuted ? (
                          <VolumeX className="w-4 h-4 text-white" />
                        ) : (
                          <Volume2 className="w-4 h-4 text-white" />
                        )}
                      </button>
                      
                      <button
                        onClick={toggleFullscreen}
                        className="p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                      >
                        {isFullscreen ? (
                          <Minimize2 className="w-4 h-4 text-white" />
                        ) : (
                          <Maximize2 className="w-4 h-4 text-white" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center mb-6">
                <p className="text-green-200 text-xs">
                  <span className="inline-block px-2 py-1 bg-black/40 rounded">
                    🔊 Sound: {isMuted ? 'Off' : 'On'} • ⏯️ Tap to play/pause
                  </span>
                </p>
                {isIOS && (
                  <p className="text-green-300 text-xs mt-2">
                    Rotate device for better viewing
                  </p>
                )}
              </div>
            </div>

            {/* Desktop Video Player */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="hidden md:block relative"
            >
              <div 
                className="relative rounded-3xl overflow-hidden shadow-2xl group bg-black"
                onMouseEnter={() => setShowControls(true)}
                onMouseLeave={() => setShowControls(false)}
                onClick={handleVideoClick}
              >
                <video
                  ref={videoRef}
                  className="w-full h-[500px] object-cover bg-black"
                  muted={isMuted}
                  playsInline
                  preload="metadata"
                  onEnded={handleVideoEnd}
                  onError={(e) => {
                    console.error("Video error:", e);
                    setIsLoading(false);
                  }}
                  poster="logo.png"
                >
                  <source src={videos[currentVideoIndex]} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                {iosPlayOverlay && !isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-30">
                    <button
                      onClick={handleIosPlay}
                      className="p-6 bg-gradient-to-r from-green-600 to-lime-600 rounded-full text-white hover:from-green-700 hover:to-lime-700 transition-all transform hover:scale-110"
                      aria-label="Play video"
                    >
                      <Play className="w-12 h-12" />
                    </button>
                  </div>
                )}

                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
                    <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}


                <div className="absolute top-4 left-4 right-4 z-10">
                  <div className="flex items-center justify-between">
                    <div className="text-white text-sm bg-black/50 px-3 py-1 rounded-lg">
                      Video {currentVideoIndex + 1}/{videos.length}
                    </div>
                  </div>
                </div>

                {!isPlaying && !showControls && !iosPlayOverlay && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <button
                      onClick={togglePlay}
                      className="p-6 bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-sm transition-all transform hover:scale-110"
                      aria-label="Play"
                    >
                      <Play className="w-12 h-12 text-white" />
                    </button>
                  </div>
                )}

                <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}></div>

                <div 
                  className={`absolute bottom-0 left-0 right-0 p-4 transition-all duration-300 ${showControls ? 'translate-y-0' : 'translate-y-full'}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="mb-4">
                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-1.5 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-white mt-1">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={prevVideo}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Previous video"
                        disabled={isFullscreenMode || isLoading || videos.length <= 1}
                      >
                        <SkipBack className="w-5 h-5 text-white" />
                      </button>
                      
                      <button
                        onClick={togglePlay}
                        className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={isPlaying ? "Pause" : "Play"}
                        disabled={isLoading}
                      >
                        {isPlaying ? (
                          <Pause className="w-6 h-6 text-white" />
                        ) : (
                          <Play className="w-6 h-6 text-white" />
                        )}
                      </button>
                      
                      <button
                        onClick={nextVideo}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Next video"
                        disabled={isFullscreenMode || isLoading || videos.length <= 1}
                      >
                        <SkipForward className="w-5 h-5 text-white" />
                      </button>
                    </div>

                   
                    <div className="flex items-center gap-3">
                      <button
                        onClick={toggleMute}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                        aria-label={isMuted ? "Unmute" : "Mute"}
                      >
                        {isMuted ? (
                          <VolumeX className="w-5 h-5 text-white" />
                        ) : (
                          <Volume2 className="w-5 h-5 text-white" />
                        )}
                      </button>
                      
                      <button
                        onClick={toggleFullscreen}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                      >
                        {isFullscreen ? (
                          <Minimize2 className="w-5 h-5 text-white" />
                        ) : (
                          <Maximize2 className="w-5 h-5 text-white" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-center">
                <p className="text-white text-sm">
                  <span className="inline-block px-2 py-1 bg-black/40 rounded-lg">
                    🔊 Sound: {isMuted ? 'Off' : 'On'} • ⏯️ Click video to play/pause • Hover for controls
                  </span>
                </p>
              </div>

              <div className="absolute -top-4 -right-4 w-24 h-24 border-t-2 border-r-2 border-green-400/50 rounded-tr-3xl"></div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 border-b-2 border-l-2 border-green-400/50 rounded-bl-3xl"></div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutUsHeroVideo;