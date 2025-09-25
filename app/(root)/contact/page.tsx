import { buildMetadata } from "@/lib/seo";
import ClientPage from "./ClientPage";

export const metadata = buildMetadata({
  title: "Contact",
  description: "Reach the Milos BG support team for questions about orders, returns, or partnerships.",
  path: "/contact",
  image: "/Grinder.png",
  keywords: ["contact", "customer support", "Milos BG"],
});

export default function Page() {
  return <ClientPage />;
}
