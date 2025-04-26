import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate, useLoaderData } from "@remix-run/react";
import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import QuizInterface from "~/components/QuizInterface";
import QuizResults from "~/components/QuizResults";
import DifficultySettings from "~/components/DifficultySettings";
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
  
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResults, setQuizResults] = useState<{ answers: Record<number, string>; score: number } | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [gameCode, setGameCode] = useState<string>("");
  const [waitingForPlayers, setWaitingForPlayers] = useState(false);
  const [playersJoined, setPlayersJoined] = useState(0);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "all">("all");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Initialize authentication
  useEffect(() => {
    async function init() {
      try {
        if (!BASE_URL) {
          throw new Error("BASE_URL is not defined");
        }
        await initializeAuth(BASE_URL);
        setAuthInitialized(true);
      } catch (error) {
        console.error("Failed to initialize authentication:", error);
        setError("Failed to authenticate. Using fallback authentication if available.");
        setAuthInitialized(true); // Still continue with fallback
      }
    }
    
    init();
  }, [BASE_URL]);

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
    if (!authInitialized) {
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

  const handleDifficultyChange = (newDifficulty: "easy" | "medium" | "hard" | "all") => {
    setDifficulty(newDifficulty);
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

          {!quizStarted ? (
            waitingForPlayers ? (
              // Waiting room for multiplayer
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Game Code: <span className="text-cyber-green">{gameCode}</span></h2>
                <p className="mb-6 text-gray-400">Share this code with others to join this game</p>
                
                <div className="cyber-border bg-cyber-dark p-6 mb-8">
                  <div className="mb-4">
                    <div className="text-sm text-gray-400 mb-2">Players joined:</div>
                    <div className="flex justify-center space-x-4">
                      <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-lg font-bold">
                        1
                      </div>
                      {playersJoined >= 1 && (
                        <div className="h-12 w-12 rounded-full bg-red-500 flex items-center justify-center text-lg font-bold">
                          2
                        </div>
                      )}
                      {playersJoined >= 2 && (
                        <div className="h-12 w-12 rounded-full bg-yellow-500 flex items-center justify-center text-lg font-bold">
                          3
                        </div>
                      )}
                      {playersJoined >= 3 && (
                        <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center text-lg font-bold">
                          4
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="text-sm text-gray-400 mb-4">
                      {playersJoined < 3 ? `Waiting for more players... ${playersJoined + 1}/4` : 'All players joined!'}
                    </div>
                    <button
                      onClick={handleStartQuiz}
                      className="group relative overflow-hidden rounded-md bg-cyber-green px-8 py-3 text-sm font-bold text-cyber-dark transition-all duration-300 hover:bg-opacity-90"
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        Start Now
                      </span>
                    </button>
                  </div>
                </div>
                
                <Link 
                  to="/"
                  className="cyber-border inline-flex items-center bg-cyber-dark px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:border-cyber-green hover:text-cyber-green"
                >
                  <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Cancel Game
                </Link>
              </div>
            ) : (
              // Quiz intro screen
              <>
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
                
                {/* Difficulty Settings for Single Player only */}
                {!isMultiplayer && (
                  <DifficultySettings 
                    selectedDifficulty={difficulty}
                    onDifficultyChange={handleDifficultyChange}
                  />
                )}
                
                <div className="mb-8 rounded-lg border border-dashed border-cyber-border bg-cyber-dark/50 p-6 text-center">
                  <div className="mb-4 flex justify-center">
                    <svg className="h-12 w-12 text-cyber-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h2 className="mb-2 text-xl font-bold text-white">Ready to Start Your Quiz?</h2>
                  <p className="mb-6 text-gray-400">
                    You'll have 20 seconds per question. The quiz will contain {questionCount} questions on {topic}.
                    {difficulty !== "all" && ` Difficulty level: ${difficulty}.`}
                  </p>
                  
                  <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button 
                      onClick={handleStartQuiz}
                      className="group relative overflow-hidden rounded-md bg-cyber-green px-6 py-3 text-sm font-bold text-cyber-dark transition-all duration-300 hover:bg-opacity-90"
                      disabled={isLoading}
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        {isLoading ? "Loading..." : "Single Player"}
                        {!isLoading && (
                          <svg className="ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        )}
                      </span>
                    </button>
                    
                    <button 
                      onClick={handleStartWaiting}
                      className="group relative overflow-hidden rounded-md border border-cyber-green bg-transparent px-6 py-3 text-sm font-bold text-cyber-green transition-all duration-300 hover:bg-cyber-green/10"
                      disabled={isLoading}
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        {isLoading ? "Loading..." : "Multiplayer"}
                        {!isLoading && (
                          <svg className="ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        )}
                      </span>
                    </button>
                  </div>
                  
                  {error && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-md">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
                    <svg className="h-3 w-3 text-cyber-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Each session is timed with immediate feedback</span>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <Link 
                    to="/"
                    className="cyber-border flex items-center bg-cyber-dark px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:border-cyber-green hover:text-cyber-green"
                  >
                    <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Dashboard
                  </Link>
                </div>
              </>
            )
          ) : quizCompleted && quizResults ? (
            // Quiz completed screen
            <QuizResults 
              score={quizResults.score}
              totalQuestions={questions.filter(q => q.type === "multiple-choice").length}
              topic={topic}
              timeTaken={elapsedTime}
              onRestart={handleRestartQuiz}
              multiplayerMode={isMultiplayer || waitingForPlayers}
              difficulty={difficulty}
            />
          ) : isLoading ? (
            // Loading screen
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyber-green mb-4"></div>
              <p className="text-gray-400 mb-2">Loading questions...</p>
              <p className="text-xs text-gray-500">This may take a few moments as we connect to our question database.</p>
            </div>
          ) : error ? (
            // Error screen
            <div className="text-center py-10">
              <svg className="h-16 w-16 text-red-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-bold mb-2">Error Loading Questions</h3>
              <p className="mb-6 text-gray-400">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  loadQuestions();
                }}
                className="cyber-border bg-cyber-dark px-6 py-2 hover:border-cyber-green transition-all"
              >
                Try Again
              </button>
            </div>
          ) : questions.length > 0 ? (
            // Quiz in progress
            <QuizInterface 
              questions={questions}
              quizType={questionType}
              onComplete={handleQuizComplete}
              timePerQuestion={20}
              difficulty={difficulty}
            />
          ) : (
            // Empty state - this shouldn't normally happen but just in case
            <div className="text-center py-10">
              <p className="text-gray-400 mb-4">No questions available. Please try again.</p>
              <button
                onClick={loadQuestions}
                className="cyber-border bg-cyber-dark px-6 py-2 hover:border-cyber-green transition-all"
              >
                Load Questions
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 