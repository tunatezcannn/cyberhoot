import { redirect } from "@remix-run/node";
import { clearAuthToken } from "~/services/authService";

export const loader = async () => {
  // If they visit this route directly, just redirect to login
  clearAuthToken();
  return redirect("/");
}; 