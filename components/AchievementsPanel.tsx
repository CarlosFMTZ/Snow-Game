"use client"
import type { Achievement } from "../constants"

interface AchievementsPanelProps {
  achievements: Achievement[]
  onClose: () => void
}

export default function AchievementsPanel({ achievements, onClose }: AchievementsPanelProps) {
  // Filter out any invalid achievements
  const validAchievements = achievements.filter((a) => a && typeof a === "object" && "id" in a)

  const unlockedCount = validAchievements.filter((a) => a.unlocked).length
  const totalCount = validAchievements.length
  const completionPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="bg-gray-900 rounded-lg border-2 border-gray-700 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl text-white" style={{ fontFamily: '"Press Start 2P", cursive' }}>
            Achievements
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white focus:outline-none" aria-label="Close">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 border-b border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white">Progress</span>
            <span className="text-white">
              {unlockedCount}/{totalCount} ({completionPercentage}%)
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${completionPercentage}%` }}></div>
          </div>
        </div>

        <div className="overflow-y-auto flex-grow p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {validAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border ${
                  achievement.unlocked ? "border-green-500 bg-gray-800" : "border-gray-700 bg-gray-800 opacity-70"
                }`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3 text-2xl">{achievement.icon}</div>
                  <div>
                    <h3 className="text-white font-bold">
                      {achievement.unlocked || !achievement.secret ? achievement.name : "???"}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {achievement.unlocked || !achievement.secret
                        ? achievement.description
                        : "This achievement is still locked"}
                    </p>
                    {achievement.unlocked && (
                      <span className="inline-block mt-2 px-2 py-1 bg-green-900 text-green-300 text-xs rounded">
                        Unlocked
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-700">
          <button onClick={onClose} className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
