const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
require("dotenv").config();

const supabase = require("./supabase");

const app = express();

app.use(cors());
app.use(express.json());

// Convert Supabase booking columns to frontend-friendly names
function formatBooking(booking) {
  return {
    id: booking.id,
    bookingReference: booking.booking_reference,

    travelerName: booking.traveler_name,
    email: booking.email,
    phone: booking.phone,
    nationality: booking.nationality,

    travelDate: booking.travel_date,
    travelEndDate: booking.travel_end_date,

    tripDays: booking.trip_days,
    tripNights: booking.trip_nights,

    pricePerTraveler: booking.price_per_traveler,
    travelerCount: booking.traveler_count,
    estimatedTotal: booking.estimated_total,

    status: booking.status,

    traveler: booking.traveler,
    tripPlan: booking.trip_plan,

    createdAt: booking.created_at,
  };
}

// Convert Supabase contact columns to frontend-friendly names
function formatContactMessage(contact) {
  return {
    id: contact.id,
    name: contact.name,
    email: contact.email,
    subject: contact.subject,
    message: contact.message,
    status: contact.status,
    createdAt: contact.created_at,
  };
}

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

// HEALTH CHECK
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "AddyVenture backend is running!",
  });
});

// READ ALL BOOKINGS
app.get("/api/bookings", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to retrieve bookings.",
      });
    }

    const bookings = data.map(formatBooking);

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get bookings error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong while retrieving bookings.",
    });
  }
});

// READ ONE BOOKING
app.get("/api/bookings/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    res.status(200).json({
      success: true,
      booking: formatBooking(data),
    });
  } catch (error) {
    console.error("Get booking error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve booking.",
    });
  }
});

// CREATE BOOKING
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

// UPDATE BOOKING STATUS
app.patch("/api/bookings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "Request Received",
      "Reviewing",
      "Confirmed",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status.",
      });
    }

    const { data, error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to update booking.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking status updated!",
      booking: formatBooking(data),
    });
  } catch (error) {
    console.error("Update booking error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong while updating booking.",
    });
  }
});

// CREATE CONTACT MESSAGE
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, subject, and message are required.",
      });
    }

    const { data, error } = await supabase
      .from("contact_messages")
      .insert([
        {
          name,
          email,
          subject,
          message,
          status: "Unread",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Contact message error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to send message.",
      });
    }

    res.status(201).json({
      success: true,
      message: "Message sent successfully!",
      contact: formatContactMessage(data),
    });
  } catch (error) {
    console.error("Contact error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong while sending the message.",
    });
  }
});

// READ ALL CONTACT MESSAGES
app.get("/api/contact-messages", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Get contact messages error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to retrieve contact messages.",
      });
    }

    const messages = data.map(formatContactMessage);

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error("Get contact messages error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong while retrieving messages.",
    });
  }
});

// READ ONE CONTACT MESSAGE
app.get("/api/contact-messages/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: formatContactMessage(data),
    });
  } catch (error) {
    console.error("Get contact message error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve contact message.",
    });
  }
});

// UPDATE CONTACT MESSAGE STATUS
app.patch("/api/contact-messages/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["Unread", "Read", "Replied"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message status.",
      });
    }

    const { data, error } = await supabase
      .from("contact_messages")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Update contact message error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to update message status.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Message status updated!",
      contact: formatContactMessage(data),
    });
  } catch (error) {
    console.error("Update contact message error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong while updating message.",
    });
  }
});

// START SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`AddyVenture API running on http://localhost:${PORT}`);
});