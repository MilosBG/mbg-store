"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import {
  Activity,
  Archive,
  BookOpen,
  Check,
  ChevronRight,
  Circle,
  Compass,
  Crosshair,
  Flame,
  Gamepad2,
  Layers3,
  LockKeyhole,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { toast } from "react-hot-toast";

import { grindCopy } from "@/lib/grind/i18n";
import type {
  GrindDashboardDTO,
  GrindLanguage,
  GrindTask,
  GrindTaskKind,
} from "@/types/grind";

type Props = {
  lang: GrindLanguage;
  bookUrl: string;
  ebookUrl: string;
  playerName?: string;
};

type Screen = "TODAY" | "QUEST" | "MISSIONS" | "ARCHIVE" | "CARD" | "LORE";

const chapterOrder = ["GRIND", "RESILIENCE", "CONSISTENCY", "FOCUS", "ACHIEVE"] as const;

const emptyTask = (kind: GrindTaskKind, index: number): GrindTask => ({
  id: `${kind.toLowerCase()}-${index}`,
  label: "",
  kind,
  completed: false,
});

const defaultTasks = () => [
  emptyTask("MAIN", 1),
  emptyTask("SUPPORT", 1),
  emptyTask("SUPPORT", 2),
  emptyTask("MINIMUM", 1),
];

const formatDate = (value: string | null | undefined, lang: GrindLanguage) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const taskKindLabel = (
  kind: GrindTaskKind,
  t: (typeof grindCopy)[GrindLanguage],
) => (kind === "MAIN" ? t.main : kind === "MINIMUM" ? t.minimum : t.support);

function HudGrid() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-[0.13]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px)",
        backgroundSize: "34px 34px",
      }}
    />
  );
}

function CornerMarks() {
  return (
    <>
      <span className="pointer-events-none absolute left-2 top-2 h-4 w-4 border-l border-t border-mbg-green/70" />
      <span className="pointer-events-none absolute right-2 top-2 h-4 w-4 border-r border-t border-mbg-green/70" />
      <span className="pointer-events-none absolute bottom-2 left-2 h-4 w-4 border-b border-l border-mbg-green/70" />
      <span className="pointer-events-none absolute bottom-2 right-2 h-4 w-4 border-b border-r border-mbg-green/70" />
    </>
  );
}

function Panel({
  children,
  className = "",
  accent = false,
}: {
  children: ReactNode;
  className?: string;
  accent?: boolean;
}) {
  return (
    <section
      className={`relative overflow-hidden border bg-[#0d0f0e]/95 ${
        accent ? "border-mbg-green/70" : "border-white/15"
      } ${className}`}
    >
      <CornerMarks />
      {children}
    </section>
  );
}

export default function GrindModeClient({
  lang,
  bookUrl,
  ebookUrl,
  playerName,
}: Props) {
  const t = grindCopy[lang];
  const [data, setData] = useState<GrindDashboardDTO | null>(null);
  const [screen, setScreen] = useState<Screen>("TODAY");
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [reflection, setReflection] = useState("");
  const [saving, setSaving] = useState(false);
  const [tasks, setTasks] = useState<GrindTask[]>(defaultTasks);

  const displayName = (playerName || t.playerFallback).trim().toUpperCase();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/grind/profile", { cache: "no-store" });
      if (!res.ok) throw new Error("load");
      const payload = (await res.json()) as GrindDashboardDTO;
      setData(payload);
      if (payload.today?.tasks?.length) setTasks(payload.today.tasks);
      if (payload.today?.note) setNote(payload.today.note);
    } catch {
      toast.error(t.error);
    } finally {
      setLoading(false);
    }
  }, [t.error]);

  useEffect(() => {
    void load();
  }, [load]);

  const createCycle = async () => {
    if (!title.trim() || !reason.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/grind/cycles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, reason }),
      });
      if (!res.ok) throw new Error("create");
      setTitle("");
      setReason("");
      setTasks(defaultTasks());
      setScreen("TODAY");
      await load();
    } catch {
      toast.error(t.error);
    } finally {
      setSaving(false);
    }
  };

  const saveToday = async (forceShowedUp = false) => {
    if (!data?.activeCycle) return;
    const activeTasks = tasks.filter((task) => task.label.trim());
    if (!activeTasks.length) {
      toast.error(lang === "fr" ? "Équipe au moins une mission." : "Equip at least one mission.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/grind/check-ins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cycleId: data.activeCycle.id,
          tasks: activeTasks,
          note,
          showedUp: forceShowedUp || activeTasks.some((task) => task.completed),
        }),
      });
      if (!res.ok) throw new Error("save");
      await load();
      toast.success(forceShowedUp ? t.showedUp : t.save);
    } catch {
      toast.error(t.error);
    } finally {
      setSaving(false);
    }
  };

  const completeCycle = async () => {
    if (!data?.activeCycle || !reflection.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/grind/cycles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "complete",
          cycleId: data.activeCycle.id,
          reflection,
        }),
      });
      if (!res.ok) throw new Error("complete");
      setReflection("");
      setTasks(defaultTasks());
      setNote("");
      setScreen("ARCHIVE");
      await load();
      toast.success(t.completed);
    } catch {
      toast.error(t.error);
    } finally {
      setSaving(false);
    }
  };

  const activeTaskCount = tasks.filter((task) => task.label.trim()).length;
  const completedTaskCount = tasks.filter((task) => task.label.trim() && task.completed).length;
  const chapterIndex = data?.activeCycle
    ? Math.max(0, chapterOrder.indexOf(data.activeCycle.currentChapter))
    : 0;

  const equipPreset = (label: string, kind: GrindTaskKind = "MAIN") => {
    setTasks((current) => {
      const preferredIndex = current.findIndex((task) => task.kind === kind && !task.label.trim());
      const fallbackIndex = current.findIndex((task) => !task.label.trim());
      const targetIndex = preferredIndex >= 0 ? preferredIndex : fallbackIndex;
      if (targetIndex < 0) return current;
      return current.map((task, index) =>
        index === targetIndex ? { ...task, label, completed: false, completedAt: null } : task,
      );
    });
    setScreen("TODAY");
  };

  if (loading) {
    return (
      <div className="relative my-8 overflow-hidden border border-mbg-green/40 bg-mbg-black px-6 py-20 text-center text-white">
        <HudGrid />
        <Gamepad2 className="mx-auto h-8 w-8 animate-pulse text-mbg-green" />
        <p className="mt-4 text-xs font-black uppercase tracking-[0.25em] text-mbg-green">{t.loading}</p>
      </div>
    );
  }

  if (!data) return null;

  if (!data.profile.unlocked) {
    return (
      <div className="relative my-8 overflow-hidden border border-white/15 bg-mbg-black text-white">
        <HudGrid />
        <div className="relative grid min-h-[560px] lg:grid-cols-[1.1fr_.9fr]">
          <div className="flex flex-col justify-between border-b border-white/10 p-7 sm:p-10 lg:border-b-0 lg:border-r">
            <div>
              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.22em] text-mbg-green">
                <span>{t.eyebrow}</span>
                <span className="border border-mbg-green/60 px-2 py-1">{t.lockedHint}</span>
              </div>
              <h1 className="mt-6 text-5xl font-black uppercase tracking-[-0.05em] sm:text-7xl">
                GRIND<br />MODE
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-7 text-white/60">{t.lockedBody}</p>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-px border border-white/10 bg-white/10 sm:grid-cols-4">
              {[t.lockedFeature1, t.lockedFeature2, t.lockedFeature3, t.lockedFeature4].map((item, index) => (
                <div key={item} className="bg-[#0b0d0c] p-4">
                  <span className="text-[9px] font-black text-mbg-green">0{index + 1}</span>
                  <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.12em] text-white/60">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex flex-col items-center justify-center p-8 text-center sm:p-12">
            <div className="relative flex h-36 w-36 items-center justify-center rounded-full border border-mbg-green/35">
              <div className="absolute inset-3 rounded-full border border-dashed border-white/15" />
              <div className="absolute h-px w-full bg-mbg-green/25" />
              <div className="absolute h-full w-px bg-mbg-green/25" />
              <LockKeyhole className="h-10 w-10 text-mbg-green" />
            </div>
            <p className="mt-7 text-[10px] font-black uppercase tracking-[0.25em] text-mbg-green">{t.lockedTitle}</p>
            <Link
              href={`/?lang=${lang}`}
              className="mt-6 inline-flex min-h-12 items-center gap-3 border border-mbg-green bg-mbg-green px-7 py-3 text-xs font-black uppercase tracking-[0.16em] text-mbg-black transition hover:bg-white"
            >
              {t.lockedCta}
              <ChevronRight className="h-4 w-4" />
            </Link>
            <p className="mt-8 text-[10px] uppercase tracking-[0.18em] text-white/35">{t.noLeaderboard}</p>
          </div>
        </div>
      </div>
    );
  }

  const navItems: Array<{ id: Screen; label: string; icon: ComponentType<{ className?: string }> }> = [
    { id: "TODAY", label: t.navToday, icon: Crosshair },
    { id: "QUEST", label: t.navQuest, icon: Compass },
    { id: "MISSIONS", label: t.navMissions, icon: Layers3 },
    { id: "ARCHIVE", label: t.navArchive, icon: Archive },
    { id: "CARD", label: t.navCard, icon: ShieldCheck },
    { id: "LORE", label: t.navLore, icon: BookOpen },
  ];

  const renderNoCycle = () => (
    <Panel accent className="p-6 sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[.75fr_1.25fr]">
        <div className="flex flex-col justify-between border-b border-white/10 pb-7 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-7">
          <div>
            <div className="flex h-16 w-16 items-center justify-center border border-mbg-green/70 bg-mbg-green/10 text-mbg-green">
              <Target className="h-8 w-8" />
            </div>
            <p className="mt-6 text-[10px] font-black uppercase tracking-[0.22em] text-mbg-green">{t.questEmpty}</p>
            <h2 className="mt-2 text-3xl font-black uppercase tracking-tight text-white">{t.startCycle}</h2>
            <p className="mt-4 text-sm leading-6 text-white/55">{t.questEmptyBody}</p>
          </div>
          <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">{t.systemRule}</p>
        </div>

        <div>
          <label className="block">
            <span className="text-[9px] font-black uppercase tracking-[0.16em] text-mbg-green">01{" // "}{t.createCycleTitle}</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={t.createCyclePlaceholder}
              className="mt-2 w-full border border-white/15 bg-white/[0.04] px-4 py-4 text-sm font-semibold text-white outline-none placeholder:text-white/25 focus:border-mbg-green"
            />
          </label>
          <label className="mt-5 block">
            <span className="text-[9px] font-black uppercase tracking-[0.16em] text-mbg-green">02{" // "}{t.createCycleReason}</span>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={t.createReasonPlaceholder}
              rows={4}
              className="mt-2 w-full resize-none border border-white/15 bg-white/[0.04] px-4 py-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-mbg-green"
            />
          </label>
          <button
            type="button"
            disabled={saving || !title.trim() || !reason.trim()}
            onClick={() => void createCycle()}
            className="mt-5 flex min-h-12 w-full items-center justify-center gap-3 border border-mbg-green bg-mbg-green px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-mbg-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-35"
          >
            {t.start}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Panel>
  );

  const renderToday = () => {
    if (!data.activeCycle) return renderNoCycle();

    return (
      <div className="space-y-4">
        {data.today?.resilienceReturn && (
          <Panel accent className="p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-mbg-green bg-mbg-green/10 text-mbg-green">
                  <RotateCcw className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-mbg-green">{t.resilienceActivated}</p>
                  <h2 className="mt-1 text-xl font-black uppercase text-white">{t.missed}</h2>
                  <p className="mt-2 max-w-2xl text-sm text-white/55">{t.returnCopy}</p>
                </div>
              </div>
              <span className="border border-mbg-green/60 px-3 py-2 text-[9px] font-black uppercase tracking-[0.16em] text-mbg-green">02{" // "}RESILIENCE</span>
            </div>
          </Panel>
        )}

        <Panel accent className="p-5 sm:p-7">
          <div className="grid gap-6 lg:grid-cols-[1fr_220px]">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-mbg-green">{t.activeQuest}</span>
                <span className="border border-white/15 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white/45">{t.statusActive}</span>
              </div>
              <h2 className="mt-3 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">{data.activeCycle.title}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">{data.activeCycle.reason}</p>

              <div className="mt-7">
                <div className="mb-2 flex items-center justify-between text-[9px] font-black uppercase tracking-[0.15em]">
                  <span className="text-white/45">{t.progress}</span>
                  <span className="text-mbg-green">{data.activeCycle.progress}%</span>
                </div>
                <div className="h-2 border border-white/10 bg-black/50 p-[2px]">
                  <div className="h-full bg-mbg-green transition-all" style={{ width: `${Math.max(2, data.activeCycle.progress)}%` }} />
                </div>
              </div>
            </div>

            <div className="relative flex min-h-44 items-center justify-center border border-white/10 bg-black/25">
              <div
                className="absolute h-32 w-32 rounded-full opacity-70"
                style={{
                  background: `conic-gradient(#00821A ${Math.max(8, data.activeCycle.progress * 3.6)}deg, rgba(255,255,255,.08) 0deg)`,
                }}
              />
              <div className="absolute h-24 w-24 rounded-full bg-[#0d0f0e]" />
              <div className="relative text-center">
                <Crosshair className="mx-auto h-6 w-6 text-mbg-green" />
                <p className="mt-2 text-3xl font-black text-white">{data.activeCycle.progress}%</p>
                <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-white/35">{data.activeCycle.currentChapter}</p>
              </div>
            </div>
          </div>
        </Panel>

        <Panel className="p-5 sm:p-7">
          <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-mbg-green">{t.todayMission}</p>
              <h3 className="mt-1 text-2xl font-black uppercase text-white">{t.missionLoadout}</h3>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/35">{t.checkInStatus}</p>
              <p className="mt-1 text-sm font-black uppercase text-mbg-green">{data.today?.showedUp ? t.checkInDone : t.checkInReady}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {tasks.map((task, index) => {
              const complete = task.completed;
              return (
                <div
                  key={task.id}
                  className={`group grid gap-3 border p-4 transition sm:grid-cols-[96px_1fr_auto] sm:items-center ${
                    complete ? "border-mbg-green/60 bg-mbg-green/[0.07]" : "border-white/12 bg-white/[0.025]"
                  }`}
                >
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-[0.16em] text-white/35">SLOT 0{index + 1}</p>
                    <p className={`mt-1 text-[10px] font-black uppercase tracking-[0.14em] ${task.kind === "MAIN" ? "text-mbg-green" : "text-white/65"}`}>
                      {taskKindLabel(task.kind, t)}
                    </p>
                  </div>
                  <input
                    value={task.label}
                    onChange={(event) =>
                      setTasks((current) =>
                        current.map((item, i) => (i === index ? { ...item, label: event.target.value } : item)),
                      )
                    }
                    placeholder={lang === "fr" ? "Équipe une action concrète..." : "Equip one concrete action..."}
                    className="min-h-11 w-full border border-white/10 bg-black/20 px-3 text-sm font-semibold text-white outline-none placeholder:text-white/20 focus:border-mbg-green"
                  />
                  <button
                    type="button"
                    aria-label={complete ? t.missionComplete : t.missionOpen}
                    onClick={() =>
                      setTasks((current) =>
                        current.map((item, i) =>
                          i === index
                            ? {
                                ...item,
                                completed: !item.completed,
                                completedAt: !item.completed ? new Date().toISOString() : null,
                              }
                            : item,
                        ),
                      )
                    }
                    className={`flex min-h-11 min-w-28 items-center justify-center gap-2 border px-3 text-[9px] font-black uppercase tracking-[0.12em] transition ${
                      complete
                        ? "border-mbg-green bg-mbg-green text-mbg-black"
                        : "border-white/15 text-white/55 hover:border-mbg-green hover:text-mbg-green"
                    }`}
                  >
                    {complete ? <Check className="h-4 w-4" /> : <Circle className="h-3 w-3" />}
                    {complete ? t.missionComplete : t.missionOpen}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <label className="block min-w-0">
              <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/35">{t.note}</span>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder={t.notePlaceholder}
                rows={3}
                className="mt-2 w-full resize-none border border-white/12 bg-black/20 p-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-mbg-green"
              />
            </label>
            <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
              <button
                type="button"
                disabled={saving}
                onClick={() => void saveToday(true)}
                className="flex min-h-12 items-center justify-center gap-2 border border-mbg-green bg-mbg-green px-5 text-[10px] font-black uppercase tracking-[0.14em] text-mbg-black transition hover:bg-white disabled:opacity-40"
              >
                <Save className="h-4 w-4" />
                {t.showedUp}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void saveToday(false)}
                className="min-h-12 border border-white/15 px-5 text-[10px] font-black uppercase tracking-[0.14em] text-white/70 transition hover:border-mbg-green hover:text-mbg-green disabled:opacity-40"
              >
                {t.save}
              </button>
            </div>
          </div>
        </Panel>
      </div>
    );
  };

  const renderQuest = () => {
    if (!data.activeCycle) return renderNoCycle();

    return (
      <div className="space-y-4">
        <Panel accent className="p-5 sm:p-7">
          <div className="flex flex-col gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-mbg-green">{t.chapterPath}</p>
              <h2 className="mt-2 text-3xl font-black uppercase text-white">{data.activeCycle.title}</h2>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/35">{t.currentChapter}</p>
              <p className="mt-1 text-xl font-black uppercase text-mbg-green">0{chapterIndex + 1}{" // "}{data.activeCycle.currentChapter}</p>
            </div>
          </div>

          <div className="mt-7 grid gap-2 sm:grid-cols-5">
            {chapterOrder.map((chapter, index) => {
              const active = index === chapterIndex;
              const done = index < chapterIndex || (chapter === "ACHIEVE" && data.activeCycle?.status === "COMPLETED");
              const labels = [t.chapter01, t.chapter02, t.chapter03, t.chapter04, t.chapter05];
              return (
                <div
                  key={chapter}
                  className={`relative min-h-32 border p-4 ${
                    active
                      ? "border-mbg-green bg-mbg-green/[0.08]"
                      : done
                        ? "border-mbg-green/35 bg-white/[0.02]"
                        : "border-white/10 bg-black/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className={`text-xl font-black ${active || done ? "text-mbg-green" : "text-white/20"}`}>0{index + 1}</span>
                    {done ? <Check className="h-4 w-4 text-mbg-green" /> : active ? <Activity className="h-4 w-4 animate-pulse text-mbg-green" /> : <Circle className="h-3 w-3 text-white/20" />}
                  </div>
                  <p className={`mt-6 text-[10px] font-black uppercase tracking-[0.14em] ${active ? "text-white" : "text-white/55"}`}>{chapter}</p>
                  <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.12em] text-white/30">{labels[index]}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 border border-white/10 bg-black/20 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/35">{t.progress}</p>
              <p className="text-sm font-black text-mbg-green">{data.activeCycle.progress}%</p>
            </div>
            <div className="mt-3 h-3 border border-white/10 bg-black/50 p-[2px]">
              <div className="h-full bg-mbg-green" style={{ width: `${Math.max(2, data.activeCycle.progress)}%` }} />
            </div>
            <p className="mt-3 text-xs leading-5 text-white/45">{data.activeCycle.reason}</p>
          </div>
        </Panel>

        <Panel className="p-5 sm:p-7">
          <div className="grid gap-6 lg:grid-cols-[.7fr_1.3fr]">
            <div className="border-b border-white/10 pb-6 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
              <Trophy className="h-8 w-8 text-mbg-green" />
              <p className="mt-4 text-[10px] font-black uppercase tracking-[0.18em] text-mbg-green">{t.finalProtocol}</p>
              <p className="mt-2 text-sm leading-6 text-white/50">{t.finalProtocolBody}</p>
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-[0.15em] text-white/35">{t.reflection}</label>
              <textarea
                value={reflection}
                onChange={(event) => setReflection(event.target.value)}
                rows={5}
                className="mt-2 w-full resize-none border border-white/12 bg-black/20 p-4 text-sm text-white outline-none focus:border-mbg-green"
              />
              <button
                type="button"
                disabled={saving || !reflection.trim()}
                onClick={() => void completeCycle()}
                className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 border border-mbg-green bg-mbg-green px-5 text-[10px] font-black uppercase tracking-[0.15em] text-mbg-black transition hover:bg-white disabled:opacity-35"
              >
                <Trophy className="h-4 w-4" />
                {t.completeCycle}
              </button>
            </div>
          </div>
        </Panel>
      </div>
    );
  };

  const renderMissions = () => {
    const presets = [
      { title: t.presetThing, body: t.presetThingBody, kind: "MAIN" as GrindTaskKind, icon: Target },
      { title: t.presetSeven, body: t.presetSevenBody, kind: "SUPPORT" as GrindTaskKind, icon: Flame },
      { title: t.presetFocus, body: t.presetFocusBody, kind: "MAIN" as GrindTaskKind, icon: Crosshair },
      { title: t.presetReturn, body: t.presetReturnBody, kind: "MINIMUM" as GrindTaskKind, icon: RotateCcw },
    ];

    return (
      <Panel className="p-5 sm:p-7">
        <div className="border-b border-white/10 pb-5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-mbg-green">{t.presetTitle}</p>
          <h2 className="mt-2 text-3xl font-black uppercase text-white">{t.navMissions}</h2>
          <p className="mt-2 text-sm text-white/45">{t.presetBody}</p>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {presets.map((preset, index) => {
            const Icon = preset.icon;
            return (
              <div key={preset.title} className="group border border-white/10 bg-white/[0.025] p-5 transition hover:border-mbg-green/60">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center border border-white/10 text-mbg-green group-hover:border-mbg-green/60">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[9px] font-black text-white/20">0{index + 1}</span>
                </div>
                <h3 className="mt-6 text-lg font-black uppercase text-white">{preset.title}</h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-white/45">{preset.body}</p>
                <button
                  type="button"
                  disabled={!data.activeCycle}
                  onClick={() => equipPreset(preset.title, preset.kind)}
                  className="mt-5 flex min-h-11 w-full items-center justify-between border border-white/12 px-4 text-[9px] font-black uppercase tracking-[0.14em] text-white/65 transition hover:border-mbg-green hover:text-mbg-green disabled:cursor-not-allowed disabled:opacity-30"
                >
                  {t.equip}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      </Panel>
    );
  };

  const renderArchive = () => (
    <Panel className="p-5 sm:p-7">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-mbg-green">{t.archive}</p>
          <h2 className="mt-2 text-3xl font-black uppercase text-white">{t.navArchive}</h2>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">{data.archive.length.toString().padStart(2, "0")}{" // "}{t.statusComplete}</p>
      </div>
      <div className="mt-5 space-y-2">
        {data.archive.length ? (
          data.archive.map((cycle, index) => (
            <div key={cycle.id} className="grid gap-3 border border-white/10 bg-white/[0.02] p-4 sm:grid-cols-[56px_1fr_auto] sm:items-center">
              <div className="flex h-11 w-11 items-center justify-center border border-mbg-green/40 bg-mbg-green/[0.07] text-mbg-green">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/30">SAVE {String(index + 1).padStart(2, "0")}</p>
                <p className="mt-1 text-sm font-black uppercase text-white">{cycle.title}</p>
                <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-white/35">{formatDate(cycle.completedAt, lang)}</p>
              </div>
              <span className="border border-mbg-green/40 px-3 py-2 text-[9px] font-black uppercase tracking-[0.14em] text-mbg-green">ACHIEVE ✓</span>
            </div>
          ))
        ) : (
          <div className="border border-dashed border-white/15 p-8 text-center text-sm text-white/35">{t.noArchive}</div>
        )}
      </div>
    </Panel>
  );

  const renderCard = () => (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
      <Panel accent className="p-5 sm:p-7">
        <div className="flex flex-col justify-between gap-10 sm:min-h-[420px]">
          <div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-mbg-green">MILOS BG{" // "}{t.cardTitle}</p>
                <h2 className="mt-2 text-4xl font-black uppercase text-white">{displayName}</h2>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-mbg-green/60 bg-mbg-green/10">
                <ShieldCheck className="h-8 w-8 text-mbg-green" />
              </div>
            </div>
            <div className="mt-7 grid grid-cols-3 gap-px border border-white/10 bg-white/10">
              {[
                [t.cycles, data.profile.cyclesCompleted],
                [t.grinds, data.profile.grindsCompleted],
                [t.returns, data.profile.returns],
              ].map(([label, value]) => (
                <div key={String(label)} className="bg-[#0d0f0e] p-4 text-center">
                  <p className="text-2xl font-black text-white">{value}</p>
                  <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.13em] text-white/35">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="grid grid-cols-5 gap-2">
              {chapterOrder.map((chapter, index) => {
                const lit = index <= chapterIndex || data.profile.cyclesCompleted > 0;
                return (
                  <div key={chapter} className="text-center">
                    <div className={`mx-auto flex h-10 w-10 items-center justify-center border ${lit ? "border-mbg-green bg-mbg-green/10 text-mbg-green" : "border-white/10 text-white/20"}`}>
                      {lit ? <Check className="h-4 w-4" /> : <Circle className="h-3 w-3" />}
                    </div>
                    <p className="mt-2 hidden text-[7px] font-bold uppercase tracking-[0.08em] text-white/35 sm:block">{chapter}</p>
                  </div>
                );
              })}
            </div>
            <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">GRIND UNTIL ACHIEVE{" // "}KEEP MOVING.</p>
          </div>
        </div>
      </Panel>

      <Panel className="p-5 sm:p-7">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-mbg-green">{t.stats}</p>
        <div className="mt-5 space-y-3">
          {[
            [t.memberStatus, t.statusActive],
            [t.streak, `${data.profile.currentStreak}`],
            [t.longest, `${data.profile.longestStreak}`],
            [t.currentSave, data.activeCycle ? data.activeCycle.title : t.noCycle],
          ].map(([label, value]) => (
            <div key={String(label)} className="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
              <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/35">{label}</span>
              <span className="max-w-[60%] text-right text-[10px] font-black uppercase tracking-[0.1em] text-white">{value}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 border border-mbg-green/30 bg-mbg-green/[0.06] p-4">
          <p className="text-[9px] font-black uppercase tracking-[0.15em] text-mbg-green">SYSTEM MESSAGE</p>
          <p className="mt-2 text-sm font-bold uppercase leading-6 text-white">{t.systemRule}</p>
          <p className="mt-2 text-[10px] uppercase leading-5 text-white/35">{t.noLeaderboard}</p>
        </div>
      </Panel>
    </div>
  );

  const renderLore = () => (
    <Panel accent className="overflow-hidden">
      <div className="grid lg:grid-cols-[1.05fr_.95fr]">
        <div className="p-6 sm:p-9">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-mbg-green" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-mbg-green">{t.promoEyebrow}</p>
          </div>
          <h2 className="mt-5 max-w-xl text-4xl font-black uppercase tracking-tight text-white sm:text-5xl">{t.promoTitle}</h2>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/55">{t.promoBody}</p>
          <p className="mt-5 text-[9px] font-black uppercase tracking-[0.16em] text-white/30">{t.bookNote}</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a
              href={bookUrl}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-12 items-center justify-center gap-2 border border-mbg-green bg-mbg-green px-5 text-[10px] font-black uppercase tracking-[0.15em] text-mbg-black transition hover:bg-white"
            >
              {t.physicalBook}
              <ChevronRight className="h-4 w-4" />
            </a>
            <a
              href={ebookUrl}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-12 items-center justify-center gap-2 border border-white/15 px-5 text-[10px] font-black uppercase tracking-[0.15em] text-white transition hover:border-mbg-green hover:text-mbg-green"
            >
              {t.ebook}
              <ChevronRight className="h-4 w-4" />
            </a>
          </div>
        </div>
        <div className="relative min-h-80 border-t border-white/10 bg-black/35 p-8 lg:border-l lg:border-t-0">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at center, rgba(0,130,26,.4), transparent 55%)" }} />
          <div className="relative mx-auto flex h-full max-w-sm flex-col justify-center border border-white/10 bg-[#f4f4f0] p-7 text-mbg-black">
            <p className="text-[8px] font-black uppercase tracking-[0.22em] text-mbg-green">MILOS BG</p>
            <p className="mt-8 text-4xl font-black uppercase leading-[.9] tracking-[-0.05em]">GRIND<br />UNTIL<br />ACHIEVE</p>
            <div className="mt-8 h-px bg-mbg-black/15" />
            <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.13em] text-mbg-black/50">GRIND · RESILIENCE · CONSISTENCY · FOCUS · ACHIEVE</p>
          </div>
        </div>
      </div>
    </Panel>
  );

  const mainScreen =
    screen === "TODAY"
      ? renderToday()
      : screen === "QUEST"
        ? renderQuest()
        : screen === "MISSIONS"
          ? renderMissions()
          : screen === "ARCHIVE"
            ? renderArchive()
            : screen === "CARD"
              ? renderCard()
              : renderLore();

  const playerStats: Array<{
    label: string;
    value: number;
    Icon: ComponentType<{ className?: string }>;
  }> = [
    { label: t.cycles, value: data.profile.cyclesCompleted, Icon: Trophy },
    { label: t.grinds, value: data.profile.grindsCompleted, Icon: Crosshair },
    { label: t.returns, value: data.profile.returns, Icon: RotateCcw },
    { label: t.streak, value: data.profile.currentStreak, Icon: Flame },
    { label: t.longest, value: data.profile.longestStreak, Icon: Sparkles },
  ];

  return (
    <div className="relative my-6 overflow-hidden border border-white/15 bg-mbg-black text-white shadow-2xl shadow-black/20">
      <HudGrid />

      <header className="relative border-b border-white/10 bg-black/35 px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-mbg-green/60 bg-mbg-green/10 text-mbg-green">
              <Gamepad2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-lg font-black uppercase tracking-tight text-white">GRIND MODE</p>
                <span className="border border-mbg-green/45 px-2 py-1 text-[8px] font-black uppercase tracking-[0.13em] text-mbg-green">{t.unlockedBadge}</span>
              </div>
              <p className="mt-1 truncate text-[9px] font-bold uppercase tracking-[0.14em] text-white/35">{t.campaign}{" // "}{displayName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 border border-white/10 px-3 py-2 text-[8px] font-black uppercase tracking-[0.14em] text-white/35 sm:flex">
              <span className="h-2 w-2 animate-pulse rounded-full bg-mbg-green" />
              {t.saveData}
            </div>
            <div className="flex border border-white/15 text-[9px] font-black uppercase">
              <Link href="/grind-mode?lang=en" className={`px-3 py-2 transition ${lang === "en" ? "bg-mbg-green text-mbg-black" : "text-white/55 hover:text-white"}`}>EN</Link>
              <Link href="/grind-mode?lang=fr" className={`px-3 py-2 transition ${lang === "fr" ? "bg-mbg-green text-mbg-black" : "text-white/55 hover:text-white"}`}>FR</Link>
            </div>
          </div>
        </div>
      </header>

      <div className="relative border-b border-white/10 p-2 lg:hidden">
        <div className="flex gap-1 overflow-x-auto pb-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = screen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setScreen(item.id)}
                className={`flex min-h-11 shrink-0 items-center gap-2 border px-3 text-[8px] font-black uppercase tracking-[0.12em] transition ${active ? "border-mbg-green bg-mbg-green text-mbg-black" : "border-white/10 text-white/45"}`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative grid lg:grid-cols-[180px_minmax(0,1fr)_220px]">
        <aside className="hidden border-r border-white/10 bg-black/25 p-3 lg:block">
          <p className="px-2 py-3 text-[8px] font-black uppercase tracking-[0.18em] text-white/25">{"// MENU"}</p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = screen === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setScreen(item.id)}
                  className={`flex min-h-11 w-full items-center gap-3 border px-3 text-left text-[9px] font-black uppercase tracking-[0.12em] transition ${
                    active
                      ? "border-mbg-green bg-mbg-green text-mbg-black"
                      : "border-transparent text-white/45 hover:border-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-7 border border-white/10 bg-white/[0.02] p-4">
            <p className="text-[8px] font-black uppercase tracking-[0.16em] text-mbg-green">{t.systemRule}</p>
            <p className="mt-2 text-[9px] uppercase leading-5 text-white/30">GRIND → RESILIENCE → CONSISTENCY → FOCUS → ACHIEVE</p>
          </div>
        </aside>

        <main className="min-w-0 p-3 sm:p-5 lg:p-6">{mainScreen}</main>

        <aside className="border-t border-white/10 bg-black/25 p-4 lg:border-l lg:border-t-0">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.16em] text-mbg-green">{t.stats}</p>
              <p className="mt-1 text-lg font-black uppercase text-white">{displayName}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center border border-mbg-green/50 text-mbg-green">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {playerStats.map(({ label, value, Icon: StatIcon }) => (
              <div key={label} className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div className="flex min-w-0 items-center gap-2">
                  <StatIcon className="h-4 w-4 shrink-0 text-white/25" />
                  <span className="truncate text-[8px] font-bold uppercase tracking-[0.12em] text-white/35">{label}</span>
                </div>
                <span className="text-sm font-black text-white">{value}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 border border-white/10 p-4">
            <p className="text-[8px] font-black uppercase tracking-[0.16em] text-white/25">MISSION STATUS</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-[10px] font-black uppercase text-white/60">{data.activeCycle ? data.activeCycle.currentChapter : "STANDBY"}</span>
              <span className="h-2 w-2 animate-pulse rounded-full bg-mbg-green" />
            </div>
            <div className="mt-3 h-1.5 bg-white/10">
              <div className="h-full bg-mbg-green" style={{ width: `${data.activeCycle ? Math.max(4, data.activeCycle.progress) : 4}%` }} />
            </div>
            <div className="mt-3 flex items-center justify-between text-[8px] font-bold uppercase tracking-[0.1em] text-white/25">
              <span>{completedTaskCount}/{activeTaskCount || 0}</span>
              <span>{data.activeCycle ? `${data.activeCycle.progress}%` : "—"}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setScreen("LORE")}
            className="mt-6 flex w-full items-center justify-between border border-mbg-green/40 bg-mbg-green/[0.06] px-4 py-3 text-left transition hover:bg-mbg-green/10"
          >
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.14em] text-mbg-green">{t.promoEyebrow}</p>
              <p className="mt-1 text-[10px] font-black uppercase text-white">GRIND UNTIL ACHIEVE</p>
            </div>
            <BookOpen className="h-4 w-4 text-mbg-green" />
          </button>
        </aside>
      </div>

      <footer className="relative flex flex-col gap-2 border-t border-white/10 bg-black/30 px-4 py-3 text-[8px] font-bold uppercase tracking-[0.14em] text-white/25 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <span>GRIND MODE{" // "}MILOS BG</span>
        <span>{t.noLeaderboard}</span>
      </footer>
    </div>
  );
}
