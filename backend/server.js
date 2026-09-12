const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
require("dotenv").config();

const supabase = require("./supabase");

const app = express();

app.use(cors());
app.use(express.json());

// Generate booking reference
function generateBookingReference() {
  const now = new Date();

  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const randomBytes = crypto.randomBytes(4);

  const suffix = Array.from(randomBytes)
    .map((byte) => alphabet[byte % alphabet.length])
    .join("");

  return `ADV-${year}${month}${day}-${suffix}`;
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "AddyVenture backend is running!",
  });
});

// Create booking
app.post("/api/bookings", async (req, res) => {
  try {
    const bookingData = req.body;

    if (
      !bookingData.travelerName ||
      !bookingData.email ||
      !bookingData.phone ||
      !bookingData.travelDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Traveler name, email, phone, and travel date are required.",
      });
    }

    const bookingReference = generateBookingReference();

    const { data, error } = await supabase
      .from("bookings")
      .insert([
        {
          booking_reference: bookingReference,
          traveler_name: bookingData.travelerName,
          email: bookingData.email,
          phone: bookingData.phone,
          nationality: bookingData.nationality || null,

          travel_date: bookingData.travelDate,
          travel_end_date: bookingData.travelEndDate || null,

          trip_days: bookingData.tripDays,
          trip_nights: bookingData.tripNights,

          price_per_traveler: bookingData.pricePerTraveler,
          traveler_count: bookingData.travelerCount,
          estimated_total: bookingData.estimatedTotal,

          status: "Request Received",

          traveler: bookingData.traveler,
          trip_plan: bookingData.tripPlan,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to save booking.",
      });
    }

    res.status(201).json({
      success: true,
      message: "Booking request received!",
      booking: {
        id: data.id,
        bookingReference: data.booking_reference,
        status: data.status,
        createdAt: data.created_at,
      },
    });
  } catch (error) {
    console.error("Booking error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong while creating the booking.",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`AddyVenture API running on http://localhost:${PORT}`);
});