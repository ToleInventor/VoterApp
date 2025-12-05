import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

const COUNTY_DATA: Record<string, { subcounties: string[] }> = {
  Nairobi: { subcounties: ['Westlands', 'Embakasi', "Lang'ata", 'Kasarani'] },
  Mombasa: { subcounties: ['Kisauni', 'Likoni', 'Nyali', 'Jomvu'] },
  Kisumu: { subcounties: ['Kisumu Central', 'Kisumu East', 'Kisumu West', 'Seme'] },
  'Taita-Taveta': { subcounties: ['Wundanyi', 'Voi', 'Taveta'] },
};

const formatDate = (date: Date) => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export default function Vote() {
  // --- State ---
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

  const [countyModal, setCountyModal] = useState(false);
  const [districtModal, setDistrictModal] = useState(false);
  const [placeModal, setPlaceModal] = useState(false);
  const [constituencyModal, setConstituencyModal] = useState(false);
  const [pollingWardModal, setPollingWardModal] = useState(false);
  const [pollingStationModal, setPollingStationModal] = useState(false);

  const [dobPicker, setDobPicker] = useState(false);
  const [doiPicker, setDoiPicker] = useState(false);

  const fullName = `${voter.firstName} ${voter.secondName} ${voter.surName}`.trim();

  const updateField = useCallback((key: keyof typeof voter, value: string) => {
    setVoter(prev => ({ ...prev, [key]: value }));
  }, []);

  const subcountyList = useMemo(() => {
    if (!voter.county) return [];
    return COUNTY_DATA[voter.county]?.subcounties || [];
  }, [voter.county]);

  const handleSubmission = useCallback(() => {
    if (!voter.firstName || !voter.idNumber || !voter.serialNo) {
      Alert.alert('Missing Information', 'Please fill in all mandatory fields.');
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowQRCode(true);
    }, 1500);
  }, [voter]);

  const handleDateChange = (key: 'dateOfBirth' | 'dateOfIssue') => (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS !== 'ios') {
      key === 'dateOfBirth' ? setDobPicker(false) : setDoiPicker(false);
    }
    if (date) updateField(key, formatDate(date));
  };

  // --- Render ---
  const renderInput = (label: string, value: string, onChange?: (text: string) => void, placeholder = '', editable = true) => (
    <View style={styles.items}>
      <Text style={styles.text}>{label}:</Text>
      <TextInput
        style={styles.textInputStyle}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#ddd"
        editable={editable}
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
                style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' }}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text style={{ fontSize: 16 }}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity onPress={onClose} style={{ marginTop: 10, alignSelf: 'center', padding: 10, backgroundColor: '#eee', borderRadius: 8 }}>
            <Text style={{ textAlign: 'center' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <ImageBackground source={require('../assets/images/flag-kenya.jpg')} style={styles.body} resizeMode="cover">
      <View style={styles.cover}>
        <Text style={styles.headerText}>VOTER DETAILS</Text>
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          {renderInput('Serial Number', voter.serialNo, t => updateField('serialNo', t), 'Enter Serial Number')}
          {renderInput('First Name', voter.firstName, t => updateField('firstName', t), 'Enter First Name')}
          {renderInput('Second Name', voter.secondName, t => updateField('secondName', t), 'Enter Second Name')}
          {renderInput('Surname', voter.surName, t => updateField('surName', t), 'Enter Surname')}
          {renderInput('ID Number', voter.idNumber, t => updateField('idNumber', t), 'Enter ID Number')}
          
          {/* Date of Birth */}
          <TouchableOpacity onPress={() => setDobPicker(true)} style={styles.inputAreaa}>
            <Text style={{ color: 'white' }}>{voter.dateOfBirth || 'Select Date of Birth'}</Text>
          </TouchableOpacity>
          {dobPicker && <DateTimePicker value={new Date()} mode="date" display="default" onChange={handleDateChange('dateOfBirth')} />}
          
          {/* Sex */}
          <TouchableOpacity style={styles.inputAreaa} onPress={() => Alert.alert('Select Sex', '', [{ text: 'Male', onPress: () => updateField('sex', 'Male') }, { text: 'Female', onPress: () => updateField('sex', 'Female') }])}>
            <Text style={{ color: 'white' }}>{voter.sex || 'Select Sex'}</Text>
          </TouchableOpacity>

          {/* County */}
          <TouchableOpacity style={styles.inputAreaa} onPress={() => setCountyModal(true)}>
            <Text style={{ color: 'white' }}>{voter.county || 'Select County'}</Text>
          </TouchableOpacity>

          {/* Subcounty */}
          <TouchableOpacity style={styles.inputAreaa} onPress={() => {
            if (!voter.county) { Alert.alert('Select County First'); return; }
            setDistrictModal(true);
          }}>
            <Text style={{ color: 'white' }}>{voter.districtOfBirth || 'Select Subcounty / District'}</Text>
          </TouchableOpacity>

          {/* Place of Issue */}
          <TouchableOpacity style={styles.inputAreaa} onPress={() => {
            if (!voter.county) { Alert.alert('Select County First'); return; }
            setPlaceModal(true);
          }}>
            <Text style={{ color: 'white' }}>{voter.placeOfIssue || 'Select Place of Issue'}</Text>
          </TouchableOpacity>

          {/* Date of Issue */}
          <TouchableOpacity onPress={() => setDoiPicker(true)} style={styles.inputAreaa}>
            <Text style={{ color: 'white' }}>{voter.dateOfIssue || 'Select Date of Issue'}</Text>
          </TouchableOpacity>
          {doiPicker && <DateTimePicker value={new Date()} mode="date" display="default" onChange={handleDateChange('dateOfIssue')} />}

          {/* Electors Number */}
          {renderInput('Electors Number', voter.electorsNumber, t => updateField('electorsNumber', t), 'Enter Electors Number')}

          {/* Registration Centre */}
          {renderInput('Registration Centre', voter.registrationCentre, t => updateField('registrationCentre', t), 'Enter Registration Centre')}

          {/* Constituency */}
          <TouchableOpacity style={styles.inputAreaa} onPress={() => setConstituencyModal(true)}>
            <Text style={{ color: 'white' }}>{voter.constituency || 'Select Constituency'}</Text>
          </TouchableOpacity>

          {/* Polling Ward */}
          <TouchableOpacity style={styles.inputAreaa} onPress={() => setPollingWardModal(true)}>
            <Text style={{ color: 'white' }}>{voter.pollingWard || 'Select Polling Ward'}</Text>
          </TouchableOpacity>

          {/* Polling Station */}
          <TouchableOpacity style={styles.inputAreaa} onPress={() => setPollingStationModal(true)}>
            <Text style={{ color: 'white' }}>{voter.pollingStation || 'Select Polling Station'}</Text>
          </TouchableOpacity>
        </ScrollView>

        <TouchableOpacity style={[styles.actionButton, isSaving && { opacity: 0.6 }]} onPress={handleSubmission} disabled={isSaving}>
          {isSaving ? <ActivityIndicator color="#fff" /> : <>
            <Ionicons name="checkmark-circle-outline" size={28} color="white" />
            <Text style={styles.buttonText}>Save and Continue</Text>
          </>}
        </TouchableOpacity>

        {/* --- Picker Modals --- */}
        {pickerModal(countyModal, 'Select County', Object.keys(COUNTY_DATA), c => updateField('county', c), () => setCountyModal(false))}
        {pickerModal(districtModal, 'Select Subcounty', subcountyList, d => updateField('districtOfBirth', d), () => setDistrictModal(false))}
        {pickerModal(placeModal, 'Select Place of Issue', subcountyList, p => updateField('placeOfIssue', p), () => setPlaceModal(false))}
        {pickerModal(constituencyModal, 'Select Constituency', ['Constituency 1','Constituency 2'], c => updateField('constituency', c), () => setConstituencyModal(false))}
        {pickerModal(pollingWardModal, 'Select Polling Ward', ['Ward 1','Ward 2'], p => updateField('pollingWard', p), () => setPollingWardModal(false))}
        {pickerModal(pollingStationModal, 'Select Polling Station', ['Station 1','Station 2'], p => updateField('pollingStation', p), () => setPollingStationModal(false))}

        {/* QR Code Modal */}
        <Modal visible={showQRCode} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowQRCode(false)}>
                <Ionicons name="close-circle" size={32} color="#666" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>QR Code Generated</Text>
              <View style={styles.qrContainer}>
                <QRCode value={JSON.stringify(voter)} size={200} color="#2907c0ff" backgroundColor="white" />
              </View>
              <Text style={styles.qrText}>Scan to verify voter details</Text>
            </View>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1 },
  cover: { flex: 1, padding: 20, backgroundColor: '#08032eff', opacity: 0.8 },
  headerText: { fontSize: 22, fontWeight: 'bold', color: 'white', textAlign: 'center', marginVertical: 10 },
  items: { borderRadius: 8, borderWidth: 3, borderColor: 'purple', flexDirection: 'row', padding: 12, backgroundColor: 'rgba(16, 166, 116, 0.9)', marginVertical: 5, justifyContent: 'space-between', alignItems: 'center' },
  text: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  textt: { color: '#661adfff', fontWeight: 'bold', fontSize: 16 },
  textInputStyle: { flex: 1, color: '#fff', fontSize: 16, paddingHorizontal: 10 },
  inputAreaa: { padding: 10, borderRadius: 8, borderWidth: 3, borderColor: 'purple', backgroundColor: 'rgba(16, 166, 116, 0.9)', marginVertical: 5, justifyContent: 'center' },
  actionButton: { backgroundColor: '#b15252ff', height: 50, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 20 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 17 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', width: '90%', padding: 20, borderRadius: 20, alignItems: 'center' },
  closeButton: { position: 'absolute', top: 15, right: 15 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginVertical: 10 },
  qrContainer: { padding: 20, backgroundColor: 'white', borderRadius: 12 },
  qrText: { fontSize: 16, color: '#444', marginTop: 15, textAlign: 'center' },
});
