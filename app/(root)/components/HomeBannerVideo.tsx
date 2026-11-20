"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

type Props = { src: string; children: ReactNode };
type VideoStatus = "loading" | "ready" | "playing" | "blocked" | "error";

/**
 * Decorative home hero. Native muted autoplay starts on initial HTML load,
 * without waiting for the user's OS motion preference or React hydration.
 * A readable fallback and manual button remain available when autoplay fails.
 */
export default function HomeBannerVideo({ src, children }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<VideoStatus>("loading");
  const [hasFrame, setHasFrame] = useState(false);

  const tryPlay = useCallback((video: HTMLVideoElement) => {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    let promise: Promise<void> | undefined;
    try {
      promise = video.play();
    } catch (error) {
      console.warn("[MBG hero] Cannot start video playback.", error);
      setStatus("blocked");
      return;
    }

    if (promise) {
      void promise.catch((error: unknown) => {
        // A pending play() may be cancelled by navigation or a source change.
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.warn("[MBG hero] Muted video autoplay failed.", error);
        setStatus(video.error ? "error" : "blocked");
      });
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set the properties early and explicitly: browser autoplay requires mute.
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    if (video.paused && !video.error) tryPlay(video);

    // Tabs restored from the background may have been paused by the browser.
    const onVisibilityChange = () => {
      if (!document.hidden && video.paused && !video.error) tryPlay(video);
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [src, tryPlay]);

  function playManually() {
    const video = videoRef.current;
    if (!video) return;
    setStatus("loading");
    if (video.error) video.load();
    // Trigger play directly in the click handler, preserving user activation.
    tryPlay(video);
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
  const needsManualPlay = status === "blocked" || status === "error";

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
        autoPlay
        loop
        playsInline
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
        onPause={() => {
          if (!document.hidden) {
            setStatus((current) => current === "playing" ? "blocked" : current);
          }
        }}
        onError={onVideoError}
        className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-300 ${showVideo ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
      {needsManualPlay && (
        <div className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center">
          <button
            type="button"
            onClick={playManually}
            className="pointer-events-auto rounded-sm border border-white/60 bg-black/80 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            aria-label={status === "error" ? "Réessayer la lecture de la vidéo" : "Lire la vidéo d’accueil"}
          >
            {status === "error" ? "RÉESSAYER LA VIDÉO" : "LIRE LA VIDÉO"}
          </button>
        </div>
      )}
    </div>
  );
}
