import { NextResponse } from "next/server";

export async function GET() {
  const spec = {
    openapi: "3.0.0",
    info: {
      title: "Cruise API",
      version: "0.1.0",
      description:
        "Authentication: Sign in at /login first. This app uses NextAuth session cookies.\n\n" +
        "Use the Authorize button in Swagger to attach a cookie manually if needed. In dev, the cookie name is `next-auth.session-token`; in production it is `__Secure-next-auth.session-token`.\n\n" +
        "Demo users: alice@example.com, bob@example.com, carla@example.com, crew@example.com, admin@example.com. Some endpoints require crew/admin.",
    },
    security: [{ sessionCookie: [] }],
    paths: {
      "/api/me": {
        get: {
          summary: "Current session, guest and effective access",
          responses: {
            200: {
              description: "OK",
              content: { "application/json": { examples: { success: { value: { session: { user: { email: "alice@example.com", role: "guest" } }, access: { role: "guest" }, guest: { id: "01ABC...", firstName: "Alice" }, currentSailing: { id: "01S..." }, assignment: { cabinId: "01C..." } } } } } },
            },
          },
        },
      },
      "/api/ships": {
        get: { summary: "List ships", responses: { 200: { description: "OK", content: { "application/json": { examples: { success: { value: [{ id: "01SHIP...", name: "MV Horizon", code: "HZN" }] } } } } } } },
      },
      "/api/ships/{id}": {
        get: {
          summary: "Get ship",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "OK", content: { "application/json": { examples: { success: { value: { id: "01SHIP...", name: "MV Horizon", code: "HZN" } } } } } }, 404: { $ref: "#/components/responses/NotFound" } },
        },
      },
      "/api/sailings": {
        get: { summary: "List sailings", responses: { 200: { description: "OK", content: { "application/json": { examples: { success: { value: [{ id: "01SAIL...", shipId: "01SHIP..." }] } } } } } } },
      },
      "/api/sailings/{id}": {
        get: {
          summary: "Get sailing",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "OK", content: { "application/json": { examples: { success: { value: { id: "01SAIL...", itineraryDays: [{ dayNumber: 1, portName: "Miami" }] } } } } } }, 404: { $ref: "#/components/responses/NotFound" } },
        },
      },
      "/api/catalog": {
        get: {
          summary: "Browse products",
          parameters: [
            { name: "type", in: "query", schema: { type: "string" } },
            { name: "venueId", in: "query", schema: { type: "string" } },
            { name: "day", in: "query", schema: { type: "integer" } },
          ],
          responses: { 200: { description: "OK", content: { "application/json": { examples: { success: { value: [{ id: "01PROD...", type: "dining", title: "Aurora" }] } } } } } },
        },
      },
      "/api/products/{id}": {
        get: {
          summary: "Get product detail",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "OK", content: { "application/json": { examples: { success: { value: { id: "01PROD...", title: "Aurora" } } } } } }, 404: { $ref: "#/components/responses/NotFound" } },
        },
      },
      "/api/products/{id}/timeslots": {
        get: {
          summary: "List timeslots for product",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
            { name: "sailingId", in: "query", required: true, schema: { type: "string" } },
            { name: "day", in: "query", schema: { type: "integer" } },
          ],
          responses: { 200: { description: "OK", content: { "application/json": { examples: { success: { value: [{ id: "01SLOT...", start: "2025-08-12T22:00:00Z", remaining: 10 }] } } } } } },
        },
      },
      "/api/timeslots/lookup": {
        get: {
          summary: "Lookup timeslots by IDs",
          parameters: [
            { name: "ids", in: "query", required: true, description: "Comma-separated timeslot IDs", schema: { type: "string" } },
          ],
          responses: {
            200: {
              description: "OK",
              content: {
                "application/json": {
                  examples: {
                    success: {
                      value: [
                        { id: "01SLOT...", productId: "01PROD...", sailingId: "01SAIL...", itineraryDayNumber: 1, start: "2025-08-12T22:00:00Z", end: "2025-08-13T00:00:00Z", capacity: 40 },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/bookings": {
        get: {
          summary: "My bookings",
          responses: { 200: { description: "OK", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Booking" } } } } }, 401: { $ref: "#/components/responses/Unauthorized" } },
        },
        post: {
          summary: "Create booking",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/CreateBookingInput" } } },
          },
          responses: {
            201: { description: "Created", content: { "application/json": { schema: { $ref: "#/components/schemas/Booking" } } } },
            400: { $ref: "#/components/responses/ValidationError" },
            401: { $ref: "#/components/responses/Unauthorized" },
            409: { $ref: "#/components/responses/Conflict" },
          },
        },
      },
      "/api/bookings/{id}": {
        patch: {
          summary: "Update booking (cancel)",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { status: { type: "string", enum: ["cancelled"] } }, required: ["status"] } } } },
          responses: {
            200: { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/Booking" } } } },
            400: { $ref: "#/components/responses/ValidationError" },
            401: { $ref: "#/components/responses/Unauthorized" },
            403: { $ref: "#/components/responses/Forbidden" },
            404: { $ref: "#/components/responses/NotFound" },
          },
        },
      },
      "/api/cabins": {
        get: {
          summary: "List cabins by ship or sailing",
          parameters: [
            { name: "shipId", in: "query", schema: { type: "string" } },
            { name: "sailingId", in: "query", schema: { type: "string" } },
          ],
          responses: { 200: { description: "OK", content: { "application/json": { examples: { success: { value: [{ id: "01CAB...", number: "8012", deck: 8 }] } } } } } },
        },
      },
      "/api/cabins/{id}/guests": {
        get: {
          summary: "List guests in a cabin for current sailing",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "OK", content: { "application/json": { examples: { success: { value: { guests: [{ id: "01G...", email: "alice@example.com" }], assignments: [{ cabinId: "01CAB..." }] } } } } } }, 401: { $ref: "#/components/responses/Unauthorized" }, 403: { $ref: "#/components/responses/Forbidden" } },
        },
      },
      "/api/users": {
        get: { summary: "List user accounts (admin/crew)", responses: { 200: { description: "OK", content: { "application/json": { examples: { success: { value: [{ email: "admin@example.com", role: "admin", cabinNumber: "Captains Quarters" }] } } } } }, 403: { $ref: "#/components/responses/Forbidden" } } },
      },
      "/api/docs": {
        get: { summary: "OpenAPI JSON", responses: { 200: { description: "OK" } } },
      },
    },
    components: {
      securitySchemes: {
        sessionCookie: {
          type: "apiKey",
          in: "cookie",
          name: "next-auth.session-token",
          description:
            "NextAuth session cookie. In production deployments the cookie name is `__Secure-next-auth.session-token`.",
        },
      },
      schemas: {
        CreateBookingInput: {
          type: "object",
          properties: {
            guestId: { type: "string" },
            sailingId: { type: "string" },
            cabinId: { type: "string" },
            totalCents: { type: "integer" },
            forGuestIds: { type: "array", items: { type: "string" } },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  productId: { type: "string" },
                  timeslotId: { type: "string" },
                  quantity: { type: "integer" },
                  unitPriceCents: { type: "integer" },
                },
                required: ["productId", "timeslotId", "quantity", "unitPriceCents"],
              },
            },
          },
          required: ["guestId", "sailingId", "cabinId", "items", "totalCents"],
        },
        Booking: {
          type: "object",
          properties: {
            id: { type: "string" },
            guestId: { type: "string" },
            sailingId: { type: "string" },
            cabinId: { type: "string" },
            status: { type: "string", enum: ["held", "confirmed", "cancelled"] },
            createdAt: { type: "string" },
            totalCents: { type: "integer" },
            attendeeGuestIds: { type: "array", items: { type: "string" } },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  bookingId: { type: "string" },
                  productId: { type: "string" },
                  timeslotId: { type: "string" },
                  quantity: { type: "integer" },
                  unitPriceCents: { type: "integer" },
                },
              },
            },
          },
        },
        Problem: {
          type: "object",
          properties: {
            title: { type: "string" },
            detail: { type: "string" },
          },
        },
      },
      responses: {
        Unauthorized: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Problem" } } } },
        Forbidden: { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/Problem" } } } },
        NotFound: { description: "Not Found", content: { "application/json": { schema: { $ref: "#/components/schemas/Problem" } } } },
        ValidationError: { description: "Validation Error", content: { "application/json": { schema: { $ref: "#/components/schemas/Problem" } } } },
        Conflict: { description: "Conflict", content: { "application/json": { schema: { $ref: "#/components/schemas/Problem" } } } },
      },
    },
  };
  return NextResponse.json(spec);
}

