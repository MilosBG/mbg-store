import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import {
  normalizeStoreLanguage,
  type StoreLanguage,
} from "@/lib/store-language";
import ClientPage from "./ClientPage";

type PageProps = {
  searchParams: Promise<{ lang?: string }>;
};

const META = {
  en: {
    title: "Contact Milos BG | Orders, Returns & Partnerships",
    description:
      "Get in touch with Milos BG for questions about orders, handmade apparel, returns, sizing or collaborations.",
  },
  fr: {
    title: "Contacter Milos BG | Commandes, retours et partenariats",
    description:
      "Contactez Milos BG pour vos questions sur les commandes, les vêtements artisanaux, les retours, les tailles ou les collaborations.",
  },
} satisfies Record<StoreLanguage, { title: string; description: string }>;

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { lang: langParam } = await searchParams;
  const lang = normalizeStoreLanguage(langParam);
  const canonical = lang === "fr" ? "/contact?lang=fr" : "/contact";
  const copy = META[lang];

  return {
    ...buildMetadata({
      title: copy.title,
      description: copy.description,
      path: canonical,
      image: "/Grinder.png",
      keywords:
        lang === "fr"
          ? ["Milos BG", "contact", "service client", "suivi commande", "retours", "artisanat", "partenariat"]
          : ["Milos BG", "contact", "customer support", "order questions", "returns", "artisan clothing", "partnerships"],
    }),
    alternates: {
      canonical,
      languages: {
        en: "/contact",
        fr: "/contact?lang=fr",
        "x-default": "/contact",
      },
    },
  };
}

export default function Page() {
  return <ClientPage />;
}
