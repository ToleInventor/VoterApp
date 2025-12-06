import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

const COUNTY_DATA: Record<string, { subcounties: string[] }> = {
  Nairobi: { subcounties: ['Westlands', 'Embakasi', "Lang'ata", 'Kasarani'] },
  Mombasa: { subcounties: ['Kisauni', 'Likoni', 'Nyali', 'Jomvu'] },
  Kisumu: { subcounties: ['Kisumu Central', 'Kisumu East', 'Kisumu West', 'Seme'] },
  'Taita-Taveta': { subcounties: ['Wundanyi', 'Voi', 'Taveta'] },
};

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

// ✅ Generate decrypt map ONCE (ZERO collisions)
Object.entries(SYMBOL_MAP.encrypt).forEach(([key, value]) => {
  SYMBOL_MAP.decrypt[value] = key;
});

const substitute = (text: string, map: Record<string, string>): string => {
  return text.split('').map(ch => map[ch] || ch).join('');
};

// ✅ 5-ROUND ENCRYPTION
const encryptRounds = (text: string, rounds: number = 1): string => {
  let result = text;
  for (let i = 0; i < rounds; i++) {
    result = substitute(result, SYMBOL_MAP.encrypt);
  }
  return result;
};

const FIELD_NAMES = {
  serialNo: 'serialNo',
  firstName: 'firstName',
  secondName: 'secondName',
  surName: 'surName',
  idNumber: 'idNumber',
  dateOfBirth: 'dateOfBirth',
  sex: 'sex',
  county: 'county',
  districtOfBirth: 'districtOfBirth',
  placeOfIssue: 'placeOfIssue',
  dateOfIssue: 'dateOfIssue',
  electorsNumber: 'electorsNumber',
  registrationCentre: 'registrationCentre',
  pollingStation: 'pollingStation',
  pollingWard: 'pollingWard',
  constituency: 'constituency',
} as const;

const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export default function Vote() {
  const [voter, setVoter] = useState({
    serialNo: '',
    firstName: '',
    secondName: '',
    surName: '',
    idNumber: '',
    dateOfBirth: '',
    sex: '',
    county: '',
    districtOfBirth: '',
    placeOfIssue: '',
    dateOfIssue: '',
    electorsNumber: '',
    registrationCentre: '',
    pollingStation: '',
    pollingWard: '',
    constituency: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrValue, setQrValue] = useState('');
  const [countyModal, setCountyModal] = useState(false);
  const [districtModal, setDistrictModal] = useState(false);
  const [constituencyModal, setConstituencyModal] = useState(false);
  const [pollingWardModal, setPollingWardModal] = useState(false);
  const [pollingStationModal, setPollingStationModal] = useState(false);
  const [dobPicker, setDobPicker] = useState(false);

  const subcountyList = useMemo(() => {
    if (!voter.county) return [];
    return COUNTY_DATA[voter.county]?.subcounties || [];
  }, [voter.county]);

  const updateField = useCallback((key: string, value: string) => {
    setVoter(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSubmission = useCallback(async () => {
    if (!voter.firstName || !voter.idNumber || !voter.serialNo) {
      Alert.alert('Missing Information', 'Please fill Serial No, First Name, and ID Number.');
      return;
    }
    
    setIsSaving(true);
    
    const encryptedEntries = Object.entries(FIELD_NAMES).map(([fieldKey, fieldName]) => {
      const val = voter[fieldKey as keyof typeof voter];
      const valStr = val === undefined || val === null || val === '' ? '' : String(val);
      const encryptedKey = encryptRounds(fieldName, 1);
      const encryptedValue = encryptRounds(valStr, 1);
      return [encryptedKey, encryptedValue] as [string, string];
    });

    const fullyEncryptedVoter = Object.fromEntries(encryptedEntries);
    const qrData = JSON.stringify(fullyEncryptedVoter);
    setQrValue(qrData);
    
    setTimeout(() => {
      setIsSaving(false);
      setShowQRCode(true);
    }, 1000);
  }, [voter]);

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    setDobPicker(false);
    if (date) updateField('dateOfBirth', formatDate(date));
  };

  const renderInput = (label: string, value: string, onChange?: (text: string) => void, placeholder = '') => (
    <View style={styles.items}>
      <Text style={styles.text}>{label}:</Text>
      <TextInput
        style={styles.textInputStyle}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#ddd"
      />
    </View>
  );

  const pickerModal = (visible: boolean, title: string, items: string[], onSelect: (item: string) => void, onClose: () => void) => (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          <ScrollView style={{ maxHeight: 300 }}>
            {items.map(item => (
              <TouchableOpacity
                key={item}
                style={styles.pickerItem}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text style={{ fontSize: 16 }}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
            <Text style={{ fontWeight: '500' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <ImageBackground source={require('../assets/images/flag-kenya.jpg')} style={styles.body} resizeMode="cover">
      <View style={styles.cover}>
        <Text style={styles.headerText}>🇰🇪 VOTER REGISTRATION</Text>
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
          {renderInput('Serial Number *', voter.serialNo, t => updateField('serialNo', t), 'KE/2025/001')}
          {renderInput('First Name *', voter.firstName, t => updateField('firstName', t))}
          {renderInput('Second Name', voter.secondName, t => updateField('secondName', t))}
          {renderInput('Surname *', voter.surName, t => updateField('surName', t))}
          {renderInput('ID Number *', voter.idNumber, t => updateField('idNumber', t))}
          
          <TouchableOpacity onPress={() => setDobPicker(true)} style={styles.inputAreaa}>
            <Text style={styles.inputText}>{voter.dateOfBirth || 'Select Date of Birth'}</Text>
          </TouchableOpacity>
          {dobPicker && <DateTimePicker value={new Date()} mode="date" display="default" onChange={handleDateChange} />}
          
          <TouchableOpacity style={styles.inputAreaa} onPress={() => Alert.alert('Select Sex', '', [
            { text: 'Male', onPress: () => updateField('sex', 'Male') },
            { text: 'Female', onPress: () => updateField('sex', 'Female') }
          ])}>
            <Text style={styles.inputText}>{voter.sex || 'Select Sex'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.inputAreaa} onPress={() => setCountyModal(true)}>
            <Text style={styles.inputText}>{voter.county || 'Select County'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.inputAreaa} onPress={() => {
            if (!voter.county) return Alert.alert('Select County First');
            setDistrictModal(true);
          }}>
            <Text style={styles.inputText}>{voter.districtOfBirth || 'Select Subcounty'}</Text>
          </TouchableOpacity>

          {renderInput('Electors Number', voter.electorsNumber, t => updateField('electorsNumber', t))}
          {renderInput('Registration Centre', voter.registrationCentre, t => updateField('registrationCentre', t))}

          <TouchableOpacity style={styles.inputAreaa} onPress={() => setConstituencyModal(true)}>
            <Text style={styles.inputText}>{voter.constituency || 'Select Constituency'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.inputAreaa} onPress={() => setPollingWardModal(true)}>
            <Text style={styles.inputText}>{voter.pollingWard || 'Select Polling Ward'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.inputAreaa} onPress={() => setPollingStationModal(true)}>
            <Text style={styles.inputText}>{voter.pollingStation || 'Select Polling Station'}</Text>
          </TouchableOpacity>
        </ScrollView>

        <TouchableOpacity style={[styles.actionButton, isSaving && styles.disabledBtn]} 
          onPress={handleSubmission} disabled={isSaving}>
          {isSaving ? <ActivityIndicator color="#fff" /> : (
            <>
              <Ionicons name="qr-code-outline" size={28} color="white" />
              <Text style={styles.buttonText}>Generate QR Code</Text>
            </>
          )}
        </TouchableOpacity>

        {pickerModal(countyModal, 'Counties', Object.keys(COUNTY_DATA), c => updateField('county', c), () => setCountyModal(false))}
        {pickerModal(districtModal, 'Subcounties', subcountyList, d => updateField('districtOfBirth', d), () => setDistrictModal(false))}
        {pickerModal(constituencyModal, 'Constituencies', ['Constituency 1', 'Constituency 2'], c => updateField('constituency', c), () => setConstituencyModal(false))}
        {pickerModal(pollingWardModal, 'Polling Wards', ['Ward 1', 'Ward 2'], w => updateField('pollingWard', w), () => setPollingWardModal(false))}
        {pickerModal(pollingStationModal, 'Polling Stations', ['Station 1', 'Station 2'], s => updateField('pollingStation', s), () => setPollingStationModal(false))}

        <Modal visible={showQRCode} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowQRCode(false)}>
                <Ionicons name="close-circle" size={32} color="#666" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Voter QR Ready</Text>
              
              <View style={styles.qrContainer}>
                <View style={styles.qrBorder}>
                  <QRCode 
                    value={qrValue} 
                    size={220} 
                    color="#000" 
                    backgroundColor="white" 
                  />
                </View>
                <Text style={styles.qrStatus}>Ready to Scan</Text>
              </View>
            </View>
          </View>
        </Modal>

      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1 },
  cover: {
    flex: 1,
    backgroundColor: 'black',
    padding: 20,
    verticalAlign: 'middle',
    justifyContent: 'center',
    opacity: 0.8
  },
  headerText: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#fff', 
    textAlign: 'center', 
    marginVertical: 20 
  },
  items: { 
    borderRadius: 12, 
    borderWidth: 2, 
    borderColor: '#8b5cf6', 
    flexDirection: 'row', 
    padding: 15, 
    backgroundColor: 'rgba(16,185,129,0.95)', 
    marginVertical: 8, 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.25, 
    elevation: 5 
  },
  text: { color: 'white', fontWeight: '700', fontSize: 16 },
  textInputStyle: { flex: 1, color: '#fff', fontSize: 16, paddingHorizontal: 12, marginLeft: 10 },
  inputAreaa: { 
    padding: 15, 
    borderRadius: 12, 
    borderWidth: 2, 
    borderColor: '#8b5cf6', 
    backgroundColor: 'rgba(16,185,129,0.95)', 
    marginVertical: 8, 
    justifyContent: 'center', 
    elevation: 5 
  },
  inputText: { color: 'white', fontSize: 16, fontWeight: '500' },
  actionButton: { 
    backgroundColor: '#ef4444', 
    height: 55, 
    borderRadius: 15, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 12, 
    marginTop: 20, 
    elevation: 8 
  },
  disabledBtn: { opacity: 0.6 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', width: '92%', padding: 25, borderRadius: 25, alignItems: 'center', elevation: 10 },
  closeButton: { position: 'absolute', top: 18, right: 18 },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00FF00',
    textAlign: 'center',
    marginVertical: 20,
    textShadowColor: 'rgba(0, 0, 0, 0)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
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
  pickerItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  cancelBtn: { marginTop: 15, alignSelf: 'center', padding: 12, backgroundColor: '#eee', borderRadius: 8 },
});

