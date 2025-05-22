import type { Message } from "ai"
import { User, Bot } from "lucide-react"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import LoadingAnimation from "./loading-animation"

interface ChatMessageProps {
  message: Message
  isLastMessage?: boolean
  isLoading?: boolean
}

export default function ChatMessage({ message, isLastMessage, isLoading }: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <div className={cn("flex items-start gap-3 md:gap-4 animate-fadeIn", isUser ? "flex-row-reverse" : "")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full border shadow",
          isUser ? "bg-indigo-600 text-white border-indigo-700" : "bg-gray-800 text-gray-300 border-gray-700",
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div
        className={cn(
          "rounded-2xl px-4 py-3 max-w-[85%] md:max-w-[75%] shadow-sm",
          isUser
            ? "bg-indigo-600 text-white rounded-tr-none"
            : "bg-gray-800 border border-gray-700 text-gray-100 rounded-tl-none",
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap text-sm md:text-base">{message.content}</p>
        ) : (
          <div className="prose prose-sm md:prose-base prose-invert max-w-none">
            <ReactMarkdown>{message.content}</ReactMarkdown>
            {isLastMessage && isLoading && <LoadingAnimation />}
          </div>
        )}
      </div>
    </div>
  )
}
