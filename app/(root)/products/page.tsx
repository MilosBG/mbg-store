import type { Metadata } from "next";

import ClientPage from "./ClientPage";
import { getProducts } from "@/lib/admin";
import { buildMetadata } from "@/lib/seo";
import Container from "@/components/mbg-components/Container";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Tous les produits",
  description:
    "Découvrez l’ensemble des créations Milos BG : TOPS, UPCYCLINGS, BOTTOMS, BACKUPS et CGS.",
  path: "/products",
  image: "/Grinder.png",
  keywords: [
    "Milos BG",
    "Milos BG vêtements",
    "GRIND UNTIL ACHIEVE",
    "basketball clothing",
    "artisan clothing",
    "TOPS",
    "UPCYCLINGS",
    "BOTTOMS",
    "BACKUPS",
    "CGS",
  ],
});

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <Container>
        <ClientPage
          products={Array.isArray(products) ? products : []}
        />
    </Container>
  );
}