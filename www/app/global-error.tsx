"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          background: "#fcfcfc",
          color: "#161616",
        }}
      >
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <section
            style={{
              width: "100%",
              maxWidth: "32rem",
              border: "1px solid #ffc9c9",
              borderRadius: "0.5rem",
              background: "#fff5f5",
              padding: "1rem",
            }}
          >
            <h1 style={{ margin: "0 0 0.75rem", fontSize: "1.5rem" }}>
              Something went wrong
            </h1>
            <p style={{ margin: "0 0 1rem" }}>
              Football Pace hit an unexpected error while loading the app.
            </p>
            <button
              type="button"
              onClick={reset}
              style={{
                border: 0,
                borderRadius: "0.25rem",
                background: "#228be6",
                color: "white",
                cursor: "pointer",
                font: "inherit",
                fontWeight: 600,
                padding: "0.5rem 0.75rem",
              }}
            >
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
