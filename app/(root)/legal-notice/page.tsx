import { buildMetadata } from "@/lib/seo";
import ClientPage from "./ClientPage";

export const metadata = buildMetadata({
  title: "Legal Notice",
  description: "Access the official company details, hosting information, and legal notices for Milos BG.",
  path: "/legal-notice",
  image: "/Grinder.png",
  keywords: ["legal notice", "company information", "Milos BG"],
});

export default function Page() {
  return <ClientPage />;
}
