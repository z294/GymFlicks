// home screen
// app/(tabs)/index.tsx

// home scren for the entire app
// festures a Gemini generated quote, friend and flicks count, 
// as well a list of your friends


import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  Text,
  SafeAreaView,
  TouchableOpacity,
  View,
  StyleSheet,
  FlatList,
  Platform,
  KeyboardAvoidingView,
  RefreshControl,
  Alert,
} from 'react-native';
import { auth, db } from '../../firebase/config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { signOut } from "firebase/auth";
import { removeFriend } from '@/features/friends/removeFriend';
import { generateQuote } from '@/features/gemini/GenerateQuote'

type FriendData = {
  uid: string;
  username: string;
  flicks: number;
};

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [friendList, setFriendList] = useState<FriendData[]>([]);
  const [postCount, setPostCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [quote, setQuote] = useState<string>('tap for some motivation 💪 ');

  // loads the user data
  const loadUserData = async () => {
    const currentUser = auth.currentUser;
    // security check
    if (!currentUser) return;


    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    const userData = userDoc.data();

    if (userData) {
      setUsername(userData.username || 'User');
      const requests = userData.friendRequests || [];
      setPendingCount(requests.length || 0);
    }

    const postsQuery = query(
      collection(db, 'posts'),
      where('authorId', '==', currentUser.uid)
    );
    const postsSnapshot = await getDocs(postsQuery);
    setPostCount(postsSnapshot.size);

    const friendUids: string[] = userData?.friend || [];

    const friendData: FriendData[] = await Promise.all(
      friendUids.map(async (uid) => {
        const userSnap = await getDoc(doc(db, 'users', uid));
        const userInfo = userSnap.data();
        const name = userInfo?.username || 'Unknown';

        const flicksSnap = await getDocs(
          query(collection(db, 'posts'), where('authorId', '==', uid))
        );

        return {
          uid,
          username: name,
          flicks: flicksSnap.size,
        };
      })
    );
    setFriendList(friendData);
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  }, []);

  const newPost = () => {
     router.push('/(modals)/CreateWorkoutPlan');
  };

  const addFriend = () => {
    router.push('/(modals)/AddFriendScreen');
  };

  // signs user out and return to login screen
  const signOutMsg = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', 
          onPress: async () => {
            signOut(auth);
            router.replace('/(auth)');
          }}
      ]
    )
  };

  const handleRemoveFriend = (friendId: string) => {
    Alert.alert('Remove Friend', 'Are you sure you want to remove this friend?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive',
          onPress: () => {
            // remove the friend and refreshes the friend list
            removeFriend(friendId);
            setFriendList((prev) => prev.filter((friend) => friend.uid !== friendId));
          }
        },
      ]
    )
  }

  // handles generating new quotes. 
  // calls features/gemini/generateQuotes.tsx to generate the quotes
  const handleGenerateQuotes = async () => {
    setQuote('');
    try {
      const newQuote = await generateQuote();
      setQuote(newQuote);

    } catch(error){
      alert(error)
    }

  }

  // updates the gemini generated quotes everytime the user is on the screen again
   useFocusEffect(
    useCallback(() => {
      handleGenerateQuotes();
    }, [])
  );



  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.container}>

        <View style={styles.topBar}>
          <TouchableOpacity onPress={signOutMsg}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.header}>
          <Text style={styles.headerText}>Welcome back, {username}</Text>
            <Text style={styles.headerSubtext}>{quote}</Text>
        </View>

        <View style={styles.snapshot}>
          <View style={styles.snapshotItem}>
            <Text style={styles.snapshotTitle}>Total Flicks</Text>
            <Text style={styles.snapshotValue}>{postCount}</Text>
          </View>
          <View style={styles.snapshotItem}>
            <Text style={styles.snapshotTitle}>Friends</Text>
            <Text style={styles.snapshotValue}>{friendList.length}</Text>
          </View>
        </View>

        <TouchableOpacity onPress={addFriend} style={styles.addFriendButton}>
          <Text style={styles.addFriendText}>Add Friend</Text>
        </TouchableOpacity>

        <View style={styles.friendsSection}>
          <View style={styles.friendsHeader}>
            <Text style={styles.sectionTitle}>Friends List</Text>
            {pendingCount > 0 && (
              <Text style={styles.pendingText}>• {pendingCount} pending</Text>
            )}
          </View>

          <FlatList
            data={friendList}
            keyExtractor={(item) => item.uid}
            renderItem={({ item }) => (
              <View style={styles.friendCard}>

                <Text style={styles.friendText}>{item.username}</Text>

                <View style={styles.friendRow}>
                  <Text style={styles.flickText}>
                    {item.flicks} flick{item.flicks !== 1 ? 's' : ''}
                  </Text>
                  <TouchableOpacity onPress={() => handleRemoveFriend(item.uid)}>
                    <Text style={styles.deleteFriendText}>Remove Friend</Text>
                  </TouchableOpacity>
                </View>               
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.noFriendsText}>You have no friends yet.</Text>
            }
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </View>

        <TouchableOpacity onPress={newPost} style={styles.postButton}>
          <Text style={styles.postButtonText}>Create workout plan</Text>
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: -12,
  },
  signOutText: {
    color: '#CECECE',
    fontSize: 14,
    fontWeight: '600',
    padding: 8,
  },
  header: {
    marginVertical: 36,
  },
  headerText: {
    color: '#CECECE',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  headerSubtext: {
    color: '#888',
    fontSize: 14,
  },
  snapshot: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    marginBottom: 36,
  },
  snapshotItem: {
    alignItems: 'center',
  },
  snapshotTitle: {
    color: '#aaa',
    fontSize: 14,
  },
  snapshotValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  addFriendButton: {
    marginBottom: 20,
    backgroundColor: '#0047AB',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addFriendText: {
    color: '#fff',
    fontWeight: '600',
  },
  friendsSection: {
    marginBottom: 20,
    flex: 1,
  },
  friendsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  pendingText: {
    color: '#FFA500',
    fontSize: 14,
    fontWeight: '500',
  },
  friendCard: {
    backgroundColor: '#1E1E2C',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  friendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  friendText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  flickText: {
    color: '#bbb',
    fontSize: 14,
    marginLeft: 10,
    marginTop: 2,
  },
  noFriendsText: {
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 20,
  },
  deleteFriendButton: {
     alignItems: 'flex-end',
  },
  deleteFriendText: {
    color: 'red'
  },
  postButton: {
    backgroundColor: '#0047AB',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 'auto',
  },
  postButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

