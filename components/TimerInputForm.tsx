import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity } from 'react-native';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface TimerInputFormProps {
  description: string;
  onDescriptionChange: (text: string) => void;
  onStartTimer: () => void;
}

export function TimerInputForm({ 
  description, 
  onDescriptionChange, 
  onStartTimer 
}: TimerInputFormProps) {
  const [isInputFocused, setIsInputFocused] = useState(false);

  return (
    <ThemedView style={styles.formContent}>
      <ThemedText type="defaultSemiBold" style={styles.formLabel}>What are you working on?</ThemedText>
      <ThemedView style={styles.inputContainer}>
        <TextInput
          style={[styles.input, isInputFocused && styles.inputFocused]}
          value={description}
          onChangeText={onDescriptionChange}
          placeholder="Enter task description"
          placeholderTextColor="#aaa"
          selectionColor="#4f83cc"
          cursorColor="#4f83cc"
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
        />
        <TouchableOpacity 
          style={styles.button}
          onPress={onStartTimer}
        >
          <ThemedView style={styles.buttonContent}>
            <Ionicons name="play" size={24} color="#fff" />
          </ThemedView>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  formContent: {
    gap: 8,
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 8,
  },
  inputContainer: {
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: 'transparent'
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 12,
    backgroundColor: '#222',
    color: '#fff',
    flex: 1,
  },
  inputFocused: {
    borderColor: '#4f83cc',
    borderWidth: 1,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    color: '#fff',
  },
  button: {
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 100,
  },
  formLabel: {
    color: '#fff',
    marginBottom: 8,
  },
});
