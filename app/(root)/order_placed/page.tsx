import { buildMetadata } from "@/lib/seo";
import ClientPage from "./ClientPage";

export const metadata = buildMetadata({
  title: "Order Placed",
  description:
    "Your Milos BG order has been placed successfully. Review your order details and delivery information.",
  path: "/order_placed",
  image: "/Grinder.png",
  keywords: [
    "order confirmation",
    "order placed",
    "Milos BG",
  ],
  robotsIndex: false,
});

export default function Page() {
  return <ClientPage />;
}