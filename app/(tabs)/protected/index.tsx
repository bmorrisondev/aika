import React, { useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { TimeEntryItem } from '@/components/TimeEntryItem';
import { TimerCounter } from '@/components/TimerCounter';
import { TimerInputForm } from '@/components/TimerInputForm';
import { createSupabaseClerkClient } from '@/utils/supabase';
import { useAuth, useUser } from '@clerk/clerk-expo';

interface TimeEntry {
  id: string;
  description: string;
  start_time: string;
  end_time: string | null;
  created_at: string;
}

export default function HomeScreen() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [description, setDescription] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  // We track the start time to calculate elapsed time
  const startTimeRef = useRef<Date | null>(null);
  // Track the last time we updated the elapsed time
  const lastUpdateRef = useRef<number>(0);
  
  // Timer interval reference
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const supabase = createSupabaseClerkClient(getToken());
  
  // Stop the timer counter
  const stopTimerCounter = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setElapsedTime(0);
    startTimeRef.current = null;
  };
  
  // Start the timer counter
  const startTimerCounter = (initialStartTime?: Date) => {
    const start = initialStartTime || new Date();
    startTimeRef.current = start;
    lastUpdateRef.current = Date.now();
    
    // Calculate initial elapsed time
    const now = new Date();
    const initialDiffInSeconds = Math.floor((now.getTime() - start.getTime()) / 1000);
    setElapsedTime(initialDiffInSeconds);
    
    // Clear any existing interval
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    // Set up the interval to update elapsed time every second
    const intervalId = setInterval(() => {
      if (startTimeRef.current) {
        // Use the current time for accurate timing
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - startTimeRef.current.getTime()) / 1000);
        
        // Only update if the time has actually changed
        if (diffInSeconds !== elapsedTime) {
          setElapsedTime(diffInSeconds);
        }
      }
    }, 500); // Update more frequently for better accuracy

    timerIntervalRef.current = intervalId;
  };

  // Function to fetch time entries from Supabase
  const fetchTimeEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .order('start_time', { ascending: false });

      if (error) {
        console.error('Error fetching time entries:', error);
        return;
      }

      setTimeEntries(data || []);
      
      // Check if there's an active timer (entry without end_time)
      const activeEntry = data?.find(entry => !entry.end_time);
      if (activeEntry) {
        setIsTimerRunning(true);
        setCurrentEntryId(activeEntry.id);
        setDescription(activeEntry.description);
        
        // Start the timer counter with the saved start time
        const startDate = new Date(activeEntry.start_time);
        startTimerCounter(startDate);
      }
    } catch (error) {
      console.error('Error fetching time entries:', error);
    }
  }

  // Function to update a time entry
  const updateTimeEntry = async (id: string, updates: Partial<TimeEntry>) => {
    try {
      const { error } = await supabase
        .from('time_entries')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Error updating time entry:', error);
        return;
      }

      // Refresh the time entries list
      fetchTimeEntries();
    } catch (error) {
      console.error('Error updating time entry:', error);
    }
  };

  // Function to delete a time entry
  const deleteTimeEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting time entry:', error);
        return;
      }

      // Refresh the time entries list
      fetchTimeEntries();
    } catch (error) {
      console.error('Error deleting time entry:', error);
    }
  };

  // Start a new timer
  const startTimer = async () => {
    if (!description.trim()) {
      alert('Please enter what you are working on');
      return;
    }

    try {
      const startDate = new Date();
      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          description: description.trim(),
          start_time: startDate.toISOString(),
          owner_id: user?.id,
        })
        .select();

      if (error) {
        console.error('Error starting timer:', error);
        return;
      }

      if (data && data[0]) {
        setIsTimerRunning(true);
        setCurrentEntryId(data[0].id);
        startTimerCounter(startDate);
        fetchTimeEntries();
      }
    } catch (error) {
      console.error('Error in startTimer:', error);
    }
  };

  // Stop the current timer
  const stopTimer = async () => {
    if (!currentEntryId) return;

    try {
      const { error } = await supabase
        .from('time_entries')
        .update({ end_time: new Date().toISOString() })
        .eq('id', currentEntryId);

      if (error) {
        console.error('Error stopping timer:', error);
        return;
      }

      setIsTimerRunning(false);
      setCurrentEntryId(null);
      setDescription('');
      stopTimerCounter();
      fetchTimeEntries();
    } catch (error) {
      console.error('Error in stopTimer:', error);
    }
  };

  // Update the elapsed time even when the app is in background
  useEffect(() => {
    if (isTimerRunning && startTimeRef.current) {
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - startTimeRef.current.getTime()) / 1000);
      setElapsedTime(diffInSeconds);
    }
  }, [isTimerRunning]);

  // Fetch time entries when component mounts
  useEffect(() => {
    fetchTimeEntries();

    // Clean up timer interval when component unmounts
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">⏳ Aika Timer</ThemedText>
      </ThemedView>

      {/* Timer Form */}
      <ThemedView style={styles.formContainer}>
        {!isTimerRunning ? (
          <TimerInputForm
            description={description}
            onDescriptionChange={setDescription}
            onStartTimer={startTimer}
          />
        ) : (
          <TimerCounter
            isRunning={isTimerRunning}
            description={description}
            elapsedTime={elapsedTime}
            onStart={startTimer}
            onStop={stopTimer}
          />
        )}
      </ThemedView>

      {/* Time Entries List */}
      <ThemedView style={styles.entriesContainer}>
        <ThemedText type="subtitle" style={styles.entriesTitle}>
          Previous Work Logs
        </ThemedText>
        {timeEntries.length === 0 ? (
          <ThemedText style={styles.emptyText}>
            No work logs yet. Start tracking your time!
          </ThemedText>
        ) : (
          <FlatList
            data={timeEntries}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TimeEntryItem
                item={item}
                onUpdate={updateTimeEntry}
                onDelete={deleteTimeEntry}
              />
            )}
            style={styles.list}
            scrollEnabled={true}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.listContentContainer}
          />
        )}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 16
  },
  formContainer: {
    gap: 12,
    marginBottom: 24,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 150,
    paddingHorizontal: 16
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
    color: '#666',
  },
  entriesContainer: {
    gap: 12,
    flex: 1,
  },
  list: {
    paddingHorizontal: 16
  },
  listContentContainer: {
    flexGrow: 1,
    paddingBottom: 16
  },
  entriesTitle: {
    paddingHorizontal: 16
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#888',
    marginTop: 8,
    paddingHorizontal: 16
  },
  signOutButton: {
    backgroundColor: '#64748B',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  container: {
    flex: 1,
    paddingTop: 16,
  },
  contentContainer: {
    padding: 16,
  },
});
