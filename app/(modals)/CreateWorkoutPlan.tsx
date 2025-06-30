// createWorkoutPlan screen
// app/(modals)/createWorkoutPlan.tsx

// this page is the first page that the user sees when attempting to create
// a workout plan via Gemini AI. 
// this page will prompt the user for the msuscle group they want to work out 
// and the level of intensity

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { GenerateGymWorkout } from '@/features/gemini/GenerateGymWorkout';

const MUSCLES = ['Chest', 'Back', 'Legs', 'Arms', 'Shoulders', 'Core', 'Glutes'];
const INTENSITY_LEVELS = ['Low', 'Medium', 'High'];

export default function CreateWorkoutPlan() {
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [intensity, setIntensity] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggleMuscle = (muscle: string) => {
    if (selectedMuscles.includes(muscle)) {
      setSelectedMuscles(selectedMuscles.filter((m) => m !== muscle));
    } else {
      setSelectedMuscles([...selectedMuscles, muscle]);
    }
  };

  const handleCreatePlan = async () => {
    if (selectedMuscles.length === 0) {
      Alert.alert('Missing Info', 'Select at least one muscle group.');
      return;
    }

    if (!intensity) {
      Alert.alert('Missing Info', 'Please choose an intensity level.');
      return;
    }

    setLoading(true);

    try {
      const preferences = {
        level: intensity.toLowerCase() as 'low' | 'medium' | 'high', 
        focusAreas: selectedMuscles,
      };
      const workoutText = await GenerateGymWorkout(preferences);

      // passed all check -> displays the Gemini generated workout plan on the workoutPlan screen
      router.push({
        pathname: '/WorkoutPlan', 
        params: { workoutText: workoutText },
      });

    } catch (error: any) {
      console.error("Error generating workout plan:", error);
      Alert.alert('Error', `Failed to generate workout plan: ${error.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create Workout Plan</Text>

        <View style={styles.formInput}>
          <Text style={styles.inputLabel}>Muscles to Target</Text>
          <View style={styles.tagContainer}>
            {MUSCLES.map((muscle) => (
              <TouchableOpacity
                key={muscle}
                style={[
                  styles.tagButton,
                  selectedMuscles.includes(muscle) && styles.tagButtonSelected,
                ]}
                onPress={() => toggleMuscle(muscle)}
              >
                <Text
                  style={[
                    styles.tagText,
                    selectedMuscles.includes(muscle) && styles.tagTextSelected,
                  ]}
                >
                  {muscle}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formInput}>
          <Text style={styles.inputLabel}>Intensity Level</Text>
          <View style={styles.tagContainer}>
            {INTENSITY_LEVELS.map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.tagButton,
                  intensity === level && styles.tagButtonSelected,
                ]}
                onPress={() => setIntensity(level)}
              >
                <Text
                  style={[
                    styles.tagText,
                    intensity === level && styles.tagTextSelected,
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formAction}>
          <TouchableOpacity
            style={styles.formButton}
            onPress={handleCreatePlan}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#F9F6EE" />
            ) : (
              <Text style={styles.buttonText}>Generate Plan</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0F1C',
  },
  container: {
    padding: 24,
    backgroundColor: '#0A0F1C',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 30,
    color: '#CECECE',
  },
  formInput: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#CECECE',
    marginBottom: 8,
  },
  inputText: {
    backgroundColor: '#1E1E2C',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    fontSize: 15,
    fontWeight: '500',
    color: '#F9F6EE',
    borderWidth: 1,
    borderColor: '#333',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tagButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#1E1E2C',
  },
  tagButtonSelected: {
    backgroundColor: '#0047AB',
    borderColor: '#0047AB',
  },
  tagText: {
    fontSize: 14,
    color: '#CECECE',
    fontWeight: '500',
  },
  tagTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  formAction: {
    marginTop: 30,
  },
  formButton: {
    backgroundColor: '#0047AB',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F9F6EE',
  },
});