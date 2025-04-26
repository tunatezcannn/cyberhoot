import { useRouteLoaderData } from "@remix-run/react";

/**
 * A hook to access the environment variables that are exposed
 * through the env route loader.
 */
export function useEnv() {
  const data = useRouteLoaderData<{ BASE_URL: string }>("routes/env");
  
  if (!data) {
    throw new Error(
      "Environment data is not available. Make sure you're using this hook " +
      "in a component that's rendered within the env route."
    );
  }
  
  return {
    BASE_URL: data.BASE_URL
  };
}