import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function QRCodeScreen() {
  const [detailsString, setDetailsString] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDetails() {
      try {
        // Correctly get user details from AsyncStorage keys
        const id = await AsyncStorage.getItem('userDetailsss');
        const voter = await AsyncStorage.getItem('userDetailss');
        const geo = await AsyncStorage.getItem('geoSettings');

        // Compose a JSON string only if all exist
        if (id && voter && geo) {
          const storedDetails = JSON.stringify({
            ID: id,
            VOTERD: voter,
            GEOD: geo,
          });
          setDetailsString(storedDetails);
        } else {
          setDetailsString('');
        }
      } catch (error) {
        console.error('Error loading user details:', error);
        setDetailsString('');
      } finally {
        setIsLoading(false);
      }
    }
    loadDetails();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading QR Code...</Text>
      </View>
    );
  }

  return (
    <ImageBackground source={require('../assets/images/flag-kenya.jpg')} style={styles.body} resizeMode="cover">
      <View style={styles.cover}>
      <Text style={styles.headerText}>VOTER IDENTITY QR CODE</Text>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
        <View style={styles.qrContainer}>
          {detailsString ? (
            <QRCode 
              value={detailsString} 
              size={200} 
              color="#2907c0ff" 
              backgroundColor="white" 
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No ID details found</Text>
            </View>
          )}
        </View>
        <View style={styles.items}>
          <Ionicons name='arrow-up' size={28} color={'#290667ff'}/>
          <Text style={styles.text}>Scan the above QR code to verify identity</Text>
          <Ionicons name='arrow-up' size={28} color={'#290667ff'}/>
        </View>
      </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginVertical: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  qrContainer: {
    borderRadius: 15,
    borderEndColor: 'purple',
    borderTopColor: 'purple',
    borderEndWidth: 4,
    borderBottomColor: 'blue',
    borderStartWidth: 4,
    borderStartColor: 'blue',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
    marginVertical: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    opacity: 0.85
  },
  items: { 
    borderRadius: 8,
    borderEndColor: 'purple',
    borderTopColor: 'purple',
    borderEndWidth: 3,
    borderBottomColor: 'blue',
    borderStartWidth: 3,
    borderStartColor: 'blue',
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'rgba(16, 166, 116, 0.9)', 
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  noDataContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noDataText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  text: { 
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
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
