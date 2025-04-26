import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";

/**
 * This loader exposes environment variables to the client-side application
 * Be careful not to expose sensitive information
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  return json({
    BASE_URL: process.env.BASE_URL
  });
};

/**
 * Since this is a data-only route (no UI),
 * we simply return null for the component.
 */
export default function Env() {
  return null;
}
