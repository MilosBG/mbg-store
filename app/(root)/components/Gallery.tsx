"use client";
import Image from "next/image";
import React, { useEffect, useMemo, useRef, useState } from "react";

const PLACEHOLDER =
  "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="; // 1x1 transparent

const Gallery = ({ productMedia }: { productMedia?: string[] }) => {
  const images = useMemo(() => {
    const arr = Array.isArray(productMedia) ? productMedia.filter(Boolean) : [];
    return arr.length ? arr : [PLACEHOLDER];
  }, [productMedia]);
  const [mainImage, setMainImage] = useState(images[0]);
  // Zoom overlay state
  const [zoomOpen, setZoomOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{
    dragging: boolean;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  }>({ dragging: false, startX: 0, startY: 0, originX: 0, originY: 0 });

  const closeZoom = () => {
    setZoomOpen(false);
    setScale(1);
    setPos({ x: 0, y: 0 });
  };

  // Close on ESC
  useEffect(() => {
    if (!zoomOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeZoom();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomOpen]);
  return (
    <div className="flex flex-col md:flex-row">
      <Image
        src={mainImage}
        alt="Outfit"
        width={500}
        height={500}
        className="w-full h-full md:h-96 shadow-2xl p-4 px-7 object-contain md:border-b border-mbg-black/46 bg-mbg-rgbablank cursor-zoom-in"
        onClick={() => setZoomOpen(true)}
      />
      <div className="hidden h-full md:h-96 md:flex flex-col gap-2 overflow-auto bg-mbg-black/7 border border-mbg-black/46">
        {images.map((image, index) => (
          <Image
            key={index}
            src={image}
            alt="Outfit"
            width={50}
            height={50}
            className={`px-2 ${
              mainImage === image
                ? "border-2 border-mbg-white bg-mbg-white/46"
                : ""
            }`}
            onClick={() => setMainImage(image)}
          />
        ))}
      </div>
      <div className="flex flex-row md:hidden gap-2 overflow-auto bg-mbg-black/7 border border-mbg-black/46 ">
        {images.map((image, index) => (
          <Image
            key={index}
            src={image}
            alt="Outfit"
            width={50}
            height={50}
            className={`px-2 ${
              mainImage === image
                ? "border-2 border-mbg-white bg-mbg-white/46"
                : ""
            }`}
            onClick={() => setMainImage(image)}
          />
        ))}
      </div>
      {zoomOpen && (
        <div
          className="fixed inset-0 z-50 bg-mbg-black/80 backdrop-blur-sm flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            // Close when clicking the backdrop only
            if (e.currentTarget === e.target) closeZoom();
          }}
        >
          <div className="absolute top-4 right-4">
            <button
              type="button"
              aria-label="Close zoom"
              onClick={closeZoom}
              className="px-3 py-1 rounded-xs bg-mbg-white/90 text-mbg-black text-sm font-semibold hover:bg-mbg-white hoverEffect"
            >
              ✕
            </button>
          </div>
          <div
            className="relative max-w-[90vw] max-h-[90vh] overflow-hidden select-none cursor-grab active:cursor-grabbing bg-mbg-black/20 rounded"
            onWheel={(e) => {
              e.preventDefault();
              const delta = e.deltaY > 0 ? -0.2 : 0.2;
              setScale((s) => Math.min(5, Math.max(1, parseFloat((s + delta).toFixed(2)))));
            }}
            onMouseDown={(e) => {
              dragRef.current.dragging = true;
              dragRef.current.startX = e.clientX;
              dragRef.current.startY = e.clientY;
              dragRef.current.originX = pos.x;
              dragRef.current.originY = pos.y;
            }}
            onMouseMove={(e) => {
              if (!dragRef.current.dragging) return;
              const dx = e.clientX - dragRef.current.startX;
              const dy = e.clientY - dragRef.current.startY;
              setPos({ x: dragRef.current.originX + dx, y: dragRef.current.originY + dy });
            }}
            onMouseUp={() => {
              dragRef.current.dragging = false;
            }}
            onMouseLeave={() => {
              dragRef.current.dragging = false;
            }}
            onDoubleClick={() => {
              setScale((s) => (s > 1 ? 1 : 2));
              setPos({ x: 0, y: 0 });
            }}
          >
            <Image
              src={mainImage}
              alt="Zoomed outfit"
              width={1200}
              height={1200}
              draggable={false}
              className="pointer-events-none select-none"
              style={{
                transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
                transformOrigin: "center center",
                transition: dragRef.current.dragging ? "none" : "transform 120ms ease-out",
                maxWidth: "90vw",
                maxHeight: "90vh",
                objectFit: "contain",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
