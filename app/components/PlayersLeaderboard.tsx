import { useMultiplayer } from "~/contexts/MultiplayerContext";
import type { Player } from "~/services/multiplayer";

type PlayersLeaderboardProps = {
  compact?: boolean;
  showScores?: boolean;
  highlightAnswers?: boolean;
};

const PlayersLeaderboard = ({
  compact = false,
  showScores = true,
  highlightAnswers = false,
}: PlayersLeaderboardProps) => {
  const { leaderboard, gameSession } = useMultiplayer();
  
  if (!gameSession || leaderboard.length === 0) return null;
  
  // Find current player for highlighting
  const currentPlayer = leaderboard.find(player => player.isYou);
  const yourRank = currentPlayer ? leaderboard.findIndex(p => p.isYou) + 1 : null;
  
  return (
    <div className={`w-full ${compact ? '' : 'cyber-border bg-cyber-dark p-4'}`}>
      {!compact && (
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium">Leaderboard</h3>
          {yourRank && (
            <div className="text-xs text-gray-400">
              Your rank: <span className="text-cyber-green font-medium">#{yourRank}</span>
            </div>
          )}
        </div>
      )}
      
      <div className={`space-y-${compact ? '1' : '2'}`}>
        {leaderboard.map((player, index) => (
          <div 
            key={player.id}
            className={`
              flex items-center justify-between 
              ${compact ? 'py-1' : 'cyber-border p-2 bg-cyber-navy'} 
              ${player.isYou ? 'border-cyber-green bg-cyber-green/10' : ''}
            `}
          >
            <div className="flex items-center">
              <div className={`
                ${compact ? 'h-6 w-6 text-xs' : 'h-7 w-7 text-sm'}
                rounded-full flex items-center justify-center font-bold mr-2 text-cyber-dark
              `} style={{ backgroundColor: player.color }}>
                {index + 1}
              </div>
              
              <div className="flex items-center">
                <span className={compact ? 'text-xs' : 'text-sm'}>{player.name}</span>
                {player.isYou && <span className="ml-1 text-[10px] text-cyber-green">(you)</span>}
                
                {/* Show whether player has answered current question */}
                {highlightAnswers && (
                  player.currentAnswer ? (
                    <div className="ml-2 h-2 w-2 rounded-full bg-green-500"></div>
                  ) : (
                    <div className="ml-2 h-2 w-2 rounded-full bg-gray-600 animate-pulse"></div>
                  )
                )}
              </div>
            </div>
            
            {showScores && (
              <div className={`
                ${compact ? 'text-xs' : 'text-sm'} 
                font-medium ${player.isYou ? 'text-cyber-green' : ''}
              `}>
                {player.score}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayersLeaderboard; 