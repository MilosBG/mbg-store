"use client";
import React, { useCallback, useEffect } from "react";
import jsPDF from "jspdf";

type OrderItem = {
  _id: string;
  product: { _id?: string; title: string; price: number };
  color?: string;
  size?: string;
  quantity: number;
};

type Props = {
  orderId: string;
  status: string;
  order: any; // full order object with products, shippingAddress, totalAmount
};

const ALLOWED = new Set(["SHIPPED", "DELIVERED", "COMPLETED"]);

function toCurrency(eur: number) {
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(eur);
  } catch {
    return `${eur.toFixed(2)} €`;
  }
}

export default function InvoiceButton({ orderId, order, status }: Props) {
  const s = String(status || "PENDING").toUpperCase();
  if (!ALLOWED.has(s)) return null;

  const handleGenerate = useCallback(() => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    // Page margins
    const left = 15;
    const right = 195;

    // Header bar
    doc.setDrawColor(0);
    doc.setFillColor(0);
    doc.rect(left, 18, right - left, 12, "S");
    doc.setTextColor(255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("MILOS BG", (left + right) / 2, 26, { align: "center" });

    // Title
    doc.setTextColor(0);
    doc.setFontSize(14);
    doc.text("FACTURE", (left + right) / 2, 45, { align: "center" });
    doc.setFontSize(10);
    doc.text(`N°${orderId}`, (left + right) / 2, 52, { align: "center" });

    // Customer address box (left)
    const addrX = left;
    const addrY = 65;
    const addrW = 80;
    const addrH = 40;
    const a = order?.shippingAddress || {};
    const name = a.name || a.fullName || [a.firstName, a.lastName].filter(Boolean).join(" ");
    const lines: string[] = [
      name || "",
      [a.address1, a.address2].filter(Boolean).join(" ") || a.address || "",
      [a.postalCode, a.city].filter(Boolean).join(" ") || "",
      a.country || "",
    ].filter(Boolean);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    lines.forEach((t, i) => doc.text(String(t), addrX + 2, addrY + 6 + i * 5));

    // Order info box (right)
    const infoX = left + addrW + 15;
    const infoY = addrY - 2;
    const cellW = right - infoX;
    const rowH = 8;
    const now = new Date();
    const infoRows: [string, string][] = [
      ["DATE D'ENVOI", now.toLocaleDateString()],
      ["EXPEDITEUR", "Milos BG"],
      ["CLIENT", name || ""],
      ["EMAIL CLIENT", a.email || order?.customerEmail || ""],
      ["COMMANDE N°", orderId],
    ];
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    for (let i = 0; i < infoRows.length; i++) {
      const y = infoY + i * rowH;
      doc.rect(infoX, y, cellW, rowH);
      doc.text(infoRows[i][0], infoX + 2, y + 5);
      doc.setFont("helvetica", "bold");
      doc.text(infoRows[i][1], infoX + cellW - 2, y + 5, { align: "right" });
      doc.setFont("helvetica", "normal");
    }

    // Table header
    const tX = left;
    const tY = addrY + addrH + 5;
    const colW = { ref: 25, desc: 60, size: 20, qty: 20, price: 30, amt: 30 } as const;
    const tHeight = 8;
    doc.setFont("helvetica", "bold");
    doc.rect(tX, tY, right - left, tHeight);
    doc.text("Référence", tX + 2, tY + 5);
    doc.text("Description", tX + colW.ref + 2, tY + 5);
    doc.text("Taille", tX + colW.ref + colW.desc + 2, tY + 5);
    doc.text("Quantité", tX + colW.ref + colW.desc + colW.size + 2, tY + 5);
    doc.text("Prix Unitaire", tX + colW.ref + colW.desc + colW.size + colW.qty + 2, tY + 5);
    doc.text("Montant", right - 2, tY + 5, { align: "right" });

    // Table rows
    const items: OrderItem[] = (order?.products ?? []) as OrderItem[];
    let y = tY + tHeight;
    doc.setFont("helvetica", "normal");
    let subtotal = 0;
    items.forEach((it) => {
      const unit = Number(it?.product?.price ?? 0);
      const qty = Number(it?.quantity ?? 0);
      const amount = unit * qty;
      subtotal += amount;
      const ref = String(it?.product?._id || it._id || "").slice(-8);
      const desc = it?.product?.title || "";
      const size = [it?.size, it?.color].filter(Boolean).join(" ");

      doc.rect(tX, y, right - left, tHeight);
      doc.text(ref, tX + 2, y + 5);
      doc.text(desc, tX + colW.ref + 2, y + 5);
      doc.text(size, tX + colW.ref + colW.desc + 2, y + 5);
      doc.text(String(qty), tX + colW.ref + colW.desc + colW.size + 2, y + 5);
      doc.text(toCurrency(unit), tX + colW.ref + colW.desc + colW.size + colW.qty + 2, y + 5);
      doc.text(toCurrency(amount), right - 2, y + 5, { align: "right" });
      y += tHeight;
    });

    const totalAmount = Number(order?.totalAmount ?? subtotal);
    const shippingCost = Math.max(0, Number((totalAmount - subtotal).toFixed(2)));

    // Totals box
    const boxW = 80;
    const boxX = right - boxW;
    doc.rect(boxX, y + 4, boxW, 8);
    doc.text("Montant", boxX + 2, y + 10);
    doc.setFont("helvetica", "bold");
    doc.text(toCurrency(subtotal), right - 2, y + 10, { align: "right" });
    doc.setFont("helvetica", "normal");

    doc.rect(boxX, y + 12, boxW, 8);
    doc.text("Livraison", boxX + 2, y + 18);
    doc.setFont("helvetica", "bold");
    doc.text(toCurrency(shippingCost), right - 2, y + 18, { align: "right" });
    doc.setFont("helvetica", "normal");

    doc.setFillColor(48);
    doc.rect(boxX, y + 20, boxW / 3, 8, "F");
    doc.setTextColor(255);
    doc.text("TOTAL", boxX + 2, y + 26);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.rect(boxX + boxW / 3, y + 20, (boxW * 2) / 3, 8);
    doc.text(toCurrency(totalAmount), right - 2, y + 26, { align: "right" });

    // Footer note
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text(
      "Plus d'informations sur le droit de rétractation et la politique de retour sur www.milos-bg.com",
      (left + right) / 2,
      285,
      { align: "center" }
    );

    doc.save(`invoice-${orderId}.pdf`);
  }, [order, orderId]);

  // Auto-download once per order when status is eligible
  useEffect(() => {
    const key = `invoice-downloaded-${orderId}`;
    if (ALLOWED.has(s) && typeof window !== "undefined" && !localStorage.getItem(key)) {
      try {
        handleGenerate();
        localStorage.setItem(key, "1");
      } catch {
        // ignore auto errors; user can click the button
      }
    }
  }, [handleGenerate, orderId, s]);

  return (
    <button
      type="button"
      onClick={handleGenerate}
      className="inline-flex items-center rounded-xs bg-mbg-green px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-white hover:opacity-90"
    >
      View / Download Invoice
    </button>
  );
}
