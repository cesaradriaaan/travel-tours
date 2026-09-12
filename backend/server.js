const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Temporary storage
// Later ilisan nato ni ug real database.
const bookings = [];

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "AddyVenture backend is running!",
  });
});

// Create booking
app.post("/api/bookings", (req, res) => {
  const bookingData = req.body;

  if (!bookingData.travelerName || !bookingData.email) {
    return res.status(400).json({
      success: false,
      message: "Traveler name and email are required.",
    });
  }

  const bookingReference =
    "ADV-" +
    Date.now().toString().slice(-6) +
    "-" +
    Math.random().toString(36).substring(2, 6).toUpperCase();

  const newBooking = {
    id: bookings.length + 1,
    bookingReference,
    ...bookingData,
    status: "Request Received",
    createdAt: new Date().toISOString(),
  };

  bookings.push(newBooking);

  res.status(201).json({
    success: true,
    message: "Booking request received!",
    booking: newBooking,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`AddyVenture API running on http://localhost:${PORT}`);
});