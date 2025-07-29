import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { FlatList, Image, Modal, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface Props {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  userInvitations: { data?: any[] } | null | undefined;
  userMemberships: { data?: any[] } | null | undefined;
  organization: any | null | undefined;
  user: any | null | undefined;
  handleOpenInvitation: (invitation: any) => void;
  setActive?: (params: { organization: string | null }) => Promise<void>;
}

export function OrganizationSwitcherModal({
  modalVisible,
  setModalVisible,
  userInvitations,
  userMemberships,
  organization,
  user,
  handleOpenInvitation,
  setActive
}: Props) {

  // When the user selects an organization, use the parent component to set the active organization then redirect to the home screen
  const handleSelectOrganization = async (orgId: string) => {
    try {
      if (setActive) {
        if(orgId === 'personal-account') {
          await setActive({ organization: null });
        } else {
          await setActive({ organization: orgId });
        }
        setModalVisible(false);
        router.replace('/protected');
      }
    } catch (error) {
      console.error('Error setting active organization:', error);
    }
  };

  // When the user clicks the "Create New Organization" button, close the modal and navigate to the create organization screen
  const handleCreateOrganization = () => {
    // Close the modal first
    setModalVisible(false);
    // Navigate to the create organization screen
    router.push('/screens/create-organization');
  };
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <ThemedView style={styles.modalContent}>
          <ThemedView style={styles.modalHeader}>
            <ThemedText type="subtitle">Select Organization</ThemedText>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#888" />
            </TouchableOpacity>
          </ThemedView>

          {/* Pending Invitations */}
          {(userInvitations?.data?.length || 0) > 0 && (
            <ThemedView style={styles.sectionContainer}>
              <ThemedView style={styles.sectionHeader}>
                <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Pending Invitations</ThemedText>
                <ThemedView style={styles.badge}>
                  <ThemedText style={styles.badgeText}>{userInvitations?.data?.length}</ThemedText>
                </ThemedView>
              </ThemedView>
              <FlatList
                data={userInvitations?.data || []}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.invitationItem]}
                    onPress={() => handleOpenInvitation(item)}
                  >
                    <ThemedView style={styles.orgItemImageContainer}>
                      <Image source={{ uri: item.publicOrganizationData.imageUrl || user?.imageUrl || '' }} style={styles.orgItemImage} />
                    </ThemedView>
                    <ThemedView style={styles.orgItemInfoContainer}>
                      <ThemedText type="defaultSemiBold">{item.publicOrganizationData.name}</ThemedText>
                      <ThemedText>{item.publicOrganizationData.slug}</ThemedText>
                    </ThemedView>
                    <Ionicons name="mail-outline" size={24} color="#2196F3" />
                  </TouchableOpacity>
                )}
              />
              <ThemedView style={styles.divider} />
            </ThemedView>
          )}

          {/* Your Organizations */}
          <ThemedView style={styles.sectionContainer}>
            <ThemedView style={styles.sectionHeader}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Your Organizations</ThemedText>
            </ThemedView>

            <FlatList
              data={[
                // Personal account always at the top
                { isPersonal: true, id: 'personal-account', organization: null },
                ...(userMemberships?.data || []).map(membership => ({
                  isPersonal: false,
                  id: membership.organization.id,
                  organization: membership.organization
                }))
              ]}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                // Handle personal account special case
                if (item.isPersonal) {
                  return (
                    <TouchableOpacity
                      style={[styles.organizationItem, organization?.id === undefined && styles.activeOrganization]}
                      onPress={() => handleSelectOrganization(item.id)}
                    >
                      <ThemedView style={styles.orgItemImageContainer}>
                        <Image source={{ uri: user?.imageUrl || '' }} style={styles.orgItemImage} />
                      </ThemedView>
                      <ThemedView style={styles.orgItemInfoContainer}>
                        <ThemedText type="defaultSemiBold">Personal account</ThemedText>
                        <ThemedText>{user?.username || user?.emailAddresses[0].emailAddress}</ThemedText>
                      </ThemedView>
                      {organization?.id === undefined && (
                        <Ionicons name="checkmark" size={24} color="#4CAF50" />
                      )}
                    </TouchableOpacity>
                  );
                }

                // Regular organization item
                return (
                  <TouchableOpacity
                    style={[styles.organizationItem, item.id === organization?.id && styles.activeOrganization]}
                    onPress={() => handleSelectOrganization(item.id)}
                  >
                    <ThemedView style={styles.orgItemImageContainer}>
                      <Image source={{ uri: item.organization?.imageUrl || user?.imageUrl || '' }} style={styles.orgItemImage} />
                    </ThemedView>
                    <ThemedView style={styles.orgItemInfoContainer}>
                      <ThemedText type="defaultSemiBold">{item.organization?.name}</ThemedText>
                      <ThemedText>{item.organization?.slug}</ThemedText>
                    </ThemedView>
                    {item.id === organization?.id && (
                      <Ionicons name="checkmark" size={24} color="#4CAF50" />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </ThemedView>

          {/* Add a button to create a new organization */}
          {/* This will direct them to app/screens/create-organization */}
          <TouchableOpacity style={styles.createOrgButton} onPress={handleCreateOrganization}>
            <Ionicons name="add-circle-outline" size={24} color="#fff" />
            <ThemedText style={styles.createOrgButtonText}>Create New Organization</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    marginRight: 8,
  },
  badge: {
    backgroundColor: '#2196F3',
    borderRadius: 100,
    paddingHorizontal: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 8,
  },
  invitationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f7f7f7',
  },
  organizationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f7f7f7',
  },
  activeOrganization: {
    backgroundColor: '#e3f2fd',
  },
  orgItemImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    overflow: 'hidden',
  },
  orgItemImage: {
    width: 40,
    height: 40,
  },
  orgItemInfoContainer: {
    marginLeft: 12,
    flex: 1,
    backgroundColor: 'transparent'
  },
  createOrgButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
  },
  createOrgButtonText: {
    color: 'white',
    marginLeft: 8,
  },
});