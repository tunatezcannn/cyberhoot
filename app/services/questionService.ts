import { z } from "zod";
import { getAuthToken, getUsername } from "./authService";

// Skip API calls to avoid connection errors
const USE_MOCK_DATA = false;

// Question response type definitions
export type McqQuestion = {
  id: string | number;
  type: "mcq";
  language: string;
  topic: string;
  text: string;
  options: string[];
  correctAnswer?: string;
  answer?: string;
  solvingTime?: number;
};

export type OpenQuestion = {
  id: string | number;
  type: "open";
  language: string;
  topic: string;
  text: string;
  solvingTime?: number;
};

export type Question = McqQuestion | OpenQuestion;

// Input validation schema
const QuestionRequestSchema = z.object({
  difficulty: z.number().min(1).max(10).default(5),
  type: z.enum(["mcq", "open"]).default("mcq"),
  language: z.string().default("English"),
  topic: z.string().default("cybersecurity"),
  count: z.number().min(1).max(20).default(5),
  username: z.string().optional(),
});

export type QuestionRequest = z.infer<typeof QuestionRequestSchema>;

/**
 * Helper to get auth headers for API requests
 */
function getAuthHeaders(): HeadersInit {
  // Get the token or use fallback if not available
  const token = getAuthToken();
  
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}` // Make sure 'Bearer' has correct capitalization
  };
}

/**
 * Fetches questions from the server based on provided parameters
 */
export async function getQuestions(params: QuestionRequest, baseUrl: string): Promise<Question[]> {
  // Skip API calls entirely if mock data is enabled
  if (USE_MOCK_DATA) {
    console.log("Using mock data instead of API call");
    const mockQuestions = [];
    for (let i = 0; i < params.count; i++) {
      mockQuestions.push(
        params.type === "mcq" 
          ? createMockMcqQuestion(params.topic) 
          : createMockOpenQuestion(params.topic)
      );
    }
    return mockQuestions;
  }
  
  try {
    // Validate input parameters
    const validatedParams = QuestionRequestSchema.parse(params);
    
    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 18000); // Increase timeout to 8 seconds
    
    try {
      // Use proxy URL instead of direct server URL
      // We will replace the baseUrl with the proxy URL pattern
      const url = `/api/ws/questions/getQuestions`;
      
      // Make API call to the backend via the proxy
      const response = await fetch(url, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(validatedParams),
        signal: controller.signal
      });
      console.log("Response:", response);
      // Clear the timeout
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Error fetching questions: ${response.status} ${response.statusText}`);
      }
      
      // Parse the response
      const data = await response.json();
      console.log("Data:", data);
      // Handle array or single question response
      const questionsArray = Array.isArray(data) ? data : [data];
      
      // Type guard to ensure correct return type for each question
      return questionsArray.filter(q => q.type === "mcq" || q.type === "open") as Question[];
    } catch (fetchError: any) {
      // Clear the timeout to prevent memory leaks
      clearTimeout(timeoutId);
      
      // Check if it was a timeout
      if (fetchError.name === 'AbortError') {
        throw new Error("API request timed out");
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error("Failed to fetch questions:", error);
    
    // Create mock data based on requested type
    const mockQuestions = [];
    for (let i = 0; i < params.count; i++) {
      mockQuestions.push(
        params.type === "mcq" 
          ? createMockMcqQuestion(params.topic) 
          : createMockOpenQuestion(params.topic)
      );
    }
    return mockQuestions;
  }
}

/**
 * Create a mock MCQ question when API fails
 */
function createMockMcqQuestion(topic: string): McqQuestion {
  return {
    id: "mock-" + Math.floor(Math.random() * 1000).toString(),
    type: "mcq",
    language: "English",
    topic: topic,
    text: `What is the most important aspect of ${topic}?`,
    options: [
      "Security",
      "Performance",
      "Usability",
      "All of the above"
    ],
    correctAnswer: "All of the above"
  };
}

/**
 * Create a mock open-ended question when API fails
 */
function createMockOpenQuestion(topic: string): OpenQuestion {
  return {
    id: "mock-" + Math.floor(Math.random() * 1000).toString(),
    type: "open",
    language: "English",
    topic: topic,
    text: `Explain the importance of ${topic} in modern cybersecurity.`
  };
}

/**
 * Get multiple choice questions
 */
export async function getMcqQuestions(
  topic: string, 
  difficulty = 5, 
  language = "English", 
  baseUrl: string,
  count = 5
): Promise<McqQuestion[]> {
  return getQuestions({
    difficulty,
    type: "mcq",
    language,
    topic,
    count,
    username: getUsername(),
  }, baseUrl) as Promise<McqQuestion[]>;
}

/**
 * Get open-ended questions
 */
export async function getOpenQuestions(
  topic: string, 
  difficulty = 5, 
  language = "English", 
  baseUrl: string,
  count = 5
): Promise<OpenQuestion[]> {
  return getQuestions({
    difficulty,
    type: "open",
    language,
    topic,
    count,
    username: getUsername(),
  }, baseUrl) as Promise<OpenQuestion[]>;
}

/**
 * Submit an answer to the remote server
 */
export async function submitAnswer(
  questionId: string | number,
  username: string,
  userAnswer: string,
  baseUrl: string,
  score?: number
): Promise<{ success: boolean; solvingTime?: number } | boolean> {
  // Skip API calls entirely if mock data is enabled
  if (USE_MOCK_DATA) {
    console.log("Using mock mode - answer submission simulated");
    return true;
  }
  
  try {
    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout
    
    try {
      // Use proxy URL instead of direct server URL - same pattern as getQuestions
      const url = `/api/ws/questions/submitAnswer`;
      
      const payload = {
        questionId,
        username,
        userAnswer,
        score
      };
      
      // Make API call to the backend via the proxy
      const response = await fetch(url, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      
      // Clear the timeout
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Error submitting answer: ${response.status} ${response.statusText}`);
      }
      
      console.log("Answer submitted successfully");
      
      // Try to parse response as JSON to check for additional data like solvingTime
      try {
        const data = await response.json();
        return { 
          success: true,
          ...data 
        };
      } catch (parseError) {
        // If we can't parse as JSON, just return success boolean
        return true;
      }
    } catch (fetchError: any) {
      // Clear the timeout to prevent memory leaks
      clearTimeout(timeoutId);
      
      // Check if it was a timeout
      if (fetchError.name === 'AbortError') {
        throw new Error("API request timed out");
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error("Failed to submit answer:", error);
    return false;
  }
} 