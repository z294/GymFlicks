// workoutPlan
// app/(modals)/workoutPlan.tsx

// displays the content that Gemini generated based on user selections.

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function WorkoutPlan() {
  const router = useRouter();
  const { workoutText } = useLocalSearchParams();
  const workoutContent = typeof workoutText === 'string' ? workoutText : 'No workout plan generated.';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Generated Workout</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.workoutText}>{workoutContent}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0F1C',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E2C', 
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#CECECE',
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#1E1E2C', 
  },
  closeButtonText: {
    color: '#0047AB', 
    fontSize: 16,
    fontWeight: '600',
  },
  contentContainer: {
    padding: 20,
    alignItems: 'flex-start',
  },
  workoutText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#F9F6EE', 
    textAlign: 'left', 
  },
});