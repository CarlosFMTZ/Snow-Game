import { PowerUpType, COLORS, GAME_CONSTANTS } from "../constants"

export interface PowerUp {
  type: PowerUpType
  x: number
  y: number
  active: boolean
  collected: boolean
  expiresAt: number | null
  value: number
}

export function createPowerUp(x: number, y: number): PowerUp {
  // Randomly select a power-up type
  const types = Object.values(PowerUpType)
  const randomType = types[Math.floor(Math.random() * types.length)]

  return {
    type: randomType,
    x,
    y,
    active: false,
    collected: false,
    expiresAt: null,
    value: getPowerUpValue(randomType),
  }
}

function getPowerUpValue(type: PowerUpType): number {
  switch (type) {
    case PowerUpType.SHIELD:
      return 1 // Shield lasts for 1 hit
    case PowerUpType.SCORE_MULTIPLIER:
      return 2 // 2x score multiplier
    case PowerUpType.SPEED_BOOST:
      return 1.5 // 1.5x speed boost
    case PowerUpType.EXTRA_LIFE:
      return 1 // 1 extra life
    default:
      return 1
  }
}

export function drawPowerUp(ctx: CanvasRenderingContext2D, powerUp: PowerUp, frameCount: number) {
  ctx.save()

  // Make power-ups pulsate
  const scale = 1 + Math.sin(frameCount * 0.1) * 0.1
  ctx.translate(powerUp.x, powerUp.y)
  ctx.scale(scale, scale)

  // Draw power-up based on type
  switch (powerUp.type) {
    case PowerUpType.SHIELD:
      drawShield(ctx)
      break
    case PowerUpType.SCORE_MULTIPLIER:
      drawMultiplier(ctx)
      break
    case PowerUpType.SPEED_BOOST:
      drawSpeedBoost(ctx)
      break
    case PowerUpType.EXTRA_LIFE:
      drawExtraLife(ctx)
      break
  }

  ctx.restore()
}

function drawShield(ctx: CanvasRenderingContext2D) {
  const size = GAME_CONSTANTS.POWERUP_SIZE

  // Draw shield icon
  ctx.beginPath()
  ctx.moveTo(0, -size / 2)
  ctx.lineTo(size / 2, -size / 4)
  ctx.lineTo(size / 2, size / 3)
  ctx.lineTo(0, size / 2)
  ctx.lineTo(-size / 2, size / 3)
  ctx.lineTo(-size / 2, -size / 4)
  ctx.closePath()

  ctx.fillStyle = COLORS.shield
  ctx.fill()

  ctx.strokeStyle = "#ffffff"
  ctx.lineWidth = 2
  ctx.stroke()
}

function drawMultiplier(ctx: CanvasRenderingContext2D) {
  const size = GAME_CONSTANTS.POWERUP_SIZE

  // Draw multiplier icon (star)
  ctx.beginPath()
  const spikes = 5
  const outerRadius = size / 2
  const innerRadius = size / 4

  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius
    const angle = (Math.PI / spikes) * i
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius

    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }

  ctx.closePath()
  ctx.fillStyle = COLORS.multiplier
  ctx.fill()

  ctx.strokeStyle = "#ffffff"
  ctx.lineWidth = 2
  ctx.stroke()
}

function drawSpeedBoost(ctx: CanvasRenderingContext2D) {
  const size = GAME_CONSTANTS.POWERUP_SIZE

  // Draw speed boost icon (lightning bolt)
  ctx.beginPath()
  ctx.moveTo(0, -size / 2)
  ctx.lineTo(size / 4, -size / 6)
  ctx.lineTo(0, size / 6)
  ctx.lineTo(size / 3, size / 2)
  ctx.lineTo(size / 6, 0)
  ctx.lineTo(size / 3, -size / 3)
  ctx.closePath()

  ctx.fillStyle = COLORS.speedBoost
  ctx.fill()

  ctx.strokeStyle = "#ffffff"
  ctx.lineWidth = 2
  ctx.stroke()
}

function drawExtraLife(ctx: CanvasRenderingContext2D) {
  const size = GAME_CONSTANTS.POWERUP_SIZE

  // Draw heart shape
  ctx.beginPath()
  ctx.moveTo(0, size / 4)

  // Left curve
  ctx.bezierCurveTo(-size / 4, -size / 4, -size / 2, -size / 4, -size / 4, -size / 2)

  // Right curve
  ctx.bezierCurveTo(0, -size / 3, size / 4, -size / 2, size / 4, -size / 4)

  ctx.bezierCurveTo(size / 2, -size / 4, size / 4, -size / 4, 0, size / 4)

  ctx.fillStyle = COLORS.extraLife
  ctx.fill()

  ctx.strokeStyle = "#ffffff"
  ctx.lineWidth = 2
  ctx.stroke()
}

export function drawActivePowerUps(ctx: CanvasRenderingContext2D, activePowerUps: PowerUp[], currentTime: number) {
  const startX = 20
  const startY = 100
  const spacing = 40

  activePowerUps.forEach((powerUp, index) => {
    if (!powerUp.expiresAt) return

    const timeLeft = Math.max(0, (powerUp.expiresAt - currentTime) / 1000)
    const y = startY + index * spacing

    // Draw power-up icon
    ctx.save()
    ctx.translate(startX, y)
    ctx.scale(0.7, 0.7)

    switch (powerUp.type) {
      case PowerUpType.SHIELD:
        drawShield(ctx)
        break
      case PowerUpType.SCORE_MULTIPLIER:
        drawMultiplier(ctx)
        break
      case PowerUpType.SPEED_BOOST:
        drawSpeedBoost(ctx)
        break
    }

    ctx.restore()

    // Draw timer
    ctx.fillStyle = "#000000"
    ctx.font = '12px "Press Start 2P"'
    ctx.fillText(`${timeLeft.toFixed(1)}s`, startX + 25, y + 5)
  })
}

export function checkPowerUpCollision(playerX: number, playerY: number, powerUp: PowerUp): boolean {
  const dx = Math.abs(playerX - powerUp.x)
  const dy = Math.abs(playerY - powerUp.y)
  const collisionDistance = (GAME_CONSTANTS.PLAYER_WIDTH + GAME_CONSTANTS.POWERUP_SIZE) / 2

  return dx < collisionDistance && dy < collisionDistance
}

export function applyPowerUpEffect(powerUp: PowerUp, gameState: any, currentTime: number): void {
  powerUp.active = true
  powerUp.collected = true

  switch (powerUp.type) {
    case PowerUpType.SHIELD:
      gameState.hasShield = true
      powerUp.expiresAt = currentTime + GAME_CONSTANTS.POWERUP_DURATION
      break

    case PowerUpType.SCORE_MULTIPLIER:
      gameState.scoreMultiplier = powerUp.value
      powerUp.expiresAt = currentTime + GAME_CONSTANTS.POWERUP_DURATION
      break

    case PowerUpType.SPEED_BOOST:
      gameState.speedBoost = powerUp.value
      powerUp.expiresAt = currentTime + GAME_CONSTANTS.POWERUP_DURATION
      break

    case PowerUpType.EXTRA_LIFE:
      gameState.lives = Math.min(gameState.lives + 1, GAME_CONSTANTS.MAX_LIVES)
      powerUp.expiresAt = null // No expiration for extra life
      break
  }
}

export function updatePowerUps(powerUps: PowerUp[], gameState: any, currentTime: number): void {
  // Update active power-ups
  powerUps.forEach((powerUp) => {
    if (powerUp.active && powerUp.expiresAt && currentTime >= powerUp.expiresAt) {
      // Power-up has expired
      switch (powerUp.type) {
        case PowerUpType.SHIELD:
          gameState.hasShield = false
          break

        case PowerUpType.SCORE_MULTIPLIER:
          gameState.scoreMultiplier = 1
          break

        case PowerUpType.SPEED_BOOST:
          gameState.speedBoost = 1
          break
      }

      powerUp.active = false
    }
  })

  // Remove collected power-ups
  return powerUps.filter((powerUp) => !powerUp.collected)
}
