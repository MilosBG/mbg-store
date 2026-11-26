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
};

type Language = "en" | "fr";
type View = "tracking" | "history";
type Stage = 0 | 1 | 2 | 3;

const EMPTY_IMAGE =
  "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
const REFRESH_THROTTLE_MS = 5000;
const INITIAL_VISIBLE_ORDERS = 1;
const ORDERS_PER_CLICK = 3;
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
    heroKicker: "01 / THE JOURNEY",
    heroLead: "EVERY STEP",
    heroAccent: "HAS ITS STORY.",
    heroNote: "From the first choice to the final delivery. Your journey continues with each piece.",
    signature: "FIVE CHAPTERS. ONE JOURNEY.",
    heroCount: "Orders in progress",
    archiveCount: "Chapters completed",
    listTitle: "YOUR CHAPTERS",
    activeList: "IN MOTION",
    archivedList: "THE ARCHIVE",
    listSubtitle: "Follow the next step, or revisit the pieces already collected.",
    orderCount: "orders",
    seeMore: "See more",
    seeLess: "Show less",
    showingOrders: "Showing orders",
    shortProgress: ["Pending", "Preparing", "Shipped", "Delivered"],
    stageLabel: "CURRENT CHAPTER",
    journey: "Follow the journey",
    story: "Discover the story",
    storyHeading: "THE JOURNEY DOES NOT END HERE.",
    storyDescription: "GRIND. RESILIENCE. CONSISTENCY. FOCUS. ACHIEVE. One journey, built step by step.",
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
    heroKicker: "01 / LE PARCOURS",
    heroLead: "CHAQUE ÉTAPE",
    heroAccent: "A SON HISTOIRE.",
    heroNote: "Du premier choix à la livraison. Votre aventure se poursuit avec chaque pièce.",
    signature: "CINQ CHAPITRES. UN SEUL VOYAGE.",
    heroCount: "Commandes en cours",
    archiveCount: "Chapitres terminés",
    listTitle: "VOS CHAPITRES",
    activeList: "EN COURS",
    archivedList: "LES ARCHIVES",
    listSubtitle: "Suivez la prochaine étape ou retrouvez les pièces déjà acquises.",
    orderCount: "commandes",
    seeMore: "Voir plus",
    seeLess: "Voir moins",
    showingOrders: "Commandes affichées",
    shortProgress: ["Attente", "Prépa.", "Expédiée", "Livrée"],
    stageLabel: "CHAPITRE ACTUEL",
    journey: "Suivre le parcours",
    story: "Découvrir l’histoire",
    storyHeading: "L’AVENTURE NE S’ARRÊTE PAS ICI.",
    storyDescription: "GRIND. RESILIENCE. CONSISTENCY. FOCUS. ACHIEVE. Un seul parcours, construit pas à pas.",
  },
} as const;

type Texts = (typeof translations)[Language];

export default function OrdersClient({
  orders,
  error,
  requiresSignIn = false,
}: Props) {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>("en");
  const [view, setView] = useState<View>("tracking");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_ORDERS);
  const [isRefreshing, startTransition] = useTransition();
  const lastRefreshRef = useRef(0);
  const t = translations[language];

  useEffect(() => {
    try {
      const requested = new URLSearchParams(window.location.search).get("lang");
      if (requested === "fr" || requested === "en") {
        setLanguage(requested);
      } else if (window.localStorage.getItem("mbg-orders-language") === "fr") {
        setLanguage("fr");
      }
    } catch {
      // The language switch still works when storage is unavailable.
    }
  }, []);

  const changeView = (next: View) => {
    setView(next);
    // Each tab begins with the most recent order only.
    setVisibleCount(INITIAL_VISIBLE_ORDERS);
  };

  const changeLanguage = (next: Language) => {
    setLanguage(next);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("lang", next);
      window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
      window.localStorage.setItem("mbg-orders-language", next);
    } catch {
      // Language selection still works when browser storage is unavailable.
    }
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
  // Newest orders first, with stable original order for unknown dates.
  const visibleOrders = [...(view === "tracking" ? trackingOrders : historyOrders)].sort(
    (a, b) => getOrderTimestamp(b) - getOrderTimestamp(a),
  );
  const shownOrders = visibleOrders.slice(0, visibleCount);
  const remainingOrders = Math.max(0, visibleOrders.length - shownOrders.length);
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
    <main className="min-h-[65vh] min-w-0 overflow-x-clip bg-[#F5F5F2] pb-10 font-[Kanit] text-mbg-black sm:pb-16">
      
<div className="border-t-[3px] border-mbg-green bg-mbg-black">
  <Container className="flex flex-col gap-2 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">

    {/* NAVIGATION */}
    <nav
      aria-label={language === "fr" ? "Commandes" : "Orders"}
      className="grid w-full min-w-0 grid-cols-3 gap-1.5 sm:flex sm:w-auto sm:items-center sm:gap-2"
    >
      <div
        role="group"
        aria-label={
          language === "fr"
            ? "Afficher les commandes"
            : "Show orders"
        }
        className="col-span-2 grid min-w-0 grid-cols-2 gap-1.5 sm:flex sm:items-center sm:gap-2"
      >
        {/* TRACKING */}
        <button
          type="button"
          id="tab-tracking"
          aria-controls="orders-panel"
          aria-pressed={view === "tracking"}
          onClick={() => changeView("tracking")}
          className={
            "flex min-h-11 min-w-0 items-center justify-center gap-1 rounded-sm px-2 text-[11px] font-bold uppercase tracking-[0.06em] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:min-h-10 sm:px-5 sm:text-[10px] sm:tracking-[0.12em] lg:px-7 " +
            (view === "tracking"
              ? "bg-white text-mbg-black"
              : "bg-white/10 text-white hover:bg-white/20")
          }
        >
          <span className="truncate">{t.tracking}</span>
          <span className="shrink-0 opacity-70">
            {trackingOrders.length}
          </span>
        </button>

        {/* HISTORY */}
        <button
          type="button"
          id="tab-history"
          aria-controls="orders-panel"
          aria-pressed={view === "history"}
          onClick={() => changeView("history")}
          className={
            "flex min-h-11 min-w-0 items-center justify-center gap-1 rounded-sm px-2 text-[11px] font-bold uppercase tracking-[0.06em] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:min-h-10 sm:px-5 sm:text-[10px] sm:tracking-[0.12em] lg:px-7 " +
            (view === "history"
              ? "bg-white text-mbg-black"
              : "bg-white/10 text-white hover:bg-white/20")
          }
        >
          <span className="truncate">{t.history}</span>
          <span className="shrink-0 opacity-70">
            {historyOrders.length}
          </span>
        </button>
      </div>

      {/* CART */}
      <Link
        href={`/the-hoop?lang=${language}`}
        className="flex min-h-11 min-w-0 items-center justify-center rounded-sm border border-white/20 bg-transparent px-2 text-[11px] font-bold uppercase tracking-[0.06em] text-white transition-all duration-200 hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:min-h-10 sm:px-5 sm:text-[10px] sm:tracking-[0.12em] lg:px-7"
      >
        <span className="truncate">{t.cart}</span>
      </Link>
    </nav>

    {/* LANGUAGE SELECTOR */}
    <div
      role="group"
      aria-label={t.language}
      className="flex w-full items-center justify-end gap-1 border-t border-white/15 pt-2 text-[11px] font-bold sm:w-auto sm:shrink-0 sm:border-0 sm:pt-0"
    >
      <button
        type="button"
        lang="en"
        aria-pressed={language === "en"}
        onClick={() => changeLanguage("en")}
        className={
          "min-h-10 min-w-11 rounded-sm px-2 py-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white " +
          (language === "en"
            ? "bg-mbg-green text-white"
            : "text-white hover:bg-white/15")
        }
      >
        EN
      </button>

      <button
        type="button"
        lang="fr"
        aria-pressed={language === "fr"}
        onClick={() => changeLanguage("fr")}
        className={
          "min-h-10 min-w-11 rounded-sm px-2 py-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white " +
          (language === "fr"
            ? "bg-mbg-green text-white"
            : "text-white hover:bg-white/15")
        }
      >
        FR
      </button>
    </div>

  </Container>
</div>


      <Container className="pt-4 sm:pt-8 md:pt-10">
        {/* Compact, order-focused heading on mobile; full brand storytelling on desktop. */}
        <header className="relative mb-5 overflow-hidden rounded-sm border border-black/10 bg-white p-4 sm:mb-8 sm:px-8 sm:py-9 lg:px-11">
          <span aria-hidden="true" className="pointer-events-none absolute -right-4 -top-8 hidden select-none text-[150px] font-black leading-none tracking-tighter text-black/[0.03] sm:block">01</span>
          <div className="relative grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(170px,0.3fr)] sm:items-end lg:gap-10">
            <div className="min-w-0">
              <p className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#00821A] sm:mb-4 sm:tracking-[0.2em]">
                <span aria-hidden="true" className="h-px w-5 bg-[#00821A] sm:w-7" /> {t.heroKicker}
              </p>
              <h1 className="text-[1.65rem] font-black uppercase leading-[1.05] tracking-[-0.035em] sm:text-[clamp(2rem,4.6vw,3.55rem)] sm:leading-[0.98]">
                <span className="sm:hidden">{t.title}</span>
                <span className="hidden sm:inline">{t.heroLead}<span className="mt-1 block text-[#00821A]">{t.heroAccent}</span></span>
              </h1>
              <p className="mt-2 text-[12px] leading-5 text-[#404040] sm:mt-5 sm:max-w-xl sm:text-sm sm:leading-7">{t.subtitle}</p>
              <p className="mt-3 hidden max-w-xl text-sm leading-7 text-[#404040] sm:block">{t.heroNote}</p>
            </div>
            <div className="flex items-center justify-between gap-4 border-l-[3px] border-[#00821A] bg-[#111111] px-4 py-3 text-white sm:min-h-32 sm:flex-col sm:items-start sm:p-5">
              <span className="max-w-[13rem] text-[10px] font-bold uppercase leading-4 tracking-[0.1em] text-white/75 sm:tracking-[0.16em]">
                {view === "tracking" ? t.heroCount : t.archiveCount}
              </span>
              <strong className="shrink-0 text-3xl font-black leading-none tabular-nums tracking-tight sm:text-5xl">
                {view === "tracking" ? trackingOrders.length : historyOrders.length}
              </strong>
              <span className="hidden text-[9px] font-bold uppercase tracking-[0.12em] text-white/55 sm:block">{t.signature}</span>
            </div>
          </div>
        </header>

        {requiresSignIn ? (
          <StatePanel title={t.signInTitle} body={t.signInText}>
            <Link href="/sign-in" className="inline-flex min-h-11 items-center justify-center rounded-sm bg-mbg-black px-6 text-xs font-bold uppercase tracking-wider text-white hover:bg-mbg-green">{t.signIn}</Link>
          </StatePanel>
        ) : error ? (
          <StatePanel title={t.loadError} body={error.type === "unauthorized" ? t.sessionErrorText : t.loadErrorText}>
            {error.type === "unauthorized" && (
              <Link href="/sign-in" className="inline-flex min-h-11 items-center rounded-sm bg-mbg-black px-6 text-xs font-bold uppercase tracking-wider text-white hover:bg-mbg-green">{t.signIn}</Link>
            )}
            <button type="button" disabled={isRefreshing} onClick={() => refresh(true)} className="min-h-11 rounded-sm border border-mbg-black px-6 text-xs font-bold uppercase tracking-wider hover:border-mbg-green hover:text-mbg-green disabled:opacity-50">{isRefreshing ? t.refreshing : t.retry}</button>
          </StatePanel>
        ) : (
          <>
            {view === "tracking" && (
              <section aria-label={t.tracking} className="grid grid-cols-3 gap-2 sm:grid-cols-2 sm:gap-3 xl:grid-cols-4">
                <SummaryCard count={counts.awaiting} label={t.awaiting} variant="awaiting" />
                <SummaryCard count={counts.preparing} label={t.preparing} variant="preparing" />
                <SummaryCard count={counts.shipping} label={t.shipping} variant="shipping" />
                <Link href={`/products?lang=${language}`} className="group col-span-3 flex min-h-11 items-center justify-center gap-3 rounded-sm border border-black bg-black px-4 py-3 text-center text-white transition-colors hover:border-[#00821A] hover:bg-[#00821A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00821A] sm:col-span-1 sm:min-h-[120px] sm:flex-col sm:gap-2 sm:p-4">
                  <span aria-hidden="true" className="flex h-6 w-6 items-center justify-center border border-white/40 text-lg leading-none transition-transform group-hover:rotate-90 sm:h-10 sm:w-10 sm:text-2xl">+</span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.09em] sm:mt-2 sm:text-[10px] sm:tracking-[0.16em]">{t.newOrder}</span>
                </Link>
              </section>
            )}

            <section
              id="orders-panel"
              aria-label={view === "tracking" ? t.tracking : t.history}
              className="mt-6 border-t border-black/15 pt-5 sm:mt-9 sm:pt-7"
            >
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3 sm:mb-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-mbg-green">{t.listTitle}</span>
                  <h2 className="mt-1 text-xl font-black uppercase tracking-tight sm:text-3xl">
                    {view === "tracking" ? t.activeList : t.archivedList}
                  </h2>
                  <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-[#404040] sm:mt-2 sm:text-sm">{t.listSubtitle}</p>
                </div>
                <span className="shrink-0 self-start rounded-sm border border-black/15 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.07em] text-black/70 sm:self-auto">{visibleOrders.length} {t.orderCount}</span>
              </div>
              {visibleOrders.length ? (
                <>
                  <div id="orders-list" className="space-y-3 sm:space-y-4" aria-live="off">
                    {shownOrders.map((order) => (
                      <OrderCard key={order._id} order={order} language={language} t={t} />
                    ))}
                  </div>
                  <div className="mt-4 flex flex-col items-center gap-3 sm:mt-6">
                    <p className="text-[11px] font-medium tabular-nums text-[#404040]" aria-live="polite">
                      {t.showingOrders}: <strong className="font-bold text-black">{shownOrders.length} / {visibleOrders.length}</strong>
                    </p>
                    {remainingOrders > 0 && (
                      <button
                        type="button"
                        aria-controls="orders-list"
                        onClick={() => setVisibleCount((count) => Math.min(count + ORDERS_PER_CLICK, visibleOrders.length))}
                        className="flex min-h-12 w-full items-center justify-center gap-3 rounded-sm border border-[#00821A] bg-white px-6 py-3 text-[12px] font-black uppercase tracking-[0.1em] text-[#00821A] transition-colors hover:bg-[#00821A] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00821A] sm:w-auto sm:min-w-56"
                      >
                        {t.seeMore}
                        <span className="rounded-sm bg-[#00821A]/10 px-2 py-1 text-[10px] tabular-nums">+{Math.min(ORDERS_PER_CLICK, remainingOrders)}</span>
                        <span aria-hidden="true">↓</span>
                      </button>
                    )}
                    {visibleCount > INITIAL_VISIBLE_ORDERS && (
                      <button
                        type="button"
                        onClick={() => setVisibleCount(INITIAL_VISIBLE_ORDERS)}
                        className="min-h-10 px-4 text-[11px] font-bold uppercase tracking-[0.08em] text-[#404040] underline underline-offset-4 transition-colors hover:text-[#00821A]"
                      >
                        {t.seeLess}
                      </button>
                    )}
                  </div>
                </>

              ) : (
                <StatePanel
                  title={view === "tracking" ? t.emptyTracking : t.emptyHistory}
                  body={view === "tracking" ? t.emptyTrackingText : t.emptyHistoryText}
                >
                  {view === "tracking" ? (
                    <Link href={`/products?lang=${language}`} className="inline-flex min-h-11 items-center rounded-sm bg-mbg-black px-6 text-xs font-bold uppercase tracking-wider text-white hover:bg-mbg-green">{t.shop}</Link>
                  ) : (
                    <button type="button" onClick={() => changeView("tracking")} className="min-h-11 rounded-sm bg-mbg-black px-6 text-xs font-bold uppercase tracking-wider text-white hover:bg-mbg-green">{t.backToTracking}</button>
                  )}
                </StatePanel>
              )}
            </section>
          </>
        )}
        <aside className="mt-8 overflow-hidden rounded-sm border-l-[3px] border-[#00821A] bg-black px-4 py-6 text-white sm:mt-12 sm:px-9 sm:py-9">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="max-w-xl">
              <p className="text-[10px] font-black uppercase tracking-[0.19em] text-white/70">GRIND UNTIL ACHIEVE</p>
              <h2 className="mt-2 text-lg font-black uppercase leading-tight tracking-tight sm:text-2xl">{t.storyHeading}</h2>
              <p className="mt-2 text-xs leading-relaxed text-white/70 sm:text-sm">{t.storyDescription}</p>
            </div>
            <Link href={`/grind-until-achieve?lang=${language}`} className="inline-flex min-h-11 w-full items-center justify-center rounded-sm border border-white/50 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:border-[#00821A] hover:bg-[#00821A] sm:w-auto sm:shrink-0">
              {t.story} <span aria-hidden="true" className="ml-2">↗</span>
            </Link>
          </div>
        </aside>
      </Container>
    </main>
  );
}

function StatePanel({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <section className="relative flex min-h-48 flex-col items-center justify-center overflow-hidden rounded-sm border border-black/10 bg-white px-4 py-8 text-center before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-[#00821A] sm:min-h-72 sm:px-6 sm:py-12">
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-mbg-black/60">{body}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>
    </section>
  );
}

function SummaryCard({
  count,
  label,
  variant,
}: {
  count: number;
  label: string;
  variant: "awaiting" | "preparing" | "shipping";
}) {
  const color = {
    awaiting: "bg-mbg-black text-white",
    preparing: "bg-mbg-darkgrey text-white",
    shipping: "bg-mbg-green text-white",
  }[variant];
  return (
    <div className="relative flex min-h-[96px] min-w-0 flex-col items-center justify-center rounded-sm border border-black/10 bg-white px-1.5 py-3 text-center transition-colors hover:border-[#00821A]/60 sm:min-h-[132px] sm:items-start sm:justify-end sm:px-5 sm:pb-4 sm:pt-10 sm:text-left">
      <span className={"absolute -top-3 left-4 hidden h-9 w-9 items-center justify-center rounded-sm sm:flex " + color}>
        <StageIcon variant={variant} />
      </span>
      <strong className="text-2xl font-black leading-none tracking-tight sm:text-4xl">{count}</strong>
      <span className="mt-2 block break-words text-[9px] font-bold uppercase leading-[1.4] tracking-[0.02em] text-black/65 sm:text-[10px] sm:tracking-[0.11em]">{label}</span>
    </div>
  );
}

function StageIcon({ variant }: { variant: "awaiting" | "preparing" | "shipping" }) {
  if (variant === "shipping") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path d="M3 6h11v10H3zM14 9h4l3 3v4h-7z" />
        <circle cx="7" cy="17" r="1.5" /><circle cx="18" cy="17" r="1.5" />
      </svg>
    );
  }
  if (variant === "preparing") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" className="h-5 w-5">
        <path d="M4 8 12 4l8 4-8 4-8-4zM4 8v9l8 4 8-4V8M12 12v9" />
      </svg>
    );
  }
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-5 w-5">
      <path d="M5 7h14M5 12h14M5 17h9" /><circle cx="19" cy="17" r="2" />
    </svg>
  );
}

function OrderCard({
  order,
  language,
  t,
}: {
  order: StorefrontOrder;
  language: Language;
  t: Texts;
}) {
  const [expanded, setExpanded] = useState(false);
  const status = normalizeStatus(order.fulfillmentStatus);
  const stage = getStage(status);
  const products = order.products ?? [];
  const quantity = products.reduce(
    (sum, product) => sum + safeQuantity(product.quantity),
    0,
  );
  const orderId = String(order._id);
  const reference = getReference(order);
  const isCancelled = status === "CANCELLED" || status === "CANCELED";
  const firstProduct = products[0]?.product;
  const previewImage = firstProduct?.media?.[0];

  return (
    <article
      aria-label={`${t.order} ${reference}`}
      className="group min-w-0 overflow-hidden rounded-sm border border-black/10 bg-white shadow-[0_8px_28px_rgba(0,0,0,0.04)] transition-[border-color,box-shadow] hover:border-[#00821A]/50 hover:shadow-[0_16px_34px_rgba(0,0,0,0.07)]"
    >
      <div className="p-4 sm:p-6">
        <div className="flex min-w-0 items-start justify-between gap-2 sm:gap-4">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-black/10 bg-[#F5F5F2] sm:size-[72px]">
              {previewImage ? (
                <Image
                  src={previewImage}
                  alt={firstProduct?.title || "Milos BG"}
                  width={72}
                  height={72}
                  sizes="(max-width: 640px) 56px, 72px"
                  className="size-full object-contain p-1.5"
                />
              ) : (
                <span className="text-[9px] font-black uppercase tracking-[0.1em] text-black/30" aria-hidden="true">MBG</span>
              )}
            </div>
            <div className="min-w-0">
              <SmallLabel>{t.order}</SmallLabel>
              <Link
                href={`/orders/${encodeURIComponent(orderId)}?lang=${language}`}
                className="block break-all text-[13px] font-black uppercase leading-5 tracking-[0.02em] text-black hover:text-[#00821A] sm:text-base"
              >
                {reference}
              </Link>
              {firstProduct?.title && (
                <p className="mt-1 max-w-[11rem] truncate text-[11px] leading-4 text-black/60 sm:max-w-none">{firstProduct.title}</p>
              )}
              <span className="mt-1.5 inline-flex max-w-full border-l-2 border-[#00821A] bg-[#00821A]/[0.07] px-2 py-1 text-[9px] font-bold uppercase leading-4 tracking-[0.02em] text-black/80 sm:text-[10px]">
                {statusLabel(status, t)}
              </span>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <SmallLabel>{t.total}</SmallLabel>
            <strong className="block text-sm font-black tabular-nums tracking-tight text-[#00821A] sm:text-lg">
              {formatMoney(order.totalAmount, language)}
            </strong>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 border-t border-black/10 pt-3 sm:grid-cols-3 sm:gap-4 sm:pt-4">
          <div className="min-w-0">
            <SmallLabel>{t.placedOn}</SmallLabel>
            <span className="block text-[12px] font-semibold leading-5 text-black">{formatDate(getCreatedAt(order), language)}</span>
          </div>
          <div className="min-w-0">
            <SmallLabel>{t.items}</SmallLabel>
            <span className="block text-[12px] font-semibold leading-5 text-black">{quantity} {t.items.toLowerCase()}</span>
          </div>
          <div className="col-span-2 min-w-0 sm:col-span-1">
            <SmallLabel>{t.delivery}</SmallLabel>
            <span className="block break-words text-[12px] font-semibold leading-5 text-black">{formatShipping(order.shippingMethod, t)}</span>
          </div>
        </div>

        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={`order-details-${orderId}`}
          onClick={() => setExpanded((previous) => !previous)}
          className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-sm border border-black/15 bg-[#F5F5F2] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.07em] text-black transition-colors hover:border-[#00821A] hover:bg-[#00821A]/[0.07] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00821A] sm:w-auto"
        >
          {expanded ? t.hideDetails : t.details}
          <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`}>
            <path d="m3 6 5 5 5-5" />
          </svg>
        </button>
      </div>

      {stage !== null && !isCancelled ? (
        <OrderProgress stage={stage} language={language} t={t} />
      ) : (
        <div className="border-t border-black/10 bg-[#F5F5F2] px-4 py-3 text-xs font-semibold text-[#404040] sm:px-6">
          {statusLabel(status, t)}
        </div>
      )}

      <div id={`order-details-${orderId}`} hidden={!expanded} className="border-t border-black/10 bg-[#F9F9F7] px-4 py-4 sm:px-6 sm:py-5">
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-black/55">{t.products}</p>
          {products.length > 0 && (
            <div className="mt-2 divide-y divide-black/10">
              {products.map((product, index) => (
                <OrderProduct key={product._id ?? index} product={product} language={language} t={t} />
              ))}
            </div>
          )}
          <Link
            href={`/orders/${encodeURIComponent(orderId)}?lang=${language}`}
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-sm bg-black px-5 py-2 text-[11px] font-bold uppercase tracking-[0.06em] text-white transition-colors hover:bg-[#00821A] sm:w-auto"
          >
            {t.orderDetails} <span aria-hidden="true" className="ml-2">→</span>
          </Link>
      </div>
    </article>
  );
}

function SmallLabel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={"mb-1 block text-[10px] font-bold uppercase tracking-[0.15em] text-mbg-black/45 " + className}>
      {children}
    </span>
  );
}

function OrderProgress({
  stage,
  language,
  t,
}: {
  stage: Stage;
  language: Language;
  t: Texts;
}) {
  const labels = [
    stage === 0 ? t.awaiting : t.confirmed,
    stage <= 1 ? t.preparing : t.prepared,
    stage <= 2 ? t.shipping : t.shipped,
    t.delivered,
  ];
  return (
    <div className="border-t border-black/10 bg-[#F5F5F2] px-3 py-4 sm:px-6 sm:py-5" aria-label={t.timeline} lang={language}>
      <ol className="grid grid-cols-4" aria-label={t.timeline}>
        {labels.map((label, index) => {
          const done = index < stage || stage === 3;
          const active = index === stage && stage !== 3;
          return (
            <li key={index} className="min-w-0 text-center" aria-current={active ? "step" : undefined}>
              <div className="relative flex h-5 items-center justify-center">
                {index > 0 && <span aria-hidden="true" className={`absolute inset-y-[9px] left-0 right-1/2 h-0.5 ${index <= stage ? "bg-[#00821A]" : "bg-black/15"}`} />}
                {index < 3 && <span aria-hidden="true" className={`absolute inset-y-[9px] left-1/2 right-0 h-0.5 ${index < stage ? "bg-[#00821A]" : "bg-black/15"}`} />}
                <span aria-hidden="true" className={`relative z-10 flex size-5 shrink-0 items-center justify-center rounded-full border-2 text-[10px] leading-none ${done ? "border-[#00821A] bg-[#00821A] text-white" : active ? "border-[#00821A] bg-white" : "border-black/15 bg-white"}`}>
                  {done ? "✓" : active ? <span className="size-1.5 rounded-full bg-[#00821A]" /> : null}
                </span>
              </div>
              <span className={`mt-2 block break-words px-0.5 text-[9px] font-bold leading-3 sm:min-h-8 sm:text-[11px] sm:leading-4 ${done || active ? "text-[#00821A]" : "text-black/45"}`}>
                <span className="sm:hidden">{t.shortProgress[index]}</span>
                <span className="hidden sm:inline">{label}</span>
              </span>
              <span className="sr-only">
                {done ? (language === "fr" ? "Terminée" : "Complete") : active ? (language === "fr" ? "En cours" : "Current") : (language === "fr" ? "À venir" : "Upcoming")}
              </span>
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
    <div className="flex min-w-0 flex-wrap items-center gap-3 py-3 sm:gap-4 sm:py-4">
      <div className="size-14 shrink-0 overflow-hidden rounded-sm border border-black/10 bg-white sm:size-20">
        <Image src={imageSrc} alt={product.product?.title || "Milos BG"} width={80} height={80} className="h-full w-full object-contain" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="break-words text-xs font-bold uppercase leading-5">{product.product?.title || "Milos BG"}</p>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-mbg-black/65">
          {product.color && <span>{t.color}: {product.color}</span>}
          {product.size && <span>{t.size}: {product.size}</span>}
          <span>{t.quantity}: {quantity}</span>
        </div>
      </div>
      <strong className="ml-auto shrink-0 text-right text-xs tabular-nums">{formatMoney(unitPrice * quantity, language)}</strong>
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

function getOrderTimestamp(order: StorefrontOrder): number {
  const raw = getCreatedAt(order);
  if (!(raw instanceof Date) && typeof raw !== "string" && typeof raw !== "number") return 0;
  const value = raw instanceof Date ? raw.getTime() : new Date(raw).getTime();
  return Number.isFinite(value) ? value : 0;
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
