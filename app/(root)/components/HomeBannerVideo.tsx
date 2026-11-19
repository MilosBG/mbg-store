"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = { src: string; children: ReactNode };

/**
 * Decorative, silent banner video. Show the existing hero image as a fallback
 * until playback actually starts, if playback fails, or for reduced motion.
 */
export default function HomeBannerVideo({ src, children }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldPlay, setShouldPlay] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setShouldPlay(!preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!shouldPlay) {
      video.pause();
      setPlaying(false);
      return;
    }
    const attempt = video.play();
    if (attempt) void attempt.catch(() => setPlaying(false));
  }, [src, shouldPlay]);

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center" aria-hidden={playing}>
        {children}
      </div>
      <video
        ref={videoRef}
        src={src}
        muted loop playsInline
        autoPlay={shouldPlay}
        preload="metadata"
        aria-hidden="true"
        tabIndex={-1}
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => setPlaying(false)}
        className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-300 ${playing ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
    </div>
  );
}
