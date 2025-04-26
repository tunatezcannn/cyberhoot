import { getAuthToken, getUsername } from "./authService";

export type QuizAnalytics = {
  quizId: number;
  quizName: string;
  quizDescription: string;
  quizLang: string;
  quizType: string;
  quizTimeLimit: number;
  quizCreatedAt: string;
  quizTopic: string;
  answeredQuestions: AnsweredQuestion[];
};

export type AnsweredQuestion = {
  questionId: number;
  questionText: string;
  userAnswer: string;
  correct: boolean;
  score: number;
  createdAt: string;
};

export async function fetchQuizAnalytics(): Promise<QuizAnalytics[]> {
  try {
    const authToken = getAuthToken();
    const username = getUsername();
    
    const response = await fetch('/api/ws/questions/getAllAnsweredQuestionsAndQuizzes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ username })
    });

    if (!response.ok) {
      throw new Error(`Error fetching quiz analytics: ${response.status}`);
    }

    const data = await response.json();
    return data as QuizAnalytics[];
  } catch (error) {
    console.error("Failed to fetch quiz analytics:", error);
    // Return mock data for development/testing
    return getMockQuizAnalytics();
  }
}

// Helper functions to process analytics data
export function calculateCompletionRate(analytics: QuizAnalytics[]): number {
  const totalQuizzes = analytics.length;
  const completedQuizzes = analytics.filter(quiz => quiz.answeredQuestions.length > 0).length;
  return totalQuizzes > 0 ? (completedQuizzes / totalQuizzes) * 100 : 0;
}

export function calculateAverageScore(analytics: QuizAnalytics[]): number {
  let totalCorrect = 0;
  let totalQuestions = 0;

  analytics.forEach(quiz => {
    quiz.answeredQuestions.forEach(question => {
      totalQuestions++;
      if (question.correct) {
        totalCorrect++;
      }
    });
  });

  return totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
}

export function calculateAverageTimePerQuestion(analytics: QuizAnalytics[]): number {
  let totalScore = 0;
  let totalQuestions = 0;

  analytics.forEach(quiz => {
    quiz.answeredQuestions.forEach(question => {
      totalScore += question.score;
      totalQuestions++;
    });
  });

  return totalQuestions > 0 ? totalScore / totalQuestions : 0;
}

export function getQuizTypeDistribution(analytics: QuizAnalytics[]): Record<string, number> {
  const distribution: Record<string, number> = {};

  analytics.forEach(quiz => {
    if (quiz.answeredQuestions.length > 0) {
      const quizType = quiz.quizType || 'unknown';
      distribution[quizType] = (distribution[quizType] || 0) + 1;
    }
  });

  return distribution;
}

// Mock data for testing/development
function getMockQuizAnalytics(): QuizAnalytics[] {
  return [
    {
      quizId: 1,
      quizName: "Cybersecurity Quiz",
      quizDescription: "Cybersecurity Quiz Description",
      quizLang: "English",
      quizType: "mcq",
      quizTimeLimit: 150,
      quizCreatedAt: "2024-04-01T12:00:00",
      quizTopic: "Cybersecurity",
      answeredQuestions: [
        {
          questionId: 1,
          questionText: "What is phishing?",
          userAnswer: "A fraudulent attempt to obtain sensitive information",
          correct: true,
          score: 450,
          createdAt: "2024-04-01T12:00:00"
        },
        {
          questionId: 2,
          questionText: "What is a strong password?",
          userAnswer: "Password123",
          correct: false,
          score: 0,
          createdAt: "2024-04-01T12:00:00"
        }
      ]
    },
    {
      quizId: 2,
      quizName: "Network Security",
      quizDescription: "Network Security Quiz",
      quizLang: "English",
      quizType: "mcq",
      quizTimeLimit: 120,
      quizCreatedAt: "2024-04-02T12:00:00",
      quizTopic: "Network Security",
      answeredQuestions: [
        {
          questionId: 3,
          questionText: "What is a firewall?",
          userAnswer: "A security system that monitors network traffic",
          correct: true,
          score: 480,
          createdAt: "2024-04-02T12:00:00"
        }
      ]
    },
    {
      quizId: 3,
      quizName: "Data Privacy",
      quizDescription: "Data Privacy Quiz",
      quizLang: "English",
      quizType: "mcq",
      quizTimeLimit: 180,
      quizCreatedAt: "2024-04-03T12:00:00",
      quizTopic: "Data Privacy",
      answeredQuestions: []
    }
  ];
} 