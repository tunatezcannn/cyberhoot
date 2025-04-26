import { useState } from "react";
import { Form, useNavigate } from "@remix-run/react";

const questionTypes = [
  { value: "multiple-choice", label: "Multiple Choice" },
  { value: "open-ended", label: "Open Ended" },
];

const Dashboard = () => {
  const [topic, setTopic] = useState("");
  const [questionType, setQuestionType] = useState("multiple-choice");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to quiz page with topic and question type as query params
    navigate(`/quiz?topic=${encodeURIComponent(topic)}&type=${questionType}`);
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
            <h1 className="text-3xl font-bold text-white text-glow">CyberHoot</h1>
          </div>
          <p className="mb-6 text-center text-sm text-gray-400">Test your cybersecurity knowledge</p>
          
          <Form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="topic" className="block text-sm font-medium text-gray-300">
                Topic
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full rounded-md border border-cyber-border bg-cyber-dark px-3 py-2 text-white placeholder:text-gray-500 focus:border-cyber-green focus:outline-none focus:ring-1 focus:ring-cyber-green"
                  placeholder="e.g. Password Security, Phishing"
                  required
                />
                <svg className="absolute right-3 top-2.5 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="questionType" className="block text-sm font-medium text-gray-300">
                Question Type
              </label>
              <div className="relative">
                <select
                  id="questionType"
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value)}
                  className="w-full appearance-none rounded-md border border-cyber-border bg-cyber-dark px-3 py-2 text-white focus:border-cyber-green focus:outline-none focus:ring-1 focus:ring-cyber-green"
                >
                  {questionTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <svg className="absolute right-3 top-2.5 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            <button
              type="submit"
              className="group relative w-full overflow-hidden rounded-md bg-cyber-green px-4 py-3 text-sm font-bold text-cyber-dark transition-all duration-300 hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-cyber-green focus:ring-offset-2 focus:ring-offset-cyber-navy"
            >
              <span className="relative z-10 flex items-center justify-center">
                START QUIZ
                <svg className="ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </button>
          </Form>
          
          <div className="mt-8 flex items-center justify-center">
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <svg className="h-3 w-3 animate-pulse-slow text-cyber-green" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="12" />
              </svg>
              <span>Secure your knowledge</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 