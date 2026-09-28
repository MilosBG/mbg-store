import { readFile } from "node:fs/promises";
import path from "node:path";

import fontkit from "@pdf-lib/fontkit";
import { NextResponse } from "next/server";
import {
  PDFDocument,
  rgb,
  type PDFFont,
} from "pdf-lib";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type Lang = "en" | "fr";

type PublicLegalSettings = {
  fullName?: string;
  legalFormFr?: string;
  legalFormEn?: string;
  businessName?: string;
  businessAddress?: string;
  returnAddress?: string;
  email?: string;
  domain?: string;
};

type PublicLegalSettingsResponse = {
  settings?: PublicLegalSettings;
};

const GREEN = rgb(0, 130 / 255, 26 / 255);
const BLACK = rgb(0, 0, 0);
const DARK = rgb(17 / 255, 17 / 255, 17 / 255);
const GREY = rgb(102 / 255, 102 / 255, 102 / 255);
const LIGHT = rgb(244 / 255, 244 / 255, 244 / 255);
const BORDER = rgb(212 / 255, 212 / 255, 212 / 255);
const WHITE = rgb(1, 1, 1);

const FALLBACK_ADMIN_URL =
  "https://mbg-admin.vercel.app";

const PDF_COPY = {
  fr: {
    title: "FORMULAIRE DE RÉTRACTATION",
    legalModel:
      "Modèle prévu par l'annexe à l'article R221-1 du Code de la consommation",
    intro1:
      "Veuillez compléter et renvoyer le présent formulaire uniquement si vous souhaitez",
    intro2:
      "vous rétracter du contrat conclu avec {businessName}.",
    attention: "À L'ATTENTION DE",
    geographicAddress: "Adresse géographique",
    emailAddress: "Adresse électronique",
    declaration:
      "Je/nous (*) vous notifie/notifions (*) par la présente ma/notre (*) rétractation du contrat portant sur la vente du bien (*) / pour la prestation de services (*) ci-dessous :",
    goods: "Bien(s) / prestation concerné(e) :",
    orderReference:
      "Référence de commande (facultatif) :",
    orderedOn: "Commandé le (*) :",
    receivedOn: "Reçu le (*) :",
    consumerName:
      "Nom du (des) consommateur(s) :",
    consumerAddress:
      "Adresse du (des) consommateur(s) :",
    date: "Date :",
    signature:
      "Signature du (des) consommateur(s)",
    paperOnly:
      "(uniquement en cas de notification sur papier)",
    strike:
      "(*) Rayez la mention inutile.",
    send: "ENVOI",
    sendText:
      "Vous pouvez renvoyer ce formulaire par courrier à {returnAddress} ou par email à {email}. Conservez une preuve de votre envoi.",
    filename:
      "Formulaire-retractation-Milos-BG-FR.pdf",
  },

  en: {
    title: "WITHDRAWAL FORM",
    legalModel:
      "Model withdrawal form pursuant to the Annex to Article R221-1 of the French Consumer Code",
    intro1:
      "Complete and return this form only if you wish to withdraw from",
    intro2:
      "the contract concluded with {businessName}.",
    attention: "TO",
    geographicAddress: "Business address",
    emailAddress: "Email address",
    declaration:
      "I/We (*) hereby give notice that I/We (*) withdraw from my/our (*) contract for the sale of the following goods (*) / provision of the following services (*) :",
    goods: "Goods / services concerned:",
    orderReference:
      "Order reference (optional):",
    orderedOn: "Ordered on (*):",
    receivedOn: "Received on (*):",
    consumerName: "Name of consumer(s):",
    consumerAddress: "Address of consumer(s):",
    date: "Date:",
    signature: "Signature of consumer(s)",
    paperOnly:
      "(only if this form is notified on paper)",
    strike:
      "(*) Delete as appropriate.",
    send: "SEND",
    sendText:
      "You may return this form by post to {returnAddress} or by email to {email}. Keep proof of sending.",
    filename:
      "Withdrawal-form-Milos-BG-EN.pdf",
  },
} as const;

function normalizeLang(
  value: string | null | undefined,
): Lang {
  return value === "fr" ? "fr" : "en";
}

function clean(value: unknown): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function replaceTokens(
  text: string,
  values: Record<string, string>,
) {
  let result = text;

  for (const [key, value] of Object.entries(values)) {
    result = result.replaceAll(`{${key}}`, value);
  }

  return result;
}

function wrapText(
  text: string,
  maxWidth: number,
  font: PDFFont,
  size: number,
) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line
      ? `${line} ${word}`
      : word;

    if (
      font.widthOfTextAtSize(
        candidate,
        size,
      ) <= maxWidth
    ) {
      line = candidate;
      continue;
    }

    if (line) lines.push(line);
    line = word;
  }

  if (line) lines.push(line);

  return lines;
}

async function loadKanitFonts(
  pdf: PDFDocument,
) {
  pdf.registerFontkit(fontkit);

  const regularPath = path.join(
    process.cwd(),
    "public",
    "fonts",
    "Kanit-Regular.ttf",
  );

  const boldPath = path.join(
    process.cwd(),
    "public",
    "fonts",
    "Kanit-Bold.ttf",
  );

  const [
    regularBytes,
    boldBytes,
  ] = await Promise.all([
    readFile(regularPath),
    readFile(boldPath),
  ]);

  const [
    regular,
    bold,
  ] = await Promise.all([
    pdf.embedFont(
      regularBytes,
      { subset: true },
    ),
    pdf.embedFont(
      boldBytes,
      { subset: true },
    ),
  ]);

  return {
    regular,
    bold,
  };
}

async function getLegalSettings():
Promise<PublicLegalSettings> {
  const adminUrl = (
    process.env.MBG_ADMIN_URL ||
    FALLBACK_ADMIN_URL
  ).replace(/\/+$/, "");

  const response = await fetch(
    `${adminUrl}/api/public/legal-settings`,
    {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    },
  );

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(
      `MBG_ADMIN_LEGAL_SETTINGS_${response.status}: ${raw.slice(0, 300)}`,
    );
  }

  let payload: PublicLegalSettingsResponse;

  try {
    payload = JSON.parse(
      raw,
    ) as PublicLegalSettingsResponse;
  } catch {
    throw new Error(
      "MBG_ADMIN_LEGAL_SETTINGS_INVALID_JSON",
    );
  }

  return payload.settings ?? {};
}

export async function GET(
  request: Request,
) {
  try {
    const url = new URL(request.url);
    const lang = normalizeLang(
      url.searchParams.get("lang"),
    );

    const t = PDF_COPY[lang];
    const settings =
      await getLegalSettings();

    const fullName =
      clean(settings.fullName) ||
      "Gamil BEN AHMED";

    const legalForm =
      (
        lang === "fr"
          ? clean(settings.legalFormFr)
          : clean(settings.legalFormEn)
      ) ||
      (
        lang === "fr"
          ? "Entrepreneur individuel"
          : "Sole trader"
      );

    const businessName =
      clean(settings.businessName) ||
      "Milos BG";

    const businessAddress =
      clean(settings.businessAddress) ||
      clean(settings.returnAddress) ||
      (
        lang === "fr"
          ? "À COMPLÉTER DANS MBG-ADMIN"
          : "TO COMPLETE IN MBG-ADMIN"
      );

    const returnAddress =
      clean(settings.returnAddress) ||
      businessAddress;

    const email =
      clean(settings.email) ||
      "contact@milos-bg.com";

    const domain =
      clean(settings.domain) ||
      "milos-bg.com";

    const pdf =
      await PDFDocument.create();

    const page = pdf.addPage([
      595.28,
      841.89,
    ]);

    const form =
      pdf.getForm();

    const {
      regular,
      bold,
    } = await loadKanitFonts(pdf);

    const {
      width,
      height,
    } = page.getSize();

    const margin = 62;
    const contentWidth =
      width - margin * 2;

    // -------------------------------------------------------------------------
    // HEADER
    // -------------------------------------------------------------------------

    page.drawRectangle({
      x: 0,
      y: height - 126,
      width,
      height: 126,
      color: BLACK,
    });

    page.drawRectangle({
      x: 0,
      y: height - 129,
      width,
      height: 5,
      color: GREEN,
    });

    try {
      const logoPath = path.join(
        process.cwd(),
        "public",
        "legal",
        "milos-bg-logo.png",
      );

      const logoBytes =
        await readFile(logoPath);

      const logo =
        await pdf.embedPng(
          logoBytes,
        );

      const original =
        logo.scale(1);

      const maxWidth = 215;
      const maxHeight = 70;

      const ratio = Math.min(
        maxWidth / original.width,
        maxHeight / original.height,
        1,
      );

      const logoWidth =
        original.width * ratio;

      const logoHeight =
        original.height * ratio;

      page.drawImage(
        logo,
        {
          x:
            (width - logoWidth) /
            2,
          y:
            height - 90,
          width: logoWidth,
          height: logoHeight,
        },
      );
    } catch (error) {
      console.warn(
        "[WITHDRAWAL_FORM] Logo unavailable, using text fallback.",
        error,
      );

      page.drawText(
        "MILOS BG",
        {
          x: 225,
          y: height - 73,
          size: 24,
          font: bold,
          color: WHITE,
        },
      );
    }

    let y = height - 170;

    // -------------------------------------------------------------------------
    // TITLE
    // -------------------------------------------------------------------------

    page.drawText(
      t.title,
      {
        x: margin,
        y,
        size: 19,
        font: bold,
        color: DARK,
      },
    );

    y -= 20;

    for (
      const line of wrapText(
        t.legalModel,
        contentWidth,
        regular,
        8.5,
      )
    ) {
      page.drawText(
        line,
        {
          x: margin,
          y,
          size: 8.5,
          font: regular,
          color: GREY,
        },
      );

      y -= 11;
    }

    y -= 17;

    page.drawRectangle({
      x: margin,
      y: y - 45,
      width: contentWidth,
      height: 52,
      color: LIGHT,
      borderColor: BORDER,
      borderWidth: 1,
    });

    const intro = [
      t.intro1,
      replaceTokens(
        t.intro2,
        {
          businessName,
        },
      ),
    ];

    intro.forEach(
      (line, index) => {
        page.drawText(
          line,
          {
            x: margin + 14,
            y:
              y -
              15 -
              index * 14,
            size: 9,
            font: regular,
            color: DARK,
          },
        );
      },
    );

    y -= 66;

    // -------------------------------------------------------------------------
    // SELLER
    // -------------------------------------------------------------------------

    page.drawText(
      t.attention,
      {
        x: margin,
        y,
        size: 10,
        font: bold,
        color: GREEN,
      },
    );

    y -= 17;

    for (
      const line of wrapText(
        `${businessName} - ${fullName}, ${legalForm.toLowerCase()}`,
        contentWidth,
        bold,
        9.3,
      )
    ) {
      page.drawText(
        line,
        {
          x: margin,
          y,
          size: 9.3,
          font: bold,
          color: DARK,
        },
      );

      y -= 13;
    }

    for (
      const line of wrapText(
        `${t.geographicAddress} : ${businessAddress}`,
        contentWidth,
        regular,
        8.7,
      )
    ) {
      page.drawText(
        line,
        {
          x: margin,
          y,
          size: 8.7,
          font: regular,
          color: DARK,
        },
      );

      y -= 12;
    }

    page.drawText(
      `${t.emailAddress} : ${email}`,
      {
        x: margin,
        y,
        size: 8.7,
        font: regular,
        color: DARK,
      },
    );

    y -= 26;

    for (
      const line of wrapText(
        t.declaration,
        contentWidth,
        regular,
        9,
      )
    ) {
      page.drawText(
        line,
        {
          x: margin,
          y,
          size: 9,
          font: regular,
          color: DARK,
        },
      );

      y -= 13;
    }

    y -= 7;

    // -------------------------------------------------------------------------
    // FORM HELPERS
    // -------------------------------------------------------------------------

    function addLabel(
      label: string,
      atY: number,
    ) {
      page.drawText(
        label,
        {
          x: margin,
          y: atY,
          size: 8.5,
          font: bold,
          color: DARK,
        },
      );
    }

    function addTextField(
      name: string,
      atY: number,
      fieldHeight: number,
      options?: {
        multiline?: boolean;
        x?: number;
        width?: number;
      },
    ) {
      const field =
        form.createTextField(
          name,
        );

      if (
        options?.multiline
      ) {
        field.enableMultiline();
      }

      field.addToPage(
        page,
        {
          x:
            options?.x ??
            margin,
          y: atY,
          width:
            options?.width ??
            contentWidth,
          height:
            fieldHeight,
          borderColor:
            BORDER,
          borderWidth: 1,
          backgroundColor:
            WHITE,
          textColor:
            DARK,
          font:
            regular,
        },
      );
    }

    // -------------------------------------------------------------------------
    // FIELDS
    // -------------------------------------------------------------------------

    addLabel(
      t.goods,
      y,
    );

    y -= 45;

    addTextField(
      "goods_services",
      y,
      36,
      {
        multiline: true,
      },
    );

    y -= 20;

    addLabel(
      t.orderReference,
      y + 8,
    );

    addTextField(
      "order_reference",
      y,
      20,
      {
        x: margin + 165,
        width:
          contentWidth - 165,
      },
    );

    y -= 38;

    addLabel(
      t.orderedOn,
      y + 8,
    );

    addTextField(
      "ordered_date",
      y,
      20,
      {
        x: margin + 96,
        width: 135,
      },
    );

    page.drawText(
      t.receivedOn,
      {
        x: margin + 290,
        y: y + 8,
        size: 8.5,
        font: bold,
        color: DARK,
      },
    );

    addTextField(
      "received_date",
      y,
      20,
      {
        x: margin + 365,
        width: 105,
      },
    );

    y -= 38;

    addLabel(
      t.consumerName,
      y + 8,
    );

    addTextField(
      "consumer_name",
      y - 14,
      22,
    );

    y -= 58;

    addLabel(
      t.consumerAddress,
      y + 8,
    );

    addTextField(
      "consumer_address",
      y - 42,
      44,
      {
        multiline: true,
      },
    );

    y -= 76;

    addLabel(
      t.date,
      y + 8,
    );

    addTextField(
      "signature_date",
      y,
      20,
      {
        x: margin + 46,
        width: 140,
      },
    );

    y -= 35;

    page.drawText(
      t.signature,
      {
        x: margin,
        y,
        size: 8.5,
        font: bold,
        color: DARK,
      },
    );

    page.drawText(
      t.paperOnly,
      {
        x: margin + 184,
        y,
        size: 7.5,
        font: regular,
        color: GREY,
      },
    );

    y -= 25;

    page.drawLine({
      start: {
        x: margin,
        y,
      },
      end: {
        x: width - margin,
        y,
      },
      thickness: 0.8,
      color: DARK,
    });

    y -= 20;

    page.drawText(
      t.strike,
      {
        x: margin,
        y,
        size: 7.3,
        font: regular,
        color: GREY,
      },
    );

    y -= 22;

    page.drawText(
      t.send,
      {
        x: margin,
        y,
        size: 8.3,
        font: bold,
        color: DARK,
      },
    );

    y -= 14;

    const sendText =
      replaceTokens(
        t.sendText,
        {
          returnAddress,
          email,
        },
      );

    for (
      const line of wrapText(
        sendText,
        contentWidth,
        regular,
        7.7,
      )
    ) {
      page.drawText(
        line,
        {
          x: margin,
          y,
          size: 7.7,
          font: regular,
          color: GREY,
        },
      );

      y -= 10;
    }

    // -------------------------------------------------------------------------
    // FOOTER
    // -------------------------------------------------------------------------

    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height: 40,
      color: BLACK,
    });

    page.drawText(
      "MILOS BG  •  GRIND UNTIL ACHIEVE",
      {
        x: 50,
        y: 15,
        size: 7.2,
        font: regular,
        color: WHITE,
      },
    );

    page.drawText(
      domain,
      {
        x: width - 100,
        y: 15,
        size: 7.2,
        font: bold,
        color: GREEN,
      },
    );

    form.updateFieldAppearances(
      regular,
    );

    const bytes =
      await pdf.save();

    return new NextResponse(
      Buffer.from(bytes),
      {
        status: 200,
        headers: {
          "Content-Type":
            "application/pdf",
          "Content-Disposition":
            `inline; filename="${t.filename}"`,
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
          "Content-Language":
            lang,
        },
      },
    );
  } catch (error) {
    console.error(
      "[WITHDRAWAL_FORM] PDF generation failed.",
      error,
    );

    return NextResponse.json(
      {
        error:
          "WITHDRAWAL_FORM_GENERATION_FAILED",
        message:
          error instanceof Error
            ? error.message
            : "Unknown PDF generation error",
      },
      {
        status: 500,
        headers: {
          "Cache-Control":
            "no-store",
        },
      },
    );
  }
}
