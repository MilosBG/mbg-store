import type { Metadata } from "next";

import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Withdrawal | Milos BG",
  description: "Exercise your statutory right of withdrawal for an eligible Milos BG order.",
  robots: { index: false, follow: false },
};

export default function WithdrawalPage() {
  return <ClientPage />;
}
