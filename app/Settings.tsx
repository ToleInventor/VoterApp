import { router } from 'expo-router';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Setti(){
    return(
    <ImageBackground source={require('../assets/images/flag-kenya.jpg')} style={styles.body}>
        <View style={styles.cover}>
        <TouchableOpacity
        onPress={ async () => {router.push('/ID') }}
        >
        <View style={styles.parts}>
                <Ionicons name='id-card-outline' color={'white'} size={28}/>
                <Text style={styles.innertxt}>
                    ID DETAILS
                </Text>
        </View>
        </TouchableOpacity>
        <TouchableOpacity
        onPress={ async () => {router.push('/VoterD') }}
        >
        <View style={styles.parts}>
                <Ionicons name='person-outline' color={'white'} size={28}/>
                <Text style={styles.innertxt}>
                    VOTERS CARD DETAILS
                </Text>
        </View>
        </TouchableOpacity>
        <TouchableOpacity
        onPress={async () => {
            router.push('/GeoSett')
        }}
        >
        <View style={styles.parts}>
                <Ionicons name='globe-outline' color={'white'} size={28}/>
                <Text style={styles.innertxt}>
                    GEOGRAPHIC SETTINGS
                </Text>
        </View>
        </TouchableOpacity>
        </View>
    </ImageBackground>
    );
}

const styles = StyleSheet.create({
    body: {
        flex: 1,
        alignContent: 'center',
        overflow: 'hidden'
    },
    parts: {
        backgroundColor: '#27034bff',
        borderEndColor: 'blue',
        borderEndWidth: 4,
        borderRadius: 10,
        padding: 10,
        margin: 15,
        borderStartColor: 'yellow',
        borderStartWidth: 4,
        flexDirection: 'row'
    },
    innertxt: {
        color: 'white'
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
