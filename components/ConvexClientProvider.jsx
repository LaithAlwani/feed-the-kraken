"use client";

import { useState } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";

export default function ConvexClientProvider({ children }) {
  // Construct lazily, and only when the env var is actually present.
  // This keeps Next.js static prerender (404, build-time pages) from
  // crashing when NEXT_PUBLIC_CONVEX_URL hasn't been threaded through —
  // e.g. on a fresh Vercel deploy before env vars are configured.
  const [convex] = useState(() => {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    return url ? new ConvexReactClient(url) : null;
  });

  if (!convex) return children;

  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
