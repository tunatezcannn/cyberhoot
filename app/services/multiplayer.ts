// This is a simulated multiplayer service for the quiz app
// In a real application, this would use WebSockets or a real-time database like Firebase

export type Player = {
  id: string;
  name: string;
  avatar: string;
  color: string;
  score: number;
  isHost: boolean;
  isYou: boolean;
  status: 'waiting' | 'ready' | 'playing' | 'finished';
  answerTime?: number;
  correctAnswers: number;
  currentAnswer?: string;
};

export type GameSession = {
  id: string;
  code: string;
  hostId: string;
  status: 'waiting' | 'playing' | 'finished';
  players: Player[];
  topic: string;
  questionType: string;
  currentQuestionIndex: number;
  startTime?: number;
  endTime?: number;
};

// List of bot names for simulating players
const botNames = [
  'CyberNinja',
  'HackerHunter',
  'SecureShield',
  'DataDefender',
  'FirewallPhoenix',
  'BinaryBoss',
  'CodeGuardian',
  'EncryptElite',
  'NetworkSage',
  'ThreatTracker'
];

// Bot avatars represented as emoji
const botAvatars = ['🦊', '🐯', '🐼', '🦁', '🐺', '🦝', '🐱', '🐹', '🐰', '🐻'];

// Bot colors for visual distinction
const botColors = [
  '#FF5733', // Orange-red
  '#33FF57', // Lime green
  '#3357FF', // Blue
  '#FF33A8', // Pink
  '#33FFF5', // Cyan
  '#F5FF33', // Yellow
  '#A833FF', // Purple
  '#FF8333', // Orange
  '#8CFF33', // Light green
  '#33B5FF'  // Light blue
];

// Mock local storage for sessions
const gameSessions: Record<string, GameSession> = {};

// Generate a random game code
export function generateGameCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Create a new game session
export function createGameSession(hostName: string, topic: string, questionType: string): GameSession {
  const hostId = `user-${Date.now()}`;
  const gameId = `game-${Date.now()}`;
  const gameCode = generateGameCode();
  
  const host: Player = {
    id: hostId,
    name: hostName,
    avatar: '👤',
    color: '#9fef00', // Cyber green
    score: 0,
    isHost: true,
    isYou: true,
    status: 'waiting',
    correctAnswers: 0
  };
  
  const session: GameSession = {
    id: gameId,
    code: gameCode,
    hostId,
    status: 'waiting',
    players: [host],
    topic,
    questionType,
    currentQuestionIndex: 0
  };
  
  gameSessions[gameId] = session;
  return session;
}

// Add a bot player to a game session
export function addBotPlayer(gameId: string): Player | null {
  const session = gameSessions[gameId];
  if (!session || session.players.length >= 6) return null;
  
  const botIndex = session.players.length - 1;
  const botId = `bot-${Date.now()}-${botIndex}`;
  
  const bot: Player = {
    id: botId,
    name: botNames[botIndex % botNames.length],
    avatar: botAvatars[botIndex % botAvatars.length],
    color: botColors[botIndex % botColors.length],
    score: 0,
    isHost: false,
    isYou: false,
    status: 'waiting',
    correctAnswers: 0
  };
  
  session.players.push(bot);
  return bot;
}

// Join an existing game session
export function joinGameSession(gameCode: string, playerName: string): GameSession | null {
  // Find session by code
  const sessionEntry = Object.entries(gameSessions).find(([_, session]) => 
    session.code === gameCode && session.status === 'waiting'
  );
  
  if (!sessionEntry) return null;
  
  const [gameId, session] = sessionEntry;
  
  if (session.players.length >= 6) return null;
  
  const playerId = `player-${Date.now()}`;
  const playerIndex = session.players.length;
  
  const player: Player = {
    id: playerId,
    name: playerName,
    avatar: '👤',
    color: botColors[playerIndex % botColors.length],
    score: 0,
    isHost: false,
    isYou: true,
    status: 'waiting',
    correctAnswers: 0
  };
  
  // Mark existing "you" as not you
  session.players.forEach(p => {
    if (p.isYou) p.isYou = false;
  });
  
  session.players.push(player);
  return session;
}

// Start the game
export function startGame(gameId: string): GameSession | null {
  const session = gameSessions[gameId];
  if (!session) return null;
  
  session.status = 'playing';
  session.startTime = Date.now();
  session.players.forEach(player => {
    player.status = 'playing';
  });
  
  return session;
}

// Record a player's answer
export function recordAnswer(
  gameId: string, 
  playerId: string, 
  answer: string, 
  isCorrect: boolean, 
  answerTime: number,
  points: number
): GameSession | null {
  const session = gameSessions[gameId];
  if (!session) return null;
  
  const player = session.players.find(p => p.id === playerId);
  if (!player) return null;
  
  player.currentAnswer = answer;
  player.answerTime = answerTime;
  
  if (isCorrect) {
    player.score += points;
    player.correctAnswers += 1;
  }
  
  return session;
}

// Simulate bot answers
export function simulateBotAnswers(gameId: string, correctAnswer: string, timePerQuestion: number): GameSession | null {
  const session = gameSessions[gameId];
  if (!session) return null;
  
  // Only simulate for bots
  const bots = session.players.filter(p => p.id.startsWith('bot-'));
  
  bots.forEach(bot => {
    // Bots have different "skill levels" based on ID
    const botSkill = parseInt(bot.id.split('-')[2]) % 5;
    const answerCorrectly = Math.random() < (0.5 + botSkill * 0.1); // 50-90% correct based on skill
    
    // Bots answer at different speeds
    const answerSpeed = Math.random() * 0.7 + 0.1; // 10-80% of available time
    const answerTime = Math.floor(timePerQuestion * answerSpeed);
    
    if (answerCorrectly) {
      // Calculate points similar to player
      const timeBonus = Math.floor((1 - answerSpeed) * 50);
      const points = 100 + timeBonus;
      
      bot.currentAnswer = correctAnswer;
      bot.score += points;
      bot.correctAnswers += 1;
      bot.answerTime = answerTime;
    } else {
      // Pick a wrong answer
      bot.currentAnswer = `incorrect-${Math.floor(Math.random() * 1000)}`;
      bot.answerTime = answerTime;
    }
  });
  
  return session;
}

// Move to next question
export function nextQuestion(gameId: string): GameSession | null {
  const session = gameSessions[gameId];
  if (!session) return null;
  
  session.currentQuestionIndex += 1;
  
  // Clear player answers
  session.players.forEach(player => {
    player.currentAnswer = undefined;
    player.answerTime = undefined;
  });
  
  return session;
}

// End the game
export function endGame(gameId: string): GameSession | null {
  const session = gameSessions[gameId];
  if (!session) return null;
  
  session.status = 'finished';
  session.endTime = Date.now();
  session.players.forEach(player => {
    player.status = 'finished';
  });
  
  return session;
}

// Get session by ID
export function getSession(gameId: string): GameSession | null {
  return gameSessions[gameId] || null;
}

// Get a simulated leaderboard
export function getLeaderboard(gameId: string): Player[] {
  const session = gameSessions[gameId];
  if (!session) return [];
  
  // Sort by score (highest first)
  return [...session.players].sort((a, b) => b.score - a.score);
}

// Delete a game session
export function deleteSession(gameId: string): boolean {
  if (gameSessions[gameId]) {
    delete gameSessions[gameId];
    return true;
  }
  return false;
} 