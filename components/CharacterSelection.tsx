"use client"
import { type Character, CHARACTERS } from "../constants"

interface CharacterSelectionProps {
  onSelectCharacter: (character: Character) => void
  selectedCharacterId: number | null
}

export default function CharacterSelection({ onSelectCharacter, selectedCharacterId }: CharacterSelectionProps) {
  return (
    <div className="bg-gray-900 bg-opacity-90 p-6 rounded-lg border-2 border-gray-700 max-w-3xl w-full">
      <h2 className="text-2xl text-white mb-6 text-center" style={{ fontFamily: '"Press Start 2P", cursive' }}>
        Choose Your Character
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {CHARACTERS.map((character) => (
          <div
            key={character.id}
            className={`p-4 rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-105 ${
              selectedCharacterId === character.id
                ? `border-4 bg-gray-800`
                : "border-2 border-gray-700 bg-gray-800 hover:bg-gray-700"
            }`}
            onClick={() => onSelectCharacter(character)}
            style={{ borderColor: selectedCharacterId === character.id ? character.color : undefined }}
          >
            <div className="flex flex-col items-center">
              <div
                className="w-20 h-20 mb-3 rounded-full flex items-center justify-center"
                style={{ backgroundColor: character.color + "33" }}
              >
                <div
                  className="w-12 h-12 relative"
                  style={{
                    filter:
                      character.id > 0
                        ? `drop-shadow(0 0 4px ${character.color}) hue-rotate(${character.id * 60}deg)`
                        : "none",
                  }}
                >
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/snowboarder-d8ooGdTTeqCc73t5hfW0TPLcqBEcmx.png"
                    alt={character.name}
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{character.name}</h3>
              <p className="text-gray-300 text-sm text-center">{character.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => {
            if (selectedCharacterId !== null) {
              const character = CHARACTERS.find((c) => c.id === selectedCharacterId)
              if (character) {
                onSelectCharacter(character)
              }
            }
          }}
          disabled={selectedCharacterId === null}
          className={`px-6 py-3 rounded-lg text-white font-bold ${
            selectedCharacterId !== null ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-600 cursor-not-allowed"
          }`}
        >
          Start Game
        </button>
      </div>
    </div>
  )
}
