import { useState } from 'react';
import { useMultiplayer } from '~/contexts/MultiplayerContext';

type JoinGameProps = {
  onCancel: () => void;
  onSuccess: () => void;
};

const JoinGame = ({ onCancel, onSuccess }: JoinGameProps) => {
  const { playerName, setPlayerName, joinSession, loading } = useMultiplayer();
  const [gameCode, setGameCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!gameCode.trim()) {
      setError('Please enter a valid game code');
      return;
    }
    
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    
    const joined = joinSession(gameCode.toUpperCase());
    
    if (joined) {
      onSuccess();
    } else {
      setError('Game not found or already in progress');
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-4 text-center">Join a Game</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="playerName" className="block text-sm font-medium text-gray-300">
            Your Name
          </label>
          <input
            type="text"
            id="playerName"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full rounded-md border border-cyber-border bg-cyber-dark px-3 py-2 text-white placeholder:text-gray-500 focus:border-cyber-green focus:outline-none focus:ring-1 focus:ring-cyber-green"
            placeholder="Enter your name"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="gameCode" className="block text-sm font-medium text-gray-300">
            Game Code
          </label>
          <input
            type="text"
            id="gameCode"
            value={gameCode}
            onChange={(e) => setGameCode(e.target.value.toUpperCase())}
            className="w-full rounded-md border border-cyber-border bg-cyber-dark px-3 py-2 text-white uppercase tracking-widest placeholder:text-gray-500 focus:border-cyber-green focus:outline-none focus:ring-1 focus:ring-cyber-green"
            placeholder="Enter 6-digit code"
            maxLength={6}
            required
          />
        </div>
        
        {error && (
          <div className="rounded border border-red-500 bg-red-900/20 p-2 text-sm text-red-400">
            {error}
          </div>
        )}
        
        <div className="flex justify-between pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-cyber-border px-4 py-2 text-sm font-medium text-white transition-all hover:border-red-500 hover:text-red-400"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-cyber-green px-4 py-2 text-sm font-bold text-cyber-dark transition-all hover:bg-opacity-90 disabled:bg-opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Joining...' : 'Join Game'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JoinGame; 