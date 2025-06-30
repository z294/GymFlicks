//Upload Image
//features/posts/uploadImageAsyncFile.ts
// uploads the image selected to firebase storage


import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../../firebase/config'; 

export const uploadImageAsync = async (uri: string): Promise<string> => {
  try {
    console.log('Uploading from URI:', uri);

    const response = await fetch(uri);
    const blob = await response.blob();

    const filename = `postImages/${Date.now()}.jpg`;
    const imageRef = ref(storage, filename);

    console.log('Uploading to:', filename);

    await uploadBytes(imageRef, blob);
    const downloadURL = await getDownloadURL(imageRef);

    console.log('Upload success. URL:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error("Firebase Storage upload error:", JSON.stringify(error, null, 2));
    throw error;
  }
};
