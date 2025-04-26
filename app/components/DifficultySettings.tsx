import { useState } from "react";

type DifficultyLevel = "easy" | "medium" | "hard" | "all";

type DifficultySettingsProps = {
  selectedDifficulty: DifficultyLevel;
  onDifficultyChange: (difficulty: DifficultyLevel) => void;
};

const DifficultySettings = ({
  selectedDifficulty,
  onDifficultyChange,
}: DifficultySettingsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const difficultyOptions: { value: DifficultyLevel; label: string; description: string }[] = [
    { 
      value: "all", 
      label: "All Levels", 
      description: "Mix of easy, medium, and hard questions" 
    },
    { 
      value: "easy", 
      label: "Easy", 
      description: "Basic concepts for beginners" 
    },
    { 
      value: "medium", 
      label: "Medium", 
      description: "Intermediate knowledge required" 
    },
    { 
      value: "hard", 
      label: "Hard", 
      description: "Advanced concepts for experts" 
    }
  ];

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold uppercase text-gray-500">Difficulty</span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs text-cyber-green hover:underline focus:outline-none"
        >
          {isOpen ? "Close" : "Change"}
        </button>
      </div>
      
      {isOpen ? (
        <div className="cyber-border bg-cyber-dark p-4 mb-4 animate-fadeIn">
          <div className="grid grid-cols-1 gap-2">
            {difficultyOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onDifficultyChange(option.value);
                  setIsOpen(false);
                }}
                className={`cyber-border p-3 text-left transition-all duration-200 ${
                  selectedDifficulty === option.value
                    ? "border-cyber-green bg-cyber-green/10"
                    : "hover:border-cyber-green/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-gray-400">{option.description}</div>
                  </div>
                  {selectedDifficulty === option.value && (
                    <svg className="h-5 w-5 text-cyber-green" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="cyber-border bg-cyber-dark p-3 mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <DifficultyIcon difficulty={selectedDifficulty} />
            <span className="ml-2 text-white">
              {difficultyOptions.find(opt => opt.value === selectedDifficulty)?.label || "All Levels"}
            </span>
          </div>
          <svg className="h-4 w-4 text-cyber-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      )}
    </div>
  );
};

// Helper component for difficulty icons
const DifficultyIcon = ({ difficulty }: { difficulty: DifficultyLevel }) => {
  switch (difficulty) {
    case "easy":
      return (
        <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    case "medium":
      return (
        <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    case "hard":
      return (
        <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    default:
      return (
        <svg className="h-5 w-5 text-cyber-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      );
  }
};

export default DifficultySettings; 