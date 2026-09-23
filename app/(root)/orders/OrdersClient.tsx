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
  const [isRefreshing, startTransition] = useTransition();
  const lastRefreshRef = useRef(0);
  const t = translations[language];

  useEffect(() => {
    try {
      if (window.localStorage.getItem("mbg-orders-language") === "fr") {
        setLanguage("fr");
      }
    } catch {
      // The language switch still works when storage is unavailable.
    }
  }, []);

  const changeLanguage = (next: Language) => {
    setLanguage(next);
    try {
      window.localStorage.setItem("mbg-orders-language", next);
    } catch {
      // Storage is optional.
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
    <main className="min-h-[60vh] bg-[#f7f8fa] pb-16 font-[Kanit] text-mbg-black">
      <div className="bg-mbg-green">
        <Container className="flex min-h-12 items-center justify-between gap-3 py-1">
          <nav aria-label={language === "fr" ? "Commandes" : "Orders"} className="flex min-w-0 items-center">
            <div role="group" aria-label={language === "fr" ? "Afficher les commandes" : "Show orders"} className="flex items-center">
              <button
                type="button"
                id="tab-tracking"
                aria-controls="orders-panel"
                aria-pressed={view === "tracking"}
                onClick={() => setView("tracking")}
                className={"min-h-10 rounded-sm px-4 text-[10px] font-bold uppercase tracking-[0.16em] transition-colors sm:px-7 " +
                  (view === "tracking"
                    ? "bg-white text-mbg-green"
                    : "bg-white/15 text-white hover:bg-white/25")}
              >
                {t.tracking}
                <span className="ml-1.5 opacity-70">{trackingOrders.length}</span>
              </button>
              <button
                type="button"
                id="tab-history"
                aria-controls="orders-panel"
                aria-pressed={view === "history"}
                onClick={() => setView("history")}
                className={"min-h-10 rounded-sm px-4 text-[10px] font-bold uppercase tracking-[0.16em] transition-colors sm:px-7 " +
                  (view === "history"
                    ? "bg-white text-mbg-green"
                    : "bg-white/15 text-white hover:bg-white/25")}
              >
                {t.history}
                <span className="ml-1.5 opacity-70">{historyOrders.length}</span>
              </button>
            </div>
            <Link
              href="/the-hoop"
              className="flex min-h-10 items-center rounded-sm bg-white/15 px-4 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-white/25 sm:px-7"
            >
              {t.cart}
            </Link>
          </nav>
          <div role="group" aria-label={t.language} className="flex shrink-0 items-center gap-1 text-[10px] font-bold">
            <button type="button" lang="en" aria-pressed={language === "en"} onClick={() => changeLanguage("en")} className={"rounded-sm px-2 py-2 " + (language === "en" ? "bg-white text-mbg-green" : "text-white")}>EN</button>
            <button type="button" lang="fr" aria-pressed={language === "fr"} onClick={() => changeLanguage("fr")} className={"rounded-sm px-2 py-2 " + (language === "fr" ? "bg-white text-mbg-green" : "text-white")}>FR</button>
          </div>
        </Container>
      </div>

      <Container className="pt-8 md:pt-10">
        <header className="mb-7">
          <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.24em] text-mbg-green">Milos BG / {t.breadcrumb}</p>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{t.title}</h1>
          <p className="mt-2 text-sm text-mbg-black/60">{t.subtitle}</p>
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
              <section aria-label={t.tracking} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard count={counts.awaiting} label={t.awaiting} variant="awaiting" />
                <SummaryCard count={counts.preparing} label={t.preparing} variant="preparing" />
                <SummaryCard count={counts.shipping} label={t.shipping} variant="shipping" />
                <Link href="/products" className="flex min-h-28 flex-col items-center justify-center rounded-sm bg-mbg-green p-4 text-center text-white transition-colors hover:bg-mbg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mbg-green">
                  <span aria-hidden="true" className="text-3xl leading-none">+</span>
                  <span className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em]">{t.newOrder}</span>
                </Link>
              </section>
            )}

            <section
              id="orders-panel"
              aria-label={view === "tracking" ? t.tracking : t.history}
              className="mt-7 border-t border-mbg-black/10 pt-7"
            >
              {visibleOrders.length ? (
                <>
                  <div className="mb-3 hidden grid-cols-[1.05fr_.85fr_.95fr_1.05fr_.7fr_auto] gap-3 px-5 text-[9px] font-bold uppercase tracking-[0.17em] text-mbg-black/55 lg:grid">
                    <span>{t.order}</span><span>{t.items}</span><span>{t.placedOn}</span><span>{t.delivery}</span><span>{t.total}</span><span className="w-32" />
                  </div>
                  <div className="space-y-4">
                    {visibleOrders.map((order) => (
                      <OrderCard key={order._id} order={order} language={language} t={t} />
                    ))}
                  </div>
                </>
              ) : (
                <StatePanel
                  title={view === "tracking" ? t.emptyTracking : t.emptyHistory}
                  body={view === "tracking" ? t.emptyTrackingText : t.emptyHistoryText}
                >
                  {view === "tracking" ? (
                    <Link href="/products" className="inline-flex min-h-11 items-center rounded-sm bg-mbg-black px-6 text-xs font-bold uppercase tracking-wider text-white hover:bg-mbg-green">{t.shop}</Link>
                  ) : (
                    <button type="button" onClick={() => setView("tracking")} className="min-h-11 rounded-sm bg-mbg-black px-6 text-xs font-bold uppercase tracking-wider text-white hover:bg-mbg-green">{t.backToTracking}</button>
                  )}
                </StatePanel>
              )}
            </section>
          </>
        )}
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
    <section className="flex min-h-64 flex-col items-center justify-center rounded-sm border border-mbg-black/10 bg-white px-6 py-12 text-center">
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
    <div className="relative flex min-h-28 flex-col justify-end rounded-sm border border-mbg-black/10 bg-white px-5 pb-4 pt-8">
      <span className={"absolute -top-3 left-4 flex h-9 w-9 items-center justify-center rounded-sm " + color}>
        <StageIcon variant={variant} />
      </span>
      <strong className="text-3xl leading-none">{count}</strong>
      <span className="mt-2 text-[10px] font-medium uppercase tracking-[0.13em] text-mbg-black/60">{label}</span>
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

  return (
    <article className="overflow-hidden rounded-sm border border-mbg-black/10 bg-white transition-shadow hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
      <div className="grid gap-4 px-5 py-5 sm:grid-cols-2 lg:grid-cols-[1.05fr_.85fr_.95fr_1.05fr_.7fr_auto] lg:items-center lg:gap-3">
        <div className="min-w-0">
          <SmallLabel className="lg:hidden">{t.order}</SmallLabel>
          <Link href={"/orders/" + encodeURIComponent(orderId)} className="block truncate text-xs font-bold uppercase tracking-[0.07em] hover:text-mbg-green">
            {reference}
          </Link>
          <span className="mt-1 block text-[10px] font-medium text-mbg-black/50">
            {statusLabel(status, t)}
          </span>
        </div>
        <div>
          <SmallLabel className="lg:hidden">{t.items}</SmallLabel>
          <span className="text-xs font-semibold">{quantity} {t.items.toLowerCase()}</span>
        </div>
        <div>
          <SmallLabel className="lg:hidden">{t.placedOn}</SmallLabel>
          <span className="text-xs font-semibold">{formatDate(getCreatedAt(order), language)}</span>
        </div>
        <div>
          <SmallLabel className="lg:hidden">{t.delivery}</SmallLabel>
          <span className="text-xs font-semibold">{formatShipping(order.shippingMethod, t)}</span>
        </div>
        <div>
          <SmallLabel className="lg:hidden">{t.total}</SmallLabel>
          <span className="text-xs font-bold">{formatMoney(order.totalAmount, language)}</span>
        </div>
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={"order-details-" + orderId}
          onClick={() => setExpanded((previous) => !previous)}
          className="inline-flex min-h-10 w-full items-center justify-center gap-3 rounded-sm border border-mbg-black/15 px-3 text-[10px] font-semibold text-mbg-green transition-colors hover:border-mbg-green hover:bg-mbg-green/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mbg-green sm:w-auto lg:w-32"
        >
          {expanded ? t.hideDetails : t.details}
          <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={"h-3.5 w-3.5 transition-transform " + (expanded ? "rotate-180" : "")}>
            <path d="m3 6 5 5 5-5" />
          </svg>
        </button>
      </div>

      {stage !== null && !isCancelled ? (
        <OrderProgress stage={stage} language={language} t={t} />
      ) : (
        <div className="border-t border-mbg-black/10 px-5 py-3 text-xs font-semibold text-mbg-darkgrey">
          {statusLabel(status, t)}
        </div>
      )}

      <div id={"order-details-" + orderId} hidden={!expanded} className="border-t border-mbg-black/10 bg-[#fcfcfc] px-5 py-5">
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-mbg-black/50">{t.products}</p>
        {products.length > 0 && (
          <div className="mt-3 divide-y divide-mbg-black/10">
            {products.map((product, index) => (
              <OrderProduct key={product._id ?? index} product={product} language={language} t={t} />
            ))}
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <Link href={"/orders/" + encodeURIComponent(orderId)} className="inline-flex min-h-10 items-center rounded-sm bg-mbg-black px-5 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-mbg-green">
            {t.orderDetails} <span aria-hidden="true" className="ml-2">→</span>
          </Link>
        </div>
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
    <span className={"mb-1 block text-[9px] font-bold uppercase tracking-[0.15em] text-mbg-black/45 " + className}>
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
    <div className="border-t border-mbg-black/10 px-2 py-5 sm:px-5" aria-label={t.timeline} lang={language}>
      <ol className="grid grid-cols-4">
        {labels.map((label, index) => {
          const done = index < stage || stage === 3;
          const active = index === stage && stage !== 3;
          return (
            <li key={index} className="min-w-0 text-center">
              <span className={"block min-h-8 px-1 text-[9px] font-semibold leading-tight sm:text-[11px] " +
                (done || active ? "text-mbg-green" : "text-mbg-black/45")}>
                {label}
              </span>
              <div className="relative mt-2 flex h-5 items-center justify-center">
                {index > 0 && <span aria-hidden="true" className={"absolute left-0 right-1/2 h-0.5 " + (index <= stage ? "bg-mbg-green" : "bg-mbg-black/15")} />}
                {index < 3 && <span aria-hidden="true" className={"absolute left-1/2 right-0 h-0.5 " + (index < stage ? "bg-mbg-green" : "bg-mbg-black/15")} />}
                <span aria-hidden="true" className={"relative z-10 flex h-5 w-5 items-center justify-center rounded-full border-2 text-[10px] leading-none " +
                  (done
                    ? "border-mbg-green bg-mbg-green text-white"
                    : active
                      ? "border-mbg-green bg-white"
                      : "border-mbg-black/15 bg-white")}>
                  {done ? "✓" : ""}
                </span>
              </div>
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
    <div className="flex items-center gap-4 py-4">
      <div className="h-16 w-16 shrink-0 overflow-hidden bg-white sm:h-20 sm:w-20">
        <Image src={imageSrc} alt={product.product?.title || "Milos BG"} width={80} height={80} className="h-full w-full object-contain" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase">{product.product?.title || "Milos BG"}</p>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-mbg-black/65">
          {product.color && <span>{t.color}: {product.color}</span>}
          {product.size && <span>{t.size}: {product.size}</span>}
          <span>{t.quantity}: {quantity}</span>
        </div>
      </div>
      <strong className="shrink-0 text-xs">{formatMoney(unitPrice * quantity, language)}</strong>
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
