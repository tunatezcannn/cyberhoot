import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { clearAuthToken } from "~/services/authService";

export const action = async ({ request }: ActionFunctionArgs) => {
  // Clear the auth token (both in memory and cookie)
  clearAuthToken();
  
  // Redirect to login page
  return redirect("/login");
};

export const loader = async () => {
  // If they visit this route directly, just redirect to login
  clearAuthToken();
  return redirect("/login");
}; 