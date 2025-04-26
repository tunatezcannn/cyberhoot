import { Link, useSearchParams } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "CyberHoot Quiz" },
    { name: "description", content: "Test your cybersecurity knowledge" },
  ];
};

export default function Quiz() {
  const [searchParams] = useSearchParams();
  const topic = searchParams.get("topic") || "General Knowledge";
  const questionType = searchParams.get("type") || "multiple-choice";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cyber-dark p-4">
      <div className="relative w-full max-w-xl overflow-hidden rounded-xl bg-cyber-navy p-8 shadow-cyber">
        {/* Decorative elements */}
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyber-green opacity-10 blur-xl"></div>
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-cyber-green opacity-10 blur-xl"></div>
        
        <div className="relative z-10">
          <div className="mb-4 flex items-center justify-center space-x-2">
            <svg className="h-6 w-6 text-cyber-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h1 className="text-3xl font-bold text-white text-glow">CyberHoot</h1>
          </div>

          <div className="cyber-border mb-8 mt-6 flex items-center justify-between bg-cyber-dark p-4">
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase text-gray-500">Topic</span>
              <span className="text-lg font-medium text-white">{topic}</span>
            </div>
            <div className="h-10 w-[1px] bg-cyber-border"></div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase text-gray-500">Type</span>
              <span className="text-lg font-medium text-white">
                {questionType === "multiple-choice" ? "Multiple Choice" : "Open Ended"}
              </span>
            </div>
          </div>
          
          <div className="mb-10 rounded-lg border border-dashed border-cyber-border bg-cyber-dark/50 p-6 text-center">
            <div className="mb-4 flex justify-center">
              <svg className="h-12 w-12 text-cyber-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-400">
              Quiz content will be displayed here. This is a placeholder for your cybersecurity questions.
            </p>
            <div className="mt-4 flex justify-center">
              <span className="inline-flex items-center rounded-full bg-cyber-navy px-3 py-1 text-xs font-medium text-cyber-green">
                <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                </svg>
                Ready to start
              </span>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Link 
              to="/"
              className="cyber-border flex items-center bg-cyber-dark px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:border-cyber-green hover:text-cyber-green focus:outline-none focus:ring-2 focus:ring-cyber-green focus:ring-offset-2 focus:ring-offset-cyber-navy"
            >
              <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 