import { useState, useEffect } from "react";
import { useNavigate } from "@remix-run/react";
import { motion } from "framer-motion";
import { useMultiplayer } from "~/contexts/MultiplayerContext";
import { useQuestions } from "~/contexts/QuestionContext";
import MultiplayerLobby from "~/components/MultiplayerLobby";
import PlayersLeaderboard from "~/components/PlayersLeaderboard";
import AnswerOption from "~/components/AnswerOption";

export default function MultiplayerGame() {
  const navigate = useNavigate();
  const { gameSession, isHost, submitAnswer, advanceQuestion, endGame, resetGame } = useMultiplayer();
  const { currentQuestion, loading: questionsLoading, error, fetchQuestions, nextQuestion, hasMoreQuestions } = useQuestions();
  
  const [gameState, setGameState] = useState<"setup" | "lobby" | "playing" | "results">("setup");
  const [selectedTopic, setSelectedTopic] = useState("Cybersecurity Basics");
  const [questionType, setQuestionType] = useState("multiple_choice");
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [timeLeft, setTimeLeft] = useState(20);
  const [answerTime, setAnswerTime] = useState(0);
  
  // Timer for questions
  useEffect(() => {
    if (gameState !== "playing" || answerSubmitted) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!answerSubmitted) {
            handleAnswerSubmission(selectedAnswer || "timeout", false);
          }
          return 0;
        }
        return prev - 1;
      });
      setAnswerTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameState, answerSubmitted]);
  
  // Reset timer when moving to next question
  useEffect(() => {
    if (gameState === "playing") {
      setTimeLeft(20);
      setAnswerTime(0);
      setSelectedAnswer(null);
      setAnswerSubmitted(false);
      setAnswerFeedback(null);
    }
  }, [currentQuestion, gameState]);
  
  // Initial setup - fetch questions when game starts
  useEffect(() => {
    if (gameState === "playing" && isHost && gameSession) {
      fetchQuestions(selectedTopic, questionType);
    }
  }, [gameState, isHost]);
  
  const handleCreateGame = () => {
    const gameCode = useMultiplayer().createSession(selectedTopic, questionType);
    setGameState("lobby");
  };
  
  const handleStartGame = () => {
    setGameState("playing");
  };
  
  const handleAnswerSelection = (answer: string) => {
    if (answerSubmitted) return;
    setSelectedAnswer(answer);
  };
  
  const handleAnswerSubmission = (answer: string, isCorrect: boolean) => {
    if (!currentQuestion || answerSubmitted) return;
    
    // Calculate points based on time remaining
    const timeBonus = Math.floor((timeLeft / 20) * 50);
    const points = isCorrect ? 100 + timeBonus : 0;
    
    submitAnswer(answer, isCorrect, answerTime, points);
    setAnswerSubmitted(true);
    setAnswerFeedback(isCorrect ? "correct" : "incorrect");
    
    // After a delay, move to the next question
    setTimeout(() => {
      if (isHost) {
        if (hasMoreQuestions) {
          advanceQuestion();
          nextQuestion();
        } else {
          // End game if no more questions
          endGame();
          setGameState("results");
        }
      }
    }, 3000);
  };
  
  const handleLeaveGame = () => {
    resetGame();
    navigate("/");
  };
  
  // Determine which screen to show
  const renderGameContent = () => {
    switch (gameState) {
      case "setup":
        return (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-md mx-auto"
          >
            <h1 className="text-2xl font-bold mb-6 text-center">Create Multiplayer Game</h1>
            
            <div className="cyber-border bg-cyber-dark p-6 mb-6">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Topic</label>
                <select 
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full bg-cyber-dark border border-cyber-border rounded-md p-2"
                >
                  <option value="Cybersecurity Basics">Cybersecurity Basics</option>
                  <option value="Network Security">Network Security</option>
                  <option value="Malware Types">Malware Types</option>
                  <option value="Encryption">Encryption</option>
                  <option value="SQL Injection">SQL Injection</option>
                  <option value="Web Security">Web Security</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Question Type</label>
                <select 
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value)}
                  className="w-full bg-cyber-dark border border-cyber-border rounded-md p-2"
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="open">Open Questions</option>
                  <option value="true_false">True/False</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 border border-cyber-border rounded-md hover:border-red-500 hover:text-red-400"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGame}
                className="px-6 py-2 bg-cyber-green text-cyber-dark font-bold rounded-md hover:bg-opacity-90"
              >
                Create Game
              </button>
            </div>
          </motion.div>
        );
        
      case "lobby":
        return (
          <MultiplayerLobby 
            onCancel={handleLeaveGame} 
            onStart={handleStartGame} 
            topic={selectedTopic} 
          />
        );
        
      case "playing":
        return (
          <motion.div 
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-3">
                {questionsLoading ? (
                  <div className="cyber-border bg-cyber-dark p-8 text-center">
                    <div className="animate-pulse text-cyber-green">Loading question...</div>
                  </div>
                ) : error ? (
                  <div className="cyber-border bg-cyber-dark p-8 text-center text-red-400">
                    {error}
                  </div>
                ) : currentQuestion ? (
                  <div className="cyber-border bg-cyber-dark p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-xs">
                        Question {currentQuestion ? 1 : 0}/{hasMoreQuestions ? 2 : 1}
                      </div>
                      <div className="text-xs font-mono">
                        Time left: <span className={timeLeft < 5 ? 'text-red-400' : 'text-cyber-green'}>{timeLeft}s</span>
                      </div>
                    </div>
                    
                    <h2 className="text-xl font-medium mb-8">{currentQuestion.text}</h2>
                    
                    {currentQuestion.type === 'multiple_choice' && currentQuestion.options ? (
                      <div>
                        {currentQuestion.options.map((option, index) => (
                          <AnswerOption 
                            key={option}
                            option={option}
                            index={index}
                            isSelected={selectedAnswer === option}
                            isCorrect={answerFeedback === "correct" && selectedAnswer === option}
                            isIncorrect={answerFeedback === "incorrect" && selectedAnswer === option}
                            onClick={() => {
                              handleAnswerSelection(option);
                              if (!answerSubmitted) {
                                handleAnswerSubmission(
                                  option, 
                                  option === currentQuestion.correctAnswer
                                );
                              }
                            }}
                            disabled={answerSubmitted}
                            showFeedback={answerSubmitted}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="cyber-border bg-cyber-navy p-4 mb-4">
                        <p className="text-gray-300 mb-4">This is an open-ended question. Discuss your answer with your teammates!</p>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full p-3 bg-cyber-dark border border-cyber-border rounded-md hover:border-cyber-green"
                          onClick={() => {
                            if (!answerSubmitted) {
                              handleAnswerSubmission("open_answer", true);
                            }
                          }}
                          disabled={answerSubmitted}
                        >
                          {answerSubmitted ? "Answer Submitted" : "Mark as Answered"}
                        </motion.button>
                      </div>
                    )}
                    
                    {answerSubmitted && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-4 p-3 rounded-md ${
                          answerFeedback === "correct" ? "bg-green-900/30 text-cyber-green" : "bg-red-900/30 text-red-400"
                        }`}
                      >
                        {answerFeedback === "correct" ? (
                          <div className="flex items-center">
                            <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Correct answer!
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            {selectedAnswer === "timeout" ? "Time's up!" : "Incorrect answer"}
                          </div>
                        )}
                        
                        {isHost && (
                          <div className="text-xs mt-2 text-gray-400">
                            Advancing to next question in a few seconds...
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <div className="cyber-border bg-cyber-dark p-8 text-center">
                    No questions available
                  </div>
                )}
              </div>
              
              <div className="md:col-span-1">
                <PlayersLeaderboard showScores={true} highlightAnswers={true} />
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <button
                onClick={handleLeaveGame}
                className="px-4 py-2 border border-cyber-border rounded-md hover:border-red-500 hover:text-red-400"
              >
                Leave Game
              </button>
            </div>
          </motion.div>
        );
        
      case "results":
        return (
          <motion.div 
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-md mx-auto text-center"
          >
            <h1 className="text-2xl font-bold mb-2">Game Complete!</h1>
            <p className="text-gray-400 mb-6">Here are the final results</p>
            
            <div className="cyber-border bg-cyber-dark p-6 mb-6">
              <h2 className="text-xl font-medium mb-4">Leaderboard</h2>
              <PlayersLeaderboard showScores={true} />
            </div>
            
            <div className="mt-6">
              <button
                onClick={handleLeaveGame}
                className="px-6 py-2 bg-cyber-green text-cyber-dark font-bold rounded-md hover:bg-opacity-90"
              >
                Back to Home
              </button>
            </div>
          </motion.div>
        );
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {renderGameContent()}
    </div>
  );
} 