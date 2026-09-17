"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, ComponentType, ReactNode } from "react";
import {
  Award,
  BookOpen,
  Check,
  ChevronRight,
  Circle,
  Compass,
  Flame,
  Gem,
  Lock,
  Map,
  RotateCcw,
  ScrollText,
  Shield,
  Sparkles,
  Star,
  Target,
  Trophy,
} from "lucide-react";
import { toast } from "react-hot-toast";

import { grindCopy } from "@/lib/grind/i18n";
import type {
  GrindCheckInDTO,
  GrindCycleDTO,
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

type Screen = "ADVENTURE" | "MAP" | "BADGES" | "JOURNAL" | "BOOK";

type Chapter = "GRIND" | "RESILIENCE" | "CONSISTENCY" | "FOCUS" | "ACHIEVE";

type GameEventKind =
  | "QUEST_STARTED"
  | "MISSION_CLEARED"
  | "RESILIENCE"
  | "CHAPTER_UNLOCKED"
  | "MARK_UNLOCKED"
  | "CHECKPOINT"
  | "QUEST_COMPLETE";

type GameEvent = {
  id: string;
  kind: GameEventKind;
  eyebrow: string;
  title: string;
  body: string;
  duration?: number;
};

type BadgeItem = {
  id: string;
  label: string;
  requirement: string;
  earned: boolean;
  Icon: ComponentType<{ className?: string }>;
};

type ChapterMeta = {
  key: Chapter;
  number: string;
  color: string;
  bg: string;
  ring: string;
  mapTitle: string;
  shortTitle: string;
};

const chapterOrder: Chapter[] = ["GRIND", "RESILIENCE", "CONSISTENCY", "FOCUS", "ACHIEVE"];

const chapterMeta: Record<Chapter, ChapterMeta> = {
  GRIND: {
    key: "GRIND",
    number: "01",
    color: "#F59E42",
    bg: "#FFF2D8",
    ring: "rgba(245,158,66,.35)",
    mapTitle: "Start Beach",
    shortTitle: "GRIND",
  },
  RESILIENCE: {
    key: "RESILIENCE",
    number: "02",
    color: "#EF6F5E",
    bg: "#FFE6E2",
    ring: "rgba(239,111,94,.35)",
    mapTitle: "Return Bridge",
    shortTitle: "RESILIENCE",
  },
  CONSISTENCY: {
    key: "CONSISTENCY",
    number: "03",
    color: "#43C6B9",
    bg: "#E4FAF6",
    ring: "rgba(67,198,185,.35)",
    mapTitle: "Rhythm Island",
    shortTitle: "CONSISTENCY",
  },
  FOCUS: {
    key: "FOCUS",
    number: "04",
    color: "#9A6BFF",
    bg: "#EFE8FF",
    ring: "rgba(154,107,255,.35)",
    mapTitle: "Compass Cove",
    shortTitle: "FOCUS",
  },
  ACHIEVE: {
    key: "ACHIEVE",
    number: "05",
    color: "#F4C542",
    bg: "#FFF7D7",
    ring: "rgba(244,197,66,.35)",
    mapTitle: "Treasure Bay",
    shortTitle: "ACHIEVE",
  },
};

const eventId = (kind: GameEventKind) => `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const chapterRank = (chapter?: Chapter | string | null) => {
  const key = chapter as Chapter | undefined;
  return key ? Math.max(0, chapterOrder.indexOf(key)) : 0;
};

const emptyTask = (kind: GrindTaskKind, index: number): GrindTask => ({
  id: `${kind.toLowerCase()}-${index}`,
  label: "",
  kind,
  completed: false,
});

const defaultTasks = () => [emptyTask("MAIN", 1), emptyTask("SUPPORT", 1), emptyTask("SUPPORT", 2), emptyTask("MINIMUM", 1)];

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

function QuestStyles() {
  return (
    <style>{`
      @keyframes quest-float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-5px); }
      }
      @keyframes quest-pop {
        0% { opacity: 0; transform: translateY(20px) scale(.96); }
        100% { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes quest-shine {
        0% { transform: translateX(-130%); opacity: 0; }
        25% { opacity: .45; }
        100% { transform: translateX(250%); opacity: 0; }
      }
      @keyframes quest-bounce {
        0%,100% { transform: scale(1); }
        50% { transform: scale(1.03); }
      }
      .quest-shell::before {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        background:
          radial-gradient(circle at 15% 20%, rgba(255,255,255,.22), transparent 24%),
          radial-gradient(circle at 88% 14%, rgba(255,255,255,.16), transparent 18%),
          radial-gradient(circle at 14% 82%, rgba(67,198,185,.12), transparent 22%),
          radial-gradient(circle at 82% 76%, rgba(154,107,255,.12), transparent 18%);
        opacity: .9;
      }
      .quest-card::after {
        content: "";
        position: absolute;
        top: 0;
        bottom: 0;
        left: -30%;
        width: 16%;
        pointer-events: none;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,.28), transparent);
        opacity: .55;
        animation: quest-shine 8.5s ease-in-out infinite;
      }
      .quest-float { animation: quest-float 3s ease-in-out infinite; }
      .quest-bounce { animation: quest-bounce 2.2s ease-in-out infinite; }
      .quest-event { animation: quest-pop .28s ease-out both; }
      @media (prefers-reduced-motion: reduce) {
        .quest-card::after, .quest-float, .quest-bounce, .quest-event { animation: none !important; }
      }
    `}</style>
  );
}

function Card({ children, className = "", accent = false }: { children: ReactNode; className?: string; accent?: boolean }) {
  return (
    <section
      className={`quest-card relative overflow-hidden rounded-[28px] border bg-[#FFFDF9] shadow-[0_18px_45px_rgba(75,55,42,.10)] ${
        accent ? "border-[#F4C542]/70" : "border-[#E7D6BE]"
      } ${className}`}
    >
      {children}
    </section>
  );
}

function TinyStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-[#E7D6BE] bg-white/80 px-4 py-3 shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9B816D]">{label}</p>
      <p className="mt-2 text-2xl font-black text-[#4B372A]">{value}</p>
    </div>
  );
}

function EventOverlay({ event, onDismiss, skipLabel }: { event: GameEvent; onDismiss: () => void; skipLabel: string }) {
  const major = event.kind === "QUEST_STARTED" || event.kind === "CHAPTER_UNLOCKED" || event.kind === "QUEST_COMPLETE" || event.kind === "RESILIENCE";
  const Icon =
    event.kind === "QUEST_STARTED"
      ? Map
      : event.kind === "MISSION_CLEARED"
        ? Check
        : event.kind === "RESILIENCE"
          ? RotateCcw
          : event.kind === "CHAPTER_UNLOCKED"
            ? Compass
            : event.kind === "MARK_UNLOCKED"
              ? Award
              : event.kind === "QUEST_COMPLETE"
                ? Trophy
                : Sparkles;

  if (!major) {
    return (
      <div className="pointer-events-none fixed inset-x-4 bottom-5 z-[180] flex justify-end" aria-live="polite">
        <div className="quest-event pointer-events-auto w-full max-w-sm rounded-[24px] border border-[#F4C542]/75 bg-[#FFF9E8] p-4 text-[#4B372A] shadow-2xl">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F4C542] text-[#4B372A] shadow-sm">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C28A2B]">{event.eyebrow}</p>
              <p className="mt-1 text-base font-black text-[#4B372A]">{event.title}</p>
              <p className="mt-1 text-sm leading-5 text-[#6B5B4D]">{event.body}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[190] flex items-center justify-center bg-[#4B372A]/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="quest-event relative w-full max-w-2xl overflow-hidden rounded-[34px] border border-[#F4C542]/70 bg-[linear-gradient(180deg,#FFF9E7_0%,#FDEFCB_100%)] p-8 text-center text-[#4B372A] shadow-[0_25px_80px_rgba(75,55,42,.35)] sm:p-10">
        <div className="absolute -left-12 top-10 h-24 w-24 rounded-full bg-[#F59E42]/20 blur-2xl" />
        <div className="absolute -right-10 bottom-8 h-24 w-24 rounded-full bg-[#43C6B9]/25 blur-2xl" />
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-[#F4C542] text-[#4B372A] shadow-lg">
          <Icon className="h-10 w-10" />
        </div>
        <p className="mt-6 text-[11px] font-black uppercase tracking-[0.23em] text-[#C28A2B]">{event.eyebrow}</p>
        <h2 className="mt-3 text-4xl font-black uppercase tracking-[-0.04em] sm:text-6xl">{event.title}</h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#6B5B4D] sm:text-base">{event.body}</p>
        <button
          type="button"
          onClick={onDismiss}
          className="mt-8 rounded-full border border-[#D6B57C] bg-white/75 px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#7A604A] transition hover:bg-white"
        >
          {skipLabel}
        </button>
      </div>
    </div>
  );
}

function buildBadges(data: GrindDashboardDTO, t: typeof grindCopy.en): BadgeItem[] {
  const currentRank = chapterRank(data.activeCycle?.currentChapter as Chapter | undefined);
  return [
    { id: "FIRST", label: t.markFirst, requirement: t.markFirstReq, earned: data.profile.grindsCompleted >= 1, Icon: Star },
    { id: "RETURN", label: t.markReturn, requirement: t.markReturnReq, earned: data.profile.returns >= 1, Icon: RotateCcw },
    { id: "SEVEN", label: t.markSeven, requirement: t.markSevenReq, earned: data.profile.longestStreak >= 7, Icon: Flame },
    { id: "CONSISTENCY", label: t.markConsistency, requirement: t.markConsistencyReq, earned: currentRank >= 2 || data.profile.cyclesCompleted > 0, Icon: Sparkles },
    { id: "FOCUS", label: t.markFocus, requirement: t.markFocusReq, earned: currentRank >= 3 || data.profile.cyclesCompleted > 0, Icon: Compass },
    { id: "ACHIEVE", label: t.markAchieve, requirement: t.markAchieveReq, earned: data.profile.cyclesCompleted >= 1, Icon: Trophy },
    { id: "KEEP_MOVING", label: t.markKeepMoving, requirement: t.markKeepMovingReq, earned: data.profile.cyclesCompleted >= 5, Icon: Gem },
  ];
}

function taskKindLabel(kind: GrindTaskKind, t: typeof grindCopy.en) {
  return kind === "MAIN" ? t.main : kind === "MINIMUM" ? t.minimum : t.support;
}

function getNextActionLabel(primaryTask: GrindTask | undefined, t: typeof grindCopy.en) {
  if (!primaryTask?.label.trim()) return t.choosePrimary;
  if (!primaryTask.completed) return t.completePrimary;
  return t.saveProgress;
}

export default function GrindModeClient({ lang, bookUrl, ebookUrl, playerName }: Props) {
  const t = grindCopy[lang] as typeof grindCopy.en;
  const [data, setData] = useState<GrindDashboardDTO | null>(null);
  const [screen, setScreen] = useState<Screen>("ADVENTURE");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [reflection, setReflection] = useState("");
  const [tasks, setTasks] = useState<GrindTask[]>(defaultTasks);
  const [eventQueue, setEventQueue] = useState<GameEvent[]>([]);
  const [activeEvent, setActiveEvent] = useState<GameEvent | null>(null);
  const [flashTaskId, setFlashTaskId] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  const displayName = (playerName || t.playerFallback).trim().toUpperCase();

  const load = useCallback(async (silent = false): Promise<GrindDashboardDTO | null> => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/grind/profile", { cache: "no-store" });
      if (!res.ok) throw new Error("load");
      const payload = (await res.json()) as GrindDashboardDTO;
      setData(payload);
      if (payload.today?.tasks?.length) setTasks(payload.today.tasks);
      else setTasks(defaultTasks());
      setNote(payload.today?.note ?? "");
      return payload;
    } catch {
      toast.error(t.error);
      return null;
    } finally {
      if (!silent) setLoading(false);
    }
  }, [t.error]);

  useEffect(() => {
    void load(false);
  }, [load]);

  const pushEvents = useCallback((events: GameEvent[]) => {
    if (!events.length) return;
    setEventQueue((current) => [...current, ...events]);
  }, []);

  useEffect(() => {
    if (activeEvent || eventQueue.length === 0) return;
    const [first, ...rest] = eventQueue;
    setActiveEvent(first);
    setEventQueue(rest);
  }, [activeEvent, eventQueue]);

  useEffect(() => {
    if (!activeEvent) return;
    const timer = window.setTimeout(() => setActiveEvent(null), activeEvent.duration ?? 2200);
    return () => window.clearTimeout(timer);
  }, [activeEvent]);

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);

  const badges = useMemo(() => (data ? buildBadges(data, t) : []), [data, t]);

  const createCycle = async () => {
    if (!title.trim() || !reason.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/grind/cycles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), reason: reason.trim() }),
      });
      if (!res.ok) throw new Error("create");
      const created = (await res.json()) as GrindCycleDTO;
      setTitle("");
      setReason("");
      setTasks(defaultTasks());
      setScreen("ADVENTURE");
      await load(true);
      pushEvents([
        {
          id: eventId("QUEST_STARTED"),
          kind: "QUEST_STARTED",
          eyebrow: t.eventQuestStarted,
          title: created.title,
          body: t.eventQuestStartedBody,
          duration: 2600,
        },
      ]);
    } catch {
      toast.error(t.error);
    } finally {
      setSaving(false);
    }
  };

  const toggleTask = (index: number) => {
    const task = tasks[index];
    if (!task) return;
    const nextCompleted = !task.completed;
    setTasks((current) => current.map((item, i) => (i === index ? { ...item, completed: nextCompleted, completedAt: nextCompleted ? new Date().toISOString() : null } : item)));

    if (nextCompleted && task.label.trim()) {
      setFlashTaskId(task.id);
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setFlashTaskId(null), 900);
      pushEvents([
        {
          id: eventId("MISSION_CLEARED"),
          kind: "MISSION_CLEARED",
          eyebrow: t.eventMissionCleared,
          title: task.label.trim(),
          body: t.eventMissionClearedBody,
          duration: 1200,
        },
      ]);
    }
  };

  const saveToday = async (showedUp = false) => {
    if (!data?.activeCycle) return;
    const activeTasks = tasks.filter((task) => task.label.trim());
    if (!activeTasks.length) {
      toast.error(t.choosePrimary);
      return;
    }

    const previousChapter = data.activeCycle.currentChapter as Chapter | undefined;
    const previousBadges = new Set(badges.filter((item) => item.earned).map((item) => item.id));

    setSaving(true);
    try {
      const res = await fetch("/api/grind/check-ins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cycleId: data.activeCycle.id,
          tasks: activeTasks,
          note,
          showedUp: showedUp || activeTasks.some((task) => task.completed),
        }),
      });
      if (!res.ok) throw new Error("save");
      const saved = (await res.json()) as GrindCheckInDTO;
      const updated = await load(true);
      if (!updated) return;

      const events: GameEvent[] = [];
      if (saved.resilienceReturn) {
        events.push({
          id: eventId("RESILIENCE"),
          kind: "RESILIENCE",
          eyebrow: t.eventResilience,
          title: t.eventResilience,
          body: t.eventResilienceBody,
          duration: 2500,
        });
      }

      const nextChapter = updated.activeCycle?.currentChapter as Chapter | undefined;
      if (nextChapter && chapterRank(nextChapter) > chapterRank(previousChapter)) {
        events.push({
          id: eventId("CHAPTER_UNLOCKED"),
          kind: "CHAPTER_UNLOCKED",
          eyebrow: t.eventChapterUnlocked,
          title: chapterMeta[nextChapter].shortTitle,
          body: t.eventChapterUnlockedBody,
          duration: 2500,
        });
      }

      const newBadges = buildBadges(updated, t).filter((item) => item.earned && !previousBadges.has(item.id));
      for (const badge of newBadges) {
        events.push({
          id: eventId("MARK_UNLOCKED"),
          kind: "MARK_UNLOCKED",
          eyebrow: t.eventMarkUnlocked,
          title: badge.label,
          body: t.eventMarkUnlockedBody,
          duration: 1700,
        });
      }

      if (!events.length) {
        events.push({
          id: eventId("CHECKPOINT"),
          kind: "CHECKPOINT",
          eyebrow: t.eventCheckpoint,
          title: t.eventCheckpoint,
          body: t.eventCheckpointBody,
          duration: 1400,
        });
      }

      pushEvents(events);
    } catch {
      toast.error(t.error);
    } finally {
      setSaving(false);
    }
  };

  const completeCycle = async () => {
    if (!data?.activeCycle || !reflection.trim()) return;
    const questTitle = data.activeCycle.title;
    setSaving(true);
    try {
      const res = await fetch("/api/grind/cycles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete", cycleId: data.activeCycle.id, reflection }),
      });
      if (!res.ok) throw new Error("complete");
      await res.json();
      setReflection("");
      setTasks(defaultTasks());
      setNote("");
      setScreen("JOURNAL");
      await load(true);
      pushEvents([
        {
          id: eventId("QUEST_COMPLETE"),
          kind: "QUEST_COMPLETE",
          eyebrow: t.eventQuestComplete,
          title: questTitle,
          body: t.eventQuestCompleteBody,
          duration: 3200,
        },
      ]);
    } catch {
      toast.error(t.error);
    } finally {
      setSaving(false);
    }
  };

  const equipPreset = (label: string, kind: GrindTaskKind = "MAIN") => {
    setTasks((current) => {
      const preferredIndex = current.findIndex((task) => task.kind === kind && !task.label.trim());
      const fallbackIndex = current.findIndex((task) => !task.label.trim());
      const targetIndex = preferredIndex >= 0 ? preferredIndex : fallbackIndex;
      if (targetIndex < 0) return current;
      return current.map((item, index) => (index === targetIndex ? { ...item, label, completed: false, completedAt: null } : item));
    });
    setScreen("ADVENTURE");
  };

  if (loading) {
    return (
      <div className="relative my-8 overflow-hidden rounded-[30px] border border-[#E7D6BE] bg-[#FFF8E8] px-6 py-20 text-center text-[#4B372A] shadow-lg">
        <QuestStyles />
        <div className="quest-float mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F4C542] text-[#4B372A] shadow-lg">
          <Map className="h-8 w-8" />
        </div>
        <p className="mt-5 text-xs font-black uppercase tracking-[0.24em] text-[#C28A2B]">{t.loading}</p>
      </div>
    );
  }

  if (!data) return null;

  if (!data.profile.unlocked) {
    return (
      <div className="quest-shell relative my-8 overflow-hidden rounded-[34px] border border-[#E7D6BE] bg-[linear-gradient(180deg,#F6E7C9_0%,#FCEFD7_100%)] p-6 text-[#4B372A] shadow-[0_20px_60px_rgba(75,55,42,.12)] sm:p-8 lg:p-10">
        <QuestStyles />
        <div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#C28A2B] shadow-sm">
              <Lock className="h-4 w-4" />
              {t.lockedHint}
            </div>
            <h1 className="mt-6 text-4xl font-black uppercase tracking-[-0.04em] sm:text-6xl">{t.lockedTitle}</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#6B5B4D]">{t.lockedBody}</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[t.lockedFeature1, t.lockedFeature2, t.lockedFeature3, t.lockedFeature4].map((item) => (
                <div key={item} className="rounded-2xl border border-[#E7D6BE] bg-white/72 px-4 py-4 text-sm font-bold text-[#4B372A] shadow-sm">
                  {item}
                </div>
              ))}
            </div>
            <Link
              href={`/?lang=${lang}`}
              className="mt-8 inline-flex min-h-12 items-center gap-3 rounded-full bg-[#F4C542] px-6 py-3 text-xs font-black uppercase tracking-[0.15em] text-[#4B372A] shadow-lg transition hover:translate-y-[-1px]"
            >
              {t.lockedCta}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex items-center justify-center">
            <div className="quest-float relative flex h-[300px] w-full max-w-[360px] items-center justify-center rounded-[30px] border border-[#E7D6BE] bg-[linear-gradient(180deg,#BFE7F4_0%,#FFF4DE_100%)] shadow-lg">
              <div className="absolute inset-5 rounded-[24px] border-2 border-dashed border-[#D6B57C]" />
              <div className="absolute -top-5 left-8 rounded-full bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#9B816D] shadow-sm">{t.title}</div>
              <div className="text-center">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#F4C542] text-[#4B372A] shadow-lg">
                  <Map className="h-10 w-10" />
                </div>
                <p className="mt-5 text-lg font-black uppercase">GRIND QUEST</p>
                <p className="mt-2 text-sm text-[#6B5B4D]">{t.subtitle}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const navItems: Array<{ id: Screen; label: string; icon: ComponentType<{ className?: string }> }> = [
    { id: "ADVENTURE", label: t.navAdventure, icon: Map },
    { id: "MAP", label: t.navMap, icon: Compass },
    { id: "BADGES", label: t.navBadges, icon: Award },
    { id: "JOURNAL", label: t.navJournal, icon: ScrollText },
    { id: "BOOK", label: t.navBook, icon: BookOpen },
  ];

  const activeChapter = (data.activeCycle?.currentChapter as Chapter | undefined) ?? "GRIND";
  const activeMeta = chapterMeta[activeChapter];
  const activeIndex = chapterRank(activeChapter);
  const nextChapter = chapterOrder[Math.min(activeIndex + 1, chapterOrder.length - 1)];
  const nextMeta = chapterMeta[nextChapter];
  const archive = data.archive ?? [];
  const mainEntry = tasks.map((task, index) => ({ task, index })).find(({ task }) => task.kind === "MAIN");
  const bonusEntries = tasks.map((task, index) => ({ task, index })).filter(({ task }) => task.kind === "SUPPORT");
  const fallbackEntry = tasks.map((task, index) => ({ task, index })).find(({ task }) => task.kind === "MINIMUM");
  const filledTasks = tasks.filter((task) => task.label.trim());
  const completedTasks = tasks.filter((task) => task.label.trim() && task.completed).length;
  const earnedBadges = badges.filter((badge) => badge.earned).length;

  const primaryAction = () => {
    if (!mainEntry?.task.label.trim()) {
      setScreen("BADGES");
      return;
    }
    if (!mainEntry.task.completed) {
      toggleTask(mainEntry.index);
      return;
    }
    void saveToday(true);
  };

  const renderCreateQuest = () => (
    <Card accent className="p-6 sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[.95fr_1.05fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF6DA] px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#C28A2B] shadow-sm">
            <Map className="h-4 w-4" />
            {t.questEmpty}
          </div>
          <h2 className="mt-5 text-3xl font-black uppercase tracking-[-0.03em] text-[#4B372A] sm:text-5xl">{t.createQuestTitle}</h2>
          <p className="mt-4 max-w-lg text-base leading-7 text-[#6B5B4D]">{t.createQuestBody}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {chapterOrder.map((chapter) => (
              <div key={chapter} className="rounded-2xl px-4 py-3 text-sm font-black text-[#4B372A] shadow-sm" style={{ background: chapterMeta[chapter].bg }}>
                {chapterMeta[chapter].shortTitle}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[28px] border border-[#E7D6BE] bg-white/80 p-5 shadow-sm">
          <label className="block">
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9B816D]">{t.createQuestTitle}</span>
            <input
              value={title}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setTitle(event.target.value)}
              placeholder={t.createQuestPlaceholder}
              className="mt-3 w-full rounded-2xl border border-[#E7D6BE] bg-[#FFFDF9] px-4 py-4 text-sm font-semibold text-[#4B372A] outline-none placeholder:text-[#B39B8A] focus:border-[#F4C542]"
            />
          </label>
          <label className="mt-4 block">
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9B816D]">{t.createReasonLabel}</span>
            <textarea
              value={reason}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setReason(event.target.value)}
              rows={4}
              placeholder={t.createReasonPlaceholder}
              className="mt-3 w-full resize-none rounded-2xl border border-[#E7D6BE] bg-[#FFFDF9] px-4 py-4 text-sm text-[#4B372A] outline-none placeholder:text-[#B39B8A] focus:border-[#F4C542]"
            />
          </label>
          <button
            type="button"
            disabled={saving || !title.trim() || !reason.trim()}
            onClick={() => void createCycle()}
            className="mt-5 flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-[#F4C542] px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-[#4B372A] shadow-lg transition hover:translate-y-[-1px] disabled:opacity-40"
          >
            {t.startQuest}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Card>
  );

  const renderMapRibbon = () => (
    <div className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
      <Card accent className="p-6 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#C28A2B]">{t.activeQuest}</p>
            <h2 className="mt-2 text-3xl font-black uppercase tracking-[-0.03em] text-[#4B372A] sm:text-5xl">{data.activeCycle?.title}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6B5B4D]">{data.activeCycle?.reason}</p>
          </div>
          <div className="rounded-[24px] px-5 py-4 shadow-sm" style={{ background: activeMeta.bg }}>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9B816D]">{t.currentZone}</p>
            <p className="mt-2 text-xl font-black uppercase" style={{ color: activeMeta.color }}>{activeMeta.shortTitle}</p>
            <p className="mt-1 text-sm text-[#6B5B4D]">{activeMeta.mapTitle}</p>
          </div>
        </div>

        <div className="mt-7 overflow-hidden rounded-[26px] border border-[#E7D6BE] bg-[linear-gradient(180deg,#BFE7F4_0%,#F2DFC2_100%)] p-5">
          <div className="flex items-center justify-between gap-4">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7C6653]">{t.mapTitle}</p>
            <p className="text-sm font-black text-[#4B372A]">{data.activeCycle?.progress}%</p>
          </div>

          <div className="mt-6 grid grid-cols-5 gap-3 md:gap-5">
            {chapterOrder.map((chapter, index) => {
              const meta = chapterMeta[chapter];
              const done = index < activeIndex;
              const active = index === activeIndex;
              const locked = index > activeIndex;
              const status = active ? t.chapterActive : done ? t.chapterUnlocked : t.chapterLocked;
              return (
                <div key={chapter} className="relative text-center">
                  {index < chapterOrder.length - 1 ? <div className="absolute left-[60%] top-8 h-[6px] w-[80%] rounded-full bg-[#E7D6BE]" /> : null}
                  <div
                    className={`relative mx-auto flex h-16 w-16 items-center justify-center rounded-full border-4 bg-white shadow-md ${active ? "quest-bounce" : ""}`}
                    style={{ borderColor: done || active ? meta.color : "#D6C6AF", color: done || active ? meta.color : "#B6A999" }}
                  >
                    {done ? <Check className="h-6 w-6" /> : active ? <Compass className="h-6 w-6" /> : <Lock className="h-5 w-5" />}
                  </div>
                  <p className="mt-3 text-[10px] font-black uppercase tracking-[0.14em] text-[#9B816D]">{meta.number}</p>
                  <p className="mt-1 text-[11px] font-black uppercase text-[#4B372A]">{meta.shortTitle}</p>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.12em]" style={{ color: done || active ? meta.color : "#A89684" }}>{status}</p>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9B816D]">{t.nextUnlock}</p>
              <p className="mt-2 text-2xl font-black uppercase" style={{ color: nextMeta.color }}>{nextMeta.shortTitle}</p>
              <p className="mt-1 text-sm text-[#6B5B4D]">{nextMeta.mapTitle}</p>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF6DA] text-[#C28A2B] shadow-sm">
              <Star className="h-8 w-8" />
            </div>
          </div>
          <div className="mt-5 h-4 overflow-hidden rounded-full bg-[#EFD9B4] p-[2px]">
            <div className="h-full rounded-full bg-[linear-gradient(90deg,#F59E42,#F4C542)]" style={{ width: `${Math.max(6, data.activeCycle?.progress ?? 0)}%` }} />
          </div>
          <p className="mt-3 text-sm text-[#6B5B4D]">{t.stepReady}</p>
        </Card>

        <Card className="p-5 sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9B816D]">{t.statsTitle}</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <TinyStat label={t.quests} value={data.profile.cyclesCompleted + (data.activeCycle ? 1 : 0)} />
            <TinyStat label={t.grinds} value={data.profile.grindsCompleted} />
            <TinyStat label={t.returns} value={data.profile.returns} />
            <TinyStat label={t.streak} value={data.profile.currentStreak} />
          </div>
        </Card>
      </div>
    </div>
  );

  const renderAdventure = () => {
    if (!data.activeCycle) return renderCreateQuest();

    const mainActionLabel = getNextActionLabel(mainEntry?.task, t);

    return (
      <div className="space-y-5">
        {renderMapRibbon()}

        <div className="grid gap-5 xl:grid-cols-[1.3fr_.7fr]">
          <div className="space-y-5">
            <Card accent className="p-6 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#C28A2B]">{t.nextStep}</p>
                  <h3 className="mt-2 text-3xl font-black uppercase tracking-[-0.03em] text-[#4B372A] sm:text-4xl">{mainEntry?.task.label.trim() || t.choosePrimary}</h3>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-[#6B5B4D]">{mainEntry?.task.completed ? t.stepSaved : t.stepReady}</p>
                </div>
                <div className="rounded-[22px] px-5 py-4 shadow-sm" style={{ background: activeMeta.bg }}>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9B816D]">{t.progress}</p>
                  <p className="mt-1 text-3xl font-black" style={{ color: activeMeta.color }}>{data.activeCycle.progress}%</p>
                </div>
              </div>

              <div className="mt-6 rounded-[26px] border border-[#E7D6BE] bg-white/75 p-5 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full shadow-sm" style={{ background: activeMeta.color, color: "#fff" }}>
                      <Target className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9B816D]">{t.primaryClue}</p>
                      <p className="mt-1 text-xl font-black uppercase text-[#4B372A]">{mainEntry?.task.label.trim() || t.choosePrimary}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={primaryAction}
                    disabled={saving}
                    className="min-h-14 rounded-full bg-[linear-gradient(90deg,#F59E42,#F4C542)] px-6 text-sm font-black uppercase tracking-[0.12em] text-[#4B372A] shadow-lg transition hover:translate-y-[-1px] disabled:opacity-50"
                  >
                    {mainActionLabel}
                  </button>
                </div>
              </div>
            </Card>

            <Card className="p-6 sm:p-7">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-black uppercase text-[#4B372A]">{t.bonusClues}</h3>
                <span className="rounded-full bg-[#FFF6DA] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#C28A2B]">{t.optional}</span>
              </div>
              <div className="mt-4 space-y-3">
                {bonusEntries.map(({ task, index }) => (
                  <div
                    key={task.id}
                    className={`rounded-[22px] border bg-white/70 p-4 shadow-sm transition ${flashTaskId === task.id ? "border-[#43C6B9]" : "border-[#E7D6BE]"}`}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9B816D]">{t.support}</p>
                        <input
                          value={task.label}
                          onChange={(event: ChangeEvent<HTMLInputElement>) =>
                            setTasks((current) => current.map((item, i) => (i === index ? { ...item, label: event.target.value } : item)))
                          }
                          placeholder={index === 1 ? t.presetThing : t.presetSeven}
                          className="mt-2 w-full border-0 bg-transparent p-0 text-base font-black uppercase text-[#4B372A] outline-none placeholder:text-[#B39B8A]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleTask(index)}
                        className={`min-h-11 rounded-full px-5 text-[11px] font-black uppercase tracking-[0.14em] transition ${task.completed ? "bg-[#43C6B9] text-white" : "bg-[#F0F6F5] text-[#2A736B] hover:bg-[#E4FAF6]"}`}
                      >
                        {task.completed ? t.todayComplete : t.showedUp}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 sm:p-7">
              <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
                <label className="block">
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9B816D]">{t.journalPrompt}</span>
                  <textarea
                    value={note}
                    onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setNote(event.target.value)}
                    rows={4}
                    placeholder={t.notePlaceholder}
                    className="mt-3 w-full resize-none rounded-[24px] border border-[#E7D6BE] bg-white/75 px-4 py-4 text-sm text-[#4B372A] outline-none placeholder:text-[#B39B8A] focus:border-[#F4C542]"
                  />
                </label>
                <button
                  type="button"
                  disabled={saving || filledTasks.length === 0}
                  onClick={() => void saveToday(true)}
                  className="min-h-12 rounded-full bg-[#43C6B9] px-6 text-[11px] font-black uppercase tracking-[0.16em] text-white shadow-lg transition hover:translate-y-[-1px] disabled:opacity-50"
                >
                  {t.saveProgress}
                </button>
              </div>
            </Card>
          </div>

          <div className="space-y-5">
            <Card className="p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFE6E2] text-[#EF6F5E] shadow-sm">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9B816D]">{t.fallbackClue}</p>
                  <p className="mt-1 text-sm text-[#6B5B4D]">{t.fallbackHint}</p>
                </div>
              </div>
              {fallbackEntry ? (
                <>
                  <input
                    value={fallbackEntry.task.label}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setTasks((current) => current.map((item, i) => (i === fallbackEntry.index ? { ...item, label: event.target.value } : item)))
                    }
                    placeholder={t.fallbackClue}
                    className="mt-4 w-full rounded-2xl border border-[#E7D6BE] bg-white/70 px-4 py-4 text-sm font-bold text-[#4B372A] outline-none placeholder:text-[#B39B8A]"
                  />
                  <button
                    type="button"
                    onClick={() => toggleTask(fallbackEntry.index)}
                    className={`mt-4 min-h-11 w-full rounded-full text-[11px] font-black uppercase tracking-[0.14em] transition ${fallbackEntry.task.completed ? "bg-[#EF6F5E] text-white" : "bg-[#FFF0EC] text-[#C85A4A] hover:bg-[#FFE6E2]"}`}
                  >
                    {fallbackEntry.task.completed ? t.todayComplete : t.showedUp}
                  </button>
                </>
              ) : null}
            </Card>

            <Card className="p-5 sm:p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9B816D]">{t.equipLibrary}</p>
              <div className="mt-4 space-y-3">
                {[
                  { label: t.presetThing, body: t.presetThingBody, kind: "MAIN" as GrindTaskKind, color: "#F59E42" },
                  { label: t.presetSeven, body: t.presetSevenBody, kind: "SUPPORT" as GrindTaskKind, color: "#43C6B9" },
                  { label: t.presetFocus, body: t.presetFocusBody, kind: "MAIN" as GrindTaskKind, color: "#9A6BFF" },
                  { label: t.presetReturn, body: t.presetReturnBody, kind: "MINIMUM" as GrindTaskKind, color: "#EF6F5E" },
                ].map((preset) => (
                  <div key={preset.label} className="rounded-[22px] border border-[#E7D6BE] bg-white/70 p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-black uppercase" style={{ color: preset.color }}>{preset.label}</p>
                        <p className="mt-1 text-sm leading-5 text-[#6B5B4D]">{preset.body}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => equipPreset(preset.label, preset.kind)}
                        className="rounded-full bg-[#FFF6DA] px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#C28A2B] shadow-sm transition hover:bg-[#FDEFCB]"
                      >
                        {t.equip}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  const renderMap = () => {
    if (!data.activeCycle) return renderCreateQuest();
    return (
      <div className="space-y-5">
        <Card accent className="p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#C28A2B]">{t.mapTitle}</p>
              <h2 className="mt-2 text-3xl font-black uppercase tracking-[-0.03em] text-[#4B372A] sm:text-5xl">{data.activeCycle.title}</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#6B5B4D]">{t.mapBody}</p>
            </div>
            <div className="rounded-[24px] border border-[#E7D6BE] bg-white/75 px-5 py-4 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9B816D]">{t.progress}</p>
              <p className="mt-2 text-3xl font-black text-[#4B372A]">{data.activeCycle.progress}%</p>
            </div>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-5">
            {chapterOrder.map((chapter, index) => {
              const meta = chapterMeta[chapter];
              const state = index < activeIndex ? "done" : index === activeIndex ? "active" : "locked";
              return (
                <div key={chapter} className="rounded-[28px] border border-[#E7D6BE] bg-white/80 p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 bg-white shadow-sm" style={{ borderColor: meta.color, color: meta.color }}>
                      {state === "done" ? <Check className="h-5 w-5" /> : state === "active" ? <Compass className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
                    </div>
                    <span className="text-lg font-black" style={{ color: meta.color }}>{meta.number}</span>
                  </div>
                  <p className="mt-4 text-sm font-black uppercase text-[#4B372A]">{meta.shortTitle}</p>
                  <p className="mt-1 text-xs leading-5 text-[#6B5B4D]">
                    {chapter === "GRIND"
                      ? t.chapter01
                      : chapter === "RESILIENCE"
                        ? t.chapter02
                        : chapter === "CONSISTENCY"
                          ? t.chapter03
                          : chapter === "FOCUS"
                            ? t.chapter04
                            : t.chapter05}
                  </p>
                  <div className="mt-4 rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-center" style={{ background: meta.bg, color: meta.color }}>
                    {state === "done" ? t.chapterUnlocked : state === "active" ? t.chapterActive : t.chapterLocked}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6 sm:p-7">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9B816D]">{t.completeQuest}</p>
          <label className="mt-4 block">
            <span className="text-sm font-bold text-[#6B5B4D]">{t.reflection}</span>
            <textarea
              value={reflection}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setReflection(event.target.value)}
              rows={5}
              className="mt-3 w-full resize-none rounded-[24px] border border-[#E7D6BE] bg-white/80 px-4 py-4 text-sm text-[#4B372A] outline-none focus:border-[#F4C542]"
            />
          </label>
          <button
            type="button"
            disabled={saving || !reflection.trim()}
            onClick={() => void completeCycle()}
            className="mt-5 inline-flex min-h-12 items-center gap-3 rounded-full bg-[#F4C542] px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-[#4B372A] shadow-lg disabled:opacity-50"
          >
            <Trophy className="h-4 w-4" />
            {t.completeQuest}
          </button>
          <p className="mt-3 text-sm text-[#6B5B4D]">{t.completeQuestHint}</p>
        </Card>
      </div>
    );
  };

  const renderBadges = () => (
    <div className="space-y-5">
      <Card accent className="p-6 sm:p-8">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#C28A2B]">{t.badgesTitle}</p>
        <h2 className="mt-2 text-3xl font-black uppercase tracking-[-0.03em] text-[#4B372A] sm:text-5xl">{earnedBadges} / {badges.length}</h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[#6B5B4D]">{t.badgesBody}</p>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {badges.map((badge) => (
          <Card key={badge.id} className={`p-5 ${badge.earned ? "border-[#F4C542]" : ""}`}>
            <div className="flex items-start justify-between gap-4">
              <div className={`flex h-14 w-14 items-center justify-center rounded-full shadow-sm ${badge.earned ? "bg-[#F4C542] text-[#4B372A]" : "bg-[#F2E9DA] text-[#B39B8A]"}`}>
                <badge.Icon className="h-7 w-7" />
              </div>
              <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${badge.earned ? "bg-[#FFF6DA] text-[#C28A2B]" : "bg-[#F3EEE6] text-[#A89684]"}`}>
                {badge.earned ? t.earnedMark : t.lockedMark}
              </span>
            </div>
            <p className="mt-4 text-lg font-black uppercase text-[#4B372A]">{badge.label}</p>
            <p className="mt-2 text-sm leading-6 text-[#6B5B4D]">{badge.requirement}</p>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderJournal = () => (
    <div className="space-y-5">
      <Card accent className="p-6 sm:p-8">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#C28A2B]">{t.archiveTitle}</p>
        <h2 className="mt-2 text-3xl font-black uppercase tracking-[-0.03em] text-[#4B372A] sm:text-5xl">{archive.length}</h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[#6B5B4D]">{t.archiveBody}</p>
      </Card>
      {archive.length ? (
        <div className="space-y-4">
          {archive.map((cycle) => (
            <Card key={cycle.id} className="p-5 sm:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9B816D]">{t.activeQuest}</p>
                  <h3 className="mt-1 text-2xl font-black uppercase text-[#4B372A]">{cycle.title}</h3>
                  <p className="mt-2 text-sm text-[#6B5B4D]">{cycle.reason}</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 md:text-right">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9B816D]">START</p>
                    <p className="mt-1 text-sm font-bold text-[#4B372A]">{formatDate(cycle.startedAt, lang)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9B816D]">END</p>
                    <p className="mt-1 text-sm font-bold text-[#4B372A]">{formatDate(cycle.completedAt, lang)}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-6 text-sm text-[#6B5B4D]">{t.noArchive}</Card>
      )}
    </div>
  );

  const renderBook = () => (
    <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
      <Card accent className="p-6 sm:p-8">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#C28A2B]">{t.bookEyebrow}</p>
        <h2 className="mt-2 text-3xl font-black uppercase tracking-[-0.03em] text-[#4B372A] sm:text-5xl">{t.bookTitle}</h2>
        <p className="mt-4 max-w-xl text-base leading-7 text-[#6B5B4D]">{t.bookBody}</p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link href={bookUrl} className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#F4C542] px-6 text-xs font-black uppercase tracking-[0.15em] text-[#4B372A] shadow-lg transition hover:translate-y-[-1px]">
            {t.physicalBook}
          </Link>
          <Link href={ebookUrl} className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#E7D6BE] bg-white/80 px-6 text-xs font-black uppercase tracking-[0.15em] text-[#4B372A] shadow-sm transition hover:bg-white">
            {t.ebook}
          </Link>
        </div>
      </Card>
      <Card className="flex items-center justify-center p-6 sm:p-8">
        <div className="quest-float w-full max-w-sm rounded-[28px] border border-[#E7D6BE] bg-[linear-gradient(180deg,#FFF9E7_0%,#FDEFCB_100%)] p-6 text-center shadow-lg">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#F4C542] text-[#4B372A] shadow-lg">
            <BookOpen className="h-9 w-9" />
          </div>
          <p className="mt-5 text-2xl font-black uppercase tracking-[-0.03em] text-[#4B372A]">{t.bookTitle}</p>
          <p className="mt-3 text-sm leading-6 text-[#6B5B4D]">{t.subtitle}</p>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="quest-shell relative my-8 overflow-hidden rounded-[34px] border border-[#E7D6BE] bg-[linear-gradient(180deg,#F6E7C9_0%,#F2DFC2_35%,#BFE7F4_100%)] text-[#4B372A] shadow-[0_25px_70px_rgba(75,55,42,.12)]">
      <QuestStyles />
      {activeEvent ? <EventOverlay event={activeEvent} onDismiss={() => setActiveEvent(null)} skipLabel={t.skipEvent} /> : null}

      <div className="relative z-[1] border-b border-[#E7D6BE] bg-white/55 px-5 py-5 backdrop-blur-sm sm:px-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F4C542] text-[#4B372A] shadow-md">
              <Map className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black uppercase tracking-[-0.04em] text-[#4B372A] sm:text-3xl">{t.title}</h1>
                <span className="rounded-full bg-[#FFF6DA] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#C28A2B] shadow-sm">{t.unlockedBadge}</span>
              </div>
              <p className="mt-1 text-sm text-[#6B5B4D]">{t.subtitle}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-[#E7D6BE] bg-white/80 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#9B816D] shadow-sm">{displayName}</div>
            <div className="inline-flex overflow-hidden rounded-full border border-[#E7D6BE] bg-white/80 shadow-sm">
              <Link href={`/grind-mode?lang=en`} className={`px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] ${lang === "en" ? "bg-[#F4C542] text-[#4B372A]" : "text-[#7A604A]"}`}>EN</Link>
              <Link href={`/grind-mode?lang=fr`} className={`px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] ${lang === "fr" ? "bg-[#F4C542] text-[#4B372A]" : "text-[#7A604A]"}`}>FR</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-[1] grid gap-5 p-5 lg:grid-cols-[220px_1fr] lg:p-7">
        <aside className="space-y-5">
          <Card className="p-4">
            <nav className="space-y-2">
              {navItems.map(({ id, label, icon: Icon }) => {
                const active = screen === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setScreen(id)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${active ? "bg-[#4BC6B9] text-white shadow-md" : "bg-white/65 text-[#6B5B4D] hover:bg-white"}`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="text-[11px] font-black uppercase tracking-[0.15em]">{label}</span>
                  </button>
                );
              })}
            </nav>
          </Card>

          <Card className="p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9B816D]">{t.statsTitle}</p>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl bg-white/80 px-4 py-3 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9B816D]">{t.quests}</p>
                <p className="mt-1 text-lg font-black text-[#4B372A]">{data.profile.cyclesCompleted + (data.activeCycle ? 1 : 0)}</p>
              </div>
              <div className="rounded-2xl bg-white/80 px-4 py-3 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9B816D]">{t.grinds}</p>
                <p className="mt-1 text-lg font-black text-[#4B372A]">{data.profile.grindsCompleted}</p>
              </div>
              <div className="rounded-2xl bg-white/80 px-4 py-3 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9B816D]">{t.returns}</p>
                <p className="mt-1 text-lg font-black text-[#4B372A]">{data.profile.returns}</p>
              </div>
              <div className="rounded-2xl bg-white/80 px-4 py-3 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9B816D]">{t.marksEarned}</p>
                <p className="mt-1 text-lg font-black text-[#4B372A]">{earnedBadges} / {badges.length}</p>
              </div>
            </div>
          </Card>
        </aside>

        <main className="min-w-0">
          {screen === "ADVENTURE" ? renderAdventure() : null}
          {screen === "MAP" ? renderMap() : null}
          {screen === "BADGES" ? renderBadges() : null}
          {screen === "JOURNAL" ? renderJournal() : null}
          {screen === "BOOK" ? renderBook() : null}
        </main>
      </div>
    </div>
  );
}
