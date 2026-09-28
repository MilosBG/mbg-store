"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getPublicLegalSettings,
  LEGAL_SETTINGS_FALLBACK,
  type PublicLegalSettings,
} from "@/lib/legal-settings";

export function useLegalSettings() {
  const [settings, setSettings] =
    useState<PublicLegalSettings>(
      LEGAL_SETTINGS_FALLBACK,
    );

  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);

    const next = await getPublicLegalSettings();

    setSettings(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();

    const handleFocus = () => {
      void refresh();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener(
        "focus",
        handleFocus,
      );
    };
  }, [refresh]);

  return {
    settings,
    loading,
    refresh,
  };
}
