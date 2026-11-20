/**
 * Accept only genuine YouTube video URLs (or an 11-character video ID).
 * Never embed arbitrary user-supplied URLs in an iframe.
 */
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

export function getYouTubeVideoId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const input = value.trim();
  if (VIDEO_ID.test(input)) return input;

  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return null;
  }

  if (url.protocol !== "https:" || url.username || url.password || url.port) {
    return null;
  }

  const host = url.hostname.toLowerCase();
  const segments = url.pathname.split("/").filter(Boolean);
  let candidate: string | null = null;

  if (host === "youtu.be" || host === "www.youtu.be") {
    candidate = segments.length === 1 ? segments[0] : null;
  } else if (
    host === "youtube.com" || host === "www.youtube.com" ||
    host === "m.youtube.com" || host === "music.youtube.com" ||
    host === "youtube-nocookie.com" || host === "www.youtube-nocookie.com"
  ) {
    if (url.pathname === "/watch") {
      candidate = url.searchParams.get("v");
    } else if (
      segments.length === 2 &&
      ["embed", "shorts", "live", "v"].includes(segments[0])
    ) {
      candidate = segments[1];
    }
  }

  return candidate && VIDEO_ID.test(candidate) ? candidate : null;
}

export function canonicalYouTubeUrl(value: unknown): string | null {
  const id = getYouTubeVideoId(value);
  return id ? `https://www.youtube.com/watch?v=${id}` : null;
}

export function youtubeEmbedUrl(value: unknown, autoplay = true): string | null {
  const id = getYouTubeVideoId(value);
  if (!id) return null;
  const params = new URLSearchParams({
    autoplay: autoplay ? "1" : "0",
    mute: "0",
    loop: "1",
    playlist: id, // YouTube requires playlist=VIDEO_ID to loop a single video.
    playsinline: "1",
    controls: "1", // Keeps playback accessible if the browser blocks autoplay.
    rel: "0",
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}
