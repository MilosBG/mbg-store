import type { Metadata } from "next";

import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Withdrawal / Rétractation | Milos BG",
  description:
    "Submit an online withdrawal request to Milos BG or use the French/English PDF model form. / Envoyez une demande de rétractation en ligne à Milos BG ou utilisez le formulaire PDF français/anglais.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function Page() {
  return <ClientPage />;
}
