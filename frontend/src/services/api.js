import { supabase } from "../lib/supabaseClient";

const API_URL =
  import.meta.env.VITE_API_URL;

const DEFAULT_API_TIMEOUT_MS =
  20000;

const MUTATION_API_TIMEOUT_MS =
  30000;

const EMAIL_API_TIMEOUT_MS =
  45000;

const BOOKING_REQUEST_STORAGE_KEY =
  "addyventure.pendingBookingRequest";

const inFlightBookingRequests =
  new Map();

let memoryBookingRequest =
  null;


// =====================================================
// AUTH
// =====================================================

async function getAccessToken() {
  const {
    data: { session },
  } =
    await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error(
      "Please log in to continue."
    );
  }

  return session.access_token;
}


// =====================================================
// RESPONSE HELPER
// =====================================================

async function readJsonResponse(
  response
) {
  const contentType =
    response.headers.get(
      "content-type"
    ) || "";

  if (
    !contentType.includes(
      "application/json"
    )
  ) {
    const text =
      await response.text();

    console.error(
      "Unexpected API response:",
      text.slice(
        0,
        300
      )
    );

    throw new Error(
      "The server returned an unexpected response."
    );
  }

  try {
    return await response.json();
  } catch (error) {
    console.error(
      "Invalid API JSON response:",
      error
    );

    throw new Error(
      "The server returned invalid data."
    );
  }
}


function createApiError(
  response,
  data,
  fallbackMessage
) {
  const statusMessages = {
    400:
      "The request could not be processed.",

    401:
      "Your session has expired. Please log in again.",

    403:
      "You do not have permission to perform this action.",

    404:
      "The requested information could not be found.",

    409:
      "This action conflicts with the latest saved data. Please refresh and try again.",

    429:
      "Too many requests. Please wait before trying again.",

    500:
      "The server encountered an error. Please try again later.",
  };

  const message =
    typeof data?.message ===
      "string" &&
    data.message.trim()
      ? data.message
      : statusMessages[
          response.status
        ] ||
        fallbackMessage;

  const error =
    new Error(message);

  error.status =
    response.status;

  error.code =
    `HTTP_${response.status}`;

  return error;
}


async function fetchJsonWithTimeout(
  url,
  options,
  timeoutMs
) {
  const controller =
    new AbortController();

  const externalSignal =
    options.signal;

  let timedOut =
    false;

  const forwardAbort =
    () => {
      controller.abort();
    };

  if (
    externalSignal
      ?.aborted
  ) {
    controller.abort();
  } else {
    externalSignal?.addEventListener(
      "abort",
      forwardAbort,
      { once: true }
    );
  }

  const timeoutId =
    setTimeout(
      () => {
        timedOut =
          true;

        controller.abort();
      },
      timeoutMs
    );

  try {
    const response =
      await fetch(
        url,
        {
          ...options,
          signal:
            controller.signal,
        }
      );

    const data =
      await readJsonResponse(
        response
      );

    return {
      response,
      data,
    };
  } catch (error) {
    if (timedOut) {
      const timeoutError =
        new Error(
          "The request timed out."
        );

      timeoutError.name =
        "TimeoutError";

      throw timeoutError;
    }

    throw error;
  } finally {
    clearTimeout(
      timeoutId
    );

    externalSignal?.removeEventListener(
      "abort",
      forwardAbort
    );
  }
}


async function apiRequest(
  path,
  options = {}
) {
  const {
    authenticated =
      false,

    timeoutMs =
      DEFAULT_API_TIMEOUT_MS,

    fallbackMessage =
      "The request failed.",

    headers = {},

    ...fetchOptions
  } = options;

  const requestHeaders = {
    ...headers,
  };

  if (authenticated) {
    const accessToken =
      await getAccessToken();

    requestHeaders.Authorization =
      `Bearer ${accessToken}`;
  }

  const method =
    (
      fetchOptions.method ||
      "GET"
    ).toUpperCase();

  const isMutation =
    ![
      "GET",
      "HEAD",
    ].includes(method);

  try {
    const {
      response,
      data,
    } =
      await fetchJsonWithTimeout(
        `${API_URL}${path}`,
        {
          ...fetchOptions,
          headers:
            requestHeaders,
        },
        timeoutMs
      );

    if (!response.ok) {
      throw createApiError(
        response,
        data,
        fallbackMessage
      );
    }

    return data;
  } catch (error) {
    if (
      error.name ===
      "TimeoutError"
    ) {
      throw new Error(
        isMutation
          ? "The server took too long to respond. Check whether the action completed before trying again."
          : "The request took too long. Please try again."
      );
    }

    if (
      error.name ===
      "AbortError"
    ) {
      throw new Error(
        "The request was cancelled."
      );
    }

    if (
      error instanceof
        TypeError
    ) {
      throw new Error(
        isMutation
          ? "The connection was interrupted. Check whether the action completed before trying again."
          : "Unable to connect to the server. Check your internet connection and try again."
      );
    }

    throw error;
  }
}


// =====================================================
// BOOKING IDEMPOTENCY
// =====================================================

function serializeBookingData(
  bookingData
) {
  return JSON.stringify(
    bookingData,
    (key, value) => {
      if (
        value &&
        typeof value ===
          "object" &&
        !Array.isArray(value)
      ) {
        return Object.keys(
          value
        )
          .sort()
          .reduce(
            (
              sorted,
              currentKey
            ) => {
              sorted[
                currentKey
              ] =
                value[
                  currentKey
                ];

              return sorted;
            },
            {}
          );
      }

      return value;
    }
  );
}


async function createBookingSignature(
  bookingData
) {
  const serialized =
    serializeBookingData(
      bookingData
    );

  if (
    globalThis.crypto
      ?.subtle &&
    typeof TextEncoder !==
      "undefined"
  ) {
    const digest =
      await globalThis.crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(
          serialized
        )
      );

    return Array.from(
      new Uint8Array(
        digest
      )
    )
      .map((byte) =>
        byte
          .toString(16)
          .padStart(2, "0")
      )
      .join("");
  }

  let hash =
    2166136261;

  for (
    let index = 0;
    index <
    serialized.length;
    index += 1
  ) {
    hash ^=
      serialized.charCodeAt(
        index
      );

    hash =
      Math.imul(
        hash,
        16777619
      );
  }

  return `${serialized.length}-${(
    hash >>> 0
  ).toString(16)}`;
}


function createIdempotencyKey() {
  if (
    globalThis.crypto
      ?.randomUUID
  ) {
    return globalThis.crypto.randomUUID();
  }

  return [
    "booking",
    Date.now().toString(36),
    Math.random()
      .toString(36)
      .slice(2),
    Math.random()
      .toString(36)
      .slice(2),
  ].join("-");
}


function isValidIdempotencyKey(
  value
) {
  return (
    typeof value ===
      "string" &&
    value.length >= 16 &&
    value.length <= 128 &&
    /^[A-Za-z0-9._:-]+$/.test(
      value
    )
  );
}


function readPendingBookingRequest() {
  try {
    const storedValue =
      sessionStorage.getItem(
        BOOKING_REQUEST_STORAGE_KEY
      );

    if (!storedValue) {
      return memoryBookingRequest;
    }

    const parsedValue =
      JSON.parse(
        storedValue
      );

    if (
      typeof parsedValue
        ?.signature ===
        "string" &&
      isValidIdempotencyKey(
        parsedValue
          ?.idempotencyKey
      )
    ) {
      memoryBookingRequest =
        parsedValue;

      return parsedValue;
    }

    sessionStorage.removeItem(
      BOOKING_REQUEST_STORAGE_KEY
    );
  } catch (error) {
    console.warn(
      "Unable to read the pending booking request:",
      error
    );
  }

  return memoryBookingRequest;
}


function savePendingBookingRequest(
  request
) {
  memoryBookingRequest =
    request;

  try {
    sessionStorage.setItem(
      BOOKING_REQUEST_STORAGE_KEY,
      JSON.stringify(request)
    );
  } catch (error) {
    console.warn(
      "Unable to save the pending booking request:",
      error
    );
  }
}


function clearPendingBookingRequest(
  signature,
  idempotencyKey
) {
  const pendingRequest =
    readPendingBookingRequest();

  if (
    pendingRequest
      ?.signature !==
      signature ||
    pendingRequest
      ?.idempotencyKey !==
      idempotencyKey
  ) {
    return;
  }

  memoryBookingRequest =
    null;

  try {
    sessionStorage.removeItem(
      BOOKING_REQUEST_STORAGE_KEY
    );
  } catch (error) {
    console.warn(
      "Unable to clear the pending booking request:",
      error
    );
  }
}


async function getBookingRequest(
  bookingData
) {
  const signature =
    await createBookingSignature(
      bookingData
    );

  const pendingRequest =
    readPendingBookingRequest();

  if (
    pendingRequest
      ?.signature ===
      signature
  ) {
    return pendingRequest;
  }

  const request = {
    signature,
    idempotencyKey:
      createIdempotencyKey(),
  };

  savePendingBookingRequest(
    request
  );

  return request;
}


// =====================================================
// AUTH
// =====================================================

export async function loginWithPassword(
  email,
  password,
  options = {}
) {
  return apiRequest(
    "/api/login",
    {
      method: "POST",

      timeoutMs:
        MUTATION_API_TIMEOUT_MS,

      fallbackMessage:
        "Unable to log in.",

      signal:
        options.signal,

      headers: {
        "Content-Type":
          "application/json",
      },

      body:
        JSON.stringify({
          email,
          password,
        }),
    }
  );
}


// =====================================================
// CLIENT — BOOKINGS
// =====================================================

export async function createBooking(
  bookingData
) {
  const {
    signature,
    idempotencyKey,
  } =
    await getBookingRequest(
      bookingData
    );

  const inFlightRequest =
    inFlightBookingRequests.get(
      signature
    );

  if (inFlightRequest) {
    return inFlightRequest;
  }

  const request =
    (async () => {
      const data =
        await apiRequest(
          "/api/bookings",
          {
            authenticated:
              true,

            method: "POST",

            timeoutMs:
              MUTATION_API_TIMEOUT_MS,

            fallbackMessage:
              "Booking request failed",

            headers: {
              "Content-Type":
                "application/json",

              "Idempotency-Key":
                idempotencyKey,
            },

            body:
              JSON.stringify(
                bookingData
              ),
          }
        );

      clearPendingBookingRequest(
        signature,
        idempotencyKey
      );

      return data;
    })();

  inFlightBookingRequests.set(
    signature,
    request
  );

  try {
    return await request;
  } finally {
    if (
      inFlightBookingRequests.get(
        signature
      ) === request
    ) {
      inFlightBookingRequests.delete(
        signature
      );
    }
  }
}


export async function getMyBookings(
  options = {}
) {
  return apiRequest(
    "/api/my-bookings",
    {
      authenticated:
        true,

      fallbackMessage:
        "Unable to load your bookings",

      signal:
        options.signal,
    }
  );
}


export async function getMyBookingById(
  id,
  options = {}
) {
  return apiRequest(
    `/api/my-bookings/${id}`,
    {
      authenticated:
        true,

      fallbackMessage:
        "Unable to load your booking",

      signal:
        options.signal,
    }
  );
}


export async function requestBookingCancellation(
  id,
  reason = "",
  options = {}
) {
  return apiRequest(
    `/api/my-bookings/${id}/cancellation-request`,
    {
      authenticated:
        true,

      method: "POST",

      timeoutMs:
        MUTATION_API_TIMEOUT_MS,

      fallbackMessage:
        "Unable to request cancellation",

      signal:
        options.signal,

      headers: {
        "Content-Type":
          "application/json",
      },

      body:
        JSON.stringify({
          reason,
        }),
    }
  );
}


// =====================================================
// CLIENT — VOUCHERS
// =====================================================

export async function getMyVouchers(
  options = {}
) {
  return apiRequest(
    "/api/my-vouchers",
    {
      authenticated:
        true,

      fallbackMessage:
        "Unable to load your vouchers",

      signal:
        options.signal,
    }
  );
}


export async function redeemVoucher(
  code,
  options = {}
) {
  return apiRequest(
    "/api/redeem-voucher",
    {
      authenticated:
        true,

      method: "POST",

      timeoutMs:
        MUTATION_API_TIMEOUT_MS,

      fallbackMessage:
        "Unable to redeem voucher",

      signal:
        options.signal,

      headers: {
        "Content-Type":
          "application/json",
      },

      body:
        JSON.stringify({
          code,
        }),
    }
  );
}


// =====================================================
// ADMIN — BOOKINGS
// =====================================================

export async function getBookings(
  options = {}
) {
  return apiRequest(
    "/api/bookings",
    {
      authenticated:
        true,

      fallbackMessage:
        "Unable to load bookings",

      signal:
        options.signal,
    }
  );
}


export async function getBookingById(
  id,
  options = {}
) {
  return apiRequest(
    `/api/bookings/${id}`,
    {
      authenticated:
        true,

      fallbackMessage:
        "Unable to load booking",

      signal:
        options.signal,
    }
  );
}


export async function updateBookingStatus(
  id,
  status,
  options = {}
) {
  return apiRequest(
    `/api/bookings/${id}`,
    {
      authenticated:
        true,

      method: "PATCH",

      timeoutMs:
        MUTATION_API_TIMEOUT_MS,

      fallbackMessage:
        "Unable to update booking",

      signal:
        options.signal,

      headers: {
        "Content-Type":
          "application/json",
      },

      body:
        JSON.stringify({
          status,
        }),
    }
  );
}


export async function resolveBookingCancellation(
  id,
  decision,
  options = {}
) {
  return apiRequest(
    `/api/bookings/${id}/cancellation-resolution`,
    {
      authenticated:
        true,

      method: "POST",

      timeoutMs:
        MUTATION_API_TIMEOUT_MS,

      fallbackMessage:
        "Unable to resolve cancellation request",

      signal:
        options.signal,

      headers: {
        "Content-Type":
          "application/json",
      },

      body:
        JSON.stringify({
          decision,
        }),
    }
  );
}


// =====================================================
// PUBLIC — CONTACT
// =====================================================

export async function sendContactMessage(
  contactData,
  options = {}
) {
  return apiRequest(
    "/api/contact",
    {
      method: "POST",

      timeoutMs:
        MUTATION_API_TIMEOUT_MS,

      fallbackMessage:
        "Unable to send message",

      signal:
        options.signal,

      headers: {
        "Content-Type":
          "application/json",
      },

      body:
        JSON.stringify(
          contactData
        ),
    }
  );
}


// =====================================================
// ADMIN — CONTACT MESSAGES
// =====================================================

export async function getContactMessages(
  options = {}
) {
  return apiRequest(
    "/api/contact-messages",
    {
      authenticated:
        true,

      fallbackMessage:
        "Unable to load contact messages",

      signal:
        options.signal,
    }
  );
}


export async function getContactMessageById(
  id,
  options = {}
) {
  return apiRequest(
    `/api/contact-messages/${id}`,
    {
      authenticated:
        true,

      fallbackMessage:
        "Unable to load contact message",

      signal:
        options.signal,
    }
  );
}


export async function updateContactMessageStatus(
  id,
  status,
  options = {}
) {
  return apiRequest(
    `/api/contact-messages/${id}`,
    {
      authenticated:
        true,

      method: "PATCH",

      timeoutMs:
        MUTATION_API_TIMEOUT_MS,

      fallbackMessage:
        "Unable to update message",

      signal:
        options.signal,

      headers: {
        "Content-Type":
          "application/json",
      },

      body:
        JSON.stringify({
          status,
        }),
    }
  );
}


export async function sendContactReply(
  id,
  replyMessage,
  options = {}
) {
  return apiRequest(
    `/api/contact-messages/${id}/reply`,
    {
      authenticated:
        true,

      method: "POST",

      timeoutMs:
        EMAIL_API_TIMEOUT_MS,

      fallbackMessage:
        "Unable to send reply",

      signal:
        options.signal,

      headers: {
        "Content-Type":
          "application/json",
      },

      body:
        JSON.stringify({
          replyMessage,
        }),
    }
  );
}
