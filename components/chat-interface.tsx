"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useChat } from "ai/react"
import { Mic, Send, StopCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import ChatMessage from "@/components/chat-message"
import VoiceInput from "@/components/voice-input"
import { cn } from "@/lib/utils"
import LoadingAnimation from "@/components/loading-animation"

export default function ChatInterface() {
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading, stop } = useChat({
    api: "/api/chat",
  })

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "60px"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`
    }
  }, [input])

  const handleVoiceInput = (transcript: string) => {
    handleInputChange({ target: { value: transcript } } as any)
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      handleSubmit(e)
    }
  }

  return (
    <div className="flex flex-col h-screen w-full">
      <Card className="flex-1 overflow-hidden flex flex-col border-0 shadow-none rounded-none bg-gray-900 text-gray-100">
        <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-6 scrollbar-thin">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center p-4 md:p-8">
              <div className="max-w-md space-y-4">
                <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto">
                  <Mic className="h-8 w-8 text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-100">Welcome to AI Assistant</h3>
                <p className="text-gray-400">
                  Start a conversation with the AI assistant. You can type your message or use voice input.
                </p>
                <div className="pt-4">
                  <Button
                    variant="outline"
                    className="bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700 hover:text-white"
                    onClick={() => {
                      handleInputChange({ target: { value: "What can you help me with?" } } as any)
                      setTimeout(() => {
                        handleSubmit({} as any)
                      }, 100)
                    }}
                  >
                    Start a conversation
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message, index) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isLastMessage={index === messages.length - 1 && message.role === "assistant"}
                  isLoading={isLoading && index === messages.length - 1}
                />
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border border-gray-700 shadow bg-gray-800">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                  <div className="rounded-lg px-4 py-3 bg-gray-800 border border-gray-700">
                    <LoadingAnimation />
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-gray-800 p-3 md:p-4 bg-gray-800/50">
          <form onSubmit={handleFormSubmit} className="flex items-end gap-2">
            {isVoiceMode ? (
              <VoiceInput onTranscript={handleVoiceInput} onStop={() => setIsVoiceMode(false)} />
            ) : (
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                placeholder="Type your message..."
                className="flex-1 min-h-[60px] max-h-[150px] resize-none bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500 focus-visible:ring-indigo-500/70"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    if (input.trim()) {
                      handleSubmit(e)
                    }
                  }
                }}
              />
            )}
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                size="icon"
                variant={isVoiceMode ? "default" : "outline"}
                onClick={() => setIsVoiceMode(!isVoiceMode)}
                className={cn(
                  "transition-all duration-200",
                  isVoiceMode
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white",
                )}
              >
                <Mic className="h-4 w-4" />
              </Button>

              {isLoading ? (
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={stop}
                  className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-red-900/30 hover:text-red-400"
                >
                  <StopCircle className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() && !isVoiceMode}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-gray-800 disabled:text-gray-600"
                >
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}
