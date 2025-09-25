import { buildMetadata } from "@/lib/seo";
import ClientPage from "./ClientPage";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description: "Understand how Milos BG collects, protects, and uses your personal data across the store.",
  path: "/privacy-policy",
  image: "/Grinder.png",
  keywords: ["privacy policy", "data protection", "Milos BG"],
});

export default function Page() {
  return <ClientPage />;
}
