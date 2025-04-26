import { z } from "zod";

// Question response type definitions
export type McqQuestion = {
  id: string;
  type: "mcq";
  language: string;
  topic: string;
  text: string;
  options: string[];
  correctAnswer: string;
};

export type OpenQuestion = {
  id: string;
  type: "open";
  language: string;
  topic: string;
  text: string;
};

export type Question = McqQuestion | OpenQuestion;

// Input validation schema
const QuestionRequestSchema = z.object({
  difficulty: z.number().min(1).max(10).default(5),
  type: z.enum(["mcq", "open"]).default("mcq"),
  language: z.string().default("English"),
  topic: z.string().default("cybersecurity"),
});

export type QuestionRequest = z.infer<typeof QuestionRequestSchema>;

/**
 * Fetches questions from the server based on provided parameters
 */
export async function getQuestions(params: QuestionRequest): Promise<Question> {
  try {
    // Validate input parameters
    const validatedParams = QuestionRequestSchema.parse(params);
    
    // Make API call to the backend
    const response = await fetch("http://10.8.51.23:8080/ws/questions/getQuestions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validatedParams),
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching questions: ${response.status} ${response.statusText}`);
    }
    
    // Parse the response
    const data = await response.json();
    
    // Type guard to ensure correct return type
    if (data.type === "mcq" || data.type === "open") {
      return data as Question;
    } else {
      throw new Error("Invalid question type in response");
    }
  } catch (error) {
    console.error("Failed to fetch questions:", error);
    throw error;
  }
}

/**
 * Get multiple choice questions
 */
export async function getMcqQuestions(topic: string, difficulty = 5, language = "English"): Promise<McqQuestion> {
  return getQuestions({
    difficulty,
    type: "mcq",
    language,
    topic,
  }) as Promise<McqQuestion>;
}

/**
 * Get open-ended questions
 */
export async function getOpenQuestions(topic: string, difficulty = 5, language = "English"): Promise<OpenQuestion> {
  return getQuestions({
    difficulty,
    type: "open",
    language,
    topic,
  }) as Promise<OpenQuestion>;
} 