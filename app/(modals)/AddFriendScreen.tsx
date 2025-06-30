// addFriendScreen
// app/(modals)/addFriendScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { auth } from '../../firebase/config';
import { acceptRequest, getIncomingRequests, rejectRequest, sendFriendRequest } from '@/features/friends/friendrequest';


export default function AddFriendScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [friendRequests, setFriendRequests] = useState<any[]>([]);

  useEffect(() => {
    const fetchFriendRequests = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const requests = await getIncomingRequests(currentUser.uid);
      setFriendRequests(requests);
    };

    fetchFriendRequests();
  }, []);

  // will attempt to add friend
  const handleAddFriend = async () => {
    const currentUser = auth.currentUser;
    // error if user is not logged in
    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in to add friends.');
      return;
    }

    // error if user didn't enter anything
    if (username.trim() === '') {
      Alert.alert('Input Error', 'Please enter a username.');
      return;
    }

    // will attempt to sent the friend request
    try {
      await sendFriendRequest(currentUser.uid, username);
      Alert.alert('Request Sent', `Friend request sent to ${username}.`);
      setUsername('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong.');
    }
  };

  // handles accecting incoming friend request
  const handleAccept = async (requestUid: string, requestId: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    await acceptRequest(requestId, requestUid, currentUser.uid);
    setFriendRequests((prev) => prev.filter((req) => req.uid !== requestUid));
  };

  // handles denying incoming friend request
  const handleDeny = async (requestUid: string, requestId: string) => {
    await rejectRequest(requestId, requestUid);
    setFriendRequests((prev) => prev.filter((req) => req.uid !== requestUid));
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.container}>
        <FlatList
          ListHeaderComponent={
            <>
              <Text style={styles.header}>Add a Friend</Text>
              <TextInput
                placeholder="Enter friend's username"
                placeholderTextColor="#999"
                style={styles.input}
                value={username}
                onChangeText={setUsername}
              />
              <TouchableOpacity onPress={handleAddFriend} style={styles.button}>
                <Text style={styles.buttonText}>Add Friend</Text>
              </TouchableOpacity>
              <Text style={[styles.header, { marginTop: 40 }]}>Friend Requests</Text>
              {friendRequests.length === 0 && (
                <Text style={{ color: '#888', textAlign: 'center', marginVertical: 10 }}>
                  No friend requests.
                </Text>
              )}
            </>
          }
          data={friendRequests}
          keyExtractor={(item) => item.uid}
          renderItem={({ item }) => (
            <View style={styles.requestItem}>
              <Text style={styles.requestText}>{item.username}</Text>
              <View style={styles.requestActionsRight}>
                <TouchableOpacity onPress={() => handleAccept(item.uid, item.id)} style={styles.accept}>
                  <Text style={{ color: '#fff' }}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeny(item.uid, item.id)} style={styles.deny}>
                  <Text style={{ color: '#fff' }}>Deny</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 40 }}
        />

        <TouchableOpacity onPress={() => router.back()} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Back to Home</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#0A0F1C',
  },
  header: {
    color: '#CECECE',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    marginTop: 30,
    alignSelf: 'center',
  },
  input: {
    backgroundColor: '#1A1A2E',
    color: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#7FDBFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 16,
  },
  requestItem: {
    backgroundColor: '#1A1A2E',
    padding: 12,
    marginVertical: 8,
    borderRadius: 10,
  },
  requestText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  requestActionsRight: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  accept: {
    backgroundColor: '#28A745',
    padding: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  deny: {
    backgroundColor: '#DC3545',
    padding: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  cancelText: {
    color: '#7FDBFF',
    fontSize: 16,
  },
});
