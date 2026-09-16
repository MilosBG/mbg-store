"use client";

import Image from "next/image";
import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type GalleryProps = {
  productMedia?: string[];
  productName?: string;
};

type Position = { x: number; y: number };
type IconName = "previous" | "next" | "zoom" | "plus" | "minus" | "close" | "image";

function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  const paths: Record<IconName, React.ReactNode> = {
    previous: <path d="m14 18-6-6 6-6" />,
    next: <path d="m10 18 6-6-6-6" />,
    zoom: <><circle cx="11" cy="11" r="7" /><path d="m16 16 5 5M8 11h6M11 8v6" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    minus: <path d="M5 12h14" />,
    close: <path d="M6 6l12 12M18 6 6 18" />,
    image: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></>,
  };

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {paths[name]}
    </svg>
  );
}

const controlClass =
  "inline-flex h-10 w-10 items-center justify-center rounded-full border border-mbg-black/10 bg-mbg-white text-mbg-black shadow-sm transition hover:border-mbg-green hover:text-mbg-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mbg-green disabled:cursor-not-allowed disabled:opacity-40";

export default function Gallery({ productMedia, productName = "Milos BG" }: GalleryProps) {
  const images = useMemo(
    () =>
      Array.isArray(productMedia)
        ? [...new Set(productMedia.filter((src): src is string => typeof src === "string" && !!src.trim()))]
        : [],
    [productMedia],
  );

  const [selectedSrc, setSelectedSrc] = useState<string | null>(null);
  const [imageRatios, setImageRatios] = useState<Record<string, number>>({});
  const [zoomOpen, setZoomOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const mainButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const aspectRatioRef = useRef(1);
  const dragRef = useRef<{ pointerId: number; x: number; y: number; origin: Position } | null>(null);
  const dialogTitleId = useId();

  // If a new product is passed in, show its first available image automatically.
  const activeIndex = Math.max(0, images.indexOf(selectedSrc ?? ""));
  const activeImage = images[activeIndex];
  const hasImages = images.length > 0;
  const visibleZoom = zoomOpen && !!activeImage;

  const resetView = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    dragRef.current = null;
  }, []);

  const selectImage = useCallback(
    (index: number) => {
      if (!images.length) return;
      setSelectedSrc(images[(index + images.length) % images.length]);
      aspectRatioRef.current = 1;
      resetView();
    },
    [images, resetView],
  );

  const moveImage = useCallback(
    (step: number) => selectImage(activeIndex + step),
    [activeIndex, selectImage],
  );

  const closeZoom = useCallback(() => {
    setZoomOpen(false);
    resetView();
  }, [resetView]);

  const clampPosition = useCallback((next: Position, zoom: number): Position => {
    const viewport = viewportRef.current;
    if (!viewport || zoom <= 1) return { x: 0, y: 0 };

    const { width, height } = viewport.getBoundingClientRect();
    if (!width || !height) return { x: 0, y: 0 };

    // The image is object-contained: pan only until its visible edge meets the viewport.
    const ratio = aspectRatioRef.current;
    const fittedWidth = Math.min(width, height * ratio);
    const fittedHeight = Math.min(height, width / ratio);
    const maxX = Math.max(0, (fittedWidth * zoom - width) / 2);
    const maxY = Math.max(0, (fittedHeight * zoom - height) / 2);

    return {
      x: Math.min(maxX, Math.max(-maxX, next.x)),
      y: Math.min(maxY, Math.max(-maxY, next.y)),
    };
  }, []);

  const changeScale = useCallback(
    (delta: number) => {
      const next = Math.min(4, Math.max(1, Math.round((scale + delta) * 100) / 100));
      setScale(next);
      setPosition((current) => clampPosition(current, next));
    },
    [clampPosition, scale],
  );

  useEffect(() => {
    if (!visibleZoom) return;

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : mainButtonRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [visibleZoom]);

  useEffect(() => {
    if (!visibleZoom) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeZoom();
      } else if (event.key === "ArrowLeft" && images.length > 1) {
        event.preventDefault();
        moveImage(-1);
      } else if (event.key === "ArrowRight" && images.length > 1) {
        event.preventDefault();
        moveImage(1);
      } else if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        changeScale(0.25);
      } else if (event.key === "-") {
        event.preventDefault();
        changeScale(-0.25);
      } else if (event.key === "Tab") {
        const buttons = Array.from(dialogRef.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") ?? []);
        if (!buttons.length) return;
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (!dialogRef.current?.contains(document.activeElement)) {
          event.preventDefault();
          (event.shiftKey ? last : first).focus();
        } else if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [visibleZoom, closeZoom, moveImage, changeScale, images.length]);

  useEffect(() => {
    if (!visibleZoom) return;
    const viewport = viewportRef.current;
    if (!viewport) return;

    // A native non-passive wheel handler prevents the page from scrolling while zooming.
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (event.deltaY !== 0) changeScale(event.deltaY < 0 ? 0.25 : -0.25);
    };
    viewport.addEventListener("wheel", onWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", onWheel);
  }, [visibleZoom, changeScale]);

  useEffect(() => {
    if (!visibleZoom) return;
    const onResize = () => setPosition((current) => clampPosition(current, scale));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [visibleZoom, clampPosition, scale]);

  return (
    <section aria-label={`Galerie d’images : ${productName}`} className="w-full font-[Kanit,sans-serif]">
      <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_84px]">
        <div
          className={`relative min-w-0 overflow-hidden ${activeImage ? "" : "bg-mbg-black/5"}`}
          style={{ aspectRatio: String(activeImage ? imageRatios[activeImage] ?? 4 / 5 : 4 / 5) }}
        >
          {activeImage ? (
            <>
              <button
                ref={mainButtonRef}
                type="button"
                aria-label={`Agrandir l’image ${activeIndex + 1} sur ${images.length} de ${productName}`}
                aria-haspopup="dialog"
                onClick={() => setZoomOpen(true)}
                className="group absolute inset-0 w-full cursor-zoom-in focus-visible:outline-2
focus-visible:outline-offset-2
focus-visible:outline-mbg-green"
              >
                <Image
                  src={activeImage}
                  alt={`Vue ${activeIndex + 1} de ${productName}`}
                  fill
                  priority={activeIndex === 0}
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  onLoad={(event) => {
                    const { naturalWidth, naturalHeight } = event.currentTarget;
                    if (!naturalHeight) return;
                    const ratio = naturalWidth / naturalHeight;
                    setImageRatios((current) =>
                      current[activeImage] === ratio ? current : { ...current, [activeImage]: ratio },
                    );
                  }}
                  className="object-cover"
                />
                <span className="absolute right-4 top-4 rounded-full border border-mbg-black/10 bg-mbg-white/95 p-2.5 text-mbg-black shadow-sm transition group-hover:text-mbg-green">
                  <Icon name="zoom" className="h-5 w-5" />
                </span>
              </button>

              {images.length > 1 && (
                <>
                  <span aria-live="polite" className="absolute bottom-4 left-4 bg-mbg-white/95 px-3 py-2 text-xs font-medium tracking-widest text-mbg-black shadow-sm">
                    {String(activeIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
                  </span>
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <button type="button" aria-label="Image précédente" onClick={() => moveImage(-1)} className={controlClass}>
                      <Icon name="previous" />
                    </button>
                    <button type="button" aria-label="Image suivante" onClick={() => moveImage(1)} className={controlClass}>
                      <Icon name="next" />
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-mbg-black/50">
              <Icon name="image" className="h-10 w-10" />
              <p className="text-sm">Visuel bientôt disponible</p>
            </div>
          )}
        </div>

        {images.length > 1 && (
          <div className="relative min-w-0 lg:min-h-0">
            <div role="group" aria-label="Choisir une vue du produit" className="flex gap-2 overflow-x-auto pb-1 lg:absolute lg:inset-0 lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto lg:pb-0 lg:pr-1">
              {images.map((src, index) => (
                <button
                  key={src}
                  type="button"
                  aria-label={`Afficher la vue ${index + 1} sur ${images.length}`}
                  aria-pressed={index === activeIndex}
                  onClick={() => selectImage(index)}
                  className={`relative h-[76px] w-[76px] shrink-0 overflow-hidden border transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mbg-green ${
                    index === activeIndex
                      ? "border-mbg-green ring-1 ring-mbg-green"
                      : "border-mbg-black/10 hover:border-mbg-black/40"
                  }`}
                >
                  <Image src={src} alt="" fill sizes="76px" className="object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {visibleZoom && activeImage && createPortal(
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={dialogTitleId}
          className="fixed inset-0 z-[100] flex h-dvh flex-col bg-mbg-black/95 p-3 text-mbg-white font-[Kanit,sans-serif] sm:p-6"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeZoom();
          }}
        >
          <div className="mb-3 flex shrink-0 items-center justify-between gap-4">
            <div>
              <h2 id={dialogTitleId} className="text-sm font-medium sm:text-base">{productName}</h2>
              <p aria-live="polite" className="text-xs text-mbg-white/60">Vue {activeIndex + 1} / {images.length}</p>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              aria-label="Fermer l’agrandissement"
              onClick={closeZoom}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-mbg-white/25 transition hover:bg-mbg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mbg-white"
            >
              <Icon name="close" />
            </button>
          </div>

          <div className="relative min-h-0 flex-1">
            <div
              ref={viewportRef}
              className={`relative mx-auto h-full w-full max-w-6xl touch-none select-none overflow-hidden ${scale > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"}`}
              onPointerDown={(event) => {
                if (scale <= 1 || (event.pointerType === "mouse" && event.button !== 0)) return;
                dragRef.current = {
                  pointerId: event.pointerId,
                  x: event.clientX,
                  y: event.clientY,
                  origin: position,
                };
                event.currentTarget.setPointerCapture(event.pointerId);
              }}
              onPointerMove={(event) => {
                const drag = dragRef.current;
                if (!drag || drag.pointerId !== event.pointerId) return;
                setPosition(clampPosition({
                  x: drag.origin.x + event.clientX - drag.x,
                  y: drag.origin.y + event.clientY - drag.y,
                }, scale));
              }}
              onPointerUp={(event) => {
                if (dragRef.current?.pointerId !== event.pointerId) return;
                dragRef.current = null;
                if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
              }}
              onPointerCancel={() => { dragRef.current = null; }}
              onDoubleClick={() => {
                setScale(scale > 1 ? 1 : 2);
                setPosition({ x: 0, y: 0 });
              }}
            >
              <Image
                src={activeImage}
                alt={`Vue agrandie ${activeIndex + 1} de ${productName}`}
                fill
                sizes="(min-width: 1200px) 1100px, 100vw"
                draggable={false}
                onLoad={(event) => {
                  const { naturalWidth, naturalHeight } = event.currentTarget;
                  if (naturalHeight) aspectRatioRef.current = naturalWidth / naturalHeight;
                }}
                className="pointer-events-none select-none object-contain"
                style={{
                  transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
                  transition: dragRef.current ? "none" : "transform 150ms ease-out",
                }}
              />
            </div>

            {images.length > 1 && (
              <>
                <button type="button" aria-label="Image précédente" onClick={() => moveImage(-1)} className="absolute left-1 top-1/2 z-10 -translate-y-1/2 rounded-full border border-mbg-white/20 bg-mbg-black/65 p-2.5 transition hover:bg-mbg-white/20 focus-visible:outline-2 focus-visible:outline-mbg-white sm:left-4">
                  <Icon name="previous" />
                </button>
                <button type="button" aria-label="Image suivante" onClick={() => moveImage(1)} className="absolute right-1 top-1/2 z-10 -translate-y-1/2 rounded-full border border-mbg-white/20 bg-mbg-black/65 p-2.5 transition hover:bg-mbg-white/20 focus-visible:outline-2 focus-visible:outline-mbg-white sm:right-4">
                  <Icon name="next" />
                </button>
              </>
            )}
          </div>

          <div className="mt-3 flex shrink-0 items-center justify-between gap-3">
            <p className="hidden text-xs text-mbg-white/60 sm:block">Molette pour zoomer · Glisser pour déplacer · Échap pour fermer</p>
            <div className="ml-auto flex items-center gap-2">
              <button type="button" aria-label="Réduire le zoom" disabled={scale <= 1} onClick={() => changeScale(-0.25)} className="rounded-full border border-mbg-white/25 p-2.5 transition hover:bg-mbg-white/15 focus-visible:outline-2 focus-visible:outline-mbg-white disabled:cursor-not-allowed disabled:opacity-40">
                <Icon name="minus" />
              </button>
              <span className="min-w-12 text-center text-sm tabular-nums" aria-live="polite">{Math.round(scale * 100)} %</span>
              <button type="button" aria-label="Augmenter le zoom" disabled={scale >= 4} onClick={() => changeScale(0.25)} className="rounded-full border border-mbg-white/25 p-2.5 transition hover:bg-mbg-white/15 focus-visible:outline-2 focus-visible:outline-mbg-white disabled:cursor-not-allowed disabled:opacity-40">
                <Icon name="plus" />
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </section>
  );
}
