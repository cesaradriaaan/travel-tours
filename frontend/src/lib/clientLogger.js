function safeValue(
  value,
  maxLength = 80
) {
  if (
    typeof value !== "string" &&
    typeof value !== "number"
  ) {
    return undefined;
  }

  return String(value)
    .replace(/[\r\n]+/g, " ")
    .slice(0, maxLength);
}


export function reportClientIssue(
  event,
  error = null
) {
  if (!import.meta.env.DEV) {
    return;
  }

  const metadata = {
    event:
      safeValue(
        event,
        160
      ) || "Client error",
  };

  if (
    error &&
    typeof error === "object"
  ) {
    const name =
      safeValue(error.name);

    const code =
      safeValue(error.code);

    const status =
      safeValue(error.status);

    if (name) {
      metadata.name = name;
    }

    if (code) {
      metadata.code = code;
    }

    if (status) {
      metadata.status =
        status;
    }
  }

  console.error(
    "[AddyVenture]",
    metadata
  );
}
