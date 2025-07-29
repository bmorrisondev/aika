import { useOrganization, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

// Import ThemedText and ThemedView components
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface TimeEntry {
  id: string;
  description: string;
  start_time: string;
  end_time: string | null;
  created_at: string;
  created_by?: string;
}

interface TimeEntryItemProps {
  item: TimeEntry;
  onUpdate?: (id: string, updates: Partial<TimeEntry>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

// Custom slow spinner component
function SlowSpinner() {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Create a continuous rotation animation
    const startRotation = () => {
      // Reset the value to 0 when starting
      spinValue.setValue(0);
      
      // Create the animation
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 3000, // Slower animation (3 seconds per rotation)
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => startRotation()); // When complete, run again
    };
    
    // Start the animation loop
    startRotation();
    
    // Cleanup function
    return () => {
      // This will stop any pending animations when component unmounts
      spinValue.stopAnimation();
    };
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={{
        transform: [{ rotate: spin }],
        width: 16,
        height: 16,
        borderWidth: 2,
        borderColor: '#2563EB',
        borderTopColor: 'transparent',
        borderRadius: 8,
      }}
    />
  );
}

export function TimeEntryItem({ item, onUpdate, onDelete }: TimeEntryItemProps) {
  const { user } = useUser();
  const { organization } = useOrganization();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editedDescription, setEditedDescription] = useState(item.description);
  const [startDate, setStartDate] = useState(new Date(item.start_time));
  const [endDate, setEndDate] = useState(item.end_time ? new Date(item.end_time) : null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [creatorName, setCreatorName] = useState<string | null>(null);
  
  // Track the text inputs separately from the actual date objects
  const [startDateText, setStartDateText] = useState('');
  const [endDateText, setEndDateText] = useState('');
  
  // Reset form state when modal is opened
  useEffect(() => {
    if (isModalVisible) {
      setEditedDescription(item.description);
      setStartDate(new Date(item.start_time));
      setEndDate(item.end_time ? new Date(item.end_time) : null);
      
      // Initialize text fields with formatted dates
      const formattedStartDate = formatDate(new Date(item.start_time).toISOString());
      const formattedStartTime = formatTime(new Date(item.start_time));
      setStartDateText(`${formattedStartDate} ${formattedStartTime}`);
      
      if (item.end_time) {
        const formattedEndDate = formatDate(new Date(item.end_time).toISOString());
        const formattedEndTime = formatTime(new Date(item.end_time));
        setEndDateText(`${formattedEndDate} ${formattedEndTime}`);
      } else {
        setEndDateText('');
      }
    }
  }, [isModalVisible, item.description, item.start_time, item.end_time]);
  
  // Format date to display in a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Format time to display in a readable format
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };
  
  // Initialize date text fields on component mount
  useEffect(() => {
    if (startDate) {
      setStartDateText(`${formatDate(startDate.toISOString())} ${formatTime(startDate)}`);
    }
    if (endDate) {
      setEndDateText(`${formatDate(endDate.toISOString())} ${formatTime(endDate)}`);
    }
  }, [startDate, endDate]);

  // Get creator name if created_by is available
  useEffect(() => {
    if (item.created_by) {
      // If the current user is the creator
      if (user && user.id === item.created_by) {
        setCreatorName('You');
      } else {
        organization?.getMemberships()
          .then((memberships) => {
            const member = memberships.data.find(m => m.publicUserData?.userId === item.created_by)
            setCreatorName(`${member?.publicUserData?.firstName} ${member?.publicUserData?.lastName} (${member?.publicUserData?.identifier})` || 'Another team member');
          })
      }
    } else {
      setCreatorName(null);
    }
  }, [item.created_by, user]);
  
  // Calculate duration between start and end time
  const calculateDuration = (start: string, end: string | null) => {
    if (!end) return 'In progress';
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime();
    
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    
    return `${hours}h${mins}m`;
  };
  
  // Handle saving changes
  const handleSave = async () => {
    if (!onUpdate) return;
    
    // Try to parse dates from text inputs before saving
    let validStartDate = startDate;
    let validEndDate = endDate;
    
    // Parse start date text
    try {
      const [datePart, timePart] = startDateText.split(' ');
      if (datePart && timePart) {
        const [month, day, year] = datePart.split('/');
        const [hours, minutes] = timePart.replace('AM', '').replace('PM', '').trim().split(':');
        
        if (month && day && year && hours && minutes) {
          const newDate = new Date();
          newDate.setFullYear(parseInt(year), parseInt(month) - 1, parseInt(day));
          
          let hrs = parseInt(hours);
          if (timePart.includes('PM') && hrs < 12) hrs += 12;
          if (timePart.includes('AM') && hrs === 12) hrs = 0;
          
          newDate.setHours(hrs, parseInt(minutes));
          validStartDate = newDate;
        }
      }
    } catch {
      // Use the existing startDate if parsing fails
    }
    
    // Parse end date text if it exists
    if (endDateText && endDate) {
      try {
        const [datePart, timePart] = endDateText.split(' ');
        if (datePart && timePart) {
          const [month, day, year] = datePart.split('/');
          const [hours, minutes] = timePart.replace('AM', '').replace('PM', '').trim().split(':');
          
          if (month && day && year && hours && minutes) {
            const newDate = new Date();
            newDate.setFullYear(parseInt(year), parseInt(month) - 1, parseInt(day));
            
            let hrs = parseInt(hours);
            if (timePart.includes('PM') && hrs < 12) hrs += 12;
            if (timePart.includes('AM') && hrs === 12) hrs = 0;
            
            newDate.setHours(hrs, parseInt(minutes));
            validEndDate = newDate;
          }
        }
      } catch {
        // Use the existing endDate if parsing fails
        console.error('Failed to parse end date');
      }
    }
    
    setIsSubmitting(true);
    try {
      await onUpdate(item.id, {
        description: editedDescription,
        start_time: validStartDate.toISOString(),
        end_time: validEndDate ? validEndDate.toISOString() : null,
      });
      setIsModalVisible(false);
    } catch (error) {
      console.error('Failed to update time entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle deleting the entry
  const handleDelete = async () => {
    if (!onDelete) return;
    
    setIsSubmitting(true);
    try {
      await onDelete(item.id);
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error deleting time entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <ThemedView style={styles.container}>
      {/* Row item */}
      <TouchableOpacity 
        style={styles.entryItem} 
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.7}
      >
        <ThemedView style={styles.entryContent}>
          <View style={styles.descriptionContainer}>
            <ThemedText type="defaultSemiBold" numberOfLines={1}>{item.description}</ThemedText>
            {organization && creatorName && (
              <ThemedText style={styles.creatorText}>{creatorName}</ThemedText>
            )}
          </View>
          {item.end_time ? (
            <ThemedText style={styles.durationText}>
              {calculateDuration(item.start_time, item.end_time)}
            </ThemedText>
          ) : (
            <View style={styles.inProgressContainer}>
              <SlowSpinner />
              <ThemedText style={styles.inProgressText}>In progress</ThemedText>
            </View>
          )}
        </ThemedView>
        <View style={styles.rightSection}>
          <ThemedText style={styles.dateText}>
            {formatDate(item.start_time)}
          </ThemedText>
          <Ionicons name="chevron-forward" size={16} color="#888" />
        </View>
      </TouchableOpacity>

      {/* Edit modal */}
      <Modal
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
        animationType="fade"
        transparent
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <ThemedView style={styles.modalContent}>
          <ThemedText style={styles.modalTitle}>Edit Time Entry</ThemedText>
          
          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Description</ThemedText>
            <TextInput
              style={styles.input}
              value={editedDescription}
              onChangeText={setEditedDescription}
              placeholder="What were you working on?"
              placeholderTextColor="#aaa"
            />
          </View>
          
          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Start Time</ThemedText>
            <TextInput
              style={styles.input}
              value={startDateText}
              onChangeText={(text) => {
                // Just update the text field without validation
                setStartDateText(text);
                
                // Try to parse the date but don't throw errors
                try {
                  const [datePart, timePart] = text.split(' ');
                  if (datePart && timePart) {
                    const [month, day, year] = datePart.split('/');
                    const [hours, minutes] = timePart.replace('AM', '').replace('PM', '').trim().split(':');
                    
                    if (month && day && year && hours && minutes) {
                      const newDate = new Date(startDate);
                      newDate.setFullYear(parseInt(year), parseInt(month) - 1, parseInt(day));
                      
                      let hrs = parseInt(hours);
                      if (timePart.includes('PM') && hrs < 12) hrs += 12;
                      if (timePart.includes('AM') && hrs === 12) hrs = 0;
                      
                      newDate.setHours(hrs, parseInt(minutes));
                      setStartDate(newDate);
                    }
                  }
                } catch {
                  // Silently fail - we'll use the previous valid date if parsing fails
                }
              }}
              placeholder="MM/DD/YYYY HH:MM AM/PM"
              placeholderTextColor="#aaa"
            />
          </View>
          
          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>End Time</ThemedText>
            {endDate ? (
              <TextInput
                style={styles.input}
                value={endDateText}
                onChangeText={(text) => {
                  // Just update the text field without validation
                  setEndDateText(text);
                  
                  // Try to parse the date but don't throw errors
                  try {
                    const [datePart, timePart] = text.split(' ');
                    if (datePart && timePart) {
                      const [month, day, year] = datePart.split('/');
                      const [hours, minutes] = timePart.replace('AM', '').replace('PM', '').trim().split(':');
                      
                      if (month && day && year && hours && minutes) {
                        const newDate = new Date(endDate);
                        newDate.setFullYear(parseInt(year), parseInt(month) - 1, parseInt(day));
                        
                        let hrs = parseInt(hours);
                        if (timePart.includes('PM') && hrs < 12) hrs += 12;
                        if (timePart.includes('AM') && hrs === 12) hrs = 0;
                        
                        newDate.setHours(hrs, parseInt(minutes));
                        setEndDate(newDate);
                      }
                    }
                  } catch {
                    // Silently fail - we'll use the previous valid date if parsing fails
                  }
                }}
                placeholder="MM/DD/YYYY HH:MM AM/PM"
                placeholderTextColor="#aaa"
              />
            ) : (
              <View style={styles.inProgressContainer}>
                <SlowSpinner />
                <ThemedText style={styles.inProgressText}>In progress</ThemedText>
              </View>
            )}
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => setIsModalVisible(false)}
              disabled={isSubmitting}
            >
              <ThemedText style={styles.buttonText}>Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.deleteButton]} 
              onPress={handleDelete}
              disabled={isSubmitting}
            >
              <ThemedText style={styles.buttonText}>Delete</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.saveButton]} 
              onPress={handleSave}
              disabled={isSubmitting}
            >
              <ThemedText style={styles.buttonText}>Save</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  modalContent: {
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  entryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
    backgroundColor: '#f7f7f7',
    padding: 8,
    marginVertical: 4,
    borderRadius: 6,
    gap: 3,
    alignItems: 'center'
  },
  entryContent: {
    gap: 4,
    alignItems: 'flex-start',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    flex: 1
  },
  dateText: {
    fontSize: 12,
    color: '#888',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  inProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EBF4FF', // Light blue background
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: 100,
  },
  inProgressText: {
    color: '#2563EB',
    fontWeight: '600',
    fontSize: 12,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    borderColor: '#ccc',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#555',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: '#2563EB',
  },
  deleteButton: {
    backgroundColor: '#DC2626',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 500,
    borderRadius: 8,
    overflow: 'hidden',
  },
  descriptionContainer: {
    gap: 2,
  },
  creatorText: {
    color: '#777',
    fontSize: 12,
  },
});
