import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Gavel } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-white">KANOON AI</h1>
            </div>
            <Link href="/chat">
              <Button className="bg-white text-black hover:bg-gray-200">Start Chat</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-bold text-white text-balance">Legal AI Assistant</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto text-pretty">
              Get instant legal insights with KANOON AI. Choose between RAG-powered research or precedent analysis for
              comprehensive legal assistance.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/chat">
              <Button size="lg" className="bg-white text-black hover:bg-gray-200">
                <MessageSquare className="mr-2 h-5 w-5" />
                Start Chatting
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-8 mt-16">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <MessageSquare className="h-6 w-6" />
                RAG Analysis
              </CardTitle>
              <CardDescription className="text-gray-400">
                Retrieval-Augmented Generation for comprehensive legal research and analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="text-gray-300">
              <p>
                Leverage advanced AI to search through vast legal databases and provide contextual answers to your legal
                questions.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Gavel className="h-6 w-6" />
                Precedent Research
              </CardTitle>
              <CardDescription className="text-gray-400">
                Find relevant case law and legal precedents for your specific situation
              </CardDescription>
            </CardHeader>
            <CardContent className="text-gray-300">
              <p>
                Access historical case data and precedent analysis to strengthen your legal arguments and understanding.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
