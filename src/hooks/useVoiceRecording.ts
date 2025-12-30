'use client'

import { useState, useRef, useCallback } from 'react'

interface UseVoiceRecordingOptions {
  onTranscription?: (text: string) => void
  onError?: (error: string) => void
}

interface VoiceRecordingState {
  isRecording: boolean
  isTranscribing: boolean
  error: string | null
  audioLevel: number
}

export function useVoiceRecording(options: UseVoiceRecordingOptions = {}) {
  const { onTranscription, onError } = options

  const [state, setState] = useState<VoiceRecordingState>({
    isRecording: false,
    isTranscribing: false,
    error: null,
    audioLevel: 0,
  })

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  const updateAudioLevel = useCallback(() => {
    if (!analyserRef.current) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)

    // Calculate average volume
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length
    const normalizedLevel = Math.min(average / 128, 1) // Normalize to 0-1

    setState(prev => ({ ...prev, audioLevel: normalizedLevel }))

    if (state.isRecording) {
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel)
    }
  }, [state.isRecording])

  const startRecording = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null }))

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      })

      streamRef.current = stream

      // Set up audio analysis for visual feedback
      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser

      // Determine best supported format
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4'

      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.start(100) // Collect data every 100ms
      setState(prev => ({ ...prev, isRecording: true }))

      // Start audio level monitoring
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to access microphone'
      setState(prev => ({ ...prev, error: errorMessage }))
      onError?.(errorMessage)
    }
  }, [updateAudioLevel, onError])

  const stopRecording = useCallback(async () => {
    if (!mediaRecorderRef.current || !streamRef.current) return

    return new Promise<string>((resolve, reject) => {
      const mediaRecorder = mediaRecorderRef.current!

      mediaRecorder.onstop = async () => {
        // Stop audio level monitoring
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }

        // Stop all tracks
        streamRef.current?.getTracks().forEach(track => track.stop())

        setState(prev => ({
          ...prev,
          isRecording: false,
          isTranscribing: true,
          audioLevel: 0,
        }))

        try {
          // Create audio blob
          const audioBlob = new Blob(audioChunksRef.current, {
            type: mediaRecorder.mimeType,
          })

          // Send to transcription API
          const formData = new FormData()
          // OpenAI Whisper expects certain file extensions
          const extension = mediaRecorder.mimeType.includes('webm') ? 'webm' : 'm4a'
          formData.append('audio', audioBlob, `recording.${extension}`)

          const response = await fetch('/api/voice/transcribe', {
            method: 'POST',
            body: formData,
          })

          if (!response.ok) {
            throw new Error('Transcription failed')
          }

          const result = await response.json()

          setState(prev => ({ ...prev, isTranscribing: false }))
          onTranscription?.(result.text)
          resolve(result.text)
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Transcription failed'
          setState(prev => ({
            ...prev,
            isTranscribing: false,
            error: errorMessage,
          }))
          onError?.(errorMessage)
          reject(error)
        }
      }

      mediaRecorder.stop()
    })
  }, [onTranscription, onError])

  const cancelRecording = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop()
    }

    streamRef.current?.getTracks().forEach(track => track.stop())

    setState(prev => ({
      ...prev,
      isRecording: false,
      isTranscribing: false,
      audioLevel: 0,
    }))
  }, [state.isRecording])

  return {
    ...state,
    startRecording,
    stopRecording,
    cancelRecording,
  }
}
