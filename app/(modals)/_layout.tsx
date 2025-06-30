// layout for (modals)

import { Stack } from 'expo-router';

export default function ModalLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'modal',
      }}
    >
      <Stack.Screen name="AddFriendScreen" />
      <Stack.Screen name="CreateFlickScreen" />
      <Stack.Screen name="CreateWorkoutScreen" />
      <Stack.Screen name="WorkoutPlan" />
    </Stack>
  );
}
