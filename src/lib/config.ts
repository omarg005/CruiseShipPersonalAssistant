export function getApiBase(): string {
  const mcp = process.env.NEXT_PUBLIC_MCP_HOST?.trim();
  const base = process.env.NEXT_PUBLIC_API_BASE?.trim();
  const host = mcp || base || "";
  if (!host) return "";
  // remove trailing slash
  const normalized = host.endsWith("/") ? host.slice(0, -1) : host;
  // In production, ignore localhost/127.0.0.1 API base to avoid broken calls on Vercel
  const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/i.test(normalized);
  if (process.env.NODE_ENV === "production" && isLocal) return "";
  return normalized;
}

