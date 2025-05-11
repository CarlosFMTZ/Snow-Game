export const GAME_CONSTANTS = {
  CANVAS_WIDTH: 1000,
  CANVAS_HEIGHT: 500,
  SLOPE_ANGLE: 15,
  MOVEMENT_SPEED: 1.5,
  TREE_GENERATION_INTERVAL: 120,
  GRAVITY: 0.2,
  PLAYER_WIDTH: 32,
  PLAYER_HEIGHT: 32,
  OBSTACLE_WIDTH: 32,
  OBSTACLE_HEIGHT: 48,
  MAX_LIVES: 3,
  POWERUP_SIZE: 30,
  POWERUP_DURATION: 10000, // 10 seconds
  POWERUP_SPAWN_CHANCE: 0.01, // 1% chance per frame
  PARTICLE_COUNT: 100,
  SPEED_INCREASE_INTERVAL: 2000,
  SPEED_INCREASE_AMOUNT: 0.1,
  MIN_TREE_GENERATION_INTERVAL: 30,
  TREE_GENERATION_INTERVAL_DECREASE: 5,
  POWERUP_GENERATION_INTERVAL: 300,
  OBSTACLE_SPEED: 1.5,
}

export const COLORS = {
  sky: "#ffffff",
  snow: "#ffffff",
  skiTrail: "#e6f2ff",
  heart: "#ff3366",
  shield: "#4287f5",
  multiplier: "#f7d51d",
  speedBoost: "#32CD32",
  extraLife: "#ff69b4",
  collision: "#ff0000",
}

// Update the IMAGES section to use a single working sprite URL with color overlays
export const IMAGES = {
  PLAYER: [
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/snowboarder-d8ooGdTTeqCc73t5hfW0TPLcqBEcmx.png",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/snowboarder-d8ooGdTTeqCc73t5hfW0TPLcqBEcmx.png", // Use same base image with color overlay
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/snowboarder-d8ooGdTTeqCc73t5hfW0TPLcqBEcmx.png", // Use same base image with color overlay
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/snowboarder-d8ooGdTTeqCc73t5hfW0TPLcqBEcmx.png", // Use same base image with color overlay
  ],
  TREES: [
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Tree_0-IiABkoy1TJgd2IK76dMoZKcBoSM3OV.png",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Tree_1-PQuEzy4tGxrfIvvsOKN1x30qB7LxAZ.png",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Tree_2-3emosJCVNsMc6SFLYBDexLwAjvMMcc.png",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Tree_3-tCJCvnL001vtrqLkK4TxBhvwDljBAz.png",
  ],
  SNOWMEN: [
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Snowman_0-TCuDVs2e6275EeFLJgVZT2gG6xR8eW.png",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Snowman_1-1XU0CXxXygx3Tf6eGfSJhMcrv96ElE.png",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Snowman_2-5TfN4Fu4Jr2F9t91GlSdbqPFfPvupL.png",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Snowman_3-Lj63E3FyGim1kfm3G50zhSwi6zylMe.png",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Snowman_4-V6HRnct6cFbhVyfOx74b7CwzyGJ3la.png",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Snowman_5-m2NUZb2dgzRCPibAWx09MzpzNxYmLB.png",
  ],
}

export const FONTS = {
  PIXEL: "https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap",
}

export const SOUNDS = {
  ENABLED: true,
}

export enum PowerUpType {
  SHIELD = "shield",
  SCORE_MULTIPLIER = "multiplier",
  SPEED_BOOST = "speedBoost",
  EXTRA_LIFE = "extraLife",
}

export const MUSIC_NOTES = {
  // Pentatonic scale notes for background music
  NOTES: [
    { note: "C4", frequency: 261.63 },
    { note: "D4", frequency: 293.66 },
    { note: "E4", frequency: 329.63 },
    { note: "G4", frequency: 392.0 },
    { note: "A4", frequency: 440.0 },
    { note: "C5", frequency: 523.25 },
    { note: "D5", frequency: 587.33 },
    { note: "E5", frequency: 659.25 },
  ],
}

// New game name
export const GAME_NAME = "Alpine Rush"

// Character definitions
export interface Character {
  id: number
  name: string
  spriteIndex: number
  description: string
  color: string
}

export const CHARACTERS: Character[] = [
  {
    id: 0,
    name: "Classic",
    spriteIndex: 0,
    description: "The original snowboarder with balanced stats",
    color: "#ff3366",
  },
  {
    id: 1,
    name: "Blizzard",
    spriteIndex: 1,
    description: "Faster but harder to control",
    color: "#4287f5",
  },
  {
    id: 2,
    name: "Forest",
    spriteIndex: 2,
    description: "Better at avoiding obstacles",
    color: "#32CD32",
  },
  {
    id: 3,
    name: "Sunset",
    spriteIndex: 3,
    description: "Luckier with power-ups",
    color: "#ff69b4",
  },
]

// Achievement definitions
export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  condition: (stats: GameStats) => boolean
  unlocked: boolean
  secret?: boolean
}

export interface GameStats {
  highScore: number
  totalGamesPlayed: number
  totalDistance: number
  powerUpsCollected: number
  obstaclesAvoided: number
  longestRun: number
  totalPlayTime: number
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_game",
    name: "First Descent",
    description: "Play your first game",
    icon: "🏂",
    condition: (stats: GameStats) => stats.totalGamesPlayed >= 1,
    unlocked: false,
  },
  {
    id: "score_100",
    name: "Beginner Boarder",
    description: "Score 100 points in a single run",
    icon: "🔢",
    condition: (stats: GameStats) => stats.highScore >= 100,
    unlocked: false,
  },
  {
    id: "score_500",
    name: "Intermediate Rider",
    description: "Score 500 points in a single run",
    icon: "📈",
    condition: (stats: GameStats) => stats.highScore >= 500,
    unlocked: false,
  },
  {
    id: "score_1000",
    name: "Pro Snowboarder",
    description: "Score 1000 points in a single run",
    icon: "🏆",
    condition: (stats: GameStats) => stats.highScore >= 1000,
    unlocked: false,
  },
  {
    id: "collect_10_powerups",
    name: "Power Collector",
    description: "Collect 10 power-ups in total",
    icon: "⚡",
    condition: (stats: GameStats) => stats.powerUpsCollected >= 10,
    unlocked: false,
  },
  {
    id: "avoid_100_obstacles",
    name: "Obstacle Ninja",
    description: "Avoid 100 obstacles in total",
    icon: "🥷",
    condition: (stats: GameStats) => stats.obstaclesAvoided >= 100,
    unlocked: false,
  },
  {
    id: "play_10_games",
    name: "Dedicated Rider",
    description: "Play 10 games",
    icon: "🎮",
    condition: (stats: GameStats) => stats.totalGamesPlayed >= 10,
    unlocked: false,
  },
  {
    id: "play_60_seconds",
    name: "Endurance Run",
    description: "Stay alive for 60 seconds in a single run",
    icon: "⏱️",
    condition: (stats: GameStats) => stats.longestRun >= 60,
    unlocked: false,
  },
  {
    id: "secret_achievement",
    name: "Mystery Achievement",
    description: "???",
    icon: "❓",
    condition: (stats: GameStats) => stats.totalPlayTime >= 300, // 5 minutes total play time
    unlocked: false,
    secret: true,
  },
]
