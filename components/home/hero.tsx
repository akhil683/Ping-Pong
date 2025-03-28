"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Logo from "../logo"

export default function HeroPage() {
  const router = useRouter()
  const [selectedAvatar, setSelectedAvatar] = useState(0)
  const [playerName, setPlayerName] = useState("")
  const avatarColors = ["#ff4040", "#ff8800", "#ffff00", "#44cc44", "#66ffff", "#4444ff", "#cc44cc", "#ff88cc"]

  const nextAvatar = () => {
    setSelectedAvatar((prev) => (prev + 1) % avatarColors.length)
  }

  const prevAvatar = () => {
    setSelectedAvatar((prev) => (prev - 1 + avatarColors.length) % avatarColors.length)
  }

  const handlePlay = () => {
    // Navigate to the game page
    router.push("/game")
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center bg-sky-700 justify-center relative"
    >
      {/* Logo */}
      <div className="mb-4">
        <div className="text-6xl flex items-center justify-center">
          <Logo />
        </div>

        {/* Avatar Row */}
        <div className="flex justify-center mt-2">
          {avatarColors.map((color, index) => (
            <div key={index} className="mx-1">
              <Avatar color={color} />
            </div>
          ))}
        </div>
      </div>

      {/* Main Panel */}
      <div className="bg-blue-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Enter your name"
            className="flex-1 px-3 py-2 rounded border border-gray-300 focus:outline-none bg-white text-black"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          {/* <select className="px-3 py-2 rounded border border-gray-300 focus:outline-none bg-white text-black"> */}
          {/*   <option>English</option> */}
          {/*   <option>Español</option> */}
          {/*   <option>Français</option> */}
          {/*   <option>Deutsch</option> */}
          {/* </select> */}
        </div>

        {/* Avatar Selection */}
        <div className="flex items-center justify-center my-4">
          <button onClick={prevAvatar} className="bg-black text-white p-1 rounded mr-2">
            <ChevronLeft size={24} />
          </button>

          <div className="relative mx-4">
            <Avatar color={avatarColors[selectedAvatar]} size="large" />
          </div>

          <button onClick={nextAvatar} className="bg-black text-white p-1 rounded ml-2">
            <ChevronRight size={24} />
          </button>

          {/* <button className="ml-6 bg-white p-1 rounded"> */}
          {/*   <Dice size={24} className="text-yellow-500" /> */}
          {/* </button> */}
        </div>

        {/* Action Buttons */}
        <button
          className="w-full bg-green-400 hover:bg-green-500 text-white font-bold py-3 px-4 rounded mb-3 text-2xl cursor-pointer"
          onClick={handlePlay}
        >
          Play!
        </button>

        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded text-xl cursor-pointer">
          Create Private Room
        </button>
      </div>

      {/* Ad Banner */}
      {/* <div className="absolute right-4 top-1/2 transform -translate-y-1/2 hidden lg:block"> */}
      {/*   <div className="w-64 h-96 bg-gray-200 rounded overflow-hidden"> */}
      {/*     <Image */}
      {/*       src="/placeholder.svg?height=384&width=256" */}
      {/*       alt="Advertisement" */}
      {/*       width={256} */}
      {/*       height={384} */}
      {/*       className="w-full h-full object-cover" */}
      {/*     /> */}
      {/*   </div> */}
      {/* </div> */}
    </div>
  )
}

function Avatar({ color, size = "small" }: { color: string, size?: string }) {
  const sizeClass = size === "large" ? "w-16 h-16" : "w-8 h-8"

  return (
    <div className={`relative ${sizeClass}`}>
      <div className="absolute inset-0 rounded-full" style={{ backgroundColor: color }}></div>
      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-3/5 h-1/5 bg-white rounded-full flex justify-center items-center">
        <div className="w-1/2 h-3/4 bg-black rounded-full"></div>
      </div>
      <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 w-2/5 h-1/6 bg-black rounded-full"></div>
    </div>
  )
}

