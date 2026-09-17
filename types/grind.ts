export type GrindLanguage = "en" | "fr";

export type GrindChapter =
  | "GRIND"
  | "RESILIENCE"
  | "CONSISTENCY"
  | "FOCUS"
  | "ACHIEVE";

export type GrindCycleStatus = "ACTIVE" | "COMPLETED" | "ABANDONED";

export type GrindTaskKind = "MAIN" | "SUPPORT" | "MINIMUM";

export type GrindTask = {
  id: string;
  label: string;
  kind: GrindTaskKind;
  completed: boolean;
  completedAt?: string | null;
};

export type GrindProfileDTO = {
  clerkId: string;
  unlocked: boolean;
  unlockedAt?: string | null;
  firstOrderId?: string | null;
  activeCycleId?: string | null;
  cyclesCompleted: number;
  grindsCompleted: number;
  returns: number;
  currentStreak: number;
  longestStreak: number;
};

export type GrindCycleDTO = {
  id: string;
  clerkId: string;
  title: string;
  reason: string;
  status: GrindCycleStatus;
  currentChapter: GrindChapter;
  startedAt: string;
  completedAt?: string | null;
  archivedAt?: string | null;
  reflection?: string;
  progress: number;
};

export type GrindCheckInDTO = {
  id: string;
  cycleId: string;
  clerkId: string;
  dateKey: string;
  chapter: GrindChapter;
  tasks: GrindTask[];
  note?: string;
  showedUp: boolean;
  resilienceReturn: boolean;
  createdAt: string;
  updatedAt: string;
};

export type GrindDashboardDTO = {
  profile: GrindProfileDTO;
  activeCycle: GrindCycleDTO | null;
  today: GrindCheckInDTO | null;
  archive: GrindCycleDTO[];
};
