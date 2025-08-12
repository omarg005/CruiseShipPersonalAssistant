"use client";
import { useEffect, useRef } from "react";

export default function DocsPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Inject Swagger UI assets from CDN to avoid React legacy lifecycles
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://unpkg.com/swagger-ui-dist@5/swagger-ui.css";
    document.head.appendChild(css);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js";
    script.async = true;
    script.onload = () => {
      // @ts-ignore
      const SwaggerUIBundle = window.SwaggerUIBundle;
      if (SwaggerUIBundle && containerRef.current) {
        SwaggerUIBundle({
          url: "/api/docs",
          domNode: containerRef.current,
          docExpansion: "list",
          defaultModelsExpandDepth: 0,
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      document.head.removeChild(css);
    };
  }, []);

  return <div ref={containerRef} style={{ height: "100vh" }} />;
}

