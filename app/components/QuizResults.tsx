import { Link } from "@remix-run/react";
import { useState } from "react";
import ExpandableCard from "./ExpandableCard";
import QuestionSummary from "./QuestionSummary";
import { getExplanation } from "~/services/questionService";
import { getUsername } from "~/services/authService";
import ReactMarkdown from "react-markdown";

// Helper function to strip letter prefixes from options
const stripOptionPrefix = (option: string): string => {
  // Match patterns like "A)", "B) ", "C.", "D. "
  return option.replace(/^[A-D][\)\.\s]+\s*/i, '');
};

type QuizResultsProps = {
  score: number;
  totalQuestions: number;
  topic: string;
  timeTaken: number;
  onRestart: () => void;
  multiplayerMode?: boolean;
  difficulty?: "easy" | "medium" | "hard" | "all";
  questions?: any[]; // Add questions prop
  userAnswers?: Record<number, string>; // Add user answers prop
  questionPoints?: Record<number, number>; // Add questionPoints prop
};

const QuizResults = ({
  score,
  totalQuestions,
  topic,
  timeTaken,
  onRestart,
  multiplayerMode = false,
  difficulty = "all",
  questions = [], // Default to empty array
  userAnswers = {}, // Default to empty object
  questionPoints = {}, // Default to empty object
}: QuizResultsProps) => {
  const [showingExplanation, setShowingExplanation] = useState<number | null>(null);
  const [explanationText, setExplanationText] = useState<string>("");
  const minutes = Math.floor(timeTaken / 60);
  const seconds = timeTaken % 60;
  
  // Sample player data - would come from a database in a real app
  const players = [
    { id: 1, name: "You", score: score, isYou: true },
  ].sort((a, b) => b.score - a.score);

  // Calculate your rank
  const yourRank = players.findIndex(player => player.isYou) + 1;
  
  // Generate a few achievements based on performance
  const achievements = [];
  
  if (score > 300) {
    achievements.push({
      icon: "🏆",
      title: "High Scorer",
      description: "Earned over 300 points"
    });
  }
  
  if (timeTaken < 120) {
    achievements.push({
      icon: "⚡",
      title: "Speed Demon",
      description: "Completed the quiz in under 2 minutes"
    });
  }
  
  if (yourRank === 1 && multiplayerMode) {
    achievements.push({
      icon: "👑",
      title: "Champion",
      description: "Finished in first place"
    });
  }
  
  // Add achievements based on difficulty
  if (difficulty === "hard") {
    achievements.push({
      icon: "🔥",
      title: "Challenge Seeker",
      description: "Completed a hard difficulty quiz (9× points)"
    });
  } else if (difficulty === "medium") {
    achievements.push({
      icon: "🎯",
      title: "Skilled Player",
      description: "Completed a medium difficulty quiz (5× points)"
    });
  } else if (difficulty === "easy") {
    achievements.push({
      icon: "🌟",
      title: "Beginner",
      description: "Completed an easy difficulty quiz (3× points)"
    });
  }
  
  // Always give at least one achievement
  if (achievements.length === 0) {
    achievements.push({
      icon: "🎓",
      title: "Cyber Scholar",
      description: "Completed a cybersecurity quiz"
    });
  }

  // Get difficulty multiplier text
  const getDifficultyMultiplierText = () => {
    switch (difficulty) {
      case "easy":
        return "(3× points)";
      case "medium":
        return "(5× points)";
      case "hard":
        return "(9× points)";
      default:
        return "";
    }
  };

  // Handle explanation button click
  const handleExplanationClick = async (questionId: number) => {
    // Toggle explanation visibility
    if (showingExplanation === questionId) {
      setShowingExplanation(null);
      return;
    }
    
    try {
      // Clear previous explanation before showing loading state for the new one
      setExplanationText("");
      
      // Show loading state
      setShowingExplanation(questionId);
      
      // Get username from auth service
      const username = getUsername() || "anonymous";
      
      // Fetch explanation from the API
      const result = await getExplanation(questionId, username);
      
      // Set the explanation in state
      setExplanationText(result.explanation);
    } catch (error) {
      console.error("Error fetching explanation:", error);
      setExplanationText("Failed to load explanation. Please try again later.");
    }
  };

  // Calculate points for each question
  const calculateQuestionPoints = (question: any, userAnswer: string) => {
    if (!question || !userAnswer) return 0;
    
    // Check if the answer is correct
    if (!isAnswerCorrect(question, userAnswer)) return 0;
    
    // Apply difficulty multiplier
    const difficultyMultiplier = question.difficulty === "easy" ? 3 :
                                 question.difficulty === "medium" ? 5 :
                                 question.difficulty === "hard" ? 9 : 1;
                                 
    return 100 * difficultyMultiplier;
  };

  // Check if a user answer is correct
  const isAnswerCorrect = (question: any, userAnswer: string) => {
    if (!question || !userAnswer) return false;
    
    // Handle different API response formats
    
    // Format 1: answer field is a single letter (A, B, C, D)
    if (question.answer && /^[A-D]$/.test(question.answer)) {
      return userAnswer === question.answer;
    }
    
    // Format 2: answer field is a lowercase letter (a, b, c, d)
    if (question.answer && /^[a-d]$/.test(question.answer)) {
      return userAnswer === question.answer.toUpperCase();
    }
    
    // Format 3: correctOptionId field contains a letter
    if (question.correctOptionId && /^[a-dA-D]$/.test(question.correctOptionId)) {
      const correctAnswer = question.correctOptionId.toUpperCase();
      return userAnswer === correctAnswer;
    }
    
    // Format 4: correctAnswer field contains the full option text
    if (question.correctAnswer && question.options) {
      // Strip prefixes from both options and correctAnswer
      const cleanedOptions = question.options.map((opt: string) => stripOptionPrefix(opt));
      const cleanedCorrectAnswer = stripOptionPrefix(question.correctAnswer);
      
      // Find index of the cleaned correct answer in the cleaned options
      const index = cleanedOptions.findIndex(
        (option: string) => option === cleanedCorrectAnswer || 
                           option.includes(cleanedCorrectAnswer)
      );
      
      if (index !== -1) {
        const correctOptionLetter = String.fromCharCode(65 + index);
        return userAnswer === correctOptionLetter;
      }
    }
    
    // Default case: direct comparison
    return userAnswer === question.answer;
  };

  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <h2 className="text-4xl font-bold mb-2 text-glow">Quiz Complete!</h2>
        <div className="flex items-center justify-center space-x-1 text-gray-400">
          <span>{topic}</span>
          <span>•</span>
          <span>{minutes}m {seconds}s</span>
          {difficulty !== "all" && (
            <>
              <span>•</span>
              <span className="capitalize">{difficulty} Difficulty {getDifficultyMultiplierText()}</span>
            </>
          )}
        </div>
      </div>
      
      {/* Your score summary */}
      <div className="cyber-border p-6 mb-8 bg-cyber-navy text-center">
        <div className="text-6xl font-bold text-cyber-green mb-2">{score}</div>
        <div className="text-sm text-gray-400 mb-6">TOTAL POINTS</div>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="cyber-border p-2 bg-cyber-dark flex flex-col items-center justify-center">
            <div className="text-xl font-bold text-white">{totalQuestions}</div>
            <div className="text-xs text-gray-400">Questions</div>
          </div>
          <div className="cyber-border p-2 bg-cyber-dark flex flex-col items-center justify-center">
            <div className="text-xl font-bold text-white">{minutes}:{seconds.toString().padStart(2, '0')}</div>
            <div className="text-xs text-gray-400">Time</div>
          </div>
          <div className="cyber-border p-2 bg-cyber-dark flex flex-col items-center justify-center">
            <div className="text-xl font-bold text-white">#{yourRank}</div>
            <div className="text-xs text-gray-400">Rank</div>
          </div>
        </div>
        
        {/* Achievements */}
        <div className="mb-6">
          <div className="text-xs uppercase text-gray-500 mb-3 text-left">Achievements</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {achievements.map((achievement, index) => (
              <div key={index} className="cyber-border p-3 bg-cyber-dark flex items-center">
                <div className="text-2xl mr-3">{achievement.icon}</div>
                <div className="text-left">
                  <div className="text-sm font-medium text-cyber-green">{achievement.title}</div>
                  <div className="text-xs text-gray-400">{achievement.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Question review section with expandable card */}
        {questions.length > 0 && (
          <div className="mb-6">
            <ExpandableCard title="Question Review">
              <div className="space-y-4">
                {questions.map((question) => (
                  <QuestionSummary
                    key={question.id}
                    question={question}
                    userAnswer={userAnswers[question.id] || ""}
                    isCorrect={isAnswerCorrect(question, userAnswers[question.id] || "")}
                    points={questionPoints[question.id] || calculateQuestionPoints(question, userAnswers[question.id] || "")}
                    onExplanationClick={handleExplanationClick}
                  />
                ))}
              </div>
              
              {/* Explanation modal */}
              {showingExplanation !== null && (
                <div className="mt-4 p-4 bg-cyber-navy-light rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-cyber-green">Explanation</h4>
                    <button 
                      onClick={() => setShowingExplanation(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="text-sm text-gray-300">
                    {explanationText ? (
                      <div className="markdown-content">
                        <ReactMarkdown>{explanationText}</ReactMarkdown>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-4">
                        <div className="w-5 h-5 border-t-2 border-cyber-green border-solid rounded-full animate-spin"></div>
                        <span className="ml-2">Loading explanation...</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </ExpandableCard>
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <Link
            to="/quiz-setup"
            className="cyber-border bg-cyber-dark px-6 py-3 flex items-center justify-center hover:border-cyber-green transition-all"
          >
            <svg className="h-5 w-5 mr-2 text-cyber-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Play Again
          </Link>
          
          <Link
            to="/dashboard"
            className="cyber-border bg-cyber-dark px-6 py-3 flex items-center justify-center hover:border-cyber-green transition-all"
          >
            <svg className="h-5 w-5 mr-2 text-cyber-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </div>
      
      {/* Leaderboard */}
      <div className="cyber-border p-4 bg-cyber-dark">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Leaderboard</h3>
          <div className="text-xs text-gray-400">
            {multiplayerMode ? 'Live Results' : 'Simulated Players'}
          </div>
        </div>
        
        <div className="space-y-2">
          {players.map((player, index) => (
            <div 
              key={player.id} 
              className={`cyber-border p-3 flex items-center justify-between ${
                player.isYou ? 'border-cyber-green bg-cyber-green/10' : 'bg-cyber-navy'
              }`}
            >
              <div className="flex items-center">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 ${
                  index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-700' : 'bg-gray-700'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium">{player.name}</div>
                  {player.isYou && <div className="text-xs text-cyber-green">That's you!</div>}
                </div>
              </div>
              <div className="text-xl font-bold">{player.score}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Security tip */}
      <div className="mt-6 cyber-border p-4 bg-cyber-dark/50 flex items-start space-x-3">
        <div className="flex-shrink-0 h-10 w-10 bg-cyber-navy rounded-full flex items-center justify-center">
          <svg className="h-6 w-6 text-cyber-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h4 className="font-medium text-cyber-green mb-1">Security Tip</h4>
          <p className="text-sm text-gray-300">
            Always enable two-factor authentication (2FA) for all your important accounts. 
            This adds an extra layer of security beyond just a password.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuizResults; 