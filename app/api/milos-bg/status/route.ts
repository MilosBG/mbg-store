import { NextResponse } from "next/server";

type StatusPayload = {
  isOnline: boolean;
  source: string | null;
  details?: unknown;
};

const STATUS_PATH_CANDIDATES = [
  "/storefront/status",
  "/store/status",
  "/status",
  "/storefront",
  "/store",
  "/maintenance/status",
  "/maintenance",
  "/v1/status",
  "/v1/store/status",
];

const CACHE_HEADERS = {
  "Cache-Control": "no-store, max-age=0, must-revalidate",
};

const STATUS_REQUEST_TIMEOUT_MS = (() => {
  const raw =
    process.env.MBG_STATUS_TIMEOUT_MS ??
    process.env.MAINTENANCE_STATUS_TIMEOUT_MS ??
    "4000";
  const parsed = Number(raw);
  if (Number.isFinite(parsed) && parsed > 0) {
    return Math.max(500, parsed);
  }
  return 4000;
})();

export async function GET() {
  const envOverride = resolveEnvOverride();
  if (envOverride !== null) {
    return NextResponse.json(
      buildPayload(envOverride, "env"),
      { headers: CACHE_HEADERS },
    );
  }

  const baseUrls = resolveBaseUrls();

  for (const base of baseUrls) {
    const candidates = buildCandidateUrls(base, STATUS_PATH_CANDIDATES);

    for (const url of candidates) {
      try {
        const res = await fetchWithTimeout(
          url,
          { cache: "no-store" },
          STATUS_REQUEST_TIMEOUT_MS,
        );

        if (res.status === 404) {
          continue;
        }

        if (!res.ok) {
          continue;
        }

        const contentType = res.headers.get("content-type")?.toLowerCase() ?? "";

        let data: unknown = null;
        if (contentType.includes("application/json")) {
          data = await res.json();
        } else if (contentType.includes("text/")) {
          const text = await res.text();
          data = parseLooseJson(text) ?? text;
        }

        const derived = deriveOnlineFlag(data);
        if (derived !== null) {
          return NextResponse.json(
            buildPayload(derived, url, data),
            { headers: CACHE_HEADERS },
          );
        }
      } catch (error) {
        if (isTimeoutError(error)) {
          console.warn(
            `Maintenance status probe timed out after ${STATUS_REQUEST_TIMEOUT_MS}ms`,
            url,
          );
        } else {
          console.error("Failed to fetch maintenance status candidate", url, error);
        }
      }
    }
  }

  return NextResponse.json(
    buildPayload(true, null),
    { headers: CACHE_HEADERS },
  );
}

function buildPayload(isOnline: boolean, source: string | null, details?: unknown): StatusPayload {
  const payload: StatusPayload = {
    isOnline,
    source,
  };

  if (details && typeof details === "object" && Object.keys(details as Record<string, unknown>).length > 0) {
    payload.details = details;
  }

  return payload;
}

function resolveBaseUrls(): string[] {
  const candidates = [
    process.env.ADMIN_BASE_URL,
    process.env.NEXT_PUBLIC_ADMIN_API,
    process.env.NEXT_PUBLIC_API_URL,
    process.env.ADMIN_API_URL,
    process.env.API_BASE_URL,
  ];

  return candidates
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));
}

function resolveEnvOverride(): boolean | null {
  const keys = [
    "MBG_STORE_ONLINE",
    "NEXT_PUBLIC_STORE_ONLINE",
    "STORE_ONLINE",
    "MBG_MAINTENANCE_MODE",
    "NEXT_PUBLIC_MAINTENANCE_MODE",
    "STORE_MAINTENANCE_MODE",
  ];

  for (const key of keys) {
    const raw = process.env[key];
    if (raw == null) continue;

    const coerced = coerceBoolean(raw);
    if (coerced !== null) {
      if (key.toLowerCase().includes("maintenance")) {
        return !coerced;
      }
      return coerced;
    }
  }

  return null;
}

function buildCandidateUrls(base: string, paths: string[]): string[] {
  const trimmed = base.replace(/\/+$/, "");
  const withApi = /\/api$/i.test(trimmed) ? trimmed : `${trimmed}/api`;
  const roots = Array.from(new Set([withApi, trimmed]));
  const urls: string[] = [];

  for (const root of roots) {
    for (const path of paths) {
      const resolvedPath = path.startsWith("/") ? path : `/${path}`;
      urls.push(`${root}${resolvedPath}`);
    }
  }

  return urls;
}

function deriveOnlineFlag(value: unknown): boolean | null {
  const direct = coerceBoolean(value);
  if (direct !== null) return direct;

  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;

  const truthyKeys = [
    "isOnline",
    "online",
    "enabled",
    "active",
    "isActive",
    "isEnabled",
    "available",
    "up",
    "status",
    "state",
    "mode",
  ];

  for (const key of truthyKeys) {
    if (!(key in record)) continue;
    const coerced = coerceBoolean(record[key]);
    if (coerced !== null) return coerced;
  }

  const nestedPaths = [
    ["storefront", "isOnline"],
    ["storefront", "online"],
    ["storefront", "status"],
    ["store", "isOnline"],
    ["store", "online"],
    ["store", "status"],
    ["data", "isOnline"],
    ["data", "status"],
  ];

  for (const path of nestedPaths) {
    const target = getNested(record, path);
    const coerced = coerceBoolean(target);
    if (coerced !== null) return coerced;
  }

  const maintenanceKeys = [
    "isMaintenance",
    "maintenance",
    "maintenanceMode",
    "maintenance_enabled",
  ];

  for (const key of maintenanceKeys) {
    if (!(key in record)) continue;
    const coerced = coerceBoolean(record[key]);
    if (coerced !== null) return !coerced;
  }

  const maintenanceNested = [
    ["storefront", "maintenance"],
    ["storefront", "maintenance", "enabled"],
    ["storefront", "maintenanceMode"],
    ["store", "maintenance"],
    ["store", "maintenance", "enabled"],
    ["store", "maintenanceMode"],
    ["data", "maintenance"],
    ["maintenance", "enabled"],
    ["maintenance", "active"],
    ["maintenance", "mode"],
  ];

  for (const path of maintenanceNested) {
    const target = getNested(record, path);
    const coerced = coerceBoolean(target);
    if (coerced !== null) return !coerced;
  }

  return null;
}

function getNested(record: Record<string, unknown>, path: string[]): unknown {
  let current: unknown = record;
  for (const segment of path) {
    if (!current || typeof current !== "object") return null;
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, { ...init, signal: controller.signal }).finally(() => {
    clearTimeout(timeoutId);
  });
}

function isTimeoutError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  if (error.name === "AbortError") return true;
  // Undici/Node timeout codes
  const code = (error as { code?: string }).code;
  return code === "UND_ERR_CONNECT_TIMEOUT" || code === "ETIMEDOUT";
}

function coerceBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return null;
    if (["true", "1", "online", "up", "enabled", "active", "yes"].includes(normalized)) {
      return true;
    }
    if (["false", "0", "offline", "down", "disabled", "maintenance", "no"].includes(normalized)) {
      return false;
    }
  }
  if (value && typeof value === "object") {
    const primitive = (value as { value?: unknown })?.value;
    if (primitive !== undefined && primitive !== value) {
      return coerceBoolean(primitive);
    }
  }
  return null;
}

function parseLooseJson(input: string): unknown | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}
