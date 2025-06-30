// logic for removing a friend
// features/friends/removeFriend.tsx


import { auth, db } from '@/firebase/config';
import { updateDoc, arrayRemove, doc } from 'firebase/firestore';
import { Alert } from 'react-native';

// will attempt to remove a friend and unlist them from both users' friend list
export const removeFriend = async (friendId: string) => {
  const currentUser = auth.currentUser;
  if (!currentUser) return;

  try {
    const currentUserRef = doc(db, 'users', currentUser.uid);
    const friendRef = doc(db, 'users', friendId);

    // Remove connection from both users array
    await Promise.all([
      updateDoc(currentUserRef, {
        friend: arrayRemove(friendId),
      }),
      updateDoc(friendRef, {
        friend: arrayRemove(currentUser.uid),
      }),
    ]);

    Alert.alert('Removed', 'You have removed a friend from your list');
  } catch (error) {
    alert(error);
  }
};
