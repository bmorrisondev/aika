import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Image, Modal, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface Props {
  isVisible: boolean;
  onClose: () => void;
  selectedInvitation: any | null;
  user: any | null | undefined;
  setActive?: (params: { organization: string | null }) => Promise<void>;
  onComplete?: () => void;
}

export function InvitationModal({
  isVisible,
  onClose,
  selectedInvitation,
  user,
  setActive,
  onComplete
}: Props) {

  // Handle accepting an invitation and set the active organization
  const handleAcceptInvitation = async () => {
    try {
      if (!selectedInvitation) return;
      await selectedInvitation?.accept();
      onClose();
      if (setActive) {
        await setActive({ organization: selectedInvitation?.publicOrganizationData.id });
      }
      if (onComplete) {
        onComplete();
      }
      router.replace('/protected');
    } catch (error) {
      console.error('Error accepting invitation:', error);
    }
  };

  // Handle skipping an invitation
  const handleSkipInvitation = async () => {
    try {
      onClose();
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error skipping invitation:', error);
    }
  };
  return (
    <Modal visible={isVisible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <ThemedView style={styles.modalContent}>
          <ThemedView style={styles.modalHeader}>
            <ThemedText type="subtitle">Accept Invitation</ThemedText>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#888" />
            </TouchableOpacity>
          </ThemedView>
          <ThemedView style={styles.modalBody}>
            <ThemedView style={styles.invitationDetails}>
              <ThemedView style={styles.orgImageContainer}>
                <Image
                  source={{
                    uri: selectedInvitation?.publicOrganizationData.imageUrl || user?.imageUrl || ''
                  }}
                  style={styles.orgImage}
                />
              </ThemedView>
              <ThemedView style={styles.invitationTextContainer}>
                <ThemedText type="defaultSemiBold" style={styles.orgName}>
                  {selectedInvitation?.publicOrganizationData.name}
                </ThemedText>
                <ThemedText style={styles.orgSlug}>
                  {selectedInvitation?.publicOrganizationData.slug}
                </ThemedText>
              </ThemedView>
            </ThemedView>
            <ThemedText style={styles.invitationMessage}>
              You&apos;ve been invited to join this organization. Would you like to accept?
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.modalFooter}>
            <TouchableOpacity style={styles.rejectButton} onPress={handleSkipInvitation}>
              <ThemedText style={{ color: '#fff' }}>Not now</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptInvitation}>
              <ThemedText style={{ color: '#fff' }}>Accept</ThemedText>
            </TouchableOpacity>
          </ThemedView>
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
  modalBody: {
    padding: 16,
  },
  invitationDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  orgImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 16,
  },
  orgImage: {
    width: 60,
    height: 60,
  },
  invitationTextContainer: {
    flex: 1,
  },
  orgName: {
    fontSize: 18,
    marginBottom: 4,
  },
  orgSlug: {
    opacity: 0.7,
  },
  invitationMessage: {
    marginTop: 8,
    lineHeight: 22,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  rejectButton: {
    backgroundColor: '#f44336',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
});