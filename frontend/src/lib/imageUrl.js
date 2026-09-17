const UNSPLASH_HOST = "images.unsplash.com";

export function getOptimizedImageUrl(
  source,
  { width, quality = 80 } = {}
) {
  if (!source || !width) {
    return source;
  }

  try {
    const url = new URL(source);

    if (url.hostname !== UNSPLASH_HOST) {
      return source;
    }

    url.searchParams.set("auto", "format");
    url.searchParams.set("fit", "crop");
    url.searchParams.set("w", String(width));
    url.searchParams.set("q", String(quality));

    return url.toString();
  } catch {
    return source;
  }
}

export function getOptimizedImageSources(
  sources,
  options
) {
  return sources.map((source) =>
    getOptimizedImageUrl(source, options)
  );
}
