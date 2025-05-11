import { MUSIC_NOTES } from "../constants"

export class BackgroundMusic {
  private audioContext: AudioContext | null = null
  private gainNode: GainNode | null = null
  private oscillator: OscillatorNode | null = null
  private isPlaying = false
  private tempo = 500 // ms between notes
  private noteIndex = 0
  private timeoutId: number | null = null
  private volume = 0.2

  constructor() {
    this.initAudio()
  }

  private initAudio(): void {
    try {
      if (typeof window !== "undefined" && "AudioContext" in window) {
        this.audioContext = new AudioContext()
        this.gainNode = this.audioContext.createGain()
        this.gainNode.gain.value = this.volume
        this.gainNode.connect(this.audioContext.destination)
      }
    } catch (err) {
      console.error("Web Audio API not supported:", err)
    }
  }

  public start(): void {
    if (!this.audioContext || this.isPlaying) return

    this.isPlaying = true
    this.playNextNote()
  }

  public stop(): void {
    if (!this.isPlaying) return

    this.isPlaying = false

    if (this.oscillator) {
      this.oscillator.stop()
      this.oscillator = null
    }

    if (this.timeoutId !== null) {
      window.clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
  }

  public setTempo(speedMultiplier: number): void {
    // Adjust tempo based on game speed
    this.tempo = Math.max(100, 500 / speedMultiplier)
  }

  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume))

    if (this.gainNode) {
      this.gainNode.gain.value = this.volume
    }
  }

  public toggleMute(): boolean {
    if (this.volume > 0) {
      this.setVolume(0)
      return false // Muted
    } else {
      this.setVolume(0.2)
      return true // Unmuted
    }
  }

  private playNextNote(): void {
    if (!this.isPlaying || !this.audioContext || !this.gainNode) return

    // Create a new oscillator for each note
    this.oscillator = this.audioContext.createOscillator()

    // Get a random note from our scale
    const note = MUSIC_NOTES.NOTES[Math.floor(Math.random() * MUSIC_NOTES.NOTES.length)]
    this.oscillator.frequency.value = note.frequency

    // Use a sine wave for a softer sound
    this.oscillator.type = "sine"

    // Connect and start
    this.oscillator.connect(this.gainNode)
    this.oscillator.start()

    // Schedule note end and next note
    const noteDuration = this.tempo * 0.8 // Note plays for 80% of tempo

    // Stop the note after its duration
    this.timeoutId = window.setTimeout(() => {
      if (this.oscillator) {
        this.oscillator.stop()
        this.oscillator = null
      }

      // Schedule next note with a small gap
      this.timeoutId = window.setTimeout(() => {
        this.playNextNote()
      }, this.tempo * 0.2) // 20% of tempo is silence between notes
    }, noteDuration)
  }

  public cleanup(): void {
    this.stop()

    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close().catch((err) => {
        console.error("Error closing AudioContext:", err)
      })
    }
  }
}
