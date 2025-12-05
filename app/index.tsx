import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';



async function Login(id: string, password: string): Promise<boolean> {
  try {
    const storedPassword = await AsyncStorage.getItem(id);
    return storedPassword === password;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
}

export default function Index(){
    const [id, CreateID] = useState('');
    const [pass, CreatePass] = useState('');
    const [Message, setMessage] = useState('');
    
    return(
        <ImageBackground source={require('../assets/images/flag-kenya.jpg')} style={styles.body}>
            <View style={styles.uppercontainer}>
            <View style={styles.cont}>
                <View style={{alignItems: 'center', marginTop: 20 }}>
                    <Ionicons name={'person-circle-outline'} size={100} color={'#dcdaebff'}/>
                </View>
                <Text style={styles.textt}>
                    {Message ? Message : 'Welcome back user! Kindly login to continue'}
                </Text>
                <Text style={styles.text}>USERNAME</Text>
                <TextInput 
                    style={styles.input}
                    keyboardType='web-search'
                    value={id}
                    onChangeText={(text) => CreateID(text)}
                    placeholder='Enter your ID number here'
                />
                <Text style={styles.text}>PASSWORD</Text>
                <TextInput 
                    style={styles.input}
                    secureTextEntry={true}
                    value={pass}
                    onChangeText={(text) => CreatePass(text)}
                    placeholder='Enter your password here.'
                />
                <View style={styles.loginButtonContainer}>
                    <TouchableOpacity 
                        style={styles.loginButton} 
                        onPress={async () => {
                            const success = await Login(id, pass);
                            setMessage(success ? 'Login Successful!' : 'Login Failed!');
                            if(success){
                                router.push('/Navigation')
                            }
                        }}
                    >
                        <Ionicons name={'log-in-outline'} color={'white'} size={24}/>
                        <Text style={styles.loginButtonText}>Login</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.signUpLinkContainer}>
                    <Link href='/SignUp' style={styles.signUpLinkText}>
                        Do not have an account?
                    </Link>
                </View>
            </View>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    body: {
        backgroundColor: '#0c0333ff',
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
        color: 'white',
        fontWeight: 'bold',
        paddingVertical: 10
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
        paddingRight: 10
    },
    loginButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#35d21dff',
        padding: 10,
        borderRadius: 5
    },
    loginButtonText: {
        color: 'white',
        marginLeft: 8,
        fontWeight: 'bold'
    },
    signUpLinkContainer: {
        alignItems: 'center',
        marginTop: 20
    },
    signUpLinkText: {
        color: 'white',
        textDecorationLine: 'underline',
        fontWeight: 'bold'
    }
});
