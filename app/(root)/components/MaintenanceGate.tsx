"use client";



import { useEffect, useRef, useState } from "react";

import Image from "next/image";

import { useRouter } from "next/navigation";

import { MilosBG } from "@/images";



type MaintenanceGateProps = {

  children: React.ReactNode;

  isOnline: boolean;

  offlineHtml: string | null;

  statusPath: string;

  pollIntervalMs?: number;

  fallbackHtml?: string;

};



const DEFAULT_POLL_INTERVAL = 10000;

const SPLASH_DURATION = 3000;



export default function MaintenanceGate({

  children,

  isOnline: initialIsOnline,

  offlineHtml,

  statusPath,

  pollIntervalMs,

  fallbackHtml,

}: MaintenanceGateProps) { 

  const router = useRouter();

  const [isOnline, setIsOnline] = useState(initialIsOnline);

  const [offlineMarkup, setOfflineMarkup] = useState<string | null>(

    offlineHtml ?? fallbackHtml ?? null,

  );

  const [showSplash, setShowSplash] = useState(initialIsOnline);

  const hasShownSplashRef = useRef(false);



  useEffect(() => {
    setIsOnline(initialIsOnline);

  }, [initialIsOnline]);



  useEffect(() => {

    if (!isOnline) {

      setShowSplash(false);

      return;

    }



    if (hasShownSplashRef.current) {

      setShowSplash(false);

      return;

    }



    hasShownSplashRef.current = true;

    setShowSplash(true);

    const timer = window.setTimeout(() => {

      setShowSplash(false);

    }, SPLASH_DURATION);



    return () => window.clearTimeout(timer);

  }, [isOnline]);



  useEffect(() => {

    setOfflineMarkup(offlineHtml ?? fallbackHtml ?? null);

  }, [offlineHtml, fallbackHtml]);



  useEffect(() => {

    let isSubscribed = true;



    const poll = async () => {

      try {

        const response = await fetch(statusPath, { cache: "no-store" });



        if (!response.ok) {

          return;

        }



        const payload = await response.json();



        if (!isSubscribed) {

          return;

        }



        if (payload?.isOnline) {

          if (!isOnline) {

            setIsOnline(true);

            setOfflineMarkup(null);

            router.refresh();

          }

          return;

        }



        if (payload?.isOnline === false) {

          if (isOnline) {

            setOfflineMarkup((current) => current ?? offlineHtml ?? fallbackHtml ?? null);

            setIsOnline(false);

            router.refresh();

          }

        }

      } catch (error) {

        console.error("Failed to poll maintenance status", error);

      }

    };



    const wrappedPoll = () => {

      void poll();

    };



    const interval = window.setInterval(wrappedPoll, pollIntervalMs ?? DEFAULT_POLL_INTERVAL);



    const handleVisibility = () => {

      if (!document.hidden) {

        wrappedPoll();

      }

    };



    wrappedPoll();



    window.addEventListener("visibilitychange", handleVisibility);

    window.addEventListener("focus", wrappedPoll);



    return () => {

      isSubscribed = false;

      window.clearInterval(interval);

      window.removeEventListener("visibilitychange", handleVisibility);

      window.removeEventListener("focus", wrappedPoll);

    };

  }, [fallbackHtml, isOnline, offlineHtml, pollIntervalMs, router, statusPath]);



  if (!isOnline) {

    return (

      <div

        dangerouslySetInnerHTML={{

          __html: offlineMarkup ?? fallbackHtml ?? "",

        }}

        suppressHydrationWarning

      />

    );

  }



  return (

    <>

      {showSplash ? (

        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-mbg-black">

          <Image

            src={MilosBG}

            alt="Milos BG"

            width={200}

            height={200}

            priority

            className="splash-logo"

          />

        </div>

      ) : null}

      {children}

    </>

  );

}

