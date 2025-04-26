import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { isAuthenticated } from "~/services/authService";

export const meta: MetaFunction = () => {
  return [
    { title: "Dashboard - CyberHoot" },
    { name: "description", content: "Your CyberHoot Dashboard" },
  ];
};

// Loader function to check if user is authenticated
export const loader: LoaderFunction = async ({ request }) => {
  // Check if user is authenticated
  if (!isAuthenticated()) {
    // Redirect to login page if not authenticated
    return redirect("/login");
  }
  
  // Return data for the dashboard
  return json({
    user: "Test User", // Replace with actual user data when available
  });
};

export default function Dashboard() {
  const data = useLoaderData<typeof loader>();
  
  return (
    <div className="min-h-screen bg-cyber-dark">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6 border-b border-cyber-border">
          <div className="flex items-center">
            <svg className="h-8 w-8 text-cyber-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h1 className="ml-2 text-2xl font-bold text-white">CyberHoot</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-gray-300">Welcome, {data.user}</span>
            <button className="rounded-md bg-cyber-dark border border-cyber-border px-3 py-1.5 text-sm text-gray-300 hover:border-cyber-green">
              Logout
            </button>
          </div>
        </div>
        
        <main className="py-10">
          <h2 className="text-2xl font-bold text-white mb-6">Your Dashboard</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-cyber-navy p-6 rounded-xl border border-cyber-border shadow-cyber">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Latest Quiz</h3>
                <svg className="h-6 w-6 text-cyber-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-gray-400 mb-4">Continue your cyber security training with our latest quiz.</p>
              <Link 
                to="/quiz"
                className="block w-full rounded-md bg-cyber-green px-4 py-2 text-center text-sm font-bold text-cyber-dark hover:bg-opacity-90"
              >
                Start Quiz
              </Link>
            </div>
            
            <div className="bg-cyber-navy p-6 rounded-xl border border-cyber-border shadow-cyber">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Progress</h3>
                <svg className="h-6 w-6 text-cyber-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-400">Completion</span>
                  <span className="text-cyber-green font-medium">75%</span>
                </div>
                <div className="w-full bg-cyber-dark rounded-full h-2">
                  <div className="bg-cyber-green h-2 rounded-full" style={{ width: "75%" }}></div>
                </div>
              </div>
              <Link 
                to="/progress" 
                className="block w-full rounded-md border border-cyber-green bg-transparent px-4 py-2 text-center text-sm font-bold text-cyber-green hover:bg-cyber-green hover:bg-opacity-10"
              >
                View Details
              </Link>
            </div>
            
            <div className="bg-cyber-navy p-6 rounded-xl border border-cyber-border shadow-cyber">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Leaderboard</h3>
                <svg className="h-6 w-6 text-cyber-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-400 mb-4">See how you rank against other participants.</p>
              <Link 
                to="/leaderboard" 
                className="block w-full rounded-md border border-cyber-green bg-transparent px-4 py-2 text-center text-sm font-bold text-cyber-green hover:bg-cyber-green hover:bg-opacity-10"
              >
                View Leaderboard
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 