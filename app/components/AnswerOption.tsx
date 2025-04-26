import React from 'react';
import { motion } from 'framer-motion';

type AnswerOptionProps = {
  option: string;
  index: number;
  isSelected: boolean;
  isCorrect?: boolean | null;
  isIncorrect?: boolean | null;
  onClick: () => void;
  disabled?: boolean;
  showFeedback?: boolean;
};

// Colors and shapes for different answer options (Kahoot-style)
const optionThemes = [
  { bg: 'bg-red-500', hoverBg: 'hover:bg-red-600', shape: '◆', clickedBg: 'bg-red-700' },
  { bg: 'bg-blue-500', hoverBg: 'hover:bg-blue-600', shape: '■', clickedBg: 'bg-blue-700' },
  { bg: 'bg-yellow-500', hoverBg: 'hover:bg-yellow-600', shape: '●', clickedBg: 'bg-yellow-700' },
  { bg: 'bg-green-500', hoverBg: 'hover:bg-green-600', shape: '▲', clickedBg: 'bg-green-700' },
];

const AnswerOption: React.FC<AnswerOptionProps> = ({
  option,
  index,
  isSelected,
  isCorrect,
  isIncorrect,
  onClick,
  disabled = false,
  showFeedback = false,
}) => {
  const theme = optionThemes[index % optionThemes.length];
  
  // Determine background color based on selection and correctness state
  let bgColor = theme.bg;
  let hoverEffect = disabled ? '' : theme.hoverBg;
  
  if (showFeedback) {
    if (isCorrect) {
      bgColor = 'bg-cyber-green';
      hoverEffect = '';
    } else if (isIncorrect) {
      bgColor = 'bg-red-600';
      hoverEffect = '';
    }
  } else if (isSelected) {
    bgColor = theme.clickedBg;
  }

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full p-4 mb-4 rounded-lg text-white font-medium
        transition duration-150 ease-in-out
        flex items-center 
        ${bgColor}
        ${hoverEffect}
        ${disabled && !isSelected ? 'opacity-70' : 'opacity-100'}
        ${isSelected ? 'ring-4 ring-white' : ''}
      `}
    >
      <div className="mr-3 text-2xl">{theme.shape}</div>
      <span className="text-left flex-grow">{option}</span>
      
      {/* Show checkmark or X based on correctness */}
      {showFeedback && (
        <div className="ml-auto">
          {isCorrect && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {isIncorrect && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
      )}
    </motion.button>
  );
};

export default AnswerOption; 