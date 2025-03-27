"use client"

import { useState, useRef, useEffect } from "react"
import { Settings, ThumbsUp, ThumbsDown } from "lucide-react"

export default function GamePage() {
  const [currentRound, setCurrentRound] = useState(3)
  const [totalRounds, setTotalRounds] = useState(3)
  const [timeLeft, setTimeLeft] = useState(50)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentColor, setCurrentColor] = useState("#000000")
  const [brushSize, setBrushSize] = useState(5)
  const [currentWord, setCurrentWord] = useState("__________")
  const [currentDrawer, setCurrentDrawer] = useState("Aryaaa")
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 })

  const players = [
    { id: 4, name: "Ishish", points: 2870, color: "#ffff00", avatar: "yellow" },
    { id: 7, name: "Nrivy", points: 225, color: "#ffff00", avatar: "yellow" },
    { id: 3, name: "hi", points: 2980, color: "#66ffff", avatar: "cyan" },
    { id: 15, name: "Rmmmmmmmmmm", points: 3680, color: "#66ffff", avatar: "cyan" },
    { id: 2, name: "inschool", points: 3390, color: "#333333", avatar: "gray" },
    { id: 5, name: "Aryaaa", points: 1360, color: "#cc44cc", avatar: "purple", isDrawing: true },
    { id: 6, name: "X-Ray", points: 455, color: "#ff8800", avatar: "orange" },
    { id: 8, name: "poing (You)", points: 0, color: "#ff4040", avatar: "red" },
  ]

  const colors = [
    "#000000",
    "#444444",
    "#888888",
    "#cccccc",
    "#ffffff",
    "#ff4040",
    "#ff8800",
    "#ffff00",
    "#44cc44",
    "#66ffff",
    "#4444ff",
    "#cc44cc",
    "#ff88cc",
    "#884400",
    "#44aaaa",
  ]

  const brushSizes = [2, 5, 10, 15, 25, 35]

  useEffect(() => {
    // Timer countdown
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas to white background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Setup event listeners for drawing
    const handleMouseDown = (e: MouseEvent) => {
      setIsDrawing(true)
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      setLastPos({ x, y })
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDrawing) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      ctx.beginPath()
      ctx.moveTo(lastPos.x, lastPos.y)
      ctx.lineTo(x, y)
      ctx.strokeStyle = currentColor
      ctx.lineWidth = brushSize
      ctx.lineCap = "round"
      ctx.stroke()

      setLastPos({ x, y })
    }

    const handleMouseUp = () => {
      setIsDrawing(false)
    }

    const handleMouseLeave = () => {
      setIsDrawing(false)
    }

    // Touch events for mobile
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      if (e.touches.length !== 1) return

      const touch = e.touches[0]
      const rect = canvas.getBoundingClientRect()
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top

      setIsDrawing(true)
      setLastPos({ x, y })
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      if (!isDrawing || e.touches.length !== 1) return

      const touch = e.touches[0]
      const rect = canvas.getBoundingClientRect()
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top

      ctx.beginPath()
      ctx.moveTo(lastPos.x, lastPos.y)
      ctx.lineTo(x, y)
      ctx.strokeStyle = currentColor
      ctx.lineWidth = brushSize
      ctx.lineCap = "round"
      ctx.stroke()

      setLastPos({ x, y })
    }

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault()
      setIsDrawing(false)
    }

    canvas.addEventListener("mousedown", handleMouseDown)
    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseup", handleMouseUp)
    canvas.addEventListener("mouseleave", handleMouseLeave)

    canvas.addEventListener("touchstart", handleTouchStart)
    canvas.addEventListener("touchmove", handleTouchMove)
    canvas.addEventListener("touchend", handleTouchEnd)

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown)
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mouseup", handleMouseUp)
      canvas.removeEventListener("mouseleave", handleMouseLeave)

      canvas.removeEventListener("touchstart", handleTouchStart)
      canvas.removeEventListener("touchmove", handleTouchMove)
      canvas.removeEventListener("touchend", handleTouchEnd)
    }
  }, [isDrawing, lastPos, currentColor, brushSize])

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#1a5cb0", backgroundImage: "url('/doodle-pattern.svg')" }}
    >
      {/* Logo */}
      <div className="flex justify-center py-2">
        <h1 className="text-4xl font-bold">
          <span className="text-red-500">s</span>
          <span className="text-orange-500">k</span>
          <span className="text-yellow-400">r</span>
          <span className="text-green-500">i</span>
          <span className="text-cyan-400">b</span>
          <span className="text-blue-500">b</span>
          <span className="text-white">l</span>
          <span className="text-pink-500">.</span>
          <span className="text-indigo-500">i</span>
          <span className="text-orange-500">o</span>
          <span className="inline-block ml-1 transform rotate-12">
            <div className="w-4 h-8 bg-orange-500 rounded-t-sm relative">
              <div className="absolute top-0 w-4 h-1.5 bg-yellow-300"></div>
              <div className="absolute bottom-0 left-1/2 w-0.5 h-2 bg-black transform -translate-x-1/2"></div>
            </div>
          </span>
        </h1>
      </div>

      {/* Main Game Area */}
      <div className="flex flex-1 px-4 pb-4 gap-4">
        {/* Left Sidebar - Player List */}
        <div className="w-64 bg-white rounded-lg overflow-hidden">
          <div className="flex items-center bg-gray-100 p-2">
            <div className="bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center font-bold text-gray-700">
              {timeLeft}
            </div>
            <div className="ml-2 font-bold">
              Round {currentRound} of {totalRounds}
            </div>
          </div>

          <div className="divide-y">
            {players.map((player) => (
              <div key={player.id} className={`flex items-center p-2 ${player.isDrawing ? "bg-gray-100" : ""}`}>
                <div className="w-8 text-right font-bold text-gray-700 mr-2">#{player.id}</div>
                <div className="relative w-10 h-10 flex-shrink-0">
                  <Avatar color={player.color} />
                </div>
                <div className="ml-2 flex-1 overflow-hidden">
                  <div className="font-bold truncate">{player.name}</div>
                  <div className="text-sm text-gray-600">{player.points} points</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Game Content */}
        <div className="flex-1 flex flex-col">
          {/* Word to Guess */}
          <div className="bg-white rounded-lg p-3 mb-2 flex flex-col items-center">
            <div className="text-gray-700 font-bold mb-1">GUESS THIS</div>
            <div className="text-2xl tracking-widest font-bold text-black">{currentWord}</div>
          </div>

          {/* Drawing Canvas */}
          <div className="flex-1 bg-white rounded-lg overflow-hidden relative">
            {/* Thumbs up/down */}
            <div className="absolute top-2 right-2 flex gap-2">
              <button className="p-1 bg-green-100 rounded-full">
                <ThumbsUp className="w-6 h-6 text-green-600" />
              </button>
              <button className="p-1 bg-red-100 rounded-full">
                <ThumbsDown className="w-6 h-6 text-red-600" />
              </button>
            </div>

            {/* Drawing notification */}
            <div className="absolute bottom-2 right-2 text-blue-600 font-bold">{currentDrawer} is drawing now!</div>

            {/* Canvas */}
            <canvas ref={canvasRef} width={800} height={600} className="w-full h-full" />

            {/* Drawing Tools - Only visible when it's your turn to draw */}
            {players.find((p) => p.name === "poing (You)")?.isDrawing && (
              <div className="absolute bottom-0 left-0 right-0 bg-gray-100 p-2 flex items-center">
                <div className="flex flex-wrap gap-1 mr-4">
                  {colors.map((color) => (
                    <button
                      key={color}
                      className={`w-6 h-6 rounded-sm ${currentColor === color ? "ring-2 ring-blue-500" : ""}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setCurrentColor(color)}
                    />
                  ))}
                </div>

                <div className="flex gap-1 mr-4">
                  {brushSizes.map((size) => (
                    <button
                      key={size}
                      className={`w-8 h-8 rounded-sm flex items-center justify-center bg-white ${brushSize === size ? "ring-2 ring-blue-500" : ""}`}
                      onClick={() => setBrushSize(size)}
                    >
                      <div className="rounded-full bg-black" style={{ width: size, height: size }} />
                    </button>
                  ))}
                </div>

                <button className="px-3 py-1 bg-red-500 text-white rounded-sm" onClick={clearCanvas}>
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Guess Input */}
          <div className="mt-2">
            <input
              type="text"
              placeholder="Type your guess here..."
              className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Settings Button */}
        <button className="absolute top-4 right-4 bg-gray-800 text-white p-2 rounded-full">
          <Settings className="w-6 h-6" />
        </button>
      </div>

      {/* Ad Banner */}
      {/* <div className="absolute right-4 top-32 hidden lg:block"> */}
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

function Avatar({ color }) {
  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0 rounded-full" style={{ backgroundColor: color }}></div>
      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-3/5 h-1/5 bg-white rounded-full flex justify-center items-center">
        <div className="w-1/2 h-3/4 bg-black rounded-full"></div>
      </div>
      <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 w-2/5 h-1/6 bg-black rounded-full"></div>
    </div>
  )
}

