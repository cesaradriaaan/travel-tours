import { supabase } from "../lib/supabaseClient";

const API_URL =
  import.meta.env.VITE_API_URL;


// Get current user's access token
async function getAccessToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error(
      "Please log in to continue."
    );
  }

  return session.access_token;
}


// Check backend
export async function checkBackendHealth() {
  const response = await fetch(
    `${API_URL}/api/health`
  );

  if (!response.ok) {
    throw new Error(
      "Backend connection failed"
    );
  }

  return response.json();
}


// Create booking
export async function createBooking(
  bookingData
) {
  const accessToken =
    await getAccessToken();

  const response = await fetch(
    `${API_URL}/api/bookings`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",

        Authorization:
          `Bearer ${accessToken}`,
      },

      body: JSON.stringify(
        bookingData
      ),
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Booking request failed"
    );
  }

  return data;
}


// Get logged-in user's vouchers
export async function getMyVouchers() {
  const accessToken =
    await getAccessToken();

  const response = await fetch(
    `${API_URL}/api/my-vouchers`,
    {
      headers: {
        Authorization:
          `Bearer ${accessToken}`,
      },
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to load your vouchers"
    );
  }

  return data;
}


// Get logged-in user's bookings
export async function getMyBookings() {
  const accessToken =
    await getAccessToken();

  const response = await fetch(
    `${API_URL}/api/my-bookings`,
    {
      headers: {
        Authorization:
          `Bearer ${accessToken}`,
      },
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to load your bookings"
    );
  }

  return data;
}


// Get one logged-in user's booking
export async function getMyBookingById(
  id
) {
  const accessToken =
    await getAccessToken();

  const response = await fetch(
    `${API_URL}/api/my-bookings/${id}`,
    {
      headers: {
        Authorization:
          `Bearer ${accessToken}`,
      },
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to load your booking"
    );
  }

  return data;
}


// Request cancellation for user's own booking
export async function requestBookingCancellation(
  id,
  reason = ""
) {
  const accessToken =
    await getAccessToken();

  const response = await fetch(
    `${API_URL}/api/my-bookings/${id}/cancellation-request`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",

        Authorization:
          `Bearer ${accessToken}`,
      },

      body: JSON.stringify({
        reason,
      }),
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to request cancellation"
    );
  }

  return data;
}


// Get all bookings
export async function getBookings() {
  const response = await fetch(
    `${API_URL}/api/bookings`
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to load bookings"
    );
  }

  return data;
}


// Get one booking
export async function getBookingById(
  id
) {
  const response = await fetch(
    `${API_URL}/api/bookings/${id}`
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to load booking"
    );
  }

  return data;
}


// Update booking status
export async function updateBookingStatus(
  id,
  status
) {
  const response = await fetch(
    `${API_URL}/api/bookings/${id}`,
    {
      method: "PATCH",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        status,
      }),
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to update booking"
    );
  }

  return data;
}


// Admin approve/reject cancellation request
export async function resolveBookingCancellation(
  id,
  decision
) {
  const accessToken =
    await getAccessToken();

  const response = await fetch(
    `${API_URL}/api/bookings/${id}/cancellation-resolution`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",

        Authorization:
          `Bearer ${accessToken}`,
      },

      body: JSON.stringify({
        decision,
      }),
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to resolve cancellation request"
    );
  }

  return data;
}


// Send contact message
export async function sendContactMessage(
  contactData
) {
  const response = await fetch(
    `${API_URL}/api/contact`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify(
        contactData
      ),
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to send message"
    );
  }

  return data;
}


// Get all contact messages
export async function getContactMessages() {
  const response = await fetch(
    `${API_URL}/api/contact-messages`
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to load contact messages"
    );
  }

  return data;
}


// Get one contact message + reply history
export async function getContactMessageById(
  id
) {
  const response = await fetch(
    `${API_URL}/api/contact-messages/${id}`
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to load contact message"
    );
  }

  return data;
}


// Update contact message status
export async function updateContactMessageStatus(
  id,
  status
) {
  const response = await fetch(
    `${API_URL}/api/contact-messages/${id}`,
    {
      method: "PATCH",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        status,
      }),
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to update message"
    );
  }

  return data;
}


// Send admin reply to customer
export async function sendContactReply(
  id,
  replyMessage
) {
  const response = await fetch(
    `${API_URL}/api/contact-messages/${id}/reply`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        replyMessage,
      }),
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to send reply"
    );
  }

  return data;
}