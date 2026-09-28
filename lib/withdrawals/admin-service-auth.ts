function readBearerToken(request: Request): string | null {
  const authorization = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(authorization);

  if (match?.[1]) {
    return match[1].trim();
  }

  const alternate = request.headers.get("x-storefront-service-token");
  return alternate?.trim() || null;
}

function expectedToken(): string {
  return (
    process.env.STOREFRONT_SERVICE_TOKEN?.trim() ||
    process.env.MBG_STOREFRONT_SERVICE_TOKEN?.trim() ||
    process.env.MBG_SERVICE_TOKEN?.trim() ||
    ""
  );
}

export function isAuthorizedAdminService(request: Request): boolean {
  const expected = expectedToken();
  const provided = readBearerToken(request);

  return Boolean(expected && provided && provided === expected);
}
