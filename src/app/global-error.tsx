"use client";

import { useEffect } from "react";

/** Root fallback when the app shell itself fails. Keep dependencies minimal. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          fontFamily: "Georgia, 'Times New Roman', serif",
          background: "linear-gradient(180deg, #f8f6f1 0%, #eef0e3 100%)",
          color: "#1f4e3d",
        }}
      >
        <main
          style={{
            maxWidth: 640,
            margin: "0 auto",
            padding: "20vh 24px 48px",
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: "Arial, Helvetica, sans-serif",
              fontSize: 11,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#c96a3d",
            }}
          >
            TRIS Travels
          </p>
          <h1 style={{ margin: "12px 0 0", fontSize: 40, fontWeight: 400, lineHeight: 1.15 }}>
            Something broke on our side
          </h1>
          <p style={{ margin: "16px 0 0", fontSize: 17, lineHeight: 1.6, color: "#5c6350" }}>
            Please try again. If this keeps happening, email tristravelbookings@gmail.com and we’ll
            help.
          </p>
          <div style={{ marginTop: 32, display: "flex", flexWrap: "wrap", gap: 12 }}>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                border: 0,
                borderRadius: 999,
                padding: "12px 22px",
                background: "#364037",
                color: "#f8f6f1",
                fontFamily: "Arial, Helvetica, sans-serif",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                borderRadius: 999,
                padding: "12px 22px",
                border: "1px solid rgba(54,64,55,0.35)",
                color: "#1f4e3d",
                textDecoration: "none",
                fontFamily: "Arial, Helvetica, sans-serif",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Back home
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
