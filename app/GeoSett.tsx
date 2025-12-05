import { router } from 'expo-router';
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
  View
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getProfile, saveProfile, subscribeToProfileChanges, UnifiedProfile } from '../lib/storageHelper';

interface GeoSettings {
  pollingStation: string;
  pollingWard: string;
  constituency: string;
  county: string;
  registrationCentre: string;
}

interface IDProps {
  settings: GeoSettings;
  onEdit: () => void;
}

interface NewProps {
  onSave: (settings: GeoSettings) => void;
  initialData?: GeoSettings;
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

export default function GeoSettingsScreen() {
  const [userType, setUserType] = useState<'loading' | 'new' | 'existing'>('loading');
  const [geoSettings, setGeoSettings] = useState<GeoSettings | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      const profile = await getProfile();
      if (profile?.pollingStation || profile?.county) {
        setGeoSettings({
          pollingStation: profile.pollingStation || '',
          pollingWard: profile.pollingWard || '',
          constituency: profile.constituency || '',
          county: profile.county || '',
          registrationCentre: profile.registrationCentre || '',
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

  const handleSettingsSaved = useCallback((settings: GeoSettings) => {
    setGeoSettings(settings);
    setUserType('existing');
  }, []);

  if (userType === 'loading') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10a674" />
        <Text style={{ marginTop: 10, color: 'white' }}>Loading geographical settings...</Text>
      </View>
    );
  }

  return (
    <ImageBackground source={require('../assets/images/flag-kenya.jpg')} style={styles.body} resizeMode="cover">
      <View style={styles.cover}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }} keyboardShouldPersistTaps="handled">
          {userType === 'existing' ? (
            <GeoSettingsView settings={geoSettings!} onEdit={() => setUserType('new')} />
          ) : (
            <GeoSettingsForm onSave={handleSettingsSaved} initialData={geoSettings!} />
          )}
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

export function GeoSettingsView({ settings, onEdit }: IDProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.headerText}>CURRENT GEOGRAPHICAL SETTINGS</Text>
      {Object.entries(settings).map(([key, value]) => (
        <View key={key} style={styles.navItem}>
          <Text style={styles.navText}>{key.replace(/([A-Z])/g, ' $1')}</Text>
          <Text style={styles.navValue}>{value || 'N/A'}</Text>
        </View>
      ))}
      <View style={{ flexDirection: 'row',}}>
      <Text style={{ fontWeight: 'bold'}}>Note:</Text>
      <Text style ={ { fontSize: 14, color: 'white' } }>In order to edit thid settings, you might be forced to edit them through the ID card or Voters Card interfaces</Text>
      </View>
      <TouchableOpacity style={styles.actionButton} onPress={ async ()=> {router.push('/VoterD')} }>
        <Ionicons name="create-outline" size={24} color="white" />
        <Text style={styles.buttonText}>Edit Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

export function GeoSettingsForm({ onSave, initialData }: NewProps) {
  const [formData, setFormData] = useState<GeoSettings>({
    pollingStation: initialData?.pollingStation || '',
    pollingWard: initialData?.pollingWard || '',
    constituency: initialData?.constituency || '',
    county: initialData?.county || '',
    registrationCentre: initialData?.registrationCentre || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const updateField = useCallback((key: keyof GeoSettings, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handlers = useMemo(
    () => ({
      pollingStation: (val: string) => updateField('pollingStation', val),
      pollingWard: (val: string) => updateField('pollingWard', val),
      constituency: (val: string) => updateField('constituency', val),
      county: (val: string) => updateField('county', val),
      registrationCentre: (val: string) => updateField('registrationCentre', val),
    }),
    [updateField]
  );

  const handleSubmission = useCallback(async () => {
    if (!formData.pollingStation || !formData.county || !formData.constituency) {
      Alert.alert('Missing Information', 'Please fill in Polling Station, Constituency, and County.');
      return;
    }
    setIsSaving(true);
    try {
      const profile = (await getProfile()) || ({} as UnifiedProfile);
      await saveProfile({ ...profile, ...formData });
      Alert.alert('Success', initialData ? 'Settings updated successfully!' : 'Geographical settings saved.');
      onSave(formData);
    } catch {
      Alert.alert('Error saving data', 'There was an issue saving your settings.');
    } finally {
      setIsSaving(false);
    }
  }, [formData, initialData, onSave]);

  const headerText = initialData ? 'EDIT GEOGRAPHICAL SETTINGS' : 'SET GEOGRAPHICAL SETTINGS';

  return (
    <View style={styles.card}>
      <Text style={styles.headerText}>{headerText}</Text>
      {Object.entries(formData).map(([key, value]) => (
        <InputField
          key={key}
          label={key.replace(/([A-Z])/g, ' $1')}
          value={value}
          onChangeKey={handlers[key as keyof GeoSettings]}
          placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1')}`}
        />
      ))}
      {isSaving ? (
        <ActivityIndicator size="large" color="#b15252" style={{ marginTop: 30 }} />
      ) : (
        <TouchableOpacity style={styles.actionButton} onPress={handleSubmission}>
          <Ionicons name="checkmark-circle-outline" size={24} color="white" />
          <Text style={styles.buttonText}>{initialData ? 'Update Settings' : 'Save Settings'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1 },
  cover: {
    flex: 1,
    backgroundColor: '#08032eff',
    padding: 20,
    opacity: 0.85,
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
