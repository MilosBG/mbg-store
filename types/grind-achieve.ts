export type GTAChallengeSource = "ADMIN" | "SHADOW" | "SELF";
export type GTAAttemptStatus = "READY" | "LIVE" | "ACHIEVED" | "ABANDONED";
export type GTAFocusCheck = "LOCKED_IN" | "RETURNED" | "LOST_FOCUS";
export type GTAShadowStatus = "READY" | "ACTIVE" | "BROKEN" | "RETURNED" | "WON" | "ABANDONED";
export type GTAMeasurementType = "COUNT" | "DISTANCE" | "TIME_HELD" | "PAGES" | "WORDS" | "CUSTOM";

export type GTAChallengeDTO = {
  id: string;
  title: string;
  description: string;
  category: string;
  source: GTAChallengeSource;
  durationSeconds: number;
  measurementType: GTAMeasurementType;
  unitLabel: string;
  targetValue: number | null;
  media?: string | null;
  priority: number;
  startsAt?: string | null;
  endsAt?: string | null;
};

export type GTAAttemptDTO = {
  id: string;
  clerkId: string;
  type: GTAChallengeSource;
  challengeId?: string | null;
  shadowChallengeId?: string | null;
  title: string;
  description: string;
  measurementType: GTAMeasurementType;
  unitLabel: string;
  targetValue: number | null;
  resultValue?: number | null;
  resultDelta?: number | null;
  personalBest?: boolean;
  startedAt: string;
  endsAt: string;
  timerReachedZero: boolean;
  achievedAt?: string | null;
  status: GTAAttemptStatus;
  focusCheck?: GTAFocusCheck | null;
  note?: string;
};

export type GTAStreakSeriesDTO = {
  id: string;
  clerkId: string;
  startedAt: string;
  endedAt?: string | null;
  length: number;
  active: boolean;
};

export type GTAShadowDTO = {
  id: string;
  clerkId: string;
  baselineSeriesId?: string;
  baselineLength?: number;
  targetLength?: number;
  baselineAttemptId?: string | null;
  baselineValue?: number | null;
  targetValue?: number | null;
  unitLabel?: string;
  measurementType?: GTAMeasurementType;
  currentBest?: number;
  currentRun: number;
  bestRun: number;
  attempts: number;
  breakCount: number;
  returnCount: number;
  status: GTAShadowStatus;
  startedAt: string;
  wonAt?: string | null;
};

export type GTAPerformanceDTO = {
  attemptId: string;
  title: string;
  type: GTAChallengeSource;
  measurementType: GTAMeasurementType;
  unitLabel: string;
  targetValue: number | null;
  resultValue: number;
  resultDelta: number | null;
  personalBest: boolean;
  achievedAt: string;
};

export type GTAStatsDTO = {
  totals: {
    sessionsStarted: number;
    sessionsAchieved: number;
    totalMinutes: number;
    currentStreak: number;
    bestStreak: number;
  };
  resilience: {
    rating: number;
    returnRate: number;
    medianRecoveryHours: number | null;
    shadowWinRate: number;
    bestComebackStreak: number;
    returns: number;
    breaks: number;
    retryImprovementRate: number;
  };
  consistency: {
    rating: number;
    currentStreak: number;
    bestStreak: number;
    sevenDayRate: number;
    twentyEightDayRate: number;
    previousTwentyEightDayRate: number;
    progressionPoints: number;
    completionRate: number;
    performanceProgressionRate: number;
  };
  focus: {
    rating: number;
    timerCompletionRate: number;
    focusCheckAverage: number;
    cleanSessions: number;
    repeatFocusRate: number;
    resultCaptureRate: number;
  };
  performance: {
    measuredSessions: number;
    targetHitRate: number;
    personalBests: number;
    latestResult: number | null;
    latestUnit: string;
  };
  trend: Array<{
    week: string;
    resilience: number;
    consistency: number;
    focus: number;
  }>;
};

export type GTABadgeDefinitionDTO = {
  id: string;
  code: string;
  name: string;
  description: string;
  iconKey: string;
};

export type GTABadgeAwardDTO = {
  id: string;
  badgeId: string;
  code: string;
  name: string;
  description: string;
  iconKey: string;
  source: "ADMIN" | "SYSTEM";
  message?: string;
  awardedAt: string;
};

export type GTADashboardDTO = {
  unlocked: boolean;
  challenges: GTAChallengeDTO[];
  activeAttempt: GTAAttemptDTO | null;
  activeShadow: GTAShadowDTO | null;
  historicalSeries: GTAStreakSeriesDTO[];
  performances: GTAPerformanceDTO[];
  stats: GTAStatsDTO;
  badges: GTABadgeAwardDTO[];
};
