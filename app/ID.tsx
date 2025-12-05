import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  KeyboardTypeOptions,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getProfile, saveProfile, subscribeToProfileChanges, UnifiedProfile } from '../lib/storageHelper';

interface UserDetails {
  serialNo: string;
  firstName: string;
  lastName: string;
  surname: string;
  idNumber: string;
  dateOfBirth: string;
  sex: string;
  county: string;
  districtOfBirth: string;
  placeOfIssue: string;
  dateOfIssue: string;
}

interface IDProps {
  details: UserDetails;
  onEdit: () => void;
}

interface NewProps {
  onSave: (details: UserDetails) => void;
  initialData?: UserDetails;
}

interface InputFieldProps {
  label: string;
  value: string;
  onChangeKey: (text: string) => void;
  placeholder: string;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
}

interface DatePickerInputProps {
  label: string;
  value: string;
  onChange: (dateString: string) => void;
}

const formatDate = (dateObj: Date): string => {
  if (!dateObj) return '';
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  return `${day}-${month}-${year}`;
};

const InputField = React.memo(function InputField({
  label,
  value,
  onChangeKey,
  placeholder,
  keyboardType = 'default',
  maxLength,
}: InputFieldProps) {
  return (
    <View style={styles.inputArea}>
      <Text style={styles.text}>{label}:</Text>
      <TextInput
        style={styles.textInputStyle}
        value={value}
        onChangeText={onChangeKey}
        placeholder={placeholder}
        placeholderTextColor="#ccc"
        keyboardType={keyboardType}
        maxLength={maxLength}
        blurOnSubmit={false}
        returnKeyType="next"
      />
    </View>
  );
});
InputField.displayName = 'InputField';

const DatePickerInput = React.memo(function DatePickerInput({
  label,
  value,
  onChange,
}: DatePickerInputProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) {
      onChange(formatDate(selectedDate));
    }
  };

  const dateObject = value ? new Date(value.split('-').reverse().join('-')) : new Date();

  return (
    <View style={styles.inputArea}>
      <Text style={styles.text}>{label}:</Text>
      <TouchableOpacity style={styles.inputAreaa} onPress={() => setShowPicker(true)}>
        <Ionicons name="calendar-number" size={24} color="white" />
        <Text style={{ color: 'white', marginLeft: 8 }}>{value || 'Select date'}</Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker value={dateObject} mode="date" display="default" onChange={handleDateChange} />
      )}
    </View>
  );
});
DatePickerInput.displayName = 'DatePickerInput';

const COUNTY_DATA: Record<
  string,
  {
    subcounties: string[];
  }
> = {
  'Nairobi': {
    subcounties: ['Westlands', 'Embakasi', "Lang'ata", 'Kasarani'],
  },
 'Mombasa': {
    subcounties: ['Kisauni', 'Likoni', 'Nyali', 'Jomvu'],
  },
  'Kisumu': {
    subcounties: ['Kisumu Central', 'Kisumu East', 'Kisumu West', 'Seme'],
  },
  'Taita-Taveta': {
    subcounties: ['Wundanyi', 'Voi', "Taveta"],
  },
};

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
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ backgroundColor: '#fff', width: '86%', maxHeight: '70%', borderRadius: 12, padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' }}>{title}</Text>
          <ScrollView>
            {items.map((it) => (
              <TouchableOpacity
                key={it}
                onPress={() => {
                  onSelect(it);
                }}
                style={{ paddingVertical: 10, borderBottomWidth: 2, borderRadius: 5, paddingStart: 4 }}
              >
                <Text style={{ fontSize: 16 }}>{it}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            onPress={onClose}
            style={{ marginTop: 12, alignSelf: 'center', backgroundColor: '#eee', padding: 10, borderRadius: 8, width: '60%' }}
          >
            <Text style={{ textAlign: 'center' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function SexPicker({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <View style={styles.inputArea}>
        <Text style={styles.text}>Sex:</Text>
        <TouchableOpacity style={{ padding: 10 }} onPress={() => setVisible(true)}>
          <Text style={{ color: 'white', fontSize: 18 }}>{value ? value : 'Select'}</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={visible} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', width: '80%', padding: 18, borderRadius: 12 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 12 }}>Select Sex</Text>
            {['Male ', 'Female '].map((g) => (
              <TouchableOpacity
                key={g}
                onPress={() => {
                  onChange(g);
                  setVisible(false);
                }}
                style={{ paddingVertical: 10 }}
              >
                <Text style={{ fontSize: 18, textAlign: 'center' }}>{g}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setVisible(false)} style={{ marginTop: 12, backgroundColor: '#eee', padding: 10, borderRadius: 8 }}>
              <Text style={{ textAlign: 'center' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

export default function Identity() {
  const [userType, setUserType] = useState<'loading' | 'new' | 'existing'>('loading');
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      const profile = await getProfile();
      if (profile?.idNumber) {
        setUserDetails({
          serialNo: profile.serialNo || '',
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          surname: profile.surname || '',
          idNumber: profile.idNumber || '',
          dateOfBirth: profile.dateOfBirth || '',
          sex: profile.sex || '',
          county: profile.county || '',
          districtOfBirth: profile.districtOfBirth || '',
          placeOfIssue: profile.placeOfIssue || '',
          dateOfIssue: profile.dateOfIssue || '',
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

  const handleDetailsSaved = useCallback(
    (details: UserDetails) => {
      setUserDetails(details);
      setUserType('existing');
    },
    []
  );

  if (userType === 'loading') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10a674" />
        <Text style={{ marginTop: 10, color: 'white' }}>Loading application state...</Text>
      </View>
    );
  }

  return (
    <ImageBackground source={require('../assets/images/flag-kenya.jpg')} style={styles.body}>
      <View style={styles.cover}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
          {userType === 'existing' ? <ID details={userDetails!} onEdit={() => setUserType('new')} /> : <New onSave={handleDetailsSaved} initialData={userDetails!} />}
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

export function ID({ details, onEdit }: IDProps) {
  return (
    <View style={styles.itemsContainer}>
      <Text style={styles.textLabel}>EXISTING USER DETAILS</Text>
      <View style={styles.items}>
        <Text style={styles.text}>Serial Number:</Text>
        <Text style={styles.textt}>{details.serialNo || 'N/A'}</Text>
      </View>
      <View style={styles.items}>
        <Text style={styles.text}>First Name:</Text>
        <Text style={styles.textt}>{details.firstName || 'N/A'}</Text>
      </View>
      <View style={styles.items}>
        <Text style={styles.text}>Last Name:</Text>
        <Text style={styles.textt}>{details.lastName || 'N/A'}</Text>
      </View>
      <View style={styles.items}>
        <Text style={styles.text}>Surname:</Text>
        <Text style={styles.textt}>{details.surname || 'N/A'}</Text>
      </View>
      <View style={styles.items}>
        <Text style={styles.text}>ID Number:</Text>
        <Text style={styles.textt}>{details.idNumber || 'N/A'}</Text>
      </View>
      <View style={styles.items}>
        <Text style={styles.text}>Date of Birth:</Text>
        <Text style={styles.textt}>{details.dateOfBirth || 'N/A'}</Text>
      </View>
      <View style={styles.items}>
        <Text style={styles.text}>Sex:</Text>
        <Text style={styles.textt}>{details.sex || 'N/A'}</Text>
      </View>
      <View style={styles.items}>
        <Text style={styles.text}>County of Birth:</Text>
        <Text style={styles.textt}>{details.county || 'N/A'}</Text>
      </View>
      <View style={styles.items}>
        <Text style={styles.text}>District of Birth:</Text>
        <Text style={styles.textt}>{details.districtOfBirth || 'N/A'}</Text>
      </View>
      <View style={styles.items}>
        <Text style={styles.text}>Place of Issue:</Text>
        <Text style={styles.textt}>{details.placeOfIssue || 'N/A'}</Text>
      </View>
      <View style={styles.items}>
        <Text style={styles.text}>Date of Issue:</Text>
        <Text style={styles.textt}>{details.dateOfIssue || 'N/A'}</Text>
      </View>
      <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
        <Ionicons name="create-outline" size={24} color="white" />
        <Text style={styles.buttonText}>Edit details</Text>
      </TouchableOpacity>
    </View>
  );
}

export function New({ onSave, initialData }: NewProps) {
  const [formData, setFormData] = useState<UserDetails>({
    serialNo: initialData?.serialNo || '',
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    surname: initialData?.surname || '',
    idNumber: initialData?.idNumber || '',
    dateOfBirth: initialData?.dateOfBirth || '',
    sex: initialData?.sex || '',
    county: initialData?.county || '',
    districtOfBirth: initialData?.districtOfBirth || '',
    placeOfIssue: initialData?.placeOfIssue || '',
    dateOfIssue: initialData?.dateOfIssue || '',
  });

  const [isSaving, setIsSaving] = useState(false);

  const [countyModalVisible, setCountyModalVisible] = useState(false);
  const [districtModalVisible, setDistrictModalVisible] = useState(false);
  const [placeModalVisible, setPlaceModalVisible] = useState(false);

  const updateField = useCallback((key: keyof UserDetails, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handlers = useMemo(
    () => ({
      serialNo: (val: string) => updateField('serialNo', val),
      firstName: (val: string) => updateField('firstName', val),
      lastName: (val: string) => updateField('lastName', val),
      surname: (val: string) => updateField('surname', val),
      idNumber: (val: string) => updateField('idNumber', val),
      sex: (val: string) => updateField('sex', val),
      districtOfBirth: (val: string) => updateField('districtOfBirth', val),
      placeOfIssue: (val: string) => updateField('placeOfIssue', val),
      dateOfIssue: (val: string) => updateField('dateOfIssue', val),
    }),
    [updateField]
  );

  const countyList = useMemo(() => Object.keys(COUNTY_DATA), []);
  const subcountyListForSelectedCounty = useMemo(() => {
    if (!formData.county) return [];
    return COUNTY_DATA[formData.county]?.subcounties || [];
  }, [formData.county]);

  const handleSubmission = useCallback(async () => {
    if (!formData.firstName || !formData.idNumber || !formData.serialNo) {
      Alert.alert('Missing Information', 'Please fill in all mandatory fields.');
      return;
    }
    setIsSaving(true);
    try {
      const profile = (await getProfile()) || ({} as UnifiedProfile);
      await saveProfile({ ...profile, ...formData });
      Alert.alert('Success', initialData ? 'Details updated successfully!' : 'Details saved and user profile created.');
      onSave(formData);
    } catch (err) {
      console.warn('save error', err);
      Alert.alert('Error saving data', 'There was an issue saving your details.');
    } finally {
      setIsSaving(false);
    }
  }, [formData, initialData, onSave]);

  return (
    <View style={styles.cover}>
      <Text style={styles.headerText}>{initialData ? 'EDIT USER DETAILS' : 'NEW USER REGISTRATION'}</Text>

      <InputField
        label="Serial number"
        value={formData.serialNo}
        onChangeKey={handlers.serialNo}
        placeholder="Enter Serial number"
        keyboardType="numeric"
      />

      <InputField label="First Name" value={formData.firstName} onChangeKey={handlers.firstName} placeholder="Enter First Name" />
      <InputField label="Last Name" value={formData.lastName} onChangeKey={handlers.lastName} placeholder="Enter Last Name" />
      <InputField label="Surname" value={formData.surname} onChangeKey={handlers.surname} placeholder="Enter Surname" />
      <InputField
        label="ID Number"
        value={formData.idNumber}
        onChangeKey={handlers.idNumber}
        placeholder="Enter ID Number"
        keyboardType="numeric"
        maxLength={10}
      />

      <DatePickerInput label="Date of Birth" value={formData.dateOfBirth} onChange={(dateString) => updateField('dateOfBirth', dateString)} />

      <SexPicker value={formData.sex} onChange={(val) => updateField('sex', val)} />

      <View style={styles.inputArea}>
        <Text style={styles.text}>County of Birth:</Text>
        <TouchableOpacity onPress={() => setCountyModalVisible(true)} style={{ padding: 10 }}>
          <Text style={{ color: 'white', fontSize: 16 }}>{formData.county || 'Select county'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputArea}>
        <Text style={styles.text}>Subcounty:</Text>
        <TouchableOpacity
          onPress={() => {
            if (!formData.county) {
              Alert.alert('Select county first', 'Please select a county to choose its subcounties.');
              return;
            }
            setDistrictModalVisible(true);
          }}
          style={{ padding: 10 }}
        >
          <Text style={{ color: 'white', fontSize: 16 }}>{formData.districtOfBirth || 'Select district'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputArea}>
        <Text style={styles.text}>Place of Issue (subcounty):</Text>
        <TouchableOpacity
          onPress={() => {
            if (!formData.county) {
              Alert.alert('Select county first', 'Please select a county to choose its places of issue.');
              return;
            }
            setPlaceModalVisible(true);
          }}
          style={{ padding: 10 }}
        >
          <Text style={{ color: 'white', fontSize: 16 }}>{formData.placeOfIssue || 'Select place of issue'}</Text>
        </TouchableOpacity>
      </View>

      <DatePickerInput label="Date of Issue" value={formData.dateOfIssue} onChange={(dateString) => updateField('dateOfIssue', dateString)} />

      {isSaving ? (
        <ActivityIndicator size="large" color="#b15252" style={{ marginTop: 30 }} />
      ) : (
        <TouchableOpacity style={styles.actionButton} onPress={handleSubmission}>
          <Ionicons name="checkmark-circle-outline" size={24} color="white" />
          <Text style={styles.buttonText}>{initialData ? 'Update Details' : 'Save and Continue'}</Text>
        </TouchableOpacity>
      )}

      <PickerModal
        visible={countyModalVisible}
        title="Select County"
        items={countyList}
        onClose={() => setCountyModalVisible(false)}
        onSelect={(county) => {
          updateField('county', county);
          updateField('districtOfBirth', '');
          updateField('placeOfIssue', '');
          setCountyModalVisible(false);
        }}
      />

      <PickerModal
        visible={districtModalVisible}
        title={`Select District / Subcounty (${formData.county})`}
        items={subcountyListForSelectedCounty}
        onClose={() => setDistrictModalVisible(false)}
        onSelect={(district) => {
          updateField('districtOfBirth', district);
          setDistrictModalVisible(false);
        }}
      />

      <PickerModal
        visible={placeModalVisible}
        title={`Select Place of Issue (${formData.county})`}
        items={subcountyListForSelectedCounty}
        onClose={() => setPlaceModalVisible(false)}
        onSelect={(place) => {
          updateField('placeOfIssue', place);
          setPlaceModalVisible(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, backgroundColor: '#08032eff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  itemsContainer: {
    backgroundColor: 'rgba(16, 166, 116, 0.9)',
    padding: 20,
    borderRadius: 15,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  items: {
    borderRadius: 8,
    borderColor: 'purple',
    borderTopWidth: 3,
    borderEndWidth: 3,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderStyle: 'solid',
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputArea: {
    borderRadius: 8,
    borderColor: 'purple',
    borderTopWidth: 3,
    borderEndWidth: 3,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderStyle: 'solid',
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'rgba(16, 166, 116, 0.9)',
    marginVertical: 5,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputAreaa: {
    padding: 5,
    backgroundColor: 'rgba(16, 166, 116, 0.9)',
    borderRadius: 8,
    borderWidth: 3,
    borderColor: 'purple',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
  },
  textInputStyle: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    paddingRight: 10,
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  textLabel: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  textt: {
    color: '#661adfff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#b15252ff',
    height: 50,
    width: '70%',
    alignSelf: 'center',
    borderRadius: 12,
    marginTop: 30,
    flexDirection: 'row',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cover: {
    flex: 1,
    backgroundColor: '#08032eff',
    padding: 20,
    justifyContent: 'center',
    opacity: 0.7,
  },
});
