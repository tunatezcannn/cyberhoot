import { getMcqQuestions, getOpenQuestions, McqQuestion, OpenQuestion } from "./questionService";

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
      difficulty: "easy"
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
      difficulty: "easy"
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
      difficulty: "easy"
    }
  ],
  "medium": [
    {
      id: 4,
      text: "What is two-factor authentication?",
      type: "multiple-choice",
      options: [
        "Logging in twice with the same password",
        "A security method requiring two different authentication factors",
        "Having two different passwords for the same account",
        "A security bypass method"
      ],
      correctAnswer: "A security method requiring two different authentication factors",
      difficulty: "medium"
    },
    {
      id: 5,
      text: "Which of the following is NOT typically considered a factor in multi-factor authentication?",
      type: "multiple-choice",
      options: [
        "Something you know (password)",
        "Something you have (phone)",
        "Something you are (fingerprint)",
        "Someone you know (friend verification)"
      ],
      correctAnswer: "Someone you know (friend verification)",
      difficulty: "medium"
    },
    {
      id: 6,
      text: "What is a man-in-the-middle attack?",
      type: "multiple-choice",
      options: [
        "A physical attack on a server room",
        "An attack where the attacker secretly relays/alters communications",
        "A virus that affects only middle-level employees",
        "A DoS attack on network infrastructure"
      ],
      correctAnswer: "An attack where the attacker secretly relays/alters communications",
      difficulty: "medium"
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
      difficulty: "hard"
    },
    {
      id: 8,
      text: "Which encryption algorithm is considered the most secure as of 2023?",
      type: "multiple-choice",
      options: [
        "MD5",
        "SHA-1",
        "AES-256",
        "RC4"
      ],
      correctAnswer: "AES-256",
      difficulty: "hard"
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
      difficulty: "hard"
    }
  ],
  "open-ended": [
    {
      id: 10,
      text: "Explain the concept of defense in depth and why it's important in cybersecurity.",
      type: "open-ended",
      difficulty: "medium"
    },
    {
      id: 11,
      text: "Describe the potential security implications of using public Wi-Fi networks.",
      type: "open-ended",
      difficulty: "easy"
    },
    {
      id: 12,
      text: "Explain the difference between symmetric and asymmetric encryption and give an example use case for each.",
      type: "open-ended",
      difficulty: "hard"
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
    difficulty: difficultyLevel
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
    difficulty: difficultyLevel
  };
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
        
    questions = [...questions, ...filteredQuestions];
  }
  
  // If we need open-ended questions specifically
  if (questionType === "open-ended" || questionType === "all") {
    questions = [...questions, ...FALLBACK_QUESTIONS["open-ended"]];
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
  
  // If no baseUrl is provided, use fallback questions
  if (!baseUrl) {
    console.warn("No baseUrl provided, using fallback questions");
    return getFallbackQuestions(difficulty, questionType).slice(0, count);
  }
  
  try {
    // Make API call based on question type
    if (questionType === "multiple-choice" || questionType === "all") {
      const mcqQuestions = await getMcqQuestions(topic, numericDifficulty, "English", baseUrl, count);
      // Convert each returned question to our format
      mcqQuestions.forEach(question => {
        questions.push(convertMcqQuestion(question, difficulty === "all" ? "medium" : difficulty));
      });
    } else if (questionType === "open-ended") {
      const openQuestions = await getOpenQuestions(topic, numericDifficulty, "English", baseUrl, count);
      // Convert each returned question to our format
      openQuestions.forEach(question => {
        questions.push(convertOpenQuestion(question, difficulty === "all" ? "medium" : difficulty));
      });
    }
  } catch (error) {
    console.error(`Error fetching questions:`, error);
  }
  
  // If we couldn't fetch any questions, use fallbacks
  if (questions.length === 0) {
    return getFallbackQuestions(difficulty, questionType).slice(0, count);
  }
  
  return questions.slice(0, count); // Ensure we return only the requested count
}