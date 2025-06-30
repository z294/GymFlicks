// logic for sending the friend request, as well as accecting/denying the request
// features/friends/friendrequest.tsx


import { db } from '../../firebase/config';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  getDoc
} from 'firebase/firestore';

// will attempt to sent a friend request after going through checks
export const sendFriendRequest = async (fromUid: string, toUsername: string) => {
  const userQuery = query(collection(db, 'users'), where('username', '==', toUsername));
  const userSnapshot = await getDocs(userQuery);

  // check 1 -> user must exist
  if (userSnapshot.empty) {
    throw new Error('No user found with that username.');
  }

  const toDoc = userSnapshot.docs[0];
  const toUid = toDoc.id;

  // check 2 -> cannot friend yourself
  if (fromUid === toUid) {
    throw new Error('You cannot send a friend request to yourself.');
  }

  const toData = toDoc.data();
  const requests = toData.friendRequests || [];
  const existingFriends = toData.friend || [];

  // check 3 -> user is ready a friend
  if (existingFriends.includes(fromUid)) {
    throw new Error('You are already friends with this user.');
  }

  // check 4 -> req. already sent
  if (requests.includes(fromUid)) {
    throw new Error('Friend request already sent.');
  }

  // sent req.
  await updateDoc(doc(db, 'users', toUid), {
    friendRequests: [...requests, fromUid],
  });
};

// handles the incoming friend req. logic
export const getIncomingRequests = async (userUid: string) => {
  const userDoc = await getDoc(doc(db, 'users', userUid));
  const userData = userDoc.data();
  const requests = userData?.friendRequests || [];

  const fetchedRequests = await Promise.all(
    requests.map(async (uid: string) => {
      const reqDoc = await getDoc(doc(db, 'users', uid));
      return {
        id: uid,
        uid,
        username: reqDoc.exists() ? reqDoc.data().username : 'Unknown',
      };
    })
  );

  return fetchedRequests;
};
// accects the friend req, add the user to each of the friend list
export const acceptRequest = async (
  requestId: string,
  fromUid: string,
  toUid: string
) => {
  const fromRef = doc(db, 'users', fromUid);
  const toRef = doc(db, 'users', toUid);

  const fromSnap = await getDoc(fromRef);
  const toSnap = await getDoc(toRef);

  const fromData = fromSnap.data();
  const toData = toSnap.data();

  const updatedFromFriends = [...(fromData?.friend || []), toUid];
  const updatedToFriends = [...(toData?.friend || []), fromUid];
  const updatedRequests = (toData?.friendRequests || []).filter((id: string) => id !== fromUid);

  await updateDoc(fromRef, {
    friend: updatedFromFriends,
  });

  await updateDoc(toRef, {
    friend: updatedToFriends,
    friendRequests: updatedRequests,
  });
};

// reject friend req logic
export const rejectRequest = async (fromUid: string, toUid: string) => {
  const toRef = doc(db, 'users', toUid);
  const toSnap = await getDoc(toRef);
  const toData = toSnap.data();

  const updatedRequests = (toData?.friendRequests || []).filter(
    (id: string) => id !== fromUid
  );

  await updateDoc(toRef, {
    friendRequests: updatedRequests,
  });
};
