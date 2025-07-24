import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface TimerCounterProps {
  isRunning: boolean;
  description: string;
  elapsedTime: number;
  onStart: () => void;
  onStop: () => void;
}

export function TimerCounter({ 
  isRunning, 
  description, 
  elapsedTime, 
  onStart, 
  onStop 
}: TimerCounterProps) {
  
  // Format elapsed time in HH:MM:SS format
  const formatElapsedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Animated style for the progress indicator
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.card}>
        <ThemedView style={styles.content}>
          {/* Timer Description */}
          <ThemedText type="subtitle" style={styles.description} numberOfLines={1} ellipsizeMode="tail">
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
              onStop();
            } else {
              onStart();
            }
          }}
        >
          <ThemedView style={styles.buttonContent}>
            <Ionicons name="stop" size={24} color="#fff" /> 
          </ThemedView>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
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
    gap: 2
  },
  content: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    flex: 1
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
  }
});
