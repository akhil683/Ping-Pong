"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import {
  Settings,
  ThumbsUp,
  ThumbsDown,
  Send,
  Square,
  Circle,
  Triangle,
  RectangleVerticalIcon as Rectangle,
} from "lucide-react"
import Logo from "../logo"
import GameLeaderboard from "./game-leaderboard"

export interface PlayerType {
  id: number,
  name: string,
  points: number,
  color: string,
  avatar: string,
  isDrawing?: boolean | false,
}
export default function GamePage() {
  const [currentRound, setCurrentRound] = useState(3)
  const [totalRounds, setTotalRounds] = useState(3)
  const [timeLeft, setTimeLeft] = useState(50)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentColor, setCurrentColor] = useState("#000000")
  const [brushSize, setBrushSize] = useState(5)
  const [currentWord, setCurrentWord] = useState("__________")
  const [currentDrawer, setCurrentDrawer] = useState("Aryaaa")
  const [guessInput, setGuessInput] = useState("")
  const [currentTool, setCurrentTool] = useState("pen") // pen, eraser, rectangle, square, triangle, circle
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [messages, setMessages] = useState([
    { type: "system", content: "Game started! Round 1 of 3" },
    { type: "system", content: "Aryaaa is drawing now!" },
    { type: "message", player: "Ishish", content: "is it a car?", color: "#ffff00" },
    { type: "message", player: "Nrivy", content: "looks like a house", color: "#ffff00" },
    { type: "system", content: "hi is close to the answer!" },
    { type: "message", player: "hi", content: "building?", color: "#66ffff" },
    { type: "message", player: "Rmmmmmmmmmm", content: "maybe a castle?", color: "#66ffff" },
    { type: "message", player: "inschool", content: "tower!", color: "#333333" },
    { type: "system", content: "inschool guessed the word!" },
    { type: "message", player: "X-Ray", content: "nice one!", color: "#ff8800" },
    { type: "message", player: "poing (You)", content: "good job", color: "#ff4040" },
    { type: "system", content: "Round 2 of 3" },
    { type: "system", content: "inschool is drawing now!" },
    { type: "message", player: "Ishish", content: "is that a dog?", color: "#ffff00" },
    { type: "message", player: "hi", content: "cat maybe?", color: "#66ffff" },
    { type: "system", content: "Ishish guessed the word!" },
    { type: "system", content: "Round 3 of 3" },
    { type: "system", content: "Aryaaa is drawing now!" },
  ])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 })

  const players: PlayerType[] = [
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
    "eraser", // Special value for eraser
  ]

  const brushSizes = [2, 5, 10, 15, 25, 35]

  const tools = [
    { id: "pen", icon: null, label: "Pen" },
    { id: "eraser", icon: null, label: "Eraser" },
    { id: "rectangle", icon: <Rectangle size={20} />, label: "Rectangle" },
    { id: "square", icon: <Square size={20} />, label: "Square" },
    { id: "circle", icon: <Circle size={20} />, label: "Circle" },
    { id: "triangle", icon: <Triangle size={20} />, label: "Triangle" },
  ]

  useEffect(() => {
    // Timer countdown
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // Scroll chat to bottom when messages change
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    const canvas = canvasRef.current
    const previewCanvas = previewCanvasRef.current
    if (!canvas || !previewCanvas) return

    // Make canvas responsive
    const resizeCanvas = () => {
      const parent = canvas.parentElement
      if (!parent) return

      // Set canvas dimensions to match parent container
      const width = parent.clientWidth
      const height = parent.clientHeight - 40 // Leave space for tools

      canvas.width = width
      canvas.height = height
      previewCanvas.width = width
      previewCanvas.height = height

      // Redraw canvas with white background
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
    }

    // Initial resize
    resizeCanvas()

    // Resize on window resize
    window.addEventListener("resize", resizeCanvas)

    const ctx = canvas.getContext("2d")
    const previewCtx = previewCanvas.getContext("2d")
    if (!ctx || !previewCtx) return

    // Setup event listeners for drawing
    const startDrawing = (x: number, y: number) => {
      setIsDrawing(true)
      setStartPos({ x, y })
      setLastPos({ x, y })

      if (currentTool === "pen" || currentTool === "eraser") {
        // For eraser, we draw white
        if (currentTool === "eraser") {
          ctx.globalCompositeOperation = "destination-out"
        } else {
          ctx.globalCompositeOperation = "source-over"
        }

        // Start drawing for pen/eraser
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x, y)
        ctx.strokeStyle = currentTool === "eraser" ? "#ffffff" : currentColor
        ctx.lineWidth = brushSize
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
        ctx.stroke()
      }
    }

    const draw = (x: number, y: number) => {
      if (!isDrawing) return

      if (currentTool === "pen" || currentTool === "eraser") {
        // Continue drawing for pen/eraser
        ctx.beginPath()
        ctx.moveTo(lastPos.x, lastPos.y)
        ctx.lineTo(x, y)

        if (currentTool === "eraser") {
          ctx.strokeStyle = "#ffffff"
          ctx.globalCompositeOperation = "destination-out"
        } else {
          ctx.strokeStyle = currentColor
          ctx.globalCompositeOperation = "source-over"
        }

        ctx.lineWidth = brushSize
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
        ctx.stroke()

        setLastPos({ x, y })
      } else {
        // For shapes, we preview on the preview canvas
        previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height)
        previewCtx.strokeStyle = currentColor
        previewCtx.lineWidth = brushSize
        previewCtx.lineCap = "round"
        previewCtx.lineJoin = "round"
        previewCtx.beginPath()

        const startX = startPos.x
        const startY = startPos.y

        switch (currentTool) {
          case "rectangle":
            previewCtx.rect(startX, startY, x - startX, y - startY)
            break
          case "square":
            const size = Math.max(Math.abs(x - startX), Math.abs(y - startY))
            const signX = x >= startX ? 1 : -1
            const signY = y >= startY ? 1 : -1
            previewCtx.rect(startX, startY, size * signX, size * signY)
            break
          case "circle":
            const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2))
            previewCtx.arc(startX, startY, radius, 0, Math.PI * 2)
            break
          case "triangle":
            previewCtx.moveTo(startX, startY)
            previewCtx.lineTo(x, y)
            previewCtx.lineTo(startX - (x - startX), y)
            previewCtx.closePath()
            break
        }

        previewCtx.stroke()
      }
    }

    const stopDrawing = () => {
      if (!isDrawing) return

      if (currentTool !== "pen" && currentTool !== "eraser") {
        // For shapes, draw the final shape on the main canvas
        ctx.strokeStyle = currentColor
        ctx.lineWidth = brushSize
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
        ctx.beginPath()

        const startX = startPos.x
        const startY = startPos.y
        const endX = lastPos.x
        const endY = lastPos.y

        switch (currentTool) {
          case "rectangle":
            ctx.rect(startX, startY, endX - startX, endY - startY)
            break
          case "square":
            const size = Math.max(Math.abs(endX - startX), Math.abs(endY - startY))
            const signX = endX >= startX ? 1 : -1
            const signY = endY >= startY ? 1 : -1
            ctx.rect(startX, startY, size * signX, size * signY)
            break
          case "circle":
            const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2))
            ctx.arc(startX, startY, radius, 0, Math.PI * 2)
            break
          case "triangle":
            ctx.moveTo(startX, startY)
            ctx.lineTo(endX, endY)
            ctx.lineTo(startX - (endX - startX), endY)
            ctx.closePath()
            break
        }

        ctx.stroke()

        // Clear the preview canvas
        previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height)
      }

      setIsDrawing(false)
    }

    // Mouse events
    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      startDrawing(x, y)
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      draw(x, y)
      setLastPos({ x, y })
    }

    // Touch events
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      if (e.touches.length !== 1) return

      const touch = e.touches[0]
      const rect = canvas.getBoundingClientRect()
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top

      startDrawing(x, y)
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      if (!isDrawing || e.touches.length !== 1) return

      const touch = e.touches[0]
      const rect = canvas.getBoundingClientRect()
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top

      draw(x, y)
      setLastPos({ x, y })
    }

    canvas.addEventListener("mousedown", handleMouseDown)
    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseup", stopDrawing)
    canvas.addEventListener("mouseleave", stopDrawing)

    canvas.addEventListener("touchstart", handleTouchStart)
    canvas.addEventListener("touchmove", handleTouchMove)
    canvas.addEventListener("touchend", stopDrawing)

    return () => {
      window.removeEventListener("resize", resizeCanvas)

      canvas.removeEventListener("mousedown", handleMouseDown)
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mouseup", stopDrawing)
      canvas.removeEventListener("mouseleave", stopDrawing)

      canvas.removeEventListener("touchstart", handleTouchStart)
      canvas.removeEventListener("touchmove", handleTouchMove)
      canvas.removeEventListener("touchend", stopDrawing)
    }
  }, [isDrawing, lastPos, currentColor, brushSize, currentTool, startPos])

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const previewCanvas = previewCanvasRef.current
    if (!canvas || !previewCanvas) return

    const ctx = canvas.getContext("2d")
    const previewCtx = previewCanvas.getContext("2d")
    if (!ctx || !previewCtx) return

    ctx.fillStyle = "#ffffff"
    ctx.globalCompositeOperation = "source-over"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height)
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()

    if (!guessInput.trim()) return

    // Add message to chat
    setMessages([
      ...messages,
      {
        type: "message",
        player: "poing (You)",
        content: guessInput,
        color: "#ff4040",
      },
    ])

    // Clear input
    setGuessInput("")
  }

  const handleToolSelect = (tool: string) => {
    setCurrentTool(tool)

    // If selecting eraser, keep it as eraser
    // If selecting another tool, set color back to previous if it was eraser
    if (tool === "eraser") {
      setCurrentColor("eraser")
    } else if (currentColor === "eraser") {
      setCurrentColor("#000000")
    }
  }

  return (
    <div className="min-h-screen bg-blue-500 flex flex-col">
      <div className="flex justify-center text-4xl py-2 relative z-10">
        <Logo />
      </div>

      {/* Main Game Area */}
      <div className="flex flex-1 px-4 pb-4 gap-4 relative z-10">
        {/* Left Sidebar - Player List */}
        <GameLeaderboard
          currentRound={currentRound}
          totalRounds={totalRounds}
          timeLeft={timeLeft}
          players={players}
        />
        {/* Main Game Content */}
        <div className="flex-1 flex flex-col">
          {/* Word to Guess */}
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 mb-2 flex flex-col items-center shadow-xl border border-white/20">
            <div className="text-gray-700 font-bold mb-1">GUESS THIS</div>
            <div className="text-2xl tracking-widest font-bold">{currentWord}</div>
          </div>

          {/* Game Area with Canvas and Chat */}
          <div className="flex-1 flex gap-2">
            {/* Drawing Canvas */}
            <div className="flex-1 bg-white rounded-lg overflow-hidden relative shadow-xl border border-white/20">
              {/* Thumbs up/down */}
              <div className="absolute top-2 right-2 flex gap-2 z-10">
                <button className="p-1 bg-green-100 rounded-full hover:bg-green-200 cursor-pointer transition-colors">
                  <ThumbsUp className="w-6 h-6 text-green-600" />
                </button>
                <button className="p-1 bg-red-100 rounded-full hover:bg-red-200 transition-colors cursor-pointer">
                  <ThumbsDown className="w-6 h-6 text-red-600" />
                </button>
              </div>

              {/* Canvas */}
              <div className="w-full h-full relative">
                <canvas ref={canvasRef} className="absolute top-0 left-0 touch-none" style={{ cursor: "crosshair" }} />
                <canvas
                  ref={previewCanvasRef}
                  className="absolute top-0 left-0 touch-none pointer-events-none"
                  style={{ zIndex: 1 }}
                />
              </div>

              {/* Drawing Tools */}
              <div className="absolute bottom-0 left-0 right-0 bg-gray-100/90 backdrop-blur-sm p-2 flex flex-wrap items-center gap-2 border-t border-gray-200">
                {/* Tool Selection */}
                <div className="flex gap-1 mr-3">
                  {tools.map((tool) => (
                    <button
                      key={tool.id}
                      className={`w-8 h-8 rounded-sm flex items-center justify-center ${currentTool === tool.id ? "bg-blue-500" : "bg-gray-500"} transition-colors`}
                      style={{ border: "1px solid #ccc" }}
                      onClick={() => handleToolSelect(tool.id)}
                      title={tool.label}
                    >
                      {tool.icon ? (
                        tool.icon
                      ) : (
                        <div className="w-5 h-5 flex items-center justify-center">
                          {tool.id === "pen" ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                              <path d="M15 3h6v6"></path>
                              <path d="m10 14 11-11"></path>
                            </svg>
                          )}
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Color Selection */}
                <div className="flex flex-wrap gap-1 mr-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-sm flex items-center justify-center ${currentColor === color ? "ring-2 ring-blue-500 transform scale-110 transition-transform" : "hover:scale-105 transition-transform"}`}
                      style={{
                        backgroundColor: color === "eraser" ? "#ffffff" : color,
                        border: "1px solid #ccc",
                        opacity: currentTool === "eraser" && color !== "eraser" ? 0.5 : 1,
                      }}
                      onClick={() => {
                        setCurrentColor(color)
                        if (color === "eraser") {
                          setCurrentTool("eraser")
                        } else if (currentTool === "eraser") {
                          setCurrentTool("pen")
                        }
                      }}
                      disabled={currentTool === "eraser" && color !== "eraser"}
                    >
                      {color === "eraser" && (
                        <div className="w-6 h-6 flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <path d="M15 3h6v6"></path>
                            <path d="m10 14 11-11"></path>
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Brush Size Selection */}
                <div className="flex gap-1 mr-2">
                  {brushSizes.map((size) => (
                    <button
                      key={size}
                      className={`w-8 h-8 rounded-sm flex items-center justify-center bg-white ${brushSize === size ? "ring-2 ring-blue-500 transform scale-110 transition-transform" : "hover:scale-105 transition-transform"}`}
                      style={{ border: "1px solid #ccc" }}
                      onClick={() => setBrushSize(size)}
                    >
                      <div
                        className="rounded-full"
                        style={{
                          width: size,
                          height: size,
                          backgroundColor: currentColor === "eraser" ? "#888888" : currentColor,
                        }}
                      />
                    </button>
                  ))}
                </div>

                {/* Clear Button */}
                <button
                  className="px-3 py-1 bg-red-500 text-white rounded-sm hover:bg-red-600 transition-colors transform hover:scale-105 active:scale-95"
                  onClick={clearCanvas}
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Chat Container */}
            <div className="w-72 bg-white/90 backdrop-blur-sm rounded-lg overflow-hidden shadow-xl border border-white/20 flex flex-col">
              {/* Chat Messages */}
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-2 space-y-2"
                style={{ maxHeight: "calc(70vh - 50px)" }}
              >
                {messages.map((message, index) => (
                  <div key={index} className={`${message.type === "system" ? "text-center italic text-gray-500" : ""}`}>
                    {message.type === "system" ? (
                      <div className="bg-gray-100 rounded py-1 px-2 text-sm">{message.content}</div>
                    ) : (
                      <div className="flex items-start">
                        <span className="font-bold mr-1" style={{ color: message.color }}>
                          {message.player}:
                        </span>
                        <span className="text-gray-800">{message.content}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-2 flex items-center">
                <input
                  type="text"
                  placeholder="Type your guess here..."
                  className="flex-1 p-2 rounded-l-md border-2 placeholder:text-gray-600 text-black border-blue-500 focus:outline-none"
                  value={guessInput}
                  onChange={(e) => setGuessInput(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white p-2 rounded-r-md h-full hover:bg-blue-600 transition-colors"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Settings Button */}
        <button className="absolute top-4 right-4 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 transition-colors z-20">
          <Settings className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}

