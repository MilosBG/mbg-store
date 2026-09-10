"use client";

import { ChevronDown, ExternalLink } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { StoreLanguage } from "@/lib/store-language";
import type { CommerceInfo, Product } from "@/lib/types";

type ProductAccordionProps = {
  product: Product;
  lang?: StoreLanguage;
};

type LocalizedProduct = Product & {
  commerceInfoFr?: Partial<CommerceInfo>;
};

type AccordionItem = {
  id: string;
  title: string;
  visible: boolean;
  content: ReactNode;
};

const COPY = {
  en: {
    ariaLabel: "Product information",
    productDetails: "PRODUCT DETAILS",
    productReference: "Product reference",
    details: "Details",
    materialComposition: "MATERIAL & COMPOSITION",
    composition: "Composition",
    fabric: "Fabric",
    fabricWeight: "Fabric weight",
    characteristics: "Characteristics",
    fitSize: "FIT & SIZE",
    fit: "Fit",
    sizeAdvice: "Size advice",
    care: "CARE",
    careInstructions: "Care instructions",
    originCraftsmanship: "ORIGIN & CRAFTSMANSHIP",
    countryManufacture: "Country of manufacture",
    fabricOrigin: "Fabric origin",
    craftsmanship: "Craftsmanship",
    certifications: "CERTIFICATIONS",
    certification: "Certification",
    certificationScope: "Certification scope",
    fabricScope: "Fabric",
    finishedGarment: "Finished garment",
    certificateNumber: "Certificate number",
    testingInstitute: "Testing institute",
    verifyCertificate: "Verify certificate",
    shippingReturns: "SHIPPING & RETURNS",
    processingTime: "Processing time",
    estimatedDelivery: "Estimated delivery",
    withdrawal: "Right of withdrawal",
    returnCosts: "Return shipping costs",
    days: "days",
    productInformation: "PRODUCT INFORMATION",
    manufacturer: "Manufacturer",
    address: "Address",
    contact: "Contact",
    safety: "Safety information",
  },
  fr: {
    ariaLabel: "Informations produit",
    productDetails: "DÉTAILS DU PRODUIT",
    productReference: "Référence produit",
    details: "Détails",
    materialComposition: "MATIÈRE & COMPOSITION",
    composition: "Composition",
    fabric: "Tissu",
    fabricWeight: "Grammage",
    characteristics: "Caractéristiques",
    fitSize: "COUPE & TAILLE",
    fit: "Coupe",
    sizeAdvice: "Conseil de taille",
    care: "ENTRETIEN",
    careInstructions: "Conseils d'entretien",
    originCraftsmanship: "ORIGINE & FABRICATION",
    countryManufacture: "Pays de fabrication",
    fabricOrigin: "Origine du tissu",
    craftsmanship: "Fabrication artisanale",
    certifications: "CERTIFICATIONS",
    certification: "Certification",
    certificationScope: "Périmètre de certification",
    fabricScope: "Tissu",
    finishedGarment: "Vêtement fini",
    certificateNumber: "Numéro du certificat",
    testingInstitute: "Organisme de contrôle",
    verifyCertificate: "Vérifier le certificat",
    shippingReturns: "LIVRAISON & RETOURS",
    processingTime: "Délai de traitement",
    estimatedDelivery: "Livraison estimée",
    withdrawal: "Délai de rétractation",
    returnCosts: "Frais de retour",
    days: "jours",
    productInformation: "INFORMATIONS PRODUIT",
    manufacturer: "Fabricant",
    address: "Adresse",
    contact: "Contact",
    safety: "Informations de sécurité",
  },
} as const;

const hasText = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const toPositiveNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

const getCommerceInfo = (
  product: Product,
  lang: StoreLanguage,
): CommerceInfo => {
  const localizedProduct = product as LocalizedProduct;
  const baseInfo = product.commerceInfo ?? {};

  if (lang !== "fr") return baseInfo;

  return {
    ...baseInfo,
    ...(localizedProduct.commerceInfoFr ?? {}),
  };
};

const MultilineText = ({ value }: { value?: string }) => {
  if (!hasText(value)) return null;

  const lines = value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 1) {
    return <p>{lines[0]}</p>;
  }

  return (
    <ul className="space-y-1.5">
      {lines.map((line, index) => (
        <li key={`${line}-${index}`} className="flex gap-2">
          <span
            aria-hidden="true"
            className="bg-mbg-green mt-[0.58em] h-1 w-1 shrink-0 rounded-full"
          />
          <span>{line}</span>
        </li>
      ))}
    </ul>
  );
};

const Detail = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <div>
    <p className="text-mbg-black mb-1 text-[9px] font-extrabold tracking-[0.06em] uppercase">
      {label}
    </p>
    <div className="text-mbg-black/70 text-[10px] leading-[1.65] sm:text-[11px]">
      {children}
    </div>
  </div>
);

const ProductAccordion = ({
  product,
  lang = "en",
}: ProductAccordionProps) => {
  const [openId, setOpenId] = useState<string | null>(null);
  const t = COPY[lang];
  const info = getCommerceInfo(product, lang);

  const fabricWeight = toPositiveNumber(info.fabricWeight);
  const withdrawalDays = toPositiveNumber(info.withdrawalDays);

  const productDetailsVisible =
    hasText(info.productReference) || hasText(info.productDetails);

  const materialVisible =
    hasText(info.materialComposition) ||
    hasText(info.fabricName) ||
    fabricWeight > 0 ||
    hasText(info.fabricDescription);

  const fitVisible = hasText(info.fit) || hasText(info.fitNotes);
  const careVisible = hasText(info.careInstructions);

  const originVisible =
    hasText(info.countryOfManufacture) ||
    hasText(info.fabricOrigin) ||
    hasText(info.craftsmanship);

  const certificationVisible =
    hasText(info.certificationName) ||
    hasText(info.certificateNumber) ||
    hasText(info.certificationInstitute) ||
    hasText(info.certificateUrl);

  const shippingVisible =
    hasText(info.shippingProcessingTime) ||
    hasText(info.deliveryEstimate) ||
    withdrawalDays > 0 ||
    hasText(info.returnCostBearer);

  const manufacturerVisible =
    hasText(info.manufacturerName) ||
    hasText(info.manufacturerAddress) ||
    hasText(info.manufacturerEmail) ||
    hasText(info.safetyWarnings);

  const items: AccordionItem[] = [
    {
      id: "product-details",
      title: t.productDetails,
      visible: productDetailsVisible,
      content: (
        <div className="space-y-4">
          {hasText(info.productReference) && (
            <Detail label={t.productReference}>
              <p>{info.productReference}</p>
            </Detail>
          )}

          {hasText(info.productDetails) && (
            <Detail label={t.details}>
              <MultilineText value={info.productDetails} />
            </Detail>
          )}
        </div>
      ),
    },
    {
      id: "material-composition",
      title: t.materialComposition,
      visible: materialVisible,
      content: (
        <div className="space-y-4">
          {hasText(info.materialComposition) && (
            <Detail label={t.composition}>
              <p>{info.materialComposition}</p>
            </Detail>
          )}

          {hasText(info.fabricName) && (
            <Detail label={t.fabric}>
              <p>{info.fabricName}</p>
            </Detail>
          )}

          {fabricWeight > 0 && (
            <Detail label={t.fabricWeight}>
              <p>{fabricWeight} GSM</p>
            </Detail>
          )}

          {hasText(info.fabricDescription) && (
            <Detail label={t.characteristics}>
              <MultilineText value={info.fabricDescription} />
            </Detail>
          )}
        </div>
      ),
    },
    {
      id: "fit-size",
      title: t.fitSize,
      visible: fitVisible,
      content: (
        <div className="space-y-4">
          {hasText(info.fit) && (
            <Detail label={t.fit}>
              <p>{info.fit}</p>
            </Detail>
          )}

          {hasText(info.fitNotes) && (
            <Detail label={t.sizeAdvice}>
              <MultilineText value={info.fitNotes} />
            </Detail>
          )}
        </div>
      ),
    },
    {
      id: "care",
      title: t.care,
      visible: careVisible,
      content: (
        <Detail label={t.careInstructions}>
          <MultilineText value={info.careInstructions} />
        </Detail>
      ),
    },
    {
      id: "origin-craftsmanship",
      title: t.originCraftsmanship,
      visible: originVisible,
      content: (
        <div className="space-y-4">
          {hasText(info.countryOfManufacture) && (
            <Detail label={t.countryManufacture}>
              <p>{info.countryOfManufacture}</p>
            </Detail>
          )}

          {hasText(info.fabricOrigin) && (
            <Detail label={t.fabricOrigin}>
              <p>{info.fabricOrigin}</p>
            </Detail>
          )}

          {hasText(info.craftsmanship) && (
            <Detail label={t.craftsmanship}>
              <MultilineText value={info.craftsmanship} />
            </Detail>
          )}
        </div>
      ),
    },
    {
      id: "certifications",
      title: t.certifications,
      visible: certificationVisible,
      content: (
        <div className="space-y-4">
          {hasText(info.certificationName) && (
            <Detail label={t.certification}>
              <p>{info.certificationName}</p>
            </Detail>
          )}

          {hasText(info.certificationScope) && (
            <Detail label={t.certificationScope}>
              <p>
                {info.certificationScope === "FABRIC"
                  ? t.fabricScope
                  : info.certificationScope === "FINISHED_GARMENT"
                    ? t.finishedGarment
                    : info.certificationScope}
              </p>
            </Detail>
          )}

          {hasText(info.certificateNumber) && (
            <Detail label={t.certificateNumber}>
              <p>{info.certificateNumber}</p>
            </Detail>
          )}

          {hasText(info.certificationInstitute) && (
            <Detail label={t.testingInstitute}>
              <p>{info.certificationInstitute}</p>
            </Detail>
          )}

          {hasText(info.certificateUrl) && (
            <a
              href={info.certificateUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="text-mbg-green inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.04em] uppercase underline underline-offset-4"
            >
              {t.verifyCertificate}
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      ),
    },
    {
      id: "shipping-returns",
      title: t.shippingReturns,
      visible: shippingVisible,
      content: (
        <div className="space-y-4">
          {hasText(info.shippingProcessingTime) && (
            <Detail label={t.processingTime}>
              <p>{info.shippingProcessingTime}</p>
            </Detail>
          )}

          {hasText(info.deliveryEstimate) && (
            <Detail label={t.estimatedDelivery}>
              <p>{info.deliveryEstimate}</p>
            </Detail>
          )}

          {withdrawalDays > 0 && (
            <Detail label={t.withdrawal}>
              <p>
                {withdrawalDays} {t.days}
              </p>
            </Detail>
          )}

          {hasText(info.returnCostBearer) && (
            <Detail label={t.returnCosts}>
              <p>{info.returnCostBearer}</p>
            </Detail>
          )}
        </div>
      ),
    },
    {
      id: "product-information",
      title: t.productInformation,
      visible: manufacturerVisible,
      content: (
        <div className="space-y-4">
          {hasText(info.manufacturerName) && (
            <Detail label={t.manufacturer}>
              <p>{info.manufacturerName}</p>
            </Detail>
          )}

          {hasText(info.manufacturerAddress) && (
            <Detail label={t.address}>
              <MultilineText value={info.manufacturerAddress} />
            </Detail>
          )}

          {hasText(info.manufacturerEmail) && (
            <Detail label={t.contact}>
              <a
                href={`mailto:${info.manufacturerEmail}`}
                className="text-mbg-green underline underline-offset-4"
              >
                {info.manufacturerEmail}
              </a>
            </Detail>
          )}

          {hasText(info.safetyWarnings) && (
            <Detail label={t.safety}>
              <MultilineText value={info.safetyWarnings} />
            </Detail>
          )}
        </div>
      ),
    },
  ];

  const visibleItems = items.filter((item) => item.visible);

  if (visibleItems.length === 0) return null;

  return (
    <section
      aria-label={t.ariaLabel}
      className="bg-mbg-black/3 mt-3 w-full px-4 sm:px-5"
    >
      <div className="border-mbg-green/55 border-t">
        {visibleItems.map((item) => {
          const isOpen = openId === item.id;
          const contentId = `${item.id}-content`;

          return (
            <div key={item.id} className="border-mbg-white/55 border-b">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={contentId}
                onClick={() =>
                  setOpenId((current) =>
                    current === item.id ? null : item.id,
                  )
                }
                className="group flex min-h-12 w-full items-center justify-between gap-4 py-3 text-left"
              >
                <span className="text-mbg-black text-[10px] font-extrabold tracking-[0.035em] uppercase sm:text-[11px]">
                  {item.title}
                </span>

                <span className="border-mbg-black/15 group-hover:border-mbg-white flex h-6 w-6 shrink-0 items-center justify-center border transition-colors duration-300">
                  <ChevronDown
                    aria-hidden="true"
                    className={`h-3.5 w-3.5 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                      isOpen ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </span>
              </button>

              <div
                id={contentId}
                className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                  isOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div
                    className={`origin-top pb-5 pt-1 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                      isOpen
                        ? "translate-y-0 scale-y-100"
                        : "-translate-y-1 scale-y-[0.98]"
                    }`}
                  >
                    {item.content}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ProductAccordion;
