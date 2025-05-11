// Function to share score via Web Share API
export async function shareScore(score: number, playerName: string, gameName: string): Promise<boolean> {
  if (!navigator.share) {
    console.log("Web Share API not supported")
    return false
  }

  try {
    // Create the share data
    const shareData = {
      title: `${gameName} - High Score`,
      text: `I just scored ${score} points in ${gameName}! Can you beat my score?${
        playerName ? ` - ${playerName}` : ""
      }`,
      url: window.location.href,
    }

    // Attempt to share
    await navigator.share(shareData)
    return true
  } catch (error) {
    // Check for specific error types
    if (error instanceof DOMException && error.name === "NotAllowedError") {
      console.log("Share permission denied. This might be because the action wasn't triggered by a user gesture.")
    } else {
      console.error("Error sharing:", error)
    }
    return false
  }
}

// Function to check if Web Share API is available
export function isWebShareSupported(): boolean {
  return typeof navigator !== "undefined" && !!navigator.share && !!navigator.canShare
}

// Function to check if specific share data can be shared
export function canShareData(shareData: { title: string; text: string; url: string }): boolean {
  if (!isWebShareSupported()) return false

  try {
    return navigator.canShare(shareData)
  } catch (e) {
    return false
  }
}

// Function to share to Twitter
export function shareToTwitter(score: number, playerName: string, gameName: string): void {
  const text = `I just scored ${score} points in ${gameName}! Can you beat my score?${
    playerName ? ` - ${playerName}` : ""
  }`
  const url = window.location.href
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
  window.open(twitterUrl, "_blank")
}

// Function to share to Facebook
export function shareToFacebook(score: number, gameName: string): void {
  const url = window.location.href
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
  window.open(facebookUrl, "_blank")
}

// Function to copy score to clipboard
export function copyScoreToClipboard(score: number, playerName: string, gameName: string): Promise<boolean> {
  const text = `I just scored ${score} points in ${gameName}! Can you beat my score?${
    playerName ? ` - ${playerName}` : ""
  }`

  return navigator.clipboard
    .writeText(text)
    .then(() => true)
    .catch((error) => {
      console.error("Error copying to clipboard:", error)
      return false
    })
}
