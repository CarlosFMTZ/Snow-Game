"use client"

import { useState } from "react"
import {
  shareScore,
  shareToTwitter,
  shareToFacebook,
  copyScoreToClipboard,
  isWebShareSupported,
  canShareData,
} from "../utils/sharing"

interface SharePanelProps {
  score: number
  playerName: string
  gameName: string
  onClose: () => void
}

export default function SharePanel({ score, playerName, gameName, onClose }: SharePanelProps) {
  const [copied, setCopied] = useState(false)
  const [shareError, setShareError] = useState<string | null>(null)

  // Check if Web Share API is supported
  const shareData = {
    title: `${gameName} - High Score`,
    text: `I just scored ${score} points in ${gameName}! Can you beat my score?${playerName ? ` - ${playerName}` : ""}`,
    url: window.location.href,
  }

  const webShareSupported = isWebShareSupported() && canShareData(shareData)

  const handleNativeShare = async () => {
    setShareError(null)
    const success = await shareScore(score, playerName, gameName)
    if (!success) {
      setShareError("Sharing failed. Please try using one of the other share options.")
    }
  }

  const handleCopyToClipboard = async () => {
    setShareError(null)
    const success = await copyScoreToClipboard(score, playerName, gameName)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } else {
      setShareError("Failed to copy to clipboard")
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="bg-gray-900 rounded-lg border-2 border-gray-700 max-w-md w-full overflow-hidden">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl text-white" style={{ fontFamily: '"Press Start 2P", cursive' }}>
            Share Your Score
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

        <div className="p-6">
          <div className="mb-6 text-center">
            <p className="text-white text-lg mb-2">Your Score</p>
            <p className="text-3xl font-bold text-blue-400">{score}</p>
            {playerName && <p className="text-gray-400 mt-1">- {playerName}</p>}
          </div>

          {shareError && (
            <div className="mb-4 p-3 bg-red-900 bg-opacity-50 text-red-200 rounded-md text-sm">{shareError}</div>
          )}

          <div className="space-y-4">
            {webShareSupported && (
              <button
                onClick={handleNativeShare}
                className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                Share
              </button>
            )}

            <button
              onClick={() => shareToTwitter(score, playerName, gameName)}
              className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
              </svg>
              Share on Twitter
            </button>

            <button
              onClick={() => shareToFacebook(score, gameName)}
              className="w-full py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
              </svg>
              Share on Facebook
            </button>

            <button
              onClick={handleCopyToClipboard}
              className="w-full py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                />
              </svg>
              {copied ? "Copied!" : "Copy to Clipboard"}
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-gray-700">
          <button onClick={onClose} className="w-full py-2 bg-gray-800 text-white rounded hover:bg-gray-700">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
