// Feed screen
// app/(tabs)/feed.tsx

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { auth, db } from '../../firebase/config';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { deletePost, getPostsByFriends } from '../../features/posts/postAPI';
import { router } from 'expo-router';


type Post = {
  id: string;
  authorId: string;
  username: string;
  text: string;
  imageUrl?: string | null;
  createdAt: any;
  upvotes?: number;
  upvotedBy?: string[];
};

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  // handles the new flick button
  const newFlick = () => {
    router.push('../(modals)/CreateFlickScreen');
  };

  // loads the feed with post from user and user's friends
  const loadFeed = async () => {
    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setPosts([]);
        return;
      }
      const uid = currentUser.uid;
      const userDoc = await getDoc(doc(db, 'users', uid));
      const userData = userDoc.data();
      const friends: string[] = userData?.friend || [];
      const authorIds = [uid, ...friends];
      const postsData = await getPostsByFriends(authorIds);
      setPosts(postsData);
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  // post upvoting logic
  // users can only give 1 upvote for every post
  // user can remove upvote 
  const handleUpvote = async (postId: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) return;

    const postData = postSnap.data();
    const upvotedBy: string[] = postData?.upvotedBy || [];
    const currentUpvotes = postData?.upvotes || 0;

    const hasUpvoted = upvotedBy.includes(currentUser.uid);

    if (hasUpvoted) {
      const newUpvotedBy = upvotedBy.filter((id) => id !== currentUser.uid);
      await updateDoc(postRef, {
        upvotes: Math.max(currentUpvotes - 1, 0),
        upvotedBy: newUpvotedBy,
      });
    } else {
      await updateDoc(postRef, {
        upvotes: currentUpvotes + 1,
        upvotedBy: arrayUnion(currentUser.uid),
      });
    }

    // refreshes the screen
    loadFeed();
  };

  const confirmDelete = (postId: string, imageUrl: string) => {
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePost(postId, imageUrl);
            loadFeed();
          } catch (error) {
            alert(error);
          }
        },
      },
    ]);
  };

  useEffect(() => {
    loadFeed();
  }, []);

  // reloads feed everytime the user is on the screen
  useFocusEffect(
    useCallback(() => {
      loadFeed();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      {posts.length === 0 && !loading && (
        <View style={styles.noPostsContainer}>
          <Text style={styles.emptyText}>No posts yet!</Text>
        </View>
      )}

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        onRefresh={loadFeed}
        refreshing={loading}
        contentContainerStyle={{ padding: 18, flexGrow: 1 }}
        ListEmptyComponent={
          loading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color="#0047AB" />
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const hasUpvoted = item.upvotedBy?.includes(auth.currentUser?.uid || '');

          return (
            <View style={styles.postCard}>
              <Text style={styles.username}>{item.username}</Text>

              {item.imageUrl && (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.postImage}
                  resizeMode="cover"
                />
              )}
              <Text style={styles.postText}>{item.text}</Text>
              <Text style={styles.date}>
                {item.createdAt?.toDate
                  ? item.createdAt.toDate().toLocaleString()
                  : ''}
              </Text>

              <View style={styles.actionsRow}>
                <TouchableOpacity onPress={() => handleUpvote(item.id)}>
                  <View style={styles.upvoteWrapper}>
                    <Image
                    source={require('../../assets/images/thumbsUp.png')}
                    style={styles.upvoteIcon}
                    />
                    <Text style={styles.upvoteCount}>{item.upvotes || 0}</Text>
                  </View>
                </TouchableOpacity>

                {item.authorId === auth.currentUser?.uid && (
                  <TouchableOpacity
                    onPress={() =>
                      confirmDelete(item.id, item.imageUrl ?? '')
                    }
                  >
                    <Text style={{ color: 'red' }}>Delete</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
      />

      <TouchableOpacity onPress={newFlick} style={styles.postButton}>
        <Text style={styles.postButtonText}>New Flick</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
  },
  container: {
    flex: 1,
    backgroundColor: '#0A0F1C',
  },
  noPostsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0F1C',
  },
  postCard: {
    backgroundColor: '#f9fafd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  username: {
    fontWeight: '600',
    marginBottom: 8,
    color: '#000000',
  },
  postText: {
    fontSize: 16,
    marginBottom: 12,
    color: '#222',
  },
  postImage: {
    width: '100%',
    height: 400,
    borderRadius: 12,
    marginBottom: 10,
  },
  date: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  upvoteWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  upvoteIcon: {
    width: 24,
    height: 24,
  },
  upvoteCount: {
    color: '#0047AB',
    fontWeight: 'bold',
    fontSize: 16,
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
