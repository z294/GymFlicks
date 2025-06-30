// createFlickScreen
// app/(modals)/createFlickScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { auth } from '../../firebase/config';
import { createPost } from '../../features/posts/postAPI';
import { useRouter } from 'expo-router';
import { uploadImageAsync } from '../../features/posts/uploadImageAsyncFile';
import { LoadingScreen } from '../../features/posts/loadingScreen';


export default function CreateFlickScreen() {
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // use a image from camera roll
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Please allow gallery access.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // use a iamge taken from camera
  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Please allow camera access.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // will attempt to post the new flick
  const handlePost = async () => {
    //check 1 -> is user signed in
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'You must be logged in to post.');
      return;
    }
    // check 2 -> is the text empty
    if (!text.trim()) {
      Alert.alert('Empty Post', 'Please write something!');
      return;
    }
    // check 3 -> is there a image
    if (!image) {
      Alert.alert('Missing Image', 'Please add an image to your post.');
      return;
    }

    // passed all check -> post the flick!!
    setLoading(true);
    try {
      const imageUrl = await uploadImageAsync(image);
      await createPost(user.uid, text, imageUrl);
      Alert.alert('Success', 'Your post has been created!');
      setText('');
      setImage(null);
      router.back();
    } catch (error) {
      console.error('Post failed:', error);
      Alert.alert('Upload Failed', 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // shows loading screen while the flick is being uploaded
  // this process can take time so it prevents the user from posting dups
  if (loading) return <LoadingScreen message="Posting..." />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Create a new post</Text>

        {image && (
          <Image source={{ uri: image }} style={styles.imagePreview} />
        )}

        <TextInput
          placeholder="What muscle group did you workout today??"
          value={text}
          onChangeText={setText}
          multiline
          numberOfLines={5}
          style={styles.textInput}
        />


        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={pickImage}>
            <Text style={styles.buttonText}>Pick from Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={takePhoto}>
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.postButton} onPress={handlePost}>
          <Text style={styles.postButtonText}>Post</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()} 
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0F1C',
  },
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  textInput: {
    height: 120,
    color: '#FFFFFF',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  imagePreview: {
    width: '100%',
    height: 450,
    borderRadius: 12,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    flex: 1,
    backgroundColor: '#0047AB',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
  },
  postButton: {
    backgroundColor: '#006400',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    alignItems: 'center',
    padding: 10,
  },
  cancelButtonText: {
    color: '#888',
  },
});
