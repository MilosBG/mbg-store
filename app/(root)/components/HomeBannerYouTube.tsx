"use client";

import { useState, type ReactNode } from "react";

import { youtubeEmbedUrl } from "@/lib/youtubeHero";

type Props = { videoId: string; children: ReactNode };

/**
 * YouTube is an iframe player, not a downloadable MP4 for an HTML <video> tag.
 * Its controls remain available for browsers that require a user gesture.
 * The fallback image remains underneath the iframe while it loads.
 */
export default function HomeBannerYouTube({ videoId, children }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const embedUrl = youtubeEmbedUrl(videoId);

  if (!embedUrl) {
    return <div className="absolute inset-0 flex items-center justify-center">{children}</div>;
  }

  return (
    <div
      className="absolute inset-0 flex items-center justify-center overflow-hidden bg-black"
      data-mbg-video-state={failed ? "error" : loaded ? "youtube-loaded" : "loading"}
    >
      <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
        {children}
      </div>
      {!failed && (
        <iframe
          key={videoId}
          title="Vidéo YouTube d’accueil Milos BG"
          src={embedUrl}
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          loading="eager"
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className="absolute inset-0 z-[1] h-full w-full border-0"
        />
      )}
    </div>
  );
}
