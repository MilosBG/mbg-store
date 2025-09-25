import { buildMetadata } from "@/lib/seo";
import ClientPage from "./ClientPage";

export const metadata = buildMetadata({
  title: "Terms & Conditions",
  description: "Review the Milos BG terms of sale, delivery conditions, and customer obligations before ordering.",
  path: "/terms-conditions",
  image: "/Grinder.png",
  keywords: ["terms and conditions", "Milos BG policies", "online store terms"],
});

export default function Page() {
  return <ClientPage />;
}
