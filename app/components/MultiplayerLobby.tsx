import { useEffect, useState } from "react";
import { useMultiplayer } from "~/contexts/MultiplayerContext";
import { motion, AnimatePresence } from "framer-motion";

type MultiplayerLobbyProps = {
  onCancel: () => void;
  onStart: () => void;
  topic: string;
};

const MultiplayerLobby = ({ onCancel, onStart, topic }: MultiplayerLobbyProps) => {
  const { gameSession, isHost, addBot, startGame } = useMultiplayer();
  const [copied, setCopied] = useState(false);
  const [playerJoined, setPlayerJoined] = useState(false);
  
  // Automatically add a bot after a delay
  useEffect(() => {
    if (!gameSession || !isHost) return;
    
    const timers: NodeJS.Timeout[] = [];
    
    // Add 1-3 bots with random delays
    const numBots = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < numBots; i++) {
      const timer = setTimeout(() => {
        if (gameSession.players.length < 6) {
          addBot();
          setPlayerJoined(true);
          
          // Reset the animation after 2 seconds
          setTimeout(() => {
            setPlayerJoined(false);
          }, 2000);
        }
      }, (i + 1) * 2000 + Math.random() * 1000); // Stagger bot additions
      
      timers.push(timer);
    }
    
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [gameSession, isHost, addBot]);
  
  const copyGameCode = () => {
    if (!gameSession) return;
    
    navigator.clipboard.writeText(gameSession.code);
    setCopied(true);
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  const handleStart = () => {
    startGame();
    onStart();
  };
  
  if (!gameSession) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <motion.div 
        className="text-center mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <h2 className="text-xl font-bold mb-1">Game Lobby: <span className="text-cyber-green">{topic}</span></h2>
        
        <motion.div 
          className="flex items-center justify-center space-x-2 bg-cyber-dark px-3 py-2 rounded-lg mt-4 mb-2 cursor-pointer"
          onClick={copyGameCode}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="text-sm text-gray-400">Game Code:</span>
          <span className="text-xl font-mono font-bold tracking-wider text-cyber-green">{gameSession.code}</span>
          <svg className="h-5 w-5 text-cyber-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
        </motion.div>
        
        <AnimatePresence>
          {copied && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs text-cyber-green"
            >
              Code copied to clipboard
            </motion.div>
          )}
        </AnimatePresence>
        
        <p className="text-sm text-gray-400 mt-2">
          Share this code with others to join this game
        </p>
      </motion.div>
      
      <motion.div 
        className="cyber-border bg-cyber-dark p-6 mb-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Players ({gameSession.players.length}/6)</h3>
          {isHost && (
            <motion.button
              onClick={addBot}
              disabled={gameSession.players.length >= 6}
              className="text-sm px-3 py-1 border border-cyber-border rounded-md hover:border-cyber-green disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Add Bot
            </motion.button>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-6">
          {gameSession.players.map((player, index) => (
            <motion.div 
              key={player.id} 
              className={`
                flex items-center p-2 rounded-md border border-cyber-border bg-cyber-dark
                ${player.isYou ? 'border-cyber-green bg-cyber-green/10' : ''}
                ${playerJoined && index === gameSession.players.length - 1 ? 'animate-pulse' : ''}
              `}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.3 }}
            >
              <motion.div 
                className="h-8 w-8 rounded-full mr-3 flex items-center justify-center text-cyber-dark font-bold"
                style={{ backgroundColor: player.color }}
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                {player.avatar}
              </motion.div>
              <div>
                <div className="text-sm font-medium flex items-center">
                  {player.name}
                  {player.isHost && (
                    <motion.span 
                      className="ml-2 text-xs px-1.5 py-0.5 bg-cyber-green/20 text-cyber-green rounded-full"
                      animate={{ 
                        backgroundColor: ["rgba(52, 211, 153, 0.2)", "rgba(52, 211, 153, 0.4)", "rgba(52, 211, 153, 0.2)"] 
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      Host
                    </motion.span>
                  )}
                </div>
                {player.isYou && <div className="text-xs text-cyber-green">You</div>}
              </div>
            </motion.div>
          ))}
          
          {/* Empty slots */}
          {Array.from({ length: Math.max(0, 6 - gameSession.players.length) }).map((_, i) => (
            <motion.div 
              key={`empty-${i}`} 
              className="border border-dashed border-cyber-border rounded-md p-2 flex items-center text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 0.3 + (0.1 * i), duration: 0.3 }}
            >
              <div className="h-8 w-8 rounded-full bg-cyber-border/30 mr-3 flex items-center justify-center">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="text-sm">Waiting for player...</span>
            </motion.div>
          ))}
        </div>
        
        <div className="flex justify-between items-center">
          <motion.button
            onClick={onCancel}
            className="px-4 py-2 border border-cyber-border rounded-md hover:border-red-500 hover:text-red-400 transition-colors"
            whileHover={{ scale: 1.05, borderColor: "#f87171" }}
            whileTap={{ scale: 0.95 }}
          >
            Leave Game
          </motion.button>
          
          {isHost ? (
            <motion.button
              onClick={handleStart}
              disabled={gameSession.players.length < 2}
              className="px-6 py-2 bg-cyber-green text-cyber-dark font-medium rounded-md hover:bg-opacity-90 transition-colors disabled:bg-opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={gameSession.players.length >= 2 ? { 
                scale: [1, 1.03, 1],
                boxShadow: ["0px 0px 0px rgba(52, 211, 153, 0)", "0px 0px 8px rgba(52, 211, 153, 0.5)", "0px 0px 0px rgba(52, 211, 153, 0)"]
              } : {}}
              transition={{ 
                duration: 2,
                repeat: gameSession.players.length >= 2 ? Infinity : 0,
                repeatType: "reverse"
              }}
            >
              Start Game ({gameSession.players.length}/2)
            </motion.button>
          ) : (
            <motion.div 
              className="text-sm text-gray-400"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Waiting for host to start...
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MultiplayerLobby; 