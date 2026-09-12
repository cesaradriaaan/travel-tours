const API_URL = import.meta.env.VITE_API_URL;

// Check if backend is running
export async function checkBackendHealth() {
  const response = await fetch(`${API_URL}/api/health`);

  if (!response.ok) {
    throw new Error("Backend connection failed");
  }

  return response.json();
}

// Send a booking request to the backend
export async function createBooking(bookingData) {
  const response = await fetch(`${API_URL}/api/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bookingData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Booking request failed");
  }

  return data;
}