import { buildMetadata } from "@/lib/seo";
import ClientPage from "./ClientPage";

export const metadata = buildMetadata({
  title: "Payment Success",
  description: "Your Milos BG payment was received successfully. Review what happens next with your order.",
  path: "/payment_success",
  image: "/Grinder.png",
  keywords: ["order confirmation", "payment success", "Milos BG"],
  robotsIndex: false,
});

export default function Page() {
  return <ClientPage />;
}
