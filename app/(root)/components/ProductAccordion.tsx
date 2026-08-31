"use client";

import { ChevronDown, ExternalLink } from "lucide-react";
import { useState, type ReactNode } from "react";

type CommerceInfo = {
  productReference?: string;
  productDetails?: string;
  materialComposition?: string;
  fabricName?: string;
  fabricWeight?: number | string;
  fabricDescription?: string;
  fit?: string;
  fitNotes?: string;
  careInstructions?: string;
  countryOfManufacture?: string;
  fabricOrigin?: string;
  craftsmanship?: string;
  certificationName?: string;
  certificationScope?: string;
  certificateNumber?: string;
  certificationInstitute?: string;
  certificateUrl?: string;
  shippingProcessingTime?: string;
  deliveryEstimate?: string;
  withdrawalDays?: number | string;
  returnCostBearer?: string;
  manufacturerName?: string;
  manufacturerAddress?: string;
  manufacturerEmail?: string;
  safetyWarnings?: string;
};

type ProductWithCommerceInfo = {
  commerceInfo?: CommerceInfo | null;
};

type ProductAccordionProps = {
  product: unknown;
};

type AccordionItem = {
  id: string;
  title: string;
  visible: boolean;
  content: ReactNode;
};

const hasText = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const toPositiveNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

const getCommerceInfo = (product: unknown): CommerceInfo => {
  if (typeof product !== "object" || product === null) {
    return {};
  }

  const commerceInfo = (product as ProductWithCommerceInfo).commerceInfo;

  if (typeof commerceInfo !== "object" || commerceInfo === null) {
    return {};
  }

  return commerceInfo;
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

const ProductAccordion = ({ product }: ProductAccordionProps) => {
  const [openId, setOpenId] = useState<string | null>(null);
  const info = getCommerceInfo(product);

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
      title: "PRODUCT DETAILS",
      visible: productDetailsVisible,
      content: (
        <div className="space-y-4">
          {hasText(info.productReference) && (
            <Detail label="Product reference">
              <p>{info.productReference}</p>
            </Detail>
          )}

          {hasText(info.productDetails) && (
            <Detail label="Details">
              <MultilineText value={info.productDetails} />
            </Detail>
          )}
        </div>
      ),
    },
    {
      id: "material-composition",
      title: "MATERIAL & COMPOSITION",
      visible: materialVisible,
      content: (
        <div className="space-y-4">
          {hasText(info.materialComposition) && (
            <Detail label="Composition">
              <p>{info.materialComposition}</p>
            </Detail>
          )}

          {hasText(info.fabricName) && (
            <Detail label="Fabric">
              <p>{info.fabricName}</p>
            </Detail>
          )}

          {fabricWeight > 0 && (
            <Detail label="Fabric weight">
              <p>{fabricWeight} GSM</p>
            </Detail>
          )}

          {hasText(info.fabricDescription) && (
            <Detail label="Characteristics">
              <MultilineText value={info.fabricDescription} />
            </Detail>
          )}
        </div>
      ),
    },
    {
      id: "fit-size",
      title: "FIT & SIZE",
      visible: fitVisible,
      content: (
        <div className="space-y-4">
          {hasText(info.fit) && (
            <Detail label="Fit">
              <p>{info.fit}</p>
            </Detail>
          )}

          {hasText(info.fitNotes) && (
            <Detail label="Size advice">
              <MultilineText value={info.fitNotes} />
            </Detail>
          )}
        </div>
      ),
    },
    {
      id: "care",
      title: "CARE",
      visible: careVisible,
      content: (
        <Detail label="Care instructions">
          <MultilineText value={info.careInstructions} />
        </Detail>
      ),
    },
    {
      id: "origin-craftsmanship",
      title: "ORIGIN & CRAFTSMANSHIP",
      visible: originVisible,
      content: (
        <div className="space-y-4">
          {hasText(info.countryOfManufacture) && (
            <Detail label="Country of manufacture">
              <p>{info.countryOfManufacture}</p>
            </Detail>
          )}

          {hasText(info.fabricOrigin) && (
            <Detail label="Fabric origin">
              <p>{info.fabricOrigin}</p>
            </Detail>
          )}

          {hasText(info.craftsmanship) && (
            <Detail label="Craftsmanship">
              <MultilineText value={info.craftsmanship} />
            </Detail>
          )}
        </div>
      ),
    },
    {
      id: "certifications",
      title: "CERTIFICATIONS",
      visible: certificationVisible,
      content: (
        <div className="space-y-4">
          {hasText(info.certificationName) && (
            <Detail label="Certification">
              <p>{info.certificationName}</p>
            </Detail>
          )}

          {hasText(info.certificationScope) && (
            <Detail label="Certification scope">
              <p>
                {info.certificationScope === "FABRIC"
                  ? "Fabric"
                  : info.certificationScope === "FINISHED_GARMENT"
                    ? "Finished garment"
                    : info.certificationScope}
              </p>
            </Detail>
          )}

          {hasText(info.certificateNumber) && (
            <Detail label="Certificate number">
              <p>{info.certificateNumber}</p>
            </Detail>
          )}

          {hasText(info.certificationInstitute) && (
            <Detail label="Testing institute">
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
              Verify certificate
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      ),
    },
    {
      id: "shipping-returns",
      title: "SHIPPING & RETURNS",
      visible: shippingVisible,
      content: (
        <div className="space-y-4">
          {hasText(info.shippingProcessingTime) && (
            <Detail label="Processing time">
              <p>{info.shippingProcessingTime}</p>
            </Detail>
          )}

          {hasText(info.deliveryEstimate) && (
            <Detail label="Estimated delivery">
              <p>{info.deliveryEstimate}</p>
            </Detail>
          )}

          {withdrawalDays > 0 && (
            <Detail label="Right of withdrawal">
              <p>{withdrawalDays} days</p>
            </Detail>
          )}

          {hasText(info.returnCostBearer) && (
            <Detail label="Return shipping costs">
              <p>{info.returnCostBearer}</p>
            </Detail>
          )}
        </div>
      ),
    },
    {
      id: "product-information",
      title: "PRODUCT INFORMATION",
      visible: manufacturerVisible,
      content: (
        <div className="space-y-4">
          {hasText(info.manufacturerName) && (
            <Detail label="Manufacturer">
              <p>{info.manufacturerName}</p>
            </Detail>
          )}

          {hasText(info.manufacturerAddress) && (
            <Detail label="Address">
              <MultilineText value={info.manufacturerAddress} />
            </Detail>
          )}

          {hasText(info.manufacturerEmail) && (
            <Detail label="Contact">
              <a
                href={`mailto:${info.manufacturerEmail}`}
                className="text-mbg-green underline underline-offset-4"
              >
                {info.manufacturerEmail}
              </a>
            </Detail>
          )}

          {hasText(info.safetyWarnings) && (
            <Detail label="Safety information">
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
      aria-label="Product information"
      className="bg-mbg-green/7 mt-3 w-full px-4 sm:px-5"
    >
      <div className="border-mbg-green/55 border-t">
        {visibleItems.map((item) => {
          const isOpen = openId === item.id;
          const contentId = `${item.id}-content`;

          return (
            <div key={item.id} className="border-mbg-green/55 border-b">
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

                <span className="border-mbg-black/15 group-hover:border-mbg-green flex h-6 w-6 shrink-0 items-center justify-center border transition-colors duration-300">
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
