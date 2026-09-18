const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const { Resend } = require("resend");

const rateLimitPackage = require(
  "express-rate-limit"
);

const rateLimit =
  rateLimitPackage.rateLimit ||
  rateLimitPackage.default ||
  rateLimitPackage;

require("dotenv").config();

const isProduction =
  process.env.NODE_ENV ===
  "production";

const rawTrustProxyHops =
  String(
    process.env.TRUST_PROXY_HOPS ||
      "0"
  ).trim();

const trustProxyHops =
  Number(rawTrustProxyHops);

if (
  !Number.isInteger(
    trustProxyHops
  ) ||
  trustProxyHops < 0 ||
  trustProxyHops > 5
) {
  throw new Error(
    "TRUST_PROXY_HOPS must be an integer from 0 through 5."
  );
}


function readPositiveIntegerEnv(
  name,
  fallback,
  maximum = 100000
) {
  const rawValue =
    String(
      process.env[name] ??
        fallback
    ).trim();

  const parsedValue =
    Number(rawValue);

  if (
    !Number.isInteger(
      parsedValue
    ) ||
    parsedValue < 1 ||
    parsedValue > maximum
  ) {
    throw new Error(
      `${name} must be an integer from 1 through ${maximum}.`
    );
  }

  return parsedValue;
}


const dailyUsageLimits =
  Object.freeze({
    contactSubmissionsPerIp:
      readPositiveIntegerEnv(
        "MAX_DAILY_CONTACT_SUBMISSIONS_PER_IP",
        20,
        500
      ),

    bookingRequestsPerAccount:
      readPositiveIntegerEnv(
        "MAX_DAILY_BOOKING_REQUESTS_PER_ACCOUNT",
        10,
        500
      ),

    cancellationRequestsPerAccount:
      readPositiveIntegerEnv(
        "MAX_DAILY_CANCELLATION_REQUESTS_PER_ACCOUNT",
        10,
        500
      ),

    voucherAttemptsPerAccount:
      readPositiveIntegerEnv(
        "MAX_DAILY_VOUCHER_ATTEMPTS_PER_ACCOUNT",
        30,
        1000
      ),

    emailRepliesGlobal:
      readPositiveIntegerEnv(
        "MAX_DAILY_EMAIL_REPLIES",
        50,
        1000
      ),
  });

const requiredEnvironmentVariables = [
  "SUPABASE_URL",
  "SUPABASE_SECRET_KEY",
];

if (isProduction) {
  requiredEnvironmentVariables.push(
    "ALLOWED_ORIGINS",
    "RESEND_API_KEY",
    "RESEND_FROM_EMAIL"
  );
}

const missingEnvironmentVariables =
  requiredEnvironmentVariables.filter(
    (name) =>
      !String(
        process.env[name] || ""
      ).trim()
  );

if (
  missingEnvironmentVariables.length >
  0
) {
  throw new Error(
    `Missing required server environment variables: ${missingEnvironmentVariables.join(
      ", "
    )}`
  );
}

const supabase = require("./supabase");

const app = express();

if (trustProxyHops > 0) {
  // Set this only to the exact number of trusted reverse
  // proxies in front of the API. Never use a blanket true.
  app.set(
    "trust proxy",
    trustProxyHops
  );
}

const resendApiKey =
  String(
    process.env.RESEND_API_KEY ||
      ""
  ).trim();

const resend = resendApiKey
  ? new Resend(resendApiKey)
  : null;


// Keep production logs useful without printing request bodies,
// credentials, personal data, or raw provider/database errors.
function logServerError(
  event,
  error = null
) {
  const safeEvent =
    String(event || "Server error")
      .replace(/[\r\n]+/g, " ")
      .slice(0, 160);

  const metadata = {
    level: "error",
    event: safeEvent,
  };

  if (
    error &&
    typeof error === "object"
  ) {
    if (error.name) {
      metadata.name =
        String(error.name)
          .slice(0, 80);
    }

    if (error.code) {
      metadata.code =
        String(error.code)
          .slice(0, 80);
    }

    if (
      Number.isInteger(
        error.status
      )
    ) {
      metadata.status =
        error.status;
    }
  }

  console.error(
    JSON.stringify(metadata)
  );
}


// =====================================================
// BASIC APP SECURITY / REQUEST LIMITS
// =====================================================

app.disable("x-powered-by");
app.disable("etag");

const localDevelopmentOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
];


function normalizeOrigin(value) {
  return String(value || "")
    .trim()
    .replace(/\/+$/, "");
}


function validateConfiguredOrigin(
  value
) {
  const normalized =
    normalizeOrigin(value);

  if (!normalized) {
    return null;
  }

  if (normalized === "*") {
    throw new Error(
      "ALLOWED_ORIGINS must list exact origins. Wildcards are not allowed."
    );
  }

  let parsedOrigin;

  try {
    parsedOrigin =
      new URL(normalized);
  } catch {
    throw new Error(
      `Invalid ALLOWED_ORIGINS entry: ${normalized}`
    );
  }

  const protocolAllowed =
    parsedOrigin.protocol ===
      "https:" ||
    (!isProduction &&
      parsedOrigin.protocol ===
        "http:");

  if (!protocolAllowed) {
    throw new Error(
      `ALLOWED_ORIGINS entry must use ${
        isProduction
          ? "HTTPS"
          : "HTTP or HTTPS"
      }: ${normalized}`
    );
  }

  if (
    parsedOrigin.username ||
    parsedOrigin.password ||
    parsedOrigin.pathname !== "/" ||
    parsedOrigin.search ||
    parsedOrigin.hash
  ) {
    throw new Error(
      `ALLOWED_ORIGINS entries cannot contain credentials, paths, queries, or fragments: ${normalized}`
    );
  }

  return parsedOrigin.origin;
}


const configuredOrigins =
  String(
    process.env.ALLOWED_ORIGINS ||
      ""
  )
    .split(",")
    .map(
      validateConfiguredOrigin
    )
    .filter(Boolean);

const allowedOrigins = new Set([
  ...configuredOrigins,

  ...(isProduction
    ? []
    : localDevelopmentOrigins),
]);


function isAllowedOrigin(origin) {
  if (!origin) {
    // Server-to-server tools and same-origin requests
    // do not always send an Origin header.
    return true;
  }

  return allowedOrigins.has(
    normalizeOrigin(origin)
  );
}


// API responses never need to be embedded in another site.
// These headers provide a dependency-free baseline similar
// to Helmet while keeping the existing package setup intact.
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'"
  );

  res.setHeader(
    "X-Content-Type-Options",
    "nosniff"
  );

  res.setHeader(
    "X-Frame-Options",
    "DENY"
  );

  res.setHeader(
    "Referrer-Policy",
    "no-referrer"
  );

  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  res.setHeader(
    "X-DNS-Prefetch-Control",
    "off"
  );

  res.setHeader(
    "X-Permitted-Cross-Domain-Policies",
    "none"
  );

  res.setHeader(
    "X-Robots-Tag",
    "noindex, nofollow, noarchive"
  );

  res.setHeader(
    "Cache-Control",
    "no-store"
  );

  if (isProduction) {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  }

  next();
});


// Reject browser requests from unapproved origins before
// any route, rate limiter, database call, or email action.
app.use((req, res, next) => {
  const origin =
    req.headers.origin;

  if (
    !isAllowedOrigin(origin)
  ) {
    return res.status(403).json({
      success: false,
      message:
        "This origin is not allowed to access the API.",
    });
  }

  return next();
});


app.use(
  cors({
    origin:
      (origin, callback) => {
        callback(
          null,
          isAllowedOrigin(origin)
        );
      },

    methods: [
      "GET",
      "POST",
      "PATCH",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Accept",
      "Authorization",
      "Content-Type",
      "Idempotency-Key",
    ],

    exposedHeaders: [
      "RateLimit",
      "RateLimit-Policy",
      "Retry-After",
    ],

    maxAge:
      24 * 60 * 60,

    optionsSuccessStatus:
      204,
  })
);


// =====================================================
// RATE LIMIT HELPERS
// =====================================================

function rateLimitResponse(
  message
) {
  return {
    success: false,
    message,
  };
}


function logUsageGuardrail(
  event
) {
  const safeEvent =
    String(
      event ||
        "Usage guardrail reached"
    )
      .replace(/[^A-Za-z0-9 _.-]/g, "")
      .slice(0, 120);

  console.warn(
    JSON.stringify({
      level: "warn",
      event: safeEvent,
    })
  );
}


function usageLimitHandler(
  event,
  message
) {
  return (req, res) => {
    logUsageGuardrail(event);

    return res.status(429).json(
      rateLimitResponse(message)
    );
  };
}


// -----------------------------------------------------
// GLOBAL API LIMIT
//
// Backup protection for all /api routes.
// Endpoint-specific limits below are much stricter.
// -----------------------------------------------------

const apiLimiter = rateLimit({
  windowMs:
    15 * 60 * 1000,

  limit:
    600,

  standardHeaders:
    "draft-7",

  legacyHeaders:
    false,

  handler:
    (req, res) => {
      return res.status(429).json(
        rateLimitResponse(
          "Too many requests. Please wait a few minutes and try again."
        )
      );
    },
});


// -----------------------------------------------------
// PUBLIC CONTACT FORM
//
// Protects database from spam/bots.
// -----------------------------------------------------

const contactLimiter = rateLimit({
  windowMs:
    15 * 60 * 1000,

  limit:
    5,

  standardHeaders:
    "draft-7",

  legacyHeaders:
    false,

  handler:
    (req, res) => {
      return res.status(429).json(
        rateLimitResponse(
          "Too many contact form submissions. Please wait before sending another message."
        )
      );
    },
});


// -----------------------------------------------------
// PASSWORD LOGIN
//
// Allows a maximum of 10 failed login attempts
// per 5-minute window for each client IP.
// Successful logins do not consume the failed-attempt quota.
// -----------------------------------------------------

const loginLimiter = rateLimit({
  windowMs:
    5 * 60 * 1000,

  limit:
    10,

  skipSuccessfulRequests:
    true,

  standardHeaders:
    "draft-7",

  legacyHeaders:
    false,

  handler:
    (req, res) => {
      return res.status(429).json(
        rateLimitResponse(
          "Too many login attempts. Please wait a few minutes before trying again."
        )
      );
    },
});


// -----------------------------------------------------
// CLIENT BOOKING CREATION
//
// Keyed by authenticated user instead of IP.
// -----------------------------------------------------

const bookingCreationLimiter =
  rateLimit({
    windowMs:
      60 * 60 * 1000,

    limit:
      5,

    keyGenerator:
      (req) =>
        req.user.id,

    standardHeaders:
      "draft-7",

    legacyHeaders:
      false,

    handler:
      (req, res) => {
        return res.status(429).json(
          rateLimitResponse(
            "You have created too many booking requests. Please wait before trying again."
          )
        );
      },
  });


// -----------------------------------------------------
// CANCELLATION REQUEST
// -----------------------------------------------------

const cancellationRequestLimiter =
  rateLimit({
    windowMs:
      60 * 60 * 1000,

    limit:
      5,

    keyGenerator:
      (req) =>
        req.user.id,

    standardHeaders:
      "draft-7",

    legacyHeaders:
      false,

    handler:
      (req, res) => {
        return res.status(429).json(
          rateLimitResponse(
            "Too many cancellation attempts. Please wait before trying again."
          )
        );
      },
  });


// -----------------------------------------------------
// CLIENT VOUCHER REDEMPTION
//
// Protects voucher codes from guessing/brute force.
// Keyed by authenticated user instead of IP.
// -----------------------------------------------------

const voucherRedeemLimiter =
  rateLimit({
    windowMs:
      60 * 60 * 1000,

    limit:
      10,

    keyGenerator:
      (req) =>
        req.user.id,

    standardHeaders:
      "draft-7",

    legacyHeaders:
      false,

    handler:
      (req, res) => {
        return res.status(429).json(
          rateLimitResponse(
            "Too many voucher redemption attempts. Please wait before trying again."
          )
        );
      },
  });


// -----------------------------------------------------
// ADMIN MUTATIONS
//
// Status changes / cancellation decisions.
// -----------------------------------------------------

const adminMutationLimiter =
  rateLimit({
    windowMs:
      60 * 60 * 1000,

    limit:
      120,

    keyGenerator:
      (req) =>
        req.user.id,

    standardHeaders:
      "draft-7",

    legacyHeaders:
      false,

    handler:
      (req, res) => {
        return res.status(429).json(
          rateLimitResponse(
            "Too many administrative actions. Please wait before continuing."
          )
        );
      },
  });


// -----------------------------------------------------
// ADMIN EMAIL REPLIES
//
// Important because this triggers Resend API usage.
// -----------------------------------------------------

const adminEmailLimiter =
  rateLimit({
    windowMs:
      60 * 60 * 1000,

    limit:
      20,

    keyGenerator:
      (req) =>
        req.user.id,

    standardHeaders:
      "draft-7",

    legacyHeaders:
      false,

    handler:
      (req, res) => {
        return res.status(429).json(
          rateLimitResponse(
            "Email sending limit reached. Please wait before sending more replies."
          )
        );
      },
  });


// -----------------------------------------------------
// DAILY COST / USAGE GUARDRAILS
//
// These caps complement the shorter abuse limits above.
// The default in-memory store is intentionally a first
// line of defense. Provider quotas / spend controls remain
// the authoritative cap across restarts and multiple API
// instances.
// -----------------------------------------------------

const dailyWindowMs =
  24 * 60 * 60 * 1000;

const dailyContactSubmissionLimiter =
  rateLimit({
    windowMs:
      dailyWindowMs,

    limit:
      dailyUsageLimits
        .contactSubmissionsPerIp,

    skipFailedRequests:
      true,

    standardHeaders:
      "draft-7",

    legacyHeaders:
      false,

    handler:
      usageLimitHandler(
        "Daily contact submission cap reached",
        "Daily contact form limit reached. Please try again tomorrow."
      ),
  });


const dailyBookingRequestLimiter =
  rateLimit({
    windowMs:
      dailyWindowMs,

    limit:
      dailyUsageLimits
        .bookingRequestsPerAccount,

    keyGenerator:
      (req) =>
        req.user.id,

    skipFailedRequests:
      true,

    standardHeaders:
      "draft-7",

    legacyHeaders:
      false,

    handler:
      usageLimitHandler(
        "Daily booking request cap reached",
        "Daily booking request limit reached. Please try again tomorrow."
      ),
  });


const dailyCancellationRequestLimiter =
  rateLimit({
    windowMs:
      dailyWindowMs,

    limit:
      dailyUsageLimits
        .cancellationRequestsPerAccount,

    keyGenerator:
      (req) =>
        req.user.id,

    skipFailedRequests:
      true,

    standardHeaders:
      "draft-7",

    legacyHeaders:
      false,

    handler:
      usageLimitHandler(
        "Daily cancellation request cap reached",
        "Daily cancellation request limit reached. Please try again tomorrow."
      ),
  });


const dailyVoucherAttemptLimiter =
  rateLimit({
    windowMs:
      dailyWindowMs,

    limit:
      dailyUsageLimits
        .voucherAttemptsPerAccount,

    keyGenerator:
      (req) =>
        req.user.id,

    standardHeaders:
      "draft-7",

    legacyHeaders:
      false,

    handler:
      usageLimitHandler(
        "Daily voucher attempt cap reached",
        "Daily voucher attempt limit reached. Please try again tomorrow."
      ),
  });


const dailyEmailReplyLimiter =
  rateLimit({
    windowMs:
      dailyWindowMs,

    limit:
      dailyUsageLimits
        .emailRepliesGlobal,

    keyGenerator:
      () =>
        "global-email-budget",

    skipFailedRequests:
      true,

    standardHeaders:
      "draft-7",

    legacyHeaders:
      false,

    handler:
      usageLimitHandler(
        "Daily email reply budget reached",
        "Daily email sending budget reached. Please continue tomorrow or review the configured limit."
      ),
  });


// Global protection BEFORE request body parsing.
app.use(
  "/api",
  apiLimiter
);


// Maximum JSON request size.
//
// Stops huge request bodies from consuming unnecessary
// memory / database resources.
app.use(
  express.json({
    limit: "100kb",
  })
);


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
      return res.status(401).json({
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

    if (
      error ||
      !user
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Your session is invalid or has expired. Please log in again.",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    logServerError(
      "Authentication error:",
      error
    );

    return res.status(401).json({
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
      return res.status(401).json({
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
      return res.status(401).json({
        success: false,
        message:
          "Your session is invalid or has expired. Please log in again.",
      });
    }

    const {
      data: profile,
      error: profileError,
    } =
      await supabase
        .from("profiles")
        .select("id, role")
        .eq(
          "id",
          user.id
        )
        .single();

    if (
      profileError ||
      !profile ||
      profile.role !==
        "admin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Administrator access is required.",
      });
    }

    req.user = user;
    req.profile = profile;

    next();
  } catch (error) {
    logServerError(
      "Admin authentication error:",
      error
    );

    return res.status(403).json({
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

  let discount =
    0;

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


function formatCreatedBooking(
  booking
) {
  return {
    id:
      booking.id,

    userId:
      booking.user_id,

    bookingReference:
      booking.booking_reference,

    status:
      booking.status,

    subtotal:
      Number(
        booking.subtotal
      ),

    discountAmount:
      Number(
        booking.discount_amount ||
          0
      ),

    estimatedTotal:
      Number(
        booking.estimated_total
      ),

    voucherId:
      booking.voucher_id,

    voucherCode:
      booking.voucher_code,

    createdAt:
      booking.created_at,
  };
}


async function findBookingByIdempotencyKey(
  userId,
  idempotencyKey
) {
  return supabase
    .from("bookings")
    .select("*")
    .eq(
      "user_id",
      userId
    )
    .eq(
      "idempotency_key",
      idempotencyKey
    )
    .maybeSingle();
}


async function requireBookingIdempotencyKey(
  req,
  res,
  next
) {
  try {
    const rawKey =
      req.get(
        "Idempotency-Key"
      );

    const idempotencyKey =
      typeof rawKey ===
      "string"
        ? rawKey.trim()
        : "";

    if (!idempotencyKey) {
      return res.status(400).json({
        success: false,
        message:
          "A booking request key is required. Please refresh the page and try again.",
      });
    }

    if (
      idempotencyKey.length <
        16 ||
      idempotencyKey.length >
        128 ||
      !/^[A-Za-z0-9._:-]+$/.test(
        idempotencyKey
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "The booking request key is invalid. Please refresh the page and try again.",
      });
    }

    const {
      data:
        existingBooking,
      error:
        existingBookingError,
    } =
      await findBookingByIdempotencyKey(
        req.user.id,
        idempotencyKey
      );

    if (
      existingBookingError
    ) {
      logServerError(
        "Booking idempotency lookup error:",
        existingBookingError
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to verify this booking request. Please try again.",
      });
    }

    if (existingBooking) {
      return res.status(200).json({
        success: true,
        message:
          "This booking request was already received.",
        idempotentReplay:
          true,
        booking:
          formatCreatedBooking(
            existingBooking
          ),
      });
    }

    req.idempotencyKey =
      idempotencyKey;

    return next();
  } catch (error) {
    logServerError(
      "Booking idempotency error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to verify this booking request. Please try again.",
    });
  }
}


// =====================================================
// AUTH — PASSWORD LOGIN
// =====================================================

app.post(
  "/api/login",

  loginLimiter,

  async (req, res) => {
    try {
      const email =
        typeof req.body?.email ===
        "string"
          ? req.body.email
              .trim()
              .toLowerCase()
          : "";

      const password =
        typeof req.body?.password ===
        "string"
          ? req.body.password
          : "";

      const captchaToken =
        typeof req.body?.captchaToken ===
        "string"
          ? req.body.captchaToken.trim()
          : "";

      if (
        !email ||
        !password ||
        !captchaToken
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Email, password, and security verification are required.",
        });
      }

      if (
        email.length > 254 ||
        password.length > 1024 ||
        captchaToken.length > 8192
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid login request.",
        });
      }

      const supabaseUrl =
        process.env.SUPABASE_URL;

      const supabaseSecretKey =
        process.env.SUPABASE_SECRET_KEY;

      if (
        !supabaseUrl ||
        !supabaseSecretKey
      ) {
        logServerError(
          "Login configuration error: missing Supabase environment variables."
        );

        return res.status(500).json({
          success: false,
          message:
            "Authentication service is unavailable.",
        });
      }

      const authResponse =
        await fetch(
          `${supabaseUrl}/auth/v1/token?grant_type=password`,
          {
            method: "POST",

            headers: {
              apikey:
                supabaseSecretKey,

              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                email,
                password,
                gotrue_meta_security: {
                  captcha_token:
                    captchaToken,
                },
              }),
          }
        );

      let authData = null;

      try {
        authData =
          await authResponse.json();
      } catch (parseError) {
        logServerError(
          "Login response parse error:",
          parseError
        );

        return res.status(502).json({
          success: false,
          message:
            "Authentication service returned an unexpected response.",
        });
      }

      if (!authResponse.ok) {
        const authCode =
          String(
            authData?.error_code ||
              authData?.code ||
              ""
          ).toLowerCase();

        const authMessage =
          String(
            authData?.msg ||
              authData?.message ||
              authData?.error_description ||
              ""
          ).toLowerCase();

        if (
          authResponse.status ===
            429
        ) {
          return res.status(429).json({
            success: false,
            message:
              "Too many login attempts. Please wait a few minutes before trying again.",
          });
        }

        if (
          authCode.includes(
            "email_not_confirmed"
          ) ||
          authMessage.includes(
            "email not confirmed"
          )
        ) {
          return res.status(403).json({
            success: false,
            message:
              "Please verify your email address before logging in.",
          });
        }

        if (
          authCode.includes(
            "captcha_failed"
          ) ||
          authMessage.includes(
            "captcha"
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Security verification expired or failed. Please try again.",
          });
        }

        if (
          authResponse.status ===
            400 ||
          authResponse.status ===
            401 ||
          authCode.includes(
            "invalid_credentials"
          ) ||
          authMessage.includes(
            "invalid login credentials"
          )
        ) {
          return res.status(401).json({
            success: false,
            message:
              "Incorrect email or password.",
          });
        }

        logServerError(
          "Supabase login error:",
          {
            status:
              authResponse.status,
            code:
              authData?.error_code ||
              authData?.code ||
              null,
          }
        );

        return res.status(502).json({
          success: false,
          message:
            "Unable to log in right now. Please try again.",
        });
      }

      if (
        !authData?.access_token ||
        !authData?.refresh_token
      ) {
        logServerError(
          "Login response missing session tokens."
        );

        return res.status(502).json({
          success: false,
          message:
            "Authentication service returned an incomplete session.",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Login successful.",

        session: {
          accessToken:
            authData.access_token,

          refreshToken:
            authData.refresh_token,

          expiresIn:
            authData.expires_in ||
            null,
        },

        user: authData.user
          ? {
              id:
                authData.user.id,

              email:
                authData.user.email,
            }
          : null,
      });
    } catch (error) {
      logServerError(
        "Login error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Something went wrong while logging in.",
      });
    }
  }
);


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
// ADMIN — BOOKINGS
// =====================================================

app.get(
  "/api/bookings",
  requireAdmin,
  async (req, res) => {
    try {
      const {
        data,
        error,
      } =
        await supabase
          .from("bookings")
          .select("*")
          .order(
            "created_at",
            {
              ascending:
                false,
            }
          );

      if (error) {
        logServerError(
          "Supabase error:",
          error
        );

        return res.status(500).json({
          success: false,
          message:
            "Unable to retrieve bookings.",
        });
      }

      return res.status(200).json({
        success: true,

        count:
          data.length,

        bookings:
          data.map(
            formatBooking
          ),
      });
    } catch (error) {
      logServerError(
        "Get bookings error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Something went wrong while retrieving bookings.",
      });
    }
  }
);


app.get(
  "/api/bookings/:id",
  requireAdmin,
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const {
        data,
        error,
      } =
        await supabase
          .from("bookings")
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
        return res.status(404).json({
          success: false,
          message:
            "Booking not found.",
        });
      }

      return res.status(200).json({
        success: true,
        booking:
          formatBooking(
            data
          ),
      });
    } catch (error) {
      logServerError(
        "Get booking error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to retrieve booking.",
      });
    }
  }
);


// =====================================================
// CLIENT — VOUCHERS
// =====================================================

app.get(
  "/api/my-vouchers",
  requireAuth,
  async (req, res) => {
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
        logServerError(
          "Get vouchers error:",
          error
        );

        return res.status(500).json({
          success: false,
          message:
            "Unable to retrieve your vouchers.",
        });
      }

      const vouchers =
        (data || []).map(
          formatUserVoucher
        );

      return res.status(200).json({
        success: true,

        count:
          vouchers.length,

        vouchers,
      });
    } catch (error) {
      logServerError(
        "Get vouchers error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Something went wrong while retrieving your vouchers.",
      });
    }
  }
);


// =====================================================
// CLIENT — REDEEM VOUCHER
// =====================================================

app.post(
  "/api/redeem-voucher",

  requireAuth,

  dailyVoucherAttemptLimiter,

  voucherRedeemLimiter,

  async (req, res) => {
    try {
      const code =
        typeof req.body?.code ===
        "string"
          ? req.body.code
              .trim()
              .toUpperCase()
          : "";

      if (!code) {
        return res.status(400).json({
          success: false,
          message:
            "Enter a voucher code.",
        });
      }

      if (code.length > 50) {
        return res.status(400).json({
          success: false,
          message:
            "Voucher code is too long.",
        });
      }

      const {
        data,
        error,
      } =
        await supabase.rpc(
          "redeem_voucher_backend",
          {
            p_user_id:
              req.user.id,

            p_code:
              code,
          }
        );

      if (error) {
        logServerError(
          "Redeem voucher error:",
          error
        );

        return res.status(500).json({
          success: false,
          message:
            "Unable to redeem voucher.",
        });
      }

      if (!data?.success) {
        return res.status(400).json({
          success: false,
          message:
            data?.message ||
            "Unable to redeem voucher.",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          data.message ||
          "Voucher redeemed successfully!",

        voucherId:
          data.voucher_id ||
          null,
      });
    } catch (error) {
      logServerError(
        "Redeem voucher error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Something went wrong while redeeming the voucher.",
      });
    }
  }
);


// =====================================================
// CLIENT — CREATE BOOKING
// =====================================================

app.post(
  "/api/bookings",

  requireAuth,

  requireBookingIdempotencyKey,

  dailyBookingRequestLimiter,

  bookingCreationLimiter,

  async (req, res) => {
    try {
      const bookingData =
        req.body;

      const travelerName =
        typeof bookingData
          ?.travelerName ===
        "string"
          ? bookingData.travelerName
              .trim()
          : "";

      const email =
        typeof bookingData
          ?.email === "string"
          ? bookingData.email
              .trim()
              .toLowerCase()
          : "";

      const phone =
        typeof bookingData
          ?.phone === "string"
          ? bookingData.phone
              .trim()
          : "";

      const nationality =
        typeof bookingData
          ?.nationality ===
        "string"
          ? bookingData.nationality
              .trim()
          : "";

      const travelDate =
        typeof bookingData
          ?.travelDate ===
        "string"
          ? bookingData.travelDate
              .trim()
          : "";

      if (
        !travelerName ||
        !email ||
        !phone ||
        !travelDate
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Traveler name, email, phone, and travel date are required.",
        });
      }

      if (
        travelerName.length >
          120 ||
        email.length > 254 ||
        phone.length > 30 ||
        nationality.length >
          100 ||
        !/^\S+@\S+\.\S+$/.test(
          email
        ) ||
        !/^[0-9+().\-\s]{7,30}$/.test(
          phone
        ) ||
        !/^\d{4}-\d{2}-\d{2}$/.test(
          travelDate
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "One or more traveler details are invalid.",
        });
      }

      const rawTraveler =
        bookingData.traveler &&
        typeof bookingData
          .traveler === "object" &&
        !Array.isArray(
          bookingData.traveler
        )
          ? bookingData.traveler
          : {};

      const adults =
        Number(
          rawTraveler.adults
        );

      const children =
        Number(
          rawTraveler.children ||
            0
        );

      const infants =
        Number(
          rawTraveler.infants ||
            0
        );

      const emergencyName =
        typeof rawTraveler
          .emergencyName ===
        "string"
          ? rawTraveler.emergencyName
              .trim()
          : "";

      const emergencyPhone =
        typeof rawTraveler
          .emergencyPhone ===
        "string"
          ? rawTraveler.emergencyPhone
              .trim()
          : "";

      const specialRequests =
        typeof rawTraveler
          .specialRequests ===
        "string"
          ? rawTraveler.specialRequests
              .trim()
          : "";

      if (
        !Number.isInteger(
          adults
        ) ||
        adults < 1 ||
        adults > 50 ||
        !Number.isInteger(
          children
        ) ||
        children < 0 ||
        children > 50 ||
        !Number.isInteger(
          infants
        ) ||
        infants < 0 ||
        infants > 50 ||
        emergencyName.length >
          120 ||
        emergencyPhone.length >
          30 ||
        specialRequests.length >
          2000 ||
        Boolean(emergencyName) !==
          Boolean(
            emergencyPhone
          ) ||
        (
          emergencyPhone &&
          !/^[0-9+().\-\s]{7,30}$/.test(
            emergencyPhone
          )
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "One or more booking details are invalid.",
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
          1 ||
        travelerCount >
          100 ||
        travelerCount !==
          adults +
            children +
            infants
      ) {
        return res.status(400).json({
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
          return res.status(400).json({
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
          return res.status(400).json({
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
          ) > now
        ) {
          return res.status(400).json({
            success: false,
            message:
              "This voucher is not active yet.",
          });
        }

        if (
          selectedVoucher.valid_until &&
          new Date(
            selectedVoucher.valid_until
          ) < now
        ) {
          return res.status(400).json({
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
          return res.status(400).json({
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
          .from("bookings")
          .insert([
            {
              user_id:
                req.user.id,

              idempotency_key:
                req.idempotencyKey,

              booking_reference:
                bookingReference,

              traveler_name:
                travelerName,

              email:
                email,

              phone:
                phone,

              nationality:
                nationality ||
                null,

              travel_date:
                travelDate,

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
                {
                  adults,
                  children,
                  infants,

                  emergencyName:
                    emergencyName ||
                    null,

                  emergencyPhone:
                    emergencyPhone ||
                    null,

                  specialRequests:
                    specialRequests ||
                    null,
                },

              trip_plan:
                bookingData.tripPlan,
            },
          ])
          .select()
          .single();

      if (error) {
        if (
          error.code ===
          "23505"
        ) {
          const {
            data:
              existingBooking,
            error:
              existingBookingError,
          } =
            await findBookingByIdempotencyKey(
              req.user.id,
              req.idempotencyKey
            );

          if (
            !existingBookingError &&
            existingBooking
          ) {
            if (
              userVoucherId
            ) {
              return res.status(409).json({
                success: false,
                message:
                  "This booking request is already being processed. Please wait a moment before trying again.",
              });
            }

            return res.status(200).json({
              success: true,
              message:
                "This booking request was already received.",
              idempotentReplay:
                true,
              booking:
                formatCreatedBooking(
                  existingBooking
                ),
            });
          }
        }

        logServerError(
          "Supabase booking error:",
          error
        );

        return res.status(500).json({
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
                new Date()
                  .toISOString(),

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
          logServerError(
            "Voucher usage error:",
            voucherUpdateError
          );

          const {
            error:
              rollbackError,
          } =
            await supabase
              .from("bookings")
              .delete()
              .eq(
                "id",
                data.id
              );

          if (
            rollbackError
          ) {
            logServerError(
              "Booking rollback error:",
              rollbackError
            );
          }

          return res.status(409).json({
            success: false,
            message:
              "The voucher could not be applied. Please try again.",
          });
        }
      }

      return res.status(201).json({
        success: true,

        message:
          "Booking request received!",

        idempotentReplay:
          false,

        booking:
          formatCreatedBooking(
            data
          ),
      });
    } catch (error) {
      logServerError(
        "Booking error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Something went wrong while creating the booking.",
      });
    }
  }
);


// =====================================================
// CLIENT — MY BOOKINGS
// =====================================================

app.get(
  "/api/my-bookings",

  requireAuth,

  async (req, res) => {
    try {
      const {
        data,
        error,
      } =
        await supabase
          .from("bookings")
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
        logServerError(
          "Get my bookings error:",
          error
        );

        return res.status(500).json({
          success: false,
          message:
            "Unable to retrieve your bookings.",
        });
      }

      return res.status(200).json({
        success: true,

        count:
          data.length,

        bookings:
          data.map(
            formatBooking
          ),
      });
    } catch (error) {
      logServerError(
        "Get my bookings error:",
        error
      );

      return res.status(500).json({
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

  async (req, res) => {
    try {
      const { id } =
        req.params;

      const {
        data,
        error,
      } =
        await supabase
          .from("bookings")
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
        return res.status(404).json({
          success: false,
          message:
            "Booking not found or you do not have access to it.",
        });
      }

      return res.status(200).json({
        success: true,

        booking:
          formatBooking(
            data
          ),
      });
    } catch (error) {
      logServerError(
        "Get my booking error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to retrieve your booking.",
      });
    }
  }
);


// =====================================================
// CLIENT — CANCELLATION REQUEST
// =====================================================

app.post(
  "/api/my-bookings/:id/cancellation-request",

  requireAuth,

  dailyCancellationRequestLimiter,

  cancellationRequestLimiter,

  async (req, res) => {
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
        return res.status(400).json({
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
          .from("bookings")
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
        return res.status(404).json({
          success: false,
          message:
            "Booking not found or you do not have access to it.",
        });
      }

      if (
        booking.status ===
        "Cancellation Requested"
      ) {
        return res.status(409).json({
          success: false,
          message:
            "A cancellation request is already pending admin approval.",
        });
      }

      if (
        booking.status ===
        "Cancelled"
      ) {
        return res.status(409).json({
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
        return res.status(409).json({
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
          .from("bookings")
          .update({
            status:
              "Cancellation Requested",

            status_before_cancellation:
              booking.status,

            cancellation_reason:
              reason ||
              null,

            cancellation_requested_at:
              new Date()
                .toISOString(),

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
        logServerError(
          "Cancellation request error:",
          updateError
        );

        return res.status(500).json({
          success: false,
          message:
            "Unable to submit your cancellation request.",
        });
      }

      return res.status(200).json({
        success: true,

        message:
          "Cancellation request submitted for admin approval.",

        booking:
          formatBooking(
            updatedBooking
          ),
      });
    } catch (error) {
      logServerError(
        "Request cancellation error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Something went wrong while requesting cancellation.",
      });
    }
  }
);


// =====================================================
// ADMIN — CANCELLATION RESOLUTION
// =====================================================

app.post(
  "/api/bookings/:id/cancellation-resolution",

  requireAdmin,

  adminMutationLimiter,

  async (req, res) => {
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
        return res.status(400).json({
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
          .from("bookings")
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
        return res.status(404).json({
          success: false,
          message:
            "Booking not found.",
        });
      }

      if (
        booking.status !==
        "Cancellation Requested"
      ) {
        return res.status(409).json({
          success: false,
          message:
            "This booking does not have a pending cancellation request.",
        });
      }

      const resolvedAt =
        new Date()
          .toISOString();


      // ===============================================
      // REJECT CANCELLATION
      // ===============================================

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
            .from("bookings")
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
          logServerError(
            "Reject cancellation error:",
            rejectError
          );

          return res.status(500).json({
            success: false,
            message:
              "Unable to reject the cancellation request.",
          });
        }

        return res.status(200).json({
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


      // ===============================================
      // APPROVE CANCELLATION
      // ===============================================

      const {
        data:
          cancelledBooking,

        error:
          cancelError,
      } =
        await supabase
          .from("bookings")
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
        logServerError(
          "Approve cancellation error:",
          cancelError
        );

        return res.status(500).json({
          success: false,
          message:
            "Unable to approve the cancellation request.",
        });
      }

      let voucherRestored =
        false;

      let voucherRestorationMessage =
        null;

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
            .from("vouchers")
            .select(`
              id,
              active,
              valid_from,
              valid_until
            `)
            .eq(
              "id",
              booking.voucher_id
            )
            .single();

        if (
          voucherError
        ) {
          logServerError(
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
            ) <= now;

          const hasNotExpired =
            !voucher.valid_until ||
            new Date(
              voucher.valid_until
            ) >= now;

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
              logServerError(
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

      return res.status(200).json({
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
      logServerError(
        "Resolve cancellation error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Something went wrong while resolving the cancellation request.",
      });
    }
  }
);


// =====================================================
// ADMIN — UPDATE BOOKING STATUS
// =====================================================

app.patch(
  "/api/bookings/:id",

  requireAdmin,

  adminMutationLimiter,

  async (req, res) => {
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
        return res.status(400).json({
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
          .from("bookings")
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
        logServerError(
          "Supabase update error:",
          error
        );

        return res.status(500).json({
          success: false,
          message:
            "Unable to update booking.",
        });
      }

      return res.status(200).json({
        success: true,

        message:
          "Booking status updated!",

        booking:
          formatBooking(
            data
          ),
      });
    } catch (error) {
      logServerError(
        "Update booking error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Something went wrong while updating booking.",
      });
    }
  }
);


// =====================================================
// PUBLIC — CONTACT FORM
// =====================================================

app.post(
  "/api/contact",

  dailyContactSubmissionLimiter,

  contactLimiter,

  async (req, res) => {
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
        return res.status(400).json({
          success: false,
          message:
            "Name, email, subject, and message are required.",
        });
      }

      if (
        String(name).length >
          120 ||
        String(email).length >
          254 ||
        String(subject).length >
          200 ||
        String(message).length >
          5000
      ) {
        return res.status(400).json({
          success: false,
          message:
            "One or more contact form fields are too long.",
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
        logServerError(
          "Contact message error:",
          error
        );

        return res.status(500).json({
          success: false,
          message:
            "Unable to send message.",
        });
      }

      return res.status(201).json({
        success: true,

        message:
          "Message sent successfully!",

        contact:
          formatContactMessage(
            data
          ),
      });
    } catch (error) {
      logServerError(
        "Contact error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Something went wrong while sending the message.",
      });
    }
  }
);


// =====================================================
// ADMIN — CONTACT MESSAGES
// =====================================================

app.get(
  "/api/contact-messages",

  requireAdmin,

  async (req, res) => {
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
        logServerError(
          "Get contact messages error:",
          error
        );

        return res.status(500).json({
          success: false,
          message:
            "Unable to retrieve contact messages.",
        });
      }

      return res.status(200).json({
        success: true,

        count:
          data.length,

        messages:
          data.map(
            formatContactMessage
          ),
      });
    } catch (error) {
      logServerError(
        "Get contact messages error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Something went wrong while retrieving messages.",
      });
    }
  }
);


app.get(
  "/api/contact-messages/:id",

  requireAdmin,

  async (req, res) => {
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
        contactError ||
        !contact
      ) {
        return res.status(404).json({
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
        logServerError(
          "Get reply history error:",
          repliesError
        );

        return res.status(500).json({
          success: false,
          message:
            "Unable to retrieve reply history.",
        });
      }

      return res.status(200).json({
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
      logServerError(
        "Get contact message error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to retrieve contact message.",
      });
    }
  }
);


app.patch(
  "/api/contact-messages/:id",

  requireAdmin,

  adminMutationLimiter,

  async (req, res) => {
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
        return res.status(400).json({
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
        logServerError(
          "Update contact message error:",
          error
        );

        return res.status(500).json({
          success: false,
          message:
            "Unable to update message status.",
        });
      }

      return res.status(200).json({
        success: true,

        message:
          "Message status updated!",

        contact:
          formatContactMessage(
            data
          ),
      });
    } catch (error) {
      logServerError(
        "Update contact message error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Something went wrong while updating message.",
      });
    }
  }
);


// =====================================================
// ADMIN — SEND CONTACT REPLY
// =====================================================

app.post(
  "/api/contact-messages/:id/reply",

  requireAdmin,

  dailyEmailReplyLimiter,

  adminEmailLimiter,

  async (req, res) => {
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
        return res.status(400).json({
          success: false,
          message:
            "Reply message is required.",
        });
      }

      if (
        replyMessage.length >
        10000
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Reply message is too long.",
        });
      }

      if (
        !resend ||
        !String(
          process.env
            .RESEND_FROM_EMAIL ||
            ""
        ).trim()
      ) {
        return res.status(503).json({
          success: false,
          message:
            "Email service is not configured.",
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
        return res.status(404).json({
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
        await resend.emails.send({
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
        logServerError(
          "Resend email error:",
          emailError
        );

        return res.status(500).json({
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
        logServerError(
          "Save reply error:",
          replyError
        );

        return res.status(500).json({
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
        logServerError(
          "Update replied status error:",
          statusError
        );
      }

      return res.status(200).json({
        success: true,

        message:
          "Reply sent successfully!",

        reply:
          formatContactReply(
            savedReply
          ),
      });
    } catch (error) {
      logServerError(
        "Send reply error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Something went wrong while sending the reply.",
      });
    }
  }
);


// =====================================================
// FALLBACKS / SAFE ERROR RESPONSES
// =====================================================

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message:
      "API endpoint not found.",
  });
});


app.use(
  (error, req, res, next) => {
    if (res.headersSent) {
      return next(error);
    }

    if (
      error?.type ===
        "entity.too.large"
    ) {
      return res.status(413).json({
        success: false,
        message:
          "Request body is too large.",
      });
    }

    if (
      error instanceof
        SyntaxError &&
      error.status === 400 &&
      Object.prototype.hasOwnProperty.call(
        error,
        "body"
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Request body contains invalid JSON.",
      });
    }

    logServerError(
      "Unhandled API error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "An unexpected server error occurred.",
    });
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
