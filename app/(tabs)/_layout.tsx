import React from 'react';
import { Tabs } from 'expo-router';
import { Image, StyleSheet } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs 
    screenOptions={{
      headerShown: false,
      tabBarShowLabel: false,
      tabBarStyle:{
        borderTopColor: '#222',
        backgroundColor: '##00275f',
      }
    }}
    >
      <Tabs.Screen 
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <Image 
              source={
                focused
                ? require('../../assets/images/focusedHomeIcon.png')
                : require('../../assets/images/homeIcon.png')
              }
              style={styles.icon}
            />
          )
        }}
      />
      <Tabs.Screen 
        name="Feed"
        options={{
          tabBarIcon: ({ focused }) => (
            <Image 
              source={
                focused
                ? require('../../assets/images/focusedFeedIcon.png')
                : require('../../assets/images/feedIcon.png')
              }
              style={styles.icon}
            />
          )
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 24,
    height: 24,
  },
});