import { createContext, useContext, useState, ReactNode } from 'react';
import { getQuestions, getFallbackQuestions } from '~/services/questions';

type Question = {
  id: string;
  type: string;
  language: string;
  topic: string;
  text: string;
  options?: string[];
  correctAnswer?: string;
};

type QuestionContextType = {
  questions: Question[];
  currentQuestion: Question | null;
  currentQuestionIndex: number;
  loading: boolean;
  error: string | null;
  fetchQuestions: (topic: string, questionType: string, difficulty?: number) => Promise<void>;
  nextQuestion: () => void;
  resetQuestions: () => void;
  hasMoreQuestions: boolean;
};

const QuestionContext = createContext<QuestionContextType | undefined>(undefined);

export function QuestionProvider({ children }: { children: ReactNode }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = questions[currentQuestionIndex] || null;
  const hasMoreQuestions = currentQuestionIndex < questions.length - 1;

  const fetchQuestions = async (topic: string, questionType: string, difficulty = 5) => {
    setLoading(true);
    setError(null);
    
    try {
      const fetchedQuestions = await getQuestions({
        difficulty,
        type: questionType,
        language: 'English',
        topic
      });
      
      setQuestions(fetchedQuestions);
      setCurrentQuestionIndex(0);
    } catch (err) {
      console.error('Failed to fetch questions:', err);
      setError('Failed to fetch questions. Using fallback questions instead.');
      
      // Use fallback questions if API fails
      const fallbackQuestions = getFallbackQuestions(topic, questionType);
      setQuestions(fallbackQuestions);
      setCurrentQuestionIndex(0);
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    if (hasMoreQuestions) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const resetQuestions = () => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setError(null);
  };

  return (
    <QuestionContext.Provider
      value={{
        questions,
        currentQuestion,
        currentQuestionIndex,
        loading,
        error,
        fetchQuestions,
        nextQuestion,
        resetQuestions,
        hasMoreQuestions
      }}
    >
      {children}
    </QuestionContext.Provider>
  );
}

export function useQuestions() {
  const context = useContext(QuestionContext);
  if (context === undefined) {
    throw new Error('useQuestions must be used within a QuestionProvider');
  }
  return context;
}

export default QuestionContext; 