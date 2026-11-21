import type { Metadata } from "next";

import Container from "@/components/mbg-components/Container";
import { H2 } from "@/components/mbg-components/H2";
import Separator from "@/components/mbg-components/Separator";

import { StatusBadge } from "@/components/orders/StatusBadge";
import { OrderTimeline } from "@/components/orders/OrderTimeline";

import { getOrderDetails } from "@/lib/actions/actions";
import { buildMetadata } from "@/lib/seo";

import Image from "next/image";
import Link from "next/link";

import { auth } from "@clerk/nextjs/server";

/* =========================================================
   TYPES
========================================================= */

type Language = "en" | "fr";

type PageProps = {
  params: Promise<{
    orderId: string;
  }>;
  searchParams?: Promise<{
    lang?: string | string[];
  }>;
};

const copy = {
  en: {
    heading: "Your order",
    heroEyebrow: "02 / THE JOURNEY CONTINUES",
    heroFirst: "A PIECE OF",
    heroSecond: "YOUR JOURNEY.",
    heroDescription: "Every order marks a new step. Follow your piece from our workshop to your hands.",
    heroSignature: "FIVE CHAPTERS. ONE JOURNEY.",
    allOrders: "All orders",
    accountRequired: "Account required",
    signInTitle: "Sign in to view your order",
    signInText: "Your order information is securely associated with your Milos BG account.",
    signIn: "Sign in",
    unavailable: "Order unavailable",
    notFound: "Order not found",
    notFoundText: "We couldn’t find this order or it isn’t associated with your account.",
    viewOrders: "View my orders",
    orderId: "Order ID",
    totalAmount: "Total amount",
    shipping: "Shipping",
    item: "Item",
    items: "Items",
    progress: "THE PATH FORWARD",
    progressCaption: "A real-time reflection of your order’s current status.",
    pieces: "YOUR PIECES",
    itemsInOrder: "The pieces in your story",
    subtotal: "Subtotal",
    total: "Order total",
    includingDelivery: "Including delivery",
    unitPrice: "Unit price",
    lineTotal: "Line total",
    product: "Product",
    color: "Color",
    size: "Size",
    quantity: "Qty",
    journeyNote: "THE JOURNEY DOESN’T STOP AT DELIVERY.",
    journeyText: "GRIND. RESILIENCE. CONSISTENCY. FOCUS. ACHIEVE. Every chapter begins with a decision.",
    discover: "Discover our story",
    pending: "Awaiting confirmation",
    processing: "In preparation",
    shipped: "On the way",
    delivered: "Delivered",
    completed: "Completed",
    cancelled: "Cancelled",
    refunded: "Refunded",
    returned: "Returned",
    receivedMsg: "Your order has been received. The next step begins here.",
    preparingMsg: "Your order is being prepared. Your journey moves forward.",
    shippedMsg: "Your order is on the way.",
    deliveredMsg: "Your order has been delivered.",
    completedMsg: "Order completed. Thank you for being part of the journey.",
    cancelledMsg: "This order has been cancelled.",
    refundedMsg: "This order has been refunded.",
    returnedMsg: "This order has been returned.",
    express: "Express delivery",
    free: "Free delivery",
    standard: "Standard delivery",
  },
  fr: {
    heading: "Votre commande",
    heroEyebrow: "02 / L’AVENTURE CONTINUE",
    heroFirst: "UNE PIÈCE DE",
    heroSecond: "VOTRE PARCOURS.",
    heroDescription: "Chaque commande marque une nouvelle étape. Suivez votre pièce de notre atelier jusqu’à vous.",
    heroSignature: "CINQ CHAPITRES. UN SEUL VOYAGE.",
    allOrders: "Toutes les commandes",
    accountRequired: "Compte nécessaire",
    signInTitle: "Connectez-vous pour consulter votre commande",
    signInText: "Les informations de cette commande sont associées à votre compte Milos BG.",
    signIn: "Se connecter",
    unavailable: "Commande indisponible",
    notFound: "Commande introuvable",
    notFoundText: "Nous n’avons pas trouvé cette commande ou elle n’est pas associée à votre compte.",
    viewOrders: "Voir mes commandes",
    orderId: "Référence de commande",
    totalAmount: "Montant total",
    shipping: "Livraison",
    item: "Article",
    items: "Articles",
    progress: "LE CHEMIN PARCOURU",
    progressCaption: "Votre commande avance au rythme des statuts réellement enregistrés.",
    pieces: "VOS PIÈCES",
    itemsInOrder: "Les pièces de votre histoire",
    subtotal: "Sous-total",
    total: "Total de la commande",
    includingDelivery: "Livraison comprise",
    unitPrice: "Prix unitaire",
    lineTotal: "Total de la ligne",
    product: "Produit",
    color: "Couleur",
    size: "Taille",
    quantity: "Qté",
    journeyNote: "L’AVENTURE NE S’ARRÊTE PAS À LA LIVRAISON.",
    journeyText: "GRIND. RESILIENCE. CONSISTENCY. FOCUS. ACHIEVE. Chaque chapitre commence par une décision.",
    discover: "Découvrir notre histoire",
    pending: "En attente de validation",
    processing: "En préparation",
    shipped: "En livraison",
    delivered: "Livrée",
    completed: "Terminée",
    cancelled: "Annulée",
    refunded: "Remboursée",
    returned: "Retournée",
    receivedMsg: "Votre commande a été reçue. La prochaine étape commence ici.",
    preparingMsg: "Votre commande est en préparation. Votre parcours se poursuit.",
    shippedMsg: "Votre commande est en route.",
    deliveredMsg: "Votre commande a été livrée.",
    completedMsg: "Commande terminée. Merci de faire partie de l’aventure.",
    cancelledMsg: "Cette commande a été annulée.",
    refundedMsg: "Cette commande a été remboursée.",
    returnedMsg: "Cette commande a été retournée.",
    express: "Livraison express",
    free: "Livraison gratuite",
    standard: "Livraison standard",
  },
} as const;

function getLanguage(value: string | string[] | undefined): Language {
  return value === "fr" || (Array.isArray(value) && value[0] === "fr") ? "fr" : "en";
}


type ResolvedOrder = NonNullable<
  Awaited<ReturnType<typeof getOrderDetails>>
>;

type OrderLine = NonNullable<
  ResolvedOrder["products"]
>[number];

/* =========================================================
   FALLBACK
========================================================= */

const FALLBACK_IMAGE =
  "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

/* =========================================================
   METADATA
========================================================= */

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { orderId } = await params;

  const encodedId =
    encodeURIComponent(orderId);

  return buildMetadata({
    title: `Order ${orderId}`,

    description:
      "Securely review the timeline and fulfillment status for your Milos BG order.",

    path: `/orders/${encodedId}`,

    image: "/Grinder.png",

    keywords: [
      "orders",
      "order status",
      "Milos BG",
    ],

    robotsIndex: false,
  });
}

/* =========================================================
   PAGE
========================================================= */

export default async function OrderDetailsPage({
  params,
  searchParams,
}: PageProps) {
  const { orderId } = await params;
  const { lang: requestedLanguage } = (await searchParams) || {};
  const language = getLanguage(requestedLanguage);
  const t = copy[language];

  const { userId } = await auth();

  /* =======================================================
     AUTH
  ======================================================= */

  if (!userId) {
    return (
      <Container className="mt-8 min-h-[60vh] pb-14">
        <div className="mb-6">
          <H2>{t.heading}</H2>

          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-mbg-black/45">
            {t.heroDescription}
          </p>
        </div>

        <Separator className="mb-8 bg-mbg-black" />

        <section
          className="
            flex
            min-h-[280px]
            flex-col
            items-center
            justify-center
            border
            border-[#BFBFBF]/65
            bg-white
            px-6
            py-14
            text-center
          "
        >
          <span className="mb-4 text-[10px] font-extrabold uppercase tracking-[0.25em] text-mbg-green">
            {t.accountRequired}
          </span>

          <h3 className="text-xl font-extrabold uppercase tracking-tight text-mbg-black md:text-2xl">
            {t.signInTitle}
          </h3>

          <p className="mt-3 max-w-sm text-[11px] leading-relaxed text-mbg-black/50">
            {t.signInText}
          </p>

          <Link
            href="/sign-in"
            className="
              mt-7
              inline-flex
              min-h-11
              items-center
              justify-center
              bg-mbg-black
              px-7
              text-[10px]
              font-extrabold
              uppercase
              tracking-[0.18em]
              text-white
              transition-colors
              duration-300
              hover:bg-mbg-green
            "
          >
            {t.signIn}
          </Link>
        </section>
      </Container>
    );
  }

  /* =======================================================
     GET ORDER
  ======================================================= */

  const orderDetails =
    await getOrderDetails(orderId, {
      customerId: userId,
    });

  /* =======================================================
     NOT FOUND
  ======================================================= */

  if (!orderDetails) {
    return (
      <Container className="mt-8 min-h-[60vh] pb-14">
        <div className="mb-6">
          <H2>{t.heading}</H2>
        </div>

        <Separator className="mb-8 bg-mbg-black" />

        <section
          className="
            flex
            min-h-[280px]
            flex-col
            items-center
            justify-center
            border
            border-[#BFBFBF]/65
            bg-white
            px-6
            py-14
            text-center
          "
        >
          <span className="mb-4 text-[10px] font-extrabold uppercase tracking-[0.25em] text-mbg-green">
            {t.unavailable}
          </span>

          <h3 className="text-xl font-extrabold uppercase tracking-tight text-mbg-black">
            {t.notFound}
          </h3>

          <p className="mt-3 max-w-sm text-[11px] leading-relaxed text-mbg-black/50">
            {t.notFoundText}
          </p>

          <Link
            href={`/orders?lang=${language}`}
            className="
              mt-7
              inline-flex
              min-h-11
              items-center
              justify-center
              bg-mbg-black
              px-7
              text-[10px]
              font-extrabold
              uppercase
              tracking-[0.18em]
              text-white
              transition-colors
              duration-300
              hover:bg-mbg-green
            "
          >
            {t.viewOrders}
          </Link>
        </section>
      </Container>
    );
  }

  /* =======================================================
     DATA
  ======================================================= */

  const status = String(
    orderDetails.fulfillmentStatus ||
      "PENDING"
  ).toUpperCase();

  const products =
    orderDetails.products ?? [];

  const totalQuantity =
    products.reduce(
      (
        total: number,
        orderItem: OrderLine
      ) =>
        total +
        Number(
          orderItem.quantity ?? 1
        ),
      0
    );

  /* =======================================================
     SUBTOTAL
  ======================================================= */

  const subtotal = products.reduce(
    (
      total: number,
      orderItem: OrderLine
    ) => {
      const unitPrice = Number(
        orderItem.unitPrice ??
          orderItem.product?.price ??
          0
      );

      const quantity = Number(
        orderItem.quantity ?? 1
      );

      return (
        total +
        unitPrice * quantity
      );
    },
    0
  );

  /* =======================================================
     TOTAL
  ======================================================= */

  const totalAmount = Number(
    orderDetails.totalAmount ??
      subtotal
  );

  /* =======================================================
     SHIPPING
  ======================================================= */

  const shippingAmount =
    resolveShippingAmount({
      shippingMethod:
        orderDetails.shippingMethod,

      subtotal,

      totalAmount,
    });

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <Container className="min-h-[65vh] pb-16 pt-6 font-[Kanit] sm:pt-10">
      <section className="relative mb-8 overflow-hidden border border-[#BFBFBF]/65 bg-white px-5 py-7 sm:px-9 sm:py-10 lg:px-12 lg:py-11">
        <span aria-hidden="true" className="pointer-events-none absolute -right-3 -top-12 text-[160px] font-black leading-none tracking-tight text-mbg-black/[0.035] sm:right-8 sm:text-[210px]">02</span>
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.19em] text-mbg-green">
            <span aria-hidden="true" className="h-px w-7 bg-mbg-green" /> {t.heroEyebrow}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <div role="group" aria-label={language === "fr" ? "Choisir la langue" : "Choose language"} className="flex overflow-hidden rounded-sm border border-mbg-green">
              {(["en", "fr"] as const).map((option) => (
                <Link
                  key={option}
                  href={`/orders/${encodeURIComponent(orderId)}?lang=${option}`}
                  aria-current={option === language ? "page" : undefined}
                  className={`inline-flex min-h-10 min-w-10 items-center justify-center px-3 text-[10px] font-black uppercase transition-colors ${option === language ? "bg-mbg-green text-white" : "bg-white text-mbg-green hover:bg-mbg-green/10"}`}
                >
                  {option.toUpperCase()}
                </Link>
              ))}
            </div>
            <Link
              href={`/orders?lang=${language}`}
              className="inline-flex min-h-10 items-center gap-2 rounded-sm border border-mbg-black/20 bg-white px-4 text-[10px] font-bold uppercase tracking-[0.08em] text-mbg-black transition-colors hover:border-mbg-green hover:text-mbg-green"
            >
              <span aria-hidden="true">←</span> {t.allOrders}
            </Link>
          </div>
        </div>
        <div className="relative mt-7 grid gap-7 md:grid-cols-[minmax(0,1fr)_minmax(200px,0.35fr)] md:items-end lg:gap-12">
          <div>
            <h1 className="text-[clamp(1.85rem,5.1vw,3.7rem)] font-black uppercase leading-[0.98] tracking-[-0.03em] text-mbg-black">
              {t.heroFirst}<span className="mt-1 block text-mbg-green">{t.heroSecond}</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-[#404040] sm:text-base">{t.heroDescription}</p>
            <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.15em] text-mbg-black/55">{t.heroSignature}</p>
          </div>
          <div className="border-l-[3px] border-mbg-green bg-mbg-black p-5 text-white sm:p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/60">{t.orderId}</p>
            <p className="mt-3 break-all text-sm font-black uppercase tracking-[0.07em] text-white sm:text-base">#{orderId}</p>
            <div className="mt-4 border-t border-white/20 pt-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#b0d8b7]">{formatStatus(status, language)}</div>
          </div>
        </div>
      </section>

      {/* ===================================================
          MAIN ORDER CARD
      ==================================================== */}

      <section
        className="
          overflow-hidden
          border
          border-[#BFBFBF]/65
          bg-white
        "
      >
        {/* =================================================
            ORDER HEADER
        ================================================== */}

        <header className="border-b border-mbg-black/10 px-5 py-6 sm:px-7 lg:px-8">
          <div
            className="
              flex
              flex-col
              gap-5
              sm:flex-row
              sm:items-start
              sm:justify-between
            "
          >
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-mbg-black/40">
                {t.orderId}
              </p>

              <p
                className="
                  mt-2
                  break-all
                  text-[11px]
                  font-extrabold
                  uppercase
                  tracking-[0.08em]
                  text-mbg-black
                  sm:text-xs
                "
              >
                #{orderId}
              </p>
            </div>

            <StatusBadge
              status={status}
            />
          </div>
        </header>

        {/* =================================================
            ORDER STATS
        ================================================== */}

        <div
          className="
            grid
            grid-cols-1
            border-y
            border-mbg-black/10
            sm:grid-cols-3
          "
        >
          <OrderStat
            label={t.totalAmount}
            value={formatCurrency(totalAmount, language)}
          />

          <OrderStat
            label={t.shipping}
            value={getShippingLabel(orderDetails.shippingMethod, language)}
            border
          />

          <OrderStat
            label={
              totalQuantity === 1
                ? t.item
                : t.items
            }
            value={String(
              totalQuantity
            )}
            border
          />
        </div>

        {/* =================================================
            ORDER PROGRESS
        ================================================== */}

        <div className="px-5 py-7 sm:px-7 sm:py-8 lg:px-8">
          <div className="mb-5 flex items-center justify-between gap-4">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-mbg-black/40">
              {t.progress}
            </span>

            <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-mbg-green">
              {formatStatus(status, language)}
            </span>
          </div>

          <OrderTimeline
            order={orderDetails}
          />

          <div
            className="
              mt-7
              border-l-2
              border-mbg-green
              bg-mbg-green/[0.06]
              px-4
              py-3
            "
          >
            <p className="text-[11px] font-medium leading-relaxed text-mbg-black/65">
              {getOrderMessage(status, language)}
            </p>
          </div>
        </div>

        {/* =================================================
            PRODUCTS HEADER
        ================================================== */}

        <div className="border-t border-mbg-black/10 px-5 pt-7 sm:px-7 lg:px-8">
          <div
            className="
              flex
              items-end
              justify-between
              gap-4
            "
          >
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-mbg-green">
                {t.pieces}
              </span>

              <h3 className="mt-1 text-base font-extrabold uppercase tracking-tight text-mbg-black">
                {t.itemsInOrder}
              </h3>
            </div>

            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-mbg-black/40">
              {totalQuantity}{" "}
              {totalQuantity === 1
                ? t.item
                : t.items}
            </span>
          </div>
        </div>

        {/* =================================================
            PRODUCTS
        ================================================== */}

        <div className="px-5 sm:px-7 lg:px-8">
          <div className="mt-5 divide-y divide-mbg-black/10">
            {products.map(
              (
                orderItem: OrderLine
              ) => {
                const unitPrice =
                  Number(
                    orderItem.unitPrice ??
                      orderItem.product
                        ?.price ??
                      0
                  );

                const quantity =
                  Number(
                    orderItem.quantity ??
                      1
                  );

                const lineTotal =
                  unitPrice *
                  quantity;

                return (
                  <OrderProduct
                    key={
                      orderItem._id ??
                      `${
                        orderItem.product
                          ?._id ??
                        "item"
                      }-${
                        orderItem.size ??
                        ""
                      }-${
                        orderItem.color ??
                        ""
                      }`
                    }
                    orderItem={
                      orderItem
                    }
                    unitPrice={
                      unitPrice
                    }
                    quantity={
                      quantity
                    }
                    lineTotal={
                      lineTotal
                    }
                    language={language}
                  />
                );
              }
            )}
          </div>
        </div>

        {/* =================================================
            PRICE SUMMARY
        ================================================== */}

        <div
          className="
            mt-4
            border-t
            border-mbg-black/10
            bg-[#BFBFBF]/10
            px-5
            py-7
            sm:px-7
            sm:py-8
            lg:px-8
          "
        >
          <div className="ml-auto w-full sm:max-w-sm">
            <div className="flex flex-col gap-4">
              <PriceRow
                label={t.subtotal}
                value={subtotal}
                language={language}
              />

              <PriceRow
                label={t.shipping}
                value={shippingAmount}
                language={language}
              />
            </div>

            <div className="my-6 h-px w-full bg-mbg-black/15" />

            <div className="flex items-end justify-between gap-5">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.23em] text-mbg-black/40">
                  {t.total}
                </p>

                <p className="mt-1 text-[10px] font-medium text-mbg-black/45">
                  {t.includingDelivery}
                </p>
              </div>

              <span className="text-xl font-black tracking-tight text-mbg-green sm:text-2xl">
                {formatCurrency(totalAmount, language)}
              </span>
            </div>
          </div>
        </div>
      </section>

      <aside className="mt-7 border-l-[3px] border-mbg-green bg-mbg-black px-5 py-7 text-white sm:px-9 sm:py-9">
        <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <div className="max-w-xl">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/70">GRIND UNTIL ACHIEVE</p>
            <h2 className="mt-2 text-xl font-black uppercase leading-tight sm:text-2xl">{t.journeyNote}</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/70">{t.journeyText}</p>
          </div>
          <Link href={`/grind-until-achieve?lang=${language}`} className="inline-flex min-h-11 items-center justify-center rounded-sm border border-white/50 px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-white transition-colors hover:border-mbg-green hover:bg-mbg-green">
            {t.discover} <span aria-hidden="true" className="ml-2">↗</span>
          </Link>
        </div>
      </aside>

      {/* ===================================================
          BOTTOM NAVIGATION
      ==================================================== */}

      <div className="mt-6">
        <Link
          href={`/orders?lang=${language}`}
          className="
            group
            inline-flex
            items-center
            gap-3
            text-[10px]
            font-extrabold
            uppercase
            tracking-[0.18em]
            text-mbg-black
            transition-colors
            duration-200
            hover:text-mbg-green
          "
        >
          <span
            className="
              transition-transform
              duration-300
              group-hover:-translate-x-1
            "
          >
            ←
          </span>

          {t.allOrders}
        </Link>
      </div>
    </Container>
  );
}

/* =========================================================
   ORDER PRODUCT
========================================================= */

function OrderProduct({
  orderItem,
  unitPrice,
  quantity,
  lineTotal,
  language,
}: {
  orderItem: OrderLine;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  language: Language;
}) {
  const t = copy[language];
  const image =
    orderItem.product?.media?.[0] ||
    FALLBACK_IMAGE;

  const title =
    orderItem.product?.title ||
    t.product;

  return (
    <div
      className="
        flex
        gap-4
        py-6
        sm:gap-6
        sm:py-7
      "
    >
      {/* IMAGE */}

      <div
        className="
          flex
          h-[92px]
          w-[92px]
          shrink-0
          items-center
          justify-center
          overflow-hidden
          bg-[#BFBFBF]/10
          sm:h-[115px]
          sm:w-[115px]
        "
      >
        <Image
          src={image}
          alt={title}
          width={115}
          height={115}
          className="h-full w-full object-contain p-1"
        />
      </div>

      {/* DETAILS */}

      <div
        className="
          flex
          min-w-0
          flex-1
          flex-col
          justify-between
          gap-4
        "
      >
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-mbg-black/35">
            {t.product}
          </p>

          <h4
            className="
              mt-1
              line-clamp-2
              text-[11px]
              font-extrabold
              uppercase
              tracking-[0.08em]
              text-mbg-black
              sm:text-xs
            "
          >
            {title}
          </h4>

          {/* ATTRIBUTES */}

          <div className="mt-3 flex flex-wrap gap-2">
            {orderItem.color && (
              <ProductAttribute
                label={t.color}
                value={
                  orderItem.color
                }
              />
            )}

            {orderItem.size && (
              <ProductAttribute
                label={t.size}
                value={
                  orderItem.size
                }
              />
            )}

            <ProductAttribute
              label={t.quantity}
              value={String(
                quantity
              )}
            />
          </div>
        </div>

        {/* PRICE */}

        <div
          className="
            flex
            flex-wrap
            items-end
            justify-between
            gap-3
          "
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-mbg-black/35">
              {t.unitPrice}
            </p>

            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.1em] text-mbg-black/65">
              {formatCurrency(unitPrice, language)}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-mbg-black/35">
              {t.lineTotal}
            </p>

            <p className="mt-1 text-xs font-extrabold uppercase tracking-[0.08em] text-mbg-green">
              {formatCurrency(lineTotal, language)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PRODUCT ATTRIBUTE
========================================================= */

function ProductAttribute({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <span
      className="
        inline-flex
        items-center
        gap-1.5
        border
        border-mbg-black/10
        bg-[#BFBFBF]/10
        px-2
        py-1.5
        text-[10px]
        font-bold
        uppercase
        tracking-[0.13em]
        text-mbg-black/45
      "
    >
      {label}

      <strong className="font-extrabold text-mbg-black">
        {value}
      </strong>
    </span>
  );
}

/* =========================================================
   ORDER STAT
========================================================= */

function OrderStat({
  label,
  value,
  border = false,
}: {
  label: string;
  value: string;
  border?: boolean;
}) {
  return (
    <div
      className={`
        flex
        items-center
        justify-between
        gap-5
        px-5
        py-4
        sm:block
        sm:px-6
        sm:py-5
        ${
          border
            ? "border-t border-mbg-black/10 sm:border-l sm:border-t-0"
            : ""
        }
      `}
    >
      <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-mbg-black/40">
        {label}
      </p>

      <p className="mt-0 text-right text-[10px] font-extrabold uppercase tracking-[0.09em] text-mbg-green sm:mt-2 sm:text-left">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   PRICE ROW
========================================================= */

function PriceRow({
  label,
  value,
  language,
}: {
  label: string;
  value: number;
  language: Language;
}) {
  return (
    <div className="flex items-center justify-between gap-5">
      <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-mbg-black/55">
        {label}
      </span>

      <span className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-mbg-black">
        {formatCurrency(value, language)}
      </span>
    </div>
  );
}

/* =========================================================
   ORDER STATUS MESSAGE
========================================================= */

function getOrderMessage(status: string, language: Language): string {
  const t = copy[language];
  switch (status) {
    case "PROCESSING":
    case "CONFIRMED":
    case "PACKED":
      return t.preparingMsg;
    case "SHIPPED":
    case "OUT_FOR_DELIVERY":
      return t.shippedMsg;
    case "DELIVERED": return t.deliveredMsg;
    case "COMPLETED": return t.completedMsg;
    case "CANCELLED":
    case "CANCELED": return t.cancelledMsg;
    case "REFUNDED": return t.refundedMsg;
    case "RETURNED": return t.returnedMsg;
    default: return t.receivedMsg;
  }
}

function formatStatus(status: string, language: Language): string {
  const t = copy[language];
  switch (status) {
    case "PENDING": return t.pending;
    case "PROCESSING":
    case "CONFIRMED":
    case "PACKED": return t.processing;
    case "SHIPPED":
    case "OUT_FOR_DELIVERY": return t.shipped;
    case "DELIVERED": return t.delivered;
    case "COMPLETED": return t.completed;
    case "CANCELLED":
    case "CANCELED": return t.cancelled;
    case "REFUNDED": return t.refunded;
    case "RETURNED": return t.returned;
    default:
      return status.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
}

function getShippingLabel(shippingMethod: string | undefined, language: Language): string {
  const method = String(shippingMethod || "").trim().toUpperCase();
  const t = copy[language];
  if (method.includes("EXPRESS")) return t.express;
  if (method.includes("FREE")) return t.free;
  if (method.includes("STANDARD") || !method) return t.standard;
  return shippingMethod || t.standard;
}

/* =========================================================
   SHIPPING AMOUNT
========================================================= */

function resolveShippingAmount({
  shippingMethod,
  subtotal,
  totalAmount,
}: {
  shippingMethod?: string;
  subtotal: number;
  totalAmount: number;
}): number {
  const method = String(
    shippingMethod || ""
  )
    .trim()
    .toUpperCase();

  if (
    method === "FREE" ||
    method === "FREE_DELIVERY"
  ) {
    return 0;
  }

  return Math.max(
    totalAmount - subtotal,
    0
  );
}

/* =========================================================
   MONEY FORMAT
========================================================= */

function formatCurrency(value: unknown, language: Language): string {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) return "—";
  return new Intl.NumberFormat(language === "fr" ? "fr-FR" : "en-GB", {
    style: "currency",
    currency: "EUR",
  }).format(numeric);
}
