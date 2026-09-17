const LOCAL_IMAGE_FALLBACK =
  "/social-preview.png";

export function handleImageError(
  event,
  sources,
  startIndex = 0
) {
  const image = event.currentTarget;

  // Prevent a failed responsive candidate from overriding the fallback URL.
  image.removeAttribute("srcset");
  delete image.dataset.loaded;

  const attempt =
    Number(
      image.dataset.fallbackAttempt ||
        0
    ) + 1;

  if (
    Array.isArray(sources) &&
    attempt < sources.length
  ) {
    const nextIndex =
      (startIndex + attempt) %
      sources.length;

    image.dataset.fallbackAttempt =
      String(attempt);

    image.src = sources[nextIndex];
    return;
  }

  if (
    image.dataset.localFallback ===
    "true"
  ) {
    return;
  }

  image.dataset.localFallback =
    "true";

  image.src = LOCAL_IMAGE_FALLBACK;
}

export function markImageLoaded(event) {
  event.currentTarget.dataset.loaded =
    "true";
}
