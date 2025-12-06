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
    'a': '?', 'b': '/', 'c': '.', 'd': ',',
    'e': '€', 'f': '£', 'g': '1', 'h': '2', 'i': '3', 'j': '4', 'k': '5', 
    'l': '6', 'm': '7', 'n': '8', 'o': '9', 'p': '0', 'q': 'Q', 'r': 'W', 
    's': 'E', 't': 'R', 'u': 'T', 'v': 'Y', 'w': 'U', 'x': 'I', 'y': 'O', 
    'z': 'P',
    '0': 'q', '1': 'w', '2': 'e', '3': 'r', '4': 't', '5': 'y', 
    '6': 'u', '7': 'i', '8': 'o', '9': 'p',
    ' ': ' ',
    ',': '†', '.': '‡', '-': '¢'
  },
  decrypt: {} as Record<string, string>
};

// ✅ Generate decrypt map (ZERO collisions - matches scanner)
Object.entries(SYMBOL_MAP.encrypt).forEach(([key, value]) => {
  SYMBOL_MAP.decrypt[value] = key;
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
} as const;

export default function QRCodeScreen() {
  const [detailsString, setDetailsString] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadProfileForQR = useCallback(async () => {
    try {
      setIsLoading(true);
      const profile: UnifiedProfile | null = await getProfile();
      
      if (profile) {
        const encryptedEntries = Object.entries(FIELD_NAMES).map(([fieldKey, fieldName]) => {
          const val = profile[fieldKey as keyof UnifiedProfile];
          const valStr = val === undefined || val === null || val === '' ? '' : String(val);
          const encryptedKey = encryptRounds(fieldName, 1);
          const encryptedValue = encryptRounds(valStr, 1);
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
    return () => unsubscribe();
  }, [loadProfileForQR]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00FF00" />
        <Text style={styles.loadingText}>Generating Voter QR Code...</Text>
      </View>
    );
  }

  return (
    <ImageBackground 
      source={require('../assets/images/flag-kenya.jpg')} 
      style={styles.body} 
      resizeMode="cover"
    >
      <View style={styles.cover}>
        <Text style={styles.headerText}>VOTER IDENTITY QR CODE</Text>
        
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.qrContainer}>
            {detailsString ? (
              <>
                <View style={styles.qrBorder}>
                  <QRCode 
                    value={detailsString} 
                    size={220} 
                    color="#000" 
                    backgroundColor="white" 
                    linearGradient={['#00FF00', '#00CC00']}
                  />
                </View>
                <Text style={styles.qrStatus}>✅ Ready to Scan</Text>
              </>
            ) : (
              <View style={styles.noDataContainer}>
                <Ionicons name="person-off-outline" size={80} color="#666" />
                <Text style={styles.noDataText}>No voter profile found</Text>
                <Text style={styles.noDataSubText}>
                  Complete ID, Voter, and Geo settings first
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.instructions}>
            <Ionicons name="scan-outline" size={24} color="#fff" />
            <Text style={styles.instructionText}>
              Scan verify voter identity
            </Text>
            <Ionicons name="scan-outline" size={24} color="#fff" />
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
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  loadingText: {
    color: '#00FF00',
    fontSize: 16,
    marginTop: 10,
    fontWeight: 'bold',
  },
  cover: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00FF00',
    textAlign: 'center',
    marginVertical: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  qrBorder: {
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#00FF00',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    padding: 8,
    shadowColor: '#00FF00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  qrStatus: {
    color: '#00FF00',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    backgroundColor: 'rgba(0,255,0,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  instructions: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'rgba(0, 255, 0, 0.15)',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
    borderWidth: 2,
    borderColor: 'rgba(0,255,0,0.3)',
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  noDataContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  noDataText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 15,
  },
  noDataSubText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});
