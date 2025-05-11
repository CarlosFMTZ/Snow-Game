import { type Achievement, type GameStats, ACHIEVEMENTS } from "../constants"

// Load achievements from localStorage
export function loadAchievements(): Achievement[] {
  try {
    const savedAchievements = localStorage.getItem("alpineRushAchievements")
    if (savedAchievements) {
      const parsed = JSON.parse(savedAchievements) as Achievement[]

      // Validate and fix achievements by merging with defaults
      return parsed
        .map((savedAchievement) => {
          // Find the matching default achievement to get its condition function
          const defaultAchievement = ACHIEVEMENTS.find((a) => a.id === savedAchievement.id)
          if (!defaultAchievement) {
            console.error(`Unknown achievement ID: ${savedAchievement.id}`)
            return null
          }

          // Merge the saved achievement with the default one, ensuring the condition function exists
          return {
            ...defaultAchievement,
            unlocked: savedAchievement.unlocked,
          }
        })
        .filter(Boolean) as Achievement[] // Remove any null values
    }
  } catch (err) {
    console.error("Error loading achievements:", err)
  }
  return [...ACHIEVEMENTS] // Return a copy of the default achievements
}

// Save achievements to localStorage
export function saveAchievements(achievements: Achievement[]): void {
  try {
    localStorage.setItem("alpineRushAchievements", JSON.stringify(achievements))
  } catch (err) {
    console.error("Error saving achievements:", err)
  }
}

// Load game stats from localStorage
export function loadGameStats(): GameStats {
  try {
    const savedStats = localStorage.getItem("alpineRushStats")
    if (savedStats) {
      return JSON.parse(savedStats) as GameStats
    }
  } catch (err) {
    console.error("Error loading game stats:", err)
  }
  return {
    highScore: 0,
    totalGamesPlayed: 0,
    totalDistance: 0,
    powerUpsCollected: 0,
    obstaclesAvoided: 0,
    longestRun: 0,
    totalPlayTime: 0,
  }
}

// Save game stats to localStorage
export function saveGameStats(stats: GameStats): void {
  try {
    localStorage.setItem("alpineRushStats", JSON.stringify(stats))
  } catch (err) {
    console.error("Error saving game stats:", err)
  }
}

// Update game stats after a game
export function updateGameStats(
  stats: GameStats,
  score: number,
  gameTime: number,
  powerUpsCollected: number,
  obstaclesAvoided: number,
): GameStats {
  const updatedStats = { ...stats }

  // Update high score if current score is higher
  if (score > updatedStats.highScore) {
    updatedStats.highScore = score
  }

  // Increment total games played
  updatedStats.totalGamesPlayed += 1

  // Add distance (score is a proxy for distance)
  updatedStats.totalDistance += score

  // Add power-ups collected
  updatedStats.powerUpsCollected += powerUpsCollected

  // Add obstacles avoided
  updatedStats.obstaclesAvoided += obstaclesAvoided

  // Update longest run if current run is longer
  if (gameTime > updatedStats.longestRun) {
    updatedStats.longestRun = gameTime
  }

  // Add game time to total play time
  updatedStats.totalPlayTime += gameTime

  return updatedStats
}

// Check for newly unlocked achievements
export function checkAchievements(achievements: Achievement[], stats: GameStats): Achievement[] {
  const updatedAchievements = [...achievements]
  let newlyUnlocked = false

  updatedAchievements.forEach((achievement) => {
    // Add a safety check to ensure condition is a function
    if (!achievement.unlocked && typeof achievement.condition === "function") {
      try {
        if (achievement.condition(stats)) {
          achievement.unlocked = true
          newlyUnlocked = true
        }
      } catch (err) {
        console.error(`Error checking achievement condition for ${achievement.id}:`, err)
      }
    }
  })

  if (newlyUnlocked) {
    saveAchievements(updatedAchievements)
  }

  return updatedAchievements
}

// Get newly unlocked achievements
export function getNewlyUnlockedAchievements(
  oldAchievements: Achievement[],
  newAchievements: Achievement[],
): Achievement[] {
  return newAchievements.filter(
    (newAchievement) =>
      newAchievement.unlocked &&
      oldAchievements.find((oldAchievement) => oldAchievement.id === newAchievement.id && !oldAchievement.unlocked),
  )
}
