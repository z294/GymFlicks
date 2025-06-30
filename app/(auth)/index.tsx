// Login Screen
// app/(auth)/index.tsx

import React, { useState } from 'react';
import { auth } from '../../firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'expo-router';
import {
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  StyleSheet,
} from 'react-native';

export default function Index() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const signIn = async () => {
    try {
      // will attempt to sign the user in. If the user has not verified their email, the sign in will fail. 
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const user = userCred.user;
      if (user.emailVerified) {
        router.replace('/(tabs)');
      } else {
        Alert.alert(
          'Sign In Error',
          'Please verify your email first. Check your inbox!'
        );
      }
    } catch (error: any) {
      Alert.alert('Sign in Error', error.message);
    }
  };

  // rooutes to sign up page
  const signUpPage = async () => {
    router.push('/SignUp');
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView>
          {/* title and icon section */}
          <View style={styles.formContainer}>
            <View style={styles.header}>
              <Image
                source={require('../../assets/images/GymFlickIcon.png')}
                style={styles.headerImg}
              />
              <Text style={styles.title}>Sign In</Text>
            </View>

            {/* form section */}
            <View style={styles.form}>
              <View style={styles.formInput}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={styles.inputText}
                  placeholder="example@gmail.com"
                  placeholderTextColor="#999" 
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={styles.formInput}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  style={styles.inputText}
                  placeholder="*******"
                  placeholderTextColor="#999" 
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <View style={styles.formAction}>
                <TouchableOpacity style={styles.formButton} onPress={signIn}>
                  <Text style={styles.buttonText}>Sign In</Text>
                </TouchableOpacity>
              </View>

              {/* footer section */}
              <View style={styles.formFooter}>
                <Text style={styles.footerText}>
                  Don't have a account? Sign up
                  <Text
                    style={styles.fotterButtom}
                    suppressHighlighting={true}
                    onPress={signUpPage}
                  >
                    {' '}
                    here
                  </Text>
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#0A0F1C',
  },
  formContainer: {
    backgroundColor: '#0A0F1C',
    flex: 1,
    padding: 24,
  },
  header: {
    marginVertical: 36,
  },
  headerImg: {
    width: 250,
    height: 100,
    alignSelf: 'center',
    marginBottom: 35,
  },
  title: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 6,
    color: '#CECECE',
  },
  form: {
    marginBottom: 24,
    flex: 1,
  },
  formInput: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 20,
    fontWeight: '500',
    color: '#888',
    marginBottom: 8,
  },
  inputText: {
    height: 44,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    borderRadius: 12,
    fontSize: 15,
    fontWeight: '500',
    color: '#222',
    
    
  },
  formAction: {
    marginBottom: 18,
  },
  formButton: {
    backgroundColor: '#0047AB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#F9F6EE',
  },
  formFooter: {
    marginBottom: 18,
  },
  footerText: {
    color: '#CECECE'
  },
  fotterButtom: {
    color: '#FFA500',
  },
});
