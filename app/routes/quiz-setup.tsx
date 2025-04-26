import { useState } from "react";
import { Link, useNavigate } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "CyberHoot - Quiz Setup" },
    { name: "description", content: "Set up your cybersecurity quiz" },
  ];
};

export default function QuizSetup() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("cybersecurity");
  const [questionType, setQuestionType] = useState("multiple-choice");
  const [multiplayer, setMultiplayer] = useState(false);
  const [questionCount, setQuestionCount] = useState(5);
  
  const handleStartQuiz = () => {
    const queryParams = new URLSearchParams();
    queryParams.set("topic", topic);
    queryParams.set("type", questionType);
    queryParams.set("multiplayer", multiplayer.toString());
    queryParams.set("count", questionCount.toString());
    
    navigate(`/quiz?${queryParams.toString()}`);
  };
  
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
          
          <h2 className="mb-6 text-xl font-bold text-center text-white">Quiz Setup</h2>
          
          <div className="space-y-6">
            {/* Topic Input - Replacing the buttons with a text input */}
            <div className="cyber-border mb-4 p-4 bg-cyber-dark">
              <h3 className="text-lg font-medium text-white mb-3">Enter Topic</h3>
              <div className="w-full">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. cybersecurity, network security, data privacy..."
                  className="w-full p-3 bg-cyber-navy border border-cyber-border rounded-md text-white focus:border-cyber-green focus:outline-none"
                />
                <p className="mt-2 text-xs text-gray-400">
                  Enter any cybersecurity topic you want to be quizzed on
                </p>
              </div>
            </div>
            
            {/* Question Type Selection */}
            <div className="cyber-border mb-4 p-4 bg-cyber-dark">
              <h3 className="text-lg font-medium text-white mb-3">Question Type</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setQuestionType("multiple-choice")}
                  className={`p-3 rounded-md ${
                    questionType === "multiple-choice" 
                    ? "bg-cyber-green text-cyber-dark" 
                    : "bg-cyber-navy border border-cyber-border text-white hover:border-cyber-green"
                  }`}
                >
                  Multiple Choice
                </button>
                <button
                  onClick={() => setQuestionType("open-ended")}
                  className={`p-3 rounded-md ${
                    questionType === "open-ended" 
                    ? "bg-cyber-green text-cyber-dark" 
                    : "bg-cyber-navy border border-cyber-border text-white hover:border-cyber-green"
                  }`}
                >
                  Open Ended
                </button>
              </div>
            </div>
            
            {/* Question Count Selection */}
            <div className="cyber-border mb-4 p-4 bg-cyber-dark">
              <h3 className="text-lg font-medium text-white mb-3">Number of Questions</h3>
              <div className="w-full">
                <div className="flex items-center justify-between">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                    className="w-full mr-4 accent-cyber-green"
                  />
                  <div className="bg-cyber-navy border border-cyber-border rounded-md p-2 min-w-[50px] text-center">
                    <span className="text-white font-mono">{questionCount}</span>
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  Select how many questions you want in your quiz
                </p>
              </div>
            </div>
            
            {/* Multiplayer Selection */}
            <div className="cyber-border mb-4 p-4 bg-cyber-dark">
              <h3 className="text-lg font-medium text-white mb-3">Game Mode</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setMultiplayer(false)}
                  className={`p-3 rounded-md ${
                    !multiplayer 
                    ? "bg-cyber-green text-cyber-dark" 
                    : "bg-cyber-navy border border-cyber-border text-white hover:border-cyber-green"
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Single Player
                  </div>
                </button>
                <button
                  onClick={() => setMultiplayer(true)}
                  className={`p-3 rounded-md ${
                    multiplayer 
                    ? "bg-cyber-green text-cyber-dark" 
                    : "bg-cyber-navy border border-cyber-border text-white hover:border-cyber-green"
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Multiplayer
                  </div>
                </button>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-3 mt-6">
              <Link 
                to="/"
                className="cyber-border px-6 py-3 text-center bg-cyber-dark text-white transition-all duration-300 hover:border-cyber-green hover:text-cyber-green"
              >
                Back to Home
              </Link>
              
              <button
                onClick={handleStartQuiz}
                className="group relative overflow-hidden rounded-md bg-cyber-green px-6 py-3 text-sm font-bold text-cyber-dark transition-all duration-300 hover:bg-opacity-90"
                disabled={!topic.trim()}
              >
                <span className="relative z-10 flex items-center justify-center">
                  Start Quiz
                  <svg className="ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 