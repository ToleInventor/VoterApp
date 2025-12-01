import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  KeyboardTypeOptions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface UserDetails {
    serialNo: string;
    firstName: string;
    lastName: string;
    surname: string;
    idNumber: string;
    dateOfBirth: string;
    sex: string;
    districtOfBirth: string;
    placeOfIssue: string;
    dateOfIssue: string;
}

interface IDProps {
    details: UserDetails | null;
    onEdit: () => void;
}

interface NewProps {
    onSave: (details: UserDetails) => void;
    initialData?: UserDetails | null;
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

const STORAGE_KEY_USER_TYPE = 'userType';
const STORAGE_KEY_USER_DETAILS = 'userDetailsss';

const formatDate = (dateObj: Date): string => {
    if (!dateObj) return '';
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
};

export default function Identity() {
  const [userType, setUserType] = useState<'loading' | 'new' | 'existing'>('loading');
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    try {
      const storedDetails = await AsyncStorage.getItem(STORAGE_KEY_USER_DETAILS);
      if (storedDetails) {
        setUserDetails(JSON.parse(storedDetails) as UserDetails);
        setUserType('existing');
      } else {
        setUserType('new');
      }
    } catch (_) {
      setUserType('new');
    }
  };

  const handleDetailsSaved = (details: UserDetails) => {
    setUserDetails(details);
    setUserType('existing');
  };

  if (userType === 'loading') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading application state...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {userType === 'existing' ? 
        <ID details={userDetails} onEdit={() => setUserType('new')} /> : 
        <New onSave={handleDetailsSaved} initialData={userDetails} />
      }
    </View>
  );
}

export function ID({ details, onEdit }: IDProps){
  return(
      <ImageBackground source={require('../assets/images/flag-kenya.jpg')} style={styles.body} resizeMode="cover">
          <Text style={styles.headerText}>EXISTING USER DETAILS</Text>
          <ScrollView contentContainerStyle={{flexGrow: 1}}>
              <View style={styles.items}>
                  <Text style={styles.text}>Serial number: </Text>
                  <Text style={styles.textt}>{details?.serialNo || 'N/A'}</Text>
              </View>
              <View style={styles.items}>
                  <Text style={styles.text}>First Name: </Text>
                  <Text style={styles.textt}>{details?.firstName || 'N/A'}</Text>
              </View>
              <View style={styles.items}>
                  <Text style={styles.text}>Last Name: </Text>
                  <Text style={styles.textt}>{details?.lastName || 'N/A'}</Text>
              </View>
              <View style={styles.items}>
                  <Text style={styles.text}>Surname: </Text>
                  <Text style={styles.textt}>{details?.surname || 'N/A'}</Text>
              </View>
              <View style={styles.items}>
                  <Text style={styles.text}>ID NUMBER: </Text>
                  <Text style={styles.textt}>{details?.idNumber || 'N/A'}</Text>
              </View>
              <View style={styles.items}>
                  <Text style={styles.text}>Date of Birth: </Text>
                  <Text style={styles.textt}>{details?.dateOfBirth || 'N/A'}</Text>
              </View>
              <View style={styles.items}>
                  <Text style={styles.text}>SEX</Text>
                  <Text style={styles.textt}>{details?.sex || 'N/A'}</Text>
              </View>
              <View style={styles.items}>
                  <Text style={styles.text}>District of Birth: </Text>
                  <Text style={styles.textt}>{details?.districtOfBirth || 'N/A'}</Text>
              </View>
              <View style={styles.items}>
                  <Text style={styles.text}>Place of Issue</Text>
                  <Text style={styles.textt}>{details?.placeOfIssue || 'N/A'}</Text>
              </View>
              <View style={styles.items}>
                  <Text style={styles.text}>Date of issue: </Text>
                  <Text style={styles.textt}>{details?.dateOfIssue || 'N/A'}</Text>
              </View>

              <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
                  <Ionicons name='create-outline' size={28} color="white"/>
                  <Text style={styles.buttonText}>Edit details</Text>
              </TouchableOpacity>
          </ScrollView>
      </ImageBackground>
  );
}

export function New({ onSave, initialData }: NewProps){
    const [formData, setFormData] = useState<UserDetails>({
        serialNo: initialData?.serialNo || '', 
        firstName: initialData?.firstName || '', 
        lastName: initialData?.lastName || '', 
        surname: initialData?.surname || '', 
        idNumber: initialData?.idNumber || '',
        dateOfBirth: initialData?.dateOfBirth || '', 
        sex: initialData?.sex || '', 
        districtOfBirth: initialData?.districtOfBirth || '', 
        placeOfIssue: initialData?.placeOfIssue || '', 
        dateOfIssue: initialData?.dateOfIssue || '',
    });
    const [isSaving, setIsSaving] = useState(false);

    const updateField = (key: keyof UserDetails, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmission = async () => {
        if (!formData.firstName || !formData.idNumber || !formData.serialNo) {
            Alert.alert("Missing Information", "Please fill in all mandatory fields.");
            return;
        }
        setIsSaving(true);
        try {
            await AsyncStorage.setItem(STORAGE_KEY_USER_DETAILS, JSON.stringify(formData));
            await AsyncStorage.setItem(STORAGE_KEY_USER_TYPE, 'existing');
            Alert.alert("Success", initialData ? "Details updated successfully!" : "Details saved and user profile created.");
            onSave(formData);
        } catch {
            Alert.alert("Error saving data", "There was an issue saving your details.");
        } finally {
            setIsSaving(false);
        }
    };

    const DatePickerInput = ({ label, value, onChange }: DatePickerInputProps) => {
        const [showPicker, setShowPicker] = useState(false);
        
        const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
            setShowPicker(Platform.OS === 'ios'); 
            if (selectedDate) { onChange(formatDate(selectedDate)); }
        };
        const dateObject = value ? new Date(value.split('-').reverse().join('-')) : new Date();

        return (
            <View style={{ marginBottom: 15 }}>
                <Text style={styles.textLabel}>{label}: </Text>
                <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.inputArea}>
                    <Text style={styles.textInputStyle}>
                        {value || `Tap to select ${label}`}
                    </Text>
                    <Ionicons name="calendar-outline" size={24} color="#fff" />
                </TouchableOpacity>
                {showPicker && (<DateTimePicker value={dateObject} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={handleDateChange} />)}
            </View>
        );
    };

    const InputField = ({ label, value, onChangeKey, placeholder, keyboardType = 'default', maxLength }: InputFieldProps) => (
        <View style={{ marginBottom: 15 }}>
            <Text style={styles.textLabel}>{label}: </Text>
            <View style={styles.inputArea}>
                <TextInput 
                    style={styles.textInputStyle}
                    placeholder={placeholder}
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                    value={value}
                    onChangeText={onChangeKey}
                    keyboardType={keyboardType}
                    maxLength={maxLength}
                />
            </View>
        </View>
    );

    const headerText = initialData ? 'EDIT USER DETAILS' : 'NEW USER REGISTRATION';

    return(
        <ImageBackground source={require('../assets/images/flag-kenya.jpg')} style={styles.body} resizeMode="cover">
            <Text style={styles.headerText}>{headerText}</Text>
            <ScrollView contentContainerStyle={{flexGrow: 1, paddingBottom: 20}}>
                
                <InputField label="Serial Number" value={formData.serialNo} onChangeKey={(val) => updateField('serialNo', val)} placeholder="Enter Serial number" keyboardType="numeric" />
                <InputField label="First Name" value={formData.firstName} onChangeKey={(val) => updateField('firstName', val)} placeholder="Enter First Name" />
                <InputField label="ID Number" value={formData.idNumber} onChangeKey={(val) => updateField('idNumber', val)} placeholder="Enter ID Number" keyboardType="numeric" maxLength={10} />
                <InputField label="Last Name" value={formData.lastName} onChangeKey={(val) => updateField('lastName', val)} placeholder="Enter Last Name" />
                <InputField label="Surname" value={formData.surname} onChangeKey={(val) => updateField('surname', val)} placeholder="Enter Surname" />
                
                <DatePickerInput label="Date of Birth" value={formData.dateOfBirth} onChange={(dateString) => updateField('dateOfBirth', dateString)} />
                
                <InputField label="Sex (M/F)" value={formData.sex} onChangeKey={(val) => updateField('sex', val)} placeholder="M or F" maxLength={1} />
                <InputField label="District of Birth" value={formData.districtOfBirth} onChangeKey={(val) => updateField('districtOfBirth', val)} placeholder="Enter District" />
                
                <DatePickerInput label="Date of Issue" value={formData.dateOfIssue} onChange={(dateString) => updateField('dateOfIssue', dateString)} />
                <InputField label="Place of Issue" value={formData.placeOfIssue} onChangeKey={(val) => updateField('placeOfIssue', val)} placeholder="Enter Place of Issue" />

                <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={handleSubmission}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Ionicons name={initialData ? 'save-outline' : 'checkmark-circle-outline'} size={28} color={'white'}/>
                            <Text style={styles.buttonText}>{initialData ? 'Update Details' : 'Save and Continue'}</Text>
                        </>
                    )}
                </TouchableOpacity>
                
            </ScrollView>
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
  items: { 
    borderRadius: 8,
    borderEndColor: 'purple',
    borderTopColor: 'purple',
    borderEndWidth: 3,
    borderBottomColor: 'blue',
    borderStartWidth: 3,
    borderStartColor: 'blue',
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'rgba(16, 166, 116, 0.9)', 
    marginVertical: 5,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputArea: {
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
  textInputStyle: { 
    flex: 1,
    color: '#fff', 
    fontSize: 18,
    paddingRight: 10, 
  },
  text: { 
    color: '#fff',
    fontWeight: 'bold',
    padding: 5,
    fontSize: 18
  },
  textLabel: { 
    color: '#fff',
    fontWeight: 'bold',
    paddingHorizontal: 5,
    marginTop: 10,
    marginBottom: 4,
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 3
  },
  textt: { 
    color: '#661adfff',
    fontWeight: 'bold',
    padding: 5,
    fontSize: 18
  },
  actionButton: {
    justifyContent: 'center', 
    alignItems:'center', 
    backgroundColor: '#b15252ff', 
    height: 50, 
    width: '60%', 
    alignSelf: 'center', 
    borderRadius: 10,
    marginTop: 30,
    flexDirection: 'row',
    gap: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
