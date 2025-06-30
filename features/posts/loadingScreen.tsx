// loading screen 
// features/posts/loadingScreen.tsx
// screen is shown when waiting for the post to be uploaded to firebase


import React from 'react';
import { Text, ActivityIndicator, StyleSheet, SafeAreaView } from 'react-native';

type LoadingScreenProps = {
  message?: string;
};

export function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <ActivityIndicator size="large" color="#0047AB" />
      <Text style={styles.message}>{message}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1C',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  message: {
    marginTop: 12,
    fontSize: 18,
    color: '#CECECE',
    fontWeight: '600',
  },
});
