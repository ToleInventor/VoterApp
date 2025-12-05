import React, { useCallback, useEffect, useState } from 'react';
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
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getProfile, saveProfile, subscribeToProfileChanges, UnifiedProfile } from '../lib/storageHelper';

const COUNTY_DATA: Record<string, { constituencies: Record<string, { wards: Record<string, string[]> }> }> = {
  Nairobi: { constituencies: { Westlands: { wards: { Westlands: ['Station A', 'Station B'], Kitisuru: ['Station C'] } } } },
  Mombasa: { constituencies: { Kisauni: { wards: { Kisauni: ['Station D'] } } } },
};

interface UserDetails {
  electorsNumber: string;
  firstName: string;
  lastName: string;
  surname: string;
  fullName: string;
  idNumber: string;
  registrationCentre: string;
  pollingStation: string;
  pollingWard: string;
  constituency: string;
  county: string;
}

interface IDProps {
  details: UserDetails;
  onEdit: () => void;
}

interface NewProps {
  onSave: (details: UserDetails) => void;
  initialData?: UserDetails;
}

function PickerModal({
  visible,
  title,
  items,
  onClose,
  onSelect,
}: {
  visible: boolean;
  title: string;
  items: string[];
  onClose: () => void;
  onSelect: (item: string) => void;
}) {
  return (
    <View>
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalCard}>
            <Text style={styles.modalHeader}>{title}</Text>
            <ScrollView>
              {items.map((it) => (
                <TouchableOpacity key={it} onPress={() => onSelect(it)} style={styles.modalItem}>
                  <Text style={styles.modalText}>{it}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalClose} onPress={onClose}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default function VoterDetails() {
  const [userType, setUserType] = useState<'loading' | 'new' | 'existing'>('loading');
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      const profile = await getProfile();
      if (profile?.electorsNumber) {
        const fullName = [profile.firstName, profile.lastName, profile.surname].filter(Boolean).join(' ');
        setUserDetails({
          electorsNumber: profile.electorsNumber || '',
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          surname: profile.surname || '',
          fullName,
          idNumber: profile.idNumber || '',
          registrationCentre: profile.registrationCentre || '',
          pollingStation: profile.pollingStation || '',
          pollingWard: profile.pollingWard || '',
          constituency: profile.constituency || '',
          county: profile.county || '',
        });
        setUserType('existing');
      } else {
        setUserType('new');
      }
    } catch {
      setUserType('new');
    }
  }, []);

  useEffect(() => {
    loadProfile();
    const unsubscribe = subscribeToProfileChanges(loadProfile);
    return unsubscribe;
  }, [loadProfile]);

  const handleDetailsSaved = useCallback((details: UserDetails) => {
    setUserDetails(details);
    setUserType('existing');
  }, []);

  if (userType === 'loading') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10a674" />
        <Text style={{ marginTop: 10, color: 'white' }}>Loading voter details...</Text>
      </View>
    );
  }

  return (
    <ImageBackground source={require('../assets/images/flag-kenya.jpg')} style={styles.body}>
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
          {userType === 'existing' ? (
            <ID details={userDetails!} onEdit={() => setUserType('new')} />
          ) : (
            <New onSave={handleDetailsSaved} initialData={userDetails!} />
          )}
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

export function ID({ details, onEdit }: IDProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.headerText}>EXISTING VOTER DETAILS</Text>
      {Object.entries(details).map(([key, value]) => (
        <View key={key} style={styles.navItem}>
          <Text style={styles.navText}>{key.replace(/([A-Z])/g, ' $1')}</Text>
          <Text style={styles.navValue}>{value || 'N/A'}</Text>
        </View>
      ))}
      <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
        <Ionicons name="create-outline" size={24} color="white" />
        <Text style={styles.buttonText}>Edit details</Text>
      </TouchableOpacity>
    </View>
  );
}

export function New({ onSave, initialData }: NewProps) {
  const [formData, setFormData] = useState<UserDetails>({
    electorsNumber: initialData?.electorsNumber || '',
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    surname: initialData?.surname || '',
    fullName: initialData?.fullName || '',
    idNumber: initialData?.idNumber || '',
    registrationCentre: initialData?.registrationCentre || '',
    pollingStation: initialData?.pollingStation || '',
    pollingWard: initialData?.pollingWard || '',
    constituency: initialData?.constituency || '',
    county: initialData?.county || '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState<string[]>([]);
  const [modalField, setModalField] = useState<keyof UserDetails | null>(null);

  const openModal = (field: keyof UserDetails, data: string[]) => {
    setModalField(field);
    setModalData(data);
    setModalVisible(true);
  };

  const selectItem = (item: string) => {
    if (!modalField) return;
    const newData = { ...formData, [modalField]: item };

    if (modalField === 'county') {
      newData.constituency = '';
      newData.pollingWard = '';
      newData.pollingStation = '';
    }
    if (modalField === 'constituency') {
      newData.pollingWard = '';
      newData.pollingStation = '';
    }
    if (modalField === 'pollingWard') newData.pollingStation = '';

    setFormData(newData);
    setModalVisible(false);
  };

  const updateFullName = useCallback(() => {
    const fullName = [formData.firstName, formData.lastName, formData.surname].filter(Boolean).join(' ');
    setFormData((prev) => ({ ...prev, fullName }));
  }, [formData.firstName, formData.lastName, formData.surname]);

  useEffect(() => {
    updateFullName();
  }, [formData.firstName, formData.lastName, formData.surname, updateFullName]);


  const handleSubmission = useCallback(async () => {
    if (!formData.fullName || !formData.idNumber || !formData.electorsNumber) {
      Alert.alert('Missing Information', 'Please fill in all mandatory fields.');
      return;
    }
    setIsSaving(true);
    try {
      const profile: UnifiedProfile = {
        countyOfBirth: '',
        ...formData,
      };
      await saveProfile(profile);
      Alert.alert('Success', 'Voter profile saved successfully.');
      onSave(formData);
    } catch {
      Alert.alert('Error', 'There was an issue saving your details.');
    } finally {
      setIsSaving(false);
    }
  }, [formData, onSave]);

  return (
    <View style={styles.card}>
      <Text style={styles.headerText}>NEW VOTER REGISTRATION</Text>

      {/* Text inputs for firstName, lastName, surname, idNumber, registrationCentre */}
      {['firstName', 'lastName', 'surname', 'idNumber', 'registrationCentre'].map((key) => (
        <View key={key} style={styles.inputArea}>
          <Text style={styles.label}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
          <TextInput
            style={styles.input}
            placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
            placeholderTextColor="#ccc"
            value={formData[key as keyof UserDetails] as string}
            onChangeText={(text) => setFormData({ ...formData, [key]: text })}
          />
        </View>
      ))}

      {/* County → Constituency → Ward → Station */}
      <TouchableOpacity style={styles.inputArea} onPress={() => openModal('county', Object.keys(COUNTY_DATA))}>
        <Text style={styles.label}>County</Text>
        <Text style={styles.input}>{formData.county || 'Select County'}</Text>
      </TouchableOpacity>

      {formData.county && (
        <TouchableOpacity
          style={styles.inputArea}
          onPress={() => openModal('constituency', Object.keys(COUNTY_DATA[formData.county].constituencies))}
        >
          <Text style={styles.label}>Constituency</Text>
          <Text style={styles.input}>{formData.constituency || 'Select Constituency'}</Text>
        </TouchableOpacity>
      )}

      {formData.constituency && (
        <TouchableOpacity
          style={styles.inputArea}
          onPress={() =>
            openModal(
              'pollingWard',
              Object.keys(COUNTY_DATA[formData.county].constituencies[formData.constituency].wards)
            )
          }
        >
          <Text style={styles.label}>Polling Ward</Text>
          <Text style={styles.input}>{formData.pollingWard || 'Select Ward'}</Text>
        </TouchableOpacity>
      )}

      {formData.pollingWard && (
        <TouchableOpacity
          style={styles.inputArea}
          onPress={() =>
            openModal(
              'pollingStation',
              COUNTY_DATA[formData.county].constituencies[formData.constituency].wards[formData.pollingWard]
            )
          }
        >
          <Text style={styles.label}>Polling Station</Text>
          <Text style={styles.input}>{formData.pollingStation || 'Select Station'}</Text>
        </TouchableOpacity>
      )}

      {isSaving ? (
        <ActivityIndicator size="large" color="#b15252" style={{ marginTop: 30 }} />
      ) : (
        <TouchableOpacity style={styles.actionButton} onPress={handleSubmission}>
          <Ionicons name="checkmark-circle-outline" size={24} color="white" />
          <Text style={styles.buttonText}>Save and Continue</Text>
        </TouchableOpacity>
      )}

      <PickerModal visible={modalVisible} title={modalField || ''} items={modalData} onClose={() => setModalVisible(false)} onSelect={selectItem} />
    </View>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1 },
  overlay: { flex: 1, backgroundColor: '#08032eff', opacity: 0.9, padding: 20 },
  card: { backgroundColor: 'rgba(16, 166, 116, 0.9)', padding: 20, borderRadius: 15, marginVertical: 10 },
  headerText: { fontSize: 22, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 15 },
  navItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 5 },
  navText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  navValue: { color: '#661adfff', fontWeight: 'bold', fontSize: 18 },
  inputArea: { borderRadius: 12, padding: 12, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 5, flexDirection: 'row', justifyContent: 'space-between' },
  label: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  input: { color: 'white', fontSize: 16 },
  actionButton: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#b15252ff', height: 50, width: '70%', alignSelf: 'center', borderRadius: 12, marginTop: 20, flexDirection: 'row', gap: 10 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalBackground: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000aa' },
  modalCard: { width: '85%', backgroundColor: 'white', borderRadius: 12, padding: 20, maxHeight: '70%' },
  modalHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333', textAlign: 'center' },
  modalItem: { backgroundColor: 'white', padding: 15, marginVertical: 5, borderRadius: 8 },
  modalText: { color: 'black', fontSize: 18, fontWeight: 'bold', borderBottomWidth: 2, borderRadius: 5, paddingStart: 6 },
  modalClose: { backgroundColor: '#b15252', padding: 15, borderRadius: 8, marginTop: 10, alignItems: 'center' },
  modalCloseText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
