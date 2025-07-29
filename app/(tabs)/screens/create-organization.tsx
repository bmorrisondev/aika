import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useOrganizationList } from '@clerk/clerk-expo';

export default function CreateOrganizationScreen() {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Function to generate slug from name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters except whitespace and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
  };

  // Update slug when name changes
  const handleNameChange = (text: string) => {
    setName(text);
    setSlug(generateSlug(text));
  };

  // Using the Clerk Expo SDK helper function to create an organization and set it as active
  const { createOrganization, setActive } = useOrganizationList({ userMemberships: true });

  // Function to reset the form state
  const resetForm = () => {
    setName('');
    setSlug('');
    setError('');
    setIsLoading(false);
  };

  const handleCreateOrganization = async () => {
    if (!name.trim()) {
      setError('Organization name is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (createOrganization) {
        const organization = await createOrganization({
          name: name.trim(),
          slug: slug.trim() || undefined // Use the provided slug or let Clerk generate one
        });

        // Reset the form state
        resetForm();

        // Set the active organization
        setActive({ organization: organization.id });

        // Navigate to the add members screen with the new organization ID
        router.push('/screens/add-organization-members');
      }
    } catch (error) {
      console.error('Error creating organization:', error);
      setError('Failed to create organization. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <ThemedText type="title">Create Organization</ThemedText>
      </ThemedView>

      <ThemedView style={styles.content}>
        <ThemedView style={styles.inputContainer}>
          <ThemedText type="subtitle">Organization Name *</ThemedText>
          <TextInput
            value={name}
            onChangeText={handleNameChange}
            placeholder="Enter organization name"
            style={styles.input}
          />
        </ThemedView>

        <ThemedView style={styles.inputContainer}>
          <ThemedText type="subtitle">Organization Slug (optional)</ThemedText>
          <ThemedText style={styles.helpText}>
            The slug will be used in URLs and must be unique. If not provided, one will be generated.
          </ThemedText>
          <TextInput
            value={slug}
            onChangeText={(text: string) => setSlug(text.toLowerCase().replace(/\s+/g, '-'))}
            placeholder="your-organization-slug"
            style={styles.input}
          />
        </ThemedView>

        {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}

        <TouchableOpacity
          style={[styles.nextButton, (!name.trim() || isLoading) && styles.disabledButton]}
          onPress={handleCreateOrganization}
          disabled={!name.trim() || isLoading}
        >
          <ThemedText style={styles.nextButtonText}>
            {isLoading ? 'Creating...' : 'Next'}
          </ThemedText>
        </TouchableOpacity>
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
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  nextButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  nextButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#BDBDBD',
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
  },
});