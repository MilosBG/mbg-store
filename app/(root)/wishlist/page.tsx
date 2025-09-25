import { buildMetadata } from "@/lib/seo";
import ClientPage from "./ClientPage";

export const metadata = buildMetadata({
  title: "Wishlist",
  description: "Track your saved Milos BG styles and check availability when you're ready to purchase.",
  path: "/wishlist",
  image: "/Grinder.png",
  keywords: ["wishlist", "saved items", "Milos BG"],
  robotsIndex: false,
});

export default function Page() {
  return <ClientPage />;
}
