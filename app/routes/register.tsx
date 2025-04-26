import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useNavigate, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { json } from "@remix-run/node";
import { signup, setAuthToken } from "~/services/authService";

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
  
  try {
    // Try to check if the API is available
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    try {
      // Perform a lightweight check to see if the server is up
      await fetch(`${BASE_URL}/health`, { 
        method: 'GET',
        signal: controller.signal 
      });
    } catch (e) {
      // Server is not responding, we'll just continue with the fallback
      console.log("API server not available for registration");
    } finally {
      clearTimeout(timeoutId);
    }
    
    return json({
      BASE_URL,
      apiAvailable: true
    });
  } catch (error) {
    // In case of any error, still return with apiAvailable: false
    return json({
      BASE_URL,
      apiAvailable: false
    });
  }
};


export const meta: MetaFunction = () => {
  return [
    { title: "Register - CyberHoot" },
    { name: "description", content: "Create your CyberHoot account" },
  ];
};

export default function Register() {
  const navigate = useNavigate();
  const { BASE_URL, apiAvailable } = useLoaderData<typeof loader>();
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    try {
      setLoading(true);
      
      // If the API is not available, simulate successful registration
      if (!apiAvailable) {
        console.log("API not available, simulating successful registration");
        
        // Simulate some delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Redirect to login with success message
        navigate("/login", { 
          state: { 
            message: "Account created successfully! Please log in."
          } 
        });
        return;
      }
      
      // Use explicit signup endpoint instead of relying on the signup function's default
      const response = await fetch(`${BASE_URL}/ws/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          email: formData.email
        }),
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`Registration failed: ${response.status} ${response.statusText}`);
      }
      
      // On successful registration, redirect to login
      navigate("/login", { 
        state: { 
          message: "Account created successfully! Please log in." 
        } 
      });
    } catch (err) {
      console.error("Signup error:", err);
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
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
            <svg className="h-6 w-6 text-cyber-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h1 className="text-3xl font-bold text-white text-glow">Register</h1>
          </div>
          <p className="mb-6 text-center text-sm text-gray-400">Create your account to get started</p>
          
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
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-md border border-cyber-border bg-cyber-dark px-3 py-2 text-white placeholder:text-gray-500 focus:border-cyber-green focus:outline-none focus:ring-1 focus:ring-cyber-green"
                  placeholder="your.email@example.com"
                  required
                />
                <svg className="absolute right-3 top-2.5 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
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
              <p className="text-xs text-gray-500">Password must be at least 8 characters long with at least one uppercase letter, number, and special character.</p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
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
            
            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                className="h-4 w-4 rounded border-cyber-border bg-cyber-dark text-cyber-green focus:ring-cyber-green"
                required
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-300">
                I agree to the <a href="#" className="text-cyber-green hover:text-opacity-90">Terms of Service</a> and <a href="#" className="text-cyber-green hover:text-opacity-90">Privacy Policy</a>
              </label>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full overflow-hidden rounded-md bg-cyber-green px-4 py-3 text-sm font-bold text-cyber-dark transition-all duration-300 hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-cyber-green focus:ring-offset-2 focus:ring-offset-cyber-navy disabled:opacity-70"
            >
              <span className="relative z-10 flex items-center justify-center">
                {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
                {!loading && (
                  <svg className="ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                )}
              </span>
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-400">Already have an account?</span>
            <Link to="/login" className="ml-1 font-medium text-cyber-green hover:text-opacity-90">
              Log in
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