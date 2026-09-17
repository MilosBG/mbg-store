"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Circle, RotateCcw, Target } from "lucide-react";
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
};

const chapterOrder = ["GRIND", "RESILIENCE", "CONSISTENCY", "FOCUS", "ACHIEVE"] as const;

const emptyTask = (kind: GrindTaskKind, index: number): GrindTask => ({
  id: `${kind.toLowerCase()}-${index}`,
  label: "",
  kind,
  completed: false,
});

export default function GrindModeClient({ lang, bookUrl, ebookUrl }: Props) {
  const t = grindCopy[lang];
  const [data, setData] = useState<GrindDashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [reflection, setReflection] = useState("");
  const [saving, setSaving] = useState(false);
  const [tasks, setTasks] = useState<GrindTask[]>([
    emptyTask("MAIN", 1),
    emptyTask("SUPPORT", 1),
    emptyTask("SUPPORT", 2),
    emptyTask("MINIMUM", 1),
  ]);

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

  const hasGap = useMemo(() => {
    if (!data?.profile.currentStreak || data.today?.showedUp) return false;
    return false;
  }, [data]);

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
      toast.error(lang === "fr" ? "Ajoute au moins un Grind." : "Add at least one Grind.");
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
      setTasks([
        emptyTask("MAIN", 1),
        emptyTask("SUPPORT", 1),
        emptyTask("SUPPORT", 2),
        emptyTask("MINIMUM", 1),
      ]);
      setNote("");
      await load();
      toast.success(t.completed);
    } catch {
      toast.error(t.error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs font-bold uppercase tracking-[0.25em] text-mbg-green">{t.loading}</div>;
  }

  if (!data) return null;

  if (!data.profile.unlocked) {
    return (
      <div className="mx-auto max-w-3xl py-16">
        <div className="border border-mbg-black bg-mbg-white p-8 text-center sm:p-12">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-mbg-green">{t.eyebrow}</p>
          <h1 className="mt-4 text-3xl font-black uppercase tracking-tight text-mbg-black sm:text-5xl">{t.lockedTitle}</h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-mbg-black/65">{t.lockedBody}</p>
          <Link href={`/?lang=${lang}`} className="mt-8 inline-flex border border-mbg-black bg-mbg-black px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-mbg-green">
            {t.lockedCta}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <section className="border-b border-mbg-black/15 pb-8 pt-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-mbg-green">{t.eyebrow}</p>
              <span className="border border-mbg-green px-2 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-mbg-green">{t.unlockedBadge}</span>
            </div>
            <h1 className="mt-3 text-4xl font-black uppercase tracking-[-0.04em] text-mbg-black sm:text-6xl">{t.title}</h1>
            <p className="mt-3 max-w-2xl text-sm text-mbg-black/65">{t.subtitle}</p>
          </div>
          <div className="flex border border-mbg-black/15 text-[10px] font-bold uppercase">
            <Link href="/grind-mode?lang=en" className={`px-4 py-2 ${lang === "en" ? "bg-mbg-black text-white" : "text-mbg-black"}`}>EN</Link>
            <Link href="/grind-mode?lang=fr" className={`px-4 py-2 ${lang === "fr" ? "bg-mbg-green text-white" : "text-mbg-black"}`}>FR</Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          [t.cycles, data.profile.cyclesCompleted],
          [t.grinds, data.profile.grindsCompleted],
          [t.returns, data.profile.returns],
          [t.streak, data.profile.currentStreak],
          [t.longest, data.profile.longestStreak],
        ].map(([label, value]) => (
          <div key={String(label)} className="border border-mbg-black/15 bg-mbg-white p-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-mbg-black/45">{label}</p>
            <p className="mt-2 text-2xl font-black text-mbg-black">{value}</p>
          </div>
        ))}
      </section>

      {data.activeCycle ? (
        <>
          <section className="grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
            <div className="border border-mbg-black bg-mbg-white p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-mbg-green">{data.activeCycle.currentChapter}</p>
                  <h2 className="mt-2 text-2xl font-black uppercase text-mbg-black sm:text-3xl">{data.activeCycle.title}</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-mbg-black/60">{data.activeCycle.reason}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-mbg-black">{data.activeCycle.progress}%</p>
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-mbg-black/45">progress</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-5 border-y border-mbg-black/15 py-4">
                {chapterOrder.map((chapter, index) => {
                  const current = chapter === data.activeCycle?.currentChapter;
                  const activeIndex = chapterOrder.indexOf(data.activeCycle?.currentChapter ?? "GRIND");
                  const done = index < activeIndex || data.activeCycle?.currentChapter === "ACHIEVE";
                  return (
                    <div key={chapter} className="text-center">
                      <div className={`mx-auto flex h-7 w-7 items-center justify-center border ${current || done ? "border-mbg-green bg-mbg-green text-white" : "border-mbg-black/20 text-mbg-black/35"}`}>
                        {done ? <Check className="h-3.5 w-3.5" /> : <span className="text-[9px] font-black">0{index + 1}</span>}
                      </div>
                      <p className={`mt-2 hidden text-[8px] font-bold uppercase tracking-[0.12em] sm:block ${current ? "text-mbg-green" : "text-mbg-black/45"}`}>{chapter}</p>
                    </div>
                  );
                })}
              </div>

              <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-mbg-black/50">{t.focusRule}</p>
            </div>

            <div className="border border-mbg-green bg-mbg-green/[0.06] p-6">
              <Target className="h-6 w-6 text-mbg-green" />
              <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-mbg-green">{t.noLeaderboard}</p>
            </div>
          </section>

          <section className="border border-mbg-black bg-mbg-white p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-mbg-green">{t.today}</p>
                <h2 className="mt-2 text-2xl font-black uppercase text-mbg-black">{data.today?.resilienceReturn ? t.resilienceActivated : t.showedUp}</h2>
              </div>
              {data.today?.resilienceReturn && <RotateCcw className="h-6 w-6 text-mbg-green" />}
            </div>

            {hasGap && (
              <div className="mt-5 border border-mbg-green bg-mbg-green/[0.05] p-4">
                <p className="text-sm font-black uppercase text-mbg-black">{t.missed}</p>
                <p className="mt-1 text-xs leading-5 text-mbg-black/60">{t.returnCopy}</p>
              </div>
            )}

            <div className="mt-6 grid gap-3">
              {tasks.map((task, index) => {
                const label = task.kind === "MAIN" ? t.main : task.kind === "MINIMUM" ? t.minimum : t.support;
                return (
                  <div key={task.id} className="grid gap-2 border border-mbg-black/15 p-4 sm:grid-cols-[120px_1fr_auto] sm:items-center">
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-mbg-black/45">{label}</p>
                    <input
                      value={task.label}
                      onChange={(e) => setTasks((current) => current.map((item, i) => i === index ? { ...item, label: e.target.value } : item))}
                      placeholder={lang === "fr" ? "Une action concrète" : "One concrete action"}
                      className="w-full border-0 bg-transparent text-sm font-semibold text-mbg-black outline-none placeholder:text-mbg-black/25"
                    />
                    <button
                      type="button"
                      aria-label="toggle task"
                      onClick={() => setTasks((current) => current.map((item, i) => i === index ? { ...item, completed: !item.completed, completedAt: !item.completed ? new Date().toISOString() : null } : item))}
                      className={`flex h-8 w-8 items-center justify-center border ${task.completed ? "border-mbg-green bg-mbg-green text-white" : "border-mbg-black/20 text-mbg-black/25"}`}
                    >
                      {task.completed ? <Check className="h-4 w-4" /> : <Circle className="h-3 w-3" />}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-5">
              <label className="text-[9px] font-bold uppercase tracking-[0.16em] text-mbg-black/45">{t.note}</label>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={t.notePlaceholder} rows={3} className="mt-2 w-full border border-mbg-black/15 bg-white p-3 text-sm outline-none focus:border-mbg-green" />
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button type="button" disabled={saving} onClick={() => void saveToday(true)} className="border border-mbg-black bg-mbg-black px-5 py-3 text-xs font-black uppercase tracking-[0.15em] text-white transition hover:bg-mbg-green disabled:opacity-50">{t.showedUp}</button>
              <button type="button" disabled={saving} onClick={() => void saveToday(false)} className="border border-mbg-black px-5 py-3 text-xs font-black uppercase tracking-[0.15em] text-mbg-black transition hover:border-mbg-green hover:text-mbg-green disabled:opacity-50">{t.save}</button>
            </div>
          </section>

          <section className="border border-mbg-black bg-mbg-black p-6 text-white sm:p-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-mbg-green">05 — ACHIEVE</p>
            <h2 className="mt-2 text-2xl font-black uppercase">{t.completeCycle}</h2>
            <p className="mt-2 text-sm text-white/60">{t.reflection}</p>
            <textarea value={reflection} onChange={(e) => setReflection(e.target.value)} rows={4} className="mt-4 w-full border border-white/20 bg-white/5 p-3 text-sm text-white outline-none focus:border-mbg-green" />
            <button type="button" disabled={saving || !reflection.trim()} onClick={() => void completeCycle()} className="mt-4 border border-mbg-green bg-mbg-green px-5 py-3 text-xs font-black uppercase tracking-[0.15em] text-white disabled:opacity-40">{t.completeCycle}</button>
          </section>
        </>
      ) : (
        <section className="border border-mbg-black bg-mbg-white p-6 sm:p-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-mbg-green">01 — GRIND</p>
          <h2 className="mt-2 text-2xl font-black uppercase text-mbg-black">{t.startCycle}</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-mbg-black/45">{t.createCycleTitle}</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t.createCyclePlaceholder} className="mt-2 w-full border border-mbg-black/15 px-4 py-3 text-sm outline-none focus:border-mbg-green" />
            </label>
            <label className="block">
              <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-mbg-black/45">{t.createCycleReason}</span>
              <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t.createReasonPlaceholder} className="mt-2 w-full border border-mbg-black/15 px-4 py-3 text-sm outline-none focus:border-mbg-green" />
            </label>
          </div>
          <button type="button" disabled={saving || !title.trim() || !reason.trim()} onClick={() => void createCycle()} className="mt-5 border border-mbg-black bg-mbg-black px-5 py-3 text-xs font-black uppercase tracking-[0.15em] text-white transition hover:bg-mbg-green disabled:opacity-40">{t.start}</button>
        </section>
      )}

      <section className="grid gap-6 lg:grid-cols-[1fr_.8fr]">
        <div className="border border-mbg-black/15 bg-mbg-white p-6 sm:p-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-mbg-green">{t.archive}</p>
          <div className="mt-5 space-y-3">
            {data.archive.length ? data.archive.map((cycle) => (
              <div key={cycle.id} className="flex items-center justify-between gap-4 border-b border-mbg-black/10 pb-3">
                <div>
                  <p className="text-sm font-black uppercase text-mbg-black">{cycle.title}</p>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-mbg-black/40">{cycle.completedAt ? new Date(cycle.completedAt).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB") : ""}</p>
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.14em] text-mbg-green">ACHIEVE ✓</span>
              </div>
            )) : <p className="text-sm text-mbg-black/50">{t.noArchive}</p>}
          </div>
        </div>

        <aside className="border border-mbg-green bg-mbg-green/[0.05] p-6 sm:p-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-mbg-green">{t.promoEyebrow}</p>
          <h2 className="mt-2 text-2xl font-black uppercase text-mbg-black">{t.promoTitle}</h2>
          <p className="mt-4 text-sm leading-6 text-mbg-black/65">{t.promoBody}</p>
          <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.14em] text-mbg-black/45">{t.bookNote}</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <a href={bookUrl} target="_blank" rel="noreferrer" className="border border-mbg-black bg-mbg-black px-4 py-3 text-center text-[10px] font-black uppercase tracking-[0.15em] text-white transition hover:bg-mbg-green">{t.physicalBook}</a>
            <a href={ebookUrl} target="_blank" rel="noreferrer" className="border border-mbg-black px-4 py-3 text-center text-[10px] font-black uppercase tracking-[0.15em] text-mbg-black transition hover:border-mbg-green hover:text-mbg-green">{t.ebook}</a>
          </div>
        </aside>
      </section>
    </div>
  );
}
