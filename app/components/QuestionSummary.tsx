import React from "react";

// Helper function to strip letter prefixes from options
const stripOptionPrefix = (option: string): string => {
  // Match patterns like "A)", "B) ", "C.", "D. "
  return option.replace(/^[A-D][\)\.\s]+\s*/i, '');
};

type QuestionSummaryProps = {
  question: {
    id: number;
    type: string;
    text: string;
    options?: string[];
    answer?: string;
    correctAnswer?: string;
    correctOptionId?: string;
  };
  userAnswer: string;
  isCorrect: boolean;
  points: number;
  onExplanationClick: (questionId: number) => void;
};

const QuestionSummary = ({ 
  question, 
  userAnswer, 
  isCorrect, 
  points,
  onExplanationClick
}: QuestionSummaryProps) => {
  const getCorrectAnswer = () => {
    if (question.answer) {
      return question.answer;
    }
    
    if (question.correctAnswer) {
      return question.correctAnswer;
    }
    
    if (question.correctOptionId && question.options) {
      const index = question.correctOptionId.charCodeAt(0) - 'a'.charCodeAt(0);
      if (index >= 0 && index < question.options.length) {
        return String.fromCharCode(65 + index);
      }
      return question.correctOptionId.toUpperCase();
    }
    
    return "";
  };
  
  const correctAnswer = getCorrectAnswer();
  
  return (
    <div 
      className={`mb-4 p-4 rounded-lg ${
        isCorrect 
          ? 'border-2 border-[#9fef00] bg-[#9fef00]/10' 
          : 'border-2 border-red-500 bg-red-500/10'
      }`}
    >
      <div className="flex justify-between mb-2">
        <div className="font-medium text-lg">{question.text}</div>
        <div className={`text-xl font-bold ${isCorrect ? 'text-[#9fef00]' : 'text-red-500'}`}>
          {points > 0 ? `+${points}` : '0'} pts
        </div>
      </div>
      
      {question.options && (
        <div className="ml-4 space-y-2 mb-4">
          {question.options.map((option, index) => {
            const optionLetter = String.fromCharCode(65 + index);
            const isUserSelection = userAnswer === optionLetter;
            const isCorrectOption = correctAnswer === optionLetter;
            
            // Strip the prefix from the option text
            const cleanOption = stripOptionPrefix(option);
            
            return (
              <div 
                key={index} 
                className={`flex items-center py-1 px-2 rounded ${
                  isUserSelection && isCorrect 
                    ? 'bg-[#9fef00]/20' 
                    : isUserSelection && !isCorrect 
                    ? 'bg-red-500/20' 
                    : isCorrectOption && !isCorrect 
                    ? 'bg-[#9fef00]/20' 
                    : ''
                }`}
              >
                <div className={`h-6 w-6 flex items-center justify-center rounded-full mr-2 text-sm font-medium ${
                  isUserSelection && isCorrect 
                    ? 'bg-[#9fef00] text-black' 
                    : isUserSelection && !isCorrect 
                    ? 'bg-red-500 text-white' 
                    : isCorrectOption && !isCorrect 
                    ? 'bg-[#9fef00] text-black' 
                    : 'bg-cyber-navy-light text-white'
                }`}>
                  {optionLetter}
                </div>
                <div>{cleanOption}</div>
                {isUserSelection && (
                  <div className="ml-2">
                    {isCorrect ? (
                      <svg className="h-5 w-5 text-[#9fef00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                )}
                {isCorrectOption && !isUserSelection && !isCorrect && (
                  <div className="ml-2">
                    <svg className="h-5 w-5 text-[#9fef00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      <button
        onClick={() => onExplanationClick(question.id)}
        className="cyber-border py-1 px-3 text-sm bg-cyber-navy hover:border-cyber-green transition-all"
      >
        View Explanation
      </button>
    </div>
  );
};

export default QuestionSummary; 