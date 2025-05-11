"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import {
  GAME_CONSTANTS,
  COLORS,
  IMAGES,
  FONTS,
  SOUNDS,
  PowerUpType,
  GAME_NAME,
  type Character,
  type Achievement,
  type GameStats,
} from "../constants"
import {
  type PowerUp,
  createPowerUp,
  drawPowerUp,
  drawActivePowerUps,
  checkPowerUpCollision,
  applyPowerUpEffect,
  updatePowerUps,
} from "../utils/powerups"
import {
  type Particle,
  createSnowParticles,
  createCollisionParticles,
  createPowerUpCollectionParticles,
  updateParticles,
  drawParticles,
} from "../utils/particles"
import { BackgroundMusic } from "../utils/music"
import {
  loadAchievements,
  loadGameStats,
  saveGameStats,
  updateGameStats,
  checkAchievements,
  getNewlyUnlockedAchievements,
} from "../utils/achievements"
import CharacterSelection from "./CharacterSelection"
import AchievementsPanel from "./AchievementsPanel"
import SharePanel from "./SharePanel"
import AchievementNotification from "./AchievementNotification"

interface Obstacle {
  x: number
  y: number
  sprite: HTMLImageElement
}

interface Player {
  x: number
  y: number
  velocityY: number
  isMovingUp: boolean
  sprite: HTMLImageElement | null
}

interface TrailPoint {
  x: number
  y: number
}

// In the HighScore interface, add a name property
interface HighScore {
  score: number
  date: string
  name: string
}

export default function AlpineRush() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [score, setScore] = useState(0)
  const [gameTime, setGameTime] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [highScores, setHighScores] = useState<HighScore[]>([])
  const [isNewHighScore, setIsNewHighScore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [canvasScale, setCanvasScale] = useState(1)
  const [isMusicMuted, setIsMusicMuted] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const musicRef = useRef<BackgroundMusic | null>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  // Add a new state for the player name input
  const [playerName, setPlayerName] = useState("")

  // Add states for new features
  const [gameStarted, setGameStarted] = useState(false)
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [gameStats, setGameStats] = useState<GameStats>({
    highScore: 0,
    totalGamesPlayed: 0,
    totalDistance: 0,
    powerUpsCollected: 0,
    obstaclesAvoided: 0,
    longestRun: 0,
    totalPlayTime: 0,
  })
  const [showAchievements, setShowAchievements] = useState(false)
  const [showSharePanel, setShowSharePanel] = useState(false)
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([])
  const [isLandscape, setIsLandscape] = useState(false)

  // Game state tracking
  const gameStateRef = useRef({
    player: {
      x: 100,
      y: GAME_CONSTANTS.CANVAS_HEIGHT / 2,
      velocityY: 0,
      isMovingUp: false,
      sprite: null as HTMLImageElement | null,
    },
    obstacles: [] as Obstacle[],
    powerUps: [] as PowerUp[],
    activePowerUps: [] as PowerUp[],
    trailPoints: [] as TrailPoint[],
    particles: [] as Particle[],
    snowParticles: [] as Particle[],
    frameCount: 0,
    startTime: Date.now(),
    gameSpeedMultiplier: 1,
    obstacleGenerationInterval: GAME_CONSTANTS.TREE_GENERATION_INTERVAL,
    lastSpeedIncreaseTime: 0,
    score: 0,
    lives: GAME_CONSTANTS.MAX_LIVES,
    isGameOver: false,
    invincibleUntil: 0,
    gameInitialized: false,
    soundsEnabled: SOUNDS.ENABLED,
    isPaused: false,
    hasShield: false,
    scoreMultiplier: 1,
    speedBoost: 1,
    powerUpsCollected: 0,
    obstaclesAvoided: 0,
  })

  // Check if device is mobile and handle orientation
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = typeof window.navigator === "undefined" ? "" : navigator.userAgent
      const mobile = Boolean(userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i))
      setIsMobile(mobile)
    }

    const checkOrientation = () => {
      if (window.matchMedia) {
        const isLandscape = window.matchMedia("(orientation: landscape)").matches
        setIsLandscape(isLandscape)
      }
    }

    checkMobile()
    checkOrientation()

    const handleOrientationChange = () => {
      checkOrientation()
    }

    window.addEventListener("orientationchange", handleOrientationChange)
    window.addEventListener("resize", handleOrientationChange)

    return () => {
      window.removeEventListener("orientationchange", handleOrientationChange)
      window.removeEventListener("resize", handleOrientationChange)
    }
  }, [])

  // Load achievements and game stats
  useEffect(() => {
    setAchievements(loadAchievements())
    setGameStats(loadGameStats())
  }, [])

  // Handle canvas scaling for responsive design
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const containerWidth = containerRef.current.clientWidth
        const containerHeight = containerRef.current.clientHeight

        // Calculate scale based on both width and height constraints
        const widthScale = Math.min(1, containerWidth / GAME_CONSTANTS.CANVAS_WIDTH)
        const heightScale = Math.min(1, containerHeight / GAME_CONSTANTS.CANVAS_HEIGHT)
        const scale = Math.min(widthScale, heightScale)

        setCanvasScale(scale)

        // Apply scale transform to canvas
        canvasRef.current.style.transform = `scale(${scale})`
        canvasRef.current.style.transformOrigin = "top left"

        // Set container height to match scaled canvas
        containerRef.current.style.height = `${GAME_CONSTANTS.CANVAS_HEIGHT * scale}px`
      }
    }

    window.addEventListener("resize", handleResize)
    handleResize() // Initial sizing

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  // Initialize background music
  useEffect(() => {
    musicRef.current = new BackgroundMusic()

    return () => {
      if (musicRef.current) {
        musicRef.current.cleanup()
      }
    }
  }, [])

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.code === "Space" && !gameStateRef.current.isGameOver) {
      gameStateRef.current.player.isMovingUp = true
    }

    // Pause game with 'P' key
    if (e.code === "KeyP") {
      togglePause()
    }

    // Toggle music with 'M' key
    if (e.code === "KeyM") {
      toggleMusic()
    }
  }

  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.code === "Space" && !gameStateRef.current.isGameOver) {
      gameStateRef.current.player.isMovingUp = false
    }
  }

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!gameStateRef.current.isGameOver && !gameStateRef.current.isPaused) {
      const touch = e.touches[0]
      touchStartRef.current = { x: touch.clientX, y: touch.clientY }
      gameStateRef.current.player.isMovingUp = true
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return

    const touch = e.touches[0]
    const deltaY = touchStartRef.current.y - touch.clientY

    // If swiped up significantly, move up
    if (deltaY > 30) {
      gameStateRef.current.player.isMovingUp = true
    }
    // If swiped down significantly, move down
    else if (deltaY < -30) {
      gameStateRef.current.player.isMovingUp = false
    }
  }

  const handleTouchEnd = () => {
    if (!gameStateRef.current.isGameOver) {
      touchStartRef.current = null
      gameStateRef.current.player.isMovingUp = false
    }
  }

  // Toggle pause
  const togglePause = () => {
    gameStateRef.current.isPaused = !gameStateRef.current.isPaused

    // Pause/resume music
    if (musicRef.current) {
      if (gameStateRef.current.isPaused) {
        musicRef.current.stop()
      } else if (!isMusicMuted) {
        musicRef.current.start()
      }
    }
  }

  // Toggle music
  const toggleMusic = () => {
    if (musicRef.current) {
      const isMuted = !musicRef.current.toggleMute()
      setIsMusicMuted(isMuted)
    }
  }

  // Function to load high scores
  const loadHighScores = () => {
    try {
      const savedScores = localStorage.getItem("alpineRushHighScores")
      if (savedScores) {
        return JSON.parse(savedScores) as HighScore[]
      }
    } catch (err) {
      console.error("Error loading high scores:", err)
    }
    return []
  }

  // Function to save high scores
  const saveHighScore = (score: number, name: string) => {
    try {
      const currentHighScores = loadHighScores()
      const newScore: HighScore = {
        score,
        date: new Date().toLocaleDateString(),
        name: name || "Anonymous",
      }

      const updatedScores = [...currentHighScores, newScore].sort((a, b) => b.score - a.score).slice(0, 5) // Keep only top 5 scores

      localStorage.setItem("alpineRushHighScores", JSON.stringify(updatedScores))

      // Check if current score is a new high score
      if (updatedScores[0].score === score || (currentHighScores.length > 0 && score > currentHighScores[0].score)) {
        setIsNewHighScore(true)
      }

      // Update high scores state after game is over
      setHighScores(updatedScores)
    } catch (err) {
      console.error("Error saving high score:", err)
    }
  }

  // Function to handle saving the score with the player's name
  const handleSaveScore = () => {
    saveHighScore(score, playerName)
  }

  // Function to handle character selection
  const handleSelectCharacter = (character: Character) => {
    setSelectedCharacter(character)
    setGameStarted(true)
  }

  // Function to handle achievement notification dismissal
  const handleDismissAchievement = () => {
    if (newAchievements.length > 0) {
      const updatedAchievements = [...newAchievements]
      updatedAchievements.shift() // Remove the first achievement
      setNewAchievements(updatedAchievements)
    }
  }

  // Function to restart the game
  const restartGame = () => {
    setGameOver(false)
    setScore(0)
    setGameTime(0)
    setIsNewHighScore(false)
    setPlayerName("")

    // Reset game state
    gameStateRef.current = {
      player: {
        x: 100,
        y: GAME_CONSTANTS.CANVAS_HEIGHT / 2,
        velocityY: 0,
        isMovingUp: false,
        sprite: gameStateRef.current.player.sprite,
      },
      obstacles: [],
      powerUps: [],
      activePowerUps: [],
      trailPoints: [],
      particles: [],
      snowParticles: gameStateRef.current.snowParticles,
      frameCount: 0,
      startTime: Date.now(),
      gameSpeedMultiplier: 1,
      obstacleGenerationInterval: GAME_CONSTANTS.TREE_GENERATION_INTERVAL,
      lastSpeedIncreaseTime: 0,
      score: 0,
      lives: GAME_CONSTANTS.MAX_LIVES,
      isGameOver: false,
      invincibleUntil: 0,
      gameInitialized: true,
      soundsEnabled: SOUNDS.ENABLED,
      isPaused: false,
      hasShield: false,
      scoreMultiplier: 1,
      speedBoost: 1,
      powerUpsCollected: 0,
      obstaclesAvoided: 0,
    }

    // Restart music
    if (musicRef.current && !isMusicMuted) {
      musicRef.current.start()
    }
  }

  useEffect(() => {
    // Load high scores only once at component mount
    if (highScores.length === 0) {
      setHighScores(loadHighScores())
    }

    if (!gameStarted) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Load font
    try {
      const fontLink = document.createElement("link")
      fontLink.href = FONTS.PIXEL
      fontLink.rel = "stylesheet"
      document.head.appendChild(fontLink)
    } catch (err) {
      console.error("Error loading font:", err)
    }

    // Initialize Web Audio API for sound effects
    try {
      // Only create AudioContext on user interaction to comply with browser policies
      const initAudio = () => {
        if (!audioContextRef.current && typeof window !== "undefined" && "AudioContext" in window) {
          audioContextRef.current = new AudioContext()
          gameStateRef.current.soundsEnabled = true

          // Start background music
          if (musicRef.current && !isMusicMuted) {
            musicRef.current.start()
          }

          // Remove the event listeners once audio is initialized
          window.removeEventListener("click", initAudio)
          window.removeEventListener("keydown", initAudio)
          window.removeEventListener("touchstart", initAudio)
        }
      }

      // Add event listeners to initialize audio on user interaction
      window.addEventListener("click", initAudio)
      window.addEventListener("keydown", initAudio)
      window.addEventListener("touchstart", initAudio)
    } catch (err) {
      console.error("Web Audio API not supported:", err)
      gameStateRef.current.soundsEnabled = false
    }

    // Function to play sound using Web Audio API
    const playSound = (frequency: number, duration: number, type: OscillatorType = "sine") => {
      if (!gameStateRef.current.soundsEnabled || !audioContextRef.current) return

      try {
        const oscillator = audioContextRef.current.createOscillator()
        const gainNode = audioContextRef.current.createGain()

        oscillator.type = type
        oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime)
        oscillator.connect(gainNode)
        gainNode.connect(audioContextRef.current.destination)

        // Fade out to avoid clicks
        gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration)

        oscillator.start()
        oscillator.stop(audioContextRef.current.currentTime + duration)
      } catch (err) {
        console.error("Error playing sound:", err)
        gameStateRef.current.soundsEnabled = false
      }
    }

    // Sound effects using Web Audio API
    const playCollisionSound = () => {
      playSound(220, 0.1, "sawtooth") // Lower frequency for collision
    }

    const playGameOverSound = () => {
      // Play a sequence of tones for game over
      if (!gameStateRef.current.soundsEnabled || !audioContextRef.current) return

      playSound(440, 0.2, "square")
      setTimeout(() => playSound(330, 0.2, "square"), 200)
      setTimeout(() => playSound(220, 0.3, "square"), 400)
    }

    const playPowerUpSound = () => {
      // Play a happy sound for power-up collection
      playSound(523.25, 0.1, "sine") // C5
      setTimeout(() => playSound(659.25, 0.1, "sine"), 100) // E5
      setTimeout(() => playSound(783.99, 0.2, "sine"), 200) // G5
    }

    const playAchievementSound = () => {
      // Play a special sound for achievement unlocks
      playSound(659.25, 0.1, "sine") // E5
      setTimeout(() => playSound(783.99, 0.1, "sine"), 150) // G5
      setTimeout(() => playSound(1046.5, 0.2, "sine"), 300) // C6
    }

    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        try {
          const img = new Image()
          img.crossOrigin = "anonymous"

          img.onload = () => resolve(img)
          img.onerror = (e) => {
            console.error(`Failed to load image: ${src}`, e)
            reject(new Error(`Failed to load image: ${src}`))
          }

          img.src = src
        } catch (err) {
          console.error(`Error creating image for ${src}:`, err)
          reject(err)
        }
      })
    }

    const loadObstacleSprites = async () => {
      try {
        const treePromises = IMAGES.TREES.map((src) =>
          loadImage(src).catch((err) => {
            console.error(`Failed to load tree image: ${src}`, err)
            // Return a fallback image or placeholder
            const fallback = new Image()
            fallback.width = GAME_CONSTANTS.OBSTACLE_WIDTH
            fallback.height = GAME_CONSTANTS.OBSTACLE_HEIGHT
            return fallback
          }),
        )

        const snowmanPromises = IMAGES.SNOWMEN.map((src) =>
          loadImage(src).catch((err) => {
            console.error(`Failed to load snowman image: ${src}`, err)
            // Return a fallback image or placeholder
            const fallback = new Image()
            fallback.width = GAME_CONSTANTS.OBSTACLE_WIDTH
            fallback.height = GAME_CONSTANTS.OBSTACLE_HEIGHT
            return fallback
          }),
        )

        const treeSprites = await Promise.all(treePromises)
        const snowmanSprites = await Promise.all(snowmanPromises)

        return { treeSprites, snowmanSprites }
      } catch (err) {
        console.error("Error loading obstacle sprites:", err)
        setError("Failed to load game assets. Please refresh the page.")
        throw err
      }
    }

    // Function to draw a heart shape on canvas
    const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(x, y + size / 4)

      // Left curve
      ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + size / 4)

      // Left bottom
      ctx.bezierCurveTo(x - size / 2, y + size / 2, x, y + (size * 3) / 4, x, y + size)

      // Right bottom
      ctx.bezierCurveTo(x, y + (size * 3) / 4, x + size / 2, y + size / 2, x + size / 2, y + size / 4)

      // Right curve
      ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + size / 4)

      ctx.fillStyle = COLORS.heart
      ctx.fill()
      ctx.restore()
    }

    const initGame = async () => {
      try {
        // Prevent multiple initializations
        if (gameStateRef.current.gameInitialized) return

        // Load player sprite with fallback
        const playerSprite = await loadImage(IMAGES.PLAYER[0]).catch((err) => {
          console.error("Failed to load player sprite:", err)
          // Return a fallback image
          const fallback = new Image()
          fallback.width = GAME_CONSTANTS.PLAYER_WIDTH
          fallback.height = GAME_CONSTANTS.PLAYER_HEIGHT
          return fallback
        })

        const { treeSprites, snowmanSprites } = await loadObstacleSprites()

        gameStateRef.current.player.sprite = playerSprite
        gameStateRef.current.gameInitialized = true

        // Initialize snow particles
        gameStateRef.current.snowParticles = createSnowParticles(GAME_CONSTANTS.PARTICLE_COUNT)

        const getRandomObstacleSprite = () => {
          const useTree = Math.random() > 0.3
          const sprites = useTree ? treeSprites : snowmanSprites
          return sprites[Math.floor(Math.random() * sprites.length)]
        }

        for (let i = 0; i < 6; i++) {
          gameStateRef.current.obstacles.push({
            x: Math.random() * GAME_CONSTANTS.CANVAS_WIDTH,
            y: Math.random() * (GAME_CONSTANTS.CANVAS_HEIGHT - 100) + 50,
            sprite: getRandomObstacleSprite(),
          })
        }

        // In the drawBackground function, remove the mountain drawing code
        // Find this section in the initGame function:
        const drawBackground = () => {
          // Draw sky gradient
          const gradient = ctx.createLinearGradient(0, 0, 0, GAME_CONSTANTS.CANVAS_HEIGHT)
          gradient.addColorStop(0, "#87CEEB") // Sky blue at top
          gradient.addColorStop(1, "#E0F7FF") // Lighter blue at bottom

          ctx.fillStyle = gradient
          ctx.fillRect(0, 0, GAME_CONSTANTS.CANVAS_WIDTH, GAME_CONSTANTS.CANVAS_HEIGHT)

          // Draw snow particles
          drawParticles(ctx, gameStateRef.current.snowParticles)

          // Remove the mountain drawing code
          // Draw snow ground
          ctx.fillStyle = COLORS.snow
          ctx.fillRect(0, GAME_CONSTANTS.CANVAS_HEIGHT - 50, GAME_CONSTANTS.CANVAS_WIDTH, 50)
        }

        const drawPlayer = () => {
          const { player } = gameStateRef.current
          if (player.sprite) {
            ctx.save()
            ctx.translate(player.x, player.y)

            if (gameStateRef.current.isGameOver) {
              ctx.rotate(-Math.PI / 2)
            }

            // Make player flash when invincible
            const isInvincible = Date.now() < gameStateRef.current.invincibleUntil
            if (isInvincible && Math.floor(Date.now() / 100) % 2 === 0) {
              ctx.globalAlpha = 0.5
            }

            // Draw shield effect if player has shield
            if (gameStateRef.current.hasShield) {
              ctx.beginPath()
              ctx.arc(0, 0, GAME_CONSTANTS.PLAYER_WIDTH * 0.8, 0, Math.PI * 2)
              ctx.fillStyle = "rgba(66, 135, 245, 0.3)"
              ctx.fill()
              ctx.strokeStyle = COLORS.shield
              ctx.lineWidth = 2
              ctx.stroke()
            }

            // Apply character color filter if not using the default character
            if (selectedCharacter && selectedCharacter.id > 0) {
              // Save the current composite operation
              const originalOperation = ctx.globalCompositeOperation

              // Draw the base sprite
              ctx.drawImage(
                player.sprite,
                -GAME_CONSTANTS.PLAYER_WIDTH / 2,
                -GAME_CONSTANTS.PLAYER_HEIGHT / 2,
                GAME_CONSTANTS.PLAYER_WIDTH,
                GAME_CONSTANTS.PLAYER_HEIGHT,
              )

              // Apply color overlay based on character
              ctx.globalCompositeOperation = "source-atop"
              ctx.fillStyle = selectedCharacter.color + "55" // Semi-transparent color
              ctx.fillRect(
                -GAME_CONSTANTS.PLAYER_WIDTH / 2,
                -GAME_CONSTANTS.PLAYER_HEIGHT / 2,
                GAME_CONSTANTS.PLAYER_WIDTH,
                GAME_CONSTANTS.PLAYER_HEIGHT,
              )

              // Restore the original composite operation
              ctx.globalCompositeOperation = originalOperation
            } else {
              // Draw the original sprite without color overlay
              ctx.drawImage(
                player.sprite,
                -GAME_CONSTANTS.PLAYER_WIDTH / 2,
                -GAME_CONSTANTS.PLAYER_HEIGHT / 2,
                GAME_CONSTANTS.PLAYER_WIDTH,
                GAME_CONSTANTS.PLAYER_HEIGHT,
              )
            }

            // Draw speed boost effect
            if (gameStateRef.current.speedBoost > 1) {
              // Draw speed lines behind player
              ctx.strokeStyle = COLORS.speedBoost
              ctx.lineWidth = 2

              for (let i = 0; i < 5; i++) {
                const length = Math.random() * 20 + 10
                const yOffset = Math.random() * 20 - 10

                ctx.beginPath()
                ctx.moveTo(-GAME_CONSTANTS.PLAYER_WIDTH / 2, yOffset)
                ctx.lineTo(-GAME_CONSTANTS.PLAYER_WIDTH / 2 - length, yOffset)
                ctx.stroke()
              }
            }

            ctx.restore()
          }
        }

        const drawObstacles = () => {
          gameStateRef.current.obstacles.forEach((obstacle) => {
            ctx.drawImage(
              obstacle.sprite,
              obstacle.x - GAME_CONSTANTS.OBSTACLE_WIDTH / 2,
              obstacle.y - GAME_CONSTANTS.OBSTACLE_HEIGHT,
              GAME_CONSTANTS.OBSTACLE_WIDTH,
              GAME_CONSTANTS.OBSTACLE_HEIGHT,
            )
          })
        }

        const drawSkiTrail = () => {
          ctx.strokeStyle = COLORS.skiTrail
          ctx.lineWidth = 2
          ctx.beginPath()
          gameStateRef.current.trailPoints.forEach((point, index) => {
            if (index === 0) {
              ctx.moveTo(point.x, point.y)
            } else {
              ctx.lineTo(point.x, point.y)
            }
          })
          ctx.stroke()
        }

        const drawLives = () => {
          const heartSize = 20
          const heartSpacing = 30
          const startX = 30
          const startY = 60

          for (let i = 0; i < gameStateRef.current.lives; i++) {
            drawHeart(ctx, startX + i * heartSpacing, startY, heartSize)
          }
        }

        const drawPauseScreen = () => {
          ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
          ctx.fillRect(0, 0, GAME_CONSTANTS.CANVAS_WIDTH, GAME_CONSTANTS.CANVAS_HEIGHT)

          ctx.fillStyle = "#FFFFFF"
          ctx.font = '24px "Press Start 2P"'
          ctx.textAlign = "center"
          ctx.fillText("PAUSED", GAME_CONSTANTS.CANVAS_WIDTH / 2, GAME_CONSTANTS.CANVAS_HEIGHT / 2)
          ctx.font = '16px "Press Start 2P"'
          ctx.fillText(
            "Press P or tap Pause button to continue",
            GAME_CONSTANTS.CANVAS_WIDTH / 2,
            GAME_CONSTANTS.CANVAS_HEIGHT / 2 + 40,
          )
          ctx.textAlign = "left" // Reset text alignment
        }

        const drawUI = () => {
          ctx.fillStyle = "#000000"
          ctx.font = '16px "Press Start 2P"'

          // Draw score with multiplier if active
          const scoreText =
            gameStateRef.current.scoreMultiplier > 1
              ? `Score: ${gameStateRef.current.score} (x${gameStateRef.current.scoreMultiplier})`
              : `Score: ${gameStateRef.current.score}`
          const scoreWidth = ctx.measureText(scoreText).width
          ctx.fillText(scoreText, GAME_CONSTANTS.CANVAS_WIDTH - scoreWidth - 20, 30)

          const currentTime = gameStateRef.current.isGameOver
            ? gameTime
            : Math.floor((Date.now() - gameStateRef.current.startTime) / 1000)
          const timeString = new Date(currentTime * 1000).toISOString().substr(14, 5)
          ctx.fillText(timeString, 20, 30)

          // Draw speed multiplier
          const speedText = `Speed: ${(gameStateRef.current.gameSpeedMultiplier * gameStateRef.current.speedBoost).toFixed(1)}x`
          ctx.fillText(speedText, GAME_CONSTANTS.CANVAS_WIDTH - 200, 60)

          // Draw lives
          drawLives()

          // Draw active power-ups
          drawActivePowerUps(ctx, gameStateRef.current.activePowerUps, Date.now())

          // Draw pause screen if game is paused
          if (gameStateRef.current.isPaused) {
            drawPauseScreen()
          }
        }

        const checkCollision = () => {
          const { player, obstacles } = gameStateRef.current

          // Skip collision check if player is invincible
          if (Date.now() < gameStateRef.current.invincibleUntil) {
            return false
          }

          for (const obstacle of obstacles) {
            const dx = Math.abs(player.x - obstacle.x)
            const dy = Math.abs(player.y - obstacle.y)
            if (dx < GAME_CONSTANTS.PLAYER_WIDTH / 2 && dy < GAME_CONSTANTS.PLAYER_HEIGHT / 2) {
              return true
            }
          }
          return false
        }

        const checkPowerUpCollisions = () => {
          const { player, powerUps } = gameStateRef.current

          powerUps.forEach((powerUp, index) => {
            if (!powerUp.collected && checkPowerUpCollision(player.x, player.y, powerUp)) {
              // Collect power-up
              playPowerUpSound()

              // Apply power-up effect
              applyPowerUpEffect(powerUp, gameStateRef.current, Date.now())

              // Add to active power-ups list if it has a duration
              if (powerUp.expiresAt) {
                gameStateRef.current.activePowerUps.push(powerUp)
              }

              // Increment power-ups collected counter
              gameStateRef.current.powerUpsCollected++

              // Create collection particles
              let particleColor
              switch (powerUp.type) {
                case PowerUpType.SHIELD:
                  particleColor = COLORS.shield
                  break
                case PowerUpType.SCORE_MULTIPLIER:
                  particleColor = COLORS.multiplier
                  break
                case PowerUpType.SPEED_BOOST:
                  particleColor = COLORS.speedBoost
                  break
                case PowerUpType.EXTRA_LIFE:
                  particleColor = COLORS.extraLife
                  break
                default:
                  particleColor = "#ffffff"
              }

              const collectionParticles = createPowerUpCollectionParticles(powerUp.x, powerUp.y, particleColor)

              gameStateRef.current.particles.push(...collectionParticles)

              // Mark as collected
              powerUp.collected = true
            }
          })

          // Remove collected power-ups
          gameStateRef.current.powerUps = gameStateRef.current.powerUps.filter((p) => !p.collected)
        }

        const updateGame = () => {
          if (gameStateRef.current.isGameOver || gameStateRef.current.isPaused) return

          const { player, obstacles, trailPoints } = gameStateRef.current
          const currentTime = Date.now()

          // Update music tempo based on game speed
          if (musicRef.current) {
            musicRef.current.setTempo(gameStateRef.current.gameSpeedMultiplier * gameStateRef.current.speedBoost)
          }

          // Increase game speed over time
          if (currentTime - gameStateRef.current.lastSpeedIncreaseTime >= 2000) {
            gameStateRef.current.gameSpeedMultiplier += 0.1
            gameStateRef.current.obstacleGenerationInterval = Math.max(
              30,
              gameStateRef.current.obstacleGenerationInterval - 5,
            )
            gameStateRef.current.lastSpeedIncreaseTime = currentTime
          }

          if (player.isMovingUp) {
            player.velocityY = Math.max(player.velocityY - 0.2, -GAME_CONSTANTS.MOVEMENT_SPEED)
          } else {
            player.velocityY = Math.min(player.velocityY + GAME_CONSTANTS.GRAVITY, GAME_CONSTANTS.MOVEMENT_SPEED)
          }

          player.y += player.velocityY

          if (player.y < 50) player.y = 50
          if (player.y > GAME_CONSTANTS.CANVAS_HEIGHT - 70) player.y = GAME_CONSTANTS.CANVAS_HEIGHT - 70

          trailPoints.unshift({ x: player.x, y: player.y + 10 })
          if (trailPoints.length > 50) {
            trailPoints.pop()
          }

          // Update obstacles
          gameStateRef.current.obstacles = obstacles
            .map((obstacle) => ({
              ...obstacle,
              x:
                obstacle.x -
                GAME_CONSTANTS.MOVEMENT_SPEED *
                  gameStateRef.current.gameSpeedMultiplier *
                  gameStateRef.current.speedBoost,
            }))
            .filter((obstacle) => obstacle.x > -50)

          // Count avoided obstacles
          const avoidedObstacles = obstacles.filter((obstacle) => obstacle.x < player.x && obstacle.x > player.x - 5)
          gameStateRef.current.obstaclesAvoided += avoidedObstacles.length

          // Update trail points
          gameStateRef.current.trailPoints = trailPoints
            .map((point) => ({
              ...point,
              x:
                point.x -
                GAME_CONSTANTS.MOVEMENT_SPEED *
                  gameStateRef.current.gameSpeedMultiplier *
                  gameStateRef.current.speedBoost,
            }))
            .filter((point) => point.x > 0)

          // Update power-ups
          gameStateRef.current.powerUps = gameStateRef.current.powerUps
            .map((powerUp) => ({
              ...powerUp,
              x:
                powerUp.x -
                GAME_CONSTANTS.MOVEMENT_SPEED *
                  gameStateRef.current.gameSpeedMultiplier *
                  gameStateRef.current.speedBoost,
            }))
            .filter((powerUp) => powerUp.x > -50)

          // Update active power-ups
          updatePowerUps(gameStateRef.current.activePowerUps, gameStateRef.current, currentTime)
          gameStateRef.current.activePowerUps = gameStateRef.current.activePowerUps.filter((p) => p.active)

          // Update particles
          gameStateRef.current.particles = updateParticles(gameStateRef.current.particles)
          gameStateRef.current.snowParticles = updateParticles(gameStateRef.current.snowParticles)

          // Generate new obstacles
          if (gameStateRef.current.frameCount % gameStateRef.current.obstacleGenerationInterval === 0) {
            gameStateRef.current.obstacles.push({
              x: GAME_CONSTANTS.CANVAS_WIDTH + 50,
              y: Math.random() * (GAME_CONSTANTS.CANVAS_HEIGHT - 100) + 50,
              sprite: getRandomObstacleSprite(),
            })
          }

          // Randomly generate power-ups
          if (Math.random() < GAME_CONSTANTS.POWERUP_SPAWN_CHANCE) {
            const powerUp = createPowerUp(
              GAME_CONSTANTS.CANVAS_WIDTH + 50,
              Math.random() * (GAME_CONSTANTS.CANVAS_HEIGHT - 100) + 50,
            )
            gameStateRef.current.powerUps.push(powerUp)
          }

          // Check for power-up collisions
          checkPowerUpCollisions()

          // Check for obstacle collisions
          if (checkCollision()) {
            // Play collision sound
            playCollisionSound()

            // Create collision particles
            const collisionParticles = createCollisionParticles(player.x, player.y)
            gameStateRef.current.particles.push(...collisionParticles)

            // If player has shield, use it instead of losing a life
            if (gameStateRef.current.hasShield) {
              gameStateRef.current.hasShield = false

              // Remove shield from active power-ups
              gameStateRef.current.activePowerUps = gameStateRef.current.activePowerUps.filter(
                (p) => p.type !== PowerUpType.SHIELD,
              )
            } else {
              gameStateRef.current.lives--
            }

            if (gameStateRef.current.lives <= 0) {
              // Game over
              gameStateRef.current.isGameOver = true
              setGameOver(true)

              const finalGameTime = Math.floor((Date.now() - gameStateRef.current.startTime) / 1000)
              setGameTime(finalGameTime)
              setScore(gameStateRef.current.score) // Set score only when game ends

              // Update game stats
              const updatedStats = updateGameStats(
                gameStats,
                gameStateRef.current.score,
                finalGameTime,
                gameStateRef.current.powerUpsCollected,
                gameStateRef.current.obstaclesAvoided,
              )

              setGameStats(updatedStats)
              saveGameStats(updatedStats)

              try {
                // Check for new achievements with error handling
                const oldAchievements = [...achievements]
                const updatedAchievements = checkAchievements(oldAchievements, updatedStats)
                setAchievements(updatedAchievements)

                // Get newly unlocked achievements
                const newlyUnlocked = getNewlyUnlockedAchievements(oldAchievements, updatedAchievements)
                if (newlyUnlocked.length > 0) {
                  setNewAchievements(newlyUnlocked)
                  playAchievementSound()
                }
              } catch (err) {
                console.error("Error processing achievements:", err)
              }

              // Stop music
              if (musicRef.current) {
                musicRef.current.stop()
              }

              // Play game over sound
              playGameOverSound()

              return
            } else {
              // Make player invincible for 2 seconds
              gameStateRef.current.invincibleUntil = Date.now() + 2000
            }
          }

          if (gameStateRef.current.frameCount % 60 === 0) {
            // Add score with multiplier
            gameStateRef.current.score += 10 * gameStateRef.current.scoreMultiplier
          }

          gameStateRef.current.frameCount++
        }

        let animationFrameId: number

        const gameLoop = () => {
          try {
            ctx.clearRect(0, 0, GAME_CONSTANTS.CANVAS_WIDTH, GAME_CONSTANTS.CANVAS_HEIGHT)

            drawBackground()
            drawSkiTrail()

            // Draw power-ups
            gameStateRef.current.powerUps.forEach((powerUp) => {
              drawPowerUp(ctx, powerUp, gameStateRef.current.frameCount)
            })

            drawObstacles()
            drawPlayer()

            // Draw particles
            drawParticles(ctx, gameStateRef.current.particles)

            drawUI()

            if (!gameStateRef.current.isGameOver) {
              updateGame()
            }

            animationFrameId = requestAnimationFrame(gameLoop)
          } catch (err) {
            console.error("Error in game loop:", err)
            cancelAnimationFrame(animationFrameId)
            setError("An error occurred in the game. Please refresh the page.")
          }
        }

        window.addEventListener("keydown", handleKeyDown)
        window.addEventListener("keyup", handleKeyUp)

        gameLoop()

        return () => {
          cancelAnimationFrame(animationFrameId)
        }
      } catch (err) {
        console.error("Error initializing game:", err)
        setError("Failed to initialize game. Please refresh the page.")
      }
    }

    initGame()

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)

      // Clean up audio context
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch((err) => {
          console.error("Error closing AudioContext:", err)
        })
      }

      // Clean up music
      if (musicRef.current) {
        musicRef.current.cleanup()
      }
    }
  }, [gameOver, gameTime, isMusicMuted, gameStarted, selectedCharacter, achievements, gameStats])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh Page
        </button>
      </div>
    )
  }

  // Show orientation warning for mobile devices in portrait mode
  if (isMobile && !isLandscape && gameStarted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 p-4">
        <div className="text-white text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto mb-4 text-yellow-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
          <h2 className="text-xl font-bold mb-2">Rotate Your Device</h2>
          <p className="mb-4">Please rotate your device to landscape mode for the best gaming experience.</p>
        </div>
      </div>
    )
  }

  // Show character selection screen if game hasn't started
  if (!gameStarted) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen p-4"
        style={{
          backgroundImage:
            'url("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Ice-RFivzrFYklghXcbtYkoYiMiESh5rh5.png")',
          backgroundRepeat: "repeat",
        }}
      >
        <h1 className="text-4xl font-bold mb-8 text-white" style={{ fontFamily: '"Press Start 2P", cursive' }}>
          {GAME_NAME}
        </h1>

        <CharacterSelection
          onSelectCharacter={handleSelectCharacter}
          selectedCharacterId={selectedCharacter?.id || null}
        />
      </div>
    )
  }

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen p-4"
      style={{
        backgroundImage:
          'url("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Ice-RFivzrFYklghXcbtYkoYiMiESh5rh5.png")',
        backgroundRepeat: "repeat",
      }}
    >
      <h1
        className={`text-4xl font-bold mb-4 ${gameOver ? "text-red-500" : "text-white"}`}
        style={{ fontFamily: '"Press Start 2P", cursive' }}
      >
        {gameOver ? `Game Over` : GAME_NAME}
      </h1>

      <div ref={containerRef} className="relative w-full max-w-[1000px]">
        <canvas
          ref={canvasRef}
          width={GAME_CONSTANTS.CANVAS_WIDTH}
          height={GAME_CONSTANTS.CANVAS_HEIGHT}
          className="border-4 border-gray-700 rounded-lg"
          style={{ width: `${GAME_CONSTANTS.CANVAS_WIDTH}px`, height: `${GAME_CONSTANTS.CANVAS_HEIGHT}px` }}
        />

        {/* Mobile touch controls */}
        {isMobile && !gameOver && (
          <>
            {/* Jump button */}
            <div
              className="absolute bottom-4 right-4 w-20 h-20 bg-blue-500 bg-opacity-50 rounded-full flex items-center justify-center touch-none"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <span className="text-white font-bold">JUMP</span>
            </div>

            {/* Pause button */}
            <div
              className="absolute top-4 right-4 w-12 h-12 bg-gray-700 bg-opacity-70 rounded-md flex items-center justify-center touch-none"
              onClick={togglePause}
            >
              {gameStateRef.current.isPaused ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>

            {/* Music toggle button */}
            <div
              className="absolute top-4 right-20 w-12 h-12 bg-gray-700 bg-opacity-70 rounded-md flex items-center justify-center touch-none"
              onClick={toggleMusic}
            >
              {isMusicMuted ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                    clipRule="evenodd"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                  />
                </svg>
              )}
            </div>

            {/* Achievements button */}
            <div
              className="absolute top-4 right-36 w-12 h-12 bg-gray-700 bg-opacity-70 rounded-md flex items-center justify-center touch-none"
              onClick={() => setShowAchievements(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            </div>
          </>
        )}

        {/* Full screen touch area for mobile */}
        {isMobile && !gameOver && (
          <div
            className="absolute inset-0 z-10 touch-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ pointerEvents: "none" }}
          />
        )}

        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/75">
            <div className="text-white text-center p-6 bg-gray-900 rounded-lg border-2 border-gray-700 max-w-md">
              <h2 className="text-2xl mb-4" style={{ fontFamily: '"Press Start 2P", cursive' }}>
                Game Over
              </h2>

              <p className="mb-2">Your Score: {score}</p>
              <p className="mb-4">Time: {new Date(gameTime * 1000).toISOString().substr(14, 5)}</p>

              {!isNewHighScore && highScores.length > 0 && score <= highScores[highScores.length - 1].score ? (
                // If score is not high enough to be on the leaderboard
                <>
                  <div className="mb-6">
                    <h3 className="text-xl mb-2" style={{ fontFamily: '"Press Start 2P", cursive' }}>
                      High Scores
                    </h3>
                    <div className="bg-gray-800 p-3 rounded">
                      <ul>
                        {highScores.map((hs, index) => (
                          <li key={index} className="flex justify-between">
                            <span>
                              {index + 1}. {hs.name}: {hs.score}
                            </span>
                            <span>{hs.date}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center mb-4">
                    <button
                      onClick={() => setShowAchievements(true)}
                      className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                    >
                      Achievements
                    </button>
                    <button
                      onClick={() => setShowSharePanel(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Share Score
                    </button>
                  </div>
                  <button
                    onClick={restartGame}
                    className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 font-pixel w-full"
                    style={{ fontFamily: '"Press Start 2P", cursive' }}
                  >
                    Play Again
                  </button>
                </>
              ) : (
                // If score is high enough to be on the leaderboard
                <>
                  <div className="mb-4">
                    <label htmlFor="playerName" className="block mb-2 text-sm">
                      Enter your name for the leaderboard:
                    </label>
                    <input
                      type="text"
                      id="playerName"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      maxLength={10}
                      className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Your Name"
                    />
                  </div>
                  <button
                    onClick={handleSaveScore}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
                    disabled={playerName.trim() === ""}
                  >
                    Save Score
                  </button>
                  <div className="flex flex-wrap gap-2 justify-center mt-4 mb-4">
                    <button
                      onClick={() => setShowAchievements(true)}
                      className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                    >
                      Achievements
                    </button>
                    <button
                      onClick={() => setShowSharePanel(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Share Score
                    </button>
                  </div>
                  <button
                    onClick={restartGame}
                    className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 mt-4 block w-full"
                    style={{ fontFamily: '"Press Start 2P", cursive' }}
                  >
                    Play Again
                  </button>
                </>
              )}

              {isNewHighScore && (
                <div className="mt-4">
                  <div className="text-yellow-400 mb-4 animate-pulse">New High Score!</div>
                  <div className="bg-gray-800 p-3 rounded">
                    <ul>
                      {highScores.map((hs, index) => (
                        <li
                          key={index}
                          className={`flex justify-between ${score === hs.score && hs.name === playerName ? "text-yellow-400" : ""}`}
                        >
                          <span>
                            {index + 1}. {hs.name}: {hs.score}
                          </span>
                          <span>{hs.date}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 text-white text-center">
        {isMobile ? (
          <>
            <p>Tap and hold or swipe up/down to move</p>
            <p className="mt-2 text-sm">Collect power-ups for special abilities!</p>
          </>
        ) : (
          <>
            <p>Press and hold SPACE to move up</p>
            <p className="mt-2 text-sm">Press P to pause, M to toggle music</p>
          </>
        )}
      </div>

      {/* Show achievements panel */}
      {showAchievements && <AchievementsPanel achievements={achievements} onClose={() => setShowAchievements(false)} />}

      {/* Show share panel */}
      {showSharePanel && (
        <SharePanel
          score={score}
          playerName={playerName}
          gameName={GAME_NAME}
          onClose={() => setShowSharePanel(false)}
        />
      )}

      {/* Show achievement notifications */}
      {newAchievements.length > 0 && (
        <AchievementNotification achievement={newAchievements[0]} onClose={handleDismissAchievement} />
      )}
    </div>
  )
}
