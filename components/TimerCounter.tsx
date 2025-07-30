import { Ionicons } from '@expo/vector-icons'
import { useCallback, useEffect, useRef, useState } from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'

import { ThemedText } from './ThemedText'
import { ThemedView } from './ThemedView'

interface TimerCounterProps {
  isRunning: boolean
  description: string
  initialStartTime?: Date | null
  onStart: () => void
  onStop: () => void
}

export function TimerCounter({
  isRunning,
  description,
  initialStartTime,
  onStart,
  onStop,
}: TimerCounterProps) {
  const [elapsedTime, setElapsedTime] = useState(0)

  // We track the start time to calculate elapsed time
  const startTimeRef = useRef<Date | null>(null)

  // Track the last time we updated the elapsed time
  const lastUpdateRef = useRef<number>(0)

  // Timer interval reference
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Format elapsed time in HH:MM:SS format
  const formatElapsedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Start the timer counter
  const startTimerCounter = useCallback((startTime?: Date) => {
    const start = startTime || new Date()
    startTimeRef.current = start
    lastUpdateRef.current = Date.now()

    // Calculate initial elapsed time
    const now = new Date()
    const initialDiffInSeconds = Math.floor((now.getTime() - start.getTime()) / 1000)
    setElapsedTime(initialDiffInSeconds)

    // Clear any existing interval
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }

    // Set up the interval to update elapsed time every second
    const intervalId = setInterval(() => {
      if (startTimeRef.current) {
        // Use the current time for accurate timing
        const now = new Date()
        const diffInSeconds = Math.floor((now.getTime() - startTimeRef.current.getTime()) / 1000)

        setElapsedTime(diffInSeconds)
      }
    }, 500) // Update more frequently for better accuracy

    timerIntervalRef.current = intervalId
  }, [])

  // Stop the timer counter
  const stopTimerCounter = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
    setElapsedTime(0)
    startTimeRef.current = null
  }, [])

  // Initialize timer when component mounts or when isRunning changes
  useEffect(() => {
    if (isRunning && initialStartTime) {
      startTimerCounter(initialStartTime)
    } else if (!isRunning) {
      stopTimerCounter()
    }

    // Clean up timer interval when component unmounts
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
    }
  }, [isRunning, initialStartTime, startTimerCounter, stopTimerCounter])

  // Animated style for the progress indicator
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.card}>
        <ThemedView style={styles.content}>
          {/* Timer Description */}
          <ThemedText
            type="subtitle"
            style={styles.description}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {description}
          </ThemedText>

          {/* Timer Display */}
          <ThemedView style={styles.timerDisplay}>
            {/* Time Display */}
            <ThemedText type="defaultSemiBold" style={styles.timeText}>
              {formatElapsedTime(elapsedTime)}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Control Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            if (isRunning) {
              stopTimerCounter()
              onStop()
            } else {
              onStart()
            }
          }}
        >
          <ThemedView style={styles.buttonContent}>
            <Ionicons name="stop" size={24} color="#fff" />
          </ThemedView>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
    backgroundColor: 'transparent',
    width: '100%',
  },
  card: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#000',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 2,
  },
  content: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    flex: 1,
  },
  description: {
    textAlign: 'left',
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  timerDisplay: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginTop: 4,
    backgroundColor: 'transparent',
  },
  timeText: {
    fontSize: 28,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: '#fff',
  },
  button: {
    padding: 12,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1,
    backgroundColor: '#DC2626',
  },
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    color: '#fff',
  },
})