import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

export default function Vote() {
  // State variables
  const [newSerial, setNewSerial] = useState('');
  const [newFirstName, setNewFirstName] = useState('');
  const [newSecondName, setNewSecondName] = useState('');
  const [newSurName, setNewSurName] = useState('');
  const [newIDNumber, setNewIDNumber] = useState('');
  const [newDateOfBirth, setNewDateOfBirth] = useState('');
  const [newSex, setNewSex] = useState('');
  const [newDistrictOfBirth, setNewDistrictOfBirth] = useState('');
  const [newPlaceOfIssue, setNewPlaceOfIssue] = useState('');
  const [newDateOfIssue, setNewDateOfIssue] = useState('');
  const [newElectorsNumber, setNewElectorsNumber] = useState('');
  const [newRegistrationCentre, setNewRegistrationCentre] = useState('');
  const [newPollingStation, setNewPollingStation] = useState('');
  const [newPollingWard, setNewPollingWard] = useState('');
  const [newConstituency, setNewConstituency] = useState('');
  const [newCounty, setNewCounty] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  const fullName = `${newFirstName} ${newSecondName} ${newSurName}`.trim();

  // Render Input Field
  const renderInputField = useCallback(
    (
      section: string,
      label: string,
      value: string,
      placeholder: string,
      onChange: (text: string) => void,
      editable = true
    ) => (
      <View style={styles.items} key={`${section}-${label}`}>
        <Text style={styles.text}>{label}:</Text>
        <TextInput
          style={styles.textInputStyle}
          placeholder={placeholder}
          placeholderTextColor="#ddd"
          value={value}
          onChangeText={onChange}
          editable={editable}
        />
      </View>
    ),
    []
  );

  // Submission
  const handleSubmission = useCallback(() => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowQRCode(true);
    }, 1500);
  }, []);

  const closeQRModal = useCallback(() => setShowQRCode(false), []);

  return (
    <ImageBackground
      source={require('../assets/images/flag-kenya.jpg')}
      style={styles.body}
      resizeMode="cover"
    >
      <View style={styles.cover}>
        <Text style={styles.headerText}>GENERATE QR CODE FOR ANOTHER PERSON</Text>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator
          keyboardShouldPersistTaps="handled"
        >
          {/* ID DETAILS */}
          <Text style={styles.headerTextt}>ID DETAILS</Text>
          {renderInputField("ID", "Serial Number", newSerial, "Enter Serial Number", setNewSerial)}
          {renderInputField("ID", "First Name", newFirstName, "Enter First Name", setNewFirstName)}
          {renderInputField("ID", "Second Name", newSecondName, "Enter Second Name", setNewSecondName)}
          {renderInputField("ID", "Surname", newSurName, "Enter Surname", setNewSurName)}
          {renderInputField("ID", "ID Number", newIDNumber, "Enter ID Number", setNewIDNumber)}
          {renderInputField("ID", "Date of Birth", newDateOfBirth, "DD-MM-YYYY", setNewDateOfBirth)}
          {renderInputField("ID", "Sex", newSex, "M/F", setNewSex)}
          {renderInputField("ID", "District of Birth", newDistrictOfBirth, "Enter District of Birth", setNewDistrictOfBirth)}
          {renderInputField("ID", "Place of Issue", newPlaceOfIssue, "Enter Place of Issue", setNewPlaceOfIssue)}
          {renderInputField("ID", "Date of Issue", newDateOfIssue, "DD-MM-YYYY", setNewDateOfIssue)}

          {/* VOTER CARD DETAILS */}
          <Text style={styles.headerTextt}>VOTER CARD DETAILS</Text>
          {renderInputField("VoterCard", "Electors Number", newElectorsNumber, "Enter Electors Number", setNewElectorsNumber)}
          {renderInputField("VoterCard", "Full Name", fullName, "", () => {}, false)}
          {renderInputField("VoterCard", "Registration Centre", newRegistrationCentre, "Enter Registration Centre", setNewRegistrationCentre)}
          {renderInputField("VoterCard", "Polling Station", newPollingStation, "Enter Polling Station", setNewPollingStation)}
          {renderInputField("VoterCard", "Polling Ward", newPollingWard, "Enter Polling Ward", setNewPollingWard)}
          {renderInputField("VoterCard", "Constituency", newConstituency, "Enter Constituency", setNewConstituency)}
          {renderInputField("VoterCard", "County", newCounty, "Enter County", setNewCounty)}
        </ScrollView>

        <TouchableOpacity
          style={[styles.actionButton, isSaving && styles.disabledButton]}
          onPress={handleSubmission}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={28} color="white" />
              <Text style={styles.buttonText}>Save and Continue</Text>
            </>
          )}
        </TouchableOpacity>

        {/* QR Modal */}
        <Modal visible={showQRCode} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.closeButton} onPress={closeQRModal}>
                <Ionicons name="close-circle" size={32} color="#666" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>QR Code Generated</Text>
              <View style={styles.qrContainer}>
                <QRCode
                  value={JSON.stringify({
                    serialNo: newSerial,
                    firstName: newFirstName,
                    lastName: newSecondName,
                    surname: newSurName,
                    idNumber: newIDNumber,
                    dateOfBirth: newDateOfBirth,
                    sex: newSex,
                    districtOfBirth: newDistrictOfBirth,
                    placeOfIssue: newPlaceOfIssue,
                    dateOfIssue: newDateOfIssue,
                    electorsNumber: newElectorsNumber,
                    fullName: fullName,
                    registrationCentre: newRegistrationCentre,
                    pollingStation: newPollingStation,
                    pollingWard: newPollingWard,
                    constituency: newConstituency,
                    county: newCounty
                  })}
                  size={200}
                  color="#2907c0ff"
                  backgroundColor="white"
                />
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
  cover: {
    flex: 1,
    backgroundColor: '#08032eff',
    padding: 20,
    justifyContent: 'center',
    opacity: 0.7,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginVertical: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  headerTextt: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 25,
    marginBottom: 10,
  },
  scrollContent: { paddingBottom: 100 },
  items: {
    borderRadius: 8,
    borderEndColor: 'purple',
    borderTopColor: 'purple',
    borderEndWidth: 3,
    borderBottomColor: 'blue',
    borderStartWidth: 3,
    borderStartColor: 'blue',
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'rgba(16, 166, 116, 0.9)',
    marginVertical: 5,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: { color: '#fff', fontWeight: 'bold', fontSize: 16, flex: 1 },
  textInputStyle: { flex: 2, color: '#fff', fontSize: 16, paddingHorizontal: 10, paddingVertical: 5 },
  actionButton: {
    backgroundColor: '#b15252ff',
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
  },
  disabledButton: { opacity: 0.6 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 17 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '90%',
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  closeButton: { position: 'absolute', top: 15, right: 15 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 25 },
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  qrText: { fontSize: 16, color: '#444', marginTop: 15, textAlign: 'center' },
});
