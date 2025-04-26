import { useState, useEffect } from "react";

type QuestionType = {
  id: number;
  text: string;
  type: "multiple-choice" | "open-ended";
  options?: string[];
  correctAnswer?: string | string[];
};

type QuizInterfaceProps = {
  questions: QuestionType[];
  quizType: string;
  onComplete: (results: { answers: Record<number, string>; score: number }) => void;
  timePerQuestion?: number;
};

const QuizInterface = ({
  questions,
  quizType,
  onComplete,
  timePerQuestion = 20,
}: QuizInterfaceProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(timePerQuestion);
  const [isAnswered, setIsAnswered] = useState(false);
  const [textAnswer, setTextAnswer] = useState("");
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  // Timer effect
  useEffect(() => {
    if (isAnswered || feedbackVisible) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto submit current answer when time runs out
          handleTimeUp();
          return timePerQuestion;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex, isAnswered, feedbackVisible, timePerQuestion]);

  // Reset state for new question
  useEffect(() => {
    setTimeLeft(timePerQuestion);
    setIsAnswered(false);
    setTextAnswer("");
    setFeedbackVisible(false);
    setIsCorrect(null);
  }, [currentQuestionIndex, timePerQuestion]);

  const handleTimeUp = () => {
    if (currentQuestion.type === "multiple-choice") {
      // For multiple choice, treat it as an incorrect answer
      setIsAnswered(true);
      setFeedbackVisible(true);
      setIsCorrect(false);
      setStreak(0); // Reset streak on timeout
    } else {
      // For open-ended, just move to the next question
      handleNextQuestion();
    }
  };

  const checkAnswer = (selectedOption: string) => {
    if (currentQuestion.type === "multiple-choice" && currentQuestion.correctAnswer) {
      const isAnswerCorrect = selectedOption === currentQuestion.correctAnswer;
      setIsCorrect(isAnswerCorrect);
      
      if (isAnswerCorrect) {
        setScore(prev => prev + calculatePoints());
        setStreak(prev => prev + 1);
      } else {
        setStreak(0);
      }
    }
  };

  const calculatePoints = () => {
    // Base points + time bonus + streak bonus
    const basePoints = 100;
    const timeBonus = Math.floor((timeLeft / timePerQuestion) * 50);
    const streakBonus = Math.min(streak * 10, 50); // Cap streak bonus at 50
    
    return basePoints + timeBonus + streakBonus;
  };

  const handleOptionSelect = (option: string) => {
    if (isAnswered) return;
    
    setAnswers({
      ...answers,
      [currentQuestion.id]: option,
    });
    setIsAnswered(true);
    
    // Check answer and show feedback for multiple choice
    if (currentQuestion.type === "multiple-choice") {
      checkAnswer(option);
      setFeedbackVisible(true);
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnswered || !textAnswer.trim()) return;
    
    setAnswers({
      ...answers,
      [currentQuestion.id]: textAnswer,
    });
    setIsAnswered(true);
    
    // For open-ended, we don't show correct/incorrect feedback
    // just acknowledge submission
    setFeedbackVisible(true);
  };

  const handleNextQuestion = () => {
    // For open-ended questions, save the current text answer if not already saved
    if (currentQuestion.type === "open-ended" && !isAnswered && textAnswer.trim()) {
      setAnswers({
        ...answers,
        [currentQuestion.id]: textAnswer,
      });
    }

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Calculate final score (including open-ended questions without scoring)
      const multipleChoiceQuestions = questions.filter(q => q.type === "multiple-choice");
      
      // Complete the quiz
      onComplete({ answers, score: score });
    }
  };

  return (
    <div className="w-full">
      {/* Top bar with score, streak and question number */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-cyber-dark px-3 py-2 rounded-md">
            <span className="text-xs mr-2">SCORE</span>
            <span className="text-cyber-green font-bold">{score}</span>
          </div>
          {streak > 0 && (
            <div className="flex items-center bg-cyber-dark px-3 py-2 rounded-md">
              <span className="text-xs mr-2">STREAK</span>
              <span className="text-yellow-400 font-bold">🔥 {streak}</span>
            </div>
          )}
        </div>
        <div className="flex items-center bg-cyber-dark px-3 py-2 rounded-md">
          <span className="text-xs mr-2">QUESTION</span>
          <span className="font-bold">{currentQuestionIndex + 1}/{totalQuestions}</span>
        </div>
      </div>
      
      {/* Timer bar */}
      <div className="mb-4 relative w-full h-2 bg-cyber-border rounded-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cyber-green transition-all duration-1000 ease-linear origin-left"
          style={{ transform: `scaleX(${timeLeft / timePerQuestion})` }}
        ></div>
      </div>
      
      {/* Timer text */}
      <div className="mb-6 text-center">
        <span className={`inline-flex items-center bg-cyber-dark px-3 py-1 rounded-full text-sm ${
          timeLeft < 5 ? "text-red-400" : "text-cyber-green"
        }`}>
          <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {timeLeft}s
        </span>
      </div>

      {/* Question card */}
      <div className="cyber-border p-6 mb-6 bg-cyber-dark">
        <h3 className="text-xl font-medium mb-6 text-center font-mono">{currentQuestion.text}</h3>
        
        {currentQuestion.type === "multiple-choice" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentQuestion.options?.map((option, index) => {
              // Determine button styling based on feedback state
              let buttonClasses = "relative w-full text-left cyber-border p-4 transition-all duration-200";
              
              if (feedbackVisible) {
                if (option === currentQuestion.correctAnswer) {
                  buttonClasses += " border-green-500 bg-green-500/20 text-white";
                } else if (answers[currentQuestion.id] === option) {
                  buttonClasses += " border-red-500 bg-red-500/20 text-white";
                } else {
                  buttonClasses += " opacity-60";
                }
              } else if (answers[currentQuestion.id] === option) {
                buttonClasses += " border-cyber-green bg-cyber-green/10 text-white";
              } else {
                buttonClasses += " hover:border-cyber-green/50";
              }
              
              return (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(option)}
                  className={buttonClasses}
                  disabled={isAnswered}
                >
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 h-6 w-6 mr-3 rounded-md ${
                      ["bg-blue-500", "bg-red-500", "bg-yellow-500", "bg-green-500"][index % 4]
                    } flex items-center justify-center font-bold text-cyber-dark`}>
                      {["A", "B", "C", "D"][index % 4]}
                    </div>
                    <span>{option}</span>
                  </div>
                  
                  {/* Feedback icons */}
                  {feedbackVisible && option === currentQuestion.correctAnswer && (
                    <div className="absolute -right-2 -top-2 bg-green-500 rounded-full p-1">
                      <svg className="h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  {feedbackVisible && answers[currentQuestion.id] === option && option !== currentQuestion.correctAnswer && (
                    <div className="absolute -right-2 -top-2 bg-red-500 rounded-full p-1">
                      <svg className="h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <form onSubmit={handleTextSubmit} className="space-y-3">
            <div className="relative">
              <textarea
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full h-32 rounded-md border border-cyber-border bg-cyber-navy p-3 text-white placeholder:text-gray-500 focus:border-cyber-green focus:outline-none focus:ring-1 focus:ring-cyber-green resize-none font-mono"
                disabled={isAnswered}
              />
            </div>
            <div className="flex justify-center">
              <button
                type="submit"
                className={`px-6 py-2 rounded-md bg-cyber-navy border border-cyber-border ${
                  isAnswered ? "opacity-50 cursor-not-allowed" : "hover:border-cyber-green"
                }`}
                disabled={isAnswered || !textAnswer.trim()}
              >
                Submit Answer
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Feedback area - only shown after answering */}
      {feedbackVisible && (
        <div className={`cyber-border p-4 mb-6 ${
          isCorrect === true 
            ? "bg-green-500/10 border-green-500" 
            : isCorrect === false 
              ? "bg-red-500/10 border-red-500"
              : "bg-cyber-dark"
        }`}>
          <div className="flex items-center">
            {isCorrect === true ? (
              <>
                <svg className="h-6 w-6 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Correct! +{calculatePoints()} points</span>
              </>
            ) : isCorrect === false ? (
              <>
                <svg className="h-6 w-6 text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">
                  {timeLeft === 0 ? "Time's up!" : "Incorrect!"}
                  {currentQuestion.correctAnswer && (
                    <span className="ml-1">The correct answer was: <span className="text-cyber-green">{currentQuestion.correctAnswer}</span></span>
                  )}
                </span>
              </>
            ) : (
              <>
                <svg className="h-6 w-6 text-cyber-green mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">Answer submitted!</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Next question button - only enabled after answering */}
      <div className="flex justify-center">
        <button
          onClick={handleNextQuestion}
          className={`group relative overflow-hidden rounded-md px-8 py-3 text-sm font-bold transition-all duration-300 focus:outline-none ${
            isAnswered || feedbackVisible 
              ? "bg-cyber-green text-cyber-dark hover:bg-opacity-90" 
              : "bg-cyber-dark text-gray-400 cursor-not-allowed"
          }`}
          disabled={!isAnswered && !feedbackVisible}
        >
          <span className="relative z-10 flex items-center justify-center">
            {currentQuestionIndex < totalQuestions - 1 ? (
              <>
                Next Question
                <svg className="ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            ) : (
              <>
                Complete Quiz
                <svg className="ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </>
            )}
          </span>
        </button>
      </div>
      
      {/* Player stats for multi-player mode (placeholder) */}
      <div className="mt-8 border-t border-cyber-border pt-4">
        <div className="text-xs uppercase text-gray-500 mb-2">Players</div>
        <div className="grid grid-cols-2 gap-2">
          {/* Sample player data - would come from a real-time database in production */}
          <div className="cyber-border bg-cyber-dark p-2 flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold mr-2">
                1
              </div>
              <span className="text-sm">You</span>
            </div>
            <span className="font-bold text-cyber-green">{score}</span>
          </div>
          <div className="cyber-border bg-cyber-dark p-2 flex items-center justify-between opacity-60">
            <div className="flex items-center">
              <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center text-xs font-bold mr-2">
                2
              </div>
              <span className="text-sm">Player 2</span>
            </div>
            <span className="font-bold">{Math.floor(score * 0.8)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizInterface; 