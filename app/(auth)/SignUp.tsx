// sign up screen
// app/(auth)/signup.tsx

import React, { useState } from 'react';
import { auth, db} from '../../firebase/config';
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { useRouter } from 'expo-router';
import { StyleSheet, Image } from 'react-native';
import {
   Text,
   SafeAreaView, 
   TextInput,
    TouchableOpacity, 
    View, 
    Alert, 
    ScrollView,
    Platform,
    KeyboardAvoidingView
  } from "react-native";
import { setDoc, doc, query, collection, where, getDocs } from 'firebase/firestore';



export default function signUp(){

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const router = useRouter();

  // will attempt to create a new account for the user
  const signUp = async () => {
    //checks if the password matches
    if(password != confirmPassword){
      Alert.alert('Password Error', 'Passwords do not match. Please try again.',[{ text: 'OK' }]);
      return;
    }

    //username field check
    if(!username){
      Alert.alert('Username Error', "Please enter a username");
      return;
    }
    try{
      //check if username already exists
      const usernameQuery = query(
        collection(db,'users'),
        where("username", "==", username)
      );
      const querySnapshot = await getDocs(usernameQuery)
      if(querySnapshot.size > 0 ){
        Alert.alert('Username Error', 'Username already exists.',[{text: 'OK'}]);
        return;
      }

      // passed all checks => proceed to create the new account
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;
      await sendEmailVerification(userCred.user);

      await setDoc(doc(db, "users", uid), {
        username,
        email,
        friend: [],
        createdAt: Date.now(),
      });

      Alert.alert('Success', 'You have created an account! Check your inbox for a verification email.');
      returnHome(); 
      
    } catch(error){
      alert(error);
    }
  }

  // router to go back to login screen
  const returnHome = async () => {
    router.push('/')
  }

  return(
    <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <View style={styles.formContainer}>

            {/* header section*/}
              <View style={styles.header}>
                <Image
                  source={require('../../assets/images/GymFlickIcon.png')}
                  style={styles.headerImg}
                />
                <Text style={styles.title}>Create an Account</Text>
              </View>

               {/* form section*/}
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
                  <Text style={styles.inputLabel}>Username</Text>
                    <TextInput
                    style={styles.inputText}
                    placeholder="your username"
                    placeholderTextColor="#999" 
                    value={username}
                    onChangeText={setUsername}
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

                <View style={styles.formInput}> 
                  <Text style={styles.inputLabel}>Confirm Password</Text>
                  <TextInput
                    style={styles.inputText}
                    placeholder="*******"
                    placeholderTextColor="#999" 
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                  />
                </View>

                <View style={styles.formAction}>
                  <TouchableOpacity style={styles.formButton} onPress={signUp}>
                    <Text style={styles.buttonText}>Create Account</Text>
                  </TouchableOpacity>
                </View>

                {/* footer section */}
                <View style={styles.formFooter}>
                  <Text style={styles.footerText}> 
                    Already have an account? Login in 
                    <Text style={styles.fotterButtom} suppressHighlighting={true} onPress={returnHome}> 
                      {' '}here
                    </Text>
                  </Text>
                </View>
              </View>
            </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )

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
