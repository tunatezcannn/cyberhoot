import React, { createContext, useContext, useState, useEffect } from 'react';
import * as MultiplayerService from '~/services/multiplayer';
import type { GameSession, Player } from '~/services/multiplayer';

type MultiplayerContextType = {
  gameSession: GameSession | null;
  isHost: boolean;
  playerName: string;
  setPlayerName: (name: string) => void;
  createSession: (topic: string, questionType: string) => string;
  joinSession: (code: string) => boolean;
  addBot: () => void;
  startGame: () => void;
  submitAnswer: (answer: string, isCorrect: boolean, answerTime: number, points: number) => void;
  advanceQuestion: () => void;
  endGame: () => void;
  leaderboard: Player[];
  resetGame: () => void;
  loading: boolean;
};

const MultiplayerContext = createContext<MultiplayerContextType | undefined>(undefined);

export const MultiplayerProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string>('CyberPlayer');
  const [loading, setLoading] = useState<boolean>(false);
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);

  const isHost = gameSession?.players.some(p => p.isYou && p.isHost) || false;
  
  // Update leaderboard whenever the game session changes
  useEffect(() => {
    if (gameSession) {
      setLeaderboard([...gameSession.players].sort((a, b) => b.score - a.score));
    }
  }, [gameSession]);

  // Simulate real-time updates
  useEffect(() => {
    if (!currentGameId || !gameSession) return;

    // Only simulate if we're in playing mode
    if (gameSession.status !== 'playing') return;

    // Simulate bot answers after some delay
    const timer = setTimeout(() => {
      if (gameSession.status === 'playing') {
        const updatedSession = MultiplayerService.getSession(currentGameId);
        if (updatedSession) {
          setGameSession({...updatedSession});
          setLeaderboard([...updatedSession.players].sort((a, b) => b.score - a.score));
        }
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [currentGameId, gameSession]);

  const createSession = (topic: string, questionType: string): string => {
    setLoading(true);
    const session = MultiplayerService.createGameSession(playerName, topic, questionType);
    setGameSession(session);
    setCurrentGameId(session.id);
    setLoading(false);
    return session.code;
  };

  const joinSession = (code: string): boolean => {
    setLoading(true);
    const session = MultiplayerService.joinGameSession(code, playerName);
    if (session) {
      setGameSession(session);
      setCurrentGameId(session.id);
      setLoading(false);
      return true;
    }
    setLoading(false);
    return false;
  };

  const addBot = () => {
    if (!currentGameId) return;
    
    const bot = MultiplayerService.addBotPlayer(currentGameId);
    if (bot) {
      const updatedSession = MultiplayerService.getSession(currentGameId);
      if (updatedSession) {
        setGameSession({...updatedSession});
      }
    }
  };

  const startGame = () => {
    if (!currentGameId) return;
    
    const updatedSession = MultiplayerService.startGame(currentGameId);
    if (updatedSession) {
      setGameSession({...updatedSession});
    }
  };

  const submitAnswer = (answer: string, isCorrect: boolean, answerTime: number, points: number) => {
    if (!currentGameId || !gameSession) return;
    
    // Find your player ID
    const yourPlayer = gameSession.players.find(p => p.isYou);
    if (!yourPlayer) return;
    
    // Record your answer
    const updatedSession = MultiplayerService.recordAnswer(
      currentGameId,
      yourPlayer.id,
      answer,
      isCorrect,
      answerTime,
      points
    );
    
    if (updatedSession) {
      // Simulate bot answers
      const currentQuestion = gameSession.currentQuestionIndex;
      const correctAnswer = isCorrect ? answer : '';
      
      setTimeout(() => {
        MultiplayerService.simulateBotAnswers(currentGameId, correctAnswer, 20);
        const latestSession = MultiplayerService.getSession(currentGameId);
        if (latestSession) {
          setGameSession({...latestSession});
        }
      }, Math.random() * 2000 + 1000); // Random delay between 1-3 seconds
      
      setGameSession({...updatedSession});
    }
  };

  const advanceQuestion = () => {
    if (!currentGameId) return;
    
    const updatedSession = MultiplayerService.nextQuestion(currentGameId);
    if (updatedSession) {
      setGameSession({...updatedSession});
    }
  };

  const endGame = () => {
    if (!currentGameId) return;
    
    const updatedSession = MultiplayerService.endGame(currentGameId);
    if (updatedSession) {
      setGameSession({...updatedSession});
      setLeaderboard([...updatedSession.players].sort((a, b) => b.score - a.score));
    }
  };

  const resetGame = () => {
    if (currentGameId) {
      MultiplayerService.deleteSession(currentGameId);
    }
    setGameSession(null);
    setCurrentGameId(null);
    setLeaderboard([]);
  };

  return (
    <MultiplayerContext.Provider
      value={{
        gameSession,
        isHost,
        playerName,
        setPlayerName,
        createSession,
        joinSession,
        addBot,
        startGame,
        submitAnswer,
        advanceQuestion,
        endGame,
        leaderboard,
        resetGame,
        loading
      }}
    >
      {children}
    </MultiplayerContext.Provider>
  );
};

export const useMultiplayer = () => {
  const context = useContext(MultiplayerContext);
  if (context === undefined) {
    throw new Error('useMultiplayer must be used within a MultiplayerProvider');
  }
  return context;
};

export default MultiplayerContext; 