export default function MCPPage() {
  const base = process.env.NEXT_PUBLIC_MCP_HOST || "http://localhost:3000";
  const openapi = `${base.replace(/\/$/, "")}/api/docs`;
  const exampleCatalog = `curl -H "cookie: next-auth.session-token=..." ${base}/api/catalog?type=dining`;
  const exampleBooking = `curl -X POST -H "content-type: application/json" -H "cookie: next-auth.session-token=..." \
  -d '{
    "guestId": "<guestId>",
    "sailingId": "<sailingId>",
    "cabinId": "<cabinId>",
    "items": [{"productId": "<productId>", "timeslotId": "<timeslotId>", "quantity": 1, "unitPriceCents": 0}],
    "totalCents": 0
  }' \
  ${base}/api/bookings`;
  const llmSnippet = `You are connected to an MCP host providing a cruise booking API.\nBase: ${base}\nOpenAPI: ${openapi}\nAuth: Session cookie (NextAuth). Obtain via /login and pass cookie header.\nUse endpoints to search catalog, list timeslots, and create or cancel bookings while respecting conflicts and capacity.`;
  return (
    <div className="prose max-w-none min-h-screen bg-blue-50">
      <h1>MCP Integration Guide</h1>
      <p>
        Configure your LLM client to use this application as a Model Context Protocol (MCP) host.
        The host exposes all REST endpoints under <code>/api/*</code>. Set the base with the environment variable
        <code>NEXT_PUBLIC_MCP_HOST</code> for the frontend, or use the absolute host directly from your LLM tooling.
      </p>
      <h2>Host</h2>
      <ul>
        <li>Base URL: <code>{base}</code></li>
        <li>OpenAPI: <code>{openapi}</code></li>
      </ul>
      <h2>Auth</h2>
      <p>
        Authenticate via NextAuth session cookie. In dev, the cookie is <code>next-auth.session-token</code>.
        In production, it is <code>__Secure-next-auth.session-token</code>. Log in at <code>/login</code>, then include the cookie in requests.
      </p>
      <h2>Key Endpoints</h2>
      <ul>
        <li><code>GET /api/me</code> — session, guest, effective access</li>
        <li><code>GET /api/catalog?type=...</code> — browse products</li>
        <li><code>GET /api/products/{'{'}id{'}'}</code> — product details</li>
        <li><code>GET /api/products/{'{'}id{'}'}/timeslots?sailingId=...</code> — availability</li>
        <li><code>POST /api/bookings</code> — create booking</li>
        <li><code>PATCH /api/bookings/{'{'}id{'}'}</code> — cancel booking</li>
        <li><code>GET /api/cabins/{'{'}id{'}'}/guests</code> — cabin roster (requires admin/crew or cabin member)</li>
      </ul>
      <h2>Request Examples</h2>
      <pre>{exampleCatalog}</pre>
      <pre>{exampleBooking}</pre>
      <h2>LLM Prompt Snippet</h2>
      <pre>{llmSnippet}</pre>
    </div>
  );
}

