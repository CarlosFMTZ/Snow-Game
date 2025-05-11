import { GAME_CONSTANTS } from "../constants"

export interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  color: string
  alpha: number
  life: number
  maxLife: number
}

export function createSnowParticles(count: number): Particle[] {
  const particles: Particle[] = []

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * GAME_CONSTANTS.CANVAS_WIDTH,
      y: Math.random() * GAME_CONSTANTS.CANVAS_HEIGHT,
      size: Math.random() * 3 + 1,
      speedX: Math.random() * 0.5 - 0.25,
      speedY: Math.random() * 1 + 0.5,
      color: "#ffffff",
      alpha: Math.random() * 0.7 + 0.3,
      life: 0,
      maxLife: Number.POSITIVE_INFINITY, // Snow particles live forever
    })
  }

  return particles
}

export function createCollisionParticles(x: number, y: number): Particle[] {
  const particles: Particle[] = []
  const particleCount = 20

  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = Math.random() * 3 + 1

    particles.push({
      x,
      y,
      size: Math.random() * 4 + 2,
      speedX: Math.cos(angle) * speed,
      speedY: Math.sin(angle) * speed,
      color: "#ffffff",
      alpha: 1,
      life: 0,
      maxLife: 30, // Frames until particle disappears
    })
  }

  return particles
}

export function createPowerUpCollectionParticles(x: number, y: number, color: string): Particle[] {
  const particles: Particle[] = []
  const particleCount = 30

  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = Math.random() * 4 + 2

    particles.push({
      x,
      y,
      size: Math.random() * 5 + 3,
      speedX: Math.cos(angle) * speed,
      speedY: Math.sin(angle) * speed,
      color,
      alpha: 1,
      life: 0,
      maxLife: 40, // Frames until particle disappears
    })
  }

  return particles
}

export function updateParticles(particles: Particle[]): Particle[] {
  return particles.filter((particle) => {
    // Update position
    particle.x += particle.speedX
    particle.y += particle.speedY

    // Update life
    particle.life++

    // For snow particles, wrap around the screen
    if (particle.maxLife === Number.POSITIVE_INFINITY) {
      if (particle.x < 0) particle.x = GAME_CONSTANTS.CANVAS_WIDTH
      if (particle.x > GAME_CONSTANTS.CANVAS_WIDTH) particle.x = 0
      if (particle.y > GAME_CONSTANTS.CANVAS_HEIGHT) particle.y = 0

      // Add some random movement
      particle.x += Math.sin(particle.life * 0.01) * 0.5
    } else {
      // For effect particles, reduce alpha over time
      particle.alpha = 1 - particle.life / particle.maxLife

      // Slow down over time
      particle.speedX *= 0.95
      particle.speedY *= 0.95
    }

    // Keep particle if it's still alive
    return particle.life < particle.maxLife
  })
}

export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
  particles.forEach((particle) => {
    ctx.save()
    ctx.globalAlpha = particle.alpha
    ctx.fillStyle = particle.color
    ctx.beginPath()
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  })
}
