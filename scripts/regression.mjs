const API_URL = String(
  process.env.TEST_API_URL ||
    "http://localhost:5000"
).replace(/\/+$/, "");

const configuredFrontendUrl =
  process.env.TEST_FRONTEND_URL
    ? String(
        process.env.TEST_FRONTEND_URL
      ).replace(/\/+$/, "")
    : null;

const frontendCandidates =
  configuredFrontendUrl
    ? [configuredFrontendUrl]
    : [
        "http://localhost:5174",
        "http://localhost:5173",
      ];

const requestTimeoutMs = 10000;
const apiResponses = [];
const results = [];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function includesIgnoreCase(value, expected) {
  return String(value || "")
    .toLowerCase()
    .includes(
      String(expected).toLowerCase()
    );
}

async function fetchResult(
  url,
  options = {},
  trackApiResponse = false
) {
  const response = await fetch(url, {
    redirect: "manual",
    ...options,
    signal:
      AbortSignal.timeout(
        requestTimeoutMs
      ),
  });

  const text = await response.text();
  let json = null;

  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
  }

  const result = {
    status: response.status,
    headers: response.headers,
    text,
    json,
  };

  if (trackApiResponse) {
    apiResponses.push(result);
  }

  return result;
}

async function apiRequest(
  path,
  options = {}
) {
  return fetchResult(
    `${API_URL}${path}`,
    options,
    true
  );
}

async function check(name, run) {
  try {
    const detail = await run();

    results.push({
      name,
      passed: true,
      detail:
        typeof detail === "string"
          ? detail
          : "",
    });

    console.log(
      `[PASS] ${name}${
        detail ? ` - ${detail}` : ""
      }`
    );
  } catch (error) {
    results.push({
      name,
      passed: false,
      detail:
        error?.message ||
        String(error),
    });

    console.error(
      `[FAIL] ${name} - ${
        error?.message || error
      }`
    );
  }
}

function expectJsonStatus(
  response,
  expectedStatus
) {
  assert(
    response.status === expectedStatus,
    `Expected HTTP ${expectedStatus}, received ${response.status}.`
  );

  assert(
    includesIgnoreCase(
      response.headers.get(
        "content-type"
      ),
      "application/json"
    ),
    "Response was not JSON."
  );

  assert(
    response.json &&
      typeof response.json ===
        "object",
    "Response body was not valid JSON."
  );
}

console.log(
  "AddyVenture Phase 10.7 Regression Test"
);
console.log(`API: ${API_URL}`);
console.log(
  "This run does not create bookings, contact messages, vouchers, cancellations, or emails.\n"
);

let frontendUrl =
  frontendCandidates[0];

await check(
  "Frontend development server is reachable",
  async () => {
    for (const candidate of
      frontendCandidates) {
      try {
        const response =
          await fetchResult(
            `${candidate}/`
          );

        if (
          response.status === 200 &&
          response.text.includes(
            'id="root"'
          )
        ) {
          frontendUrl = candidate;
          return candidate;
        }
      } catch {
        // Try the next local Vite port.
      }
    }

    throw new Error(
      "Frontend was not found on ports 5174 or 5173. Start npm run dev first."
    );
  }
);

await check(
  "Backend health endpoint",
  async () => {
    const response = await apiRequest(
      "/api/health"
    );

    expectJsonStatus(response, 200);
    assert(
      response.json.success === true,
      "Health response did not report success."
    );

    return "HTTP 200";
  }
);

await check(
  "API security headers",
  async () => {
    const response = await apiRequest(
      "/api/health"
    );

    const expectedHeaders = [
      [
        "content-security-policy",
        "default-src 'none'",
      ],
      [
        "x-content-type-options",
        "nosniff",
      ],
      ["x-frame-options", "deny"],
      ["referrer-policy", "no-referrer"],
      ["permissions-policy", "camera=()"],
      ["x-robots-tag", "noindex"],
      ["cache-control", "no-store"],
    ];

    for (const [name, value] of
      expectedHeaders) {
      assert(
        includesIgnoreCase(
          response.headers.get(name),
          value
        ),
        `Missing or invalid ${name} header.`
      );
    }

    assert(
      !response.headers.get(
        "x-powered-by"
      ),
      "X-Powered-By should not be exposed."
    );

    return "baseline headers present";
  }
);

await check(
  "Global rate limiter is active",
  async () => {
    const response = await apiRequest(
      "/api/health"
    );

    assert(
      response.headers.get(
        "ratelimit"
      ) ||
        response.headers.get(
          "ratelimit-policy"
        ),
      "RateLimit headers were not present."
    );

    return "RateLimit header present";
  }
);

await check(
  "Approved frontend origin is allowed",
  async () => {
    const response = await apiRequest(
      "/api/health",
      {
        headers: {
          Origin: frontendUrl,
        },
      }
    );

    expectJsonStatus(response, 200);
    assert(
      response.headers.get(
        "access-control-allow-origin"
      ) === frontendUrl,
      "Allowed CORS origin was not reflected exactly."
    );

    return frontendUrl;
  }
);

await check(
  "Unapproved browser origin is blocked",
  async () => {
    const response = await apiRequest(
      "/api/health",
      {
        headers: {
          Origin:
            "https://untrusted.example",
        },
      }
    );

    expectJsonStatus(response, 403);
    assert(
      !response.headers.get(
        "access-control-allow-origin"
      ),
      "Blocked origin received an allow-origin header."
    );

    return "HTTP 403";
  }
);

await check(
  "CORS preflight configuration",
  async () => {
    const response = await apiRequest(
      "/api/bookings",
      {
        method: "OPTIONS",
        headers: {
          Origin: frontendUrl,
          "Access-Control-Request-Method":
            "POST",
          "Access-Control-Request-Headers":
            "authorization, content-type, idempotency-key",
        },
      }
    );

    assert(
      response.status === 204,
      `Expected HTTP 204, received ${response.status}.`
    );
    assert(
      response.headers.get(
        "access-control-allow-origin"
      ) === frontendUrl,
      "Preflight did not allow the frontend origin."
    );
    assert(
      includesIgnoreCase(
        response.headers.get(
          "access-control-allow-methods"
        ),
        "post"
      ),
      "POST was not listed in allowed methods."
    );
    assert(
      includesIgnoreCase(
        response.headers.get(
          "access-control-allow-headers"
        ),
        "idempotency-key"
      ),
      "Idempotency-Key was not allowed by CORS."
    );

    return "HTTP 204";
  }
);

const unauthorizedChecks = [
  ["Admin bookings", "GET", "/api/bookings"],
  [
    "Admin messages",
    "GET",
    "/api/contact-messages",
  ],
  [
    "Client bookings",
    "GET",
    "/api/my-bookings",
  ],
  [
    "Client vouchers",
    "GET",
    "/api/my-vouchers",
  ],
  [
    "Voucher redemption",
    "POST",
    "/api/redeem-voucher",
  ],
  [
    "Booking creation",
    "POST",
    "/api/bookings",
  ],
  [
    "Cancellation request",
    "POST",
    "/api/my-bookings/test-id/cancellation-request",
  ],
];

for (const [
  label,
  method,
  path,
] of unauthorizedChecks) {
  await check(
    `${label} rejects missing authentication`,
    async () => {
      const response = await apiRequest(
        path,
        {
          method,
          headers:
            method === "POST"
              ? {
                  "Content-Type":
                    "application/json",
                  ...(path ===
                  "/api/bookings"
                    ? {
                        "Idempotency-Key":
                          "phase10-7-test-key",
                      }
                    : {}),
                }
              : {},
          body:
            method === "POST"
              ? "{}"
              : undefined,
        }
      );

      expectJsonStatus(response, 401);
      assert(
        response.json.success === false,
        "Unauthorized response did not report failure."
      );

      return "HTTP 401";
    }
  );
}

await check(
  "Unknown API route uses safe JSON fallback",
  async () => {
    const response = await apiRequest(
      "/api/not-a-real-endpoint"
    );

    expectJsonStatus(response, 404);
    assert(
      response.json.message ===
        "API endpoint not found.",
      "Unexpected fallback error message."
    );

    return "HTTP 404";
  }
);

await check(
  "Invalid JSON is rejected safely",
  async () => {
    const response = await apiRequest(
      "/api/contact",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: '{"broken":',
      }
    );

    expectJsonStatus(response, 400);
    assert(
      includesIgnoreCase(
        response.json.message,
        "invalid json"
      ),
      "Invalid JSON response was not generic and clear."
    );

    return "HTTP 400";
  }
);

await check(
  "Oversized JSON body is rejected",
  async () => {
    const response = await apiRequest(
      "/api/contact",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          payload: "x".repeat(
            110 * 1024
          ),
        }),
      }
    );

    expectJsonStatus(response, 413);
    assert(
      includesIgnoreCase(
        response.json.message,
        "too large"
      ),
      "Oversized-body response was unexpected."
    );

    return "HTTP 413";
  }
);

await check(
  "Contact validation blocks empty submission",
  async () => {
    const response = await apiRequest(
      "/api/contact",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: "{}",
      }
    );

    expectJsonStatus(response, 400);
    return "HTTP 400, no database insert";
  }
);

await check(
  "Login validation blocks empty credentials",
  async () => {
    const response = await apiRequest(
      "/api/login",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: "{}",
      }
    );

    expectJsonStatus(response, 400);
    return "HTTP 400, no login request sent";
  }
);

await check(
  "Frontend public support assets",
  async () => {
    const [
      robots,
      preview,
      favicon,
      manifest,
    ] = await Promise.all([
      fetchResult(
        `${frontendUrl}/robots.txt`
      ),
      fetchResult(
        `${frontendUrl}/social-preview.png`
      ),
      fetchResult(
        `${frontendUrl}/favicon.svg`
      ),
      fetchResult(
        `${frontendUrl}/site.webmanifest`
      ),
    ]);

    assert(
      robots.status === 200 &&
        robots.text.includes(
          "User-agent: *"
        ),
      "robots.txt was missing or invalid."
    );
    assert(
      preview.status === 200 &&
        includesIgnoreCase(
          preview.headers.get(
            "content-type"
          ),
          "image/png"
        ),
      "Social preview image was missing."
    );
    assert(
      favicon.status === 200 &&
        includesIgnoreCase(
          favicon.headers.get(
            "content-type"
          ),
          "svg"
        ),
      "Compass favicon was missing."
    );
    assert(
      manifest.status === 200 &&
        manifest.json?.name ===
          "AddyVenture Travel & Tours",
      "Web manifest was missing or invalid."
    );

    return "robots, preview, favicon, manifest";
  }
);

await check(
  "Frontend SPA fallback supports custom 404 route",
  async () => {
    const response = await fetchResult(
      `${frontendUrl}/phase10-7-missing-page`
    );

    assert(
      response.status === 200,
      `Expected frontend fallback HTTP 200, received ${response.status}.`
    );
    assert(
      response.text.includes(
        'id="root"'
      ),
      "Frontend fallback did not return the React shell."
    );

    return "React shell returned";
  }
);

await check(
  "Basic concurrent health load",
  async () => {
    const requestCount = 25;
    const startedAt = performance.now();

    const responses =
      await Promise.all(
        Array.from(
          { length: requestCount },
          () =>
            apiRequest(
              "/api/health"
            )
        )
      );

    const durationMs =
      performance.now() -
      startedAt;

    const successful =
      responses.filter(
        (response) =>
          response.status === 200 &&
          response.json?.success ===
            true
      ).length;

    assert(
      successful === requestCount,
      `${successful}/${requestCount} concurrent requests succeeded.`
    );

    return `${successful}/${requestCount} passed in ${durationMs.toFixed(
      0
    )} ms`;
  }
);

await check(
  "Error responses do not expose secrets or stack traces",
  async () => {
    const unsafePattern =
      /(SUPABASE_SECRET_KEY|RESEND_API_KEY|service_role|node_modules|server\.js:\d+|at\s+\w+.*\(.+:\d+:\d+\))/i;

    const unsafeResponse =
      apiResponses.find(
        (response) =>
          response.status >= 400 &&
          unsafePattern.test(
            response.text
          )
      );

    assert(
      !unsafeResponse,
      "An API error response may expose internal details."
    );

    return "no leak markers found";
  }
);

const passed = results.filter(
  (result) => result.passed
).length;
const failed =
  results.length - passed;

console.log("\n----------------------------------------");
console.log(
  `Summary: ${passed} passed, ${failed} failed, ${results.length} total`
);

if (failed > 0) {
  console.log(
    "Fix or review failed checks before deployment."
  );
  process.exitCode = 1;
} else {
  console.log(
    "Automated Phase 10.7 checks passed."
  );
}
