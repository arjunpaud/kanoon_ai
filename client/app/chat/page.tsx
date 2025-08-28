"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Mic, Send, ChevronDown, Bot } from "lucide-react"
import { useRouter } from "next/navigation"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

export default function ChatPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState<"rag" | "precedent">("rag")
  const [isListening, setIsListening] = useState(false)
  const [showModelDropdown, setShowModelDropdown] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Speech recognition setup
  const startListening = () => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognition = new SpeechRecognition()

      recognition.lang = "ne-NP" // Nepali language
      recognition.continuous = false
      recognition.interimResults = false

      recognition.onstart = () => {
        setIsListening(true)
      }

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInputText(transcript)
        setIsListening(false)
      }

      recognition.onerror = () => {
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.start()
    }
  }

  const toggleModel = () => {
    setSelectedModel((prev) => (prev === "rag" ? "precedent" : "rag"))
    setShowModelDropdown(false)
  }

  const selectModel = (model: "rag" | "precedent") => {
    setSelectedModel(model)
    setShowModelDropdown(false)
  }

  const sendMessage = async () => {
    if (!inputText.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputText("")
    setIsLoading(true)

    try {
      // Simulate API call - replace with actual endpoint
      const response = await fetch("http://127.0.0.1:5000/api/model", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: selectedModel,
          message: inputText,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.reply || "Sorry, I could not process your request.",
          sender: "bot",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botMessage])
      } else {
        throw new Error("Failed to get response")
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I encountered an error. Please try again.",
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="border-b border-gray-800 bg-black/90 backdrop-blur-md p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
            <h1 className="text-2xl font-bold text-white tracking-tight">KANOON AI</h1>
          </div>

          <div className="relative">
            <Button
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              className="flex items-center gap-3 bg-gray-900/80 hover:bg-gray-800 text-white border border-gray-700 px-5 py-2.5 rounded-lg transition-all duration-200 backdrop-blur-sm"
            >
              <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
              <span className="capitalize font-semibold text-sm">{selectedModel} Model</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${showModelDropdown ? "rotate-180" : ""}`}
              />
            </Button>

            {showModelDropdown && (
              <div className="absolute top-full right-0 mt-3 bg-gray-900/95 backdrop-blur-md border border-gray-700 rounded-lg shadow-2xl z-20 min-w-[220px] overflow-hidden">
                <div className="p-3">
                  <button
                    onClick={() => selectModel("rag")}
                    className={`w-full text-left px-5 py-4 rounded-md text-sm transition-all duration-200 ${
                      selectedModel === "rag"
                        ? "bg-white text-black font-semibold"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <div className="font-medium text-base">RAG Model</div>
                    <div className="text-xs opacity-70 mt-2">
                      Retrieval-Augmented Generation for accurate legal information
                    </div>
                  </button>
                  <div className="my-2"></div>
                  <button
                    onClick={() => selectModel("precedent")}
                    className={`w-full text-left px-5 py-4 rounded-md text-sm transition-all duration-200 ${
                      selectedModel === "precedent"
                        ? "bg-white text-black font-semibold"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <div className="font-medium text-base">Precedent Model</div>
                    <div className="text-xs opacity-70 mt-2">Legal precedent analysis and case law research</div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {messages.length === 0 && (
            <div className="text-center py-16 space-y-6">
              <div className="w-16 h-16 bg-gray-900 rounded-lg flex items-center justify-center mx-auto">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white">Welcome to KANOON AI</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  Ask me anything about Nepali law, legal precedents, or get assistance with legal research.
                </p>
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-300`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div
                className={`max-w-xs lg:max-w-2xl px-5 py-4 rounded-lg shadow-lg ${
                  message.sender === "user"
                    ? "bg-white text-black font-medium"
                    : "bg-gray-900/80 text-white border border-gray-800 backdrop-blur-sm"
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
              <div className="bg-gray-900/80 text-gray-300 px-5 py-4 rounded-lg border border-gray-800 backdrop-blur-sm flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-white rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-white rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
                <span className="font-medium">KANOON AI is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-gray-800 bg-black/90 backdrop-blur-md p-6 sticky bottom-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-4">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask anything about Nepali law..."
                className="min-h-[56px] max-h-32 resize-none bg-gray-800/60 border-gray-600 text-white placeholder-gray-400 focus:border-gray-400 focus:ring-gray-400 focus:ring-1 rounded-xl px-5 py-4 text-base backdrop-blur-sm transition-all duration-200 hover:bg-gray-800/80"
                rows={1}
              />
            </div>

            <Button
              onClick={startListening}
              variant="outline"
              size="icon"
              className={`h-[56px] w-[56px] rounded-xl border-gray-600 transition-all duration-200 backdrop-blur-sm ${
                isListening
                  ? "bg-red-500/20 border-red-400 text-red-400 hover:bg-red-500/30"
                  : "bg-gray-800/60 text-gray-300 hover:text-white hover:bg-gray-700/80 hover:border-gray-500"
              }`}
              disabled={isListening}
            >
              <Mic className={`w-5 h-5 ${isListening ? "animate-pulse" : ""}`} />
            </Button>

            <Button
              onClick={sendMessage}
              disabled={!inputText.trim() || isLoading}
              className="h-[56px] w-[56px] bg-gray-100 text-black hover:bg-white disabled:bg-gray-700/60 disabled:text-gray-500 rounded-xl transition-all duration-200 shadow-lg hover:shadow-gray-100/20 backdrop-blur-sm"
              size="icon"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
