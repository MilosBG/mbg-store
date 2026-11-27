"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Container from "@/components/mbg-components/Container";
import type {
  StorefrontOrder,
  StorefrontOrderProduct,
} from "@/lib/actions/actions";

export type OrdersClientError = {
  type: "unauthorized" | "network" | "unknown";
  message: string;
  status?: number;
};

type Props = {
  orders: StorefrontOrder[];
  error: OrdersClientError | null;
  requiresSignIn?: boolean;
  initialLanguage?: "en" | "fr";
};

type Language = "en" | "fr";
type View = "tracking" | "history";
type Stage = 0 | 1 | 2 | 3;

const EMPTY_IMAGE =
  "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
const REFRESH_THROTTLE_MS = 5000;
const HISTORY_STATUSES = new Set([
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
  "CANCELED",
  "REFUNDED",
  "RETURNED",
]);

const translations = {
  en: {
    tracking: "Tracking",
    history: "History",
    cart: "Cart",
    title: "Order tracking",
    subtitle: "Follow each step of your Milos BG orders.",
    awaiting: "Awaiting confirmation",
    preparing: "In preparation",
    shipping: "On the way",
    newOrder: "New order",
    order: "Order",
    items: "Items",
    placedOn: "Placed on",
    delivery: "Delivery",
    total: "Total",
    details: "View details",
    hideDetails: "Hide details",
    orderDetails: "Full order details",
    products: "Items in this order",
    confirmed: "Confirmed",
    prepared: "Prepared",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
    refunded: "Refunded",
    returned: "Returned",
    pending: "Awaiting confirmation",
    processing: "In preparation",
    completed: "Completed",
    outForDelivery: "Out for delivery",
    timeline: "Order progress",
    quantity: "Qty",
    color: "Color",
    size: "Size",
    standard: "Standard delivery",
    express: "Express delivery",
    free: "Free delivery",
    signInTitle: "Sign in to view your orders",
    signInText: "Your orders and their delivery progress will appear here.",
    signIn: "Sign in",
    loadError: "Unable to load orders",
    loadErrorText: "We couldn't load your orders right now.",
    sessionErrorText: "We couldn't verify your session. Please sign in again.",
    retry: "Try again",
    refreshing: "Refreshing…",
    emptyTracking: "No orders in progress",
    emptyHistory: "No past orders yet",
    emptyTrackingText: "Active orders will appear here as soon as you place one.",
    emptyHistoryText: "Completed and cancelled orders will appear here.",
    shop: "Explore outfits",
    backToTracking: "Back to tracking",
    language: "Language",
    breadcrumb: "Orders",
    seeMore: "See more",
    seeLess: "See less",
    showing: "Showing",
    of: "of",
    chapter: "Your journey",
    orderLabel: "Chapter of your order",
    trackYourPath: "Keep moving. Your order is progressing through each stage.",
    seeAll: "Your orders",
    nextStage: "The next step",
    lastOrders: "Your collection of journeys",
    story: "FIVE CHAPTERS. ONE JOURNEY.",
    liveUpdate: "Orders update when you return to this page.",
    step: "Step",
  },
  fr: {
    tracking: "Suivi",
    history: "Historique",
    cart: "Panier",
    title: "Suivi des commandes",
    subtitle: "Suivez chaque étape de vos commandes Milos BG.",
    awaiting: "En attente de validation",
    preparing: "En préparation",
    shipping: "En livraison",
    newOrder: "Nouvelle commande",
    order: "Commande",
    items: "Articles",
    placedOn: "Créée le",
    delivery: "Livraison",
    total: "Total",
    details: "Voir les détails",
    hideDetails: "Masquer les détails",
    orderDetails: "Détails complets",
    products: "Articles de cette commande",
    confirmed: "Validée",
    prepared: "Préparée",
    shipped: "Expédiée",
    delivered: "Livrée",
    cancelled: "Annulée",
    refunded: "Remboursée",
    returned: "Retournée",
    pending: "En attente de validation",
    processing: "En préparation",
    completed: "Terminée",
    outForDelivery: "En cours de livraison",
    timeline: "Progression de la commande",
    quantity: "Qté",
    color: "Couleur",
    size: "Taille",
    standard: "Livraison standard",
    express: "Livraison express",
    free: "Livraison gratuite",
    signInTitle: "Connectez-vous pour voir vos commandes",
    signInText: "Vos commandes et leur progression apparaîtront ici.",
    signIn: "Se connecter",
    loadError: "Commandes indisponibles",
    loadErrorText: "Nous ne pouvons pas charger vos commandes pour le moment.",
    sessionErrorText: "Votre session n'a pas pu être vérifiée. Reconnectez-vous.",
    retry: "Réessayer",
    refreshing: "Actualisation…",
    emptyTracking: "Aucune commande en cours",
    emptyHistory: "Aucune ancienne commande",
    emptyTrackingText: "Vos commandes actives apparaîtront ici dès votre achat.",
    emptyHistoryText: "Les commandes terminées ou annulées apparaîtront ici.",
    shop: "Découvrir les outfits",
    backToTracking: "Revenir au suivi",
    language: "Langue",
    breadcrumb: "Commandes",
    seeMore: "Voir plus",
    seeLess: "Voir moins",
    showing: "Affichage de",
    of: "sur",
    chapter: "Votre parcours",
    orderLabel: "Chapitre de votre commande",
    trackYourPath: "Continuez d’avancer. Votre commande progresse à chaque étape.",
    seeAll: "Vos commandes",
    nextStage: "La prochaine étape",
    lastOrders: "Vos parcours",
    story: "CINQ CHAPITRES. UN SEUL PARCOURS.",
    liveUpdate: "Les commandes s’actualisent à votre retour sur cette page.",
    step: "Étape",
  },
} as const;

type Texts = (typeof translations)[Language];

export default function OrdersClient({
  orders,
  error,
  requiresSignIn = false,
  initialLanguage = "en",
}: Props) {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [view, setView] = useState<View>("tracking");
  // Show only the most recent order initially, regardless of viewport width.
  const [visibleCount, setVisibleCount] = useState(1);
  const changeView = (next: View) => {
    setView(next);
    setVisibleCount(1);
  };
  const [isRefreshing, startTransition] = useTransition();
  const lastRefreshRef = useRef(0);
  const t = translations[language];

  useEffect(() => {
    // URL has priority so a detail-page language link is always respected.
    const fromQuery = new URLSearchParams(window.location.search).get("lang");
    if (fromQuery === "en" || fromQuery === "fr") {
      setLanguage(fromQuery);
      try { window.localStorage.setItem("mbg-orders-language", fromQuery); } catch { /* optional */ }
      return;
    }
    try {
      if (window.localStorage.getItem("mbg-orders-language") === "fr") setLanguage("fr");
    } catch { /* localStorage may be disabled */ }
  }, []);

  const changeLanguage = (next: Language) => {
    setLanguage(next);
    try {
      window.localStorage.setItem("mbg-orders-language", next);
      const url = new URL(window.location.href);
      url.searchParams.set("lang", next);
      window.history.replaceState(window.history.state, "", url.toString());
    } catch { /* Keep the selector usable without storage */ }
  };

  const refresh = useCallback(
    (force = false) => {
      const now = Date.now();
      if (!force && now - lastRefreshRef.current < REFRESH_THROTTLE_MS) return;
      lastRefreshRef.current = now;
      startTransition(() => router.refresh());
    },
    [router],
  );

  useEffect(() => {
    if (requiresSignIn) return;
    const onFocus = () => refresh();
    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refresh, requiresSignIn]);

  const trackingOrders = orders.filter(
    (order) => !HISTORY_STATUSES.has(normalizeStatus(order.fulfillmentStatus)),
  );
  const historyOrders = orders.filter((order) =>
    HISTORY_STATUSES.has(normalizeStatus(order.fulfillmentStatus)),
  );
  const visibleOrders = view === "tracking" ? trackingOrders : historyOrders;
  const counts = {
    awaiting: trackingOrders.filter(
      (order) => getStage(normalizeStatus(order.fulfillmentStatus)) === 0,
    ).length,
    preparing: trackingOrders.filter(
      (order) => getStage(normalizeStatus(order.fulfillmentStatus)) === 1,
    ).length,
    shipping: trackingOrders.filter(
      (order) => getStage(normalizeStatus(order.fulfillmentStatus)) === 2,
    ).length,
  };

  return (
    <main lang={language} className="min-h-[65vh] overflow-x-clip bg-[#e7eae8] pb-[34px] font-[Kanit] text-[#111715] sm:pb-[89px]">
      {/* Ink-dark navigation: the page beneath stays intentionally light. */}
      <div className="border-b border-white/10 bg-[#111715] text-white">
        <Container className="flex min-w-0 items-center justify-between gap-[6px] py-[8px] sm:gap-[13px] sm:py-[21px]">
          <nav aria-label={t.breadcrumb} className="flex min-w-0 flex-1 items-center gap-[5px] sm:flex sm:flex-wrap sm:gap-2" >
            <button type="button" aria-pressed={view === "tracking"} onClick={() => changeView("tracking")}
              className={`flex min-h-9 min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-sm border px-[5px] text-[9px] font-bold uppercase tracking-normal transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:min-h-11 sm:flex-none sm:px-[21px] sm:text-[10px] sm:tracking-[0.07em] ${view === "tracking" ? "border-[#00821A] bg-[#00821A] text-white" : "border-white/20 text-white/85 hover:border-[#00821A]"}`}>
              {t.tracking} <span className="ml-1 opacity-70">{trackingOrders.length}</span>
            </button>
            <button type="button" aria-pressed={view === "history"} onClick={() => changeView("history")}
              className={`flex min-h-9 min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-sm border px-[5px] text-[9px] font-bold uppercase tracking-normal transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:min-h-11 sm:flex-none sm:px-[21px] sm:text-[10px] sm:tracking-[0.07em] ${view === "history" ? "border-[#00821A] bg-[#00821A] text-white" : "border-white/20 text-white/85 hover:border-[#00821A]"}`}>
              {t.history} <span className="ml-1 opacity-70">{historyOrders.length}</span>
            </button>
            <Link href={"/the-hoop?lang=" + language} className="inline-flex min-h-9 min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-sm border border-white/20 px-[5px] text-[9px] font-bold uppercase text-white/85 transition-colors hover:border-[#00821A] sm:min-h-11 sm:flex-none sm:px-[21px] sm:text-[10px]">
              {t.cart}
            </Link>
          </nav>
          <div role="group" aria-label={t.language} className="flex shrink-0 items-center justify-end gap-[3px] sm:gap-1.5">
            <span className="mr-2 hidden text-[9px] font-bold uppercase tracking-[0.14em] text-white/50 sm:inline">{t.language}</span>
            {(["en", "fr"] as const).map((lang) => (
              <button key={lang} type="button" lang={lang} aria-pressed={language === lang} onClick={() => changeLanguage(lang)}
                className={`min-h-9 min-w-[32px] rounded-sm border px-[6px] text-[9px] font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:min-h-10 sm:min-w-11 sm:px-3 sm:text-[11px] ${language === lang ? "border-[#00821A] bg-white text-[#00821A]" : "border-white/25 text-white hover:bg-white/10"}`}>
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </Container>
      </div>

      <Container className="min-w-0 pt-[13px] sm:pt-[34px]">
        {/* Golden ratio: 1.618fr / 1fr = approximately 61.8% / 38.2%. */}
        <header className="grid min-w-0 gap-[8px] lg:grid-cols-[minmax(0,1.618fr)_minmax(0,1fr)] lg:gap-[21px]">
          <div className="relative min-w-0 overflow-hidden rounded-sm bg-[#171d19] px-[13px] py-[21px] text-white sm:px-[34px] sm:py-[55px]">
            <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-[#00821A]" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#63ce76]">Milos BG / {t.seeAll}</p>
            <h1 className="mt-[8px] max-w-xl text-[clamp(1.7rem,4.2vw,3.8rem)] font-black uppercase leading-[1.03] tracking-[-0.035em]">{t.title}</h1>
            <p className="mt-[13px] max-w-lg text-[12px] leading-[1.5] text-white/70 sm:mt-[21px] sm:text-[15px] sm:leading-[1.65]">{t.subtitle}</p>
            <div className="mt-[21px] flex flex-wrap items-center gap-[8px] border-t border-white/15 pt-[13px] text-[9px] sm:mt-[34px] sm:gap-[13px] sm:pt-[21px] sm:text-[10px] font-bold uppercase tracking-[0.13em] text-white/60">
              <span className="text-[#63ce76]">01 / 05</span><span>{t.story}</span>
            </div>
          </div>
          <aside className="hidden min-w-0 flex-col justify-between rounded-sm border border-[#c7ceca] bg-[#f7f8f6] p-[34px] sm:flex">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00821A]">{t.chapter}</p>
            <div className="block">
              <strong className="block text-[clamp(1.55rem,5vw,4rem)] font-black leading-none tracking-[-0.04em] tabular-nums">{view === "tracking" ? trackingOrders.length : historyOrders.length}</strong>
              <p className="mt-3 text-sm font-bold uppercase tracking-[0.08em]">{view === "tracking" ? t.tracking : t.history}</p>
              <p className="mt-[13px] max-w-xs text-[12px] leading-[1.65] text-[#56605a]">{t.trackYourPath}</p>
            </div>
            <p className="mt-5 border-t border-[#c7ceca] pt-[13px] text-[10px] leading-[1.6] text-[#68736b]">{t.liveUpdate}</p>
          </aside>
        </header>

        {requiresSignIn ? (
          <StatePanel title={t.signInTitle} body={t.signInText}>
            <Link href="/sign-in" className="inline-flex min-h-11 items-center justify-center rounded-sm bg-[#111715] px-[21px] text-[11px] font-bold uppercase tracking-wider text-white hover:bg-[#00821A]">{t.signIn}</Link>
          </StatePanel>
        ) : error ? (
          <StatePanel title={t.loadError} body={error.type === "unauthorized" ? t.sessionErrorText : t.loadErrorText}>
            {error.type === "unauthorized" && <Link href="/sign-in" className="inline-flex min-h-11 items-center rounded-sm bg-[#111715] px-[21px] text-[11px] font-bold uppercase tracking-wider text-white hover:bg-[#00821A]">{t.signIn}</Link>}
            <button type="button" disabled={isRefreshing} onClick={() => refresh(true)} className="min-h-11 rounded-sm border border-[#111715] px-[21px] text-[11px] font-bold uppercase tracking-wider hover:border-[#00821A] hover:text-[#00821A] disabled:opacity-50">{isRefreshing ? t.refreshing : t.retry}</button>
          </StatePanel>
        ) : (
          <>
            {view === "tracking" && (
              <section aria-label={t.tracking} className="mt-[13px] grid grid-cols-4 gap-[5px] sm:mt-[21px] sm:gap-[13px] lg:gap-[21px]">
                <SummaryCard count={counts.awaiting} label={t.awaiting} variant="awaiting" />
                <SummaryCard count={counts.preparing} label={t.preparing} variant="preparing" />
                <SummaryCard count={counts.shipping} label={t.shipping} variant="shipping" />
                <Link href="/products" className="flex min-h-[86px] min-w-0 flex-col justify-between rounded-sm bg-[#00821A] p-[8px] text-white sm:min-h-[130px] sm:p-[21px] transition-colors hover:bg-[#111715] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00821A]">
                  <span className="text-[22px] leading-none sm:text-3xl" aria-hidden="true">＋</span>
                  <span className="text-[8px] font-black uppercase leading-[1.25] tracking-normal sm:text-[11px] sm:tracking-[0.13em]">{t.newOrder} <span aria-hidden="true">↗</span></span>
                </Link>
              </section>
            )}
            <section id="orders-panel" aria-label={view === "tracking" ? t.tracking : t.history} className="mt-[21px] sm:mt-[55px]">
              <div className="mb-[13px] flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00821A]">{t.orderLabel}</p>
                  <h2 className="mt-2 text-[clamp(1.35rem,2.5vw,2.125rem)] font-black uppercase leading-[1.1] tracking-tight">{view === "tracking" ? t.tracking : t.history}</h2>
                </div>
                <span className="text-[11px] font-medium text-[#68736b]">{visibleOrders.length} {t.items.toLowerCase()}</span>
              </div>
              {visibleOrders.length ? (
                <>
                  <div className="space-y-[13px]" aria-live="polite">
                    {visibleOrders.slice(0, visibleCount).map((order) => (
                      <OrderCard key={order._id} order={order} language={language} t={t} />
                    ))}
                  </div>
                  {visibleOrders.length > 1 && (
                    <div className="mt-[13px] flex items-center justify-between gap-[8px] border-t border-[#c5ccc7] pt-[13px] sm:mt-[21px] sm:gap-[13px] sm:pt-[21px]">
                      <p className="text-[11px] text-[#56605a]">{t.showing} {Math.min(visibleCount, visibleOrders.length)} {t.of} {visibleOrders.length}</p>
                      <div className="flex flex-wrap justify-end gap-[6px]">
                        {visibleCount > 1 && <button type="button" onClick={() => setVisibleCount(1)} className="min-h-9 rounded-sm border border-[#9ea8a1] bg-[#f7f8f6] px-[12px] text-[10px] font-black uppercase sm:min-h-11 sm:px-[21px] text-[#111715] hover:border-[#00821A]">{t.seeLess}</button>}
                        {visibleCount < visibleOrders.length && <button type="button" onClick={() => setVisibleCount((count) => Math.min(count + 3, visibleOrders.length))} className="min-h-9 rounded-sm bg-[#111715] px-[12px] text-[10px] font-black uppercase tracking-[0.05em] sm:min-h-11 sm:px-[34px] text-white hover:bg-[#00821A]">{t.seeMore} <span aria-hidden="true"> ↓</span></button>}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <StatePanel title={view === "tracking" ? t.emptyTracking : t.emptyHistory} body={view === "tracking" ? t.emptyTrackingText : t.emptyHistoryText}>
                  {view === "tracking" ? <Link href="/products" className="inline-flex min-h-11 items-center rounded-sm bg-[#111715] px-[21px] text-[11px] font-bold uppercase text-white hover:bg-[#00821A]">{t.shop}</Link> : <button type="button" onClick={() => changeView("tracking")} className="min-h-11 rounded-sm bg-[#111715] px-[21px] text-[11px] font-bold uppercase text-white hover:bg-[#00821A]">{t.backToTracking}</button>}
                </StatePanel>
              )}
            </section>
          </>
        )}
      </Container>
    </main>
  );
}

function StatePanel({ title, body, children }: { title: string; body: string; children: ReactNode }) {
  return (
    <section className="mt-[21px] flex min-h-[260px] flex-col items-center justify-center rounded-sm border border-[#c5ccc7] bg-[#f7f8f6] px-[21px] py-[55px] text-center">
      <div className="mb-[21px] h-1 w-[55px] bg-[#00821A]" aria-hidden="true" />
      <h2 className="text-xl font-black uppercase leading-tight sm:text-[26px]">{title}</h2>
      <p className="mt-[13px] max-w-[34rem] text-[13px] leading-[1.7] text-[#56605a]">{body}</p>
      <div className="mt-[21px] flex flex-wrap justify-center gap-[13px]">{children}</div>
    </section>
  );
}

function SummaryCard({ count, label, variant }: { count: number; label: string; variant: "awaiting" | "preparing" | "shipping" }) {
  const marker = {
    awaiting: "bg-[#171d19] text-white",
    preparing: "bg-[#404b44] text-white",
    shipping: "bg-[#00821A] text-white",
  }[variant];
  return (
    <div className="relative flex min-h-[86px] min-w-0 flex-col justify-between gap-[8px] rounded-sm border border-[#c5ccc7] bg-[#f7f8f6] p-[8px] sm:min-h-[130px] sm:p-[21px]">
      <span className={`flex h-[24px] w-[24px] items-center justify-center rounded-sm sm:h-[34px] sm:w-[34px] ${marker}`}><StageIcon variant={variant} /></span>
      <div className="mt-[4px] sm:mt-[13px]">
        <strong className="block text-[23px] sm:text-[34px] font-black leading-none tabular-nums">{count}</strong>
        <span className="mt-1 block break-words text-[8px] font-bold uppercase leading-[1.25] tracking-normal text-[#56605a] sm:mt-2 sm:text-[10px] sm:tracking-[0.09em]">{label}</span>
      </div>
    </div>
  );
}

function StageIcon({ variant }: { variant: "awaiting" | "preparing" | "shipping" }) {
  if (variant === "shipping") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-[15px] w-[15px] sm:h-5 sm:w-5">
        <path d="M3 6h11v10H3zM14 9h4l3 3v4h-7z" />
        <circle cx="7" cy="17" r="1.5" /><circle cx="18" cy="17" r="1.5" />
      </svg>
    );
  }
  if (variant === "preparing") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" className="h-[15px] w-[15px] sm:h-5 sm:w-5">
        <path d="M4 8 12 4l8 4-8 4-8-4zM4 8v9l8 4 8-4V8M12 12v9" />
      </svg>
    );
  }
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-[15px] w-[15px] sm:h-5 sm:w-5">
      <path d="M5 7h14M5 12h14M5 17h9" /><circle cx="19" cy="17" r="2" />
    </svg>
  );
}

function OrderCard({ order, language, t }: { order: StorefrontOrder; language: Language; t: Texts }) {
  const [expanded, setExpanded] = useState(false);
  const status = normalizeStatus(order.fulfillmentStatus);
  const stage = getStage(status);
  const products = order.products ?? [];
  const quantity = products.reduce((sum, product) => sum + safeQuantity(product.quantity), 0);
  const id = String(order._id);
  const detailsHref = `/orders/${encodeURIComponent(id)}?lang=${language}`;
  const reference = getReference(order);
  const isNeutral = stage === null;

  return (
    <article className="min-w-0 overflow-hidden rounded-sm border border-[#c5ccc7] bg-[#f7f8f6] shadow-[0_8px_24px_rgba(17,23,21,0.04)] transition-all duration-200 hover:border-[#00821A]/60 hover:shadow-[0_13px_34px_rgba(17,23,21,0.07)]">
      <div className="grid min-w-0 gap-0 lg:grid-cols-[minmax(0,1.618fr)_minmax(0,1fr)]">
        <div className="min-w-0 border-b border-[#d6dcd7] px-[13px] py-[13px] sm:px-[34px] sm:py-[26px] lg:border-b-0 lg:border-r">
          <div className="flex flex-wrap items-start justify-between gap-[8px] sm:gap-[13px]">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#00821A]">{t.order}</p>
              <Link href={detailsHref} className="mt-1 block break-all text-[17px] sm:text-[26px] lg:text-[21px] font-black uppercase tracking-[-0.025em] leading-tight hover:text-[#00821A] xl:text-[26px]">{reference}</Link>
            </div>
            <span className={`inline-flex min-h-9 items-center rounded-sm border px-[13px] text-[10px] font-bold uppercase leading-tight tracking-[0.05em] ${isNeutral ? "border-[#acb4ae] bg-[#e5e9e6] text-[#323d36]" : "border-[#00821A]/25 bg-[#e6f4e9] text-[#00821A]"}`}>{statusLabel(status,t)}</span>
          </div>
          <div className="mt-[13px] grid grid-cols-3 gap-[8px] sm:mt-[21px] sm:gap-[13px]">
            <InfoPiece title={t.placedOn} value={formatDate(getCreatedAt(order), language)} />
            <InfoPiece title={t.items} value={`${quantity} ${t.items.toLowerCase()}`} />
            <InfoPiece title={t.delivery} value={formatShipping(order.shippingMethod,t)} />
          </div>
        </div>
        <div className="flex min-w-0 flex-row items-center justify-between gap-[8px] bg-[#e9ede9] px-[13px] py-[13px] sm:px-[34px] sm:py-[26px] lg:flex-col lg:items-stretch lg:gap-[21px]">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#56605a]">{t.total}</p>
            <strong className="mt-1 block text-[clamp(1.15rem,3vw,2.4rem)] sm:mt-2 font-black leading-tight tabular-nums text-[#111715]">{formatMoney(order.totalAmount,language)}</strong>
            {order.promotion?.code && <span className="mt-2 inline-flex rounded-sm border border-[#00821A]/25 bg-white px-2 py-1 text-[10px] font-bold uppercase text-[#00821A]">{order.promotion.code}</span>}
          </div>
          <div className="flex min-w-0 shrink-0 flex-row gap-[6px] sm:gap-2 lg:w-full lg:flex-col xl:flex-row">
            <button type="button" aria-expanded={expanded} aria-controls={`order-details-${id}`} onClick={() => setExpanded(!expanded)} className="min-h-9 rounded-sm border border-[#9da8a0] bg-white px-[8px] text-[9px] sm:min-h-11 sm:flex-1 sm:px-3 sm:text-[11px] font-bold uppercase text-[#111715] hover:border-[#00821A]">{expanded ? t.hideDetails : t.details} <span aria-hidden="true">{expanded ? " ↑" : " ↓"}</span></button>
            <Link href={detailsHref} className="inline-flex min-h-9 items-center justify-center rounded-sm bg-[#111715] px-[8px] text-center text-[9px] sm:min-h-11 sm:flex-1 sm:px-[13px] sm:text-[11px] font-bold uppercase text-white hover:bg-[#00821A]">{t.orderDetails} <span aria-hidden="true" className="ml-2">↗</span></Link>
          </div>
        </div>
      </div>
      {!isNeutral ? <OrderProgress stage={stage} language={language} t={t} /> : <div className="border-t border-[#d6dcd7] px-[21px] py-[13px] text-xs font-medium text-[#56605a]">{statusLabel(status,t)}</div>}
      <div id={`order-details-${id}`} hidden={!expanded} className="border-t border-[#d6dcd7] bg-white px-[21px] py-[21px] sm:px-[34px]">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00821A]">{t.products}</p>
        {products.length ? <div className="mt-[13px] divide-y divide-[#d6dcd7]">{products.map((product,index)=><OrderProduct key={product._id ?? index} product={product} language={language} t={t}/>)}</div> : null}
      </div>
    </article>
  );
}

function InfoPiece({title,value}:{title:string;value:string}) {
  return <div className="min-w-0"><span className="block text-[9px] font-bold uppercase tracking-normal text-[#647069] sm:text-[10px] sm:tracking-[0.08em]">{title}</span><span className="mt-1 block break-words text-[10px] font-semibold leading-[1.35] text-[#111715] sm:text-[12px]">{value}</span></div>;
}

function OrderProgress({ stage, language, t }: { stage: Stage; language: Language; t: Texts }) {
  const steps = [t.confirmed,t.preparing,t.shipped,t.delivered];
  return (
    <div className="border-t border-[#d6dcd7] px-[13px] py-[13px] sm:px-[34px] sm:py-[21px]" aria-label={t.timeline} lang={language}>
      <ol className="grid grid-cols-4 gap-x-[5px] sm:gap-x-[13px]">
        {steps.map((label,index)=>{
          const complete = stage === 3 || index < stage;
          const active = stage === index && stage !== 3;
          return (
            <li key={index} aria-current={active ? "step" : undefined} className="min-w-0">
              <div className="flex items-center gap-[3px] sm:gap-[8px]">
                <span className={`flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full border text-[8px] font-black sm:h-[26px] sm:w-[26px] sm:text-[10px] ${complete ? "border-[#00821A] bg-[#00821A] text-white" : active ? "border-[#00821A] bg-white text-[#00821A]" : "border-[#bec8c1] bg-transparent text-[#849088]"}`}>{complete ? "✓" : String(index+1).padStart(2,"0")}</span>
                <span className={`h-px flex-1 ${index <= stage ? "bg-[#00821A]" : "bg-[#bec8c1]"}`} aria-hidden="true" />
              </div>
              <span className={`mt-[6px] block text-center text-[9px] font-semibold leading-[1.2] sm:mt-[8px] sm:text-left sm:text-[11px] sm:leading-[1.35] ${complete || active ? "text-[#00821A]" : "text-[#7a857e]"}`}>
                <span className="sm:hidden">{(language === "fr" ? ["Validée", "Prépar.", "Expédiée", "Livrée"] : ["Confirmed", "Prep.", "Shipped", "Delivered"])[index]}</span>
                <span className="hidden sm:inline">{label}</span>
              </span>
              <span className="sr-only">{complete ? (language === "fr" ? "Terminée" : "Complete") : active ? (language === "fr" ? "En cours" : "Current") : (language === "fr" ? "À venir" : "Upcoming")}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function OrderProduct({
  product,
  language,
  t,
}: {
  product: StorefrontOrderProduct;
  language: Language;
  t: Texts;
}) {
  const imageSrc = product.product?.media?.[0] || EMPTY_IMAGE;
  const quantity = safeQuantity(product.quantity);
  const unitPrice = Number(product.unitPrice ?? product.product?.price ?? 0);
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-[13px] py-[21px] sm:flex-nowrap sm:gap-[21px]">
      <div className="h-[55px] w-[55px] shrink-0 overflow-hidden rounded-sm bg-[#e9ede9] sm:h-[89px] sm:w-[89px]">
        <Image src={imageSrc} alt={product.product?.title || "Milos BG"} width={80} height={80} className="h-full w-full object-contain" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-black uppercase">{product.product?.title || "Milos BG"}</p>
        <div className="mt-[8px] flex flex-wrap gap-x-[13px] gap-y-1 text-[11px] text-[#56605a]">
          {product.color && <span>{t.color}: {product.color}</span>}
          {product.size && <span>{t.size}: {product.size}</span>}
          <span>{t.quantity}: {quantity}</span>
        </div>
      </div>
      <strong className="ml-auto shrink-0 text-xs font-black text-[#00821A]">{formatMoney(unitPrice * quantity, language)}</strong>
    </div>
  );
}

function normalizeStatus(status: unknown): string {
  return String(status || "PENDING").trim().toUpperCase();
}

function getStage(status: string): Stage | null {
  if (status === "PENDING") return 0;
  if (status === "PROCESSING" || status === "CONFIRMED" || status === "PACKED") return 1;
  if (status === "SHIPPED" || status === "OUT_FOR_DELIVERY") return 2;
  if (status === "DELIVERED" || status === "COMPLETED") return 3;
  return null;
}

function statusLabel(status: string, t: Texts): string {
  switch (status) {
    case "PENDING": return t.pending;
    case "PROCESSING": return t.processing;
    case "CONFIRMED": return t.confirmed;
    case "PACKED": return t.prepared;
    case "SHIPPED": return t.shipped;
    case "OUT_FOR_DELIVERY": return t.outForDelivery;
    case "DELIVERED": return t.delivered;
    case "COMPLETED": return t.completed;
    case "CANCELLED":
    case "CANCELED": return t.cancelled;
    case "REFUNDED": return t.refunded;
    case "RETURNED": return t.returned;
    default: return status.replaceAll("_", " ");
  }
}

function getReference(order: StorefrontOrder): string {
  const reference = (order as unknown as Record<string, unknown>).orderNumber;
  if (typeof reference === "string" && reference.trim()) {
    return "#" + reference.replace(/^#/, "");
  }
  return "#" + String(order._id).slice(-8).toUpperCase();
}

function getCreatedAt(order: StorefrontOrder): unknown {
  return (order as unknown as Record<string, unknown>).createdAt;
}

function formatDate(value: unknown, language: Language): string {
  if (!(value instanceof Date) && typeof value !== "string" && typeof value !== "number") return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(language === "fr" ? "fr-FR" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatMoney(value: unknown, language: Language): string {
  const numeric = Number(value);
  if (value == null || !Number.isFinite(numeric)) return "—";
  return new Intl.NumberFormat(language === "fr" ? "fr-FR" : "en-GB", {
    style: "currency",
    currency: "EUR",
  }).format(numeric);
}

function formatShipping(value: string | null | undefined, t: Texts): string {
  if (!value) return "—";
  const normalized = value.trim().toUpperCase();
  if (normalized.includes("EXPRESS")) return t.express;
  if (normalized.includes("FREE")) return t.free;
  if (normalized.includes("STANDARD")) return t.standard;
  return value;
}

function safeQuantity(value: unknown): number {
  const numeric = Number(value ?? 1);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : 1;
}
