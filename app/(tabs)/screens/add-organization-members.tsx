import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useOrganization } from '@clerk/clerk-expo';

interface MemberEmail {
  id: string;
  email: string;
}

export default function AddOrganizationMembersScreen() {
  const [emails, setEmails] = useState<MemberEmail[]>([]);
  const [currentEmail, setCurrentEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { organization } = useOrganization();

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleAddEmail = () => {
    if (!currentEmail.trim()) return;

    if (!isValidEmail(currentEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    // Check if email already exists in the list
    if (emails.some(item => item.email.toLowerCase() === currentEmail.toLowerCase())) {
      setError('This email has already been added');
      return;
    }

    setEmails([...emails, { id: Date.now().toString(), email: currentEmail.trim() }]);
    setCurrentEmail('');
    setError('');
  };

  const handleRemoveEmail = (id: string) => {
    setEmails(emails.filter(email => email.id !== id));
  };

  const handleInviteMembers = async () => {
    if (emails.length === 0) {
      setError('Please add at least one email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (organization) {
        // Invite members using the Clerk Expo SDK
        await organization.inviteMembers({
          emailAddresses: emails.map(e => e.email),
          role: 'org:member'
        });

        // Navigate back to the home screen
        router.replace('/protected');
      } else {
        throw new Error('Organization not found');
      }
    } catch (error) {
      console.error('Error inviting members:', error);
      setError('Failed to invite members. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    // Navigate back to home screen without inviting anyone
    router.replace('/protected');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <ThemedText type="title">Add Members</ThemedText>
      </ThemedView>

      <ThemedView style={styles.content}>
        <ThemedText type="subtitle">Invite members to your organization</ThemedText>
        <ThemedText style={styles.helpText}>
          Enter email addresses of people you&apos;d like to invite to your organization.
        </ThemedText>

        <ThemedView style={styles.inputContainer}>
          <ThemedView style={styles.emailInputRow}>
            <TextInput
              value={currentEmail}
              onChangeText={(text: string) => {
                setCurrentEmail(text);
                if (error) setError('');
              }}
              placeholder="Enter email address"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              onSubmitEditing={handleAddEmail}
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddEmail}
              disabled={!currentEmail.trim()}
            >
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </ThemedView>

          {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}
        </ThemedView>

        <ThemedView style={styles.emailListContainer}>
          <FlatList
            data={emails}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ThemedView style={styles.emailItem}>
                <ThemedText>{item.email}</ThemedText>
                <TouchableOpacity onPress={() => handleRemoveEmail(item.id)}>
                  <Ionicons name="close-circle" size={20} color="#888" />
                </TouchableOpacity>
              </ThemedView>
            )}
            ListEmptyComponent={
              <ThemedView style={styles.emptyList}>
                <ThemedText style={styles.emptyListText}>No members added yet</ThemedText>
              </ThemedView>
            }
          />
        </ThemedView>

        <ThemedView style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            disabled={isLoading}
          >
            <ThemedText style={styles.skipButtonText}>Skip</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.inviteButton, isLoading && styles.disabledButton]}
            onPress={handleInviteMembers}
            disabled={emails.length === 0 || isLoading}
          >
            <ThemedText style={styles.inviteButtonText}>
              {isLoading ? 'Inviting...' : 'Invite Members'}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    marginRight: 16,
  },
  content: {
    padding: 16,
    flex: 1,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  emailInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
  },
  addButton: {
    backgroundColor: '#2196F3',
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  emailListContainer: {
    flex: 1,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 8,
  },
  emailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  emptyList: {
    padding: 24,
    alignItems: 'center',
  },
  emptyListText: {
    color: '#888',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  skipButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flex: 1,
    marginRight: 8,
  },
  skipButtonText: {
    fontWeight: '600',
  },
  inviteButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    flex: 2,
  },
  inviteButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#BDBDBD',
  },
  errorText: {
    color: 'red',
    marginTop: 8,
  },
});