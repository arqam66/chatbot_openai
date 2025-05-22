"use client"

import { cn } from "@/lib/utils"

import { useState, useEffect } from "react"
import { Mic, StopCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface VoiceInputProps {
  onTranscript: (transcript: string) => void
  onStop: () => void
}

export default function VoiceInput({ onTranscript, onStop }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(true)
  const [transcript, setTranscript] = useState("")
  const [recordingTime, setRecordingTime] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const maxRecordingTime = 30 // 30 seconds max

  useEffect(() => {
    let recognition: any | null = null
    let timer: NodeJS.Timeout | null = null

    if (isRecording) {
      // Reset timer and transcript
      setRecordingTime(0)
      setTranscript("")
      setError(null)

      // Start timer
      timer = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= maxRecordingTime) {
            stopRecording()
            return maxRecordingTime
          }
          return prev + 1
        })
      }, 1000)

      // Initialize speech recognition
      try {
        // Browser compatibility check
        const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition || null

        if (SpeechRecognition) {
          recognition = new SpeechRecognition()
          recognition.continuous = true
          recognition.interimResults = true

          recognition.onresult = (event: any) => {
            let finalTranscript = ""
            for (let i = event.resultIndex; i < event.results.length; i++) {
              const transcript = event.results[i][0].transcript
              if (event.results[i].isFinal) {
                finalTranscript += transcript
              }
            }

            if (finalTranscript) {
              setTranscript(finalTranscript)
              onTranscript(finalTranscript)
            }
          }

          recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error)
            setError(`Error: ${event.error}`)
            stopRecording()
          }

          recognition.start()
        } else {
          setError("Speech recognition not supported in this browser")
          stopRecording()
        }
      } catch (error) {
        console.error("Error initializing speech recognition:", error)
        setError("Failed to initialize speech recognition")
        stopRecording()
      }
    }

    function stopRecording() {
      if (timer) clearInterval(timer)
      if (recognition) recognition.stop()
      setIsRecording(false)
      onStop()
    }

    return () => {
      if (timer) clearInterval(timer)
      if (recognition) recognition.stop()
    }
  }, [isRecording, onTranscript, onStop, maxRecordingTime])

  return (
    <div className="flex-1 flex flex-col gap-2">
      <div
        className={cn(
          "flex items-center gap-2 p-3 border rounded-lg shadow-sm transition-all",
          error
            ? "bg-red-900/30 border-red-800 text-red-300"
            : "bg-gradient-to-r from-red-900/30 to-orange-900/30 border-orange-800/50 text-orange-300",
        )}
      >
        {error ? (
          <AlertCircle className="h-5 w-5 text-red-400" />
        ) : (
          <div className="relative">
            <Mic className="h-5 w-5 text-red-400" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          </div>
        )}

        <div className="flex-1">
          {error ? (
            <p className="text-sm font-medium text-red-400">{error}</p>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-200">{transcript || "Listening..."}</p>
              <div className="flex items-center gap-2 mt-1">
                <Progress value={(recordingTime / maxRecordingTime) * 100} className="h-1.5 bg-gray-700" />
                <span className="text-xs text-gray-400 min-w-[40px]">{recordingTime}s</span>
              </div>
            </>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsRecording(false)}
          className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-red-900/30 hover:text-red-400"
        >
          <StopCircle className="h-4 w-4 mr-2" />
          Stop
        </Button>
      </div>
    </div>
  )
}
