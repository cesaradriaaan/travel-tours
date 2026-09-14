import { supabase } from "../lib/supabaseClient";

const API_URL =
  import.meta.env.VITE_API_URL;


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

  return response.json();
}


async function authenticatedFetch(
  url,
  options = {}
) {
  const accessToken =
    await getAccessToken();

  return fetch(
    url,
    {
      ...options,

      headers: {
        ...(options.headers ||
          {}),

        Authorization:
          `Bearer ${accessToken}`,
      },
    }
  );
}


// =====================================================
// HEALTH
// =====================================================

export async function checkBackendHealth() {
  const response =
    await fetch(
      `${API_URL}/api/health`
    );

  const data =
    await readJsonResponse(
      response
    );

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Backend connection failed"
    );
  }

  return data;
}


// =====================================================
// CLIENT — BOOKINGS
// =====================================================

export async function createBooking(
  bookingData
) {
  const response =
    await authenticatedFetch(
      `${API_URL}/api/bookings`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify(
            bookingData
          ),
      }
    );

  const data =
    await readJsonResponse(
      response
    );

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Booking request failed"
    );
  }

  return data;
}


export async function getMyBookings() {
  const response =
    await authenticatedFetch(
      `${API_URL}/api/my-bookings`
    );

  const data =
    await readJsonResponse(
      response
    );

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to load your bookings"
    );
  }

  return data;
}


export async function getMyBookingById(
  id
) {
  const response =
    await authenticatedFetch(
      `${API_URL}/api/my-bookings/${id}`
    );

  const data =
    await readJsonResponse(
      response
    );

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to load your booking"
    );
  }

  return data;
}


export async function requestBookingCancellation(
  id,
  reason = ""
) {
  const response =
    await authenticatedFetch(
      `${API_URL}/api/my-bookings/${id}/cancellation-request`,
      {
        method: "POST",

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

  const data =
    await readJsonResponse(
      response
    );

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to request cancellation"
    );
  }

  return data;
}


// =====================================================
// CLIENT — VOUCHERS
// =====================================================

export async function getMyVouchers() {
  const response =
    await authenticatedFetch(
      `${API_URL}/api/my-vouchers`
    );

  const data =
    await readJsonResponse(
      response
    );

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to load your vouchers"
    );
  }

  return data;
}


export async function redeemVoucher(
  code
) {
  const response =
    await authenticatedFetch(
      `${API_URL}/api/redeem-voucher`,
      {
        method: "POST",

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

  const data =
    await readJsonResponse(
      response
    );

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to redeem voucher"
    );
  }

  return data;
}


// =====================================================
// ADMIN — BOOKINGS
// =====================================================

export async function getBookings() {
  const response =
    await authenticatedFetch(
      `${API_URL}/api/bookings`
    );

  const data =
    await readJsonResponse(
      response
    );

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to load bookings"
    );
  }

  return data;
}


export async function getBookingById(
  id
) {
  const response =
    await authenticatedFetch(
      `${API_URL}/api/bookings/${id}`
    );

  const data =
    await readJsonResponse(
      response
    );

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to load booking"
    );
  }

  return data;
}


export async function updateBookingStatus(
  id,
  status
) {
  const response =
    await authenticatedFetch(
      `${API_URL}/api/bookings/${id}`,
      {
        method: "PATCH",

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

  const data =
    await readJsonResponse(
      response
    );

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to update booking"
    );
  }

  return data;
}


export async function resolveBookingCancellation(
  id,
  decision
) {
  const response =
    await authenticatedFetch(
      `${API_URL}/api/bookings/${id}/cancellation-resolution`,
      {
        method: "POST",

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

  const data =
    await readJsonResponse(
      response
    );

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to resolve cancellation request"
    );
  }

  return data;
}


// =====================================================
// PUBLIC — CONTACT
// =====================================================

export async function sendContactMessage(
  contactData
) {
  const response =
    await fetch(
      `${API_URL}/api/contact`,
      {
        method: "POST",

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

  const data =
    await readJsonResponse(
      response
    );

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to send message"
    );
  }

  return data;
}


// =====================================================
// ADMIN — CONTACT MESSAGES
// =====================================================

export async function getContactMessages() {
  const response =
    await authenticatedFetch(
      `${API_URL}/api/contact-messages`
    );

  const data =
    await readJsonResponse(
      response
    );

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to load contact messages"
    );
  }

  return data;
}


export async function getContactMessageById(
  id
) {
  const response =
    await authenticatedFetch(
      `${API_URL}/api/contact-messages/${id}`
    );

  const data =
    await readJsonResponse(
      response
    );

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to load contact message"
    );
  }

  return data;
}


export async function updateContactMessageStatus(
  id,
  status
) {
  const response =
    await authenticatedFetch(
      `${API_URL}/api/contact-messages/${id}`,
      {
        method: "PATCH",

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

  const data =
    await readJsonResponse(
      response
    );

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to update message"
    );
  }

  return data;
}


export async function sendContactReply(
  id,
  replyMessage
) {
  const response =
    await authenticatedFetch(
      `${API_URL}/api/contact-messages/${id}/reply`,
      {
        method: "POST",

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

  const data =
    await readJsonResponse(
      response
    );

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to send reply"
    );
  }

  return data;
}