"use client";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import Container from "../mbg-components/Container";

type Consent = {
  version: number;
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
};

const STORAGE_KEY = "mbg.cookiesConsent";
const CONSENT_VERSION = 1;

function readConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    if (parsed.version !== CONSENT_VERSION) return null;
    return parsed as Consent;
  } catch {
    return null;
  }
}

function writeConsent(consent: Consent) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    // Broadcast a custom event so other parts of the app can react
    window.dispatchEvent(
      new CustomEvent("cookie-consent", { detail: consent })
    );
  } catch {}
}

export default function CookieConsent() {
  const [openBanner, setOpenBanner] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  // Determine initial state on client
  useEffect(() => {
    const stored = readConsent();
    if (!stored) {
      setOpenBanner(true);
    } else {
      setAnalytics(!!stored.analytics);
      setMarketing(!!stored.marketing);
    }
  }, []);

  const save = (next: { analytics: boolean; marketing: boolean }) => {
    const consent: Consent = {
      version: CONSENT_VERSION,
      necessary: true,
      analytics: !!next.analytics,
      marketing: !!next.marketing,
      timestamp: Date.now(),
    };
    writeConsent(consent);
  };

  const acceptAll = () => {
    setAnalytics(true);
    setMarketing(true);
    save({ analytics: true, marketing: true });
    setOpenBanner(false);
    setOpenSettings(false);
  };
  const declineAll = () => {
    setAnalytics(false);
    setMarketing(false);
    save({ analytics: false, marketing: false });
    setOpenBanner(false);
    setOpenSettings(false);
  };
  const saveSettings = () => {
    save({ analytics, marketing });
    setOpenBanner(false);
    setOpenSettings(false);
  };

  const PolicyLink = useMemo(
    () => (
      <Link
        href="/privacy-policy"
        className="underline text-mbg-green hover:opacity-80"
      >
        privacy policy
      </Link>
    ),
    []
  );

  return (
    <Container>
      {/* Floating settings button to reopen modal later */}
      <button
        type="button"
        aria-label="Cookie settings"
        onClick={() => setOpenSettings(true)}
        className="fixed bottom-4 right-4 z-40 rounded-xs bg-mbg-black/80 text-white px-3 py-2 text-[11px] uppercase tracking-widest hover:bg-mbg-black"
      >
        Cookies
      </button>

      {/* Initial consent banner */}
      {openBanner && (
        <div className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-5xl rounded-t-md border border-mbg-black/30 bg-white p-4 shadow-xl">
          <p className="text-[12px] leading-snug">
            We use cookies to personalize content, measure traffic, and improve your experience. See our {PolicyLink} for details.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              className="rounded-xs bg-mbg-green px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-white hover:opacity-90"
              onClick={acceptAll}
            >
              Accept all
            </button>
            <button
              className="rounded-xs border border-mbg-black/40 px-3 py-2 text-[11px] font-bold uppercase tracking-widest hover:bg-mbg-black/5"
              onClick={declineAll}
            >
              Decline all
            </button>
            <button
              className="rounded-xs border border-mbg-black/40 px-3 py-2 text-[11px] font-bold uppercase tracking-widest hover:bg-mbg-black/5"
              onClick={() => setOpenSettings(true)}
            >
              Cookie settings
            </button>
          </div>
        </div>
      )}

      {/* Settings modal */}
      {openSettings && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30">
          <div className="w-full max-w-lg rounded-md bg-white p-5 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-bold uppercase tracking-widest">Cookie Settings</h3>
              <button
                className="text-xs uppercase tracking-widest hover:opacity-80"
                onClick={() => setOpenSettings(false)}
              >
                Close
              </button>
            </div>

            <p className="text-[12px] mb-4">
              Manage your cookie preferences. For more information, see our {PolicyLink}.
            </p>

            <div className="space-y-3">
              <label className="flex items-start gap-3">
                <input type="checkbox" checked readOnly className="mt-1" />
                <span>
                  <span className="block text-[12px] font-bold uppercase tracking-widest">Necessary</span>
                  <span className="block text-[12px] text-mbg-black/70">Required for the site to function and cannot be disabled.</span>
                </span>
              </label>

              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                />
                <span>
                  <span className="block text-[12px] font-bold uppercase tracking-widest">Analytics</span>
                  <span className="block text-[12px] text-mbg-black/70">Helps us measure and improve site performance.</span>
                </span>
              </label>

              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                />
                <span>
                  <span className="block text-[12px] font-bold uppercase tracking-widest">Marketing</span>
                  <span className="block text-[12px] text-mbg-black/70">Used to personalize ads and offers.</span>
                </span>
              </label>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                className="rounded-xs bg-mbg-green px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-white hover:opacity-90"
                onClick={saveSettings}
              >
                Save settings
              </button>
              <button
                className="rounded-xs border border-mbg-black/40 px-3 py-2 text-[11px] font-bold uppercase tracking-widest hover:bg-mbg-black/5"
                onClick={acceptAll}
              >
                Accept all
              </button>
              <button
                className="rounded-xs border border-mbg-black/40 px-3 py-2 text-[11px] font-bold uppercase tracking-widest hover:bg-mbg-black/5"
                onClick={declineAll}
              >
                Decline all
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}

