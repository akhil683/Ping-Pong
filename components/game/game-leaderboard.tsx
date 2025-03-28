import { PlayerType } from "./game-page"

interface PropType {
  timeLeft: number,
  currentRound: number,
  totalRounds: number,
  players: PlayerType[],
}

export default function GameLeaderboard({ timeLeft, currentRound, totalRounds, players }: PropType) {
  return (
    < div className="w-64 bg-white/90 backdrop-blur-sm rounded-lg overflow-hidden shadow-xl border border-white/20" >
      <div className="flex items-center bg-gray-100 p-2">
        <div className="bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center font-bold text-gray-700 animate-pulse-slow">
          {timeLeft}
        </div>
        <div className="ml-2 font-bold">
          Round {currentRound} of {totalRounds}
        </div>
      </div>

      <div className="divide-y">
        {players.map((player) => (
          <div
            key={player.id}
            className={`flex items-center p-2 ${player.isDrawing ? "bg-gray-100" : ""} ${player.isDrawing ? "animate-pulse-slow" : ""}`}
          >
            <div className="w-8 text-right font-bold text-gray-700 mr-2">#{player.id}</div>
            <div className="relative w-10 h-10 flex-shrink-0">
              <Avatar color={player.color} />
            </div>
            <div className="ml-2 flex-1 overflow-hidden">
              <div className="font-bold text-black truncate">{player.name}</div>
              <div className="text-sm text-gray-600">{player.points} points</div>
            </div>
          </div>
        ))}
      </div>
    </div >
  )
}

function Avatar({ color }: { color: string }) {
  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0 rounded-full" style={{ backgroundColor: color }}></div>
      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-3/5 h-1/5 bg-white rounded-full flex justify-center items-center">
        <div className="w-1/2 h-3/4 bg-black rounded-full"></div>
      </div>
      <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 w-2/5 h-1/6 bg-black rounded-full"></div>
    </div>
  )
}

