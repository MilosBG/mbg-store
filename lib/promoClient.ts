/**
 * Promo checkout utilities. Presentation only: the admin service remains the
 * authority for prices, stock, eligibility, discounts, and final order totals.
 */
export type PromoLanguage = "en" | "fr";

// Mobile keyboards and paste tools may insert invisible Unicode characters.
export function normalizePromoInput(value: string): string {
  return value
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, "")
    .trim()
    .toUpperCase();
}

/** Never surface unchecked backend errors or auth details to shoppers. */
export function promoErrorMessage(
  serverMessage: string,
  status: number,
  language: PromoLanguage,
): string {
  const fr = language === "fr";
  const message = serverMessage.trim().toLowerCase();

  if (message.includes("cart is empty")) {
    return fr ? "Ton panier est vide." : "Your cart is empty.";
  }
  if (message.includes("minimum order amount")) {
    return fr
      ? "Le montant minimum d’achat requis n’est pas atteint. Vérifie le sous-total hors livraison."
      : "The minimum order amount has not been reached. Check your subtotal before delivery.";
  }
  if (message.includes("reached its limit")) {
    return fr
      ? "Ce code a atteint sa limite d’utilisations."
      : "This promotional code has reached its usage limit.";
  }
  if (message.includes("expired")) {
    return fr ? "Ce code promotionnel a expiré." : "This promotional code has expired.";
  }
  if (message.includes("not started")) {
    return fr
      ? "Cette offre n’est pas encore disponible."
      : "This promotion is not yet available.";
  }
  if (message.includes("not active") || message.includes("no longer available")) {
    return fr
      ? "Ce code promotionnel n’est pas actif."
      : "This promotional code is not active.";
  }
  if (message.includes("unknown promotional code") || message.includes("invalid promotion code")) {
    return fr
      ? "Ce code promotionnel n’est pas reconnu."
      : "This promotional code was not recognised.";
  }
  if (message.includes("variant is unavailable") || message.includes("product not available")) {
    return fr
      ? "Un article ou une variante du panier n’est plus disponible. Actualise ton panier."
      : "A product or variant in your cart is no longer available. Refresh your cart.";
  }
  if (message.includes("insufficient stock")) {
    return fr
      ? "Une quantité dépasse le stock disponible. Modifie ton panier puis réessaie."
      : "A quantity exceeds available stock. Update your cart and try again.";
  }
  if (status === 503 || status === 502 || status >= 500) {
    return fr
      ? "Le service de promotions est momentanément indisponible. Réessaie dans un instant."
      : "The promotion service is temporarily unavailable. Please try again shortly.";
  }
  return fr
    ? "Ce code n’a pas pu être appliqué. Vérifie le code et les conditions de l’offre."
    : "This code could not be applied. Check the code and offer conditions.";
}
