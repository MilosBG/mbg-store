import { buildMetadata } from "@/lib/seo";
import ClientPage from "./ClientPage";

export const metadata = buildMetadata({
  title: "The Hoop",
  description: "Review your Milos BG bag, update quantities, and proceed securely to checkout.",
  path: "/the-hoop",
  image: "/Grinder.png",
  keywords: ["the hoop", "shopping cart", "checkout", "Milos BG"],
  robotsIndex: false,
});

export default function Page() {
  return <ClientPage />;
}
