"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, ComponentType, ReactNode } from "react";
import {
  Award,
  BookOpen,
  Brain,
  Check,
  Clock3,
  ChevronRight,
  Compass,
  Flame,
  Gem,
  Lock,
  Map,
  Eye,
  RotateCcw,
  ScrollText,
  Shield,
  Target,
  TimerReset,
  Trophy,
} from "lucide-react";
import { toast } from "react-hot-toast";

import { GrindUntilAchieve2 } from "@/images";
import { grindCopy } from "@/lib/grind/i18n";
import type {
  GrindCheckInDTO,
  GrindCycleDTO,
  GrindDashboardDTO,
  GrindLanguage,
  GrindTask,
  GrindTaskKind,
} from "@/types/grind";
import type {
  GrindLearningDashboardDTO,
  GrindLearningSessionDTO,
} from "@/types/grind-learning";

type Props = {
  lang: GrindLanguage;
  bookUrl: string;
  ebookUrl: string;
  playerName?: string;
};

type Screen = "ADVENTURE" | "IMMERSION" | "MAP" | "BADGES" | "JOURNAL" | "BOOK";

type OnboardingStep = "WELCOME" | "GOAL" | "WHY" | "CLUE" | "READY" | null;

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
    color: "#000000",
    bg: "#FFFFFF",
    ring: "rgba(0,0,0,.28)",
    mapTitle: "Start Point",
    shortTitle: "GRIND",
  },
  RESILIENCE: {
    key: "RESILIENCE",
    number: "02",
    color: "#404040",
    bg: "#BFBFBF",
    ring: "rgba(64,64,64,.28)",
    mapTitle: "Return Point",
    shortTitle: "RESILIENCE",
  },
  CONSISTENCY: {
    key: "CONSISTENCY",
    number: "03",
    color: "#BFBFBF",
    bg: "#404040",
    ring: "rgba(191,191,191,.32)",
    mapTitle: "Rhythm Point",
    shortTitle: "CONSISTENCY",
  },
  FOCUS: {
    key: "FOCUS",
    number: "04",
    color: "#00821A",
    bg: "#FFFFFF",
    ring: "rgba(0,130,26,.30)",
    mapTitle: "Focus Point",
    shortTitle: "FOCUS",
  },
  ACHIEVE: {
    key: "ACHIEVE",
    number: "05",
    color: "#FFFFFF",
    bg: "#000000",
    ring: "rgba(255,255,255,.30)",
    mapTitle: "Achieve Point",
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

const formatCountdown = (seconds: number) => {
  const safe = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
};

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

function GrindMark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <Image
      src={GrindUntilAchieve2}
      alt="GRIND UNTIL ACHIEVE"
      width={40}
      height={40}
      className={`shrink-0 object-contain ${className}`}
    />
  );
}

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
          radial-gradient(circle at 14% 82%, rgba(0,130,26,.12), transparent 22%),
          radial-gradient(circle at 82% 76%, rgba(64,64,64,.12), transparent 18%);
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
      className={`quest-card relative overflow-hidden rounded-sm border bg-[#FFFFFF] shadow-[0_18px_45px_rgba(0,0,0,.10)] ${
        accent ? "border-[#00821A]/70" : "border-[#BFBFBF]"
      } ${className}`}
    >
      {children}
    </section>
  );
}

function TinyStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-sm border border-[#BFBFBF] bg-white/80 px-4 py-3 shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#404040]">{label}</p>
      <p className="mt-2 text-2xl font-black text-[#000000]">{value}</p>
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
                : GrindMark;

  if (!major) {
    return (
      <div className="pointer-events-none fixed inset-x-4 bottom-5 z-[180] flex justify-end" aria-live="polite">
        <div className="quest-event pointer-events-auto w-full max-w-sm rounded-sm border border-[#00821A]/75 bg-[#FFFFFF] p-4 text-[#000000] shadow-2xl">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#00821A] text-[#000000] shadow-sm">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00821A]">{event.eyebrow}</p>
              <p className="mt-1 text-base font-black text-[#000000]">{event.title}</p>
              <p className="mt-1 text-sm leading-5 text-[#404040]">{event.body}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[190] flex items-center justify-center bg-[#000000]/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="quest-event relative w-full max-w-2xl overflow-hidden rounded-sm border border-[#00821A]/70 bg-[linear-gradient(180deg,#FFFFFF_0%,#FFFFFF_100%)] p-8 text-center text-[#000000] shadow-[0_25px_80px_rgba(0,0,0,.35)] sm:p-10">
        <div className="absolute -left-12 top-10 h-24 w-24 rounded-full bg-[#00821A]/20 blur-2xl" />
        <div className="absolute -right-10 bottom-8 h-24 w-24 rounded-full bg-[#00821A]/25 blur-2xl" />
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-[#00821A] text-[#000000] shadow-lg">
          <Icon className="h-10 w-10" />
        </div>
        <p className="mt-6 text-[11px] font-black uppercase tracking-[0.23em] text-[#00821A]">{event.eyebrow}</p>
        <h2 className="mt-3 text-4xl font-black uppercase tracking-[-0.04em] sm:text-6xl">{event.title}</h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#404040] sm:text-base">{event.body}</p>
        <button
          type="button"
          onClick={onDismiss}
          className="mt-8 rounded-sm border border-[#BFBFBF] bg-white/75 px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#404040] transition hover:bg-white"
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
    { id: "FIRST", label: t.markFirst, requirement: t.markFirstReq, earned: data.profile.grindsCompleted >= 1, Icon: GrindMark },
    { id: "RETURN", label: t.markReturn, requirement: t.markReturnReq, earned: data.profile.returns >= 1, Icon: RotateCcw },
    { id: "SEVEN", label: t.markSeven, requirement: t.markSevenReq, earned: data.profile.longestStreak >= 7, Icon: Flame },
    { id: "CONSISTENCY", label: t.markConsistency, requirement: t.markConsistencyReq, earned: currentRank >= 2 || data.profile.cyclesCompleted > 0, Icon: GrindMark },
    { id: "FOCUS", label: t.markFocus, requirement: t.markFocusReq, earned: currentRank >= 3 || data.profile.cyclesCompleted > 0, Icon: Compass },
    { id: "ACHIEVE", label: t.markAchieve, requirement: t.markAchieveReq, earned: data.profile.cyclesCompleted >= 1, Icon: Trophy },
    { id: "KEEP_MOVING", label: t.markKeepMoving, requirement: t.markKeepMovingReq, earned: data.profile.cyclesCompleted >= 5, Icon: Gem },
  ];
}


function getNextActionLabel(primaryTask: GrindTask | undefined, t: typeof grindCopy.en) {
  if (!primaryTask?.label.trim()) return t.choosePrimary;
  if (!primaryTask.completed) return t.startImmersionCta;
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
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>(null);
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  const [onboardingClue, setOnboardingClue] = useState("");
  const [learning, setLearning] = useState<GrindLearningDashboardDTO | null>(null);
  const [learningLoading, setLearningLoading] = useState(false);
  const [immersionDuration, setImmersionDuration] = useState(10);
  const [attentionCue, setAttentionCue] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [immersionRecall, setImmersionRecall] = useState("");
  const [immersionObservation, setImmersionObservation] = useState("");
  const [immersionNextAction, setImmersionNextAction] = useState("");
  const [reviewAnswer, setReviewAnswer] = useState("");
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);

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

  const loadLearning = useCallback(async (silent = false): Promise<GrindLearningDashboardDTO | null> => {
    if (!silent) setLearningLoading(true);
    try {
      const res = await fetch("/api/grind/learning", { cache: "no-store" });
      if (!res.ok) throw new Error("learning");
      const payload = (await res.json()) as GrindLearningDashboardDTO;
      setLearning(payload);
      return payload;
    } catch {
      if (!silent) toast.error(t.error);
      return null;
    } finally {
      if (!silent) setLearningLoading(false);
    }
  }, [t.error]);

  useEffect(() => {
    void load(false);
    void loadLearning(true);
  }, [load, loadLearning]);

  useEffect(() => {
    if (learning?.activeSession?.id) setScreen("IMMERSION");
  }, [learning?.activeSession?.id]);

  useEffect(() => {
    const active = learning?.activeSession;
    if (!active) {
      setRemainingSeconds(0);
      if (countdownRef.current !== null) {
        window.clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      return;
    }

    const syncRemaining = () => {
      const ms = Date.parse(active.endsAt) - Date.now();
      setRemainingSeconds(Math.max(0, Math.ceil(ms / 1000)));
    };

    syncRemaining();
    if (countdownRef.current !== null) window.clearInterval(countdownRef.current);
    countdownRef.current = window.setInterval(syncRemaining, 500);

    return () => {
      if (countdownRef.current !== null) {
        window.clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
  }, [learning?.activeSession]);

  useEffect(() => {
    if (!data || onboardingDismissed || onboardingStep || !data.profile.unlocked) return;

    const firstAdventure = data.profile.cyclesCompleted === 0 && data.profile.grindsCompleted === 0;
    if (!firstAdventure) return;

    if (!data.activeCycle) {
      setOnboardingStep("WELCOME");
      return;
    }

    const savedMainClue = data.today?.tasks?.find(
      (task) => task.kind === "MAIN" && task.label.trim(),
    );
    setOnboardingClue(savedMainClue?.label ?? "");
    setOnboardingStep(savedMainClue ? "READY" : "CLUE");
  }, [data, onboardingDismissed, onboardingStep]);

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
    if (countdownRef.current !== null) window.clearInterval(countdownRef.current);
  }, []);

  const badges = useMemo(() => (data ? buildBadges(data, t) : []), [data, t]);

  const createOnboardingQuest = async () => {
    if (!title.trim() || !reason.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/grind/cycles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), reason: reason.trim() }),
      });
      if (!res.ok) throw new Error("create");
      await res.json();
      setTasks(defaultTasks());
      await load(true);
      setOnboardingStep("CLUE");
    } catch {
      toast.error(t.error);
    } finally {
      setSaving(false);
    }
  };

  const persistFirstClue = async () => {
    if (!data?.activeCycle || !onboardingClue.trim()) return;

    const nextTasks = tasks.map((task) =>
      task.kind === "MAIN"
        ? { ...task, label: onboardingClue.trim(), completed: false, completedAt: null }
        : task,
    );
    setTasks(nextTasks);
    setSaving(true);
    try {
      const res = await fetch("/api/grind/check-ins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cycleId: data.activeCycle.id,
          tasks: nextTasks.filter((task) => task.label.trim()),
          note: "",
          showedUp: false,
        }),
      });
      if (!res.ok) throw new Error("save");
      await res.json();
      await load(true);
      setOnboardingStep("READY");
    } catch {
      toast.error(t.error);
    } finally {
      setSaving(false);
    }
  };

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

  const startImmersion = async () => {
    if (!data?.activeCycle) return;
    const mainClue = tasks.find((task) => task.kind === "MAIN" && task.label.trim());
    if (!mainClue) {
      toast.error(t.choosePrimary);
      return;
    }
    if (!attentionCue.trim()) {
      toast.error(t.attentionCueLabel);
      return;
    }

    setLearningLoading(true);
    try {
      const res = await fetch("/api/grind/learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "START",
          cycleId: data.activeCycle.id,
          clue: mainClue.label,
          attentionCue: attentionCue.trim(),
          durationMinutes: immersionDuration,
        }),
      });
      if (!res.ok) throw new Error("start immersion");
      const session = (await res.json()) as GrindLearningSessionDTO;
      setLearning((current) => ({
        activeSession: session,
        dueReviews: current?.dueReviews ?? [],
        recentSessions: current?.recentSessions ?? [],
      }));
      setScreen("IMMERSION");
    } catch {
      toast.error(t.error);
    } finally {
      setLearningLoading(false);
    }
  };

  const saveToday = async (showedUp = false, taskOverride?: GrindTask[], noteOverride?: string) => {
    if (!data?.activeCycle) return;
    const sourceTasks = taskOverride ?? tasks;
    const activeTasks = sourceTasks.filter((task) => task.label.trim());
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
          note: noteOverride ?? note,
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

  const completeImmersion = async () => {
    const session = learning?.activeSession;
    if (!session || !data?.activeCycle) return;
    if (!immersionRecall.trim() || !immersionObservation.trim()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/grind/learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "COMPLETE",
          sessionId: session.id,
          recall: immersionRecall.trim(),
          observation: immersionObservation.trim(),
          nextAction: immersionNextAction.trim(),
        }),
      });
      if (!res.ok) throw new Error("complete immersion");

      const now = new Date().toISOString();
      const nextTasks = tasks.map((task) =>
        task.kind === "MAIN"
          ? { ...task, completed: true, completedAt: now }
          : task,
      );
      setTasks(nextTasks);

      const learningNote = [
        note.trim(),
        `Recall: ${immersionRecall.trim()}`,
        `Attention: ${immersionObservation.trim()}`,
        immersionNextAction.trim() ? `Next signal: ${immersionNextAction.trim()}` : "",
      ].filter(Boolean).join("\n\n");

      await saveToday(true, nextTasks, learningNote);
      setImmersionRecall("");
      setImmersionObservation("");
      setImmersionNextAction("");
      setAttentionCue("");
      await loadLearning(true);
      setScreen("ADVENTURE");
      toast.success(t.immersionSaved);
    } catch {
      toast.error(t.error);
    } finally {
      setSaving(false);
    }
  };

  const reviewLearning = async (sessionId: string) => {
    if (!reviewAnswer.trim()) return;
    setReviewingId(sessionId);
    try {
      const res = await fetch("/api/grind/learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REVIEW",
          sessionId,
          recall: reviewAnswer.trim(),
        }),
      });
      if (!res.ok) throw new Error("review");
      setReviewAnswer("");
      await loadLearning(true);
      toast.success(t.eventCheckpoint);
    } catch {
      toast.error(t.error);
    } finally {
      setReviewingId(null);
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

  const renderOnboarding = () => {
    if (!onboardingStep || !data?.profile.unlocked) return null;

    const stepNumber =
      onboardingStep === "WELCOME"
        ? 1
        : onboardingStep === "GOAL" || onboardingStep === "WHY"
          ? 2
          : onboardingStep === "CLUE"
            ? 3
            : 4;

    const clueChoices = [
      { label: t.presetThing, body: t.presetThingBody, color: "#00821A", icon: Target },
      { label: t.presetSeven, body: t.presetSevenBody, color: "#00821A", icon: Flame },
      { label: t.presetFocus, body: t.presetFocusBody, color: "#00821A", icon: Compass },
      { label: t.presetReturn, body: t.presetReturnBody, color: "#404040", icon: RotateCcw },
    ];

    const savedFirstClue =
      onboardingClue ||
      data.today?.tasks?.find((task) => task.kind === "MAIN" && task.label.trim())?.label ||
      "";

    return (
      <div className="fixed inset-0 z-[220] overflow-y-auto bg-[#000000]/45 p-4 backdrop-blur-sm">
        <div className="mx-auto flex min-h-full max-w-5xl items-center justify-center py-6">
          <div className="quest-event relative w-full overflow-hidden rounded-sm border border-[#BFBFBF] bg-[linear-gradient(180deg,#FFFFFF_0%,#FFFFFF_52%,#BFBFBF_100%)] p-6 text-[#000000] shadow-[0_35px_100px_rgba(0,0,0,.38)] sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute -left-12 top-20 h-40 w-40 rounded-full bg-[#00821A]/18 blur-3xl" />
            <div className="pointer-events-none absolute -right-12 bottom-12 h-44 w-44 rounded-full bg-[#00821A]/22 blur-3xl" />

            <div className="relative z-[1] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#00821A] text-[#000000] shadow-md">
                  <Map className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00821A]">GRIND QUEST</p>
                  <p className="text-sm font-bold text-[#404040]">{displayName}</p>
                </div>
              </div>
              <div className="rounded-sm bg-white/75 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#404040] shadow-sm">
                {t.onboardingStep} {stepNumber} {t.onboardingOf} 4
              </div>
            </div>

            <div className="relative z-[1] mt-6 flex gap-2" aria-hidden="true">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className={`h-2 flex-1 rounded-sm ${step <= stepNumber ? "bg-[#00821A]" : "bg-white/55"}`} />
              ))}
            </div>

            {onboardingStep === "WELCOME" ? (
              <div className="relative z-[1] grid gap-8 py-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-sm bg-white/75 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#00821A] shadow-sm">
                    <GrindMark className="h-5 w-5" />
                    {t.eventChapterUnlocked}
                  </div>
                  <h2 className="mt-5 max-w-2xl text-4xl font-black uppercase tracking-[-0.045em] sm:text-6xl">{t.onboardingMapUnlocked}</h2>
                  <p className="mt-5 max-w-xl text-base leading-7 text-[#404040]">{t.onboardingMapUnlockedBody}</p>

                  <div className="mt-7 grid gap-3 sm:grid-cols-3">
                    {[
                      { title: t.onboardingRule1Title, body: t.onboardingRule1Body, Icon: Target },
                      { title: t.onboardingRule2Title, body: t.onboardingRule2Body, Icon: GrindMark },
                      { title: t.onboardingRule3Title, body: t.onboardingRule3Body, Icon: RotateCcw },
                    ].map(({ title: ruleTitle, body: ruleBody, Icon }) => (
                      <div key={ruleTitle} className="rounded-sm border border-[#BFBFBF] bg-white/75 p-4 shadow-sm">
                        <Icon className="h-5 w-5 text-[#00821A]" />
                        <p className="mt-3 text-sm font-black uppercase text-[#000000]">{ruleTitle}</p>
                        <p className="mt-2 text-xs leading-5 text-[#404040]">{ruleBody}</p>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setOnboardingStep("GOAL")}
                    className="mt-8 inline-flex min-h-14 items-center gap-3 rounded-sm bg-[linear-gradient(90deg,#00821A,#00821A)] px-7 text-xs font-black uppercase tracking-[0.16em] text-[#000000] shadow-lg transition hover:translate-y-[-1px]"
                  >
                    {t.onboardingBegin}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="relative mx-auto w-full max-w-md rounded-sm border border-[#BFBFBF] bg-white/65 p-6 shadow-lg">
                  <div className="rounded-sm border-2 border-dashed border-[#BFBFBF] bg-[linear-gradient(180deg,#BFBFBF_0%,#FFFFFF_100%)] p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#00821A] text-white shadow-md">
                        <Target className="h-7 w-7" />
                      </div>
                      <div className="h-1 flex-1 bg-[#BFBFBF]" />
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#00821A] text-[#000000] shadow-md">
                        <Trophy className="h-7 w-7" />
                      </div>
                    </div>
                    <p className="mt-6 text-center text-2xl font-black uppercase text-[#000000]">GRIND → ACHIEVE</p>
                    <p className="mt-2 text-center text-sm leading-6 text-[#404040]">{t.subtitle}</p>
                  </div>
                </div>
              </div>
            ) : null}

            {onboardingStep === "GOAL" || onboardingStep === "WHY" ? (
              <div className="relative z-[1] mx-auto max-w-3xl py-8">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00821A]">{t.activeQuest}</p>
                <h2 className="mt-3 text-4xl font-black uppercase tracking-[-0.045em] sm:text-5xl">{t.onboardingGoalTitle}</h2>
                <p className="mt-4 text-base leading-7 text-[#404040]">{t.onboardingGoalBody}</p>

                <div className="mt-7 rounded-sm border border-[#BFBFBF] bg-white/78 p-5 shadow-sm sm:p-6">
                  <label className="block">
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#404040]">{t.onboardingGoalTitle}</span>
                    <input
                      autoFocus
                      value={title}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => setTitle(event.target.value)}
                      placeholder={t.createQuestPlaceholder}
                      className="mt-3 w-full rounded-sm border border-[#BFBFBF] bg-[#FFFFFF] px-4 py-4 text-base font-black text-[#000000] outline-none placeholder:font-semibold placeholder:text-[#BFBFBF] focus:border-[#00821A]"
                    />
                  </label>

                  <label className="mt-5 block">
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#404040]">{t.onboardingWhyTitle}</span>
                    <p className="mt-2 text-sm leading-6 text-[#404040]">{t.onboardingWhyBody}</p>
                    <textarea
                      value={reason}
                      onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setReason(event.target.value)}
                      rows={4}
                      placeholder={t.createReasonPlaceholder}
                      className="mt-3 w-full resize-none rounded-sm border border-[#BFBFBF] bg-[#FFFFFF] px-4 py-4 text-sm text-[#000000] outline-none placeholder:text-[#BFBFBF] focus:border-[#00821A]"
                    />
                  </label>
                </div>

                <button
                  type="button"
                  disabled={saving || !title.trim() || !reason.trim()}
                  onClick={() => void createOnboardingQuest()}
                  className="mt-6 flex min-h-14 w-full items-center justify-center gap-3 rounded-sm bg-[linear-gradient(90deg,#00821A,#00821A)] px-7 text-xs font-black uppercase tracking-[0.16em] text-[#000000] shadow-lg transition hover:translate-y-[-1px] disabled:opacity-40"
                >
                  {t.onboardingWhyNext}
                  <Map className="h-4 w-4" />
                </button>
              </div>
            ) : null}

            {onboardingStep === "CLUE" ? (
              <div className="relative z-[1] py-8">
                <div className="mx-auto max-w-3xl text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00821A]">{data.activeCycle?.title}</p>
                  <h2 className="mt-3 text-4xl font-black uppercase tracking-[-0.045em] sm:text-5xl">{t.onboardingClueTitle}</h2>
                  <p className="mt-4 text-base leading-7 text-[#404040]">{t.onboardingClueBody}</p>
                </div>

                <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {clueChoices.map(({ label, body, color, icon: ChoiceIcon }) => {
                    const selected = onboardingClue === label;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setOnboardingClue(label)}
                        className={`rounded-sm border p-5 text-left shadow-sm transition ${selected ? "-translate-y-1 bg-white" : "bg-white/70 hover:bg-white"}`}
                        style={{ borderColor: selected ? color : "#BFBFBF" }}
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-full text-white shadow-sm" style={{ background: color }}>
                          <ChoiceIcon className="h-5 w-5" />
                        </div>
                        <p className="mt-4 text-sm font-black uppercase text-[#000000]">{label}</p>
                        <p className="mt-2 text-xs leading-5 text-[#404040]">{body}</p>
                        {selected ? <div className="mt-4 inline-flex items-center gap-2 rounded-sm bg-[#FFFFFF] px-3 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-[#00821A]"><Check className="h-3 w-3" /> SELECTED</div> : null}
                      </button>
                    );
                  })}
                </div>

                <label className="mx-auto mt-6 block max-w-2xl">
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#404040]">{t.onboardingCustomClue}</span>
                  <input
                    value={onboardingClue}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => setOnboardingClue(event.target.value)}
                    placeholder={t.onboardingCustomPlaceholder}
                    className="mt-3 w-full rounded-sm border border-[#BFBFBF] bg-white/80 px-4 py-4 text-base font-black text-[#000000] outline-none placeholder:font-semibold placeholder:text-[#BFBFBF] focus:border-[#00821A]"
                  />
                </label>

                <button
                  type="button"
                  disabled={saving || !onboardingClue.trim()}
                  onClick={() => void persistFirstClue()}
                  className="mx-auto mt-6 flex min-h-14 w-full max-w-2xl items-center justify-center gap-3 rounded-sm bg-[#00821A] px-7 text-xs font-black uppercase tracking-[0.16em] text-white shadow-lg transition hover:translate-y-[-1px] disabled:opacity-40"
                >
                  {t.onboardingEquipClue}
                  <GrindMark className="h-5 w-5" />
                </button>
              </div>
            ) : null}

            {onboardingStep === "READY" ? (
              <div className="relative z-[1] mx-auto max-w-4xl py-8 text-center">
                <div className="quest-bounce mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#00821A] text-[#000000] shadow-xl">
                  <GrindMark className="h-10 w-10" />
                </div>
                <p className="mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#00821A]">{t.eventQuestStarted}</p>
                <h2 className="mt-3 text-4xl font-black uppercase tracking-[-0.045em] sm:text-6xl">{t.onboardingImmersionTitle}</h2>
                <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#404040]">{t.onboardingImmersionBody}</p>

                <div className="mx-auto mt-7 max-w-2xl rounded-sm border border-[#BFBFBF] bg-white/82 p-6 text-left shadow-lg">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#404040]">{t.primaryClue}</p>
                  <p className="mt-2 text-2xl font-black uppercase text-[#000000]">{savedFirstClue || t.choosePrimary}</p>
                  <div className="mt-5 flex items-center gap-3 rounded-sm bg-[#FFFFFF] px-4 py-3 text-sm font-bold text-[#00821A]">
                    <Target className="h-5 w-5 shrink-0" />
                    {lang === "fr" ? "Fais cette action dans la vraie vie. Reviens ensuite la valider." : "Do this action in real life. Then come back and validate it."}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setOnboardingDismissed(true);
                    setOnboardingStep(null);
                    setAttentionCue(t.attentionPreset2);
                    setImmersionDuration(10);
                    setScreen("IMMERSION");
                  }}
                  className="mt-8 inline-flex min-h-14 items-center gap-3 rounded-sm bg-[linear-gradient(90deg,#00821A,#00821A)] px-8 text-xs font-black uppercase tracking-[0.16em] text-[#000000] shadow-lg transition hover:translate-y-[-1px]"
                >
                  {t.startImmersionCta}
                  <Clock3 className="h-4 w-4" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="relative my-8 overflow-hidden rounded-sm border border-[#BFBFBF] bg-[#FFFFFF] px-6 py-20 text-center text-[#000000] shadow-lg">
        <QuestStyles />
        <div className="quest-float mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#00821A] text-[#000000] shadow-lg">
          <Map className="h-8 w-8" />
        </div>
        <p className="mt-5 text-xs font-black uppercase tracking-[0.24em] text-[#00821A]">{t.loading}</p>
      </div>
    );
  }

  if (!data) return null;

  if (!data.profile.unlocked) {
    return (
      <div className="quest-shell relative my-8 overflow-hidden rounded-sm border border-[#BFBFBF] bg-[linear-gradient(180deg,#FFFFFF_0%,#FFFFFF_100%)] p-6 text-[#000000] shadow-[0_20px_60px_rgba(0,0,0,.12)] sm:p-8 lg:p-10">
        <QuestStyles />
        <div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-sm bg-white/70 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#00821A] shadow-sm">
              <Lock className="h-4 w-4" />
              {t.lockedHint}
            </div>
            <h1 className="mt-6 text-4xl font-black uppercase tracking-[-0.04em] sm:text-6xl">{t.lockedTitle}</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#404040]">{t.lockedBody}</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[t.lockedFeature1, t.lockedFeature2, t.lockedFeature3, t.lockedFeature4].map((item) => (
                <div key={item} className="rounded-sm border border-[#BFBFBF] bg-white/72 px-4 py-4 text-sm font-bold text-[#000000] shadow-sm">
                  {item}
                </div>
              ))}
            </div>
            <Link
              href={`/?lang=${lang}`}
              className="mt-8 inline-flex min-h-12 items-center gap-3 rounded-sm bg-[#00821A] px-6 py-3 text-xs font-black uppercase tracking-[0.15em] text-[#000000] shadow-lg transition hover:translate-y-[-1px]"
            >
              {t.lockedCta}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex items-center justify-center">
            <div className="quest-float relative flex h-[300px] w-full max-w-[360px] items-center justify-center rounded-sm border border-[#BFBFBF] bg-[linear-gradient(180deg,#BFBFBF_0%,#FFFFFF_100%)] shadow-lg">
              <div className="absolute inset-5 rounded-sm border-2 border-dashed border-[#BFBFBF]" />
              <div className="absolute -top-5 left-8 rounded-sm bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#404040] shadow-sm">{t.title}</div>
              <div className="text-center">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#00821A] text-[#000000] shadow-lg">
                  <Map className="h-10 w-10" />
                </div>
                <p className="mt-5 text-lg font-black uppercase">GRIND QUEST</p>
                <p className="mt-2 text-sm text-[#404040]">{t.subtitle}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const navItems: Array<{ id: Screen; label: string; icon: ComponentType<{ className?: string }> }> = [
    { id: "ADVENTURE", label: t.navAdventure, icon: Map },
    { id: "IMMERSION", label: t.navImmersion, icon: Clock3 },
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
  const earnedBadges = badges.filter((badge) => badge.earned).length;

  const primaryAction = () => {
    if (!mainEntry?.task.label.trim()) {
      setOnboardingClue("");
      setOnboardingStep("CLUE");
      return;
    }
    if (!mainEntry.task.completed) {
      if (!attentionCue.trim()) setAttentionCue(t.attentionPreset2);
      setScreen("IMMERSION");
      return;
    }
    void saveToday(true);
  };

  const renderCreateQuest = () => (
    <Card accent className="p-6 sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[.95fr_1.05fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-sm bg-[#FFFFFF] px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#00821A] shadow-sm">
            <Map className="h-4 w-4" />
            {t.questEmpty}
          </div>
          <h2 className="mt-5 text-3xl font-black uppercase tracking-[-0.03em] text-[#000000] sm:text-5xl">{t.createQuestTitle}</h2>
          <p className="mt-4 max-w-lg text-base leading-7 text-[#404040]">{t.createQuestBody}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {chapterOrder.map((chapter) => (
              <div key={chapter} className="rounded-sm px-4 py-3 text-sm font-black text-[#000000] shadow-sm" style={{ background: chapterMeta[chapter].bg }}>
                {chapterMeta[chapter].shortTitle}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-sm border border-[#BFBFBF] bg-white/80 p-5 shadow-sm">
          <label className="block">
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#404040]">{t.createQuestTitle}</span>
            <input
              value={title}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setTitle(event.target.value)}
              placeholder={t.createQuestPlaceholder}
              className="mt-3 w-full rounded-sm border border-[#BFBFBF] bg-[#FFFFFF] px-4 py-4 text-sm font-semibold text-[#000000] outline-none placeholder:text-[#BFBFBF] focus:border-[#00821A]"
            />
          </label>
          <label className="mt-4 block">
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#404040]">{t.createReasonLabel}</span>
            <textarea
              value={reason}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setReason(event.target.value)}
              rows={4}
              placeholder={t.createReasonPlaceholder}
              className="mt-3 w-full resize-none rounded-sm border border-[#BFBFBF] bg-[#FFFFFF] px-4 py-4 text-sm text-[#000000] outline-none placeholder:text-[#BFBFBF] focus:border-[#00821A]"
            />
          </label>
          <button
            type="button"
            disabled={saving || !title.trim() || !reason.trim()}
            onClick={() => void createCycle()}
            className="mt-5 flex min-h-12 w-full items-center justify-center gap-3 rounded-sm bg-[#00821A] px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-[#000000] shadow-lg transition hover:translate-y-[-1px] disabled:opacity-40"
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
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00821A]">{t.activeQuest}</p>
            <h2 className="mt-2 text-3xl font-black uppercase tracking-[-0.03em] text-[#000000] sm:text-5xl">{data.activeCycle?.title}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#404040]">{data.activeCycle?.reason}</p>
          </div>
          <div className="rounded-sm px-5 py-4 shadow-sm" style={{ background: activeMeta.bg }}>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#404040]">{t.currentZone}</p>
            <p className="mt-2 text-xl font-black uppercase" style={{ color: activeMeta.color }}>{activeMeta.shortTitle}</p>
            <p className="mt-1 text-sm text-[#404040]">{activeMeta.mapTitle}</p>
          </div>
        </div>

        <div className="mt-7 overflow-hidden rounded-sm border border-[#BFBFBF] bg-[linear-gradient(180deg,#BFBFBF_0%,#BFBFBF_100%)] p-5">
          <div className="flex items-center justify-between gap-4">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#404040]">{t.mapTitle}</p>
            <p className="text-sm font-black text-[#000000]">{data.activeCycle?.progress}%</p>
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
                  {index < chapterOrder.length - 1 ? <div className="absolute left-[60%] top-8 h-[6px] w-[80%] rounded-sm bg-[#BFBFBF]" /> : null}
                  <div
                    className={`relative mx-auto flex h-16 w-16 items-center justify-center rounded-full border-4 bg-white shadow-md ${active ? "quest-bounce" : ""}`}
                    style={{ borderColor: done || active ? meta.color : "#BFBFBF", color: done || active ? meta.color : "#BFBFBF" }}
                  >
                    {done ? <Check className="h-6 w-6" /> : active ? <Compass className="h-6 w-6" /> : <Lock className="h-5 w-5" />}
                  </div>
                  <p className="mt-3 text-[10px] font-black uppercase tracking-[0.14em] text-[#404040]">{meta.number}</p>
                  <p className="mt-1 text-[11px] font-black uppercase text-[#000000]">{meta.shortTitle}</p>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.12em]" style={{ color: done || active ? meta.color : "#404040" }}>{status}</p>
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
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#404040]">{t.nextUnlock}</p>
              <p className="mt-2 text-2xl font-black uppercase" style={{ color: nextMeta.color }}>{nextMeta.shortTitle}</p>
              <p className="mt-1 text-sm text-[#404040]">{nextMeta.mapTitle}</p>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFFFFF] text-[#00821A] shadow-sm">
              <GrindMark className="h-9 w-9" />
            </div>
          </div>
          <div className="mt-5 h-4 overflow-hidden rounded-sm bg-[#BFBFBF] p-[2px]">
            <div className="h-full rounded-sm bg-[linear-gradient(90deg,#00821A,#00821A)]" style={{ width: `${Math.max(6, data.activeCycle?.progress ?? 0)}%` }} />
          </div>
          <p className="mt-3 text-sm text-[#404040]">{t.stepReady}</p>
        </Card>

        <Card className="p-5 sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#404040]">{t.statsTitle}</p>
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
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00821A]">{t.nextStep}</p>
                  <h3 className="mt-2 text-3xl font-black uppercase tracking-[-0.03em] text-[#000000] sm:text-4xl">{mainEntry?.task.label.trim() || t.choosePrimary}</h3>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-[#404040]">{mainEntry?.task.completed ? t.stepSaved : t.stepReady}</p>
                </div>
                <div className="rounded-sm px-5 py-4 shadow-sm" style={{ background: activeMeta.bg }}>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#404040]">{t.progress}</p>
                  <p className="mt-1 text-3xl font-black" style={{ color: activeMeta.color }}>{data.activeCycle.progress}%</p>
                </div>
              </div>

              <div className="mt-6 rounded-sm border border-[#BFBFBF] bg-white/75 p-5 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full shadow-sm" style={{ background: activeMeta.color, color: "#FFFFFF" }}>
                      <Target className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#404040]">{t.primaryClue}</p>
                      <p className="mt-1 text-xl font-black uppercase text-[#000000]">{mainEntry?.task.label.trim() || t.choosePrimary}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={primaryAction}
                    disabled={saving}
                    className="min-h-14 rounded-sm bg-[linear-gradient(90deg,#00821A,#00821A)] px-6 text-sm font-black uppercase tracking-[0.12em] text-[#000000] shadow-lg transition hover:translate-y-[-1px] disabled:opacity-50"
                  >
                    {mainActionLabel}
                  </button>
                </div>
              </div>
            </Card>

            <Card className="p-6 sm:p-7">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-black uppercase text-[#000000]">{t.bonusClues}</h3>
                <span className="rounded-sm bg-[#FFFFFF] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#00821A]">{t.optional}</span>
              </div>
              <div className="mt-4 space-y-3">
                {bonusEntries.map(({ task, index }) => (
                  <div
                    key={task.id}
                    className={`rounded-sm border bg-white/70 p-4 shadow-sm transition ${flashTaskId === task.id ? "border-[#00821A]" : "border-[#BFBFBF]"}`}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#404040]">{t.support}</p>
                        <input
                          value={task.label}
                          onChange={(event: ChangeEvent<HTMLInputElement>) =>
                            setTasks((current) => current.map((item, i) => (i === index ? { ...item, label: event.target.value } : item)))
                          }
                          placeholder={index === 1 ? t.presetThing : t.presetSeven}
                          className="mt-2 w-full border-0 bg-transparent p-0 text-base font-black uppercase text-[#000000] outline-none placeholder:text-[#BFBFBF]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleTask(index)}
                        className={`min-h-11 rounded-sm px-5 text-[11px] font-black uppercase tracking-[0.14em] transition ${task.completed ? "bg-[#00821A] text-white" : "bg-[#FFFFFF] text-[#00821A] hover:bg-[#FFFFFF]"}`}
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
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#404040]">{t.journalPrompt}</span>
                  <textarea
                    value={note}
                    onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setNote(event.target.value)}
                    rows={4}
                    placeholder={t.notePlaceholder}
                    className="mt-3 w-full resize-none rounded-sm border border-[#BFBFBF] bg-white/75 px-4 py-4 text-sm text-[#000000] outline-none placeholder:text-[#BFBFBF] focus:border-[#00821A]"
                  />
                </label>
                <button
                  type="button"
                  disabled={saving || filledTasks.length === 0}
                  onClick={() => void saveToday(true)}
                  className="min-h-12 rounded-sm bg-[#00821A] px-6 text-[11px] font-black uppercase tracking-[0.16em] text-white shadow-lg transition hover:translate-y-[-1px] disabled:opacity-50"
                >
                  {t.saveProgress}
                </button>
              </div>
            </Card>
          </div>

          <div className="space-y-5">
            <Card className="p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#BFBFBF] text-[#404040] shadow-sm">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#404040]">{t.fallbackClue}</p>
                  <p className="mt-1 text-sm text-[#404040]">{t.fallbackHint}</p>
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
                    className="mt-4 w-full rounded-sm border border-[#BFBFBF] bg-white/70 px-4 py-4 text-sm font-bold text-[#000000] outline-none placeholder:text-[#BFBFBF]"
                  />
                  <button
                    type="button"
                    onClick={() => toggleTask(fallbackEntry.index)}
                    className={`mt-4 min-h-11 w-full rounded-sm text-[11px] font-black uppercase tracking-[0.14em] transition ${fallbackEntry.task.completed ? "bg-[#404040] text-white" : "bg-[#FFFFFF] text-[#404040] hover:bg-[#BFBFBF]"}`}
                  >
                    {fallbackEntry.task.completed ? t.todayComplete : t.showedUp}
                  </button>
                </>
              ) : null}
            </Card>

            <Card className="p-5 sm:p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#404040]">{t.equipLibrary}</p>
              <div className="mt-4 space-y-3">
                {[
                  { label: t.presetThing, body: t.presetThingBody, kind: "MAIN" as GrindTaskKind, color: "#00821A" },
                  { label: t.presetSeven, body: t.presetSevenBody, kind: "SUPPORT" as GrindTaskKind, color: "#00821A" },
                  { label: t.presetFocus, body: t.presetFocusBody, kind: "MAIN" as GrindTaskKind, color: "#00821A" },
                  { label: t.presetReturn, body: t.presetReturnBody, kind: "MINIMUM" as GrindTaskKind, color: "#404040" },
                ].map((preset) => (
                  <div key={preset.label} className="rounded-sm border border-[#BFBFBF] bg-white/70 p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-black uppercase" style={{ color: preset.color }}>{preset.label}</p>
                        <p className="mt-1 text-sm leading-5 text-[#404040]">{preset.body}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => equipPreset(preset.label, preset.kind)}
                        className="rounded-sm bg-[#FFFFFF] px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#00821A] shadow-sm transition hover:bg-[#FFFFFF]"
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

  const renderImmersion = () => {
    if (!data.activeCycle) return renderCreateQuest();

    const mainClue = mainEntry?.task.label.trim() ?? "";
    const activeSession = learning?.activeSession ?? null;
    const timerDone = Boolean(activeSession && remainingSeconds <= 0);
    const totalSeconds = activeSession ? Math.max(1, activeSession.durationMinutes * 60) : 1;
    const elapsedPercent = activeSession
      ? Math.min(100, Math.max(0, ((totalSeconds - remainingSeconds) / totalSeconds) * 100))
      : 0;
    const dueReview = learning?.dueReviews?.[0] ?? null;

    return (
      <div className="space-y-5">
        <Card accent className="p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-sm bg-[#BFBFBF] px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#00821A] shadow-sm">
                <Brain className="h-4 w-4" />
                {t.immersionEyebrow}
              </div>
              <h2 className="mt-5 text-3xl font-black uppercase tracking-[-0.04em] text-[#000000] sm:text-5xl">{t.immersionTitle}</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#404040]">{t.immersionBody}</p>
            </div>
            <div className="rounded-sm border border-[#BFBFBF] bg-white/80 px-5 py-4 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#404040]">{t.timerClue}</p>
              <p className="mt-2 max-w-xs text-lg font-black uppercase text-[#000000]">{activeSession?.clue || mainClue || t.choosePrimary}</p>
            </div>
          </div>
        </Card>

        {!activeSession ? (
          <div className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
            <Card className="p-6 sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFFFFF] text-[#00821A] shadow-sm">
                  <Clock3 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#404040]">{t.immersionDuration}</p>
                  <p className="mt-1 text-sm text-[#404040]">{mainClue || t.choosePrimary}</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-4 gap-2">
                {[5, 10, 15, 25].map((minutes) => (
                  <button
                    key={minutes}
                    type="button"
                    onClick={() => setImmersionDuration(minutes)}
                    className={`min-h-14 rounded-sm border text-center transition ${immersionDuration === minutes ? "border-[#00821A] bg-[#BFBFBF] text-[#00821A] shadow-sm" : "border-[#BFBFBF] bg-white/75 text-[#404040] hover:bg-white"}`}
                  >
                    <span className="block text-xl font-black">{minutes}</span>
                    <span className="text-[9px] font-black uppercase tracking-[0.15em]">{t.immersionMinutes}</span>
                  </button>
                ))}
              </div>

              <div className="mt-6 rounded-sm border border-[#BFBFBF] bg-[#FFFFFF] p-5">
                <div className="flex items-start gap-3">
                  <Eye className="mt-0.5 h-5 w-5 shrink-0 text-[#404040]" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#404040]">{t.attentionCompass} · {lang === "fr" ? "SAR" : "RAS"}</p>
                    <p className="mt-2 text-sm leading-6 text-[#404040]">{t.attentionCompassBody}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 sm:p-7">
              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#404040]">{t.attentionCueLabel}</span>
                <textarea
                  value={attentionCue}
                  onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setAttentionCue(event.target.value)}
                  rows={4}
                  placeholder={t.attentionCuePlaceholder}
                  className="mt-3 w-full resize-none rounded-sm border border-[#BFBFBF] bg-white/80 px-4 py-4 text-sm font-semibold text-[#000000] outline-none placeholder:font-normal placeholder:text-[#BFBFBF] focus:border-[#00821A]"
                />
              </label>

              <div className="mt-4 space-y-2">
                {[t.attentionPreset1, t.attentionPreset2, t.attentionPreset3].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAttentionCue(preset)}
                    className="w-full rounded-sm border border-[#BFBFBF] bg-white/70 px-4 py-3 text-left text-sm font-semibold text-[#404040] transition hover:border-[#00821A]/50 hover:bg-[#FFFFFF]"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => void startImmersion()}
                disabled={learningLoading || !mainClue || !attentionCue.trim()}
                className="mt-6 flex min-h-14 w-full items-center justify-center gap-3 rounded-sm bg-[linear-gradient(90deg,#00821A,#00821A)] px-7 text-xs font-black uppercase tracking-[0.16em] text-white shadow-lg transition hover:translate-y-[-1px] disabled:opacity-40"
              >
                <Clock3 className="h-4 w-4" />
                {t.immersionStart}
              </button>
            </Card>
          </div>
        ) : !timerDone ? (
          <Card accent className="overflow-hidden p-6 sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
              <div className="text-center">
                <div
                  className="mx-auto flex h-56 w-56 items-center justify-center rounded-full p-[12px] shadow-xl"
                  style={{ background: `conic-gradient(#00821A ${elapsedPercent}%, #BFBFBF ${elapsedPercent}% 100%)` }}
                >
                  <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-[#FFFFFF]">
                    <Clock3 className="h-7 w-7 text-[#00821A]" />
                    <p className="mt-3 text-5xl font-black tabular-nums tracking-[-0.05em] text-[#000000]">{formatCountdown(remainingSeconds)}</p>
                    <p className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#404040]">{t.timerRunning}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#404040]">{t.timerClue}</p>
                <h3 className="mt-2 text-3xl font-black uppercase tracking-[-0.03em] text-[#000000] sm:text-4xl">{activeSession.clue}</h3>

                <div className="mt-6 rounded-sm border border-[#BFBFBF] bg-[#FFFFFF] p-5">
                  <div className="flex items-start gap-3">
                    <Eye className="mt-0.5 h-5 w-5 shrink-0 text-[#404040]" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#404040]">{t.timerAttention}</p>
                      <p className="mt-2 text-base font-bold leading-7 text-[#404040]">{activeSession.attentionCue}</p>
                    </div>
                  </div>
                </div>

                <p className="mt-6 text-sm leading-6 text-[#404040]">{t.timerInstruction}</p>
                <div className="mt-5 flex items-center gap-3 rounded-sm bg-[#FFFFFF] px-4 py-3 text-sm font-bold text-[#00821A]">
                  <TimerReset className="h-5 w-5 shrink-0" />
                  PRIME → IMMERSE → RECALL → NOTICE → REPEAT
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card accent className="p-6 sm:p-8">
            <div className="mx-auto max-w-3xl">
              <div className="text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#00821A] text-[#000000] shadow-lg">
                  <GrindMark className="h-9 w-9" />
                </div>
                <p className="mt-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#00821A]">{t.timerFinished}</p>
                <h3 className="mt-2 text-3xl font-black uppercase tracking-[-0.03em] text-[#000000] sm:text-5xl">{t.activeRecall}</h3>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#404040]">{t.timerFinishedBody}</p>
              </div>

              <div className="mt-8 space-y-5">
                <label className="block rounded-sm border border-[#BFBFBF] bg-white/75 p-5 shadow-sm">
                  <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#00821A]"><Brain className="h-4 w-4" /> {t.activeRecall}</span>
                  <p className="mt-2 text-sm leading-6 text-[#404040]">{t.activeRecallBody}</p>
                  <textarea
                    value={immersionRecall}
                    onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setImmersionRecall(event.target.value)}
                    rows={4}
                    placeholder={t.activeRecallPlaceholder}
                    className="mt-3 w-full resize-none rounded-sm border border-[#BFBFBF] bg-[#FFFFFF] px-4 py-4 text-sm text-[#000000] outline-none placeholder:text-[#BFBFBF] focus:border-[#00821A]"
                  />
                </label>

                <label className="block rounded-sm border border-[#BFBFBF] bg-[#FFFFFF] p-5 shadow-sm">
                  <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#404040]"><Eye className="h-4 w-4" /> {t.sarObservation}</span>
                  <p className="mt-2 text-sm leading-6 text-[#404040]">{t.sarObservationBody}</p>
                  <textarea
                    value={immersionObservation}
                    onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setImmersionObservation(event.target.value)}
                    rows={3}
                    placeholder={t.sarObservationPlaceholder}
                    className="mt-3 w-full resize-none rounded-sm border border-[#BFBFBF] bg-white/75 px-4 py-4 text-sm text-[#000000] outline-none placeholder:text-[#BFBFBF] focus:border-[#404040]"
                  />
                </label>

                <label className="block rounded-sm border border-[#BFBFBF] bg-[#FFFFFF] p-5 shadow-sm">
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00821A]">{t.nextSignal}</span>
                  <p className="mt-2 text-sm leading-6 text-[#404040]">{t.nextSignalBody}</p>
                  <input
                    value={immersionNextAction}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => setImmersionNextAction(event.target.value)}
                    placeholder={t.nextSignalPlaceholder}
                    className="mt-3 w-full rounded-sm border border-[#BFBFBF] bg-white/75 px-4 py-4 text-sm font-semibold text-[#000000] outline-none placeholder:font-normal placeholder:text-[#BFBFBF] focus:border-[#00821A]"
                  />
                </label>
              </div>

              <button
                type="button"
                disabled={saving || !immersionRecall.trim() || !immersionObservation.trim()}
                onClick={() => void completeImmersion()}
                className="mt-6 flex min-h-14 w-full items-center justify-center gap-3 rounded-sm bg-[linear-gradient(90deg,#00821A,#00821A)] px-7 text-xs font-black uppercase tracking-[0.16em] text-[#000000] shadow-lg transition hover:translate-y-[-1px] disabled:opacity-40"
              >
                <Gem className="h-4 w-4" />
                {t.sealExpedition}
              </button>
            </div>
          </Card>
        )}

        <div className="grid gap-5 xl:grid-cols-[1.05fr_.95fr]">
          <Card className="p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00821A]">{t.recallQueue}</p>
                <h3 className="mt-2 text-2xl font-black uppercase text-[#000000]">{learning?.dueReviews.length ?? 0} {t.reviewDue}</h3>
                <p className="mt-2 text-sm leading-6 text-[#404040]">{t.recallQueueBody}</p>
              </div>
              <Brain className="h-7 w-7 text-[#00821A]" />
            </div>

            {dueReview ? (
              <div className="mt-5 rounded-sm border border-[#BFBFBF] bg-[#FFFFFF] p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00821A]">{t.timerClue}</p>
                <p className="mt-2 text-lg font-black uppercase text-[#000000]">{dueReview.clue}</p>
                <label className="mt-4 block">
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#404040]">{t.reviewAnswer}</span>
                  <textarea
                    value={reviewAnswer}
                    onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setReviewAnswer(event.target.value)}
                    rows={3}
                    placeholder={t.reviewPlaceholder}
                    className="mt-3 w-full resize-none rounded-sm border border-[#BFBFBF] bg-white/80 px-4 py-4 text-sm text-[#000000] outline-none placeholder:text-[#BFBFBF] focus:border-[#00821A]"
                  />
                </label>
                <button
                  type="button"
                  disabled={reviewingId === dueReview.id || !reviewAnswer.trim()}
                  onClick={() => void reviewLearning(dueReview.id)}
                  className="mt-4 min-h-11 w-full rounded-sm bg-[#00821A] px-5 text-[11px] font-black uppercase tracking-[0.15em] text-white shadow-md disabled:opacity-40"
                >
                  {t.reviewSubmit}
                </button>
              </div>
            ) : (
              <div className="mt-5 rounded-sm border border-[#BFBFBF] bg-white/65 p-5 text-sm text-[#404040]">{t.noReviews}</div>
            )}
          </Card>

          <Card className="p-6 sm:p-7">
            <div className="flex items-center gap-3">
              <TimerReset className="h-6 w-6 text-[#00821A]" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00821A]">{t.reviewSchedule}</p>
                <p className="mt-1 text-sm leading-6 text-[#404040]">{t.reviewScheduleBody}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {["+1D", "+3D", "+7D", "+14D", "+30D"].map((step) => (
                <span key={step} className="rounded-sm bg-[#FFFFFF] px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#00821A]">{step}</span>
              ))}
            </div>

            <p className="mt-6 text-[10px] font-black uppercase tracking-[0.18em] text-[#404040]">{t.immersionHistory}</p>
            <div className="mt-3 space-y-2">
              {(learning?.recentSessions ?? []).slice(0, 3).map((session) => (
                <div key={session.id} className="rounded-sm border border-[#BFBFBF] bg-white/70 px-4 py-3">
                  <p className="truncate text-sm font-black uppercase text-[#000000]">{session.clue}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#404040]">{session.durationMinutes} {t.immersionMinutes} · {formatDate(session.completedAt, lang)}</p>
                </div>
              ))}
            </div>
          </Card>
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
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00821A]">{t.mapTitle}</p>
              <h2 className="mt-2 text-3xl font-black uppercase tracking-[-0.03em] text-[#000000] sm:text-5xl">{data.activeCycle.title}</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#404040]">{t.mapBody}</p>
            </div>
            <div className="rounded-sm border border-[#BFBFBF] bg-white/75 px-5 py-4 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#404040]">{t.progress}</p>
              <p className="mt-2 text-3xl font-black text-[#000000]">{data.activeCycle.progress}%</p>
            </div>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-5">
            {chapterOrder.map((chapter, index) => {
              const meta = chapterMeta[chapter];
              const state = index < activeIndex ? "done" : index === activeIndex ? "active" : "locked";
              return (
                <div key={chapter} className="rounded-sm border border-[#BFBFBF] bg-white/80 p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 bg-white shadow-sm" style={{ borderColor: meta.color, color: meta.color }}>
                      {state === "done" ? <Check className="h-5 w-5" /> : state === "active" ? <Compass className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
                    </div>
                    <span className="text-lg font-black" style={{ color: meta.color }}>{meta.number}</span>
                  </div>
                  <p className="mt-4 text-sm font-black uppercase text-[#000000]">{meta.shortTitle}</p>
                  <p className="mt-1 text-xs leading-5 text-[#404040]">
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
                  <div className="mt-4 rounded-sm px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-center" style={{ background: meta.bg, color: meta.color }}>
                    {state === "done" ? t.chapterUnlocked : state === "active" ? t.chapterActive : t.chapterLocked}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6 sm:p-7">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#404040]">{t.completeQuest}</p>
          <label className="mt-4 block">
            <span className="text-sm font-bold text-[#404040]">{t.reflection}</span>
            <textarea
              value={reflection}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setReflection(event.target.value)}
              rows={5}
              className="mt-3 w-full resize-none rounded-sm border border-[#BFBFBF] bg-white/80 px-4 py-4 text-sm text-[#000000] outline-none focus:border-[#00821A]"
            />
          </label>
          <button
            type="button"
            disabled={saving || !reflection.trim()}
            onClick={() => void completeCycle()}
            className="mt-5 inline-flex min-h-12 items-center gap-3 rounded-sm bg-[#00821A] px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-[#000000] shadow-lg disabled:opacity-50"
          >
            <Trophy className="h-4 w-4" />
            {t.completeQuest}
          </button>
          <p className="mt-3 text-sm text-[#404040]">{t.completeQuestHint}</p>
        </Card>
      </div>
    );
  };

  const renderBadges = () => (
    <div className="space-y-5">
      <Card accent className="p-6 sm:p-8">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00821A]">{t.badgesTitle}</p>
        <h2 className="mt-2 text-3xl font-black uppercase tracking-[-0.03em] text-[#000000] sm:text-5xl">{earnedBadges} / {badges.length}</h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[#404040]">{t.badgesBody}</p>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {badges.map((badge) => (
          <Card key={badge.id} className={`p-5 ${badge.earned ? "border-[#00821A]" : ""}`}>
            <div className="flex items-start justify-between gap-4">
              <div className={`flex h-14 w-14 items-center justify-center rounded-full shadow-sm ${badge.earned ? "bg-[#00821A] text-[#000000]" : "bg-[#BFBFBF] text-[#BFBFBF]"}`}>
                <badge.Icon className="h-7 w-7" />
              </div>
              <span className={`rounded-sm px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${badge.earned ? "bg-[#FFFFFF] text-[#00821A]" : "bg-[#BFBFBF] text-[#404040]"}`}>
                {badge.earned ? t.earnedMark : t.lockedMark}
              </span>
            </div>
            <p className="mt-4 text-lg font-black uppercase text-[#000000]">{badge.label}</p>
            <p className="mt-2 text-sm leading-6 text-[#404040]">{badge.requirement}</p>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderJournal = () => (
    <div className="space-y-5">
      <Card accent className="p-6 sm:p-8">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00821A]">{t.archiveTitle}</p>
        <h2 className="mt-2 text-3xl font-black uppercase tracking-[-0.03em] text-[#000000] sm:text-5xl">{archive.length}</h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[#404040]">{t.archiveBody}</p>
      </Card>
      {archive.length ? (
        <div className="space-y-4">
          {archive.map((cycle) => (
            <Card key={cycle.id} className="p-5 sm:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#404040]">{t.activeQuest}</p>
                  <h3 className="mt-1 text-2xl font-black uppercase text-[#000000]">{cycle.title}</h3>
                  <p className="mt-2 text-sm text-[#404040]">{cycle.reason}</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 md:text-right">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#404040]">START</p>
                    <p className="mt-1 text-sm font-bold text-[#000000]">{formatDate(cycle.startedAt, lang)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#404040]">END</p>
                    <p className="mt-1 text-sm font-bold text-[#000000]">{formatDate(cycle.completedAt, lang)}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-6 text-sm text-[#404040]">{t.noArchive}</Card>
      )}
    </div>
  );

  const renderBook = () => (
    <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
      <Card accent className="p-6 sm:p-8">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00821A]">{t.bookEyebrow}</p>
        <h2 className="mt-2 text-3xl font-black uppercase tracking-[-0.03em] text-[#000000] sm:text-5xl">{t.bookTitle}</h2>
        <p className="mt-4 max-w-xl text-base leading-7 text-[#404040]">{t.bookBody}</p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link href={bookUrl} className="inline-flex min-h-12 items-center justify-center rounded-sm bg-[#00821A] px-6 text-xs font-black uppercase tracking-[0.15em] text-[#000000] shadow-lg transition hover:translate-y-[-1px]">
            {t.physicalBook}
          </Link>
          <Link href={ebookUrl} className="inline-flex min-h-12 items-center justify-center rounded-sm border border-[#BFBFBF] bg-white/80 px-6 text-xs font-black uppercase tracking-[0.15em] text-[#000000] shadow-sm transition hover:bg-white">
            {t.ebook}
          </Link>
        </div>
      </Card>
      <Card className="flex items-center justify-center p-6 sm:p-8">
        <div className="quest-float w-full max-w-sm rounded-sm border border-[#BFBFBF] bg-[linear-gradient(180deg,#FFFFFF_0%,#FFFFFF_100%)] p-6 text-center shadow-lg">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#00821A] text-[#000000] shadow-lg">
            <BookOpen className="h-9 w-9" />
          </div>
          <p className="mt-5 text-2xl font-black uppercase tracking-[-0.03em] text-[#000000]">{t.bookTitle}</p>
          <p className="mt-3 text-sm leading-6 text-[#404040]">{t.subtitle}</p>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="quest-shell relative my-8 overflow-hidden rounded-sm border border-[#BFBFBF] bg-[linear-gradient(180deg,#FFFFFF_0%,#BFBFBF_35%,#BFBFBF_100%)] text-[#000000] shadow-[0_25px_70px_rgba(0,0,0,.12)]">
      <QuestStyles />
      {renderOnboarding()}
      {activeEvent ? <EventOverlay event={activeEvent} onDismiss={() => setActiveEvent(null)} skipLabel={t.skipEvent} /> : null}

      <div className="relative z-[1] border-b border-[#BFBFBF] bg-white/55 px-5 py-5 backdrop-blur-sm sm:px-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#00821A] text-[#000000] shadow-md">
              <Map className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black uppercase tracking-[-0.04em] text-[#000000] sm:text-3xl">{t.title}</h1>
                <span className="rounded-sm bg-[#FFFFFF] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#00821A] shadow-sm">{t.unlockedBadge}</span>
              </div>
              <p className="mt-1 text-sm text-[#404040]">{t.subtitle}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-sm border border-[#BFBFBF] bg-white/80 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#404040] shadow-sm">{displayName}</div>
            <div className="inline-flex overflow-hidden rounded-sm border border-[#BFBFBF] bg-white/80 shadow-sm">
              <Link href={`/grind-mode?lang=en`} className={`px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] ${lang === "en" ? "bg-[#00821A] text-[#000000]" : "text-[#404040]"}`}>EN</Link>
              <Link href={`/grind-mode?lang=fr`} className={`px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] ${lang === "fr" ? "bg-[#00821A] text-[#000000]" : "text-[#404040]"}`}>FR</Link>
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
                    className={`flex w-full items-center gap-3 rounded-sm px-4 py-3 text-left transition ${active ? "bg-[#00821A] text-white shadow-md" : "bg-white/65 text-[#404040] hover:bg-white"}`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="text-[11px] font-black uppercase tracking-[0.15em]">{label}</span>
                  </button>
                );
              })}
            </nav>
          </Card>

          <Card className="p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#404040]">{t.statsTitle}</p>
            <div className="mt-4 space-y-3">
              <div className="rounded-sm bg-white/80 px-4 py-3 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#404040]">{t.quests}</p>
                <p className="mt-1 text-lg font-black text-[#000000]">{data.profile.cyclesCompleted + (data.activeCycle ? 1 : 0)}</p>
              </div>
              <div className="rounded-sm bg-white/80 px-4 py-3 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#404040]">{t.grinds}</p>
                <p className="mt-1 text-lg font-black text-[#000000]">{data.profile.grindsCompleted}</p>
              </div>
              <div className="rounded-sm bg-white/80 px-4 py-3 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#404040]">{t.returns}</p>
                <p className="mt-1 text-lg font-black text-[#000000]">{data.profile.returns}</p>
              </div>
              <div className="rounded-sm bg-white/80 px-4 py-3 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#404040]">{t.marksEarned}</p>
                <p className="mt-1 text-lg font-black text-[#000000]">{earnedBadges} / {badges.length}</p>
              </div>
            </div>
          </Card>
        </aside>

        <main className="min-w-0">
          {screen === "ADVENTURE" ? renderAdventure() : null}
          {screen === "IMMERSION" ? renderImmersion() : null}
          {screen === "MAP" ? renderMap() : null}
          {screen === "BADGES" ? renderBadges() : null}
          {screen === "JOURNAL" ? renderJournal() : null}
          {screen === "BOOK" ? renderBook() : null}
        </main>
      </div>
    </div>
  );
}
