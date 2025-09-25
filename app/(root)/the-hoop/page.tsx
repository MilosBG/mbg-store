import { buildMetadata } from "@/lib/seo";
import ClientPage from "./ClientPage";

export const metadata = buildMetadata({
  title: "Cart",
  description: "Review your Milos BG bag, update quantities, and proceed securely to checkout.",
  path: "/the-hoop",
  image: "/Grinder.png",
  keywords: ["shopping cart", "checkout", "Milos BG"],
  robotsIndex: false,
});

export default function Page() {
  return <ClientPage />;
}
