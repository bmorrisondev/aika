import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth, useOrganization, useOrganizationList, useUser } from '@clerk/clerk-expo';
import { UserOrganizationInvitationResource } from '@clerk/types';

import { InvitationModal } from '@/components/InvitationModal';
import { OrganizationSwitcherModal } from '@/components/OrganizationSwitcherModal';

export default function SettingsScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();

    // Get the list of organizations the user is a member of and any invitations they have
  // Note: The `useOrganizationList` function requires that you specify what's included in the response
  const {
    userMemberships,
    userInvitations,
    setActive
  } = useOrganizationList({ userMemberships: true, userInvitations: true });

  // Get the active organization
  const { organization } = useOrganization();

  // A state object to control the visibility of the organization selection modal (will be added next)
  const [modalVisible, setModalVisible] = useState(false);
  const [ selectedInvitation, setSelectedInvitation ] = useState<UserOrganizationInvitationResource | null>(null);
  const [ isInvitationModalVisible, setIsInvitationModalVisible ] = useState(false);

  const handleInvitationComplete = () => {
    setSelectedInvitation(null);
  };

  const handleOpenInvitation = async (invitation: UserOrganizationInvitationResource) => {
    try {
      setSelectedInvitation(invitation);
      setModalVisible(false);
      setIsInvitationModalVisible(true);
    } catch (error) {
      console.error('Error setting active organization:', error);
    }
  };

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

        <ThemedText type="subtitle">Organization</ThemedText>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <ThemedView style={styles.organizationContainer}>
            <ThemedView style={styles.organizationImageContainer}>
              <Image source={{ uri: organization?.imageUrl || user?.imageUrl || '' }} style={styles.organizationImage} />
            </ThemedView>
            <ThemedView style={styles.organizationInfoContainer}>
              <ThemedText type="defaultSemiBold">{organization?.name || 'Personal account'}</ThemedText>
              <ThemedText>{organization?.slug || 'No organization'}</ThemedText>
            </ThemedView>
            <Ionicons name="chevron-forward" size={24} color="#888" />
          </ThemedView>
        </TouchableOpacity>


        <OrganizationSwitcherModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          userInvitations={userInvitations}
          userMemberships={userMemberships}
          organization={organization}
          user={user}
          handleOpenInvitation={handleOpenInvitation}
          setActive={setActive}
        />

        <InvitationModal
          isVisible={isInvitationModalVisible}
          onClose={() => setIsInvitationModalVisible(false)}
          selectedInvitation={selectedInvitation}
          user={user}
          setActive={setActive}
          onComplete={handleInvitationComplete}
        />

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
  organizationContainer: {
    gap: 4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    padding: 8,
    borderRadius: 8,
    justifyContent: 'space-between',
  },
  organizationInfoContainer: {
    marginLeft: 12,
    flex: 1,
    backgroundColor: 'transparent',
  },
  organizationImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: 'transparent'
  },
  organizationImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: 'transparent'
  },
});