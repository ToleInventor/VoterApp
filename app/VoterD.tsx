import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ImageBackground,
    KeyboardTypeOptions,
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
  electorsNumber: string;
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

interface InputFieldProps {
  label: string;
  value: string;
  onChangeKey: (text: string) => void;
  placeholder: string;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
}

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
      <Text style={styles.label}>{label}:</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeKey}
        placeholder={placeholder}
        placeholderTextColor="#ccc"
        keyboardType={keyboardType}
        maxLength={maxLength}
      />
    </View>
  );
});
InputField.displayName = 'InputField';

export default function VoterDetails() {
  const [userType, setUserType] = useState<'loading' | 'new' | 'existing'>('loading');
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      const profile = await getProfile();
      if (profile?.electorsNumber || profile?.fullName) {
        setUserDetails({
          electorsNumber: profile.electorsNumber || '',
          fullName: profile.fullName || '',
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
    <ImageBackground
      source={require('../assets/images/flag-kenya.jpg')}
      style={styles.body}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }} keyboardShouldPersistTaps="handled">
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
    fullName: initialData?.fullName || '',
    idNumber: initialData?.idNumber || '',
    registrationCentre: initialData?.registrationCentre || '',
    pollingStation: initialData?.pollingStation || '',
    pollingWard: initialData?.pollingWard || '',
    constituency: initialData?.constituency || '',
    county: initialData?.county || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const updateField = useCallback((key: keyof UserDetails, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handlers = useMemo(
    () => ({
      electorsNumber: (val: string) => updateField('electorsNumber', val),
      fullName: (val: string) => updateField('fullName', val),
      idNumber: (val: string) => updateField('idNumber', val),
      registrationCentre: (val: string) => updateField('registrationCentre', val),
      pollingStation: (val: string) => updateField('pollingStation', val),
      pollingWard: (val: string) => updateField('pollingWard', val),
      constituency: (val: string) => updateField('constituency', val),
      county: (val: string) => updateField('county', val),
    }),
    [updateField]
  );

  const handleSubmission = useCallback(async () => {
    if (!formData.fullName || !formData.idNumber || !formData.electorsNumber) {
      Alert.alert('Missing Information', 'Please fill in all mandatory fields.');
      return;
    }
    setIsSaving(true);
    try {
      const profile = (await getProfile()) || ({} as UnifiedProfile);
      await saveProfile({ ...profile, ...formData });
      Alert.alert('Success', initialData ? 'Details updated successfully!' : 'Details saved and voter profile created.');
      onSave(formData);
    } catch {
      Alert.alert('Error saving data', 'There was an issue saving your details.');
    } finally {
      setIsSaving(false);
    }
  }, [formData, initialData, onSave]);

  return (
    <View style={styles.card}>
      <Text style={styles.headerText}>{initialData ? 'EDIT VOTER DETAILS' : 'NEW VOTER REGISTRATION'}</Text>
      {Object.entries(formData).map(([key, value]) => (
        <InputField
          key={key}
          label={key.replace(/([A-Z])/g, ' $1')}
          value={value}
          onChangeKey={handlers[key as keyof UserDetails]}
          placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1')}`}
        />
      ))}
      {isSaving ? (
        <ActivityIndicator size="large" color="#b15252" style={{ marginTop: 30 }} />
      ) : (
        <TouchableOpacity style={styles.actionButton} onPress={handleSubmission}>
          <Ionicons name="checkmark-circle-outline" size={24} color="white" />
          <Text style={styles.buttonText}>{initialData ? 'Update Details' : 'Save and Continue'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: '#08032eff',
    opacity: 0.8,
    padding: 20,
  },
  card: {
    backgroundColor: 'rgba(16, 166, 116, 0.9)',
    padding: 20,
    borderRadius: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  navItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 5,
    alignItems: 'center',
  },
  navText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  navValue: { color: '#661adfff', fontWeight: 'bold', fontSize: 18 },
  inputArea: {
    borderRadius: 12,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 5,
  },
  label: { color: 'white', fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  input: { color: 'white', fontSize: 16, padding: 8 },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#b15252ff',
    height: 50,
    width: '70%',
    alignSelf: 'center',
    borderRadius: 12,
    marginTop: 20,
    flexDirection: 'row',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
