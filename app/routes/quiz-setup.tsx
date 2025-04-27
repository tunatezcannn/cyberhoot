import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import { motion } from "framer-motion";

export const meta: MetaFunction = () => {
  return [
    { title: "CyberHoot - Quiz Setup" },
    { name: "description", content: "Set up your cybersecurity quiz" },
  ];
};

export default function QuizSetup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Extract URL params (if coming from dashboard)
  const topicParam = searchParams.get("topic");
  const typeParam = searchParams.get("type");
  const difficultyParam = searchParams.get("difficulty") as "easy" | "medium" | "hard" | null;
  const countParam = searchParams.get("count");
  
  const [topic, setTopic] = useState(topicParam || "cybersecurity");
  const [questionType, setQuestionType] = useState(typeParam || "multiple-choice");
  const [multiplayer, setMultiplayer] = useState(false);
  const [questionCount, setQuestionCount] = useState(countParam ? parseInt(countParam) : 5);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(difficultyParam || "easy");
  
  // Add CSS for animations only on the client side
  useEffect(() => {
    // This code only runs in the browser, not during SSR
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @keyframes float {
        0% {
          transform: translateY(0) translateX(0);
          opacity: 0;
        }
        10% {
          opacity: 0.5;
        }
        90% {
          opacity: 0.5;
        }
        100% {
          transform: translateY(-100vh) translateX(20px);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(styleElement);
    
    // Clean up the style element when component unmounts
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  
  const handleStartQuiz = () => {
    const queryParams = new URLSearchParams();
    queryParams.set("topic", topic);
    queryParams.set("type", questionType);
    queryParams.set("multiplayer", multiplayer.toString());
    queryParams.set("count", questionCount.toString());
    queryParams.set("difficulty", difficulty);
    
    navigate(`/quiz?${queryParams.toString()}`);
  };
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      }
    }
  };
  
  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cyber-dark bg-gradient-to-br from-cyber-dark to-black p-4 overflow-hidden">
      {/* Background grid effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,200,150,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(0,200,150,0.07)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      
      {/* Floating particles */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-cyber-green opacity-20"
            style={{
              width: `${Math.random() * 10 + 3}px`,
              height: `${Math.random() * 10 + 3}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 20 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          ></div>
        ))}
      </div>
      
      <motion.div 
        className="relative w-full max-w-2xl overflow-hidden rounded-xl backdrop-blur-sm bg-cyber-navy/90 p-8 shadow-[0_0_25px_rgba(0,255,180,0.2)] border border-cyber-green/20"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Decorative elements */}
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyber-green opacity-10 blur-xl animate-pulse"></div>
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-cyber-green opacity-10 blur-xl animate-pulse" style={{ animationDelay: "2s" }}></div>
        
        <div className="relative z-10">
          <motion.div 
            className="mb-4 flex items-center justify-center space-x-2"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <img src="/favicon.ico" alt="CyberHoot" className="h-10 w-10" />
            <h1 className="text-3xl font-bold text-white text-glow animate-pulse">CyberHoot</h1>
          </motion.div>
          
          <motion.h2 
            className="mb-6 text-xl font-bold text-center text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Quiz Setup
          </motion.h2>
          
          <motion.div 
            className="space-y-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {/* Topic Input - Replacing the buttons with a text input */}
            <motion.div variants={item} className="cyber-border mb-4 p-4 bg-cyber-dark/80 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-cyber-green/20 transition-all duration-300">
              <h3 className="text-lg font-medium text-white mb-3">Enter Topic</h3>
              <div className="w-full">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. cybersecurity, network security, data privacy..."
                  className="w-full p-3 bg-cyber-navy/70 border border-cyber-border rounded-md text-white focus:border-cyber-green focus:ring-2 focus:ring-cyber-green/50 focus:outline-none transition-all duration-300"
                />
                <p className="mt-2 text-xs text-gray-400">
                  Enter any cybersecurity topic you want to be quizzed on
                </p>
              </div>
            </motion.div>
            
            {/* Question Type Selection */}
            <motion.div variants={item} className="cyber-border mb-4 p-4 bg-cyber-dark/80 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-cyber-green/20 transition-all duration-300">
              <h3 className="text-lg font-medium text-white mb-3">Question Type</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <motion.button
                  onClick={() => setQuestionType("multiple-choice")}
                  className={`p-3 rounded-md ${
                    questionType === "multiple-choice" 
                    ? "bg-cyber-green text-cyber-dark shadow-lg shadow-cyber-green/20" 
                    : "bg-cyber-navy/70 border border-cyber-border text-white hover:border-cyber-green"
                  } transition-all duration-300 transform hover:scale-105`}
                  whileTap={{ scale: 0.98 }}
                >
                  Multiple Choice
                </motion.button>
                <motion.button
                  onClick={() => setQuestionType("open-ended")}
                  className={`p-3 rounded-md ${
                    questionType === "open-ended" 
                    ? "bg-cyber-green text-cyber-dark shadow-lg shadow-cyber-green/20" 
                    : "bg-cyber-navy/70 border border-cyber-border text-white hover:border-cyber-green"
                  } transition-all duration-300 transform hover:scale-105`}
                  whileTap={{ scale: 0.98 }}
                >
                  Open Ended
                </motion.button>
              </div>
            </motion.div>
            
            {/* Difficulty Selection */}
            <motion.div variants={item} className="cyber-border mb-4 p-4 bg-cyber-dark/80 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-cyber-green/20 transition-all duration-300">
              <h3 className="text-lg font-medium text-white mb-3">Difficulty Level</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <motion.button
                  onClick={() => setDifficulty("easy")}
                  className={`p-3 rounded-md ${
                    difficulty === "easy" 
                    ? "bg-cyber-green text-cyber-dark shadow-lg shadow-cyber-green/20" 
                    : "bg-cyber-navy/70 border border-cyber-border text-white hover:border-cyber-green"
                  } transition-all duration-300 transform hover:scale-105`}
                  whileTap={{ scale: 0.98 }}
                >
                  Easy
                </motion.button>
                <motion.button
                  onClick={() => setDifficulty("medium")}
                  className={`p-3 rounded-md ${
                    difficulty === "medium" 
                    ? "bg-cyber-green text-cyber-dark shadow-lg shadow-cyber-green/20" 
                    : "bg-cyber-navy/70 border border-cyber-border text-white hover:border-cyber-green"
                  } transition-all duration-300 transform hover:scale-105`}
                  whileTap={{ scale: 0.98 }}
                >
                  Medium
                </motion.button>
                <motion.button
                  onClick={() => setDifficulty("hard")}
                  className={`p-3 rounded-md ${
                    difficulty === "hard" 
                    ? "bg-cyber-green text-cyber-dark shadow-lg shadow-cyber-green/20" 
                    : "bg-cyber-navy/70 border border-cyber-border text-white hover:border-cyber-green"
                  } transition-all duration-300 transform hover:scale-105`}
                  whileTap={{ scale: 0.98 }}
                >
                  Hard
                </motion.button>
              </div>
            </motion.div>
            
            {/* Question Count Selection */}
            <motion.div variants={item} className="cyber-border mb-4 p-4 bg-cyber-dark/80 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-cyber-green/20 transition-all duration-300">
              <h3 className="text-lg font-medium text-white mb-3">Number of Questions</h3>
              <div className="w-full">
                <div className="flex items-center justify-between">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                    className="w-full mr-4 accent-cyber-green h-2 rounded-lg appearance-none cursor-pointer bg-cyber-navy"
                  />
                  <div className="bg-cyber-navy/70 border border-cyber-border rounded-md p-2 min-w-[50px] text-center transition-all duration-300">
                    <span className="text-white font-mono">{questionCount}</span>
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  Select how many questions you want in your quiz
                </p>
              </div>
            </motion.div>
            
            {/* Multiplayer Selection */}
            <motion.div variants={item} className="cyber-border mb-4 p-4 bg-cyber-dark/80 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-cyber-green/20 transition-all duration-300">
              <h3 className="text-lg font-medium text-white mb-3">Game Mode</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <motion.button
                  onClick={() => setMultiplayer(false)}
                  className={`p-3 rounded-md ${
                    !multiplayer 
                    ? "bg-cyber-green text-cyber-dark shadow-lg shadow-cyber-green/20" 
                    : "bg-cyber-navy/70 border border-cyber-border text-white hover:border-cyber-green"
                  } transition-all duration-300 transform hover:scale-105`}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Single Player
                  </div>
                </motion.button>
                <motion.button
                  onClick={() => setMultiplayer(true)}
                  className={`p-3 rounded-md ${
                    multiplayer 
                    ? "bg-cyber-green text-cyber-dark shadow-lg shadow-cyber-green/20" 
                    : "bg-cyber-navy/70 border border-cyber-border text-white hover:border-cyber-green"
                  } transition-all duration-300 transform hover:scale-105`}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Multiplayer
                  </div>
                </motion.button>
              </div>
            </motion.div>
            
            {/* Action Buttons */}
            <motion.div 
              variants={item} 
              className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-3 mt-6"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  to="/dashboard"
                  className="cyber-border px-6 py-3 text-center bg-cyber-dark/90 text-white transition-all duration-300 hover:border-cyber-green hover:text-cyber-green rounded-md flex items-center justify-center group"
                >
                  <svg className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Dashboard
                </Link>
              </motion.div>
              
              <motion.button
                onClick={handleStartQuiz}
                className="group relative overflow-hidden rounded-md bg-cyber-green px-6 py-3 text-sm font-bold text-cyber-dark transition-all duration-300 hover:bg-opacity-90 shadow-lg hover:shadow-cyber-green/40 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!topic.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 flex items-center justify-center">
                  Start Quiz
                  <svg className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-cyber-green to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
} 