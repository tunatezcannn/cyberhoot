// This service handles fetching questions from the API

type QuestionType = 'multiple_choice' | 'open' | 'true_false';

type Question = {
  id: string;
  type: string;
  language: string;
  topic: string;
  text: string;
  options?: string[];
  correctAnswer?: string;
};

type GetQuestionsParams = {
  difficulty: number;
  type: string;
  language: string;
  topic: string;
};

/**
 * Fetches questions from the API
 */
export async function getQuestions(params: GetQuestionsParams): Promise<Question[]> {
  try {
    const response = await fetch('http://10.8.51.23:8080/ws/questions/getQuestions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    console.log(response);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle both single question and array responses
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
}

/**
 * Handles error recovery by using local fallback questions
 */
export function getFallbackQuestions(topic: string, type: string): Question[] {
  // Provide some fallback questions in case the API is unavailable
  return [
    {
      id: 'fallback-1',
      type: 'open',
      language: 'English',
      topic: topic,
      text: `What are the key security considerations for ${topic}?`
    },
    {
      id: 'fallback-2',
      type: 'multiple_choice',
      language: 'English',
      topic: topic,
      text: `Which of the following is NOT a best practice for ${topic}?`,
      options: [
        'Regular security audits',
        'Using outdated libraries',
        'Input validation',
        'Principle of least privilege'
      ],
      correctAnswer: 'Using outdated libraries'
    }
  ];
} 