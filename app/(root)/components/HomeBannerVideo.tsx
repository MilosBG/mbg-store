"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

type Props = { src: string; children: ReactNode };
type VideoStatus = "loading" | "ready" | "playing" | "blocked" | "reduced-motion" | "error";

/**
 * A decorative silent video with a real, accessible manual-play fallback.
 * The first decoded frame is visible even if autoplay is blocked. The original
 * artwork is still displayed while the media is loading or if it fails.
 */
export default function HomeBannerVideo({ src, children }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const manualPlayRequested = useRef(false);
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);
  const [status, setStatus] = useState<VideoStatus>("loading");
  const [hasFrame, setHasFrame] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") {
      setReducedMotion(false);
      return;
    }
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener?.("change", update);
    return () => preference.removeEventListener?.("change", update);
  }, []);

  const attemptPlay = useCallback((video: HTMLVideoElement) => {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    const attempt = video.play();
    if (attempt) {
      void attempt.catch((error: unknown) => {
        // Aborted plays can happen when the component/source changes.
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.warn("[MBG hero] Video autoplay was not allowed.", error);
        setStatus("blocked");
      });
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reducedMotion === null) return;
    if (reducedMotion && !manualPlayRequested.current) {
      video.pause();
      setStatus("reduced-motion");
      return;
    }
    attemptPlay(video);
  }, [src, reducedMotion, attemptPlay]);

  function playManually() {
    const video = videoRef.current;
    if (!video) return;
    manualPlayRequested.current = true;
    setStatus("loading");
    if (video.error) {
      video.load();
    }
    // Must be invoked in the user's click handler to satisfy autoplay policy.
    attemptPlay(video);
  }

  function onVideoError() {
    setHasFrame(false);
    setStatus("error");
    console.warn("[MBG hero] Video could not be decoded or downloaded.", {
      mediaErrorCode: videoRef.current?.error?.code ?? null,
      networkState: videoRef.current?.networkState ?? null,
    });
  }

  const showVideo = hasFrame && status !== "error";
  const needsManualPlay = status === "blocked" || status === "reduced-motion" || status === "error";

  return (
    <div
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      data-mbg-video-state={status}
    >
      <div className="absolute inset-0 flex items-center justify-center" aria-hidden={showVideo}>
        {children}
      </div>
      <video
        ref={videoRef}
        src={src}
        muted
        loop
        playsInline
        autoPlay={reducedMotion === false}
        preload="auto"
        aria-hidden="true"
        tabIndex={-1}
        onLoadedData={() => {
          setHasFrame(true);
          setStatus((current) => current === "loading" ? "ready" : current);
        }}
        onPlaying={() => {
          setHasFrame(true);
          setStatus("playing");
        }}
        onPause={() => setStatus((current) => current === "playing" ? "blocked" : current)}
        onError={onVideoError}
        className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-300 ${showVideo ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
      {needsManualPlay && (
        <div className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center">
          <button
            type="button"
            onClick={playManually}
            className="pointer-events-auto border border-white/60 bg-black/80 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            aria-label={status === "error" ? "Réessayer la lecture de la vidéo" : "Lire la vidéo d’accueil"}
          >
            {status === "error" ? "RÉESSAYER LA VIDÉO" : "LIRE LA VIDÉO"}
          </button>
        </div>
      )}
    </div>
  );
}
