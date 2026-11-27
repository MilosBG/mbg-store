import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

import Container from "@/components/mbg-components/Container";
import { getOrderDetails } from "@/lib/actions/actions";
import { buildMetadata } from "@/lib/seo";

type Language = "en" | "fr";
type PageProps = {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ lang?: string | string[] }>;
};
type ResolvedOrder = NonNullable<Awaited<ReturnType<typeof getOrderDetails>>>;
type OrderLine = NonNullable<ResolvedOrder["products"]>[number];

const FALLBACK_IMAGE =
  "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

const copy = {
  en: {
    eyebrow: "YOUR JOURNEY / ORDER DETAILS",
    title: "Your order",
    description: "From the first step to the final delivery, follow your Milos BG journey.",
    shortJourney: "FIVE CHAPTERS. ONE JOURNEY.",
    breadcrumb: "Orders",
    back: "All orders",
    reference: "Order reference",
    summary: "Order overview",
    status: "Current status",
    total: "Order total",
    shipping: "Shipping",
    item: "Item",
    items: "Items",
    journey: "Your order journey",
    progressDesc: "Each step brings your piece closer to you.",
    received: "Received",
    preparing: "Preparing",
    sent: "On the way",
    delivered: "Delivered",
    products: "Your pieces",
    piecesTitle: "Items in this order",
    product: "Product",
    color: "Color",
    size: "Size",
    qty: "Qty",
    unitPrice: "Unit price",
    lineTotal: "Line total",
    financials: "Order summary",
    subtotal: "Subtotal",
    promotion: "Promotion",
    shippingCost: "Shipping",
    includingDelivery: "Including delivery",
    placedOn: "Placed on",
    language: "Language",
    signInEyebrow: "Account required",
    signInTitle: "Sign in to view your order",
    signInBody: "For your privacy, your order is accessible only through your Milos BG account.",
    signIn: "Sign in",
    missingEyebrow: "Order unavailable",
    missingTitle: "Order not found",
    missingBody: "We couldn't find this order or it isn't associated with your account.",
    pending: "Awaiting confirmation",
    processing: "In preparation",
    confirmed: "Confirmed",
    packed: "Packed",
    shipped: "Shipped",
    outForDelivery: "Out for delivery",
    completed: "Completed",
    cancelled: "Cancelled",
    refunded: "Refunded",
    returned: "Returned",
    standard: "Standard delivery",
    express: "Express delivery",
    free: "Free delivery",
    messagePending: "Your order has been received. The journey has begun.",
    messagePreparing: "Your piece is being prepared with care.",
    messageShipped: "Your order is on its way.",
    messageDelivered: "Your order has reached its destination.",
    messageCompleted: "Journey completed. Thank you for being part of Milos BG.",
    messageCancelled: "This order has been cancelled.",
    messageRefunded: "This order has been refunded.",
    messageReturned: "This order has been returned.",
    step: "Step",
    parcel: "Shipment tracking",
    trackingNumber: "Tracking number",
    carrier: "Carrier",
    trackParcel: "Track your parcel",
  },
  fr: {
    eyebrow: "VOTRE PARCOURS / DÉTAIL DE COMMANDE",
    title: "Votre commande",
    description: "De la première étape à la livraison, suivez le parcours de votre pièce Milos BG.",
    shortJourney: "CINQ CHAPITRES. UN SEUL PARCOURS.",
    breadcrumb: "Commandes",
    back: "Toutes les commandes",
    reference: "Référence de commande",
    summary: "Vue d’ensemble",
    status: "Statut actuel",
    total: "Total de la commande",
    shipping: "Livraison",
    item: "Article",
    items: "Articles",
    journey: "Le parcours de votre commande",
    progressDesc: "Chaque étape rapproche votre pièce de vous.",
    received: "Reçue",
    preparing: "Préparation",
    sent: "En route",
    delivered: "Livrée",
    products: "Vos pièces",
    piecesTitle: "Articles de cette commande",
    product: "Produit",
    color: "Couleur",
    size: "Taille",
    qty: "Qté",
    unitPrice: "Prix unitaire",
    lineTotal: "Total de l’article",
    financials: "Récapitulatif",
    subtotal: "Sous-total",
    promotion: "Réduction",
    shippingCost: "Livraison",
    includingDelivery: "Livraison incluse",
    placedOn: "Passée le",
    language: "Langue",
    signInEyebrow: "Connexion nécessaire",
    signInTitle: "Connectez-vous pour voir votre commande",
    signInBody: "Pour votre confidentialité, la commande est accessible uniquement depuis votre compte Milos BG.",
    signIn: "Se connecter",
    missingEyebrow: "Commande indisponible",
    missingTitle: "Commande introuvable",
    missingBody: "Nous ne trouvons pas cette commande ou elle n’est pas associée à votre compte.",
    pending: "En attente de validation",
    processing: "En préparation",
    confirmed: "Confirmée",
    packed: "Emballée",
    shipped: "Expédiée",
    outForDelivery: "En cours de livraison",
    completed: "Terminée",
    cancelled: "Annulée",
    refunded: "Remboursée",
    returned: "Retournée",
    standard: "Livraison standard",
    express: "Livraison express",
    free: "Livraison gratuite",
    messagePending: "Votre commande a été reçue. Le parcours commence.",
    messagePreparing: "Votre pièce est préparée avec soin.",
    messageShipped: "Votre commande est en route.",
    messageDelivered: "Votre commande est arrivée à destination.",
    messageCompleted: "Parcours terminé. Merci de faire partie de Milos BG.",
    messageCancelled: "Cette commande a été annulée.",
    messageRefunded: "Cette commande a été remboursée.",
    messageReturned: "Cette commande a été retournée.",
    step: "Étape",
    parcel: "Suivi de l’expédition",
    trackingNumber: "Numéro de suivi",
    carrier: "Transporteur",
    trackParcel: "Suivre le colis",
  },
} as const;

type Texts = (typeof copy)[Language];

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { orderId } = await params;
  return buildMetadata({
    title: `Order ${orderId}`,
    description: "Securely review your Milos BG order and delivery progress.",
    path: `/orders/${encodeURIComponent(orderId)}`,
    image: "/Grinder.png",
    keywords: ["Milos BG", "orders", "delivery status"],
    robotsIndex: false,
  });
}

export default async function OrderDetailsPage({ params, searchParams }: PageProps) {
  const [{ orderId }, query] = await Promise.all([params, searchParams]);
  const rawLang = Array.isArray(query.lang) ? query.lang[0] : query.lang;
  const language: Language = rawLang === "fr" ? "fr" : "en";
  const t = copy[language];
  const backHref = `/orders?lang=${language}`;
  const currentHref = `/orders/${encodeURIComponent(orderId)}`;
  const { userId } = await auth();

  if (!userId) {
    return (
      <PageFrame language={language} title={t.title} eyebrow={t.eyebrow} description={t.description}>
        <LanguageSwitch baseHref={currentHref} language={language} title={t.language} />
        <EmptyPage eyebrow={t.signInEyebrow} title={t.signInTitle} body={t.signInBody} button={t.signIn} href="/sign-in" />
      </PageFrame>
    );
  }

  const order = await getOrderDetails(orderId, { customerId: userId });
  if (!order) {
    return (
      <PageFrame language={language} title={t.title} eyebrow={t.eyebrow} description={t.description}>
        <LanguageSwitch baseHref={currentHref} language={language} title={t.language} />
        <EmptyPage eyebrow={t.missingEyebrow} title={t.missingTitle} body={t.missingBody} button={t.back} href={backHref} />
      </PageFrame>
    );
  }

  const status = String(order.fulfillmentStatus || "PENDING").toUpperCase();
  const products = order.products ?? [];
  const totalQuantity = products.reduce((sum, item) => sum + safeNumber(item.quantity ?? 1), 0);
  const subtotal = products.reduce((sum, item) => {
    const price = safeNumber(item.unitPrice ?? item.product?.price ?? 0);
    const quantity = safeNumber(item.quantity ?? 1);
    return sum + price * quantity;
  }, 0);
  // Preserve the saved server-side promotion and total; never recompute a coupon here.
  const discount = safeNumber(order.promotion?.discountCents ?? 0) / 100;
  const total = safeNumber(order.totalAmount ?? subtotal);
  const shipping = typeof order.shippingAmount === "number"
    ? order.shippingAmount
    : resolveShippingAmount(order.shippingMethod, subtotal, total + discount);
  const createdAt = order.createdAt;
  const stage = stageFromStatus(status);
  const statusText = translateStatus(status,t);
  const isNeutralStatus = stage === null;
  const trackingUrl = safeTrackingUrl(order.trackingUrl);

  return (
    <PageFrame language={language} title={t.title} eyebrow={t.eyebrow} description={t.description}>
      <div className="mt-[13px] flex items-center justify-between gap-[8px] sm:mt-[21px]">
        <Link href={backHref} className="inline-flex min-h-9 min-w-0 items-center gap-[5px] rounded-sm border border-[#9fa9a2] bg-white px-[10px] text-[9px] sm:min-h-11 sm:gap-2 sm:px-[21px] sm:text-[11px] font-bold uppercase text-[#111715] transition-colors hover:border-[#00821A] hover:text-[#00821A]">
          <span aria-hidden="true">←</span> {t.back}
        </Link>
        <LanguageSwitch baseHref={currentHref} language={language} title={t.language} />
      </div>

      <section className="mt-[13px] min-w-0 overflow-hidden rounded-sm border border-[#c6cec8] bg-[#f7f8f6] shadow-[0_13px_34px_rgba(17,23,21,0.05)]" aria-label={t.summary}>
        {/* The ink-dark section is deliberately short: a light reading area dominates. */}
        <div className="relative grid gap-[8px] bg-[#161e19] px-[13px] py-[21px] text-white sm:gap-[21px] sm:px-[34px] sm:py-[34px] lg:grid-cols-[minmax(0,1.618fr)_minmax(0,1fr)]">
          <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-[#00821A]" />
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#61d477]">{t.reference}</p>
            <h2 className="mt-[8px] break-all text-[clamp(1.1rem,3vw,2.1rem)] font-black uppercase leading-[1.13] tracking-[-0.025em]">#{orderId}</h2>
            {formatDate(createdAt,language) && <p className="mt-[13px] text-[11px] text-white/65">{t.placedOn} · {formatDate(createdAt,language)}</p>}
          </div>
          <div className="flex flex-col justify-center border-t border-white/15 pt-[8px] sm:pt-[21px] lg:border-l lg:border-t-0 lg:pl-[34px] lg:pt-0">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/55">{t.status}</p>
            <span className={`mt-[5px] inline-flex w-fit items-center gap-[6px] rounded-sm border px-[10px] py-[6px] text-[10px] sm:mt-[8px] sm:gap-2 sm:px-[13px] sm:py-[8px] sm:text-[12px] font-bold ${isNeutralStatus ? "border-white/25 bg-white/10 text-[#e4e9e5]" : "border-[#61d477]/30 bg-[#00821A]/20 text-[#88ed9b]"}`}>
              <span className={`h-2 w-2 rounded-full ${isNeutralStatus ? "bg-white/60" : "bg-[#61d477]"}`} aria-hidden="true" />{statusText}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-0 border-b border-[#d1d8d2]">
          <Metric label={t.total} value={money(total,language)} />
          <Metric label={t.shipping} value={shippingLabel(order.shippingMethod,t)} />
          <Metric label={totalQuantity === 1 ? t.item : t.items} value={String(totalQuantity)} last />
        </div>

        <div className="px-[13px] py-[21px] sm:px-[34px] sm:py-[55px]">
          <div className="flex flex-wrap items-end justify-between gap-[13px]">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00821A]">01 / {t.step}</p>
              <h3 className="mt-[8px] text-[clamp(1.4rem,3vw,2.125rem)] font-black uppercase tracking-[-0.025em]">{t.journey}</h3>
              <p className="mt-[8px] max-w-xl text-[12px] leading-[1.65] text-[#626c65]">{t.progressDesc}</p>
            </div>
          </div>
          {stage !== null ? <OrderProgress stage={stage} order={order} language={language} t={t} /> : <p className="mt-[21px] rounded-sm border border-[#d1d8d2] bg-[#e7eae8] px-[21px] py-[13px] text-[12px] font-bold text-[#48564d]">{statusText}</p>}
          <div className="mt-[21px] border-l-[3px] border-[#00821A] bg-[#e7ebe7] px-[21px] py-[13px] text-[12px] leading-[1.65] text-[#39463d]">{statusMessage(status,t)}</div>
          {(order.trackingNumber || order.transporter || trackingUrl) && (
            <div className="mt-[13px] grid gap-[8px] rounded-sm border border-[#c6cec8] bg-white p-[13px] sm:mt-[21px] sm:grid-cols-2 sm:p-[21px]">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#00821A]">{t.parcel}</p>
                {order.transporter && <p className="mt-[8px] break-words text-[11px] text-[#56605a]">{t.carrier} · <strong className="text-[#111715]">{order.transporter}</strong></p>}
                {order.trackingNumber && <p className="mt-[8px] break-all text-[11px] text-[#56605a]">{t.trackingNumber} · <strong className="text-[#111715]">{order.trackingNumber}</strong></p>}
              </div>
              {trackingUrl && <a href={trackingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center justify-center self-center rounded-sm bg-[#111715] px-[13px] text-[10px] sm:min-h-11 sm:px-[21px] sm:text-[11px] font-bold uppercase text-white hover:bg-[#00821A]">{t.trackParcel} ↗</a>}
            </div>
          )}
        </div>
      </section>

      {/* 61.8% product story / 38.2% invoice summary on wide displays. */}
      <div className="mt-[13px] grid min-w-0 items-start gap-[13px] sm:mt-[21px] sm:gap-[21px] lg:grid-cols-[minmax(0,1.618fr)_minmax(0,1fr)]">
        <section className="min-w-0 rounded-sm border border-[#c6cec8] bg-[#f7f8f6] px-[13px] py-[21px] sm:px-[34px] sm:py-[34px]" aria-labelledby="order-pieces-title">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00821A]">02 / {t.products}</p>
          <div className="mt-[8px] flex items-baseline justify-between gap-3">
            <h3 id="order-pieces-title" className="text-[clamp(1.35rem,2.5vw,2rem)] font-black uppercase tracking-[-0.025em]">{t.piecesTitle}</h3>
            <span className="whitespace-nowrap text-[11px] font-bold text-[#626c65]">{totalQuantity} {totalQuantity === 1 ? t.item : t.items}</span>
          </div>
          <div className="mt-[13px] divide-y divide-[#d4dad5]">
            {products.map((item, index) => <OrderPiece key={String(item._id ?? index)} item={item} language={language} t={t} />)}
          </div>
        </section>
        <aside className="min-w-0 rounded-sm border border-[#c6cec8] bg-[#e9ede9] px-[13px] py-[21px] sm:px-[34px] sm:py-[34px] lg:sticky lg:top-[21px]" aria-label={t.financials}>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00821A]">03 / {t.financials}</p>
          <h3 className="mt-[8px] text-[clamp(1.35rem,2.5vw,2rem)] font-black uppercase tracking-[-0.025em]">{t.financials}</h3>
          <div className="mt-[21px] space-y-[13px]">
            <MoneyRow label={t.subtotal} amount={subtotal} language={language} />
            {discount > 0 && <MoneyRow label={`${t.promotion} ${order.promotion?.code ?? ""}`} amount={-discount} language={language} accent />}
            <MoneyRow label={t.shippingCost} amount={shipping} language={language} />
          </div>
          <div className="mt-[21px] border-t border-[#bcc7be] pt-[21px]">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#626c65]">{t.total}</p>
            <p className="mt-[8px] break-words text-[clamp(1.9rem,4vw,2.9rem)] font-black leading-none tracking-[-0.045em] tabular-nums text-[#00821A]">{money(total,language)}</p>
            <p className="mt-[8px] text-[11px] text-[#626c65]">{t.includingDelivery}</p>
          </div>
          <Link href={backHref} className="mt-[21px] inline-flex min-h-10 w-full items-center justify-center rounded-sm bg-[#111715] px-[13px] text-center text-[10px] sm:mt-[34px] sm:min-h-11 sm:text-[11px] font-black uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#00821A]">← {t.back}</Link>
        </aside>
      </div>
      <p className="pb-[21px] pt-[34px] text-center text-[10px] font-bold uppercase tracking-[0.18em] text-[#59645c]">{t.shortJourney}</p>
    </PageFrame>
  );
}

function PageFrame({language,title,eyebrow,description,children}:{language:Language;title:string;eyebrow:string;description:string;children:ReactNode}) {
  return (
    <main lang={language} className="min-h-[65vh] bg-[#e7eae8] font-[Kanit] text-[#111715]">
      <div className="border-b border-white/10 bg-[#111715]">
        <Container className="py-[13px] sm:py-[34px]">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#65d179]">{eyebrow}</p>
          <h1 className="mt-[8px] text-[clamp(1.7rem,4.2vw,3.8rem)] font-black uppercase leading-[1.03] tracking-[-0.035em] text-white">{title}</h1>
          <p className="mt-[8px] max-w-[42rem] text-[12px] leading-[1.5] text-white/65 sm:mt-[13px] sm:text-[14px] sm:leading-[1.65]">{description}</p>
        </Container>
      </div>
      <Container className="min-w-0 pb-[34px] sm:pb-[89px]">{children}</Container>
    </main>
  );
}

function LanguageSwitch({baseHref,language,title}:{baseHref:string;language:Language;title:string}) {
  return (
    <nav aria-label={title} className="inline-flex shrink-0 items-center gap-[3px] rounded-sm border border-[#bac5bc] bg-[#f7f8f6] p-[3px] sm:gap-1.5 sm:p-1.5">
      <span className="hidden px-2 text-[10px] font-bold uppercase tracking-[0.1em] text-[#56605a] sm:inline">{title}</span>
      {(["en","fr"] as const).map((value)=><Link key={value} href={`${baseHref}?lang=${value}`} lang={value} hrefLang={value} aria-current={language === value ? "page" : undefined} className={`inline-flex min-h-9 min-w-[32px] items-center justify-center rounded-sm px-[6px] text-[10px] sm:min-h-10 sm:min-w-11 sm:px-2 sm:text-[11px] font-black transition-colors ${language===value? "bg-[#00821A] text-white" : "text-[#56605a] hover:bg-[#dfe8df]"}`}>{value.toUpperCase()}</Link>)}
    </nav>
  );
}

function EmptyPage({eyebrow,title,body,button,href}:{eyebrow:string;title:string;body:string;button:string;href:string}) {
  return <section className="mt-[21px] flex min-h-[300px] flex-col items-center justify-center rounded-sm border border-[#c6cec8] bg-[#f7f8f6] p-[34px] text-center"><span className="mb-[13px] h-1 w-[55px] bg-[#00821A]" aria-hidden="true"/><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00821A]">{eyebrow}</p><h2 className="mt-[8px] text-[clamp(1.3rem,3vw,2rem)] font-black uppercase">{title}</h2><p className="mt-[13px] max-w-md text-[13px] leading-[1.65] text-[#56605a]">{body}</p><Link href={href} className="mt-[21px] inline-flex min-h-11 items-center rounded-sm bg-[#111715] px-[21px] text-[11px] font-bold uppercase text-white hover:bg-[#00821A]">{button}</Link></section>;
}

function Metric({label,value,last=false}:{label:string;value:string;last?:boolean}) {
  return <div className={`min-w-0 px-[13px] py-[21px] sm:px-[34px] ${last ? "" : "border-r border-[#d1d8d2]"}`}><p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#56605a]">{label}</p><p className="mt-[8px] break-words text-[clamp(1rem,2.1vw,1.35rem)] font-black leading-[1.25] text-[#111715]">{value}</p></div>;
}

function OrderProgress({stage,order,language,t}:{stage:0|1|2|3;order:ResolvedOrder;language:Language;t:Texts}) {
  const labels=[t.received,t.preparing,t.sent,t.delivered];
  const dates=[order.createdAt,order.processingAt,order.shippedAt,order.deliveredAt??order.completedAt];
  return <ol className="mt-[13px] grid grid-cols-4 gap-x-[5px] sm:mt-[21px] sm:gap-x-[13px]" aria-label={t.journey}>{labels.map((label,index)=>{const done=stage===3||index<stage;const active=index===stage&&stage!==3;const date=formatDate(dates[index],language);return <li key={index} aria-current={active?"step":undefined} className="min-w-0"><div className="flex items-center gap-[3px] sm:gap-[8px]"><span className={`flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full border text-[8px] sm:h-[34px] sm:w-[34px] sm:text-[11px] font-black ${done?"border-[#00821A] bg-[#00821A] text-white":active?"border-[#00821A] bg-white text-[#00821A]":"border-[#b7c3bb] text-[#77857a]"}`}>{done?"✓":String(index+1).padStart(2,"0")}</span><span className={`h-px flex-1 ${index<=stage?"bg-[#00821A]":"bg-[#c6cec8]"}`} aria-hidden="true"/></div><span className={`mt-[6px] block text-center text-[9px] font-semibold leading-[1.2] sm:mt-[8px] sm:text-left sm:text-[11px] sm:leading-[1.35] ${done||active?"text-[#00821A]":"text-[#647069]"}`}><span className="sm:hidden">{(language === "fr" ? ["Validée", "Prépar.", "Expédiée", "Livrée"] : ["Confirmed", "Prep.", "Shipped", "Delivered"])[index]}</span><span className="hidden sm:inline">{label}</span></span>{date && <time className="sr-only mt-[5px] text-[10px] text-[#677169] sm:not-sr-only sm:block">{date}</time>}</li>;})}</ol>;
}

function OrderPiece({item,language,t}:{item:OrderLine;language:Language;t:Texts}) {
  const title=item.product?.title||"Milos BG";
  const src=item.product?.media?.[0]||FALLBACK_IMAGE;
  const quantity=safeNumber(item.quantity??1);
  const unit=safeNumber(item.unitPrice??item.product?.price??0);
  return <div className="flex min-w-0 flex-wrap gap-[13px] py-[21px] sm:flex-nowrap sm:gap-[21px]"><div className="h-[89px] w-[89px] shrink-0 overflow-hidden rounded-sm bg-[#e3e7e3] sm:h-[110px] sm:w-[110px]"><Image src={src} width={110} height={110} alt={title} className="h-full w-full object-contain"/></div><div className="flex min-w-0 flex-1 flex-col justify-between gap-[13px]"><div><p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#00821A]">{t.product}</p><h4 className="mt-[5px] break-words text-[14px] font-black uppercase leading-snug">{title}</h4><div className="mt-[8px] flex flex-wrap gap-2">{item.color&&<Attr label={t.color} value={item.color}/>} {item.size&&<Attr label={t.size} value={item.size}/>} <Attr label={t.qty} value={String(quantity)}/></div></div><div className="flex flex-wrap items-end justify-between gap-2"><div><p className="text-[10px] uppercase text-[#677169]">{t.unitPrice}</p><span className="text-[12px] font-semibold">{money(unit,language)}</span></div><div className="text-right"><p className="text-[10px] uppercase text-[#677169]">{t.lineTotal}</p><strong className="text-[15px] font-black text-[#00821A]">{money(unit*quantity,language)}</strong></div></div></div></div>;
}

function Attr({label,value}:{label:string;value:string}) {
  return <span className="inline-flex items-center gap-1.5 rounded-sm border border-[#c6cec8] bg-white px-2 py-1 text-[10px] text-[#56605a]">{label}<b className="text-[#111715]">{value}</b></span>;
}
function MoneyRow({label,amount,language,accent=false}:{label:string;amount:number;language:Language;accent?:boolean}) {
  return <div className="flex flex-wrap items-start justify-between gap-[13px] text-[12px]"><span className="min-w-0 text-[#4c5a50]">{label}</span><span className={`shrink-0 font-black tabular-nums ${accent?"text-[#00821A]":"text-[#111715]"}`}>{money(amount,language)}</span></div>;
}

function safeNumber(value:unknown):number {const number=Number(value);return Number.isFinite(number)?number:0;}
function money(value:unknown,language:Language):string {return new Intl.NumberFormat(language==="fr"?"fr-FR":"en-GB",{style:"currency",currency:"EUR"}).format(safeNumber(value));}
function formatDate(value:unknown,language:Language):string|null {
  if (!(value instanceof Date)&&typeof value!=="string"&&typeof value!=="number")return null;
  const date=value instanceof Date?value:new Date(value);
  if(Number.isNaN(date.getTime()))return null;
  return new Intl.DateTimeFormat(language==="fr"?"fr-FR":"en-GB",{day:"numeric",month:"short",year:"numeric",timeZone:"UTC"}).format(date);
}
function stageFromStatus(status:string):0|1|2|3|null {
  if(status==="PENDING")return 0;
  if(["PROCESSING","CONFIRMED","PACKED"].includes(status))return 1;
  if(["SHIPPED","OUT_FOR_DELIVERY"].includes(status))return 2;
  if(["DELIVERED","COMPLETED"].includes(status))return 3;
  return null;
}
function translateStatus(status:string,t:Texts):string {
  switch(status){
    case "PENDING":return t.pending;
    case "PROCESSING":return t.processing;
    case "CONFIRMED":return t.confirmed;
    case "PACKED":return t.packed;
    case "SHIPPED":return t.shipped;
    case "OUT_FOR_DELIVERY":return t.outForDelivery;
    case "DELIVERED":return t.delivered;
    case "COMPLETED":return t.completed;
    case "CANCELLED":case "CANCELED":return t.cancelled;
    case "REFUNDED":return t.refunded;
    case "RETURNED":return t.returned;
    default:return status.replaceAll("_"," ");
  }
}
function statusMessage(status:string,t:Texts):string {
  switch(status){
    case "PROCESSING":case "CONFIRMED":case "PACKED":return t.messagePreparing;
    case "SHIPPED":case "OUT_FOR_DELIVERY":return t.messageShipped;
    case "DELIVERED":return t.messageDelivered;
    case "COMPLETED":return t.messageCompleted;
    case "CANCELLED":case "CANCELED":return t.messageCancelled;
    case "REFUNDED":return t.messageRefunded;
    case "RETURNED":return t.messageReturned;
    default:return t.messagePending;
  }
}
function shippingLabel(method:ResolvedOrder["shippingMethod"],t:Texts):string {
  const code=String(method||"").trim().toUpperCase();
  if(code.includes("EXPRESS"))return t.express;
  if(code.includes("FREE"))return t.free;
  if(code.includes("STANDARD"))return t.standard;
  return method||t.standard;
}
function resolveShippingAmount(method:ResolvedOrder["shippingMethod"],subtotal:number,totalAmount:number):number {
  const code=String(method||"").trim().toUpperCase();
  if(code==="FREE"||code==="FREE_DELIVERY")return 0;
  return Math.max(totalAmount-subtotal,0);
}

function safeTrackingUrl(value:unknown):string|null {
  if(typeof value!=="string")return null;
  try {const url=new URL(value);return (url.protocol==="https:"||url.protocol==="http:")&&!url.username&&!url.password?url.toString():null;}
  catch {return null;}
}
