import React from 'react';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth, useUser } from '@clerk/clerk-expo';

export default function SettingsScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Settings</ThemedText>
      </ThemedView>

      <ThemedView style={styles.contentContainer}>

        {/* User Information */}
        <ThemedText type="subtitle">User Information</ThemedText>
        <ThemedView style={styles.userContainer}>
          <ThemedView style={styles.userImageContainer}>
            <Image source={{ uri: user?.imageUrl || '' }} style={styles.userImage} />
          </ThemedView>
          <ThemedView style={styles.userInfoContainer}>
            <ThemedText type="defaultSemiBold">{user?.firstName} {user?.lastName}</ThemedText>
            <ThemedText>{user?.emailAddresses[0].emailAddress}</ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Sign Out Button */}
        <ThemedView style={styles.signOutButtonContainer}>
          <TouchableOpacity onPress={() => signOut()} >
            <ThemedText style={{ color: 'red' }}>Sign Out</ThemedText>
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 16
  },
  contentContainer: {
    gap: 12,
    marginBottom: 24,
    borderRadius: 8,
    padding: 16,
    width: '100%',
    height: 150,
    paddingHorizontal: 16
  },
  userContainer: {
    gap: 4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    padding: 8,
    borderRadius: 8,
  },
  userInfoContainer: {
    marginLeft: 12,
    flex: 1,
    backgroundColor: 'transparent',
  },
  userImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 100,
    backgroundColor: 'transparent'
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 100,
    backgroundColor: 'transparent'
  },
  signOutButtonContainer: {
    gap: 4,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#ffebee',
    justifyContent: 'center',
  },
});