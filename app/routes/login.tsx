import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useNavigate, useLoaderData, useLocation } from "@remix-run/react";
import { useState } from "react";
import { json } from "@remix-run/node";
import { login, setAuthToken } from "~/services/authService";

// Add Window interface extension for ENV property
declare global {
  interface Window {
    ENV?: {
      API_URL?: string;
    };
  }
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Get API base URL from environment variables, with fallback
  const BASE_URL = process.env.BASE_URL || "http://localhost:3001";
  

  return json({
    BASE_URL,
  });
};

export const meta: MetaFunction = () => {
  return [
    { title: "Login - CyberHoot" },
    { name: "description", content: "Log in to your CyberHoot account" },
  ];
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { BASE_URL } = useLoaderData<typeof loader>();
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const message = location.state?.message;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      
      const apiBaseUrl = BASE_URL;
      
      const response = await fetch(`${apiBaseUrl}/ws/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        }),
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`Login failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
            
      // Store token in cookie using authService.login
      await login({
        username: formData.username,
        password: formData.password
      }, apiBaseUrl);
      
      // Ensure the token is properly set
      if (data.token) {
        setAuthToken(data.token);
      }
      
      // Navigate to dashboard or home page after login
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cyber-dark">
      <div className="relative w-full max-w-md overflow-hidden rounded-xl bg-cyber-navy p-8 shadow-cyber">
        {/* Decorative elements */}
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyber-green opacity-10 blur-xl"></div>
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-cyber-green opacity-10 blur-xl"></div>
        
        <div className="relative z-10">
          <div className="mb-4 flex items-center justify-center space-x-2">
           <img src="/favicon.ico" alt="CyberHoot" className="h-10 w-10" />
            <h1 className="text-3xl font-bold text-white text-glow">Login</h1>
          </div>
          <p className="mb-6 text-center text-sm text-gray-400">Log in to access your account</p>
          
          {message && (
            <div className="mb-4 rounded-md bg-cyber-green bg-opacity-20 p-3 text-sm text-cyber-green">
              <p>{message}</p>
            </div>
          )}
          
          {error && (
            <div className="mb-4 rounded-md bg-red-500 bg-opacity-20 p-3 text-sm text-red-300">
              <p>{error}</p>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full rounded-md border border-cyber-border bg-cyber-dark px-3 py-2 text-white placeholder:text-gray-500 focus:border-cyber-green focus:outline-none focus:ring-1 focus:ring-cyber-green"
                  placeholder="johndoe"
                  required
                />
                <svg className="absolute right-3 top-2.5 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-md border border-cyber-border bg-cyber-dark px-3 py-2 text-white placeholder:text-gray-500 focus:border-cyber-green focus:outline-none focus:ring-1 focus:ring-cyber-green"
                  placeholder="••••••••"
                  required
                />
                <svg className="absolute right-3 top-2.5 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-cyber-border bg-cyber-dark text-cyber-green focus:ring-cyber-green"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full overflow-hidden rounded-md bg-cyber-green px-4 py-3 text-sm font-bold text-cyber-dark transition-all duration-300 hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-cyber-green focus:ring-offset-2 focus:ring-offset-cyber-navy disabled:opacity-70"
            >
              <span className="relative z-10 flex items-center justify-center">
                {loading ? 'LOGGING IN...' : 'LOG IN'}
                {!loading && (
                  <svg className="ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                )}
              </span>
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-400">Don't have an account?</span>
            <Link to="/register" className="ml-1 font-medium text-cyber-green hover:text-opacity-90">
              Register now
            </Link>
          </div>
          
          <div className="mt-8 flex items-center justify-center">
            <Link to="/" className="flex items-center text-sm text-gray-400 hover:text-cyber-green">
              <svg className="mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 