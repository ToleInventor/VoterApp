import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getProfile, subscribeToProfileChanges, UnifiedProfile } from '../lib/storageHelper';

const SYMBOL_MAP = {
  encrypt: {
    'A': '!', 'B': '@', 'C': '#', 'D': '$', 'E': '%', 'F': '^', 'G': '&', 
    'H': '*', 'I': '(', 'J': ')', 'K': '-', 'L': '_', 'M': '+', 'N': '=', 
    'O': '{', 'P': '}', 'Q': '[', 'R': ']', 'S': '|', 'T': '\\', 'U': ':', 
    'V': ';', 'W': '"', 'X': '\'', 'Y': '<', 'Z': '>', 
    'a': '?', 'b': '/', 'c': '.', 'd': ',', 'e': '~', 'f': '`', 'g': '1', 
    'h': '2', 'i': '3', 'j': '4', 'k': '5', 'l': '6', 'm': '7', 'n': '8', 
    'o': '9', 'p': '0', 'q': 'Q', 'r': 'W', 's': 'E', 't': 'R', 'u': 'T', 
    'v': 'Y', 'w': 'U', 'x': 'I', 'y': 'O', 'z': 'P',
    '0': 'q', '1': 'w', '2': 'e', '3': 'r', '4': 't', '5': 'y', 
    '6': 'u', '7': 'i', '8': 'o', '9': 'p',
    ' ': '_', ',': '~', '.': '`', '-': '$'
  },
  decrypt: {} as Record<string, string>
};

Object.entries(SYMBOL_MAP.encrypt).forEach(([k, v]) => {
  SYMBOL_MAP.decrypt[v] = k;
});

const substitute = (text: string, map: Record<string, string>): string => {
  return text.split('').map(ch => map[ch] || ch).join('');
};

const encryptRounds = (text: string, rounds: number): string => {
  let result = text;
  for (let i = 0; i < rounds; i++) {
    result = substitute(result, SYMBOL_MAP.encrypt);
  }
  return result;
};

const FIELD_NAMES = {
  serialNo: 'serialNo',
  firstName: 'firstName',
  lastName: 'lastName',
  surname: 'surname',
  idNumber: 'idNumber',
  dateOfBirth: 'dateOfBirth',
  sex: 'sex',
  districtOfBirth: 'districtOfBirth',
  placeOfIssue: 'placeOfIssue',
  dateOfIssue: 'dateOfIssue',
  electorsNumber: 'electorsNumber',
  fullName: 'fullName',
  registrationCentre: 'registrationCentre',
  pollingStation: 'pollingStation',
  pollingWard: 'pollingWard',
  constituency: 'constituency',
  county: 'county',
};

export default function QRCodeScreen() {
  const [detailsString, setDetailsString] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadProfileForQR = useCallback(async () => {
    try {
      setIsLoading(true);
      const profile: UnifiedProfile | null = await getProfile();
      
      if (profile) {
        const encryptedEntries = Object.entries(FIELD_NAMES).map(([fieldKey, fieldName]) => {
          const valStr = profile[fieldKey as keyof UnifiedProfile] === undefined || profile[fieldKey as keyof UnifiedProfile] === null 
            ? '' : String(profile[fieldKey as keyof UnifiedProfile]);
          const encryptedKey = encryptRounds(fieldName, 5);
          const encryptedValue = encryptRounds(valStr, 5);
          return [encryptedKey, encryptedValue] as [string, string];
        });

        const fullyEncryptedProfile = Object.fromEntries(encryptedEntries);
        setDetailsString(JSON.stringify(fullyEncryptedProfile));
      } else {
        setDetailsString('');
      }
    } catch (error) {
      console.error('Error loading user details for QR:', error);
      setDetailsString('');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfileForQR();
    const unsubscribe = subscribeToProfileChanges(loadProfileForQR);
    return unsubscribe;
  }, [loadProfileForQR]);

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
                <Ionicons name="person-off-outline" size={64} color="#ccc" />
                <Text style={styles.noDataText}>No voter profile found</Text>
                <Text style={styles.noDataSubText}>Complete ID, Voter, and Geo settings first</Text>
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
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  noDataSubText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
  text: { 
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  cover: {
    flex: 1,
    backgroundColor: 'black',
    padding: 20,
    verticalAlign: 'middle',
    justifyContent: 'center',
    opacity: 0.8
  }
});
