import { ImageBackground, StyleSheet, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Vote(){
    return(
        <ImageBackground source={require('../assets/images/flag-kenya.jpg')} style={styles.body}>
            <View style={styles.cover}>
                <TouchableOpacity>
                    <Ionicons name='checkmark'/>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    body: {
        flex: 1,

    },
    cover: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
        verticalAlign: 'middle',
        justifyContent: 'center',
        opacity: 0.85
    }
});