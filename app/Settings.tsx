import { router } from 'expo-router';
import React from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Setti() {
  return (
    <ImageBackground source={require('../assets/images/flag-kenya.jpg')} style={styles.body} resizeMode="cover">
      <View style={styles.cover}>
        <Text style={styles.headerText}>VOTER SETTINGS NAVIGATION</Text>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }} keyboardShouldPersistTaps="handled">
          {/* ID Details Button */}
          <TouchableOpacity onPress={async () => { router.push('/ID'); }}>
            <View style={styles.navItem}>
              <Ionicons name="id-card-outline" color={'white'} size={32} />
              <Text style={styles.innertxt}>ID DETAILS</Text>
            </View>
          </TouchableOpacity>

          {/* Voter Details Button */}
          <TouchableOpacity onPress={async () => { router.push('/VoterD'); }}>
            <View style={styles.navItem}>
              <Ionicons name="person-outline" color={'white'} size={32} />
              <Text style={styles.innertxt}>VOTERS CARD DETAILS</Text>
            </View>
          </TouchableOpacity>

          {/* Geo Settings Button */}
          <TouchableOpacity onPress={async () => { router.push('/GeoSett'); }}>
            <View style={styles.navItem}>
              <Ionicons name="globe-outline" color={'white'} size={32} />
              <Text style={styles.innertxt}>GEOGRAPHIC SETTINGS</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
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
    backgroundColor: 'black',
    padding: 20,
    verticalAlign: 'middle',
    justifyContent: 'center',
    opacity: 0.8
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginVertical: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  navItem: {
    borderRadius: 15,
    borderEndColor: 'purple',
    borderTopColor: 'purple',
    borderEndWidth: 4,
    borderBottomColor: 'blue',
    borderStartWidth: 4,
    borderStartColor: 'blue',
    padding: 20,
    backgroundColor: 'rgba(16, 166, 116, 0.9)',
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  innertxt: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
});
