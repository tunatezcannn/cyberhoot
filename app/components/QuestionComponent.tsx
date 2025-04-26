import React, { useState, useEffect } from "react";
import { getMcqQuestions, getOpenQuestions, McqQuestion, OpenQuestion } from "../services/questionService";

export default function QuestionComponent() {
  const [mcqQuestion, setMcqQuestion] = useState<McqQuestion | null>(null);
  const [openQuestion, setOpenQuestion] = useState<OpenQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadMcqQuestion() {
    setIsLoading(true);
    setError(null);
    setSelectedAnswer(null);
    setIsCorrect(null);
    
    try {
      const question = await getMcqQuestions("cybersecurity", 5);
      setMcqQuestion(question);
      setOpenQuestion(null);
    } catch (err) {
      setError("Failed to load MCQ question. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadOpenQuestion() {
    setIsLoading(true);
    setError(null);
    setSelectedAnswer(null);
    setIsCorrect(null);
    
    try {
      const question = await getOpenQuestions("cybersecurity", 5);
      setOpenQuestion(question);
      setMcqQuestion(null);
    } catch (err) {
      setError("Failed to load open-ended question. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  function handleAnswerSelection(answer: string) {
    setSelectedAnswer(answer);
    if (mcqQuestion) {
      setIsCorrect(answer === mcqQuestion.correctAnswer);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Cybersecurity Quiz</h2>
      
      <div className="flex space-x-4 mb-6">
        <button 
          onClick={loadMcqQuestion}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={isLoading}
        >
          Load Multiple Choice Question
        </button>
        <button 
          onClick={loadOpenQuestion}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          disabled={isLoading}
        >
          Load Open-Ended Question
        </button>
      </div>

      {isLoading && <p className="text-gray-500">Loading question...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {mcqQuestion && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">{mcqQuestion.text}</h3>
          <ul className="space-y-2">
            {mcqQuestion.options.map((option, index) => (
              <li key={index}>
                <button
                  className={`w-full text-left p-3 rounded border ${
                    selectedAnswer === option
                      ? isCorrect
                        ? "bg-green-100 border-green-500"
                        : "bg-red-100 border-red-500"
                      : "bg-gray-50 border-gray-300 hover:bg-gray-100"
                  }`}
                  onClick={() => handleAnswerSelection(option)}
                >
                  {option}
                </button>
              </li>
            ))}
          </ul>
          {selectedAnswer && (
            <div className="mt-4 p-3 rounded bg-gray-50">
              {isCorrect ? (
                <p className="text-green-600 font-medium">Correct answer!</p>
              ) : (
                <p className="text-red-600 font-medium">
                  Incorrect. The correct answer is: {mcqQuestion.correctAnswer}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {openQuestion && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">{openQuestion.text}</h3>
          <textarea
            className="w-full p-3 border border-gray-300 rounded min-h-[150px]"
            placeholder="Type your answer here..."
          ></textarea>
          <p className="mt-2 text-sm text-gray-500">
            This is an open-ended question. Your answer will not be automatically graded.
          </p>
        </div>
      )}
    </div>
  );
} 