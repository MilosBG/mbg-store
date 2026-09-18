"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import {
  Award,
  BookOpen,
  ChevronRight,
  CircleDot,
  Clock3,
  Flame,
  Heart,
  History,
  Medal,
  RefreshCcw,
  Share2,
  Shield,
  Swords,
  Target,
  TrendingUp,
  Trophy,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import { toast } from "react-hot-toast";

import { GrindUntilAchieve2 } from "@/images";
import type {
  GTAChallengeDTO,
  GTADashboardDTO,
  GTAFocusCheck,
  GTAStatsDTO,
  GTAStreakSeriesDTO,
} from "@/types/grind-achieve";

type Props = {
  lang: "en" | "fr";
  bookUrl: string;
  ebookUrl: string;
  hustlerName?: string;
};

type Screen = "COURT" | "SHADOW" | "STATS" | "BADGES" | "BOOK";

type Copy = typeof copy.en;

const copy = {
  en: {
    title: "GRIND to ACHIEVE",
    subtitle: "5-minute hustle challenges.",
    member: "HUSTLER ACCESS",
    court: "COURT",
    shadow: "SHADOW",
    stats: "STATS",
    badges: "BADGES",
    book: "BOOK",
    live: "LIVE",
    ready: "READY",
    final: "FINAL",
    grind: "GRIND",
    achieve: "ACHIEVE",
    adminChallenge: "MILOS BG CHALLENGE",
    noChallenge: "NO CHALLENGE ON COURT",
    noChallengeBody: "New 5-minute challenges published by Milos BG will appear here.",
    chooseChallenge: "CHOOSE A CHALLENGE",
    gameClock: "GAME CLOCK",
    focusCheck: "HOW WAS YOUR FOCUS?",
    focusBody: "Choose the answer that best describes the 5 minutes you just played.",
    lockedIn: "LOCKED IN",
    returned: "DISTRACTED, BUT RETURNED",
    lostFocus: "LOST FOCUS",
    note: "POST-GAME NOTE",
    notePlaceholder: "Optional: what happened during these 5 minutes?",
    confirmAchieve: "CONFIRM ACHIEVE",
    currentStreak: "CURRENT STREAK",
    bestStreak: "BEST STREAK",
    sessions: "5-MIN SESSIONS",
    minutes: "MINUTES",
    resilience: "RESILIENCE",
    consistency: "CONSISTENCY",
    focus: "FOCUS",
    returnRate: "RETURN RATE",
    recovery: "RECOVERY",
    shadowWin: "SHADOW WIN RATE",
    comeback: "BEST COMEBACK",
    sevenDay: "7-DAY",
    twentyEightDay: "28-DAY",
    progression: "PROGRESSION",
    completion: "COMPLETION",
    timerCompletion: "TIMER COMPLETION",
    focusAverage: "FOCUS CHECK",
    cleanSessions: "CLEAN SESSIONS",
    repeatFocus: "REPEAT FOCUS",
    playerStats: "HUSTLER PERFORMANCE",
    performanceBody: "Behavioral indicators from your real 5-minute sessions. GRIND and ACHIEVE are actions, not scores.",
    trend: "RECENT FORM",
    shadowTitle: "PLAY YOUR SHADOW",
    shadowBody: "Choose a previous streak you want to beat. You are not competing with anyone else — only your previous run.",
    previousRun: "PREVIOUS RUN",
    shadowTarget: "SHADOW TARGET",
    currentRun: "CURRENT RUN",
    attempts: "ATTEMPTS",
    returns: "RETURNS",
    launchShadow: "CREATE SHADOW",
    noSeries: "Complete and close a streak before it can become a Shadow.",
    shadowActive: "ACTIVE SHADOW",
    beat: "BEAT",
    shareStory: "SHARE STORY",
    storyCopied: "Story ready. @m.i.l.o.s.bg was added to the visual and caption.",
    badgesTitle: "HUSTLER BADGES",
    badgesBody: "Badges can be awarded by Milos BG or unlocked through your effort, returns and challenges.",
    noBadges: "No badges yet. Keep showing up.",
    awarded: "AWARDED",
    byAdmin: "MILOS BG",
    bySystem: "SYSTEM",
    bookEyebrow: "GRIND UNTIL ACHIEVE",
    bookTitle: "THE MINDSET BEHIND THE WORK",
    bookBody: "The challenges train the action. The book develops the philosophy behind GRIND, RESILIENCE, CONSISTENCY, FOCUS and ACHIEVE.",
    physicalBook: "PHYSICAL BOOK",
    ebookCta: "EBOOK",
    lockedTitle: "HUSTLER ACCESS LOCKED",
    lockedBody: "GRIND to ACHIEVE unlocks after your first qualifying Milos BG purchase.",
    shop: "ENTER THE SHOP",
    sound: "SOUND",
    muted: "MUTED",
    buzzer: "BUZZER",
    shareBadge: "SHARE BADGE",
    days: "DAYS",
    hours: "H",
    pts: "PTS",
    versus: "VS",
    noLeaderboard: "NO LEADERBOARD // PLAY YOUR PREVIOUS SELF",
  },
  fr: {
    title: "GRIND to ACHIEVE",
    subtitle: "Des challenges hustle de 5 minutes.",
    member: "ACCÈS HUSTLER",
    court: "COURT",
    shadow: "SHADOW",
    stats: "STATS",
    badges: "BADGES",
    book: "LIVRE",
    live: "LIVE",
    ready: "PRÊT",
    final: "FINAL",
    grind: "GRIND",
    achieve: "ACHIEVE",
    adminChallenge: "CHALLENGE MILOS BG",
    noChallenge: "AUCUN CHALLENGE SUR LE TERRAIN",
    noChallengeBody: "Les nouveaux challenges de 5 minutes publiés par Milos BG apparaîtront ici.",
    chooseChallenge: "CHOISIS UN CHALLENGE",
    gameClock: "CHRONO DU MATCH",
    focusCheck: "COMMENT ÉTAIT TON FOCUS ?",
    focusBody: "Choisis la réponse qui décrit le mieux les 5 minutes que tu viens de jouer.",
    lockedIn: "LOCKED IN",
    returned: "DISTRAIT, MAIS REVENU",
    lostFocus: "FOCUS PERDU",
    note: "NOTE D'APRÈS-MATCH",
    notePlaceholder: "Facultatif : que s'est-il passé pendant ces 5 minutes ?",
    confirmAchieve: "CONFIRMER ACHIEVE",
    currentStreak: "SÉRIE ACTUELLE",
    bestStreak: "MEILLEURE SÉRIE",
    sessions: "SESSIONS 5 MIN",
    minutes: "MINUTES",
    resilience: "RESILIENCE",
    consistency: "CONSISTENCY",
    focus: "FOCUS",
    returnRate: "TAUX DE RETOUR",
    recovery: "TEMPS DE RETOUR",
    shadowWin: "SHADOW WIN RATE",
    comeback: "MEILLEUR COMEBACK",
    sevenDay: "7 JOURS",
    twentyEightDay: "28 JOURS",
    progression: "PROGRESSION",
    completion: "COMPLÉTION",
    timerCompletion: "TIMERS TERMINÉS",
    focusAverage: "FOCUS CHECK",
    cleanSessions: "SESSIONS CLEAN",
    repeatFocus: "FOCUS RÉPÉTÉ",
    playerStats: "PERFORMANCE DU HUSTLER",
    performanceBody: "Des indicateurs comportementaux issus de tes vraies sessions de 5 minutes. GRIND et ACHIEVE sont des actions, pas des scores.",
    trend: "FORME RÉCENTE",
    shadowTitle: "AFFRONTE TON SHADOW",
    shadowBody: "Choisis une ancienne série à dépasser. Tu ne joues contre personne d'autre — uniquement contre ta série précédente.",
    previousRun: "ANCIENNE SÉRIE",
    shadowTarget: "OBJECTIF SHADOW",
    currentRun: "SÉRIE ACTUELLE",
    attempts: "TENTATIVES",
    returns: "RETOURS",
    launchShadow: "CRÉER LE SHADOW",
    noSeries: "Termine et clôture une série avant qu'elle puisse devenir un Shadow.",
    shadowActive: "SHADOW ACTIF",
    beat: "DÉPASSER",
    shareStory: "PARTAGER EN STORY",
    storyCopied: "Story prête. @m.i.l.o.s.bg a été ajouté au visuel et à la légende.",
    badgesTitle: "BADGES HUSTLER",
    badgesBody: "Les badges peuvent être attribués par Milos BG ou débloqués grâce à tes efforts, tes retours et tes challenges.",
    noBadges: "Aucun badge pour le moment. Continue d'avancer.",
    awarded: "ATTRIBUÉ",
    byAdmin: "MILOS BG",
    bySystem: "SYSTÈME",
    bookEyebrow: "GRIND UNTIL ACHIEVE",
    bookTitle: "L'ÉTAT D'ESPRIT DERRIÈRE L'EFFORT",
    bookBody: "Les challenges entraînent l'action. Le livre développe la philosophie derrière GRIND, RESILIENCE, CONSISTENCY, FOCUS et ACHIEVE.",
    physicalBook: "LIVRE PHYSIQUE",
    ebookCta: "EBOOK",
    lockedTitle: "ACCÈS HUSTLER VERROUILLÉ",
    lockedBody: "GRIND to ACHIEVE se débloque après ton premier achat Milos BG éligible.",
    shop: "ENTRER DANS LA BOUTIQUE",
    sound: "SON",
    muted: "MUET",
    buzzer: "BUZZER",
    shareBadge: "PARTAGER LE BADGE",
    days: "JOURS",
    hours: "H",
    pts: "PTS",
    versus: "VS",
    noLeaderboard: "AUCUN CLASSEMENT // JOUE CONTRE TON ANCIEN TOI",
  },
} as const;

const iconByBadge: Record<string, ComponentType<{ className?: string }>> = {
  HEART: Heart,
  RETURN: RefreshCcw,
  FLAME: Flame,
  TARGET: Target,
  SHIELD: Shield,
  REPEAT: History,
  FOCUS: CircleDot,
};

const formatClock = (seconds: number) => {
  const safe = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
};

function Mark({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <Image
      src={GrindUntilAchieve2}
      alt="GRIND UNTIL ACHIEVE"
      width={40}
      height={40}
      className={`shrink-0 object-contain brightness-0 ${className}`}
    />
  );
}

function GameStyles() {
  return (
    <style>{`
      @keyframes gta-shimmer {
        0% { transform: translateX(-180%) skewX(-18deg); opacity: 0; }
        18% { opacity: .44; }
        60% { opacity: .12; }
        100% { transform: translateX(220%) skewX(-18deg); opacity: 0; }
      }
      @keyframes gta-glow {
        0%,100% { box-shadow: 0 0 0 1px rgba(255,255,255,.55), 0 0 18px rgba(0,130,26,.10), inset 0 1px 0 rgba(255,255,255,.92); }
        50% { box-shadow: 0 0 0 1px rgba(255,255,255,.82), 0 0 28px rgba(0,130,26,.22), inset 0 1px 0 rgba(255,255,255,1); }
      }
      @keyframes gta-pulse {
        0%,100% { opacity: .62; }
        50% { opacity: 1; }
      }
      @keyframes gta-score-pop {
        0% { transform: scale(.97); opacity: .2; }
        100% { transform: scale(1); opacity: 1; }
      }
      .gta-glass-orb { animation: gta-glow 2.8s ease-in-out infinite; }
      .gta-glass-orb::after {
        content: "";
        position: absolute;
        inset: -10%;
        background: linear-gradient(110deg, transparent 28%, rgba(255,255,255,.62) 48%, transparent 68%);
        animation: gta-shimmer 4.8s ease-in-out infinite;
        pointer-events: none;
      }
      .gta-live { animation: gta-pulse 1.2s ease-in-out infinite; }
      .gta-pop { animation: gta-score-pop .24s ease-out both; }
      @media (prefers-reduced-motion: reduce) {
        .gta-glass-orb, .gta-glass-orb::after, .gta-live, .gta-pop { animation: none !important; }
      }
    `}</style>
  );
}

function GlassOrb({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`gta-glass-orb relative flex items-center justify-center overflow-hidden rounded-full border border-white/70 bg-white/25 text-[#000000] backdrop-blur-md ${className}`}>
      <span className="relative z-[1] flex items-center justify-center">{children}</span>
    </div>
  );
}

function Panel({ children, className = "", green = false }: { children: ReactNode; className?: string; green?: boolean }) {
  return (
    <section className={`relative overflow-hidden rounded-sm border bg-white/80 backdrop-blur-md shadow-[0_12px_35px_rgba(0,0,0,.08)] ${green ? "border-[#00821A]" : "border-[#BFBFBF]"} ${className}`}>
      {children}
    </section>
  );
}

function Metric({ label, value, suffix = "" }: { label: string; value: string | number; suffix?: string }) {
  return (
    <div className="rounded-sm border border-[#BFBFBF] bg-white/65 p-4">
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#404040]">{label}</p>
      <p className="mt-2 text-2xl font-black tabular-nums text-[#000000]">{value}{suffix}</p>
    </div>
  );
}

function RadarChart({ stats, labels }: { stats: GTAStatsDTO; labels: [string, string, string] }) {
  const values = [stats.resilience.rating, stats.consistency.rating, stats.focus.rating];
  const center = 120;
  const radius = 82;
  const point = (index: number, scale: number) => {
    const angle = (-90 + index * 120) * (Math.PI / 180);
    return [center + Math.cos(angle) * radius * scale, center + Math.sin(angle) * radius * scale] as const;
  };
  const polygon = values.map((value, index) => point(index, value / 100).join(",")).join(" ");
  const ring = (scale: number) => [0, 1, 2].map((index) => point(index, scale).join(",")).join(" ");
  return (
    <div className="relative mx-auto h-[270px] w-full max-w-[360px]">
      <svg viewBox="0 0 240 240" className="h-full w-full overflow-visible" role="img" aria-label="Resilience, consistency and focus radar">
        {[1, .75, .5, .25].map((scale) => (
          <polygon key={scale} points={ring(scale)} fill="none" stroke="#BFBFBF" strokeWidth="1" opacity={scale === 1 ? .8 : .45} />
        ))}
        {[0, 1, 2].map((index) => {
          const [x, y] = point(index, 1);
          return <line key={index} x1={center} y1={center} x2={x} y2={y} stroke="#BFBFBF" strokeWidth="1" />;
        })}
        <polygon points={polygon} fill="rgba(0,130,26,.18)" stroke="#00821A" strokeWidth="3" />
        {values.map((value, index) => {
          const [x, y] = point(index, value / 100);
          return <circle key={index} cx={x} cy={y} r="5" fill="#FFFFFF" stroke="#00821A" strokeWidth="3" />;
        })}
      </svg>
      <div className="pointer-events-none absolute left-1/2 top-1 -translate-x-1/2 text-center">
        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#404040]">{labels[0]}</p>
        <p className="text-lg font-black text-[#000000]">{values[0]}</p>
      </div>
      <div className="pointer-events-none absolute bottom-5 left-0 text-left">
        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#404040]">{labels[1]}</p>
        <p className="text-lg font-black text-[#000000]">{values[1]}</p>
      </div>
      <div className="pointer-events-none absolute bottom-5 right-0 text-right">
        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#404040]">{labels[2]}</p>
        <p className="text-lg font-black text-[#000000]">{values[2]}</p>
      </div>
    </div>
  );
}

function TrendGraph({ stats }: { stats: GTAStatsDTO }) {
  const rows = stats.trend.slice(-8);
  if (rows.length < 2) return <div className="flex h-40 items-center justify-center border border-[#BFBFBF] bg-white/50 text-xs font-bold uppercase tracking-[0.16em] text-[#404040]">Not enough sessions yet</div>;
  const width = 700;
  const height = 180;
  const coords = (key: "resilience" | "consistency" | "focus") => rows.map((row, index) => {
    const x = (index / Math.max(1, rows.length - 1)) * width;
    const y = height - (row[key] / 100) * height;
    return `${x},${y}`;
  }).join(" ");
  return (
    <div className="overflow-x-auto rounded-sm border border-[#BFBFBF] bg-white/50 p-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-44 min-w-[620px] w-full" aria-label="Recent stats trend">
        {[25, 50, 75].map((v) => <line key={v} x1="0" y1={height - (v / 100) * height} x2={width} y2={height - (v / 100) * height} stroke="#BFBFBF" strokeWidth="1" />)}
        <polyline points={coords("resilience")} fill="none" stroke="#000000" strokeWidth="4" />
        <polyline points={coords("consistency")} fill="none" stroke="#404040" strokeWidth="4" strokeDasharray="10 6" />
        <polyline points={coords("focus")} fill="none" stroke="#00821A" strokeWidth="4" />
      </svg>
    </div>
  );
}

async function makeStoryBlob(args: {
  title: string;
  subtitle: string;
  statLabel?: string;
  statValue?: string;
  badge?: string;
}) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("CANVAS_UNAVAILABLE");

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, 170);
  ctx.fillStyle = "#00821A";
  ctx.fillRect(0, 170, canvas.width, 14);
  ctx.fillRect(72, 340, 14, 990);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "900 54px Arial";
  ctx.fillText("MILOS BG", 72, 108);

  ctx.fillStyle = "#000000";
  ctx.font = "900 76px Arial";
  ctx.fillText("GRIND to ACHIEVE", 120, 390);

  ctx.fillStyle = "#404040";
  ctx.font = "700 30px Arial";
  ctx.fillText("5-MINUTE HUSTLE", 120, 445);

  ctx.fillStyle = "#00821A";
  ctx.font = "900 170px Arial";
  ctx.fillText("05:00", 120, 680);

  ctx.fillStyle = "#000000";
  ctx.font = "900 68px Arial";
  const title = args.title.toUpperCase().slice(0, 24);
  ctx.fillText(title, 120, 815);
  ctx.fillStyle = "#404040";
  ctx.font = "700 34px Arial";
  ctx.fillText(args.subtitle.toUpperCase().slice(0, 44), 120, 875);

  if (args.statLabel && args.statValue) {
    ctx.strokeStyle = "#BFBFBF";
    ctx.lineWidth = 3;
    ctx.strokeRect(120, 1010, 840, 210);
    ctx.fillStyle = "#404040";
    ctx.font = "800 28px Arial";
    ctx.fillText(args.statLabel.toUpperCase(), 165, 1075);
    ctx.fillStyle = "#000000";
    ctx.font = "900 90px Arial";
    ctx.fillText(args.statValue, 165, 1175);
  }

  if (args.badge) {
    ctx.strokeStyle = "#00821A";
    ctx.lineWidth = 4;
    ctx.strokeRect(120, 1260, 840, 150);
    ctx.fillStyle = "#00821A";
    ctx.font = "900 34px Arial";
    ctx.fillText("BADGE", 165, 1320);
    ctx.fillStyle = "#000000";
    ctx.font = "900 48px Arial";
    ctx.fillText(args.badge.toUpperCase().slice(0, 26), 165, 1380);
  }

  ctx.fillStyle = "#000000";
  ctx.font = "900 46px Arial";
  ctx.fillText("@m.i.l.o.s.bg", 120, 1690);
  ctx.fillStyle = "#404040";
  ctx.font = "700 28px Arial";
  ctx.fillText("GRIND UNTIL ACHIEVE", 120, 1745);
  ctx.fillStyle = "#00821A";
  ctx.fillRect(120, 1795, 250, 12);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("STORY_RENDER_FAILED"))), "image/png", 1);
  });
}

export default function GrindToAchieveClient({ lang, bookUrl, ebookUrl, hustlerName }: Props) {
  const t: Copy = copy[lang] as Copy;
  const [dashboard, setDashboard] = useState<GTADashboardDTO | null>(null);
  const [screen, setScreen] = useState<Screen>("COURT");
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(300);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [achieveOpen, setAchieveOpen] = useState(false);
  const [focusCheck, setFocusCheck] = useState<GTAFocusCheck | null>(null);
  const [postNote, setPostNote] = useState("");
  const [shareBusy, setShareBusy] = useState(false);
  const [lastAchieved, setLastAchieved] = useState<{ title: string; streak: number } | null>(null);
  const tickRef = useRef<number | null>(null);
  const buzzerPlayedRef = useRef(false);
  const audioRef = useRef<AudioContext | null>(null);

  const hustler = (hustlerName || "HUSTLER").trim().toUpperCase();

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch(`/api/grind-achieve/dashboard?lang=${lang}`, { cache: "no-store" });
      if (!res.ok) throw new Error("LOAD_FAILED");
      const payload = (await res.json()) as GTADashboardDTO;
      setDashboard(payload);
      if (!selectedChallengeId && payload.challenges[0]) setSelectedChallengeId(payload.challenges[0].id);
      return payload;
    } catch {
      toast.error("GRIND to ACHIEVE unavailable");
      return null;
    } finally {
      if (!silent) setLoading(false);
    }
  }, [lang, selectedChallengeId]);

  useEffect(() => {
    void load(false);
  }, [load]);

  const armAudio = useCallback(async () => {
    if (typeof window === "undefined") return null;
    const Ctx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    if (!audioRef.current) audioRef.current = new Ctx();
    if (audioRef.current.state === "suspended") await audioRef.current.resume();
    return audioRef.current;
  }, []);

  const playBuzzer = useCallback(async () => {
    if (!soundEnabled) return;
    const ctx = await armAudio();
    if (!ctx) return;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(165, ctx.currentTime);
    gain.gain.setValueAtTime(.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.11, ctx.currentTime + .02);
    gain.gain.setValueAtTime(.11, ctx.currentTime + .45);
    gain.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + .75);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + .8);
  }, [armAudio, soundEnabled]);

  useEffect(() => {
    const active = dashboard?.activeAttempt;
    if (!active) {
      setRemaining(300);
      buzzerPlayedRef.current = false;
      if (tickRef.current !== null) window.clearInterval(tickRef.current);
      return;
    }
    const sync = () => setRemaining(Math.max(0, Math.ceil((Date.parse(active.endsAt) - Date.now()) / 1000)));
    sync();
    tickRef.current = window.setInterval(sync, 250);
    return () => {
      if (tickRef.current !== null) window.clearInterval(tickRef.current);
    };
  }, [dashboard?.activeAttempt]);

  useEffect(() => {
    if (!dashboard?.activeAttempt || remaining > 0 || buzzerPlayedRef.current) return;
    buzzerPlayedRef.current = true;
    void playBuzzer();
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.([120, 70, 220]);
  }, [dashboard?.activeAttempt, playBuzzer, remaining]);

  useEffect(() => () => {
    if (tickRef.current !== null) window.clearInterval(tickRef.current);
    if (audioRef.current) void audioRef.current.close();
  }, []);

  const selectedChallenge = useMemo(
    () => dashboard?.challenges.find((item) => item.id === selectedChallengeId) ?? dashboard?.challenges[0] ?? null,
    [dashboard?.challenges, selectedChallengeId],
  );

  const startChallenge = async (challenge?: GTAChallengeDTO, shadowId?: string) => {
    if (!challenge && !shadowId) return;
    void armAudio();
    setBusy(true);
    try {
      const res = await fetch("/api/grind-achieve/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "START", challengeId: challenge?.id, shadowId }),
      });
      if (!res.ok) throw new Error("START_FAILED");
      await load(true);
      setScreen("COURT");
    } catch {
      toast.error("Challenge unavailable");
    } finally {
      setBusy(false);
    }
  };

  const achieve = async () => {
    const active = dashboard?.activeAttempt;
    if (!active || remaining > 0 || !focusCheck) return;
    setBusy(true);
    try {
      const res = await fetch("/api/grind-achieve/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ACHIEVE", attemptId: active.id, focusCheck, note: postNote }),
      });
      if (!res.ok) throw new Error("ACHIEVE_FAILED");
      setAchieveOpen(false);
      setFocusCheck(null);
      setPostNote("");
      const updated = await load(true);
      toast.success("ACHIEVE");
      if (updated) setLastAchieved({ title: active.title, streak: updated.stats.totals.currentStreak });
    } catch {
      toast.error("ACHIEVE unavailable");
    } finally {
      setBusy(false);
    }
  };

  const createShadow = async (series: GTAStreakSeriesDTO) => {
    setBusy(true);
    try {
      const res = await fetch("/api/grind-achieve/shadow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CREATE", seriesId: series.id }),
      });
      if (!res.ok) throw new Error("SHADOW_FAILED");
      await load(true);
    } catch {
      toast.error("Shadow unavailable");
    } finally {
      setBusy(false);
    }
  };

  const shareEffort = async (
    payload: { title: string; subtitle: string; statLabel?: string; statValue?: string; badge?: string },
    announce = true,
  ) => {
    setShareBusy(true);
    try {
      const blob = await makeStoryBlob(payload);
      const file = new File([blob], "grind-to-achieve-story.png", { type: "image/png" });
      const caption = `GRIND to ACHIEVE — ${payload.subtitle}. @m.i.l.o.s.bg`;
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: caption, title: "GRIND to ACHIEVE" });
      } else {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "grind-to-achieve-story.png";
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
        await navigator.clipboard?.writeText(caption);
      }
      if (announce) toast.success(t.storyCopied);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error("Story unavailable");
    } finally {
      setShareBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="my-8 flex min-h-[430px] items-center justify-center rounded-sm border border-[#BFBFBF] bg-[#FFFFFF]">
        <GameStyles />
        <div className="text-center">
          <GlassOrb className="mx-auto h-16 w-16"><Mark className="h-7 w-7" /></GlassOrb>
          <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-[#404040]">GRIND to ACHIEVE</p>
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  if (!dashboard.unlocked) {
    return (
      <div className="my-8 rounded-sm border border-[#BFBFBF] bg-[#FFFFFF] p-8 text-[#000000] shadow-xl">
        <GameStyles />
        <GlassOrb className="h-16 w-16"><Shield className="h-7 w-7" /></GlassOrb>
        <h1 className="mt-6 text-4xl font-black uppercase tracking-[-0.04em]">{t.lockedTitle}</h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-[#404040]">{t.lockedBody}</p>
        <Link href={`/?lang=${lang}`} className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-sm bg-[#00821A] px-6 text-xs font-black uppercase tracking-[0.16em] text-[#FFFFFF]">
          {t.shop}<ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const active = dashboard.activeAttempt;
  const clockState = active ? (remaining <= 0 ? t.final : t.live) : t.ready;
  const actionLabel = active && remaining <= 0 ? t.achieve : t.grind;

  const nav: Array<{ id: Screen; label: string; Icon: ComponentType<{ className?: string }> }> = [
    { id: "COURT", label: t.court, Icon: Clock3 },
    { id: "SHADOW", label: t.shadow, Icon: Swords },
    { id: "STATS", label: t.stats, Icon: TrendingUp },
    { id: "BADGES", label: t.badges, Icon: Award },
    { id: "BOOK", label: t.book, Icon: BookOpen },
  ];

  const renderCourt = () => (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[1.38fr_.62fr]">
        <Panel green className="bg-[#000000] p-5 text-[#FFFFFF] sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#404040] pb-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#BFBFBF]">{active?.type === "SHADOW" ? t.shadowActive : t.adminChallenge}</p>
              <h2 className="mt-2 max-w-2xl text-3xl font-black uppercase tracking-[-0.04em] sm:text-5xl">{active?.title ?? selectedChallenge?.title ?? t.noChallenge}</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#BFBFBF]">{active?.description ?? selectedChallenge?.description ?? t.noChallengeBody}</p>
            </div>
            <span className={`rounded-sm border px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] ${clockState === t.live ? "gta-live border-[#00821A] text-[#00821A]" : "border-[#404040] text-[#BFBFBF]"}`}>{clockState}</span>
          </div>

          <div className="grid gap-7 py-8 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
            <div className="text-center lg:text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#BFBFBF]">HUSTLER</p>
              <p className="mt-2 text-3xl font-black uppercase">{hustler}</p>
              <p className="mt-2 text-sm font-bold text-[#00821A]">{dashboard.stats.totals.currentStreak} {t.days}</p>
            </div>

            <div className="border-y border-[#404040] px-6 py-6 text-center lg:min-w-[300px] lg:border-x lg:border-y-0">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#BFBFBF]">{t.gameClock}</p>
              <p className={`mt-3 font-mono text-7xl font-black tabular-nums tracking-[-0.08em] sm:text-8xl ${remaining <= 30 && active ? "text-[#00821A]" : "text-[#FFFFFF]"}`}>{active ? formatClock(remaining) : "05:00"}</p>
              <div className="mt-3 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#BFBFBF]">
                <span>Q1</span><span className="h-1 w-1 rounded-full bg-[#00821A]" /><span>{active ? t.live : t.ready}</span>
              </div>
            </div>

            <div className="text-center lg:text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#BFBFBF]">{active?.type === "SHADOW" ? "SHADOW" : "MILOS BG"}</p>
              <p className="mt-2 text-3xl font-black uppercase">{active?.type === "SHADOW" ? String(dashboard.activeShadow?.baselineLength ?? 0).padStart(2, "0") : "05:00"}</p>
              <p className="mt-2 text-sm font-bold text-[#00821A]">{active?.type === "SHADOW" ? `${t.beat} ${dashboard.activeShadow?.targetLength ?? 0}` : t.subtitle}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-[#404040] pt-5 sm:flex-row">
            <button
              type="button"
              disabled={busy || (!active && !selectedChallenge) || Boolean(active && remaining > 0)}
              onClick={() => {
                if (active && remaining <= 0) setAchieveOpen(true);
                else if (!active && selectedChallenge) void startChallenge(selectedChallenge);
              }}
              className={`min-h-14 flex-1 rounded-sm px-6 text-sm font-black uppercase tracking-[0.2em] transition disabled:cursor-not-allowed ${actionLabel === t.achieve ? "bg-[#FFFFFF] text-[#000000] hover:bg-[#BFBFBF]" : "bg-[#00821A] text-[#FFFFFF] hover:brightness-95 disabled:opacity-60"}`}
            >
              {actionLabel}
            </button>
            <button type="button" onClick={() => setSoundEnabled((v) => !v)} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-sm border border-[#404040] px-5 text-[10px] font-black uppercase tracking-[0.17em] text-[#BFBFBF]">
              {soundEnabled ? <Volume2 className="h-4 w-4 text-[#00821A]" /> : <VolumeX className="h-4 w-4" />}{soundEnabled ? t.sound : t.muted}
            </button>
          </div>
        </Panel>

        <div className="space-y-5">
          <Panel className="p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#404040]">HUSTLER CARD</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Metric label={t.currentStreak} value={dashboard.stats.totals.currentStreak} />
              <Metric label={t.bestStreak} value={dashboard.stats.totals.bestStreak} />
              <Metric label={t.sessions} value={dashboard.stats.totals.sessionsAchieved} />
              <Metric label={t.minutes} value={dashboard.stats.totals.totalMinutes} />
            </div>
          </Panel>
          <Panel className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#404040]">{t.shadow}</p>
                <p className="mt-2 text-xl font-black uppercase text-[#000000]">{dashboard.activeShadow ? `${dashboard.activeShadow.currentRun} ${t.versus} ${dashboard.activeShadow.baselineLength}` : "NO ACTIVE SHADOW"}</p>
              </div>
              <GlassOrb className="h-12 w-12"><Swords className="h-5 w-5" /></GlassOrb>
            </div>
            <button type="button" onClick={() => setScreen("SHADOW")} className="mt-5 min-h-11 w-full rounded-sm border border-[#00821A] bg-white/70 text-[10px] font-black uppercase tracking-[0.18em] text-[#00821A]">{t.shadow}</button>
          </Panel>
        </div>
      </div>

      {lastAchieved ? (
        <Panel green className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <GlassOrb className="h-12 w-12"><Share2 className="h-5 w-5" /></GlassOrb>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00821A]">ACHIEVE // 05:00</p>
                <p className="mt-1 text-lg font-black uppercase text-[#000000]">{lastAchieved.title}</p>
              </div>
            </div>
            <button type="button" disabled={shareBusy} onClick={() => void shareEffort({ title: lastAchieved.title, subtitle: "05:00 ACHIEVED", statLabel: t.currentStreak, statValue: String(lastAchieved.streak) })} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-[#00821A] px-5 text-[10px] font-black uppercase tracking-[0.16em] text-[#FFFFFF] disabled:opacity-40"><Share2 className="h-4 w-4" />{t.shareStory}</button>
          </div>
        </Panel>
      ) : null}

      <Panel className="p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00821A]">{t.chooseChallenge}</p>
            <h3 className="mt-2 text-2xl font-black uppercase text-[#000000]">MILOS BG / 5:00</h3>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#404040]">{dashboard.challenges.length} AVAILABLE</p>
        </div>
        {dashboard.challenges.length ? (
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {dashboard.challenges.map((challenge) => {
              const selected = selectedChallenge?.id === challenge.id;
              return (
                <button key={challenge.id} type="button" disabled={Boolean(active)} onClick={() => setSelectedChallengeId(challenge.id)} className={`min-h-[150px] rounded-sm border p-4 text-left transition ${selected ? "border-[#00821A] bg-white shadow-[0_8px_24px_rgba(0,130,26,.10)]" : "border-[#BFBFBF] bg-white/55 hover:bg-white"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <GlassOrb className="h-10 w-10"><Target className="h-4 w-4" /></GlassOrb>
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#00821A]">05:00</span>
                  </div>
                  <p className="mt-4 text-base font-black uppercase text-[#000000]">{challenge.title}</p>
                  <p className="mt-2 line-clamp-2 text-sm leading-5 text-[#404040]">{challenge.description}</p>
                </button>
              );
            })}
          </div>
        ) : <p className="mt-5 text-sm text-[#404040]">{t.noChallengeBody}</p>}
      </Panel>
    </div>
  );

  const renderShadow = () => {
    const pastSeries = dashboard.historicalSeries.filter((series) => !series.active && series.length > 0);
    return (
      <div className="space-y-5">
        <Panel green className="p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00821A]">SHADOW CHALLENGE</p>
              <h2 className="mt-2 text-4xl font-black uppercase tracking-[-0.04em] text-[#000000] sm:text-6xl">{t.shadowTitle}</h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-[#404040]">{t.shadowBody}</p>
            </div>
            <GlassOrb className="h-20 w-20"><Swords className="h-8 w-8" /></GlassOrb>
          </div>
        </Panel>

        {dashboard.activeShadow ? (
          <Panel className="bg-[#000000] p-6 text-[#FFFFFF] sm:p-8">
            <div className="grid gap-5 md:grid-cols-4">
              <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#BFBFBF]">{t.previousRun}</p><p className="mt-2 text-5xl font-black">{dashboard.activeShadow.baselineLength}</p></div>
              <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#BFBFBF]">{t.currentRun}</p><p className="mt-2 text-5xl font-black text-[#00821A]">{dashboard.activeShadow.currentRun}</p></div>
              <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#BFBFBF]">{t.shadowTarget}</p><p className="mt-2 text-5xl font-black">{dashboard.activeShadow.targetLength}</p></div>
              <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#BFBFBF]">{t.attempts} / {t.returns}</p><p className="mt-2 text-5xl font-black">{dashboard.activeShadow.attempts}/{dashboard.activeShadow.returnCount}</p></div>
            </div>
            <button type="button" disabled={Boolean(active) || busy} onClick={() => void startChallenge(undefined, dashboard.activeShadow!.id)} className="mt-7 min-h-14 w-full rounded-sm bg-[#00821A] px-6 text-sm font-black uppercase tracking-[0.2em] text-[#FFFFFF] disabled:opacity-45">{t.grind}</button>
          </Panel>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pastSeries.length ? pastSeries.slice(0, 9).map((series) => (
              <Panel key={series.id} className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <GlassOrb className="h-12 w-12"><History className="h-5 w-5" /></GlassOrb>
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#404040]">{t.previousRun}</span>
                </div>
                <p className="mt-5 text-5xl font-black text-[#000000]">{series.length}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-[#404040]">{t.shadowTarget}: {series.length + 1}</p>
                <button type="button" disabled={busy} onClick={() => void createShadow(series)} className="mt-5 min-h-11 w-full rounded-sm border border-[#00821A] bg-[#00821A] px-4 text-[10px] font-black uppercase tracking-[0.17em] text-[#FFFFFF]">{t.launchShadow}</button>
              </Panel>
            )) : <Panel className="p-6 text-sm text-[#404040]">{t.noSeries}</Panel>}
          </div>
        )}
      </div>
    );
  };

  const renderStats = () => {
    const s = dashboard.stats;
    return (
      <div className="space-y-5">
        <Panel green className="p-6 sm:p-8">
          <div className="grid gap-8 xl:grid-cols-[.65fr_1.35fr] xl:items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00821A]">{t.playerStats}</p>
              <h2 className="mt-2 text-4xl font-black uppercase tracking-[-0.04em] text-[#000000] sm:text-6xl">{hustler}</h2>
              <p className="mt-4 text-sm leading-6 text-[#404040]">{t.performanceBody}</p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Metric label={t.currentStreak} value={s.totals.currentStreak} />
                <Metric label={t.bestStreak} value={s.totals.bestStreak} />
                <Metric label={t.sessions} value={s.totals.sessionsAchieved} />
                <Metric label={t.minutes} value={s.totals.totalMinutes} />
              </div>
            </div>
            <RadarChart stats={s} labels={[t.resilience, t.consistency, t.focus]} />
          </div>
        </Panel>

        <div className="grid gap-5 xl:grid-cols-3">
          <Panel className="p-5">
            <div className="flex items-center justify-between gap-3"><h3 className="text-xl font-black uppercase text-[#000000]">{t.resilience}</h3><span className="text-4xl font-black text-[#00821A]">{s.resilience.rating}</span></div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Metric label={t.returnRate} value={s.resilience.returnRate} suffix="%" />
              <Metric label={t.recovery} value={s.resilience.medianRecoveryHours ?? "—"} suffix={s.resilience.medianRecoveryHours !== null ? t.hours : ""} />
              <Metric label={t.shadowWin} value={s.resilience.shadowWinRate} suffix="%" />
              <Metric label={t.comeback} value={s.resilience.bestComebackStreak} />
            </div>
          </Panel>
          <Panel className="p-5">
            <div className="flex items-center justify-between gap-3"><h3 className="text-xl font-black uppercase text-[#000000]">{t.consistency}</h3><span className="text-4xl font-black text-[#00821A]">{s.consistency.rating}</span></div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Metric label={t.sevenDay} value={s.consistency.sevenDayRate} suffix="%" />
              <Metric label={t.twentyEightDay} value={s.consistency.twentyEightDayRate} suffix="%" />
              <Metric label={t.progression} value={`${s.consistency.progressionPoints >= 0 ? "+" : ""}${s.consistency.progressionPoints}`} suffix={` ${t.pts}`} />
              <Metric label={t.completion} value={s.consistency.completionRate} suffix="%" />
            </div>
          </Panel>
          <Panel className="p-5">
            <div className="flex items-center justify-between gap-3"><h3 className="text-xl font-black uppercase text-[#000000]">{t.focus}</h3><span className="text-4xl font-black text-[#00821A]">{s.focus.rating}</span></div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Metric label={t.timerCompletion} value={s.focus.timerCompletionRate} suffix="%" />
              <Metric label={t.focusAverage} value={s.focus.focusCheckAverage} suffix="%" />
              <Metric label={t.cleanSessions} value={s.focus.cleanSessions} />
              <Metric label={t.repeatFocus} value={s.focus.repeatFocusRate} suffix="%" />
            </div>
          </Panel>
        </div>

        <Panel className="p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3"><h3 className="text-lg font-black uppercase text-[#000000]">{t.trend}</h3><TrendingUp className="h-5 w-5 text-[#00821A]" /></div>
          <TrendGraph stats={s} />
          <div className="mt-4 flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-[0.15em] text-[#404040]">
            <span className="flex items-center gap-2"><span className="h-2 w-6 bg-[#000000]" />{t.resilience}</span>
            <span className="flex items-center gap-2"><span className="h-2 w-6 bg-[#404040]" />{t.consistency}</span>
            <span className="flex items-center gap-2"><span className="h-2 w-6 bg-[#00821A]" />{t.focus}</span>
          </div>
        </Panel>
      </div>
    );
  };

  const renderBadges = () => (
    <div className="space-y-5">
      <Panel green className="p-6 sm:p-8">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00821A]">{t.badges}</p>
        <h2 className="mt-2 text-4xl font-black uppercase tracking-[-0.04em] text-[#000000] sm:text-6xl">{t.badgesTitle}</h2>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-[#404040]">{t.badgesBody}</p>
      </Panel>
      {dashboard.badges.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {dashboard.badges.map((badge) => {
            const Icon = iconByBadge[badge.iconKey] ?? Medal;
            return (
              <Panel key={badge.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <GlassOrb className="h-14 w-14"><Icon className="h-6 w-6 text-[#000000]" /></GlassOrb>
                  <span className="rounded-sm border border-[#BFBFBF] bg-white/60 px-3 py-2 text-[9px] font-black uppercase tracking-[0.16em] text-[#00821A]">{badge.source === "ADMIN" ? t.byAdmin : t.bySystem}</span>
                </div>
                <h3 className="mt-5 text-xl font-black uppercase text-[#000000]">{badge.name}</h3>
                <p className="mt-2 text-sm leading-6 text-[#404040]">{badge.description}</p>
                {badge.message ? <blockquote className="mt-4 border-l-2 border-[#00821A] pl-3 text-sm font-semibold text-[#404040]">{badge.message}</blockquote> : null}
                <button type="button" disabled={shareBusy} onClick={() => void shareEffort({ title: badge.name, subtitle: "BADGE EARNED", badge: badge.name })} className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-sm border border-[#00821A] bg-white/70 px-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#00821A]">
                  <Share2 className="h-4 w-4" />{t.shareBadge}
                </button>
              </Panel>
            );
          })}
        </div>
      ) : <Panel className="p-6 text-sm text-[#404040]">{t.noBadges}</Panel>}
    </div>
  );

  const renderBook = () => (
    <Panel green className="p-6 sm:p-9">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00821A]">{t.bookEyebrow}</p>
          <h2 className="mt-2 text-4xl font-black uppercase tracking-[-0.04em] text-[#000000] sm:text-6xl">{t.bookTitle}</h2>
          <p className="mt-5 max-w-xl text-sm leading-7 text-[#404040]">{t.bookBody}</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href={bookUrl} className="inline-flex min-h-12 items-center justify-center rounded-sm bg-[#00821A] px-6 text-xs font-black uppercase tracking-[0.16em] text-[#FFFFFF]">{t.physicalBook}</Link>
            <Link href={ebookUrl} className="inline-flex min-h-12 items-center justify-center rounded-sm border border-[#000000] bg-[#FFFFFF] px-6 text-xs font-black uppercase tracking-[0.16em] text-[#000000]">{t.ebookCta}</Link>
          </div>
        </div>
        <div className="flex min-h-[300px] items-center justify-center border border-[#BFBFBF] bg-[#000000] p-8">
          <div className="text-center">
            <GlassOrb className="mx-auto h-24 w-24"><Mark className="h-11 w-11" /></GlassOrb>
            <p className="mt-6 text-2xl font-black uppercase text-[#FFFFFF]">GRIND UNTIL ACHIEVE</p>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-[#00821A]">THE BOOK</p>
          </div>
        </div>
      </div>
    </Panel>
  );

  return (
    <div className="relative my-8 overflow-hidden rounded-sm border border-[#BFBFBF] bg-[#BFBFBF]/35 text-[#000000] shadow-[0_20px_55px_rgba(0,0,0,.12)]">
      <GameStyles />

      {achieveOpen ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#000000]/65 p-4 backdrop-blur-sm">
          <div className="gta-pop w-full max-w-xl rounded-sm border border-[#00821A] bg-[#FFFFFF] p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00821A]">05:00 // {t.final}</p><h3 className="mt-2 text-4xl font-black uppercase tracking-[-0.04em] text-[#000000]">{t.achieve}</h3></div>
              <GlassOrb className="h-14 w-14"><Trophy className="h-6 w-6" /></GlassOrb>
            </div>
            <p className="mt-5 text-sm font-bold uppercase text-[#000000]">{t.focusCheck}</p>
            <p className="mt-2 text-sm leading-6 text-[#404040]">{t.focusBody}</p>
            <div className="mt-5 grid gap-2">
              {([
                ["LOCKED_IN", t.lockedIn, Zap],
                ["RETURNED", t.returned, RefreshCcw],
                ["LOST_FOCUS", t.lostFocus, CircleDot],
              ] as Array<[GTAFocusCheck, string, ComponentType<{ className?: string }>]>).map(([value, label, Icon]) => (
                <button key={value} type="button" onClick={() => setFocusCheck(value)} className={`flex min-h-12 items-center gap-3 rounded-sm border px-4 text-left text-xs font-black uppercase tracking-[0.14em] ${focusCheck === value ? "border-[#00821A] bg-[#00821A] text-[#FFFFFF]" : "border-[#BFBFBF] bg-white text-[#000000]"}`}>
                  <Icon className="h-4 w-4" />{label}
                </button>
              ))}
            </div>
            <label className="mt-5 block"><span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#404040]">{t.note}</span><textarea value={postNote} onChange={(e) => setPostNote(e.target.value)} rows={3} placeholder={t.notePlaceholder} className="mt-2 w-full resize-none rounded-sm border border-[#BFBFBF] bg-white px-4 py-3 text-sm text-[#000000] outline-none focus:border-[#00821A]" /></label>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => setAchieveOpen(false)} className="min-h-12 rounded-sm border border-[#BFBFBF] bg-white text-xs font-black uppercase tracking-[0.16em] text-[#404040]">BACK</button>
              <button type="button" disabled={!focusCheck || busy} onClick={() => void achieve()} className="min-h-12 rounded-sm bg-[#00821A] text-xs font-black uppercase tracking-[0.16em] text-[#FFFFFF] disabled:opacity-40">{t.confirmAchieve}</button>
            </div>
          </div>
        </div>
      ) : null}

      <header className="border-b border-[#BFBFBF] bg-[#FFFFFF]/85 px-5 py-5 backdrop-blur-md sm:px-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <GlassOrb className="h-12 w-12"><Mark className="h-6 w-6" /></GlassOrb>
            <div>
              <div className="flex flex-wrap items-center gap-3"><h1 className="text-2xl font-black tracking-[-0.04em] text-[#000000] sm:text-3xl">{t.title}</h1><span className="rounded-sm border border-[#00821A] px-2 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-[#00821A]">{t.member}</span></div>
              <p className="mt-1 text-sm text-[#404040]">{t.subtitle}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-sm border border-[#BFBFBF] bg-white/70 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#404040]">{hustler}</span>
            <Link href="/grind-mode?lang=en" className={`rounded-sm px-3 py-2 text-[10px] font-black uppercase ${lang === "en" ? "bg-[#00821A] text-[#FFFFFF]" : "border border-[#BFBFBF] bg-white text-[#404040]"}`}>EN</Link>
            <Link href="/grind-mode?lang=fr" className={`rounded-sm px-3 py-2 text-[10px] font-black uppercase ${lang === "fr" ? "bg-[#00821A] text-[#FFFFFF]" : "border border-[#BFBFBF] bg-white text-[#404040]"}`}>FR</Link>
          </div>
        </div>
      </header>

      <div className="grid gap-5 p-5 lg:grid-cols-[205px_1fr] lg:p-7">
        <aside className="space-y-4">
          <Panel className="p-3">
            <nav className="space-y-2">
              {nav.map(({ id, label, Icon }) => (
                <button key={id} type="button" onClick={() => setScreen(id)} className={`flex min-h-11 w-full items-center gap-3 rounded-sm px-4 text-left text-[10px] font-black uppercase tracking-[0.16em] ${screen === id ? "bg-[#00821A] text-[#FFFFFF]" : "bg-white/50 text-[#404040] hover:bg-white"}`}>
                  <Icon className="h-4 w-4" />{label}
                </button>
              ))}
            </nav>
          </Panel>
          <Panel className="p-4">
            <p className="text-[9px] font-black uppercase tracking-[0.17em] text-[#404040]">{t.noLeaderboard}</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="text-center"><p className="text-xl font-black text-[#000000]">{dashboard.stats.resilience.rating}</p><p className="text-[8px] font-black uppercase text-[#404040]">R</p></div>
              <div className="text-center"><p className="text-xl font-black text-[#000000]">{dashboard.stats.consistency.rating}</p><p className="text-[8px] font-black uppercase text-[#404040]">C</p></div>
              <div className="text-center"><p className="text-xl font-black text-[#00821A]">{dashboard.stats.focus.rating}</p><p className="text-[8px] font-black uppercase text-[#404040]">F</p></div>
            </div>
          </Panel>
        </aside>
        <main className="min-w-0">
          {screen === "COURT" ? renderCourt() : null}
          {screen === "SHADOW" ? renderShadow() : null}
          {screen === "STATS" ? renderStats() : null}
          {screen === "BADGES" ? renderBadges() : null}
          {screen === "BOOK" ? renderBook() : null}
        </main>
      </div>
    </div>
  );
}
