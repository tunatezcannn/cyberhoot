import { getMcqQuestions, getOpenQuestions, McqQuestion, OpenQuestion } from "./questionService";
import { getUsername } from "./authService";

// Enable or disable API calls - set to false to use only fallback questions
export const USE_API = true;

export type QuizQuestion = {
  id: number;
  text: string;
  type: "multiple-choice" | "open-ended";
  options?: string[];
  correctAnswer?: string;
  answer?: string;
  difficulty: "easy" | "medium" | "hard";
  username?: string;
  solvingTime?: number;
};

// Static fallback questions in case the API is unreachable
export const FALLBACK_QUESTIONS: Record<string, QuizQuestion[]> = {
  "easy": [
    {
      id: 1,
      text: "Which of the following is a best practice for password security?",
      type: "multiple-choice",
      options: [
        "Using the same password for all accounts",
        "Using your name and birthdate",
        "Using a unique password for each account",
        "Sharing your password with trusted friends"
      ],
      correctAnswer: "Using a unique password for each account",
      difficulty: "easy",
      solvingTime: 20
    },
    {
      id: 2,
      text: "What is phishing?",
      type: "multiple-choice",
      options: [
        "A type of fishing sport",
        "A fraudulent attempt to obtain sensitive information by disguising as a trustworthy entity",
        "A secure method of data encryption",
        "A type of firewall"
      ],
      correctAnswer: "A fraudulent attempt to obtain sensitive information by disguising as a trustworthy entity",
      difficulty: "easy",
      solvingTime: 20
    },
    {
      id: 3,
      text: "Which of the following is NOT a sign of a phishing email?",
      type: "multiple-choice",
      options: [
        "Misspellings and grammatical errors",
        "Urgent requests for personal information",
        "Suspicious attachments",
        "Email comes from a colleague you regularly work with"
      ],
      correctAnswer: "Email comes from a colleague you regularly work with",
      difficulty: "easy",
      solvingTime: 20
    }
  ],
  "medium": [
    {
      id: 4,
      text: "What is two-factor authentication?",
      type: "multiple-choice",
      options: [
        "Using two different passwords for the same account",
        "Having two people approve access to an account",
        "Using two different authentication methods to verify your identity",
        "Logging in twice for extra security"
      ],
      correctAnswer: "Using two different authentication methods to verify your identity",
      difficulty: "medium",
      solvingTime: 30
    },
    {
      id: 5,
      text: "Which of the following is considered the most secure password?",
      type: "multiple-choice",
      options: [
        "Password123!",
        "p@ssw0rd",
        "Tr0ub4dor&3",
        "correcthorsebatterystaple"
      ],
      correctAnswer: "correcthorsebatterystaple",
      difficulty: "medium",
      solvingTime: 30
    },
    {
      id: 6,
      text: "What is a firewall?",
      type: "multiple-choice",
      options: [
        "A physical barrier that prevents computer theft",
        "A network security device that monitors traffic",
        "A tool for extinguishing server fires",
        "A backup system for data recovery"
      ],
      correctAnswer: "A network security device that monitors traffic",
      difficulty: "medium",
      solvingTime: 30
    }
  ],
  "hard": [
    {
      id: 7,
      text: "What is the purpose of a CSRF token?",
      type: "multiple-choice",
      options: [
        "To encrypt sensitive user data",
        "To prevent cross-site request forgery attacks",
        "To validate API access requests",
        "To maintain user sessions across multiple browsers"
      ],
      correctAnswer: "To prevent cross-site request forgery attacks",
      difficulty: "hard",
      solvingTime: 45
    },
    {
      id: 8,
      text: "Which encryption algorithm is considered the most secure as of 2025?",
      type: "multiple-choice",
      options: [
        "MD5",
        "SHA-1",
        "AES-256",
        "RC4"
      ],
      correctAnswer: "AES-256",
      difficulty: "hard",
      solvingTime: 45
    },
    {
      id: 9,
      text: "What is a zero-day vulnerability?",
      type: "multiple-choice",
      options: [
        "A vulnerability discovered after 0 days of software release",
        "A vulnerability that exists for 0 days before being patched",
        "A vulnerability unknown to those who should be fixing it",
        "A vulnerability that has no impact on systems"
      ],
      correctAnswer: "A vulnerability unknown to those who should be fixing it",
      difficulty: "hard",
      solvingTime: 45
    }
  ],
  "open-ended": [
    {
      id: 10,
      text: "Explain the concept of defense in depth and why it's important in cybersecurity.",
      type: "open-ended",
      difficulty: "medium",
      solvingTime: 60
    },
    {
      id: 11,
      text: "Describe the potential security implications of using public Wi-Fi networks.",
      type: "open-ended",
      difficulty: "easy",
      solvingTime: 60
    },
    {
      id: 12,
      text: "Explain the difference between symmetric and asymmetric encryption and give an example use case for each.",
      type: "open-ended",
      difficulty: "hard",
      solvingTime: 60
    }
  ]
};

/**
 * Converts difficulty level to numeric value for the API
 */
function difficultyToNumber(difficulty: "easy" | "medium" | "hard" | "all"): number {
  switch (difficulty) {
    case "easy":
      return 3;
    case "medium":
      return 5;
    case "hard":
      return 9;
    case "all":
      return 5; // Default to medium for "all"
    default:
      return 5;
  }
}

/**
 * Convert API McqQuestion to our QuizQuestion format
 */
function convertMcqQuestion(question: McqQuestion, difficultyLevel: "easy" | "medium" | "hard"): QuizQuestion {
  // Process the answer if it's a single letter (A, B, C, D)
  let correctAnswer = question.correctAnswer;
  
  // If the correctAnswer is not defined but we have answer field
  if (!correctAnswer && question.answer) {
    // If the answer is a single letter like "A", "B", etc.
    if (question.answer.length === 1 && /^[A-D]$/.test(question.answer)) {
      const index = question.answer.charCodeAt(0) - 'A'.charCodeAt(0);
      if (question.options && index >= 0 && index < question.options.length) {
        correctAnswer = question.options[index];
      }
    } else {
      correctAnswer = question.answer;
    }
  }
  
  return {
    id: question.id ? parseInt(question.id.toString()) : Math.floor(Math.random() * 1000),
    text: question.text,
    type: "multiple-choice",
    options: question.options,
    correctAnswer: correctAnswer,
    difficulty: difficultyLevel,
    solvingTime: question.solvingTime || getDifficultyDefaultTime(difficultyLevel)
  };
}

/**
 * Convert API OpenQuestion to our QuizQuestion format
 */
function convertOpenQuestion(question: OpenQuestion, difficultyLevel: "easy" | "medium" | "hard"): QuizQuestion {
  return {
    id: question.id ? parseInt(question.id.toString()) : Math.floor(Math.random() * 1000),
    text: question.text,
    type: "open-ended",
    difficulty: difficultyLevel,
    solvingTime: question.solvingTime || getDifficultyDefaultTime(difficultyLevel)
  };
}

/**
 * Get default time based on difficulty level
 */
function getDifficultyDefaultTime(difficulty: "easy" | "medium" | "hard"): number {
  switch (difficulty) {
    case "easy":
      return 20;
    case "medium":
      return 30;
    case "hard":
      return 45;
    default:
      return 30;
  }
}

/**
 * Get fallback questions based on difficulty and type
 */
function getFallbackQuestions(
  difficulty: "easy" | "medium" | "hard" | "all",
  questionType: string
): QuizQuestion[] {
  let questions: QuizQuestion[] = [];
  
  // Determine which difficulties to include
  const difficultiesToInclude = difficulty === "all" 
    ? ["easy", "medium", "hard"] as const
    : [difficulty];
  
  // Get questions for each difficulty level
  for (const diffLevel of difficultiesToInclude) {
    // Get questions from fallback data
    const difficultyQuestions = FALLBACK_QUESTIONS[diffLevel] || [];
    
    // Filter by question type if needed
    const filteredQuestions = questionType === "all" 
      ? difficultyQuestions
      : difficultyQuestions.filter(q => {
          if (questionType === "multiple-choice" && q.type === "multiple-choice") return true;
          if (questionType === "open-ended" && q.type === "open-ended") return true;
          return false;
        });
    
    // Add solvingTime if not present
    const questionsWithTime = filteredQuestions.map(q => ({
      ...q,
      solvingTime: q.solvingTime || getDifficultyDefaultTime(q.difficulty)
    }));
        
    questions = [...questions, ...questionsWithTime];
  }
  
  // If we need open-ended questions specifically
  if (questionType === "open-ended" || questionType === "all") {
    const openEndedQuestions = FALLBACK_QUESTIONS["open-ended"].map(q => ({
      ...q,
      solvingTime: q.solvingTime || getDifficultyDefaultTime(q.difficulty)
    }));
    questions = [...questions, ...openEndedQuestions];
  }
  
  return questions;
}

/**
 * Fetch a batch of questions for a quiz
 */
export async function fetchQuizQuestions(
  topic: string,
  questionType: string = "multiple-choice",
  difficulty: "easy" | "medium" | "hard" | "all" = "all",
  count: number = 5,
  baseUrl?: string
): Promise<QuizQuestion[]> {
  const questions: QuizQuestion[] = [];
  const numericDifficulty = difficultyToNumber(difficulty);
  const username = getUsername();
  
  // If no baseUrl is provided, use fallback questions
  if (!baseUrl) {
    console.warn("No baseUrl provided, using fallback questions");
    const fallbackQuestions = getFallbackQuestions(difficulty, questionType).slice(0, count);
    // Add username to fallback questions
    return fallbackQuestions.map(q => ({ ...q, username }));
  }
  
  try {
    // Make API call based on question type
    if (questionType === "multiple-choice" || questionType === "all") {
      const mcqQuestions = await getMcqQuestions(topic, numericDifficulty, "English", baseUrl, count);
      // Convert each returned question to our format
      mcqQuestions.forEach(question => {
        const convertedQuestion = convertMcqQuestion(question, difficulty === "all" ? "medium" : difficulty);
        questions.push({ ...convertedQuestion, username });
      });
    } else if (questionType === "open-ended") {
      const openQuestions = await getOpenQuestions(topic, numericDifficulty, "English", baseUrl, count);
      // Convert each returned question to our format
      openQuestions.forEach(question => {
        const convertedQuestion = convertOpenQuestion(question, difficulty === "all" ? "medium" : difficulty);
        questions.push({ ...convertedQuestion, username });
      });
    }
  } catch (error) {
    console.error(`Error fetching questions:`, error);
  }
  
  // If we couldn't fetch any questions, use fallbacks
  if (questions.length === 0) {
    const fallbackQuestions = getFallbackQuestions(difficulty, questionType).slice(0, count);
    // Add username to fallback questions
    return fallbackQuestions.map(q => ({ ...q, username }));
  }
  
  return questions.slice(0, count); // Ensure we return only the requested count
}