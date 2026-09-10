export type StoreLanguage = "en" | "fr";

export const normalizeStoreLanguage = (
  value?: string | string[],
): StoreLanguage => {
  const lang = Array.isArray(value) ? value[0] : value;

  return lang?.toLowerCase() === "fr" ? "fr" : "en";
};

export const withStoreLanguage = (
  pathname: string,
  lang: StoreLanguage,
): string => {
  const separator = pathname.includes("?") ? "&" : "?";
  return `${pathname}${separator}lang=${lang}`;
};
