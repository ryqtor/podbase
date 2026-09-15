"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { setAuthToken } from "./api-client";

/**
 * Hook that automatically syncs the Clerk session token
 * to the ApiClient. Call this once at the app root.
 *
 * Usage:
 *   useAuthSync(); // in your main page/layout component
 */
export function useAuthSync() {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isSignedIn) {
      setAuthToken(null);
      return;
    }

    // Get initial token
    getToken().then((token) => {
      setAuthToken(token);
    });

    // Refresh token periodically (every 50 seconds, tokens expire at 60s)
    const interval = setInterval(async () => {
      try {
        const token = await getToken();
        setAuthToken(token);
      } catch {
        setAuthToken(null);
      }
    }, 50_000);

    return () => clearInterval(interval);
  }, [getToken, isSignedIn]);
}
