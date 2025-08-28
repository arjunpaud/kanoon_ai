"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Bot, Brain, Gavel } from "lucide-react"

export default function Home() {
  const router = useRouter()

  const handleStartChat = () => {
    router.push("/chat")
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="border-b border-gray-800 bg-black/90 backdrop-blur-md p-4 sticky top-0 z-10">
        <div className="flex items-center justify-start max-w-6xl mx-auto">
          <div className="flex items-center cursor-pointer" onClick={() => router.push("/")}>
            <h1 className="text-2xl font-bold text-white tracking-tight">KANOON AI</h1>
          </div>
        </div>
      </div>

      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 via-black to-gray-900/30" />

      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-white/3 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-white/2 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex items-center min-h-screen px-6 lg:px-12">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight leading-none">
                  <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                    KANOON
                  </span>
                  <br />
                  <span className="text-white/90">AI</span>
                </h1>

                <div className="space-y-4">
                  <p className="text-xl md:text-2xl text-gray-300 font-medium leading-relaxed max-w-lg">
                    Advanced AI Assistant for Nepali Legal Research & Consultation
                  </p>

                  <p className="text-lg text-gray-400 max-w-md">
                    Powered by cutting-edge RAG technology and legal precedent analysis
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={handleStartChat}
                  className="group bg-white text-black hover:bg-gray-100 px-8 py-3 text-lg font-bold rounded-md transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-0 cursor-pointer"
                >
                  START CHAT
                  <Bot className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform duration-300" />
                </Button>

                <p className="text-gray-500 text-sm">Experience the future of legal AI assistance</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid gap-4">
                <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-800/50 rounded-md p-6 hover:bg-gray-900/60 transition-colors duration-300 cursor-pointer">
                  <div className="flex items-start gap-4">
                    <Brain className="w-6 h-6 text-white mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-white font-semibold mb-2">RAG Model</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        Retrieval-Augmented Generation for accurate legal information and contextual responses
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-800/50 rounded-md p-6 hover:bg-gray-900/60 transition-colors duration-300 cursor-pointer">
                  <div className="flex items-start gap-4">
                    <Gavel className="w-6 h-6 text-white mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-white font-semibold mb-2">Precedent Analysis</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        Deep analysis of legal precedents and comprehensive case law research
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-800/50 rounded-md p-6 hover:bg-gray-900/60 transition-colors duration-300 cursor-pointer">
                  <div className="flex items-start gap-4">
                    <Bot className="w-6 h-6 text-white mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-white font-semibold mb-2">AI Assistant</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        Native Nepali language processing with voice input capabilities and intelligent responses
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
