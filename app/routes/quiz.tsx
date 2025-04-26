import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams, useNavigate, useLoaderData } from "@remix-run/react";
import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { motion, AnimatePresence } from "framer-motion";
import QuizInterface from "~/components/QuizInterface";
import QuizResults from "~/components/QuizResults";
import { fetchQuizQuestions, USE_API, FALLBACK_QUESTIONS } from "~/services/quizService";
import { initializeAuth } from "~/services/authService";
import type { QuizQuestion } from "~/services/quizService";

export const meta: MetaFunction = () => {
  return [
    { title: "CyberHoot Quiz" },
    { name: "description", content: "Test your cybersecurity knowledge" },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return json({
    BASE_URL: process.env.BASE_URL
  });
};

export default function Quiz() {
  const { BASE_URL } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const topic = searchParams.get("topic") || "cybersecurity";
  const questionType = searchParams.get("type") || "multiple-choice";
  const multiplayerParam = searchParams.get("multiplayer");
  const isMultiplayer = multiplayerParam === "true";
  const countParam = searchParams.get("count");
  const questionCount = countParam ? parseInt(countParam) : 5;
  const difficultyParam = searchParams.get("difficulty");
  const difficulty = (difficultyParam === "easy" || difficultyParam === "medium" || 
                     difficultyParam === "hard" || difficultyParam === "all") 
                     ? difficultyParam as "easy" | "medium" | "hard" | "all" 
                     : "all";
  
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResults, setQuizResults] = useState<{ answers: Record<number, string>; score: number } | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [gameCode, setGameCode] = useState<string>("");
  const [waitingForPlayers, setWaitingForPlayers] = useState(false);
  const [playersJoined, setPlayersJoined] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const effectRan = useRef(false);

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
      
      .shadow-glow-sm {
        box-shadow: 0 0 8px rgba(255, 255, 255, 0.4);
      }
    `;
    document.head.appendChild(styleElement);
    
    // Clean up the style element when component unmounts
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Initialize authentication
  useEffect(() => {
    async function init() {
      // Skip duplicate calls in development with StrictMode
      if (effectRan.current) return;
      effectRan.current = true;
      
      try {
        if (!BASE_URL) {
          throw new Error("BASE_URL is not defined");
        }
        await initializeAuth(BASE_URL);
        setAuthInitialized(true);
        console.log("Authentication initialized");
        // Once authenticated, automatically load questions
        loadQuestions();
      } catch (error) {
        console.error("Failed to initialize authentication:", error);
        setError("Failed to authenticate. Using fallback authentication if available.");
        setAuthInitialized(false); // Still continue with fallback
        
        // Try to load questions with fallback
        loadQuestions();
      }
    }
    
    init();
  }, [BASE_URL]);

  // Auto-start the quiz when questions are loaded
  useEffect(() => {
    if (questions.length > 0 && !quizStarted && !error) {
      setQuizStarted(true);
    }
  }, [questions, quizStarted, error]);

  // Generate a random game code
  useEffect(() => {
    if (isMultiplayer) {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      setGameCode(code);
    }
  }, [isMultiplayer]);

  // Load questions when difficulty, topic, or question type changes
  useEffect(() => {
    // Clear any existing questions when settings change
    setQuestions([]);
    setError(null);
  }, [topic, questionType, difficulty]);

  // Timer for tracking total quiz time
  useEffect(() => {
    let timerId: NodeJS.Timeout;
    
    if (quizStarted && !quizCompleted) {
      timerId = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [quizStarted, quizCompleted]);

  // Simulate players joining for multiplayer mode
  useEffect(() => {
    if (waitingForPlayers && playersJoined < 3) {
      const interval = setInterval(() => {
        setPlayersJoined(prev => {
          if (prev < 3) {
            return prev + 1;
          }
          clearInterval(interval);
          return prev;
        });
      }, 1500);
      
      return () => clearInterval(interval);
    }
  }, [waitingForPlayers, playersJoined]);

  const handleStartWaiting = () => {
    setWaitingForPlayers(true);
    // Simulate auto-start after all players join
    setTimeout(() => {
      if (waitingForPlayers) {
        handleStartQuiz();
      }
    }, 6000);
  };

  const loadQuestions = async () => {
    // Prevent duplicate calls if already loading
    if (isLoading) return;
    
    if (authInitialized) {
      setError("Authentication not initialized. Please wait or refresh the page.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the baseUrl from the loader data
      const fetchPromise = await fetchQuizQuestions(
        topic, 
        questionType,
        difficulty,
        questionCount, // Use the count from URL parameters
        BASE_URL
      );
      
      // Set a timeout to ensure we don't wait too long for questions
      const timeoutPromise = new Promise<QuizQuestion[]>((_, reject) => {
        setTimeout(() => reject(new Error("Request timed out")), 10000);
      });
      
      // Race the fetch against the timeout
      const fetchedQuestions = await Promise.race([fetchPromise, timeoutPromise]);
      
      if (fetchedQuestions.length === 0) {
        throw new Error("No questions received");
      }
      
      setQuestions(fetchedQuestions);
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to load questions:", err);
      setIsLoading(false);
      setError("Unable to load quiz questions. Please try again later.");
    }
  };

  const handleStartQuiz = async () => {
    setWaitingForPlayers(false);
    
    // Load questions if not already loaded
    if (questions.length === 0) {
      await loadQuestions();
    }
    
    if (error) {
      // If there was an error loading questions, don't start the quiz
      return;
    }
    
    setQuizStarted(true);
    setElapsedTime(0);
  };

  const handleQuizComplete = (results: { answers: Record<number, string>; score: number }) => {
    setQuizCompleted(true);
    setQuizResults(results);
  };

  const handleRestartQuiz = () => {
    // Navigate to quiz setup page instead of restarting directly
    navigate("/quiz-setup");
  };

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  };
  
  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 24 
      } 
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cyber-dark bg-gradient-to-br from-cyber-dark via-cyber-dark/95 to-black p-4 overflow-hidden">
      {/* Background grid effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,200,150,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(0,200,150,0.07)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      
      {/* Floating particles */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
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
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Decorative elements */}
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyber-green opacity-10 blur-xl animate-pulse"></div>
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-cyber-green opacity-10 blur-xl animate-pulse" style={{ animationDelay: "2s" }}></div>
        
        <div className="relative z-10">
          <motion.div 
            className="mb-4 flex items-center justify-center space-x-2"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <img src="/favicon.ico" alt="CyberHoot" className="h-10 w-10" />
            <h1 className="text-3xl font-bold text-white text-glow animate-pulse">CyberHoot</h1>
          </motion.div>

          <AnimatePresence mode="wait">
            {!quizStarted ? (
              waitingForPlayers ? (
                // Waiting room for multiplayer
                <motion.div 
                  className="text-center"
                  key="waiting-room"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.h2 
                    className="text-2xl font-bold mb-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    Game Code: <span className="text-cyber-green">{gameCode}</span>
                  </motion.h2>
                  <motion.p 
                    className="mb-6 text-gray-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    Share this code with others to join this game
                  </motion.p>
                  
                  <motion.div 
                    className="cyber-border bg-cyber-dark/80 backdrop-blur-sm p-6 mb-8 rounded-lg shadow-lg"
                    variants={container}
                    initial="hidden"
                    animate="show"
                  >
                    <motion.div className="mb-4" variants={item}>
                      <div className="text-sm text-gray-400 mb-2">Players joined:</div>
                      <div className="flex justify-center space-x-4">
                        <motion.div 
                          className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-lg font-bold shadow-glow-sm"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          1
                        </motion.div>
                        {playersJoined >= 1 && (
                          <motion.div 
                            className="h-12 w-12 rounded-full bg-red-500 flex items-center justify-center text-lg font-bold shadow-glow-sm"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10, delay: 0.2 }}
                          >
                            2
                          </motion.div>
                        )}
                        {playersJoined >= 2 && (
                          <motion.div 
                            className="h-12 w-12 rounded-full bg-yellow-500 flex items-center justify-center text-lg font-bold shadow-glow-sm"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10, delay: 0.4 }}
                          >
                            3
                          </motion.div>
                        )}
                        {playersJoined >= 3 && (
                          <motion.div 
                            className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center text-lg font-bold shadow-glow-sm"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10, delay: 0.6 }}
                          >
                            4
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                    
                    <motion.div className="flex flex-col items-center" variants={item}>
                      <div className="text-sm text-gray-400 mb-4">
                        {playersJoined < 3 ? `Waiting for more players... ${playersJoined + 1}/4` : 'All players joined!'}
                      </div>
                      <motion.button
                        onClick={handleStartQuiz}
                        className="group relative overflow-hidden rounded-md bg-cyber-green px-8 py-3 text-sm font-bold text-cyber-dark transition-all duration-300 hover:bg-opacity-90 shadow-lg hover:shadow-cyber-green/40"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className="relative z-10 flex items-center justify-center">
                          Start Now
                        </span>
                        <span className="absolute inset-0 bg-gradient-to-r from-cyber-green to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      </motion.button>
                    </motion.div>
                  </motion.div>
                  
                  <motion.div
                    variants={item}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link 
                      to="/dashboard"
                      className="cyber-border inline-flex items-center bg-cyber-dark/80 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:border-cyber-green hover:text-cyber-green rounded-md group"
                    >
                      <svg className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Cancel Game
                    </Link>
                  </motion.div>
                </motion.div>
              ) : (
                // Quiz intro screen
                <motion.div 
                  key="quiz-intro"
                  variants={container}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0, y: -20 }}
                >
                  <motion.div variants={item} className="cyber-border mb-8 mt-6 flex flex-col md:flex-row md:items-center md:justify-between bg-cyber-dark/80 backdrop-blur-sm p-4 rounded-lg shadow-lg">
                    <div className="flex flex-col mb-3 md:mb-0">
                      <span className="text-xs font-semibold uppercase text-gray-500">Topic</span>
                      <span className="text-lg font-medium text-white">{topic}</span>
                    </div>
                    <div className="hidden md:block h-10 w-[1px] bg-cyber-border"></div>
                    <div className="flex flex-col mb-3 md:mb-0">
                      <span className="text-xs font-semibold uppercase text-gray-500">Type</span>
                      <span className="text-lg font-medium text-white">
                        {questionType === "multiple-choice" ? "Multiple Choice" : "Open Ended"}
                      </span>
                    </div>
                    <div className="hidden md:block h-10 w-[1px] bg-cyber-border"></div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold uppercase text-gray-500">Difficulty</span>
                      <span className="text-lg font-medium text-white capitalize">
                        {difficulty}
                      </span>
                    </div>
                  </motion.div>
                  
                  <motion.div variants={item} className="mb-8 rounded-lg border border-dashed border-cyber-border bg-cyber-dark/50 backdrop-blur-sm p-6 text-center shadow-lg hover:shadow-cyber-green/10 transition-all duration-500">
                    <div className="mb-4 flex justify-center">
                      {isLoading ? (
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyber-green"></div>
                      ) : (
                        <svg className="h-12 w-12 text-cyber-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      )}
                    </div>
                    <motion.h2 
                      className="mb-2 text-xl font-bold text-white"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {isLoading ? "Loading Your Quiz..." : "Ready to Start Your Quiz"}
                    </motion.h2>
                    <motion.p 
                      className="mb-6 text-gray-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      {isLoading ? (
                        "Please wait while we prepare your questions..."
                      ) : (
                        <>
                          You'll have 20 seconds per question. The quiz will contain {questionCount} questions on {topic}.
                          {difficulty !== "all" && ` Difficulty level: ${difficulty}.`}
                        </>
                      )}
                    </motion.p>
                    
                    {!isLoading && (
                      <motion.div 
                        className="flex justify-center"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <motion.button 
                          onClick={isMultiplayer ? handleStartWaiting : handleStartQuiz}
                          className="group relative overflow-hidden rounded-md bg-cyber-green px-6 py-3 text-sm font-bold text-cyber-dark transition-all duration-300 hover:bg-opacity-90 shadow-lg hover:shadow-cyber-green/40"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <span className="relative z-10 flex items-center justify-center">
                            {isMultiplayer ? "Start Multiplayer" : "Start Quiz Now"}
                            <svg className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </span>
                          <span className="absolute inset-0 bg-gradient-to-r from-cyber-green to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                        </motion.button>
                      </motion.div>
                    )}
                    
                    {error && (
                      <motion.div 
                        className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-md"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <p className="text-red-400 text-sm">{error}</p>
                      </motion.div>
                    )}
                  </motion.div>
                  
                  <motion.div variants={item} className="flex justify-center">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link 
                        to="/dashboard"
                        className="cyber-border flex items-center bg-cyber-dark/80 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:border-cyber-green hover:text-cyber-green rounded-md group"
                      >
                        <svg className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Dashboard
                      </Link>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )
            ) : quizCompleted && quizResults ? (
              // Quiz completed screen
              <motion.div
                key="quiz-completed"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <QuizResults 
                  score={quizResults.score}
                  totalQuestions={questions.filter(q => q.type === "multiple-choice").length}
                  topic={topic}
                  timeTaken={elapsedTime}
                  onRestart={handleRestartQuiz}
                  multiplayerMode={isMultiplayer || waitingForPlayers}
                  difficulty={difficulty}
                />
              </motion.div>
            ) : isLoading ? (
              // Loading screen
              <motion.div 
                className="text-center py-12"
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div 
                  className="inline-block rounded-full h-12 w-12 border-t-2 border-b-2 border-cyber-green mb-4"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                ></motion.div>
                <motion.p 
                  className="text-gray-400 mb-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Loading questions...
                </motion.p>
                <motion.p 
                  className="text-xs text-gray-500"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  This may take a few moments as we connect to our question database.
                </motion.p>
              </motion.div>
            ) : error ? (
              // Error screen
              <motion.div 
                className="text-center py-10"
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.svg 
                  className="h-16 w-16 text-red-500 mx-auto mb-4"
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                  transition={{ type: "spring", duration: 0.5, delay: 0.2 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </motion.svg>
                <motion.h3 
                  className="text-xl font-bold mb-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Error Loading Questions
                </motion.h3>
                <motion.p 
                  className="mb-6 text-gray-400"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {error}
                </motion.p>
                <motion.button
                  onClick={() => {
                    setError(null);
                    loadQuestions();
                  }}
                  className="cyber-border bg-cyber-dark/80 px-6 py-2 hover:border-cyber-green transition-all rounded-md shadow-lg hover:shadow-cyber-green/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  Try Again
                </motion.button>
              </motion.div>
            ) : questions.length > 0 ? (
              // Quiz in progress
              <motion.div
                key="quiz-interface"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <QuizInterface 
                  questions={questions}
                  quizType={questionType}
                  onComplete={handleQuizComplete}
                  difficulty={difficulty}
                  baseUrl={BASE_URL}
                />
              </motion.div>
            ) : (
              // Empty state - this shouldn't normally happen but just in case
              <motion.div 
                className="text-center py-10"
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.p 
                  className="text-gray-400 mb-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  No questions available. Please try again.
                </motion.p>
                <motion.button
                  onClick={loadQuestions}
                  className="cyber-border bg-cyber-dark/80 px-6 py-2 hover:border-cyber-green transition-all rounded-md shadow-lg hover:shadow-cyber-green/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Load Questions
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
} 