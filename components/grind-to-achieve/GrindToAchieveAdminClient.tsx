"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Award,
  Plus,
  RefreshCw,
  Search,
  Target,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "react-hot-toast";

import { BadgeEmblem } from "@/components/grind-to-achieve/BadgeEmblems";

type Tab = "CHALLENGES" | "HUSTLERS" | "BADGES";

type Challenge = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  audience: { mode: "ALL" | "SELECTED_HUSTLERS"; clerkIds: string[] };
  priority: number;
  measurementType: "COUNT" | "DISTANCE" | "TIME_HELD" | "PAGES" | "WORDS" | "CUSTOM";
  unitLabel: string;
  targetValue: number | null;
};

type HustlerBadge = {
  id: string;
  code: string;
  name: string;
  message: string;
  source: string;
  awardedAt: string | null;
};

type Hustler = {
  clerkId: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
  directorySource: "CLERK" | "CUSTOMER" | "ACTIVITY";
  sessions: number;
  started: number;
  completionRate: number;
  lastActiveAt: string | null;
  activeShadow: {
    id: string;
    baselineLength: number;
    currentRun: number;
    targetLength: number;
  } | null;
  badges: number;
  recentBadges: HustlerBadge[];
  stats: {
    currentStreak: number;
    bestStreak: number;
    focusAverage: number;
    returnRate: number;
    shadowWinRate: number;
    returns: number;
  };
};

type Badge = {
  id: string;
  code: string;
  nameEn: string;
  nameFr: string;
  descriptionEn: string;
  descriptionFr: string;
  iconKey: string;
  assignmentMode: string;
  active: boolean;
};

type Dashboard = {
  challenges: Challenge[];
  hustlers: Hustler[];
  badges: Badge[];
};

function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-sm border border-[#BFBFBF] bg-[#FFFFFF] shadow-sm ${className}`}>
      {children}
    </section>
  );
}

function Metric({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-sm border border-[#BFBFBF] bg-[#FFFFFF] p-4">
      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#404040]">{label}</p>
      <p className="mt-2 text-2xl font-black tracking-[-0.04em] text-[#000000]">{value}</p>
      {hint ? <p className="mt-1 text-[10px] text-[#404040]">{hint}</p> : null}
    </div>
  );
}

function initials(name: string, email: string) {
  const value = name.trim() || email.trim();
  if (!value) return "H";
  const parts = value.split(/[\s@._-]+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "H";
}

function formatDate(value: string | null) {
  if (!value) return "Never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Never";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}


function AdminCollectorStyles() {
  return (
    <style>{`
      @keyframes gta-admin-card-shine {
        0% { transform: translateX(-180%) skewX(-18deg); opacity: 0; }
        16% { opacity: .48; }
        62% { opacity: .10; }
        100% { transform: translateX(220%) skewX(-18deg); opacity: 0; }
      }
      @keyframes gta-admin-card-glow {
        0%, 100% { box-shadow: 0 12px 34px rgba(0,0,0,.08), 0 0 18px rgba(0,130,26,.12), inset 0 1px 0 rgba(255,255,255,.92); }
        50% { box-shadow: 0 14px 38px rgba(0,0,0,.10), 0 0 30px rgba(0,130,26,.24), inset 0 1px 0 rgba(255,255,255,1); }
      }
      .gta-admin-collector {
        position: relative;
        overflow: hidden;
        isolation: isolate;
        transition: transform .22s ease, box-shadow .22s ease;
      }
      .gta-admin-collector:hover { transform: translateY(-3px); }
      .gta-admin-collector-earned {
        background:
          radial-gradient(circle at 18% 10%, rgba(255,255,255,.95), transparent 30%),
          radial-gradient(circle at 88% 14%, rgba(0,130,26,.12), transparent 30%),
          linear-gradient(135deg, rgba(255,255,255,.94), rgba(191,191,191,.28) 45%, rgba(255,255,255,.82) 68%, rgba(0,130,26,.08));
        animation: gta-admin-card-glow 3.2s ease-in-out infinite;
      }
      .gta-admin-collector-earned::after {
        content: "";
        position: absolute;
        inset: -30%;
        z-index: 0;
        background: linear-gradient(110deg, transparent 34%, rgba(255,255,255,.82) 49%, rgba(0,130,26,.10) 55%, transparent 68%);
        animation: gta-admin-card-shine 5.2s ease-in-out infinite;
        pointer-events: none;
      }
      .gta-admin-collector-locked {
        background: linear-gradient(145deg, #000000, #404040);
        box-shadow: 0 12px 30px rgba(0,0,0,.16);
      }
      .gta-admin-collector > * { position: relative; z-index: 1; }
      @media (prefers-reduced-motion: reduce) {
        .gta-admin-collector,
        .gta-admin-collector-earned,
        .gta-admin-collector-earned::after {
          animation: none !important;
          transition: none !important;
          transform: none !important;
        }
      }
    `}</style>
  );
}

export default function GrindToAchieveAdminClient() {
  const [tab, setTab] = useState<Tab>("CHALLENGES");
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("HUSTLE");
  const [measurementType, setMeasurementType] = useState<Challenge["measurementType"]>("COUNT");
  const [unitLabel, setUnitLabel] = useState("reps");
  const [targetValue, setTargetValue] = useState("50");
  const [audienceMode, setAudienceMode] = useState<"ALL" | "SELECTED_HUSTLERS">("ALL");
  const [challengeHustler, setChallengeHustler] = useState("");
  const [publishNow, setPublishNow] = useState(true);
  const [selectedHustler, setSelectedHustler] = useState<string>("");
  const [selectedBadge, setSelectedBadge] = useState<string>("");
  const [badgeMessage, setBadgeMessage] = useState("");
  const [deleteCandidate, setDeleteCandidate] = useState<Challenge | null>(null);

  const load = useCallback(async (initial = false) => {
    if (initial) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await fetch("/api/grind-achieve/admin/dashboard", { cache: "no-store" });
      if (!res.ok) throw new Error("LOAD_FAILED");
      const payload = (await res.json()) as Dashboard;
      setData(payload);
      setSelectedHustler((current) =>
        current && payload.hustlers.some((hustler) => hustler.clerkId === current)
          ? current
          : payload.hustlers[0]?.clerkId ?? "",
      );
      setSelectedBadge((current) =>
        current && payload.badges.some((badge) => badge.id === current)
          ? current
          : payload.badges[0]?.id ?? "",
      );
    } catch {
      toast.error("GRIND to ACHIEVE admin unavailable");
    } finally {
      if (initial) setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load(true);
  }, [load]);

  const createChallenge = async () => {
    if (!title.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/grind-achieve/admin/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          measurementType,
          unitLabel,
          targetValue: targetValue.trim() ? Number(targetValue) : null,
          status: publishNow ? "PUBLISHED" : "DRAFT",
          audienceMode,
          clerkIds: audienceMode === "SELECTED_HUSTLERS" && challengeHustler ? [challengeHustler] : [],
          priority: 0,
        }),
      });
      if (!res.ok) throw new Error("CREATE_FAILED");
      setTitle("");
      setDescription("");
      toast.success("Challenge created");
      await load();
    } catch {
      toast.error("Challenge creation failed");
    } finally {
      setBusy(false);
    }
  };

  const changeChallengeStatus = async (id: string, status: Challenge["status"]) => {
    setBusy(true);
    try {
      const res = await fetch("/api/grind-achieve/admin/challenges", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, patch: { status } }),
      });
      if (!res.ok) throw new Error("UPDATE_FAILED");
      await load();
    } catch {
      toast.error("Challenge update failed");
    } finally {
      setBusy(false);
    }
  };

  const deleteChallenge = async () => {
    if (!deleteCandidate) return;
    setBusy(true);
    try {
      const res = await fetch("/api/grind-achieve/admin/challenges", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteCandidate.id }),
      });
      if (!res.ok) throw new Error("DELETE_FAILED");
      toast.success("Challenge deleted");
      setDeleteCandidate(null);
      await load();
    } catch {
      toast.error("Challenge deletion failed");
    } finally {
      setBusy(false);
    }
  };

  const awardBadge = async () => {
    if (!selectedHustler || !selectedBadge) return;
    setBusy(true);
    try {
      const res = await fetch("/api/grind-achieve/admin/badges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerkId: selectedHustler, badgeId: selectedBadge, message: badgeMessage }),
      });
      if (!res.ok) throw new Error("AWARD_FAILED");
      const result = (await res.json()) as { duplicate?: boolean };
      toast.success(result.duplicate ? "Badge already awarded" : "Badge awarded");
      setBadgeMessage("");
      await load();
    } catch {
      toast.error("Badge award failed");
    } finally {
      setBusy(false);
    }
  };

  const filteredHustlers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data?.hustlers ?? [];
    return (data?.hustlers ?? []).filter((item) =>
      [item.clerkId, item.name, item.email, item.phone].some((value) => value.toLowerCase().includes(q)),
    );
  }, [data?.hustlers, query]);

  const selectedProfile = useMemo(
    () => data?.hustlers.find((hustler) => hustler.clerkId === selectedHustler) ?? null,
    [data?.hustlers, selectedHustler],
  );

  const summary = useMemo(() => {
    const hustlers = data?.hustlers ?? [];
    return {
      hustlers: hustlers.length,
      active: hustlers.filter((hustler) => hustler.started > 0).length,
      sessions: hustlers.reduce((sum, hustler) => sum + hustler.sessions, 0),
      badges: hustlers.reduce((sum, hustler) => sum + hustler.badges, 0),
    };
  }, [data?.hustlers]);

  if (loading || !data) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-sm border border-[#BFBFBF] bg-[#FFFFFF]">
        <RefreshCw className="h-6 w-6 animate-spin text-[#00821A]" />
      </div>
    );
  }

  return (
    <div className="space-y-5 font-kanit text-[#000000]">
      <AdminCollectorStyles />
      <Panel className="overflow-hidden">
        <div className="border-b border-[#BFBFBF] bg-[#000000] px-6 py-5 text-[#FFFFFF]">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00821A]">MILOS BG ADMIN</p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-[-0.04em] sm:text-4xl">GRIND to ACHIEVE</h1>
              <p className="mt-1 text-sm text-[#BFBFBF]">Challenges · Hustlers · Badges</p>
            </div>
            <button
              type="button"
              disabled={refreshing}
              onClick={() => void load()}
              className="inline-flex min-h-10 items-center gap-2 rounded-sm border border-[#404040] px-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#FFFFFF] disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing" : "Sync / Refresh"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 border-b border-[#BFBFBF] bg-[#FFFFFF]">
          {([
            ["CHALLENGES", "Challenges", Target],
            ["HUSTLERS", "Hustlers", Users],
            ["BADGES", "Badges", Award],
          ] as Array<[Tab, string, LucideIcon]>).map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex min-h-12 items-center justify-center gap-2 border-r border-[#BFBFBF] text-[10px] font-black uppercase tracking-[0.16em] last:border-r-0 ${
                tab === id ? "bg-[#00821A] text-[#FFFFFF]" : "bg-[#FFFFFF] text-[#404040]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </Panel>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Hustlers" value={summary.hustlers} hint="Clerk + Clients + activity" />
        <Metric label="Active" value={summary.active} hint="At least one GRIND started" />
        <Metric label="Achieved sessions" value={summary.sessions} />
        <Metric label="Badges awarded" value={summary.badges} />
      </div>

      {tab === "CHALLENGES" ? (
        <div className="grid gap-5 xl:grid-cols-[.75fr_1.25fr]">
          <Panel className="p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00821A]">NEW 5-MIN CHALLENGE</p>
            <label className="mt-5 block">
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#404040]">Title</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-2 w-full rounded-sm border border-[#BFBFBF] px-4 py-3 text-sm outline-none focus:border-[#00821A]" placeholder="NO EXCUSE 5" />
            </label>
            <label className="mt-4 block">
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#404040]">Description</span>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} className="mt-2 w-full resize-none rounded-sm border border-[#BFBFBF] px-4 py-3 text-sm outline-none focus:border-[#00821A]" />
            </label>
            <label className="mt-4 block">
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#404040]">Category</span>
              <input value={category} onChange={(e) => setCategory(e.target.value)} className="mt-2 w-full rounded-sm border border-[#BFBFBF] px-4 py-3 text-sm outline-none focus:border-[#00821A]" />
            </label>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#404040]">Measure</span>
                <select value={measurementType} onChange={(e) => setMeasurementType(e.target.value as Challenge["measurementType"])} className="mt-2 w-full rounded-sm border border-[#BFBFBF] bg-[#FFFFFF] px-3 py-3 text-sm outline-none focus:border-[#00821A]">
                  <option value="COUNT">COUNT</option>
                  <option value="DISTANCE">DISTANCE</option>
                  <option value="TIME_HELD">TIME HELD</option>
                  <option value="PAGES">PAGES</option>
                  <option value="WORDS">WORDS</option>
                  <option value="CUSTOM">CUSTOM</option>
                </select>
              </label>
              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#404040]">Unit</span>
                <input value={unitLabel} onChange={(e) => setUnitLabel(e.target.value)} className="mt-2 w-full rounded-sm border border-[#BFBFBF] px-3 py-3 text-sm outline-none focus:border-[#00821A]" placeholder="sit ups" />
              </label>
              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#404040]">Target</span>
                <input type="number" min="0" step="any" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} className="mt-2 w-full rounded-sm border border-[#BFBFBF] px-3 py-3 text-sm outline-none focus:border-[#00821A]" placeholder="50" />
              </label>
            </div>
            <label className="mt-4 block">
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#404040]">Audience</span>
              <select value={audienceMode} onChange={(e) => setAudienceMode(e.target.value as "ALL" | "SELECTED_HUSTLERS")} className="mt-2 w-full rounded-sm border border-[#BFBFBF] bg-[#FFFFFF] px-4 py-3 text-sm outline-none focus:border-[#00821A]">
                <option value="ALL">ALL HUSTLERS</option>
                <option value="SELECTED_HUSTLERS">ONE HUSTLER</option>
              </select>
            </label>
            {audienceMode === "SELECTED_HUSTLERS" ? (
              <label className="mt-4 block">
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#404040]">Hustler to challenge</span>
                <select value={challengeHustler} onChange={(e) => setChallengeHustler(e.target.value)} className="mt-2 w-full rounded-sm border border-[#00821A] bg-[#FFFFFF] px-4 py-3 text-sm outline-none">
                  <option value="">Select a Hustler</option>
                  {data.hustlers.map((hustler) => (
                    <option key={hustler.clerkId} value={hustler.clerkId}>{hustler.name || hustler.email || hustler.clerkId}</option>
                  ))}
                </select>
              </label>
            ) : null}
            <label className="mt-4 flex items-center gap-3 text-xs font-bold uppercase text-[#404040]">
              <input type="checkbox" checked={publishNow} onChange={(e) => setPublishNow(e.target.checked)} className="accent-[#00821A]" />
              Publish immediately
            </label>
            <div className="mt-4 rounded-sm border border-[#BFBFBF] bg-[#BFBFBF]/20 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#404040]">Duration</p>
              <p className="mt-1 text-2xl font-black text-[#000000]">05:00</p>
              <p className="mt-1 text-xs text-[#404040]">Locked by the game engine.</p>
            </div>
            <button type="button" disabled={busy || !title.trim() || !unitLabel.trim() || !targetValue.trim() || (audienceMode === "SELECTED_HUSTLERS" && !challengeHustler)} onClick={() => void createChallenge()} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-sm bg-[#00821A] text-xs font-black uppercase tracking-[0.16em] text-[#FFFFFF] disabled:opacity-40">
              <Plus className="h-4 w-4" />
              Create Challenge
            </button>
          </Panel>

          <Panel className="overflow-hidden">
            <div className="border-b border-[#BFBFBF] px-5 py-4">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#404040]">CHALLENGES</p>
            </div>
            <div className="divide-y divide-[#BFBFBF]">
              {data.challenges.length ? data.challenges.map((challenge) => (
                <div key={challenge.id} className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-black uppercase">{challenge.title}</h3>
                      <span className={`rounded-sm border px-2 py-1 text-[9px] font-black uppercase ${challenge.status === "PUBLISHED" ? "border-[#00821A] text-[#00821A]" : "border-[#BFBFBF] text-[#404040]"}`}>{challenge.status}</span>
                    </div>
                    <p className="mt-2 text-sm leading-5 text-[#404040]">{challenge.description}</p>
                    <p className="mt-2 text-[9px] font-black uppercase tracking-[0.15em] text-[#404040]">
                      05:00 · {challenge.category} · {challenge.measurementType} · TARGET {challenge.targetValue ?? "—"} {challenge.unitLabel} · {challenge.audience.mode}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 md:justify-end">
                    {challenge.status !== "PUBLISHED" ? (
                      <button type="button" disabled={busy} onClick={() => void changeChallengeStatus(challenge.id, "PUBLISHED")} className="min-h-10 rounded-sm bg-[#00821A] px-4 text-[9px] font-black uppercase tracking-[0.14em] text-[#FFFFFF] disabled:opacity-40">Publish</button>
                    ) : (
                      <button type="button" disabled={busy} onClick={() => void changeChallengeStatus(challenge.id, "ARCHIVED")} className="min-h-10 rounded-sm border border-[#404040] bg-[#FFFFFF] px-4 text-[9px] font-black uppercase tracking-[0.14em] text-[#404040] disabled:opacity-40">Archive</button>
                    )}
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setDeleteCandidate(challenge)}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-sm bg-[#000000] px-4 text-[9px] font-black uppercase tracking-[0.14em] text-[#FFFFFF] disabled:opacity-40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              )) : (
                <div className="p-10 text-center text-sm text-[#404040]">No challenge yet.</div>
              )}
            </div>
          </Panel>
        </div>
      ) : null}

      {tab === "HUSTLERS" ? (
        <div className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
          <Panel className="overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-[#BFBFBF] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00821A]">HUSTLERS</p>
                <p className="mt-1 text-sm text-[#404040]">Synced from Clerk, Clients and GRIND activity.</p>
              </div>
              <label className="flex min-h-11 items-center gap-2 rounded-sm border border-[#BFBFBF] px-3">
                <Search className="h-4 w-4 text-[#404040]" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, email or Clerk ID" className="w-full bg-transparent text-sm outline-none" />
              </label>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[#BFBFBF]/25 text-[9px] font-black uppercase tracking-[0.16em] text-[#404040]">
                  <tr>
                    <th className="px-5 py-3">Hustler</th>
                    <th className="px-5 py-3">Sessions</th>
                    <th className="px-5 py-3">Streak</th>
                    <th className="px-5 py-3">Focus</th>
                    <th className="px-5 py-3">Badges</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#BFBFBF]">
                  {filteredHustlers.length ? filteredHustlers.map((hustler) => {
                    const active = hustler.clerkId === selectedHustler;
                    return (
                      <tr key={hustler.clerkId} onClick={() => setSelectedHustler(hustler.clerkId)} className={`cursor-pointer transition ${active ? "bg-[#00821A]/10" : "hover:bg-[#BFBFBF]/15"}`}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#BFBFBF] bg-[#FFFFFF] text-[10px] font-black text-[#000000] shadow-[0_0_16px_rgba(0,130,26,.12)]">
                              {initials(hustler.name, hustler.email)}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-black text-[#000000]">{hustler.name || "Hustler"}</p>
                              <p className="truncate text-[10px] text-[#404040]">{hustler.email || hustler.clerkId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">{hustler.sessions}</td>
                        <td className="px-5 py-4">{hustler.stats.currentStreak} / {hustler.stats.bestStreak}</td>
                        <td className="px-5 py-4">{hustler.stats.focusAverage}%</td>
                        <td className="px-5 py-4">{hustler.badges}</td>
                      </tr>
                    );
                  }) : (
                    <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-[#404040]">No Hustler found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel className="p-5">
            {selectedProfile ? (
              <div>
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[#FFFFFF] bg-[#FFFFFF]/50 text-xl font-black text-[#000000] shadow-[0_0_26px_rgba(0,130,26,.18)] backdrop-blur-md">
                    {initials(selectedProfile.name, selectedProfile.email)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-2xl font-black uppercase tracking-[-0.03em]">{selectedProfile.name || "Hustler"}</h2>
                      <span className="rounded-sm border border-[#BFBFBF] px-2 py-1 text-[8px] font-black uppercase tracking-[0.14em] text-[#404040]">{selectedProfile.directorySource}</span>
                    </div>
                    <p className="mt-1 truncate text-sm text-[#404040]">{selectedProfile.email || "No email"}</p>
                    <p className="mt-1 truncate text-[9px] font-bold text-[#404040]">{selectedProfile.clerkId}</p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Metric label="Current / Best" value={`${selectedProfile.stats.currentStreak} / ${selectedProfile.stats.bestStreak}`} hint="Streak" />
                  <Metric label="Completion" value={`${selectedProfile.completionRate}%`} hint={`${selectedProfile.sessions}/${selectedProfile.started} sessions`} />
                  <Metric label="Focus" value={`${selectedProfile.stats.focusAverage}%`} hint="Self-check average" />
                  <Metric label="Return rate" value={`${selectedProfile.stats.returnRate}%`} hint={`${selectedProfile.stats.returns} returns`} />
                </div>

                <div className="mt-4 rounded-sm border border-[#BFBFBF] bg-[#BFBFBF]/15 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#404040]">SHADOW</p>
                      <p className="mt-1 text-sm font-black text-[#000000]">
                        {selectedProfile.activeShadow
                          ? `${selectedProfile.activeShadow.currentRun} / ${selectedProfile.activeShadow.targetLength}`
                          : "No active Shadow"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#404040]">WIN RATE</p>
                      <p className="mt-1 text-sm font-black text-[#000000]">{selectedProfile.stats.shadowWinRate}%</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#404040]">RECENT BADGES</p>
                    <span className="text-xs font-black text-[#00821A]">{selectedProfile.badges}</span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {selectedProfile.recentBadges.length ? selectedProfile.recentBadges.slice(0, 4).map((award) => (
                      <div key={award.id} className="rounded-sm border border-[#BFBFBF] bg-[#FFFFFF] p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs font-black uppercase text-[#000000]">{award.name}</p>
                          <p className="text-[9px] text-[#404040]">{formatDate(award.awardedAt)}</p>
                        </div>
                        {award.message ? <p className="mt-1 text-[10px] leading-4 text-[#404040]">{award.message}</p> : null}
                      </div>
                    )) : <p className="rounded-sm border border-dashed border-[#BFBFBF] p-4 text-center text-xs text-[#404040]">No badge yet.</p>}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setTab("BADGES")}
                  className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-sm bg-[#00821A] px-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#FFFFFF]"
                >
                  <Award className="h-4 w-4" />
                  Award a badge
                </button>
              </div>
            ) : (
              <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
                <UserRound className="h-8 w-8 text-[#404040]" />
                <p className="mt-3 text-sm font-black uppercase">Select a Hustler</p>
              </div>
            )}
          </Panel>
        </div>
      ) : null}

      {tab === "BADGES" ? (
        <div className="grid gap-5 xl:grid-cols-[.75fr_1.25fr]">
          <Panel className="p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00821A]">AWARD BADGE</p>
            <p className="mt-2 text-sm leading-6 text-[#404040]">A badge can be awarded to a synced Hustler even before their first GRIND session.</p>

            <label className="mt-5 block">
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#404040]">Hustler</span>
              <select value={selectedHustler} onChange={(e) => setSelectedHustler(e.target.value)} className="mt-2 w-full rounded-sm border border-[#BFBFBF] bg-[#FFFFFF] px-4 py-3 text-sm outline-none focus:border-[#00821A]">
                {data.hustlers.length ? data.hustlers.map((hustler) => (
                  <option key={hustler.clerkId} value={hustler.clerkId}>
                    {hustler.name || hustler.email || hustler.clerkId}{hustler.email && hustler.name ? ` — ${hustler.email}` : ""}
                  </option>
                )) : <option value="">No Hustler available</option>}
              </select>
            </label>

            {selectedProfile ? (
              <div className="mt-3 rounded-sm border border-[#BFBFBF] bg-[#BFBFBF]/15 p-3">
                <p className="text-xs font-black text-[#000000]">{selectedProfile.name || "Hustler"}</p>
                <p className="mt-1 text-[10px] text-[#404040]">{selectedProfile.sessions} ACHIEVE · {selectedProfile.badges} BADGES</p>
              </div>
            ) : null}

            <label className="mt-4 block">
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#404040]">Badge</span>
              <select value={selectedBadge} onChange={(e) => setSelectedBadge(e.target.value)} className="mt-2 w-full rounded-sm border border-[#BFBFBF] bg-[#FFFFFF] px-4 py-3 text-sm outline-none focus:border-[#00821A]">
                {data.badges.map((badge) => <option key={badge.id} value={badge.id}>{badge.nameEn}</option>)}
              </select>
            </label>

            <label className="mt-4 block">
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#404040]">Message</span>
              <textarea value={badgeMessage} onChange={(e) => setBadgeMessage(e.target.value)} rows={4} placeholder="Keep pushing. Your effort is visible." className="mt-2 w-full resize-none rounded-sm border border-[#BFBFBF] px-4 py-3 text-sm outline-none focus:border-[#00821A]" />
            </label>

            <button type="button" disabled={busy || !selectedHustler || !selectedBadge} onClick={() => void awardBadge()} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-sm bg-[#00821A] text-xs font-black uppercase tracking-[0.16em] text-[#FFFFFF] disabled:opacity-40">
              <Award className="h-4 w-4" />
              Award Badge
            </button>
          </Panel>

          <div className="grid gap-4 sm:grid-cols-2">
            {data.badges.map((badge) => {
              const selectedAward = selectedProfile?.recentBadges.find((award) => award.code === badge.code);
              const earned = Boolean(selectedAward);
              return (
                <article
                  key={badge.id}
                  className={`gta-admin-collector rounded-sm border p-5 ${
                    earned
                      ? "gta-admin-collector-earned border-[#00821A] text-[#000000]"
                      : "gta-admin-collector-locked border-[#404040] text-[#FFFFFF]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-full border backdrop-blur-md ${
                        earned
                          ? "border-[#FFFFFF]/80 bg-[#FFFFFF]/40 shadow-[0_0_26px_rgba(0,130,26,.22)]"
                          : "border-[#BFBFBF]/50 bg-[#404040] shadow-none"
                      }`}
                    >
                      <BadgeEmblem
                        code={badge.code}
                        className={`h-7 w-7 ${earned ? "text-[#000000]" : "text-[#BFBFBF]"}`}
                      />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`rounded-sm border px-2 py-1 text-[8px] font-black uppercase tracking-[0.14em] ${
                          earned
                            ? "border-[#00821A] bg-[#FFFFFF]/60 text-[#00821A]"
                            : "border-[#BFBFBF]/60 bg-[#000000] text-[#FFFFFF]"
                        }`}
                      >
                        {earned ? "EARNED" : "LOCKED"}
                      </span>
                      <span className={`text-[8px] font-black uppercase tracking-[0.12em] ${earned ? "text-[#404040]" : "text-[#BFBFBF]"}`}>
                        {badge.assignmentMode}
                      </span>
                    </div>
                  </div>
                  <h3 className={`mt-5 text-xl font-black uppercase tracking-[-0.03em] ${earned ? "text-[#000000]" : "text-[#FFFFFF]"}`}>{badge.nameEn}</h3>
                  <p className={`mt-2 min-h-[42px] text-sm leading-5 ${earned ? "text-[#404040]" : "text-[#BFBFBF]"}`}>{badge.descriptionEn}</p>
                  <div className={`mt-5 border-t pt-3 ${earned ? "border-[#BFBFBF]" : "border-[#404040]"}`}>
                    <p className={`text-[8px] font-black uppercase tracking-[0.16em] ${earned ? "text-[#00821A]" : "text-[#BFBFBF]"}`}>
                      {earned && selectedAward
                        ? `Awarded ${formatDate(selectedAward.awardedAt)}`
                        : selectedProfile
                          ? `${selectedProfile.name || "Hustler"} has not unlocked this badge`
                          : "Select a Hustler to preview collection status"}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      ) : null}

      {refreshing ? (
        <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-sm border border-[#BFBFBF] bg-[#FFFFFF]/95 px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-[#404040] shadow-lg backdrop-blur-md">
          <RefreshCw className="h-4 w-4 animate-spin text-[#00821A]" />
          Syncing Hustlers
        </div>
      ) : null}

      {deleteCandidate ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#000000]/70 p-4 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby="delete-challenge-title" className="w-full max-w-md rounded-sm border border-[#404040] bg-[#FFFFFF] p-6 shadow-[0_22px_70px_rgba(0,0,0,.35)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#00821A]">PERMANENT ACTION</p>
                <h2 id="delete-challenge-title" className="mt-2 text-2xl font-black uppercase tracking-[-0.04em] text-[#000000]">Delete challenge?</h2>
              </div>
              <button type="button" disabled={busy} onClick={() => setDeleteCandidate(null)} className="flex h-9 w-9 items-center justify-center rounded-full border border-[#BFBFBF] text-[#404040] disabled:opacity-40" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-5 rounded-sm border border-[#BFBFBF] bg-[#BFBFBF]/20 p-4">
              <p className="text-sm font-black uppercase text-[#000000]">{deleteCandidate.title}</p>
              <p className="mt-2 text-xs leading-5 text-[#404040]">This removes the challenge from the challenge collection. Historical GRIND attempts keep their saved title and result.</p>
            </div>
            <p className="mt-4 text-xs leading-5 text-[#404040]">This action cannot be undone from the admin interface.</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button type="button" disabled={busy} onClick={() => setDeleteCandidate(null)} className="min-h-11 rounded-sm border border-[#404040] bg-[#FFFFFF] px-4 text-[10px] font-black uppercase tracking-[0.15em] text-[#000000] disabled:opacity-40">Cancel</button>
              <button type="button" disabled={busy} onClick={() => void deleteChallenge()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm bg-[#000000] px-4 text-[10px] font-black uppercase tracking-[0.15em] text-[#FFFFFF] disabled:opacity-40">
                <Trash2 className="h-4 w-4" />
                {busy ? "Deleting..." : "Delete permanently"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
