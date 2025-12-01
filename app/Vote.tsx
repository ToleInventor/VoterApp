import { ImageBackground, StyleSheet, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Vote(){
    return(
        <ImageBackground source={require('../assets/images/flag-kenya.jpg')} style={styles.body}>
            <View>
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

    }
});