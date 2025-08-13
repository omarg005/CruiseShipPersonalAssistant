export function getApiBase(): string {
  const mcp = process.env.NEXT_PUBLIC_MCP_HOST?.trim();
  const base = process.env.NEXT_PUBLIC_API_BASE?.trim();
  const host = mcp || base || "";
  if (!host) return "";
  // remove trailing slash
  return host.endsWith("/") ? host.slice(0, -1) : host;
}

