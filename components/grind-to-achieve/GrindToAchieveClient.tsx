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
  History,
  Lock,
  RefreshCcw,
  Share2,
  Shield,
  Swords,
  Target,
  TrendingUp,
  Trophy,
  UserRound,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import { toast } from "react-hot-toast";

import { GrindUntilAchieve2 } from "@/images";
import { BadgeEmblem } from "@/components/grind-to-achieve/BadgeEmblems";
import type {
  GTAChallengeDTO,
  GTADashboardDTO,
  GTAFocusCheck,
  GTAStatsDTO,
  GTAStreakSeriesDTO,
  GTAMeasurementType,
  GTAPerformanceDTO,
} from "@/types/grind-achieve";

type Props = {
  lang: "en" | "fr";
  bookUrl: string;
  ebookUrl: string;
  hustlerName?: string;
};

type Screen = "COURT" | "SHADOW" | "SELF" | "STATS" | "BADGES" | "BOOK";

type Copy = typeof copy.en;

const copy = {
  en: {
    title: "GRIND to ACHIEVE",
    subtitle: "5-minute hustle challenges.",
    member: "HUSTLER ACCESS",
    court: "COURT",
    shadow: "SHADOW",
    self: "SELF",
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
    hustlerCard: "HUSTLER CARD",
    playerProfile: "PLAYER PROFILE",
    seasonForm: "SEASON FORM",
    yourShadowWaiting: "YOUR SHADOW IS WAITING",
    shadowWaitingBody: "Build a streak, close it, then come back to beat it. Your previous self becomes the opponent.",
    shadowPreview: "SHADOW PREVIEW",
    collection: "BADGE COLLECTION",
    collectionBody: "Every badge remains visible before it is earned, so you always know what can be unlocked.",
    earned: "EARNED",
    locked: "LOCKED",
    challengeBoard: "CHALLENGE BOARD",
    availableNow: "AVAILABLE NOW",
    hustleRating: "HUSTLE PROFILE",
    selfTitle: "BUILD YOUR OWN 5",
    selfBody: "Create a measurable five-minute challenge, set a target, GRIND, then record what you actually achieved.",
    selfChallengeName: "CHALLENGE NAME",
    measure: "MEASURE",
    unit: "UNIT",
    target: "TARGET",
    startSelf: "GRIND YOUR CHALLENGE",
    resultQuestion: "WHAT DID YOU ACTUALLY DO?",
    resultBody: "Enter the measurable result you completed during these five minutes.",
    result: "RESULT",
    performanceProgress: "PERFORMANCE PROGRESS",
    retryImprovement: "RETRY IMPROVEMENT",
    resultCapture: "RESULT CAPTURE",
    personalBests: "PERSONAL BESTS",
    targetHit: "TARGET HIT RATE",
  },
  fr: {
    title: "GRIND to ACHIEVE",
    subtitle: "Des challenges hustle de 5 minutes.",
    member: "ACCÈS HUSTLER",
    court: "COURT",
    shadow: "SHADOW",
    self: "SELF",
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
    hustlerCard: "CARTE HUSTLER",
    playerProfile: "PROFIL JOUEUR",
    seasonForm: "FORME DU MOMENT",
    yourShadowWaiting: "TON SHADOW T’ATTEND",
    shadowWaitingBody: "Construis une série, clôture-la, puis reviens pour la dépasser. Ton ancien toi devient l’adversaire.",
    shadowPreview: "APERÇU SHADOW",
    collection: "COLLECTION DE BADGES",
    collectionBody: "Tous les badges restent visibles avant d’être obtenus pour que tu saches toujours ce qui peut être débloqué.",
    earned: "OBTENU",
    locked: "VERROUILLÉ",
    challengeBoard: "TABLEAU DES CHALLENGES",
    availableNow: "DISPONIBLES",
    hustleRating: "PROFIL HUSTLE",
    selfTitle: "CRÉE TON PROPRE 5",
    selfBody: "Crée un défi mesurable de cinq minutes, fixe un objectif, GRIND, puis enregistre ce que tu as réellement accompli.",
    selfChallengeName: "NOM DU CHALLENGE",
    measure: "MESURE",
    unit: "UNITÉ",
    target: "OBJECTIF",
    startSelf: "GRIND TON CHALLENGE",
    resultQuestion: "QU'AS-TU RÉELLEMENT ACCOMPLI ?",
    resultBody: "Saisis le résultat mesurable réalisé pendant ces cinq minutes.",
    result: "RÉSULTAT",
    performanceProgress: "PROGRESSION PERFORMANCE",
    retryImprovement: "AMÉLIORATION AU RETRY",
    resultCapture: "RÉSULTATS SAISIS",
    personalBests: "RECORDS PERSONNELS",
    targetHit: "OBJECTIFS ATTEINTS",
  },
} as const;

const badgeCatalog = {
  en: [
    { code: "ENCOURAGEMENT", name: "ENCOURAGEMENT", description: "Recognition from Milos BG for visible effort and momentum.", iconKey: "HEART" },
    { code: "DONT_GIVE_UP", name: "DON'T GIVE UP", description: "Return after a broken streak and keep moving.", iconKey: "RETURN" },
    { code: "EFFORT", name: "EFFORT", description: "Accumulate meaningful 5-minute work over time.", iconKey: "FLAME" },
    { code: "CHALLENGER", name: "CHALLENGER", description: "Step onto the court against your own Shadow.", iconKey: "TARGET" },
    { code: "SHADOW_BREAKER", name: "SHADOW BREAKER", description: "Beat one of your previous personal streaks.", iconKey: "SHIELD" },
    { code: "CONSISTENT", name: "CONSISTENT", description: "Build a reliable pattern of showing up over time.", iconKey: "REPEAT" },
    { code: "LOCKED_IN", name: "LOCKED IN", description: "Build a strong record of focused five-minute sessions.", iconKey: "FOCUS" },
  ],
  fr: [
    { code: "ENCOURAGEMENT", name: "ENCOURAGEMENT", description: "Une reconnaissance Milos BG pour un effort visible et une dynamique positive.", iconKey: "HEART" },
    { code: "DONT_GIVE_UP", name: "N'ABANDONNE PAS", description: "Reviens après une série cassée et continue d’avancer.", iconKey: "RETURN" },
    { code: "EFFORT", name: "EFFORT", description: "Accumule du travail réel par sessions de cinq minutes.", iconKey: "FLAME" },
    { code: "CHALLENGER", name: "CHALLENGER", description: "Entre sur le terrain face à ton propre Shadow.", iconKey: "TARGET" },
    { code: "SHADOW_BREAKER", name: "SHADOW BREAKER", description: "Dépasse l’une de tes anciennes séries personnelles.", iconKey: "SHIELD" },
    { code: "CONSISTENT", name: "CONSISTENT", description: "Construis une présence régulière dans le temps.", iconKey: "REPEAT" },
    { code: "LOCKED_IN", name: "LOCKED IN", description: "Construis un historique solide de sessions concentrées.", iconKey: "FOCUS" },
  ],
} as const;

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
      @keyframes gta-screen-in {
        0% { transform: translateY(8px); opacity: 0; }
        100% { transform: translateY(0); opacity: 1; }
      }
      @keyframes gta-clock-live {
        0%,100% { text-shadow: 0 0 0 rgba(0,130,26,0); }
        50% { text-shadow: 0 0 28px rgba(0,130,26,.48); }
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
      .gta-screen { animation: gta-screen-in .28s ease-out both; }
      .gta-clock-live { animation: gta-clock-live 1.8s ease-in-out infinite; }
      @keyframes gta-collector-glow {
        0%, 100% {
          box-shadow:
            0 18px 46px rgba(0,0,0,.10),
            0 0 0 1px rgba(255,255,255,.70),
            0 0 22px rgba(0,130,26,.14),
            inset 0 1px 0 rgba(255,255,255,.96);
        }
        50% {
          box-shadow:
            0 20px 52px rgba(0,0,0,.12),
            0 0 0 1px rgba(255,255,255,.88),
            0 0 38px rgba(0,130,26,.28),
            inset 0 1px 0 rgba(255,255,255,1);
        }
      }
      @keyframes gta-collector-holo {
        0% { transform: translate3d(-130%, -8%, 0) rotate(12deg); opacity: 0; }
        14% { opacity: .56; }
        45% { opacity: .18; }
        100% { transform: translate3d(175%, 8%, 0) rotate(12deg); opacity: 0; }
      }
      .gta-collector-card {
        position: relative;
        isolation: isolate;
        overflow: hidden;
        min-height: 330px;
        transition: transform .24s ease, box-shadow .24s ease;
      }
      .gta-collector-card:hover { transform: translateY(-5px); }
      .gta-collector-earned {
        background:
          radial-gradient(circle at 16% 10%, rgba(255,255,255,.98), transparent 28%),
          radial-gradient(circle at 84% 16%, rgba(0,130,26,.14), transparent 32%),
          radial-gradient(circle at 72% 88%, rgba(191,191,191,.42), transparent 38%),
          linear-gradient(135deg, rgba(255,255,255,.94), rgba(191,191,191,.24) 42%, rgba(255,255,255,.84) 66%, rgba(0,130,26,.08));
        animation: gta-collector-glow 3.4s ease-in-out infinite;
      }
      .gta-collector-earned::before {
        content: "";
        position: absolute;
        inset: 0;
        z-index: 0;
        background:
          repeating-linear-gradient(118deg, transparent 0 19px, rgba(255,255,255,.28) 20px, transparent 21px 42px),
          radial-gradient(circle at 50% 50%, transparent 0 46%, rgba(0,130,26,.06) 47%, transparent 49%);
        pointer-events: none;
        opacity: .55;
      }
      .gta-collector-earned::after {
        content: "";
        position: absolute;
        z-index: 0;
        top: -38%;
        bottom: -38%;
        left: -34%;
        width: 32%;
        background: linear-gradient(110deg, transparent, rgba(255,255,255,.90), rgba(0,130,26,.12), transparent);
        animation: gta-collector-holo 5.4s ease-in-out infinite;
        pointer-events: none;
      }
      .gta-collector-locked {
        background:
          linear-gradient(145deg, rgba(0,0,0,1), rgba(64,64,64,.98));
        border-color: #404040;
        box-shadow:
          0 16px 36px rgba(0,0,0,.18),
          inset 0 1px 0 rgba(191,191,191,.12);
      }
      .gta-collector-locked::before {
        content: "";
        position: absolute;
        inset: 0;
        z-index: 0;
        background:
          repeating-linear-gradient(135deg, transparent 0 18px, rgba(191,191,191,.035) 18px 19px);
        pointer-events: none;
      }
      .gta-collector-card > * { position: relative; z-index: 1; }
      @media (prefers-reduced-motion: reduce) {
        .gta-glass-orb, .gta-glass-orb::after, .gta-live, .gta-pop, .gta-screen, .gta-clock-live,
        .gta-collector-earned, .gta-collector-earned::after, .gta-collector-card {
          animation: none !important;
          transition: none !important;
          transform: none !important;
        }
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

function Panel({
  children,
  className = "",
  green = false,
  dark = false,
}: {
  children: ReactNode;
  className?: string;
  green?: boolean;
  dark?: boolean;
}) {
  return (
    <section
      className={`relative overflow-hidden rounded-sm border backdrop-blur-md shadow-[0_12px_35px_rgba(0,0,0,.08)] ${
        dark
          ? "bg-[#000000] text-[#FFFFFF]"
          : "bg-[#FFFFFF]/80 text-[#000000]"
      } ${green ? "border-[#00821A]" : "border-[#BFBFBF]"} ${className}`}
    >
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
  const center = 150;
  const radius = 104;
  const point = (index: number, scale: number) => {
    const angle = (-90 + index * 120) * (Math.PI / 180);
    return [center + Math.cos(angle) * radius * scale, center + Math.sin(angle) * radius * scale] as const;
  };
  const polygon = values.map((value, index) => point(index, value / 100).join(",")).join(" ");
  const ring = (scale: number) => [0, 1, 2].map((index) => point(index, scale).join(",")).join(" ");
  return (
    <div className="relative mx-auto h-[420px] w-full max-w-[580px] xl:h-[500px] xl:max-w-[680px]">
      <div className="absolute inset-[12%] rounded-full bg-[#00821A]/[0.035] blur-3xl" />
      <svg viewBox="0 0 300 300" className="relative z-[1] h-full w-full overflow-visible" role="img" aria-label="Resilience, consistency and focus radar">
        {[1, .8, .6, .4, .2].map((scale) => (
          <polygon key={scale} points={ring(scale)} fill="none" stroke="#BFBFBF" strokeWidth="1" opacity={scale === 1 ? .9 : .42} />
        ))}
        {[0, 1, 2].map((index) => {
          const [x, y] = point(index, 1);
          return <line key={index} x1={center} y1={center} x2={x} y2={y} stroke="#BFBFBF" strokeWidth="1" opacity=".75" />;
        })}
        <polygon points={polygon} fill="rgba(0,130,26,.16)" stroke="#00821A" strokeWidth="3" />
        {values.map((value, index) => {
          const [x, y] = point(index, value / 100);
          return <circle key={index} cx={x} cy={y} r="6" fill="#FFFFFF" stroke="#00821A" strokeWidth="3" />;
        })}
        <circle cx={center} cy={center} r="7" fill="#000000" />
      </svg>
      <div className="pointer-events-none absolute left-1/2 top-2 z-[2] -translate-x-1/2 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#404040]">{labels[0]}</p>
        <p className="mt-1 text-3xl font-black tabular-nums text-[#000000]">{values[0]}</p>
      </div>
      <div className="pointer-events-none absolute bottom-4 left-0 z-[2] text-left sm:left-3">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#404040]">{labels[1]}</p>
        <p className="mt-1 text-3xl font-black tabular-nums text-[#000000]">{values[1]}</p>
      </div>
      <div className="pointer-events-none absolute bottom-4 right-0 z-[2] text-right sm:right-3">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#404040]">{labels[2]}</p>
        <p className="mt-1 text-3xl font-black tabular-nums text-[#00821A]">{values[2]}</p>
      </div>
    </div>
  );
}

function TrendGraph({ stats }: { stats: GTAStatsDTO }) {
  const rows = stats.trend.slice(-8);
  if (rows.length < 2) return <div className="flex h-40 items-center justify-center border border-[#BFBFBF] bg-white/50 text-xs font-bold uppercase tracking-[0.16em] text-[#404040]">Not enough sessions yet</div>;
  const width = 920;
  const height = 220;
  const coords = (key: "resilience" | "consistency" | "focus") => rows.map((row, index) => {
    const x = (index / Math.max(1, rows.length - 1)) * width;
    const y = height - (row[key] / 100) * height;
    return `${x},${y}`;
  }).join(" ");
  return (
    <div className="overflow-x-auto rounded-sm border border-[#BFBFBF] bg-white/50 p-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-56 min-w-[720px] w-full" aria-label="Recent stats trend">
        {[25, 50, 75].map((v) => <line key={v} x1="0" y1={height - (v / 100) * height} x2={width} y2={height - (v / 100) * height} stroke="#BFBFBF" strokeWidth="1" />)}
        <polyline points={coords("resilience")} fill="none" stroke="#000000" strokeWidth="4" />
        <polyline points={coords("consistency")} fill="none" stroke="#404040" strokeWidth="4" strokeDasharray="10 6" />
        <polyline points={coords("focus")} fill="none" stroke="#00821A" strokeWidth="4" />
      </svg>
    </div>
  );
}

async function loadCanvasImage(src: string) {
  return await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("IMAGE_LOAD_FAILED"));
    image.src = src;
  });
}

function drawCollectorGlyph(
  ctx: CanvasRenderingContext2D,
  code: string,
  cx: number,
  cy: number,
  scale = 1,
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.strokeStyle = "#000000";
  ctx.fillStyle = "#000000";
  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const normalized = code.toUpperCase();

  if (normalized.includes("DONT") || normalized.includes("RETURN")) {
    ctx.beginPath();
    ctx.arc(0, 0, 58, Math.PI * .25, Math.PI * 1.85);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(38, -54);
    ctx.lineTo(73, -50);
    ctx.lineTo(62, -17);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-34, 18);
    ctx.lineTo(-7, -5);
    ctx.lineTo(15, 11);
    ctx.lineTo(46, -29);
    ctx.stroke();
  } else if (normalized.includes("SHADOW")) {
    ctx.beginPath();
    ctx.arc(-18, 0, 50, Math.PI * .55, Math.PI * 1.45);
    ctx.stroke();
    ctx.globalAlpha = .45;
    ctx.beginPath();
    ctx.arc(18, 0, 50, -Math.PI * .45, Math.PI * .45);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.moveTo(10, -72);
    ctx.lineTo(-12, -10);
    ctx.lineTo(16, 0);
    ctx.lineTo(-18, 76);
    ctx.stroke();
  } else if (normalized.includes("CONSIST")) {
    [-52, -26, 0, 26, 52].forEach((x, index) => {
      const heights = [46, 66, 34, 76, 56];
      ctx.fillRect(x - 7, 50 - heights[index], 14, heights[index]);
    });
    ctx.beginPath();
    ctx.moveTo(-56, 55);
    ctx.lineTo(58, 55);
    ctx.stroke();
  } else if (normalized.includes("LOCKED") || normalized.includes("FOCUS")) {
    ctx.beginPath();
    ctx.arc(0, 0, 58, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 27, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillRect(-9, -9, 18, 18);
    ctx.beginPath();
    ctx.moveTo(0, -84); ctx.lineTo(0, -62);
    ctx.moveTo(0, 62); ctx.lineTo(0, 84);
    ctx.moveTo(-84, 0); ctx.lineTo(-62, 0);
    ctx.moveTo(62, 0); ctx.lineTo(84, 0);
    ctx.stroke();
  } else if (normalized.includes("CHALLENG")) {
    ctx.beginPath();
    ctx.arc(-28, 0, 42, 0, Math.PI * 2);
    ctx.arc(28, 0, 42, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-24, -54); ctx.lineTo(24, 54);
    ctx.moveTo(24, -54); ctx.lineTo(-24, 54);
    ctx.stroke();
  } else if (normalized.includes("EFFORT")) {
    ctx.beginPath();
    ctx.moveTo(-52, 52);
    ctx.bezierCurveTo(-55, 5, -18, -8, 0, -66);
    ctx.bezierCurveTo(18, -24, 10, 0, 34, -38);
    ctx.bezierCurveTo(62, 8, 52, 54, 0, 64);
    ctx.bezierCurveTo(-24, 68, -44, 60, -52, 52);
    ctx.stroke();
  } else {
    // Five-petal encouragement bloom
    for (let i = 0; i < 5; i += 1) {
      ctx.save();
      ctx.rotate((Math.PI * 2 * i) / 5);
      ctx.beginPath();
      ctx.ellipse(0, -43, 18, 35, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

async function makeStoryBlob(args: {
  title: string;
  subtitle: string;
  statLabel?: string;
  statValue?: string;
  badge?: string;
  badgeCode?: string;
}) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("CANVAS_UNAVAILABLE");

  await document.fonts?.load?.("900 64px Kanit").catch(() => undefined);
  await document.fonts?.load?.("700 32px Kanit").catch(() => undefined);
  await document.fonts?.load?.("500 24px Kanit").catch(() => undefined);

  const logo = await loadCanvasImage("/grind/milos-bg-logo.png").catch(() => null);
  const flower = await loadCanvasImage("/grind/periwinkle-badge-bg.png").catch(() => null);

  const toBlob = () => new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("STORY_RENDER_FAILED"))), "image/png", 1);
  });

  const drawCentered = (text: string, y: number, font: string, color: string) => {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.fillText(text, canvas.width / 2, y);
    ctx.textAlign = "start";
  };

  const fitCentered = (
    text: string,
    y: number,
    maxWidth: number,
    maxSize: number,
    minSize: number,
    weight: number,
    color: string,
  ) => {
    let size = maxSize;
    while (size > minSize) {
      ctx.font = `${weight} ${size}px Kanit, Arial`;
      if (ctx.measureText(text).width <= maxWidth) break;
      size -= 2;
    }
    drawCentered(text, y, `${weight} ${size}px Kanit, Arial`, color);
  };

  if (args.badge) {
    // ---------------------------------------------------------
    // PREMIUM BADGE STORY — intentionally minimal and editorial
    // ---------------------------------------------------------
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, 1080, 1920);

    // Outer collector frame
    ctx.strokeStyle = "#00821A";
    ctx.lineWidth = 8;
    ctx.strokeRect(30, 30, 1020, 1860);
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.strokeRect(56, 56, 968, 1808);

    // Centered Milos BG logo
    if (logo) {
      const maxW = 390;
      const maxH = 112;
      const ratio = Math.min(maxW / logo.width, maxH / logo.height);
      const w = logo.width * ratio;
      const h = logo.height * ratio;
      ctx.drawImage(logo, (1080 - w) / 2, 96, w, h);
    }

    // Fine editorial divider under logo
    ctx.strokeStyle = "#404040";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(145, 250);
    ctx.lineTo(425, 250);
    ctx.moveTo(655, 250);
    ctx.lineTo(935, 250);
    ctx.stroke();

    ctx.fillStyle = "#00821A";
    ctx.fillRect(512, 246, 56, 8);

    // Main botanical artwork — the hero of the card
    const artX = 74;
    const artY = 310;
    const artW = 932;
    const artH = 980;

    ctx.save();
    ctx.beginPath();
    ctx.rect(artX, artY, artW, artH);
    ctx.clip();

    if (flower) {
      const scale = Math.max(artW / flower.width, artH / flower.height);
      const dw = flower.width * scale;
      const dh = flower.height * scale;
      const dx = artX + (artW - dw) / 2;
      const dy = artY + (artH - dh) / 2;
      ctx.drawImage(flower, dx, dy, dw, dh);
    } else {
      ctx.fillStyle = "#404040";
      ctx.fillRect(artX, artY, artW, artH);
    }

    // Controlled vignette keeps the card premium, not busy
    const vignette = ctx.createLinearGradient(0, artY, 0, artY + artH);
    vignette.addColorStop(0, "rgba(0,0,0,0.08)");
    vignette.addColorStop(0.68, "rgba(0,0,0,0.10)");
    vignette.addColorStop(1, "rgba(0,0,0,0.78)");
    ctx.fillStyle = vignette;
    ctx.fillRect(artX, artY, artW, artH);
    ctx.restore();

    ctx.strokeStyle = "#00821A";
    ctx.lineWidth = 3;
    ctx.strokeRect(artX, artY, artW, artH);

    // Badge emblem: subtle, top-left — secondary to the flower
    ctx.fillStyle = "#000000";
    ctx.globalAlpha = 0.78;
    ctx.beginPath();
    ctx.arc(168, 408, 72, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "#00821A";
    ctx.lineWidth = 3;
    ctx.stroke();
    drawCollectorGlyph(ctx, args.badgeCode ?? args.badge, 168, 408, 0.52);

    // Badge identity — smaller than previous version
    drawCentered("BADGE EARNED", 1382, "700 24px Kanit, Arial", "#00821A");
    fitCentered(args.badge.toUpperCase(), 1460, 800, 62, 38, 700, "#FFFFFF");

    ctx.fillStyle = "#00821A";
    ctx.fillRect(470, 1500, 140, 5);

    // Social signature only — no extra labels / collector-series copy
    fitCentered("@m.i.l.o.s.bg", 1638, 720, 42, 32, 700, "#FFFFFF");
    drawCentered("GRIND UNTIL ACHIEVE", 1692, "500 22px Kanit, Arial", "#BFBFBF");

    // Minimal closing line
    ctx.strokeStyle = "#404040";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(110, 1802);
    ctx.lineTo(300, 1802);
    ctx.moveTo(780, 1802);
    ctx.lineTo(970, 1802);
    ctx.stroke();
    drawCentered("A BETTER YOU. A BRIGHTER TOMORROW.", 1810, "500 16px Kanit, Arial", "#BFBFBF");

    return await toBlob();
  }

  // ---------------------------------------------------------
  // Standard effort story (unchanged in spirit)
  // ---------------------------------------------------------
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, 1080, 1920);
  ctx.strokeStyle = "#00821A";
  ctx.lineWidth = 8;
  ctx.strokeRect(34, 42, 1012, 1836);

  if (logo) {
    const maxW = 360;
    const maxH = 96;
    const ratio = Math.min(maxW / logo.width, maxH / logo.height);
    const w = logo.width * ratio;
    const h = logo.height * ratio;
    ctx.drawImage(logo, (1080 - w) / 2, 100, w, h);
  }

  drawCentered("05:00", 610, "900 170px Kanit, Arial", "#00821A");
  fitCentered(args.title.toUpperCase(), 760, 820, 64, 38, 900, "#FFFFFF");
  drawCentered(args.subtitle.toUpperCase().slice(0, 42), 820, "700 28px Kanit, Arial", "#BFBFBF");

  if (args.statLabel && args.statValue) {
    ctx.strokeStyle = "#404040";
    ctx.lineWidth = 2;
    ctx.strokeRect(170, 1000, 740, 210);
    drawCentered(args.statLabel.toUpperCase(), 1070, "700 22px Kanit, Arial", "#BFBFBF");
    drawCentered(args.statValue, 1170, "900 72px Kanit, Arial", "#FFFFFF");
  }

  fitCentered("@m.i.l.o.s.bg", 1638, 720, 42, 32, 700, "#FFFFFF");
  drawCentered("GRIND UNTIL ACHIEVE", 1692, "500 22px Kanit, Arial", "#BFBFBF");

  return await toBlob();
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
  const [resultValue, setResultValue] = useState("");
  const [selfTitle, setSelfTitle] = useState("");
  const [selfDescription, setSelfDescription] = useState("");
  const [selfMeasurementType, setSelfMeasurementType] = useState<GTAMeasurementType>("COUNT");
  const [selfUnitLabel, setSelfUnitLabel] = useState("reps");
  const [selfTargetValue, setSelfTargetValue] = useState("");
  const [shareBusy, setShareBusy] = useState(false);
  const [lastAchieved, setLastAchieved] = useState<{ title: string; streak: number; resultValue?: number; unitLabel?: string; personalBest?: boolean } | null>(null);
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

  const startSelfChallenge = async () => {
    if (!selfTitle.trim() || !selfUnitLabel.trim()) return;
    void armAudio();
    setBusy(true);
    try {
      const res = await fetch("/api/grind-achieve/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "START_SELF",
          title: selfTitle,
          description: selfDescription,
          measurementType: selfMeasurementType,
          unitLabel: selfUnitLabel,
          targetValue: selfTargetValue.trim() ? Number(selfTargetValue) : null,
        }),
      });
      if (!res.ok) throw new Error("START_SELF_FAILED");
      await load(true);
      setScreen("COURT");
      toast.success("SELF CHALLENGE LIVE");
    } catch {
      toast.error("Self challenge unavailable");
    } finally {
      setBusy(false);
    }
  };

  const achieve = async () => {
    const active = dashboard?.activeAttempt;
    if (!active || remaining > 0 || !focusCheck || !resultValue.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/grind-achieve/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ACHIEVE",
          attemptId: active.id,
          focusCheck,
          note: postNote,
          resultValue: Number(resultValue),
        }),
      });
      if (!res.ok) throw new Error("ACHIEVE_FAILED");
      setAchieveOpen(false);
      setFocusCheck(null);
      setPostNote("");
      setResultValue("");
      const result = (await res.json()) as { resultValue?: number | null; unitLabel?: string; personalBest?: boolean };
      const updated = await load(true);
      toast.success(result.personalBest ? "ACHIEVE · PERSONAL BEST" : "ACHIEVE");
      if (updated) {
        setLastAchieved({
          title: active.title,
          streak: updated.stats.totals.currentStreak,
          resultValue: result.resultValue ?? Number(resultValue),
          unitLabel: result.unitLabel ?? active.unitLabel,
          personalBest: Boolean(result.personalBest),
        });
      }
    } catch {
      toast.error("ACHIEVE unavailable");
    } finally {
      setBusy(false);
    }
  };

  const createShadow = async (performance: GTAPerformanceDTO | GTAStreakSeriesDTO) => {
    setBusy(true);
    try {
      const res = await fetch("/api/grind-achieve/shadow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE",
          ...( "attemptId" in performance
            ? { attemptId: performance.attemptId }
            : { seriesId: performance.id }),
        }),
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
    payload: { title: string; subtitle: string; statLabel?: string; statValue?: string; badge?: string; badgeCode?: string },
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
    { id: "SELF", label: t.self, Icon: Target },
    { id: "STATS", label: t.stats, Icon: TrendingUp },
    { id: "BADGES", label: t.badges, Icon: Award },
    { id: "BOOK", label: t.book, Icon: BookOpen },
  ];

  const renderCourt = () => (
    <div className="space-y-6">
      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.8fr)_340px]">
        <Panel green dark className="p-6 sm:p-8 xl:p-10">
          <div className="flex flex-col gap-5 border-b border-[#404040] pb-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-4xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#00821A]">
                  {active?.type === "SHADOW" ? t.shadowActive : active?.type === "SELF" ? t.self : t.adminChallenge}
                </span>
                <span className="h-1 w-1 rounded-full bg-[#BFBFBF]" />
                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#BFBFBF]">Q1 // 05:00</span>
              </div>
              <h2 className="mt-3 max-w-4xl text-4xl font-black uppercase leading-[.94] tracking-[-0.055em] sm:text-6xl xl:text-7xl">
                {active?.title ?? selectedChallenge?.title ?? t.noChallenge}
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-[#BFBFBF]">
                {active?.description ?? selectedChallenge?.description ?? t.noChallengeBody}
              </p>
              {(active ?? selectedChallenge) ? (
                <div className="mt-5 inline-flex flex-wrap items-center gap-3 rounded-sm border border-[#404040] bg-[#FFFFFF]/[0.04] px-4 py-3">
                  <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[#BFBFBF]">{t.target}</span>
                  <span className="text-lg font-black tabular-nums text-[#FFFFFF]">
                    {(active?.targetValue ?? selectedChallenge?.targetValue) ?? "OPEN"}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#00821A]">
                    {active?.unitLabel ?? selectedChallenge?.unitLabel ?? ""}
                  </span>
                </div>
              ) : null}
            </div>
            <span className={`shrink-0 rounded-sm border px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] ${clockState === t.live ? "gta-live border-[#00821A] bg-[#00821A]/10 text-[#00821A]" : "border-[#404040] text-[#BFBFBF]"}`}>
              {clockState}
            </span>
          </div>

          <div className="py-8 sm:py-10 xl:py-12">
            <div className="mx-auto max-w-5xl text-center">
              <div className="flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.28em] text-[#BFBFBF]">
                <span>{t.gameClock}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#00821A]" />
                <span>{active ? t.live : t.ready}</span>
              </div>
              <p className={`mt-4 font-mono text-[clamp(5rem,12vw,11rem)] font-black leading-[.78] tabular-nums tracking-[-0.085em] ${active && remaining <= 30 ? "gta-clock-live text-[#00821A]" : "text-[#FFFFFF]"}`}>
                {active ? formatClock(remaining) : "05:00"}
              </p>
              <div className="mx-auto mt-7 grid max-w-3xl grid-cols-[1fr_auto_1fr] items-center gap-4 border-y border-[#404040] py-5">
                <div className="text-right">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#BFBFBF]">HUSTLER</p>
                  <p className="mt-1 text-xl font-black uppercase sm:text-2xl">{hustler}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#404040] bg-[#FFFFFF]/10 text-sm font-black text-[#00821A]">
                  VS
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#BFBFBF]">{active?.type === "SHADOW" ? "SHADOW" : t.target}</p>
                  <p className="mt-1 text-xl font-black uppercase sm:text-2xl">
                    {active?.type === "SHADOW"
                      ? `${dashboard.activeShadow?.baselineValue ?? dashboard.activeShadow?.baselineLength ?? 0} ${dashboard.activeShadow?.unitLabel ?? ""}`
                      : `${active?.targetValue ?? selectedChallenge?.targetValue ?? "OPEN"} ${active?.unitLabel ?? selectedChallenge?.unitLabel ?? ""}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 border-t border-[#404040] pt-6 sm:grid-cols-[1fr_auto]">
            <button
              type="button"
              disabled={busy || (!active && !selectedChallenge) || Boolean(active && remaining > 0)}
              onClick={() => {
                if (active && remaining <= 0) setAchieveOpen(true);
                else if (!active && selectedChallenge) void startChallenge(selectedChallenge);
              }}
              className={`min-h-16 rounded-sm px-8 text-base font-black uppercase tracking-[0.24em] transition disabled:cursor-not-allowed ${actionLabel === t.achieve ? "bg-[#FFFFFF] text-[#000000] hover:bg-[#BFBFBF]" : "bg-[#00821A] text-[#FFFFFF] hover:brightness-95 disabled:opacity-55"}`}
            >
              {actionLabel}
            </button>
            <button
              type="button"
              onClick={() => setSoundEnabled((v) => !v)}
              className="inline-flex min-h-16 min-w-36 items-center justify-center gap-2 rounded-sm border border-[#404040] px-5 text-[10px] font-black uppercase tracking-[0.17em] text-[#BFBFBF]"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4 text-[#00821A]" /> : <VolumeX className="h-4 w-4" />}
              {soundEnabled ? t.buzzer : t.muted}
            </button>
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel green className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#00821A]">{t.hustlerCard}</p>
                <h3 className="mt-2 text-2xl font-black uppercase tracking-[-0.04em] text-[#000000]">{hustler}</h3>
              </div>
              <GlassOrb className="h-14 w-14"><UserRound className="h-6 w-6" /></GlassOrb>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Metric label={t.currentStreak} value={dashboard.stats.totals.currentStreak} />
              <Metric label={t.bestStreak} value={dashboard.stats.totals.bestStreak} />
              <Metric label={t.sessions} value={dashboard.stats.totals.sessionsAchieved} />
              <Metric label={t.minutes} value={dashboard.stats.totals.totalMinutes} />
            </div>
            <div className="mt-5 grid grid-cols-3 border-t border-[#BFBFBF] pt-5 text-center">
              <div><p className="text-2xl font-black text-[#000000]">{dashboard.stats.resilience.rating}</p><p className="mt-1 text-[8px] font-black uppercase tracking-[0.15em] text-[#404040]">R</p></div>
              <div className="border-x border-[#BFBFBF]"><p className="text-2xl font-black text-[#000000]">{dashboard.stats.consistency.rating}</p><p className="mt-1 text-[8px] font-black uppercase tracking-[0.15em] text-[#404040]">C</p></div>
              <div><p className="text-2xl font-black text-[#00821A]">{dashboard.stats.focus.rating}</p><p className="mt-1 text-[8px] font-black uppercase tracking-[0.15em] text-[#404040]">F</p></div>
            </div>
          </Panel>

          <Panel className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#404040]">{t.shadow}</p>
                <p className="mt-2 text-2xl font-black uppercase text-[#000000]">
                  {dashboard.activeShadow
                    ? `${dashboard.activeShadow.currentBest ?? dashboard.activeShadow.currentRun} ${t.versus} ${dashboard.activeShadow.baselineValue ?? dashboard.activeShadow.baselineLength ?? 0} ${dashboard.activeShadow.unitLabel ?? ""}`
                    : t.yourShadowWaiting}
                </p>
              </div>
              <GlassOrb className="h-12 w-12"><Swords className="h-5 w-5" /></GlassOrb>
            </div>
            <p className="mt-4 text-sm leading-6 text-[#404040]">
              {dashboard.activeShadow
                ? `${t.beat} ${dashboard.activeShadow.targetValue ?? dashboard.activeShadow.targetLength ?? "—"} ${dashboard.activeShadow.unitLabel ?? ""}`
                : t.shadowWaitingBody}
            </p>
            <button type="button" onClick={() => setScreen("SHADOW")} className="mt-5 min-h-12 w-full rounded-sm border border-[#00821A] bg-white/70 text-[10px] font-black uppercase tracking-[0.18em] text-[#00821A]">
              {t.shadow}
            </button>
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
                {lastAchieved.resultValue != null ? (
                  <p className="mt-1 text-sm font-black uppercase text-[#00821A]">
                    {lastAchieved.resultValue} {lastAchieved.unitLabel} {lastAchieved.personalBest ? "· PERSONAL BEST" : ""}
                  </p>
                ) : null}
              </div>
            </div>
            <button type="button" disabled={shareBusy} onClick={() => void shareEffort({ title: lastAchieved.title, subtitle: "05:00 ACHIEVED", statLabel: t.currentStreak, statValue: String(lastAchieved.streak) })} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-[#00821A] px-5 text-[10px] font-black uppercase tracking-[0.16em] text-[#FFFFFF] disabled:opacity-40">
              <Share2 className="h-4 w-4" />{t.shareStory}
            </button>
          </div>
        </Panel>
      ) : null}

      <Panel className="p-5 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#BFBFBF] pb-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00821A]">{t.challengeBoard}</p>
            <h3 className="mt-2 text-3xl font-black uppercase tracking-[-0.04em] text-[#000000]">MILOS BG / 5:00</h3>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#404040]">{dashboard.challenges.length} {t.availableNow}</p>
        </div>
        {dashboard.challenges.length ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {dashboard.challenges.map((challenge, index) => {
              const selected = selectedChallenge?.id === challenge.id;
              return (
                <button key={challenge.id} type="button" disabled={Boolean(active)} onClick={() => setSelectedChallengeId(challenge.id)} className={`group min-h-[180px] rounded-sm border p-5 text-left transition ${selected ? "border-[#00821A] bg-white shadow-[0_12px_30px_rgba(0,130,26,.10)]" : "border-[#BFBFBF] bg-white/55 hover:border-[#00821A] hover:bg-white"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <GlassOrb className="h-11 w-11"><Target className="h-4 w-4" /></GlassOrb>
                      <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[#404040]">#{String(index + 1).padStart(2, "0")}</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#00821A]">05:00</span>
                  </div>
                  <p className="mt-5 text-lg font-black uppercase leading-tight text-[#000000]">{challenge.title}</p>
                  <p className="mt-2 line-clamp-2 text-sm leading-5 text-[#404040]">{challenge.description}</p>
                  <p className="mt-3 text-[9px] font-black uppercase tracking-[0.16em] text-[#00821A]">
                    TARGET · {challenge.targetValue ?? "OPEN"} {challenge.unitLabel}
                  </p>
                  <div className="mt-4 h-1 w-full bg-[#BFBFBF]/40"><div className={`h-full transition-all ${selected ? "w-full bg-[#00821A]" : "w-1/4 bg-[#404040] group-hover:w-2/3 group-hover:bg-[#00821A]"}`} /></div>
                </button>
              );
            })}
          </div>
        ) : <p className="mt-5 text-sm text-[#404040]">{t.noChallengeBody}</p>}
      </Panel>
    </div>
  );

  const renderShadow = () => {
    const performances = dashboard.performances ?? [];
    const activeShadow = dashboard.activeShadow;
    const shadowBaseline = activeShadow?.baselineValue ?? activeShadow?.baselineLength ?? 0;
    const shadowTarget = activeShadow?.targetValue ?? activeShadow?.targetLength ?? 0;
    const shadowUnit = activeShadow?.unitLabel ?? "";

    return (
      <div className="space-y-6">
        <Panel green dark className="overflow-hidden">
          <div className="grid lg:grid-cols-[1.1fr_.9fr]">
            <div className="p-6 sm:p-8 xl:p-10">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#00821A]">SHADOW CHALLENGE</p>
              <h2 className="mt-3 text-4xl font-black uppercase leading-[.94] tracking-[-0.05em] sm:text-6xl xl:text-7xl">{t.shadowTitle}</h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-[#BFBFBF]">
                Pick one of your real measured performances and beat that number in another five-minute run.
              </p>
              <div className="mt-8 inline-flex items-center gap-3 border-t border-[#404040] pt-5 text-[9px] font-black uppercase tracking-[0.2em] text-[#BFBFBF]">
                <Swords className="h-4 w-4 text-[#00821A]" />
                {t.noLeaderboard}
              </div>
            </div>
            <div className="relative flex min-h-[320px] items-center justify-center border-t border-[#404040] p-6 lg:border-l lg:border-t-0">
              <div className="relative z-[1] w-full max-w-md">
                <p className="text-center text-[9px] font-black uppercase tracking-[0.24em] text-[#BFBFBF]">{t.shadowPreview}</p>
                <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-center">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#BFBFBF]">YOU</p>
                    <p className="mt-2 text-6xl font-black tabular-nums text-[#00821A]">
                      {activeShadow?.currentBest ?? "—"}
                    </p>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#404040] bg-[#FFFFFF]/10 text-xs font-black text-[#FFFFFF]">VS</div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#BFBFBF]">SHADOW</p>
                    <p className="mt-2 text-6xl font-black tabular-nums text-[#FFFFFF]">
                      {activeShadow ? shadowBaseline : performances[0]?.resultValue ?? "—"}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-center text-[10px] font-black uppercase tracking-[0.16em] text-[#00821A]">
                  {activeShadow ? `${t.beat} ${shadowTarget} ${shadowUnit}` : t.yourShadowWaiting}
                </p>
              </div>
            </div>
          </div>
        </Panel>

        {activeShadow ? (
          <Panel green className="p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00821A]">{t.shadowActive}</p>
                <h3 className="mt-2 text-3xl font-black uppercase tracking-[-0.04em] text-[#000000]">
                  BEAT {shadowBaseline} {shadowUnit}
                </h3>
              </div>
              <GlassOrb className="h-14 w-14"><Swords className="h-6 w-6" /></GlassOrb>
            </div>
            <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Metric label={t.previousRun} value={shadowBaseline} suffix={` ${shadowUnit}`} />
              <Metric label="CURRENT BEST" value={activeShadow.currentBest ?? 0} suffix={` ${shadowUnit}`} />
              <Metric label={t.shadowTarget} value={shadowTarget} suffix={` ${shadowUnit}`} />
              <Metric label={t.attempts} value={activeShadow.attempts} />
            </div>
            <button type="button" disabled={Boolean(active) || busy} onClick={() => void startChallenge(undefined, activeShadow.id)} className="mt-7 min-h-16 w-full rounded-sm bg-[#00821A] px-6 text-sm font-black uppercase tracking-[0.22em] text-[#FFFFFF] disabled:opacity-45">
              {t.grind}
            </button>
          </Panel>
        ) : performances.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {performances.slice(0, 12).map((performance) => (
              <Panel key={performance.attemptId} className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <GlassOrb className="h-12 w-12"><History className="h-5 w-5" /></GlassOrb>
                  <span className="rounded-sm border border-[#BFBFBF] px-2 py-1 text-[8px] font-black uppercase tracking-[0.15em] text-[#404040]">
                    {performance.type}
                  </span>
                </div>
                <p className="mt-5 text-sm font-black uppercase text-[#000000]">{performance.title}</p>
                <div className="mt-3 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-5xl font-black tabular-nums text-[#000000]">{performance.resultValue}</p>
                    <p className="mt-1 text-[9px] font-black uppercase tracking-[0.15em] text-[#404040]">{performance.unitLabel}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black uppercase tracking-[0.16em] text-[#404040]">{t.shadowTarget}</p>
                    <p className="mt-1 text-3xl font-black text-[#00821A]">{Math.round((performance.resultValue + 1) * 100) / 100}</p>
                  </div>
                </div>
                <button type="button" disabled={busy} onClick={() => void createShadow(performance)} className="mt-6 min-h-12 w-full rounded-sm bg-[#00821A] px-4 text-[10px] font-black uppercase tracking-[0.17em] text-[#FFFFFF]">
                  {t.launchShadow}
                </button>
              </Panel>
            ))}
          </div>
        ) : (
          <Panel className="p-7 sm:p-9">
            <div className="grid gap-8 lg:grid-cols-[.75fr_1.25fr] lg:items-center">
              <div>
                <GlassOrb className="h-16 w-16"><Lock className="h-6 w-6" /></GlassOrb>
                <p className="mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#00821A]">{t.yourShadowWaiting}</p>
                <h3 className="mt-2 text-3xl font-black uppercase tracking-[-0.04em] text-[#000000]">SET A SCORE. THEN BEAT IT.</h3>
                <p className="mt-4 max-w-xl text-sm leading-7 text-[#404040]">
                  Complete a measurable Admin or Self challenge first. Its result becomes a possible Shadow.
                </p>
                <button type="button" onClick={() => setScreen("SELF")} className="mt-6 min-h-12 rounded-sm bg-[#00821A] px-6 text-[10px] font-black uppercase tracking-[0.16em] text-[#FFFFFF]">
                  CREATE A SELF CHALLENGE
                </button>
              </div>
              <div className="border border-[#BFBFBF] bg-[#000000] p-6 text-[#FFFFFF]">
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-center">
                  <div><p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#BFBFBF]">YOU</p><p className="mt-2 text-5xl font-black text-[#00821A]">--</p></div>
                  <Lock className="h-5 w-5 text-[#BFBFBF]" />
                  <div><p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#BFBFBF]">SHADOW</p><p className="mt-2 text-5xl font-black">--</p></div>
                </div>
              </div>
            </div>
          </Panel>
        )}
      </div>
    );
  };

  const renderSelf = () => (
    <div className="space-y-6">
      <Panel green dark className="p-6 sm:p-8 xl:p-10">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#00821A]">SELF CHALLENGE</p>
        <h2 className="mt-3 text-4xl font-black uppercase tracking-[-0.05em] sm:text-6xl">{t.selfTitle}</h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#BFBFBF]">{t.selfBody}</p>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
        <Panel className="p-6">
          <label className="block">
            <span className="text-[9px] font-black uppercase tracking-[0.16em] text-[#404040]">{t.selfChallengeName}</span>
            <input value={selfTitle} onChange={(e) => setSelfTitle(e.target.value)} placeholder="SIT UP BURST" className="mt-2 w-full rounded-sm border border-[#BFBFBF] bg-[#FFFFFF] px-4 py-3 text-sm font-bold outline-none focus:border-[#00821A]" />
          </label>
          <label className="mt-4 block">
            <span className="text-[9px] font-black uppercase tracking-[0.16em] text-[#404040]">DESCRIPTION</span>
            <textarea value={selfDescription} onChange={(e) => setSelfDescription(e.target.value)} rows={3} className="mt-2 w-full resize-none rounded-sm border border-[#BFBFBF] bg-[#FFFFFF] px-4 py-3 text-sm outline-none focus:border-[#00821A]" placeholder="What exactly are you doing for five minutes?" />
          </label>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <label>
              <span className="text-[9px] font-black uppercase tracking-[0.16em] text-[#404040]">{t.measure}</span>
              <select value={selfMeasurementType} onChange={(e) => setSelfMeasurementType(e.target.value as GTAMeasurementType)} className="mt-2 w-full rounded-sm border border-[#BFBFBF] bg-[#FFFFFF] px-3 py-3 text-sm outline-none focus:border-[#00821A]">
                <option value="COUNT">COUNT</option>
                <option value="DISTANCE">DISTANCE</option>
                <option value="TIME_HELD">TIME HELD</option>
                <option value="PAGES">PAGES</option>
                <option value="WORDS">WORDS</option>
                <option value="CUSTOM">CUSTOM</option>
              </select>
            </label>
            <label>
              <span className="text-[9px] font-black uppercase tracking-[0.16em] text-[#404040]">{t.unit}</span>
              <input value={selfUnitLabel} onChange={(e) => setSelfUnitLabel(e.target.value)} placeholder="sit ups" className="mt-2 w-full rounded-sm border border-[#BFBFBF] bg-[#FFFFFF] px-3 py-3 text-sm outline-none focus:border-[#00821A]" />
            </label>
            <label>
              <span className="text-[9px] font-black uppercase tracking-[0.16em] text-[#404040]">{t.target}</span>
              <input type="number" min="0" step="any" value={selfTargetValue} onChange={(e) => setSelfTargetValue(e.target.value)} placeholder="50" className="mt-2 w-full rounded-sm border border-[#BFBFBF] bg-[#FFFFFF] px-3 py-3 text-sm outline-none focus:border-[#00821A]" />
            </label>
          </div>
          <div className="mt-5 rounded-sm border border-[#BFBFBF] bg-[#BFBFBF]/20 p-4">
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#404040]">GAME CLOCK</p>
            <p className="mt-1 text-4xl font-black tabular-nums text-[#000000]">05:00</p>
          </div>
          <button type="button" disabled={busy || Boolean(active) || !selfTitle.trim() || !selfUnitLabel.trim()} onClick={() => void startSelfChallenge()} className="mt-5 min-h-14 w-full rounded-sm bg-[#00821A] px-5 text-xs font-black uppercase tracking-[0.2em] text-[#FFFFFF] disabled:opacity-40">
            {t.startSelf}
          </button>
        </Panel>

        <Panel className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#00821A]">YOUR MEASURED HISTORY</p>
              <h3 className="mt-1 text-2xl font-black uppercase tracking-[-0.04em] text-[#000000]">BUILD THE BASELINE</h3>
            </div>
            <GlassOrb className="h-12 w-12"><TrendingUp className="h-5 w-5" /></GlassOrb>
          </div>
          <div className="mt-5 space-y-3">
            {(dashboard.performances ?? []).slice(0, 8).map((performance) => (
              <button
                key={performance.attemptId}
                type="button"
                onClick={() => {
                  setSelfTitle(performance.title);
                  setSelfMeasurementType(performance.measurementType);
                  setSelfUnitLabel(performance.unitLabel);
                  setSelfTargetValue(String(Math.max(performance.targetValue ?? 0, performance.resultValue + 1)));
                }}
                className="grid w-full grid-cols-[1fr_auto] items-center gap-4 rounded-sm border border-[#BFBFBF] bg-[#FFFFFF] p-4 text-left hover:border-[#00821A]"
              >
                <div>
                  <p className="text-sm font-black uppercase text-[#000000]">{performance.title}</p>
                  <p className="mt-1 text-[9px] font-black uppercase tracking-[0.15em] text-[#404040]">{performance.type} · {performance.measurementType}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black tabular-nums text-[#00821A]">{performance.resultValue}</p>
                  <p className="text-[8px] font-black uppercase tracking-[0.15em] text-[#404040]">{performance.unitLabel}</p>
                </div>
              </button>
            ))}
            {!dashboard.performances?.length ? <p className="text-sm text-[#404040]">Your first result will appear here.</p> : null}
          </div>
        </Panel>
      </div>
    </div>
  );

  const renderStats = () => {
    const s = dashboard.stats;
    return (
      <div className="space-y-6">
        <Panel green className="overflow-hidden">
          <div className="grid xl:grid-cols-[280px_minmax(0,1fr)_320px]">
            <div className="bg-[#000000] p-6 text-[#FFFFFF] sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#00821A]">{t.playerProfile}</p>
                  <h2 className="mt-2 text-4xl font-black uppercase leading-[.92] tracking-[-0.05em]">{hustler}</h2>
                </div>
                <GlassOrb className="h-14 w-14"><UserRound className="h-6 w-6" /></GlassOrb>
              </div>
              <p className="mt-6 text-sm leading-6 text-[#BFBFBF]">{t.performanceBody}</p>
              <div className="mt-7 grid grid-cols-2 gap-3">
                <div className="border border-[#404040] p-4"><p className="text-[8px] font-black uppercase tracking-[0.18em] text-[#BFBFBF]">{t.currentStreak}</p><p className="mt-2 text-4xl font-black tabular-nums">{s.totals.currentStreak}</p></div>
                <div className="border border-[#404040] p-4"><p className="text-[8px] font-black uppercase tracking-[0.18em] text-[#BFBFBF]">{t.bestStreak}</p><p className="mt-2 text-4xl font-black tabular-nums">{s.totals.bestStreak}</p></div>
                <div className="border border-[#404040] p-4"><p className="text-[8px] font-black uppercase tracking-[0.18em] text-[#BFBFBF]">{t.sessions}</p><p className="mt-2 text-4xl font-black tabular-nums text-[#00821A]">{s.totals.sessionsAchieved}</p></div>
                <div className="border border-[#404040] p-4"><p className="text-[8px] font-black uppercase tracking-[0.18em] text-[#BFBFBF]">{t.minutes}</p><p className="mt-2 text-4xl font-black tabular-nums">{s.totals.totalMinutes}</p></div>
              </div>
              <div className="mt-6 border-t border-[#404040] pt-5">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#BFBFBF]">{t.noLeaderboard}</p>
              </div>
            </div>

            <div className="flex min-h-[520px] items-center justify-center bg-[#FFFFFF]/80 p-5 sm:p-8 xl:min-h-[620px]">
              <div className="w-full">
                <div className="mb-2 text-center">
                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#00821A]">{t.hustleRating}</p>
                  <p className="mt-1 text-2xl font-black uppercase tracking-[-0.04em] text-[#000000]">RESILIENCE / CONSISTENCY / FOCUS</p>
                </div>
                <RadarChart stats={s} labels={[t.resilience, t.consistency, t.focus]} />
              </div>
            </div>

            <div className="border-t border-[#BFBFBF] bg-white/70 p-6 sm:p-8 xl:border-l xl:border-t-0">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#404040]">{t.seasonForm}</p>
              <div className="mt-5 space-y-5">
                {[
                  [t.resilience, s.resilience.rating, Shield],
                  [t.consistency, s.consistency.rating, History],
                  [t.focus, s.focus.rating, Target],
                ].map(([label, value, Icon], index) => {
                  const C = Icon as ComponentType<{ className?: string }>;
                  const n = Number(value);
                  return (
                    <div key={String(label)}>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3"><C className={`h-5 w-5 ${index === 2 ? "text-[#00821A]" : "text-[#000000]"}`} /><span className="text-xs font-black uppercase tracking-[0.14em] text-[#000000]">{String(label)}</span></div>
                        <span className={`text-3xl font-black tabular-nums ${index === 2 ? "text-[#00821A]" : "text-[#000000]"}`}>{n}</span>
                      </div>
                      <div className="mt-3 h-1.5 bg-[#BFBFBF]/40"><div className="h-full bg-[#00821A]" style={{ width: `${Math.max(0, Math.min(100, n))}%` }} /></div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-8 border-t border-[#BFBFBF] pt-6">
                <div className="grid grid-cols-2 gap-3">
                  <Metric label={t.completion} value={s.consistency.completionRate} suffix="%" />
                  <Metric label={t.timerCompletion} value={s.focus.timerCompletionRate} suffix="%" />
                </div>
              </div>
            </div>
          </div>
        </Panel>

        <div className="grid gap-5 xl:grid-cols-3">
          <Panel className="p-6">
            <div className="flex items-center justify-between gap-3"><h3 className="text-xl font-black uppercase text-[#000000]">{t.resilience}</h3><span className="text-5xl font-black text-[#00821A]">{s.resilience.rating}</span></div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Metric label={t.returnRate} value={s.resilience.returnRate} suffix="%" />
              <Metric label={t.recovery} value={s.resilience.medianRecoveryHours ?? "—"} suffix={s.resilience.medianRecoveryHours !== null ? t.hours : ""} />
              <Metric label={t.shadowWin} value={s.resilience.shadowWinRate} suffix="%" />
              <Metric label={t.retryImprovement} value={s.resilience.retryImprovementRate} suffix="%" />
            </div>
          </Panel>
          <Panel className="p-6">
            <div className="flex items-center justify-between gap-3"><h3 className="text-xl font-black uppercase text-[#000000]">{t.consistency}</h3><span className="text-5xl font-black text-[#00821A]">{s.consistency.rating}</span></div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Metric label={t.sevenDay} value={s.consistency.sevenDayRate} suffix="%" />
              <Metric label={t.twentyEightDay} value={s.consistency.twentyEightDayRate} suffix="%" />
              <Metric label={t.progression} value={`${s.consistency.progressionPoints >= 0 ? "+" : ""}${s.consistency.progressionPoints}`} suffix={` ${t.pts}`} />
              <Metric label={t.performanceProgress} value={`${s.consistency.performanceProgressionRate >= 0 ? "+" : ""}${s.consistency.performanceProgressionRate}`} suffix="%" />
            </div>
          </Panel>
          <Panel className="p-6">
            <div className="flex items-center justify-between gap-3"><h3 className="text-xl font-black uppercase text-[#000000]">{t.focus}</h3><span className="text-5xl font-black text-[#00821A]">{s.focus.rating}</span></div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Metric label={t.timerCompletion} value={s.focus.timerCompletionRate} suffix="%" />
              <Metric label={t.focusAverage} value={s.focus.focusCheckAverage} suffix="%" />
              <Metric label={t.resultCapture} value={s.focus.resultCaptureRate} suffix="%" />
              <Metric label={t.repeatFocus} value={s.focus.repeatFocusRate} suffix="%" />
            </div>
          </Panel>
        </div>

        <Panel green className="p-6 sm:p-7">
          <div className="grid gap-4 md:grid-cols-4">
            <Metric label="MEASURED SESSIONS" value={s.performance.measuredSessions} />
            <Metric label={t.targetHit} value={s.performance.targetHitRate} suffix="%" />
            <Metric label={t.personalBests} value={s.performance.personalBests} />
            <Metric
              label="LATEST"
              value={s.performance.latestResult ?? "—"}
              suffix={s.performance.latestResult !== null ? ` ${s.performance.latestUnit}` : ""}
            />
          </div>
        </Panel>

        <Panel className="p-6 sm:p-7">
          <div className="mb-6 flex items-center justify-between gap-3"><div><p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#00821A]">{t.trend}</p><h3 className="mt-1 text-2xl font-black uppercase text-[#000000]">R / C / F PERFORMANCE</h3></div><TrendingUp className="h-6 w-6 text-[#00821A]" /></div>
          <TrendGraph stats={s} />
          <div className="mt-5 flex flex-wrap gap-5 text-[10px] font-black uppercase tracking-[0.15em] text-[#404040]">
            <span className="flex items-center gap-2"><span className="h-2 w-8 bg-[#000000]" />{t.resilience}</span>
            <span className="flex items-center gap-2"><span className="h-2 w-8 bg-[#404040]" />{t.consistency}</span>
            <span className="flex items-center gap-2"><span className="h-2 w-8 bg-[#00821A]" />{t.focus}</span>
          </div>
        </Panel>
      </div>
    );
  };

  const renderBadges = () => {
    const catalog = badgeCatalog[lang];
    const knownCodes = new Set<string>(catalog.map((item) => item.code));
    const customAwards = dashboard.badges.filter((badge) => !knownCodes.has(badge.code));

    return (
      <div className="space-y-6">
        <Panel green className="p-6 sm:p-8 xl:p-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00821A]">{t.collection}</p>
              <h2 className="mt-2 text-4xl font-black uppercase leading-[.94] tracking-[-0.05em] text-[#000000] sm:text-6xl xl:text-7xl">{t.badgesTitle}</h2>
              <p className="mt-5 max-w-3xl text-sm leading-7 text-[#404040]">{t.collectionBody}</p>
            </div>
            <div className="min-w-40 border border-[#BFBFBF] bg-white/60 p-5 text-center">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#404040]">{t.earned}</p>
              <p className="mt-2 text-5xl font-black text-[#00821A]">{dashboard.badges.length}</p>
              <p className="mt-1 text-[9px] font-black uppercase tracking-[0.16em] text-[#404040]">/ {catalog.length + customAwards.length}</p>
            </div>
          </div>
        </Panel>

        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {catalog.map((item) => {
            const award = dashboard.badges.find((badge) => badge.code === item.code);
                        const earned = Boolean(award);
            return (
              <article
                key={item.code}
                className={`gta-collector-card rounded-sm border p-6 ${
                  earned
                    ? "gta-collector-earned border-[#00821A] text-[#000000]"
                    : "gta-collector-locked text-[#FFFFFF]"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div
                    className={`flex h-20 w-20 items-center justify-center rounded-full border backdrop-blur-md ${
                      earned
                        ? "border-[#FFFFFF]/85 bg-[#FFFFFF]/45 shadow-[0_0_32px_rgba(0,130,26,.24)]"
                        : "border-[#BFBFBF]/45 bg-[#404040]"
                    }`}
                  >
                    <BadgeEmblem
                      code={item.code}
                      className={`h-10 w-10 ${earned ? "text-[#000000]" : "text-[#BFBFBF]"}`}
                    />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`rounded-sm border px-3 py-2 text-[9px] font-black uppercase tracking-[0.18em] ${
                        earned
                          ? "border-[#00821A] bg-[#FFFFFF]/65 text-[#00821A]"
                          : "border-[#BFBFBF]/60 bg-[#000000] text-[#FFFFFF]"
                      }`}
                    >
                      {earned ? t.earned : t.locked}
                    </span>
                    <span className={`text-[8px] font-black uppercase tracking-[0.18em] ${earned ? "text-[#404040]" : "text-[#BFBFBF]"}`}>
                      MILOS BG · BADGE
                    </span>
                  </div>
                </div>

                <div className="mt-8">
                  <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${earned ? "text-[#00821A]" : "text-[#BFBFBF]"}`}>
                    {item.code.replaceAll("_", " ")}
                  </p>
                  <h3 className={`mt-2 text-3xl font-black uppercase tracking-[-0.05em] ${earned ? "text-[#000000]" : "text-[#FFFFFF]"}`}>
                    {award?.name ?? item.name}
                  </h3>
                  <p className={`mt-4 min-h-[58px] text-sm leading-6 ${earned ? "text-[#404040]" : "text-[#BFBFBF]"}`}>
                    {award?.description ?? item.description}
                  </p>
                </div>

                {award?.message ? (
                  <blockquote className="mt-5 border-l-2 border-[#00821A] bg-[#FFFFFF]/45 py-2 pl-3 pr-2 text-sm font-semibold text-[#404040] backdrop-blur-md">
                    {award.message}
                  </blockquote>
                ) : null}

                <div className={`mt-7 border-t pt-4 ${earned ? "border-[#BFBFBF]" : "border-[#404040]"}`}>
                  {earned && award ? (
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-[0.18em] text-[#404040]">
                          {award.source === "ADMIN" ? t.byAdmin : t.bySystem}
                        </p>
                        <p className="mt-1 text-xs font-black text-[#000000]">
                          {new Date(award.awardedAt).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US")}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={shareBusy}
                        onClick={() => void shareEffort({ title: award.name, subtitle: "BADGE EARNED", badge: award.name, badgeCode: award.code })}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border border-[#00821A] bg-[#FFFFFF]/70 px-5 text-[9px] font-black uppercase tracking-[0.16em] text-[#00821A] backdrop-blur-md disabled:opacity-40"
                      >
                        <Share2 className="h-4 w-4" />
                        {t.shareBadge}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.18em] text-[#BFBFBF]">
                        <Lock className="h-3.5 w-3.5" />
                        {t.locked}
                      </div>
                      <p className="text-right text-[8px] font-black uppercase tracking-[0.16em] text-[#BFBFBF]">
                        KEEP GRINDING
                      </p>
                    </div>
                  )}
                </div>
              </article>
            );
          })}

          {customAwards.map((badge) => {
            return (
              <article key={badge.id} className="gta-collector-card gta-collector-earned rounded-sm border border-[#00821A] p-6 text-[#000000]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#FFFFFF]/85 bg-[#FFFFFF]/45 shadow-[0_0_32px_rgba(0,130,26,.24)] backdrop-blur-md">
                    <BadgeEmblem code={badge.code} className="h-10 w-10 text-[#000000]" />
                  </div>
                  <span className="rounded-sm border border-[#00821A] bg-[#FFFFFF]/65 px-3 py-2 text-[9px] font-black uppercase tracking-[0.18em] text-[#00821A]">
                    {t.earned}
                  </span>
                </div>
                <p className="mt-8 text-[9px] font-black uppercase tracking-[0.2em] text-[#00821A]">MILOS BG · SPECIAL BADGE</p>
                <h3 className="mt-2 text-3xl font-black uppercase tracking-[-0.05em] text-[#000000]">{badge.name}</h3>
                <p className="mt-4 text-sm leading-6 text-[#404040]">{badge.description}</p>
                {badge.message ? (
                  <blockquote className="mt-5 border-l-2 border-[#00821A] bg-[#FFFFFF]/45 py-2 pl-3 pr-2 text-sm font-semibold text-[#404040] backdrop-blur-md">
                    {badge.message}
                  </blockquote>
                ) : null}
                <div className="mt-7 border-t border-[#BFBFBF] pt-4">
                  <button
                    type="button"
                    disabled={shareBusy}
                    onClick={() => void shareEffort({ title: badge.name, subtitle: "BADGE EARNED", badge: badge.name, badgeCode: badge.code })}
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-sm border border-[#00821A] bg-[#FFFFFF]/70 px-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#00821A] backdrop-blur-md disabled:opacity-40"
                  >
                    <Share2 className="h-4 w-4" />
                    {t.shareBadge}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    );
  };

  const renderBook = () => (
    <Panel green className="p-6 sm:p-9">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00821A]">{t.bookEyebrow}</p>
          <h2 className="mt-2 text-4xl font-black uppercase tracking-[-0.04em] text-[#000000] sm:text-6xl">{t.bookTitle}</h2>
          <p className="mt-5 max-w-xl text-sm leading-7 text-[#404040]">{t.bookBody}</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href={bookUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-sm bg-[#00821A] px-6 text-xs font-black uppercase tracking-[0.16em] text-[#FFFFFF]">{t.physicalBook}</Link>
            <Link href={ebookUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-sm border border-[#000000] bg-[#FFFFFF] px-6 text-xs font-black uppercase tracking-[0.16em] text-[#000000]">{t.ebookCta}</Link>
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
            <div className="mt-6 rounded-sm border border-[#00821A] bg-[#00821A]/[0.05] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00821A]">{t.resultQuestion}</p>
              <p className="mt-2 text-sm leading-6 text-[#404040]">{t.resultBody}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                <label className="block">
                  <span className="text-[9px] font-black uppercase tracking-[0.16em] text-[#404040]">
                    {t.result} · {active?.unitLabel || "reps"}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    inputMode="decimal"
                    value={resultValue}
                    onChange={(e) => setResultValue(e.target.value)}
                    className="mt-2 w-full rounded-sm border border-[#BFBFBF] bg-[#FFFFFF] px-4 py-4 text-3xl font-black tabular-nums text-[#000000] outline-none focus:border-[#00821A]"
                    placeholder="0"
                  />
                </label>
                <div className="rounded-sm border border-[#BFBFBF] bg-[#FFFFFF] px-4 py-3 text-right">
                  <p className="text-[8px] font-black uppercase tracking-[0.16em] text-[#404040]">{t.target}</p>
                  <p className="mt-1 text-xl font-black text-[#000000]">
                    {active?.targetValue ?? "—"} {active?.unitLabel || ""}
                  </p>
                </div>
              </div>
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
              <button type="button" disabled={!focusCheck || !resultValue.trim() || busy} onClick={() => void achieve()} className="min-h-12 rounded-sm bg-[#00821A] text-xs font-black uppercase tracking-[0.16em] text-[#FFFFFF] disabled:opacity-40">{t.confirmAchieve}</button>
            </div>
          </div>
        </div>
      ) : null}

      <header className="border-b border-[#BFBFBF] bg-[#FFFFFF]/85 px-5 py-5 backdrop-blur-md sm:px-7 xl:px-9">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <GlassOrb className="h-14 w-14"><Mark className="h-7 w-7" /></GlassOrb>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-black tracking-[-0.05em] text-[#000000] sm:text-4xl">{t.title}</h1>
                <span className="rounded-sm border border-[#00821A] px-2 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-[#00821A]">{t.member}</span>
              </div>
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

      <div className="grid gap-6 p-4 sm:p-6 xl:grid-cols-[250px_minmax(0,1fr)] xl:p-8">
        <aside className="space-y-5 xl:sticky xl:top-5 xl:self-start">
          <Panel className="p-3">
            <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 xl:grid-cols-1">
              {nav.map(({ id, label, Icon }) => (
                <button key={id} type="button" onClick={() => setScreen(id)} className={`flex min-h-12 w-full items-center gap-3 rounded-sm px-4 text-left text-[10px] font-black uppercase tracking-[0.16em] transition ${screen === id ? "bg-[#00821A] text-[#FFFFFF] shadow-[0_10px_22px_rgba(0,130,26,.16)]" : "bg-white/50 text-[#404040] hover:bg-white"}`}>
                  <Icon className="h-4 w-4" />{label}
                </button>
              ))}
            </nav>
          </Panel>

          <Panel green className="hidden p-5 xl:block">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#00821A]">{t.hustlerCard}</p>
                <p className="mt-2 text-xl font-black uppercase tracking-[-0.03em] text-[#000000]">{hustler}</p>
              </div>
              <GlassOrb className="h-11 w-11"><UserRound className="h-5 w-5" /></GlassOrb>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <div className="border border-[#BFBFBF] bg-white/60 p-3"><p className="text-[7px] font-black uppercase tracking-[0.16em] text-[#404040]">CURRENT</p><p className="mt-1 text-2xl font-black text-[#000000]">{dashboard.stats.totals.currentStreak}</p></div>
              <div className="border border-[#BFBFBF] bg-white/60 p-3"><p className="text-[7px] font-black uppercase tracking-[0.16em] text-[#404040]">BEST</p><p className="mt-1 text-2xl font-black text-[#000000]">{dashboard.stats.totals.bestStreak}</p></div>
              <div className="col-span-2 border border-[#BFBFBF] bg-white/60 p-3"><p className="text-[7px] font-black uppercase tracking-[0.16em] text-[#404040]">5-MIN SESSIONS</p><p className="mt-1 text-2xl font-black text-[#00821A]">{dashboard.stats.totals.sessionsAchieved}</p></div>
            </div>
            <div className="mt-5 grid grid-cols-3 border-t border-[#BFBFBF] pt-4 text-center">
              <div><p className="text-xl font-black text-[#000000]">{dashboard.stats.resilience.rating}</p><p className="text-[7px] font-black uppercase tracking-[0.15em] text-[#404040]">R</p></div>
              <div className="border-x border-[#BFBFBF]"><p className="text-xl font-black text-[#000000]">{dashboard.stats.consistency.rating}</p><p className="text-[7px] font-black uppercase tracking-[0.15em] text-[#404040]">C</p></div>
              <div><p className="text-xl font-black text-[#00821A]">{dashboard.stats.focus.rating}</p><p className="text-[7px] font-black uppercase tracking-[0.15em] text-[#404040]">F</p></div>
            </div>
          </Panel>

          <Panel className="hidden p-5 xl:block">
            <p className="text-[8px] font-black uppercase tracking-[0.18em] text-[#404040]">{t.noLeaderboard}</p>
            <div className="mt-4 h-1 w-full bg-[#BFBFBF]/40"><div className="h-full w-3/5 bg-[#00821A]" /></div>
          </Panel>
        </aside>

        <main className="min-w-0">
          <div key={screen} className="gta-screen">
            {screen === "COURT" ? renderCourt() : null}
            {screen === "SHADOW" ? renderShadow() : null}
            {screen === "SELF" ? renderSelf() : null}
            {screen === "STATS" ? renderStats() : null}
            {screen === "BADGES" ? renderBadges() : null}
            {screen === "BOOK" ? renderBook() : null}
          </div>
        </main>
      </div>
    </div>
  );
}
