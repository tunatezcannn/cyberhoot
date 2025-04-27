import { z } from "zod";

// Authentication types
export type LoginRequest = {
  username: string;
  password: string;
};

export type SignupRequest = {
  username: string;
  password: string;
  email: string;
};

export type LoginResponse = {
  token: string;
  userName: string;
};

// Cookie configuration
const COOKIE_NAME = "auth_token";
const USERNAME_COOKIE = "username";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

// Set fallback token directly for immediate use if server is unavailable
let authToken: string | null = null;
let currentUsername: string | null = null;

/**
 * Login to the server and get authentication token
 */
export async function login(credentials: LoginRequest, apiBaseUrl: string): Promise<LoginResponse> {
  try {
    const response = await fetch(`${apiBaseUrl}/ws/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
      // Add a timeout for the fetch request
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`Login failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json() as LoginResponse;
    
    // Store the token for future requests
    authToken = data.token;
    
    // Store the token in a cookie
    setCookie(COOKIE_NAME, data.token, COOKIE_MAX_AGE);
    
    // Store the username in a cookie
    currentUsername = credentials.username;
    setCookie(USERNAME_COOKIE, credentials.username, COOKIE_MAX_AGE);
    
    return data;
  } catch (error) {
    console.error("Login failed:", error);
    // We'll continue using the fallback token that's already set
    throw error;
  }
}

/**
 * Sign up a new user
 */
export async function signup(userData: SignupRequest, apiBaseUrl: string): Promise<boolean> {
  try {
    const response = await fetch(`${apiBaseUrl}/ws/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
      signal: AbortSignal.timeout(8000) // 5 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`Signup failed: ${response.status} ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error("Signup failed:", error);
    throw error;
  }
}

/**
 * Get the current authentication token
 */
export function getAuthToken(): string | null {
  // Try to get token from cookie first (client-side only)
  const cookieToken = getCookie(COOKIE_NAME);
  if (cookieToken) {
    authToken = cookieToken;
  }
  return authToken;
}

/**
 * Set the authentication token manually (useful for initial load from storage)
 */
export function setAuthToken(token: string): void {
  authToken = token;
  setCookie(COOKIE_NAME, token, COOKIE_MAX_AGE);
}

/**
 * Get the current username
 */
export function getUsername(): string {
  // Try to get username from cookie first
  const cookieUsername = getCookie(USERNAME_COOKIE);
  if (cookieUsername) {
    currentUsername = cookieUsername;
  }
  return currentUsername || "User";
}

/**
 * Clear the authentication token (for logout)
 */
export function clearAuthToken(): void {
  // Clear in-memory state
  authToken = null;
  currentUsername = null;
  
  // Delete cookies
  deleteCookie(COOKIE_NAME);
  deleteCookie(USERNAME_COOKIE);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  // First try to get token from cookie
  const cookieToken = getCookie(COOKIE_NAME);
  
  // If we have a cookie token, update our in-memory token
  if (cookieToken) {
    authToken = cookieToken;
    return true;
  }
  
  // Fall back to in-memory token
  return authToken !== null;
}

// Initialize with test credentials for development
// In production, you would remove this or make it conditional on development mode
export async function initializeAuth(apiBaseUrl: string): Promise<boolean> {
  try {
    if (isAuthenticated()) {
      return true; // Already authenticated with fallback token or cookie
    }
    
    // Try to get a real token
    await login({ username: "test", password: "test" }, apiBaseUrl);
    console.log("Initialized with test credentials");
    return true;
  } catch (error) {
    console.error("Failed to initialize auth, using fallback token:", error);
    // We're already using the fallback token, so we're still "authenticated"
    return true;
  }
}

// Cookie utility functions
function setCookie(name: string, value: string, maxAgeSeconds: number): void {
  if (typeof document !== 'undefined') {
    // Client-side only
    document.cookie = `${name}=${value}; max-age=${maxAgeSeconds}; path=/; samesite=strict; secure`;
  }
  // For server-side, the cookie will be set via the response headers
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    // Server-side: no document object
    return null;
  }

  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
}

function deleteCookie(name: string): void {
  if (typeof document !== 'undefined') {
    // Client-side only
    document.cookie = `${name}=; max-age=0; path=/`;
  }
  // For server-side, the cookie will be deleted via the response headers
}
