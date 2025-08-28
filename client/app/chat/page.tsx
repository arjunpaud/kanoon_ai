"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Send, Mic, MicOff } from "lucide-react"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [selectedModel, setSelectedModel] = useState<"rag" | "precedent">("rag")
  const [isListening, setIsListening] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

      if (SpeechRecognition) {
        setSpeechSupported(true)
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false
        recognitionRef.current.lang = "ne-NP"

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript
          setInputMessage(transcript)
          setIsListening(false)
        }

        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error("Speech recognition error:", event.error)
          setIsListening(false)

          // Handle specific error types
          if (event.error === "no-speech") {
            // Don't show error for no-speech, just stop listening
            return
          } else if (event.error === "not-allowed") {
            alert("Microphone access denied. Please allow microphone permissions.")
          } else if (event.error === "network") {
            alert("Network error occurred during speech recognition.")
          }
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
      } else {
        console.warn("Speech recognition not supported in this browser")
        setSpeechSupported(false)
      }
    }
  }, [])

  const startListening = () => {
    if (recognitionRef.current && speechSupported) {
      setIsListening(true)
      try {
        recognitionRef.current.start()
      } catch (error) {
        console.error("Error starting speech recognition:", error)
        setIsListening(false)
        if (error instanceof Error && error.message.includes("already started")) {
          // Recognition is already running, just update state
          setIsListening(true)
        }
      }
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
    }

    setMessages((prev) => [...prev, userMessage])
    const currentMessage = inputMessage
    setInputMessage("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentMessage,
          model: selectedModel,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response")
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || data.fallbackResponse || "No response received",
        sender: "ai",
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Error sending message:", error)

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I apologize, but I'm currently unable to process your request. Please ensure the Python model is properly set up in the ../model directory with the virtual environment activated.`,
        sender: "ai",
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
      {/* Header */}
      <header className="border-b border-gray-800 bg-black">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">KANOON AI</h1>
            <Select value={selectedModel} onValueChange={(value: "rag" | "precedent") => setSelectedModel(value)}>
              <SelectTrigger className="w-32 bg-gray-900 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="rag" className="text-white hover:bg-gray-800">
                  RAG
                </SelectItem>
                <SelectItem value="precedent" className="text-white hover:bg-gray-800">
                  Precedent
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="container mx-auto max-w-4xl space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold text-white mb-2">Welcome to KANOON AI</h3>
              <p className="text-gray-400">
                Ask me any legal question. I'm here to help with{" "}
                {selectedModel === "rag" ? "research and analysis" : "precedent research"}.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
              <Card
                className={`max-w-[80%] ${
                  message.sender === "user" ? "bg-white text-black" : "bg-gray-900 text-white border-gray-700"
                }`}
              >
                <CardContent className="px-3 py-2">
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </CardContent>
              </Card>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <Card className="bg-gray-900 text-white border-gray-700">
                <CardContent className="px-3 py-2">
                  <div className="flex items-center space-x-2">
                    <div className="animate-pulse flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    </div>
                    <span className="text-sm text-gray-400">KANOON AI is thinking...</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-800 bg-black p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Ask KANOON AI using ${selectedModel.toUpperCase()} model...`}
                className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-400 h-8 px-2 py-1"
                disabled={isLoading}
              />
            </div>
            {speechSupported && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-gray-800 border border-gray-700"
                onClick={isListening ? stopListening : startListening}
                disabled={isLoading}
              >
                {isListening ? (
                  <MicOff className="h-4 w-4 text-red-500" />
                ) : (
                  <Mic className="h-4 w-4 text-gray-400 hover:text-white" />
                )}
              </Button>
            )}
            <Button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-white text-black hover:bg-gray-200 h-8"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
