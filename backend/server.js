const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const { Resend } = require("resend");
require("dotenv").config();

const supabase = require("./supabase");

const app = express();

const resend = new Resend(
  process.env.RESEND_API_KEY
);

app.use(cors());
app.use(express.json());


// =====================================================
// AUTH
// =====================================================

async function requireAuth(
  req,
  res,
  next
) {
  try {
    const authHeader =
      req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith(
        "Bearer "
      )
    ) {
      return res
        .status(401)
        .json({
          success: false,
          message:
            "Authentication required.",
        });
    }

    const accessToken =
      authHeader.replace(
        "Bearer ",
        ""
      );

    const {
      data: { user },
      error,
    } =
      await supabase.auth.getUser(
        accessToken
      );

    if (error || !user) {
      return res
        .status(401)
        .json({
          success: false,
          message:
            "Your session is invalid or has expired. Please log in again.",
        });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error(
      "Authentication error:",
      error
    );

    return res
      .status(401)
      .json({
        success: false,
        message:
          "Unable to verify authentication.",
      });
  }
}


async function requireAdmin(
  req,
  res,
  next
) {
  try {
    const authHeader =
      req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith(
        "Bearer "
      )
    ) {
      return res
        .status(401)
        .json({
          success: false,
          message:
            "Authentication required.",
        });
    }

    const accessToken =
      authHeader.replace(
        "Bearer ",
        ""
      );

    const {
      data: { user },
      error: authError,
    } =
      await supabase.auth.getUser(
        accessToken
      );

    if (
      authError ||
      !user
    ) {
      return res
        .status(401)
        .json({
          success: false,
          message:
            "Your session is invalid or has expired. Please log in again.",
        });
    }

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select(
        "id, role"
      )
      .eq(
        "id",
        user.id
      )
      .single();

    if (
      profileError ||
      !profile ||
      profile.role !== "admin"
    ) {
      return res
        .status(403)
        .json({
          success: false,
          message:
            "Administrator access is required.",
        });
    }

    req.user = user;
    req.profile = profile;

    next();
  } catch (error) {
    console.error(
      "Admin authentication error:",
      error
    );

    return res
      .status(403)
      .json({
        success: false,
        message:
          "Unable to verify administrator access.",
      });
  }
}


// =====================================================
// FORMATTERS
// =====================================================

function formatBooking(
  booking
) {
  return {
    id:
      booking.id,

    userId:
      booking.user_id,

    bookingReference:
      booking.booking_reference,

    travelerName:
      booking.traveler_name,

    email:
      booking.email,

    phone:
      booking.phone,

    nationality:
      booking.nationality,

    travelDate:
      booking.travel_date,

    travelEndDate:
      booking.travel_end_date,

    tripDays:
      booking.trip_days,

    tripNights:
      booking.trip_nights,

    pricePerTraveler:
      booking.price_per_traveler,

    travelerCount:
      booking.traveler_count,

    subtotal:
      booking.subtotal,

    discountAmount:
      booking.discount_amount ||
      0,

    estimatedTotal:
      booking.estimated_total,

    voucherId:
      booking.voucher_id,

    voucherCode:
      booking.voucher_code,

    status:
      booking.status,

    cancellationRequestedAt:
      booking.cancellation_requested_at,

    cancellationReason:
      booking.cancellation_reason,

    statusBeforeCancellation:
      booking.status_before_cancellation,

    cancellationResolvedAt:
      booking.cancellation_resolved_at,

    cancellationResolution:
      booking.cancellation_resolution,

    traveler:
      booking.traveler,

    tripPlan:
      booking.trip_plan,

    createdAt:
      booking.created_at,
  };
}


function formatContactMessage(
  contact
) {
  return {
    id:
      contact.id,

    name:
      contact.name,

    email:
      contact.email,

    subject:
      contact.subject,

    message:
      contact.message,

    status:
      contact.status,

    createdAt:
      contact.created_at,
  };
}


function formatContactReply(
  reply
) {
  return {
    id:
      reply.id,

    contactMessageId:
      reply.contact_message_id,

    replyMessage:
      reply.reply_message,

    sentTo:
      reply.sent_to,

    providerMessageId:
      reply.provider_message_id,

    createdAt:
      reply.created_at,
  };
}


function formatUserVoucher(
  row
) {
  const voucher =
    row.voucher;

  return {
    id:
      row.id,

    status:
      row.status,

    claimedAt:
      row.claimed_at,

    usedAt:
      row.used_at,

    voucher:
      voucher
        ? {
            id:
              voucher.id,

            code:
              voucher.code,

            title:
              voucher.title,

            description:
              voucher.description,

            discountType:
              voucher.discount_type,

            discountValue:
              Number(
                voucher.discount_value
              ),

            minimumSpend:
              Number(
                voucher.minimum_spend ||
                  0
              ),

            maximumDiscount:
              voucher.maximum_discount ===
              null
                ? null
                : Number(
                    voucher.maximum_discount
                  ),

            validFrom:
              voucher.valid_from,

            validUntil:
              voucher.valid_until,

            active:
              voucher.active,
          }
        : null,
  };
}


// =====================================================
// HELPERS
// =====================================================

function generateBookingReference() {
  const now =
    new Date();

  const year =
    String(
      now.getFullYear()
    ).slice(-2);

  const month =
    String(
      now.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      now.getDate()
    ).padStart(
      2,
      "0"
    );

  const alphabet =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  const randomBytes =
    crypto.randomBytes(4);

  const suffix =
    Array.from(
      randomBytes
    )
      .map(
        (byte) =>
          alphabet[
            byte %
              alphabet.length
          ]
      )
      .join("");

  return `ADV-${year}${month}${day}-${suffix}`;
}


function calculateVoucherDiscount(
  voucher,
  subtotal
) {
  if (!voucher) {
    return 0;
  }

  if (
    Number(subtotal) <
    Number(
      voucher.minimum_spend ||
        0
    )
  ) {
    return 0;
  }

  let discount = 0;

  if (
    voucher.discount_type ===
    "percentage"
  ) {
    discount =
      Number(subtotal) *
      (
        Number(
          voucher.discount_value
        ) / 100
      );

    if (
      voucher.maximum_discount !==
        null &&
      voucher.maximum_discount !==
        undefined
    ) {
      discount =
        Math.min(
          discount,
          Number(
            voucher.maximum_discount
          )
        );
    }
  }

  if (
    voucher.discount_type ===
    "fixed"
  ) {
    discount =
      Number(
        voucher.discount_value
      );
  }

  discount =
    Math.min(
      discount,
      Number(subtotal)
    );

  return Math.max(
    0,
    Math.round(
      discount * 100
    ) / 100
  );
}


// =====================================================
// HEALTH
// =====================================================

app.get(
  "/api/health",
  (req, res) => {
    res.json({
      success: true,
      message:
        "AddyVenture backend is running!",
    });
  }
);


// =====================================================
// ADMIN BOOKING READ ROUTES
// Phase 8 will lock these to admin only.
// =====================================================

app.get(
  "/api/bookings",
  async (
    req,
    res
  ) => {
    try {
      const {
        data,
        error,
      } =
        await supabase
          .from(
            "bookings"
          )
          .select("*")
          .order(
            "created_at",
            {
              ascending:
                false,
            }
          );

      if (error) {
        console.error(
          "Supabase error:",
          error
        );

        return res
          .status(500)
          .json({
            success: false,
            message:
              "Unable to retrieve bookings.",
          });
      }

      return res
        .status(200)
        .json({
          success: true,
          count:
            data.length,
          bookings:
            data.map(
              formatBooking
            ),
        });
    } catch (error) {
      console.error(
        "Get bookings error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Something went wrong while retrieving bookings.",
        });
    }
  }
);


app.get(
  "/api/bookings/:id",
  async (
    req,
    res
  ) => {
    try {
      const { id } =
        req.params;

      const {
        data,
        error,
      } =
        await supabase
          .from(
            "bookings"
          )
          .select("*")
          .eq(
            "id",
            id
          )
          .single();

      if (
        error ||
        !data
      ) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Booking not found.",
          });
      }

      return res
        .status(200)
        .json({
          success: true,
          booking:
            formatBooking(
              data
            ),
        });
    } catch (error) {
      console.error(
        "Get booking error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to retrieve booking.",
        });
    }
  }
);


// =====================================================
// CLIENT VOUCHERS
// =====================================================

app.get(
  "/api/my-vouchers",
  requireAuth,
  async (
    req,
    res
  ) => {
    try {
      const {
        data,
        error,
      } =
        await supabase
          .from(
            "user_vouchers"
          )
          .select(`
            id,
            status,
            claimed_at,
            used_at,
            voucher:vouchers (
              id,
              code,
              title,
              description,
              discount_type,
              discount_value,
              minimum_spend,
              maximum_discount,
              valid_from,
              valid_until,
              active
            )
          `)
          .eq(
            "user_id",
            req.user.id
          )
          .order(
            "claimed_at",
            {
              ascending:
                false,
            }
          );

      if (error) {
        console.error(
          "Get vouchers error:",
          error
        );

        return res
          .status(500)
          .json({
            success: false,
            message:
              "Unable to retrieve your vouchers.",
          });
      }

      const vouchers =
        (
          data || []
        ).map(
          formatUserVoucher
        );

      return res
        .status(200)
        .json({
          success: true,
          count:
            vouchers.length,
          vouchers,
        });
    } catch (error) {
      console.error(
        "Get vouchers error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Something went wrong while retrieving your vouchers.",
        });
    }
  }
);


// =====================================================
// CREATE BOOKING
// =====================================================

app.post(
  "/api/bookings",
  requireAuth,
  async (
    req,
    res
  ) => {
    try {
      const bookingData =
        req.body;

      if (
        !bookingData.travelerName ||
        !bookingData.email ||
        !bookingData.phone ||
        !bookingData.travelDate
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Traveler name, email, phone, and travel date are required.",
          });
      }

      const pricePerTraveler =
        Number(
          bookingData.pricePerTraveler
        );

      const travelerCount =
        Number(
          bookingData.travelerCount
        );

      if (
        !Number.isFinite(
          pricePerTraveler
        ) ||
        pricePerTraveler <
          0 ||
        !Number.isInteger(
          travelerCount
        ) ||
        travelerCount <
          1
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid booking price or traveler count.",
          });
      }

      const subtotal =
        Math.round(
          pricePerTraveler *
            travelerCount *
            100
        ) / 100;

      let selectedVoucher =
        null;

      let userVoucher =
        null;

      let discountAmount =
        0;

      const userVoucherId =
        bookingData.userVoucherId ||
        null;

      if (
        userVoucherId
      ) {
        const {
          data:
            walletVoucher,

          error:
            walletError,
        } =
          await supabase
            .from(
              "user_vouchers"
            )
            .select(`
              id,
              user_id,
              voucher_id,
              status,
              voucher:vouchers (
                id,
                code,
                title,
                description,
                discount_type,
                discount_value,
                minimum_spend,
                maximum_discount,
                valid_from,
                valid_until,
                active
              )
            `)
            .eq(
              "id",
              userVoucherId
            )
            .eq(
              "user_id",
              req.user.id
            )
            .eq(
              "status",
              "available"
            )
            .single();

        if (
          walletError ||
          !walletVoucher ||
          !walletVoucher.voucher
        ) {
          return res
            .status(400)
            .json({
              success: false,
              message:
                "This voucher is unavailable or has already been used.",
            });
        }

        userVoucher =
          walletVoucher;

        selectedVoucher =
          walletVoucher.voucher;

        if (
          !selectedVoucher.active
        ) {
          return res
            .status(400)
            .json({
              success: false,
              message:
                "This voucher is no longer active.",
            });
        }

        const now =
          new Date();

        if (
          selectedVoucher.valid_from &&
          new Date(
            selectedVoucher.valid_from
          ) >
            now
        ) {
          return res
            .status(400)
            .json({
              success: false,
              message:
                "This voucher is not active yet.",
            });
        }

        if (
          selectedVoucher.valid_until &&
          new Date(
            selectedVoucher.valid_until
          ) <
            now
        ) {
          return res
            .status(400)
            .json({
              success: false,
              message:
                "This voucher has expired.",
            });
        }

        const minimumSpend =
          Number(
            selectedVoucher.minimum_spend ||
              0
          );

        if (
          subtotal <
          minimumSpend
        ) {
          return res
            .status(400)
            .json({
              success: false,
              message:
                `This voucher requires a minimum booking subtotal of ₱${minimumSpend.toLocaleString()}.`,
            });
        }

        discountAmount =
          calculateVoucherDiscount(
            selectedVoucher,
            subtotal
          );
      }

      const estimatedTotal =
        Math.max(
          0,
          Math.round(
            (
              subtotal -
              discountAmount
            ) *
              100
          ) / 100
        );

      const bookingReference =
        generateBookingReference();

      const {
        data,
        error,
      } =
        await supabase
          .from(
            "bookings"
          )
          .insert([
            {
              user_id:
                req.user.id,

              booking_reference:
                bookingReference,

              traveler_name:
                bookingData.travelerName,

              email:
                bookingData.email,

              phone:
                bookingData.phone,

              nationality:
                bookingData.nationality ||
                null,

              travel_date:
                bookingData.travelDate,

              travel_end_date:
                bookingData.travelEndDate ||
                null,

              trip_days:
                bookingData.tripDays,

              trip_nights:
                bookingData.tripNights,

              price_per_traveler:
                pricePerTraveler,

              traveler_count:
                travelerCount,

              subtotal,

              discount_amount:
                discountAmount,

              estimated_total:
                estimatedTotal,

              voucher_id:
                selectedVoucher?.id ||
                null,

              voucher_code:
                selectedVoucher?.code ||
                null,

              status:
                "Request Received",

              traveler:
                bookingData.traveler,

              trip_plan:
                bookingData.tripPlan,
            },
          ])
          .select()
          .single();

      if (error) {
        console.error(
          "Supabase booking error:",
          error
        );

        return res
          .status(500)
          .json({
            success: false,
            message:
              "Unable to save booking.",
          });
      }

      if (
        userVoucher &&
        selectedVoucher
      ) {
        const {
          data:
            usedVoucher,

          error:
            voucherUpdateError,
        } =
          await supabase
            .from(
              "user_vouchers"
            )
            .update({
              status:
                "used",

              used_at:
                new Date().toISOString(),

              booking_id:
                data.id,
            })
            .eq(
              "id",
              userVoucher.id
            )
            .eq(
              "user_id",
              req.user.id
            )
            .eq(
              "status",
              "available"
            )
            .select()
            .single();

        if (
          voucherUpdateError ||
          !usedVoucher
        ) {
          console.error(
            "Voucher usage error:",
            voucherUpdateError
          );

          const {
            error:
              rollbackError,
          } =
            await supabase
              .from(
                "bookings"
              )
              .delete()
              .eq(
                "id",
                data.id
              );

          if (
            rollbackError
          ) {
            console.error(
              "Booking rollback error:",
              rollbackError
            );
          }

          return res
            .status(409)
            .json({
              success: false,
              message:
                "The voucher could not be applied. Please try again.",
            });
        }
      }

      return res
        .status(201)
        .json({
          success: true,

          message:
            "Booking request received!",

          booking: {
            id:
              data.id,

            userId:
              data.user_id,

            bookingReference:
              data.booking_reference,

            status:
              data.status,

            subtotal:
              Number(
                data.subtotal
              ),

            discountAmount:
              Number(
                data.discount_amount ||
                  0
              ),

            estimatedTotal:
              Number(
                data.estimated_total
              ),

            voucherId:
              data.voucher_id,

            voucherCode:
              data.voucher_code,

            createdAt:
              data.created_at,
          },
        });
    } catch (error) {
      console.error(
        "Booking error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Something went wrong while creating the booking.",
        });
    }
  }
);


// =====================================================
// MY BOOKINGS
// =====================================================

app.get(
  "/api/my-bookings",
  requireAuth,
  async (
    req,
    res
  ) => {
    try {
      const {
        data,
        error,
      } =
        await supabase
          .from(
            "bookings"
          )
          .select("*")
          .eq(
            "user_id",
            req.user.id
          )
          .order(
            "created_at",
            {
              ascending:
                false,
            }
          );

      if (error) {
        console.error(
          "Get my bookings error:",
          error
        );

        return res
          .status(500)
          .json({
            success: false,
            message:
              "Unable to retrieve your bookings.",
          });
      }

      return res
        .status(200)
        .json({
          success: true,

          count:
            data.length,

          bookings:
            data.map(
              formatBooking
            ),
        });
    } catch (error) {
      console.error(
        "Get my bookings error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Something went wrong while retrieving your bookings.",
        });
    }
  }
);


app.get(
  "/api/my-bookings/:id",
  requireAuth,
  async (
    req,
    res
  ) => {
    try {
      const { id } =
        req.params;

      const {
        data,
        error,
      } =
        await supabase
          .from(
            "bookings"
          )
          .select("*")
          .eq(
            "id",
            id
          )
          .eq(
            "user_id",
            req.user.id
          )
          .single();

      if (
        error ||
        !data
      ) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Booking not found or you do not have access to it.",
          });
      }

      return res
        .status(200)
        .json({
          success: true,

          booking:
            formatBooking(
              data
            ),
        });
    } catch (error) {
      console.error(
        "Get my booking error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to retrieve your booking.",
        });
    }
  }
);


// =====================================================
// CLIENT CANCELLATION REQUEST
// =====================================================

app.post(
  "/api/my-bookings/:id/cancellation-request",
  requireAuth,
  async (
    req,
    res
  ) => {
    try {
      const { id } =
        req.params;

      const reason =
        typeof req.body?.reason ===
        "string"
          ? req.body.reason.trim()
          : "";

      if (
        reason.length >
        1000
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Cancellation reason must be 1000 characters or less.",
          });
      }

      const {
        data:
          booking,

        error:
          bookingError,
      } =
        await supabase
          .from(
            "bookings"
          )
          .select("*")
          .eq(
            "id",
            id
          )
          .eq(
            "user_id",
            req.user.id
          )
          .single();

      if (
        bookingError ||
        !booking
      ) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Booking not found or you do not have access to it.",
          });
      }

      if (
        booking.status ===
        "Cancellation Requested"
      ) {
        return res
          .status(409)
          .json({
            success: false,
            message:
              "A cancellation request is already pending admin approval.",
          });
      }

      if (
        booking.status ===
        "Cancelled"
      ) {
        return res
          .status(409)
          .json({
            success: false,
            message:
              "This booking is already cancelled.",
          });
      }

      const cancellableStatuses =
        [
          "Request Received",
          "Reviewing",
          "Confirmed",
        ];

      if (
        !cancellableStatuses.includes(
          booking.status
        )
      ) {
        return res
          .status(409)
          .json({
            success: false,
            message:
              "This booking cannot be cancelled from its current status.",
          });
      }

      const {
        data:
          updatedBooking,

        error:
          updateError,
      } =
        await supabase
          .from(
            "bookings"
          )
          .update({
            status:
              "Cancellation Requested",

            status_before_cancellation:
              booking.status,

            cancellation_reason:
              reason ||
              null,

            cancellation_requested_at:
              new Date().toISOString(),

            cancellation_resolved_at:
              null,

            cancellation_resolution:
              null,
          })
          .eq(
            "id",
            booking.id
          )
          .eq(
            "user_id",
            req.user.id
          )
          .select()
          .single();

      if (
        updateError ||
        !updatedBooking
      ) {
        console.error(
          "Cancellation request error:",
          updateError
        );

        return res
          .status(500)
          .json({
            success: false,
            message:
              "Unable to submit your cancellation request.",
          });
      }

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Cancellation request submitted for admin approval.",

          booking:
            formatBooking(
              updatedBooking
            ),
        });
    } catch (error) {
      console.error(
        "Request cancellation error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Something went wrong while requesting cancellation.",
        });
    }
  }
);


// =====================================================
// ADMIN CANCELLATION APPROVAL / REJECTION
// =====================================================

app.post(
  "/api/bookings/:id/cancellation-resolution",
  requireAdmin,
  async (
    req,
    res
  ) => {
    try {
      const { id } =
        req.params;

      const decision =
        typeof req.body?.decision ===
        "string"
          ? req.body.decision
              .trim()
              .toLowerCase()
          : "";

      if (
        decision !==
          "approve" &&
        decision !==
          "reject"
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              'Decision must be "approve" or "reject".',
          });
      }

      const {
        data:
          booking,

        error:
          bookingError,
      } =
        await supabase
          .from(
            "bookings"
          )
          .select("*")
          .eq(
            "id",
            id
          )
          .single();

      if (
        bookingError ||
        !booking
      ) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Booking not found.",
          });
      }

      if (
        booking.status !==
        "Cancellation Requested"
      ) {
        return res
          .status(409)
          .json({
            success: false,
            message:
              "This booking does not have a pending cancellation request.",
          });
      }

      const resolvedAt =
        new Date().toISOString();

      // -----------------------------
      // REJECT
      // -----------------------------

      if (
        decision ===
        "reject"
      ) {
        const restorableStatuses =
          [
            "Request Received",
            "Reviewing",
            "Confirmed",
          ];

        const restoredStatus =
          restorableStatuses.includes(
            booking.status_before_cancellation
          )
            ? booking.status_before_cancellation
            : "Request Received";

        const {
          data:
            rejectedBooking,

          error:
            rejectError,
        } =
          await supabase
            .from(
              "bookings"
            )
            .update({
              status:
                restoredStatus,

              cancellation_resolved_at:
                resolvedAt,

              cancellation_resolution:
                "Rejected",
            })
            .eq(
              "id",
              booking.id
            )
            .select()
            .single();

        if (
          rejectError ||
          !rejectedBooking
        ) {
          console.error(
            "Reject cancellation error:",
            rejectError
          );

          return res
            .status(500)
            .json({
              success: false,
              message:
                "Unable to reject the cancellation request.",
            });
        }

        return res
          .status(200)
          .json({
            success: true,

            message:
              "Cancellation request rejected. The booking remains active.",

            voucherRestored:
              false,

            booking:
              formatBooking(
                rejectedBooking
              ),
          });
      }

      // -----------------------------
      // APPROVE
      // -----------------------------

      const {
        data:
          cancelledBooking,

        error:
          cancelError,
      } =
        await supabase
          .from(
            "bookings"
          )
          .update({
            status:
              "Cancelled",

            cancellation_resolved_at:
              resolvedAt,

            cancellation_resolution:
              "Approved",
          })
          .eq(
            "id",
            booking.id
          )
          .select()
          .single();

      if (
        cancelError ||
        !cancelledBooking
      ) {
        console.error(
          "Approve cancellation error:",
          cancelError
        );

        return res
          .status(500)
          .json({
            success: false,
            message:
              "Unable to approve the cancellation request.",
          });
      }

      let voucherRestored =
        false;

      let voucherRestorationMessage =
        null;

      // Restore used voucher only if
      // it is still active and valid.
      if (
        booking.voucher_id &&
        booking.user_id
      ) {
        const {
          data:
            voucher,

          error:
            voucherError,
        } =
          await supabase
            .from(
              "vouchers"
            )
            .select(
              `
                id,
                active,
                valid_from,
                valid_until
              `
            )
            .eq(
              "id",
              booking.voucher_id
            )
            .single();

        if (
          voucherError
        ) {
          console.error(
            "Voucher lookup during cancellation:",
            voucherError
          );

          voucherRestorationMessage =
            "Booking was cancelled, but the voucher could not be checked for restoration.";
        } else if (
          voucher
        ) {
          const now =
            new Date();

          const hasStarted =
            !voucher.valid_from ||
            new Date(
              voucher.valid_from
            ) <=
              now;

          const hasNotExpired =
            !voucher.valid_until ||
            new Date(
              voucher.valid_until
            ) >=
              now;

          const voucherStillValid =
            voucher.active &&
            hasStarted &&
            hasNotExpired;

          if (
            voucherStillValid
          ) {
            const {
              data:
                restoredVoucher,

              error:
                restoreVoucherError,
            } =
              await supabase
                .from(
                  "user_vouchers"
                )
                .update({
                  status:
                    "available",

                  used_at:
                    null,

                  booking_id:
                    null,
                })
                .eq(
                  "user_id",
                  booking.user_id
                )
                .eq(
                  "booking_id",
                  booking.id
                )
                .eq(
                  "voucher_id",
                  booking.voucher_id
                )
                .eq(
                  "status",
                  "used"
                )
                .select()
                .maybeSingle();

            if (
              restoreVoucherError
            ) {
              console.error(
                "Voucher restoration error:",
                restoreVoucherError
              );

              voucherRestorationMessage =
                "Booking was cancelled, but the voucher could not be restored automatically.";
            } else if (
              restoredVoucher
            ) {
              voucherRestored =
                true;

              voucherRestorationMessage =
                "The valid voucher used for this booking was returned to the client's wallet.";
            }
          } else {
            voucherRestorationMessage =
              "The booking voucher was not restored because it is no longer valid.";
          }
        }
      }

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Cancellation approved. The booking is now cancelled.",

          voucherRestored,

          voucherRestorationMessage,

          booking:
            formatBooking(
              cancelledBooking
            ),
        });
    } catch (error) {
      console.error(
        "Resolve cancellation error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Something went wrong while resolving the cancellation request.",
        });
    }
  }
);


// =====================================================
// UPDATE BOOKING STATUS
// =====================================================

app.patch(
  "/api/bookings/:id",
  async (
    req,
    res
  ) => {
    try {
      const { id } =
        req.params;

      const { status } =
        req.body;

      const allowedStatuses =
        [
          "Request Received",
          "Reviewing",
          "Confirmed",
          "Cancelled",
        ];

      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid booking status.",
          });
      }

      const {
        data,
        error,
      } =
        await supabase
          .from(
            "bookings"
          )
          .update({
            status,
          })
          .eq(
            "id",
            id
          )
          .select()
          .single();

      if (error) {
        console.error(
          "Supabase update error:",
          error
        );

        return res
          .status(500)
          .json({
            success: false,
            message:
              "Unable to update booking.",
          });
      }

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Booking status updated!",

          booking:
            formatBooking(
              data
            ),
        });
    } catch (error) {
      console.error(
        "Update booking error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Something went wrong while updating booking.",
        });
    }
  }
);


// =====================================================
// CONTACT
// =====================================================

app.post(
  "/api/contact",
  async (
    req,
    res
  ) => {
    try {
      const {
        name,
        email,
        subject,
        message,
      } =
        req.body;

      if (
        !name ||
        !email ||
        !subject ||
        !message
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Name, email, subject, and message are required.",
          });
      }

      const {
        data,
        error,
      } =
        await supabase
          .from(
            "contact_messages"
          )
          .insert([
            {
              name,
              email,
              subject,
              message,
              status:
                "Unread",
            },
          ])
          .select()
          .single();

      if (error) {
        console.error(
          "Contact message error:",
          error
        );

        return res
          .status(500)
          .json({
            success: false,
            message:
              "Unable to send message.",
          });
      }

      return res
        .status(201)
        .json({
          success: true,

          message:
            "Message sent successfully!",

          contact:
            formatContactMessage(
              data
            ),
        });
    } catch (error) {
      console.error(
        "Contact error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Something went wrong while sending the message.",
        });
    }
  }
);


app.get(
  "/api/contact-messages",
  async (
    req,
    res
  ) => {
    try {
      const {
        data,
        error,
      } =
        await supabase
          .from(
            "contact_messages"
          )
          .select("*")
          .order(
            "created_at",
            {
              ascending:
                false,
            }
          );

      if (error) {
        console.error(
          "Get contact messages error:",
          error
        );

        return res
          .status(500)
          .json({
            success: false,
            message:
              "Unable to retrieve contact messages.",
          });
      }

      return res
        .status(200)
        .json({
          success: true,

          count:
            data.length,

          messages:
            data.map(
              formatContactMessage
            ),
        });
    } catch (error) {
      console.error(
        "Get contact messages error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Something went wrong while retrieving messages.",
        });
    }
  }
);


app.get(
  "/api/contact-messages/:id",
  async (
    req,
    res
  ) => {
    try {
      const { id } =
        req.params;

      const {
        data:
          contact,

        error:
          contactError,
      } =
        await supabase
          .from(
            "contact_messages"
          )
          .select("*")
          .eq(
            "id",
            id
          )
          .single();

      if (
        contactError
      ) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Contact message not found.",
          });
      }

      const {
        data:
          replies,

        error:
          repliesError,
      } =
        await supabase
          .from(
            "contact_replies"
          )
          .select("*")
          .eq(
            "contact_message_id",
            id
          )
          .order(
            "created_at",
            {
              ascending:
                true,
            }
          );

      if (
        repliesError
      ) {
        console.error(
          "Get reply history error:",
          repliesError
        );

        return res
          .status(500)
          .json({
            success: false,
            message:
              "Unable to retrieve reply history.",
          });
      }

      return res
        .status(200)
        .json({
          success: true,

          message:
            formatContactMessage(
              contact
            ),

          replies:
            replies.map(
              formatContactReply
            ),
        });
    } catch (error) {
      console.error(
        "Get contact message error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to retrieve contact message.",
        });
    }
  }
);


app.patch(
  "/api/contact-messages/:id",
  async (
    req,
    res
  ) => {
    try {
      const { id } =
        req.params;

      const { status } =
        req.body;

      const allowedStatuses =
        [
          "Unread",
          "Read",
          "Replied",
        ];

      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid message status.",
          });
      }

      const {
        data,
        error,
      } =
        await supabase
          .from(
            "contact_messages"
          )
          .update({
            status,
          })
          .eq(
            "id",
            id
          )
          .select()
          .single();

      if (error) {
        console.error(
          "Update contact message error:",
          error
        );

        return res
          .status(500)
          .json({
            success: false,
            message:
              "Unable to update message status.",
          });
      }

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Message status updated!",

          contact:
            formatContactMessage(
              data
            ),
        });
    } catch (error) {
      console.error(
        "Update contact message error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Something went wrong while updating message.",
        });
    }
  }
);


// =====================================================
// SEND ADMIN REPLY
// =====================================================

app.post(
  "/api/contact-messages/:id/reply",
  async (
    req,
    res
  ) => {
    try {
      const { id } =
        req.params;

      const {
        replyMessage,
      } =
        req.body;

      if (
        !replyMessage ||
        replyMessage.trim()
          .length <
          2
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Reply message is required.",
          });
      }

      const {
        data:
          contact,

        error:
          contactError,
      } =
        await supabase
          .from(
            "contact_messages"
          )
          .select("*")
          .eq(
            "id",
            id
          )
          .single();

      if (
        contactError ||
        !contact
      ) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Contact message not found.",
          });
      }

      const {
        data:
          emailData,

        error:
          emailError,
      } =
        await resend
          .emails
          .send({
            from:
              process
                .env
                .RESEND_FROM_EMAIL,

            to: [
              contact.email,
            ],

            subject:
              `Re: ${contact.subject}`,

            text:
              replyMessage.trim(),
          });

      if (
        emailError
      ) {
        console.error(
          "Resend email error:",
          emailError
        );

        return res
          .status(500)
          .json({
            success: false,
            message:
              "Unable to send reply email.",
          });
      }

      const {
        data:
          savedReply,

        error:
          replyError,
      } =
        await supabase
          .from(
            "contact_replies"
          )
          .insert([
            {
              contact_message_id:
                contact.id,

              reply_message:
                replyMessage.trim(),

              sent_to:
                contact.email,

              provider_message_id:
                emailData?.id ||
                null,
            },
          ])
          .select()
          .single();

      if (
        replyError
      ) {
        console.error(
          "Save reply error:",
          replyError
        );

        return res
          .status(500)
          .json({
            success: false,
            message:
              "Email was sent, but the reply could not be saved.",
          });
      }

      const {
        error:
          statusError,
      } =
        await supabase
          .from(
            "contact_messages"
          )
          .update({
            status:
              "Replied",
          })
          .eq(
            "id",
            contact.id
          );

      if (
        statusError
      ) {
        console.error(
          "Update replied status error:",
          statusError
        );
      }

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Reply sent successfully!",

          reply:
            formatContactReply(
              savedReply
            ),
        });
    } catch (error) {
      console.error(
        "Send reply error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Something went wrong while sending the reply.",
        });
    }
  }
);


// =====================================================
// START SERVER
// =====================================================

const PORT =
  process.env.PORT ||
  5000;

app.listen(
  PORT,
  () => {
    console.log(
      `AddyVenture API running on http://localhost:${PORT}`
    );
  }
);