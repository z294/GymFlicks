// Post API
// features/posts/postAPI.ts
// handles logic for uploading and deleting posts to firebase storage and db


import { deleteObject, ref } from 'firebase/storage';
import { db, storage } from '../../firebase/config';
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  query,
  where,
  getDoc,
  getDocs,
  orderBy,
  Timestamp,
} from 'firebase/firestore';

export interface Post {
  id: string;
  authorId: string;
  username: string;
  text: string;
  imageUrl?: string | null;
  createdAt: Timestamp;
  upvotes?: number;
  upvotedBy?: string[];
}

// creates a post
export const createPost = async (
  authorId: string,
  text: string,
  imageUrl: string | null = null
): Promise<void> => {
  const userRef = doc(db, 'users', authorId);
  const userSnap = await getDoc(userRef);
  const username = userSnap.exists() ? userSnap.data().username : 'Unknown username';

  await addDoc(collection(db, 'posts'), {
    authorId,
    username,
    text,
    imageUrl,
    createdAt: Timestamp.now(),
    upvotes: 0,
    upvotedBy: [], 
  });
};

// deletes a post
export const deletePost = async (postId: string, imageUrl: string) => {
  try {
    const path = getImagePath(imageUrl);
    const imageRef = ref(storage, path);
    await deleteObject(imageRef);
    console.log("Image deleted from Firebase Storage");
  } catch (e) {
    throw e;
  }

  try {
    await deleteDoc(doc(db, 'posts', postId));
    console.log("Post deleted from Firestore");
  } catch (e) {
    throw e;
  }
};

// helper function to get the image path from the image url
// used by deletePost
export const getImagePath = (url: string): string => {
  const path = url.split('/o/')[1]?.split('?')[0];
  return decodeURIComponent(path);
};

// get posts created from your friend list
export const getPostsByFriends = async (
  friendUids: string[]
): Promise<Post[]> => {
  if (friendUids.length === 0) return [];

  const postsQuery = query(
    collection(db, 'posts'),
    where('authorId', 'in', friendUids.slice(0, 10)),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(postsQuery);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Post, 'id'>),
  }));
};
