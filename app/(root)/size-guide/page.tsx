import { buildMetadata } from "@/lib/seo";
import ClientPage from "./ClientPage";

export const metadata = buildMetadata({
  title: "Size Guide",
  description: "Find the right Milos BG fit with detailed measurements and sizing tips for every collection.",
  path: "/size-guide",
  image: "/Grinder.png",
  keywords: ["size guide", "fit guide", "Milos BG"],
});

export default function Page() {
  return <ClientPage />;
}
