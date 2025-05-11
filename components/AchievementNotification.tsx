"use client"

import { useEffect, useState } from "react"
import type { Achievement } from "../constants"

interface AchievementNotificationProps {
  achievement: Achievement
  onClose: () => void
}

export default function AchievementNotification({ achievement, onClose }: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isValidAchievement, setIsValidAchievement] = useState(true)

  useEffect(() => {
    // Validate achievement object
    if (!achievement || typeof achievement !== "object" || !("id" in achievement)) {
      console.error("Invalid achievement object:", achievement)
      setIsValidAchievement(false)
      onClose()
      return
    } else {
      setIsValidAchievement(true)
    }
  }, [achievement, onClose])

  useEffect(() => {
    if (isValidAchievement) {
      // Animate in
      setTimeout(() => {
        setIsVisible(true)
      }, 100)

      // Auto close after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 500) // Wait for animation to complete
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [onClose, isValidAchievement])

  if (!isValidAchievement) {
    return null
  }

  return (
    <div
      className={`fixed top-4 right-4 z-50 bg-gray-900 border-l-4 border-yellow-500 rounded-lg shadow-lg transform transition-all duration-500 ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
      style={{ maxWidth: "320px" }}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-3 text-2xl">{achievement.icon}</div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h3 className="text-yellow-500 text-sm font-semibold">Achievement Unlocked!</h3>
              <button
                onClick={() => {
                  setIsVisible(false)
                  setTimeout(onClose, 500)
                }}
                className="text-gray-400 hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-white font-bold">{achievement.name}</p>
            <p className="text-gray-300 text-sm">{achievement.description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
