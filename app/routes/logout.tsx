import { redirect } from "@remix-run/node";
import { clearAuthToken } from "~/services/authService";

export const loader = async () => {
  // If they visit this route directly, just redirect to login
  clearAuthToken();
  
  // Create headers with cookie clearing directives
  const headers = new Headers();
  headers.set("Location", "/login");
  headers.append("Set-Cookie", "auth_token=; Max-Age=0; Path=/; SameSite=Strict");
  headers.append("Set-Cookie", "username=; Max-Age=0; Path=/; SameSite=Strict");
  
  // Create a response that redirects and also clears cookies on the server side
  return new Response(null, {
    status: 302,
    headers
  });
}; 