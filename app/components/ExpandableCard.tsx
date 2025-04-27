import React, { useState } from "react";

type ExpandableCardProps = {
  title: string;
  children: React.ReactNode;
};

const ExpandableCard = ({ title, children }: ExpandableCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="cyber-border bg-cyber-dark overflow-hidden mb-4">
      <div 
        className="p-4 cursor-pointer flex justify-between items-center"
        onClick={toggleExpand}
      >
        <h3 className="text-lg font-medium text-white">{title}</h3>
        <svg 
          className={`h-5 w-5 text-cyber-green transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-4 border-t border-cyber-border">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ExpandableCard; 