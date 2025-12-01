import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Alert, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

async function Create(id: string, pass1: string, pass2: string): Promise<boolean> {
  try {
    if (pass1 !== pass2) {
      return false;
    }
    
    const existing = await AsyncStorage.getItem(id);
    if (existing) {
      return false;
    }
    
    await AsyncStorage.setItem(id, pass1);
    return true;
  } catch (error) {
    console.error('Create error:', error);
    return false;
  }
}

export default function CreateAcc(){
    const [id, addID] = useState('');
    const [pass1, addPass1] = useState('');
    const [pass2, addPass2] = useState('');
    const [message, setMessage] = useState('');

    const handleCreate = async () => {
        if (!id || !pass1 || !pass2) {
            setMessage('Please fill all fields');
            return;
        }

        const success = await Create(id, pass1, pass2);
        if (success) {
            setMessage('Account created successfully!');
            Alert.alert('Success', 'Account created!');
            router.push('/')
        } else {
            setMessage('Account creation failed - ID exists or passwords don\'t match');
        }
    };

    return(
        <ImageBackground source={require('../assets/images/flag-kenya.jpg')} style={styles.body}>
            <View style={styles.uppercontainer}>
                <View style={{alignItems: 'center'}}>
                    <Ionicons name={'person-add-outline'} size={150} color={'#000'}/>
                </View>
                <Text style={styles.textt}>
                    {message ? message : 'Welcome user! Kindly Create an account to continue'}
                </Text>
            <View style={styles.cont}>
                <Text style={styles.textu}>ID NUMBER</Text>
                <TextInput 
                    style={styles.input}
                    keyboardType='numeric'
                    value={id}
                    onChangeText={addID}
                    placeholder='Enter your ID number here'
                />
                
                <Text style={styles.text}>PASSWORD</Text>
                <TextInput 
                    style={styles.input}
                    secureTextEntry={true}
                    value={pass1}
                    onChangeText={addPass1}
                    placeholder='Enter your password here'
                />
                
                <Text style={styles.text}>CONFIRM PASSWORD</Text>
                <TextInput 
                    style={styles.input}
                    secureTextEntry={true}
                    value={pass2}
                    onChangeText={addPass2}
                    placeholder='Confirm your password'
                />
                
                <View style={styles.loginButtonContainer}>
                    <TouchableOpacity style={styles.loginButton} onPress={handleCreate}>
                        <Ionicons name={'create-outline'} color={'white'} size={32}/>
                        <Text style={styles.loginButtonText}>Create</Text>
                    </TouchableOpacity>
                </View>
                
                <View style={styles.signUpLinkContainer}>
                    <Link href='/'>
                        <Text style={styles.signUpLinkText}>Already have an account?</Text>
                    </Link>
                </View>
            </View>
            </View>
        </ImageBackground>
    );
}

const styles=StyleSheet.create({
    body: {
        backgroundColor: 'blue',
        flex: 1,
        justifyContent: 'flex-end'
    },
    uppercontainer: {
        backgroundColor: '#f4f6faff',
        flex: 0.75,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        overflow: 'hidden',
        opacity: 0.8
    },
    text: {
        color: '#220e79ff',
        fontWeight: 'bold',
        paddingVertical: 10
    },
    textu: {
        color: '#220e79ff',
        fontWeight: 'bold',
        paddingVertical: 10,
    },
    textt: {
        color: '#8f80cfff',
        fontSize: 19,
        fontWeight: 'bold',
        padding: 10,
        textAlign: 'center'
    },
    input: {
        borderColor: 'blue',
        borderWidth: 2,
        padding: 10,
        borderRadius: 9
    },
    cont: {
        borderTopWidth: 4,
        borderBottomWidth: 4,
        padding: 10,
        borderTopRightRadius: 10,
        borderBottomLeftRadius: 10,
        borderColor: '#08a83eff'
    },
    loginButtonContainer: {
        alignItems: 'flex-end', 
        paddingTop: 15,
        paddingRight: 10,
    },
    loginButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'purple',
        padding: 10,
        borderRadius: 5,
    },
    loginButtonText: {
        color: 'white',
        marginLeft: 8,
        fontWeight: 'bold',
    },
    signUpLinkContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    signUpLinkText: {
        color: 'blue',
        textDecorationLine: 'underline',
        fontWeight: 'bold',
    }
});
