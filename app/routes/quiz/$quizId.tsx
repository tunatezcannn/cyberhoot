import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate, useParams } from "@remix-run/react";
import { useState } from "react";
import { isAuthenticated } from "~/services/authService";

// Quiz question types
type Question = {
  id: string;
  text: string;
  options: {
    id: string;
    text: string;
  }[];
  correctOptionId: string;
};

type Quiz = {
  id: string;
  title: string;
  description: string;
  questions: Question[];
};

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  // For server-side rendering, we skip the authentication check for now
  // In a real app, you would validate the token from cookies or session
  
  // Get API base URL from environment variables, with fallback
  const BASE_URL = process.env.BASE_URL || "http://localhost:3001";
  let apiAvailable = false;
  
  try {
    // Check if the API is available
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    try {
      // Perform a lightweight check to see if the server is up
      await fetch(`${BASE_URL}/health`, { 
        method: 'GET',
        signal: controller.signal 
      });
      apiAvailable = true;
    } catch (e) {
      // Server is not responding, we'll use mock data
      console.log("API server not available for quiz, using mock data");
      apiAvailable = false;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    console.error("Error checking API availability:", error);
  }
  
  const quizId = params.quizId;

  // In a real app, you would fetch this data from your API
  // Sample quiz data for demonstration
  const quiz: Quiz = {
    id: quizId || "default",
    title: quizId === "q1" ? "Cybersecurity Basics" : 
           quizId === "q2" ? "Password Management" :
           quizId === "q3" ? "Network Security" :
           "Advanced Cybersecurity",
    description: "Test your knowledge about fundamental cybersecurity concepts and best practices.",
    questions: [
      {
        id: "q1_1",
        text: "What is the primary purpose of a firewall?",
        options: [
          { id: "a", text: "To detect viruses" },
          { id: "b", text: "To monitor network traffic and block unauthorized access" },
          { id: "c", text: "To encrypt data" },
          { id: "d", text: "To back up data" }
        ],
        correctOptionId: "b"
      },
      {
        id: "q1_2",
        text: "Which of the following is NOT a good password practice?",
        options: [
          { id: "a", text: "Using different passwords for different accounts" },
          { id: "b", text: "Writing down passwords and keeping them near your computer" },
          { id: "c", text: "Using a password manager" },
          { id: "d", text: "Using two-factor authentication" }
        ],
        correctOptionId: "b"
      },
      {
        id: "q1_3",
        text: "What is phishing?",
        options: [
          { id: "a", text: "A type of malware that encrypts files" },
          { id: "b", text: "A method of securing wireless networks" },
          { id: "c", text: "An attempt to trick people into revealing sensitive information" },
          { id: "d", text: "A technique to speed up internet connection" }
        ],
        correctOptionId: "c"
      },
      {
        id: "q1_4",
        text: "What is two-factor authentication?",
        options: [
          { id: "a", text: "Using two different passwords" },
          { id: "b", text: "Using two different devices to log in" },
          { id: "c", text: "Using something you know and something you have to verify identity" },
          { id: "d", text: "Having two different user accounts" }
        ],
        correctOptionId: "c"
      },
      {
        id: "q1_5",
        text: "Which of these is NOT a common sign of a malware infection?",
        options: [
          { id: "a", text: "Computer runs slower than normal" },
          { id: "b", text: "Unexpected pop-ups appear" },
          { id: "c", text: "Computer automatically installs security updates" },
          { id: "d", text: "Programs crash frequently" }
        ],
        correctOptionId: "c"
      }
    ]
  };

  if (!quiz) {
    throw new Response("Quiz not found", { status: 404 });
  }

  return json({ 
    quiz,
    apiAvailable,
    BASE_URL
  });
};

export const meta: MetaFunction = () => {
  return [
    { title: "Quiz - CyberHoot" },
    { name: "description", content: "Take a cybersecurity quiz" },
  ];
};

export default function QuizPage() {
  const { quiz } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  
  const handleSelectAnswer = (questionId: string, optionId: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };
  
  const handleNext = () => {
    if (isLastQuestion) {
      setShowResults(true);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };
  
  const handlePrevious = () => {
    setCurrentQuestionIndex(prev => prev - 1);
  };
  
  const calculateScore = () => {
    let correctAnswers = 0;
    quiz.questions.forEach(question => {
      if (selectedAnswers[question.id] === question.correctOptionId) {
        correctAnswers++;
      }
    });
    return {
      score: correctAnswers,
      total: quiz.questions.length,
      percentage: Math.round((correctAnswers / quiz.questions.length) * 100)
    };
  };
  
  const handleFinish = () => {
    // In a real app, you would submit the results to your API
    // Then navigate back to the dashboard
    navigate("/dashboard", { 
      state: { 
        message: `You completed "${quiz.title}" with a score of ${calculateScore().percentage}%` 
      } 
    });
  };
  
  const progressPercentage = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  
  if (showResults) {
    const { score, total, percentage } = calculateScore();
    return (
      <div className="flex min-h-screen flex-col bg-cyber-dark">
        {/* Header */}
        <header className="border-b border-cyber-border bg-cyber-navy p-4 shadow-md">
          <div className="mx-auto flex max-w-3xl items-center justify-between">
            <div className="flex items-center space-x-2">
              <img src="/favicon.ico" alt="CyberHoot" className="h-10 w-10" />
              <h1 className="text-2xl font-bold text-white text-glow">CyberHoot</h1>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-8">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-xl bg-cyber-navy p-8 shadow-cyber">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-white">Quiz Results</h2>
                <p className="mt-2 text-gray-400">{quiz.title}</p>
              </div>
              
              <div className="mb-8 flex flex-col items-center">
                <div className="relative mb-4 flex h-40 w-40 items-center justify-center rounded-full border-8 border-cyber-navy-light">
                  <div 
                    className="absolute inset-0 rounded-full border-8 border-cyber-green"
                    style={{ 
                      clipPath: `polygon(50% 50%, 50% 0%, ${percentage >= 25 ? '100% 0%' : `${50 + 50 * (percentage / 25)}% 0%`}, ${percentage >= 50 ? '100% 100%' : '100% 50%'}, ${percentage >= 75 ? '0% 100%' : '50% 100%'}, ${percentage >= 100 ? '0% 0%' : '0% 50%'}, 50% 50%)`
                    }}
                  ></div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-cyber-green">{percentage}%</p>
                    <p className="text-sm text-gray-400">{score}/{total}</p>
                  </div>
                </div>
                
                <p className="mt-2 text-lg font-medium text-white">
                  {percentage >= 80 ? "Excellent! You're a cybersecurity expert." :
                   percentage >= 60 ? "Good job! You have solid knowledge." :
                   percentage >= 40 ? "Not bad. Keep studying to improve." :
                   "You need more practice with cybersecurity concepts."}
                </p>
              </div>
              
              <div className="space-y-4">
                {quiz.questions.map((question, index) => (
                  <div key={question.id} className="rounded-lg bg-cyber-dark p-4">
                    <p className="mb-2 font-medium text-white">
                      {index + 1}. {question.text}
                    </p>
                    <div className="ml-4 space-y-1">
                      {question.options.map(option => {
                        const isSelected = selectedAnswers[question.id] === option.id;
                        const isCorrect = option.id === question.correctOptionId;
                        
                        return (
                          <div 
                            key={option.id}
                            className={`flex items-center rounded-md p-2 ${
                              isSelected && isCorrect ? "bg-green-500 bg-opacity-20 text-green-400" :
                              isSelected && !isCorrect ? "bg-red-500 bg-opacity-20 text-red-400" :
                              isCorrect ? "bg-green-500 bg-opacity-10 text-green-400" :
                              "text-gray-400"
                            }`}
                          >
                            <span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full border border-current text-xs">
                              {option.id.toUpperCase()}
                            </span>
                            <span>{option.text}</span>
                            {isSelected && isCorrect && (
                              <svg className="ml-auto h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            {isSelected && !isCorrect && (
                              <svg className="ml-auto h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleFinish}
                  className="rounded-md bg-cyber-green px-6 py-3 text-sm font-bold text-cyber-dark transition-all hover:bg-opacity-90"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen flex-col bg-cyber-dark">
      {/* Header */}
      <header className="border-b border-cyber-border bg-cyber-navy p-4 shadow-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src="/favicon.ico" alt="CyberHoot" className="h-10 w-10" />
            <h1 className="text-2xl font-bold text-white text-glow">CyberHoot</h1>
          </div>
          <div className="text-sm text-gray-400">
            <span className="font-medium text-cyber-green">Question {currentQuestionIndex + 1}</span> of {quiz.questions.length}
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1 w-full bg-cyber-dark">
        <div 
          className="h-1 bg-cyber-green transition-all duration-300" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-white">{quiz.title}</h2>
            <p className="text-gray-400">{quiz.description}</p>
          </div>
          
          <div className="rounded-xl bg-cyber-navy p-6 shadow-cyber">
            <p className="mb-6 text-lg font-medium text-white">{currentQuestion.text}</p>
            
            <div className="space-y-3">
              {currentQuestion.options.map(option => (
                <button
                  key={option.id}
                  onClick={() => handleSelectAnswer(currentQuestion.id, option.id)}
                  className={`flex w-full items-center rounded-lg p-4 text-left transition-all ${
                    selectedAnswers[currentQuestion.id] === option.id
                      ? "border border-cyber-green bg-cyber-green bg-opacity-10 text-cyber-green"
                      : "border border-cyber-border bg-cyber-dark text-gray-300 hover:border-gray-400"
                  }`}
                >
                  <span 
                    className={`mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border text-sm ${
                      selectedAnswers[currentQuestion.id] === option.id
                        ? "border-cyber-green text-cyber-green"
                        : "border-gray-500 text-gray-500"
                    }`}
                  >
                    {option.id.toUpperCase()}
                  </span>
                  {option.text}
                </button>
              ))}
            </div>
            
            <div className="mt-8 flex justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="flex items-center rounded-md border border-cyber-border bg-transparent px-4 py-2 text-sm text-white transition-all hover:border-cyber-green hover:text-cyber-green disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Previous
              </button>
              
              <button
                onClick={handleNext}
                disabled={!selectedAnswers[currentQuestion.id]}
                className="flex items-center rounded-md bg-cyber-green px-4 py-2 text-sm font-medium text-cyber-dark transition-all hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLastQuestion ? "Finish Quiz" : "Next"}
                <svg className="ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 