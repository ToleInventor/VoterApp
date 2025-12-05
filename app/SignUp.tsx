import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, router } from 'expo-router';
import { useEffect, useState } from 'react';
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
    
    useEffect(() => {
        const checkCreated = async () => {
            const value = await AsyncStorage.getItem('created');
            if (value) {
                setMessage('Account already created! Please login.');
                await new Promise(resolve => setTimeout(resolve, 1000));
                router.push('/');
            }
        };
        checkCreated();
    }, []);
    
    const handleCreate = async () => {
        if (!id || !pass1 || !pass2) {
            setMessage('Please fill all fields');
            return;
        }

        const success = await Create(id, pass1, pass2);
        if (success) {
            setMessage('Account created successfully!');
            Alert.alert('Success', 'Account created!');
            await AsyncStorage.setItem('created', 'true');
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
                <Text style={styles.textu}>USERNAME</Text>
                <TextInput 
                    style={styles.input}
                    keyboardType='web-search'
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
    },
    uppercontainer: {
        backgroundColor: 'black',
        flex: 1,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        overflow: 'hidden',
        opacity: 0.8,
        justifyContent: 'center'
    },
    text: {
        color: '#d2dae1ff',
        fontWeight: 'bold',
        padding: 10,
        fontSize: 18
    },
    textu: {
        color: '#d2dae1ff',
        fontWeight: 'bold',
        padding: 10,
        textAlign: 'center',
        fontSize: 18
    },
    textt: {
        color: '#d2dae1ff',
        fontWeight: 'bold',
        padding: 10,
        textAlign: 'center',
        fontSize: 18
    },
    input: {
        borderColor: 'blue',
        backgroundColor: '#c4c8e1ff',
        borderWidth: 2,
        padding: 10,
        borderRadius: 9
    },
    cont: {
        padding: 10,
        borderColor: '#b6b2edff',
        maxWidth: 350,
        maxHeight: 500,
        minHeight: 320,
        minWidth: 300,
        opacity: 0.7,
        justifyContent: 'center',
        alignSelf: 'center',
        backgroundColor: '#302b2bff',
        borderRadius: 10,
        borderTopWidth: 4,
        borderBottomWidth: 4,
        borderStartWidth: 4,
        borderEndWidth: 4
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
