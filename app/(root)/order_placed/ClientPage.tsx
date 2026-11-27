"use client";

import Container from "@/components/mbg-components/Container";
import Button from "@/components/mbg-components/Button";

import { IoBasketball } from "react-icons/io5";
import {
  ORDER_PLACED_SESSION_KEY,
  type OrderPlacedSnapshot,
} from "@/lib/orderPlaced";

import {
  ArrowRight,
  Check,
  MapPin,
  PackageCheck,
  ReceiptText,
} from "lucide-react";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  type CSSProperties,
  useEffect,
  useMemo,
  useState,
} from "react";

/* =========================================================
   HELPERS
========================================================= */

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
  }).format(value);

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

/* =========================================================
   MANTRA
========================================================= */

const Mantra = () => {
  return (
    <div className="mt-7 flex flex-wrap items-center justify-center gap-x-2 text-[11px] font-bold uppercase tracking-[0.34em] text-mbg-black md:text-sm">
      <span>
        GR
        <span className="text-mbg-green">I</span>
        ND
      </span>

      <span className="text-mbg-black/30">—</span>

      <span>UNTIL</span>

      <span className="text-mbg-black/30">—</span>

      <span>
        ACHIE
        <span className="text-mbg-green">V</span>
        E
      </span>
    </div>
  );
};

/* =========================================================
   FLOWER ICON
========================================================= */

/* =========================================================
   BASKETBALL ICON
========================================================= */


/* =========================================================
   CONFETTI DATA

   Deterministic values -> no hydration randomness.
========================================================= */

const CONFETTI = Array.from({ length: 42 }, (_, index) => {
  const isFlower = index % 2 === 0;

  return {
    id: index,

    type: isFlower
      ? ("flower" as const)
      : ("basketball" as const),

    left: `${(index * 29 + 7) % 100}%`,

    delay: `${((index * 13) % 25) / 10}s`,

    duration: `${4.2 + ((index * 7) % 30) / 10}s`,

    size: isFlower
      ? 18 + ((index * 9) % 20)
      : 16 + ((index * 7) % 18),

    opacity:
      0.45 + ((index * 3) % 5) * 0.1,
  };
});

/* =========================================================
   CONFETTI LAYER
========================================================= */

const OrderCelebration = () => {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-20 overflow-hidden"
      >
        {CONFETTI.map((piece) => {
          const style: CSSProperties = {
            left: piece.left,
            fontSize: piece.size,
            opacity: piece.opacity,
            animationDelay: piece.delay,
            animationDuration: piece.duration,
          };

          return (
            <div
              key={piece.id}
              className={`mbg-order-confetti absolute -top-12 flex items-center justify-center ${
                piece.type === "flower"
                  ? "text-mbg-green"
                  : "text-mbg-black"
              }`}
              style={style}
            >
              {piece.type === "flower" ? (
                <span className="leading-none">✿</span>
              ) : (
                <IoBasketball />
              )}
            </div>
          );
        })}
      </div>

      <style jsx global>{`
        @keyframes mbgOrderCelebration {
          0% {
            transform: translate3d(0, -80px, 0)
              rotate(0deg)
              scale(0.5);
            opacity: 0;
          }

          8% {
            opacity: 1;
          }

          30% {
            transform: translate3d(
                20px,
                30vh,
                0
              )
              rotate(160deg)
              scale(1);
          }

          60% {
            transform: translate3d(
                -20px,
                65vh,
                0
              )
              rotate(380deg)
              scale(0.9);
          }

          100% {
            transform: translate3d(
                25px,
                110vh,
                0
              )
              rotate(720deg)
              scale(0.65);
            opacity: 0;
          }
        }

        .mbg-order-confetti {
          animation-name: mbgOrderCelebration;
          animation-timing-function: cubic-bezier(
            0.15,
            0.7,
            0.3,
            1
          );
          animation-fill-mode: both;
          animation-iteration-count: 1;
          will-change: transform, opacity;
        }

        @media (prefers-reduced-motion: reduce) {
          .mbg-order-confetti {
            display: none;
          }
        }
      `}</style>
    </>
  );
};

/* =========================================================
   CLIENT PAGE
========================================================= */

export default function ClientPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [order, setOrder] =
    useState<OrderPlacedSnapshot | null>(
      null,
    );

  const [loaded, setLoaded] =
    useState(false);

  const queryReference =
    searchParams?.get("order") ?? null;

  /* ---------------------------------------------------------
     Restore order confirmation
  --------------------------------------------------------- */

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const stored =
        window.sessionStorage.getItem(
          ORDER_PLACED_SESSION_KEY,
        );

      if (!stored) {
        setLoaded(true);
        return;
      }

      const parsed = JSON.parse(
        stored,
      ) as OrderPlacedSnapshot;

      setOrder(parsed);
    } catch (error) {
      console.warn(
        "[order_placed] Unable to restore order summary",
        error,
      );
    } finally {
      setLoaded(true);
    }
  }, []);

  const orderReference =
    order?.orderReference ??
    queryReference;

  const itemCount = useMemo(() => {
    if (!order) {
      return 0;
    }

    return order.items.reduce(
      (sum, item) =>
        sum + item.quantity,
      0,
    );
  }, [order]);

  /* =========================================================
     LOADING
  ========================================================= */

  if (!loaded) {
    return (
      <main className="min-h-[70vh]">
        <Container className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-mbg-black/10 border-t-mbg-green" />

            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-mbg-black/50">
              Preparing your order
            </p>
          </div>
        </Container>
      </main>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <main className="relative isolate min-h-screen overflow-x-hidden bg-white">
      <OrderCelebration />

      {/* subtle background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[450px] bg-gradient-to-b from-mbg-green/[0.07] to-transparent"
      />

      <Container className="relative z-10 min-w-0 px-4 py-8 sm:px-6 sm:py-12 md:py-16">
        {/* =====================================================
            THANK YOU
        ====================================================== */}

        <section className="mx-auto w-full max-w-5xl">
          <div className="text-center">
            <div className="mx-auto mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-mbg-green text-mbg-white shadow-sm">
              <Check size={19} />
            </div>

            <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.34em] text-mbg-green">
              Order confirmed
            </p>

            <h1 className="text-[clamp(2.4rem,10vw,6rem)] font-black uppercase leading-[0.95] tracking-[-0.05em] text-black">
              Thank you !
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-[11px] font-medium uppercase tracking-[0.16em] text-mbg-black/60 md:text-xs">
              Your order is placed
              successfully.
            </p>

            <Mantra />

            {orderReference && (
              <div className="mt-7 inline-flex items-center gap-2 border border-mbg-black/10 bg-mbg-white/80 px-4 py-2 backdrop-blur-sm">
                <ReceiptText
                  size={13}
                  className="text-mbg-green"
                />

                <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-mbg-black/50">
                  Order
                </span>

                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-mbg-black">
                  {orderReference}
                </span>
              </div>
            )}

            {order?.createdAt && (
              <p className="mt-3 text-[9px] font-medium uppercase tracking-[0.15em] text-mbg-black/35">
                {formatDate(
                  order.createdAt,
                )}
              </p>
            )}
          </div>

          {/* ===================================================
              ORDER NOT LOCALLY AVAILABLE
          ==================================================== */}

          {!order && (
            <div className="mx-auto mt-9 max-w-2xl border border-[#BFBFBF]/60 bg-white p-4 text-center sm:p-7 md:mt-12 md:p-10">
              <PackageCheck
                size={26}
                className="mx-auto text-mbg-green"
              />

              <p className="mt-4 text-sm font-bold uppercase tracking-wide text-mbg-black">
                Your order has been
                recorded.
              </p>

              <p className="mx-auto mt-2 max-w-md text-[10px] uppercase leading-5 tracking-wide text-mbg-black/50">
                The local order summary
                is no longer available
                in this browser session.
                You can review your
                orders from your account.
              </p>

              <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
                <Button
                  mbg="prime"
                  onClick={() =>
                    router.push("/orders")
                  }
                >
                  View my orders
                </Button>

                <button
                  type="button"
                  onClick={() =>
                    router.push("/")
                  }
                  className="min-h-11 px-5 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-mbg-black hover:text-mbg-green"
                >
                  Keep shooting
                </button>
              </div>
            </div>
          )}

          {/* ===================================================
              ORDER SUMMARY
          ==================================================== */}

          {order && (
            <div className="mt-9 grid min-w-0 gap-4 lg:mt-12 lg:grid-cols-[minmax(0,1.45fr)_minmax(260px,0.75fr)] lg:gap-5">
              {/* ===============================================
                  PRODUCTS
              ================================================ */}

              <section className="min-w-0 rounded-sm border border-[#BFBFBF]/60 bg-white shadow-[0_6px_24px_rgba(0,0,0,0.035)]">
                <div className="flex items-center justify-between border-b border-mbg-black/10 px-5 py-4 md:px-6">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-mbg-green">
                      Order summary
                    </p>

                    <h2 className="mt-1 text-sm font-bold uppercase tracking-wide text-mbg-black">
                      Your order
                    </h2>
                  </div>

                  <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-mbg-black/40">
                    {itemCount}{" "}
                    {itemCount === 1
                      ? "item"
                      : "items"}
                  </span>
                </div>

                <div>
                  {order.items.map(
                    (item, index) => (
                      <article
                        key={`${item.productId}-${item.color ?? ""}-${item.size ?? ""}-${index}`}
                        className="flex min-w-0 flex-wrap gap-3 border-b border-mbg-black/10 p-3 last:border-b-0 sm:flex-nowrap sm:gap-4 sm:p-5"
                      >
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-[#BFBFBF]/10 sm:h-24 sm:w-24">
                          {item.image ? (
                            <Image
                              src={
                                item.image
                              }
                              alt={
                                item.title
                              }
                              fill
                              sizes="96px"
                              className="object-contain p-1"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <PackageCheck
                                size={22}
                                className="text-mbg-black/20"
                              />
                            </div>
                          )}
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 py-1">
                          <div>
                            <p className="truncate text-[11px] font-bold uppercase tracking-[0.12em] text-mbg-black">
                              {
                                item.title
                              }
                            </p>

                            {(item.color ||
                              item.size) && (
                              <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.12em] text-mbg-black/45">
                                {item.color
                                  ? item.color
                                  : ""}

                                {item.color &&
                                item.size
                                  ? " / "
                                  : ""}

                                {item.size
                                  ? item.size
                                  : ""}
                              </p>
                            )}

                            <p className="mt-2 text-[9px] uppercase tracking-[0.12em] text-mbg-black/40">
                              Qty{" "}
                              <span className="font-bold text-mbg-black">
                                {
                                  item.quantity
                                }
                              </span>

                              <span className="mx-2">
                                ×
                              </span>

                              {formatPrice(
                                item.unitPrice,
                              )}
                            </p>
                          </div>

                          <p className="mt-3 text-xs font-bold uppercase tracking-wide text-mbg-green">
                            {formatPrice(
                              item.lineTotal,
                            )}
                          </p>
                        </div>
                      </article>
                    ),
                  )}
                </div>
              </section>

              {/* ===============================================
                  RIGHT SIDE
              ================================================ */}

              <aside className="min-w-0 flex flex-col gap-4 sm:gap-5">
                {/* Delivery */}

                <section className="min-w-0 rounded-sm border border-[#BFBFBF]/60 bg-white p-4 sm:p-5">
                  <div className="mb-5 flex items-center gap-2">
                    <MapPin
                      size={15}
                      className="text-mbg-green"
                    />

                    <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-mbg-black">
                      Delivery
                    </h2>
                  </div>

                  <div className="space-y-1 text-[10px] uppercase leading-5 tracking-wide text-mbg-black/60">
                    <p className="font-bold text-mbg-black">
                      {
                        order
                          .shippingAddress
                          .firstName
                      }{" "}
                      {
                        order
                          .shippingAddress
                          .lastName
                      }
                    </p>

                    <p>
                      {
                        order
                          .shippingAddress
                          .address
                      }
                    </p>

                    <p>
                      {
                        order
                          .shippingAddress
                          .postalCode
                      }{" "}
                      {
                        order
                          .shippingAddress
                          .city
                      }
                    </p>

                    <p>
                      {
                        order
                          .shippingAddress
                          .country
                      }
                    </p>

                    <div className="my-3 h-px bg-mbg-black/10" />

                    <p>
                      {
                        order.contact
                          .email
                      }
                    </p>

                    {order.contact
                      .phone && (
                      <p>
                        {
                          order
                            .contact
                            .phone
                        }
                      </p>
                    )}
                  </div>
                </section>

                {/* Totals */}

                <section className="min-w-0 rounded-sm border border-[#BFBFBF]/60 bg-white p-4 sm:p-5">
                  <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.18em] text-mbg-black">
                    Summary
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-mbg-black/45">
                        Subtotal
                      </span>

                      <span className="text-[10px] font-bold text-mbg-black">
                        {formatPrice(
                          order.subtotal,
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-mbg-black/45">
                        Shipping
                      </span>

                      <div className="text-right">
                        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-mbg-black">
                          {
                            order.shippingOption
                          }
                        </p>

                        <p className="text-[9px] text-mbg-green">
                          {order.shippingFee ===
                          0
                            ? "FREE"
                            : formatPrice(
                                order.shippingFee,
                              )}
                        </p>
                      </div>
                    </div>

                    {Boolean(order.discountAmount) && <div className="flex items-center justify-between text-[10px] font-bold text-mbg-green"><span>PROMOTION {order.promoCode ? `(${order.promoCode})` : ""}</span><span>− {formatPrice(order.discountAmount ?? 0)}</span></div>}
                    <div className="my-4 h-px bg-mbg-green" />

                    <div className="flex items-end justify-between">
                      <span className="text-xs font-bold uppercase tracking-[0.12em] text-mbg-black">
                        Total
                      </span>

                      <span className="text-lg font-bold text-mbg-green">
                        {formatPrice(
                          order.total,
                        )}
                      </span>
                    </div>
                  </div>
                </section>
              </aside>
            </div>
          )}

          {/* ===================================================
              NEXT STEP
          ==================================================== */}

          {order && (
            <section className="mt-5 border-y border-mbg-black/10 py-6">
              <div className="flex flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">
                <div className="max-w-xl">
                  <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-mbg-green">
                    What happens next?
                  </p>

                  <p className="mt-2 text-[10px] uppercase leading-5 tracking-wide text-mbg-black/55">
                    Your order has been
                    registered. You can
                    follow its progress
                    from your order
                    history.
                  </p>
                </div>

                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/orders",
                      )
                    }
                    className="group flex min-h-11 w-full items-center justify-center gap-2 rounded-sm border border-mbg-black px-5 py-2 text-[10px] font-bold uppercase tracking-[0.13em] text-mbg-black transition hover:bg-mbg-black hover:text-mbg-white"
                  >
                    My orders

                    <ArrowRight
                      size={12}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </button>

                  <Button
                    mbg="prime"
                    onClick={() =>
                      router.push("/")
                    }
                  >
                    Keep shooting
                  </Button>
                </div>
              </div>
            </section>
          )}
        </section>
      </Container>
    </main>
  );
}