const INTERNAL_URL_BASE =
  "https://addyventure.internal";


export function getSafeInternalPath(
  value,
  fallback = "/"
) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//")
  ) {
    return fallback;
  }

  try {
    const destination =
      new URL(
        value,
        INTERNAL_URL_BASE
      );

    if (
      destination.origin !==
      INTERNAL_URL_BASE
    ) {
      return fallback;
    }

    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return fallback;
  }
}