import type { MetaFunction } from "@remix-run/react";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Register - CyberHoot" },
    { name: "description", content: "Create your CyberHoot account" },
  ];
};

export default function Register() {
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
          
          <form className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="first-name" className="block text-sm font-medium text-gray-300">
                  First name
                </label>
                <input
                  type="text"
                  id="first-name"
                  className="w-full rounded-md border border-cyber-border bg-cyber-dark px-3 py-2 text-white placeholder:text-gray-500 focus:border-cyber-green focus:outline-none focus:ring-1 focus:ring-cyber-green"
                  placeholder="John"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="last-name" className="block text-sm font-medium text-gray-300">
                  Last name
                </label>
                <input
                  type="text"
                  id="last-name"
                  className="w-full rounded-md border border-cyber-border bg-cyber-dark px-3 py-2 text-white placeholder:text-gray-500 focus:border-cyber-green focus:outline-none focus:ring-1 focus:ring-cyber-green"
                  placeholder="Doe"
                  required
                />
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
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-300">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="confirm-password"
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
              className="group relative w-full overflow-hidden rounded-md bg-cyber-green px-4 py-3 text-sm font-bold text-cyber-dark transition-all duration-300 hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-cyber-green focus:ring-offset-2 focus:ring-offset-cyber-navy"
            >
              <span className="relative z-10 flex items-center justify-center">
                CREATE ACCOUNT
                <svg className="ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
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