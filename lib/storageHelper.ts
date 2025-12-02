import AsyncStorage from '@react-native-async-storage/async-storage';

export const PROFILE_KEY = 'voterAppProfile';

export interface UnifiedProfile {
  serialNo?: string; firstName?: string; lastName?: string; surname?: string;
  idNumber?: string; dateOfBirth?: string; sex?: string; districtOfBirth?: string;
  placeOfIssue?: string; dateOfIssue?: string;
  newPlaceOfIssue?: string; 
  electorsNumber?: string; fullName?: string;
  registrationCentre?: string; pollingStation?: string; pollingWard?: string;
  constituency?: string; county?: string;
}

let refreshListeners: (() => void)[] = [];

export const subscribeToProfileChanges = (callback: () => void): (() => void) => {
  refreshListeners.push(callback);
  return () => { refreshListeners = refreshListeners.filter(cb => cb !== callback); };
};

export const triggerProfileRefresh = (): void => {
  refreshListeners.forEach(callback => callback());
};

export const getProfile = async (): Promise<UnifiedProfile | null> => {
  try {
    const data = await AsyncStorage.getItem(PROFILE_KEY);
    return data ? JSON.parse(data) as UnifiedProfile : null;
  } catch { return null; }
};

export const saveProfile = async (profile: UnifiedProfile): Promise<void> => {
  try {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    triggerProfileRefresh();
  } catch {}
};
