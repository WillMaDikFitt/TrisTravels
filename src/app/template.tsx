import { ViewTransition } from "react";

/**
 * Cross-fade between routes.
 *
 * Skipped in development: Fast Refresh commits on every save, and the browser
 * rejects a view transition while the tab is hidden ("InvalidStateError:
 * Document hidden"), which floods the console. Visitors still get the effect.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "development") return <>{children}</>;

  return (
    <ViewTransition enter="route-enter" exit="route-exit">
      {children}
    </ViewTransition>
  );
}
