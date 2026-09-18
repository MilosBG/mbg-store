import { buildMetadata } from "@/lib/seo";
import ClientPage from "./ClientPage";

export const metadata = buildMetadata({
  title: "GRIND UNTIL ACHIEVE | Book & Ebook",
  description:
    "Discover GRIND UNTIL ACHIEVE by Milos BG — a story of progression through GRIND, RESILIENCE, CONSISTENCY, FOCUS and ACHIEVE.",
  path: "/grind-until-achieve",
  image: "/Grinder.png",
  keywords: [
    "GRIND UNTIL ACHIEVE",
    "Milos BG",
    "book",
    "ebook",
    "basketball mindset",
    "progression",
    "GRIND",
    "RESILIENCE",
    "CONSISTENCY",
    "FOCUS",
    "ACHIEVE",
  ],
});

export default function Page() {
  return <ClientPage />;
}
