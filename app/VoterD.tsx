import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
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

const STORAGE_KEY_USER_DETAILS = 'userDetailss';

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
            <Text style={styles.headerText}>EXISTING VOTER DETAILS</Text>
            <ScrollView contentContainerStyle={{flexGrow: 1}}>
                <View style={styles.items}>
                    <Text style={styles.text}>Electors Number: </Text>
                    <Text style={styles.textt}>{details?.electorsNumber || 'N/A'}</Text>
                </View>
                <View style={styles.items}>
                    <Text style={styles.text}>Full Name: </Text>
                    <Text style={styles.textt}>{details?.fullName || 'N/A'}</Text>
                </View>
                <View style={styles.items}>
                    <Text style={styles.text}>ID Number: </Text>
                    <Text style={styles.textt}>{details?.idNumber || 'N/A'}</Text>
                </View>
                <View style={styles.items}>
                    <Text style={styles.text}>Registration Centre: </Text>
                    <Text style={styles.textt}>{details?.registrationCentre || 'N/A'}</Text>
                </View>
                <View style={styles.items}>
                    <Text style={styles.text}>Polling Station: </Text>
                    <Text style={styles.textt}>{details?.pollingStation || 'N/A'}</Text>
                </View>
                <View style={styles.items}>
                    <Text style={styles.text}>Polling Ward: </Text>
                    <Text style={styles.textt}>{details?.pollingWard || 'N/A'}</Text>
                </View>
                <View style={styles.items}>
                    <Text style={styles.text}>Constituency: </Text>
                    <Text style={styles.textt}>{details?.constituency || 'N/A'}</Text>
                </View>
                <View style={styles.items}>
                    <Text style={styles.text}>County: </Text>
                    <Text style={styles.textt}>{details?.county || 'N/A'}</Text>
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

    const updateField = (key: keyof UserDetails, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmission = async () => {
        if (!formData.fullName || !formData.idNumber || !formData.electorsNumber) {
            Alert.alert("Missing Information", "Please fill in all mandatory fields.");
            return;
        }
        setIsSaving(true);
        try {
            await AsyncStorage.setItem(STORAGE_KEY_USER_DETAILS, JSON.stringify(formData));
            Alert.alert("Success", initialData ? "Details updated successfully!" : "Details saved and voter profile created.");
            onSave(formData);
        } catch {
            Alert.alert("Error saving data", "There was an issue saving your details.");
        } finally {
            setIsSaving(false);
        }
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

    const headerText = initialData ? 'EDIT VOTER DETAILS' : 'NEW VOTER REGISTRATION';

    return(
        <ImageBackground source={require('../assets/images/flag-kenya.jpg')} style={styles.body} resizeMode="cover">
            <Text style={styles.headerText}>{headerText}</Text>
            <ScrollView contentContainerStyle={{flexGrow: 1, paddingBottom: 20}}>
                
                <InputField label="Electors Number" value={formData.electorsNumber} onChangeKey={(val) => updateField('electorsNumber', val)} placeholder="Enter Electors Number" keyboardType="numeric" />
                <InputField label="Full Name" value={formData.fullName} onChangeKey={(val) => updateField('fullName', val)} placeholder="Enter Full Name" />
                <InputField label="ID Number" value={formData.idNumber} onChangeKey={(val) => updateField('idNumber', val)} placeholder="Enter ID Number" keyboardType="numeric" maxLength={10} />
                <InputField label="Registration Centre" value={formData.registrationCentre} onChangeKey={(val) => updateField('registrationCentre', val)} placeholder="Enter Registration Centre" />
                <InputField label="Polling Station" value={formData.pollingStation} onChangeKey={(val) => updateField('pollingStation', val)} placeholder="Enter Polling Station" />
                <InputField label="Polling Ward" value={formData.pollingWard} onChangeKey={(val) => updateField('pollingWard', val)} placeholder="Enter Polling Ward" />
                <InputField label="Constituency" value={formData.constituency} onChangeKey={(val) => updateField('constituency', val)} placeholder="Enter Constituency" />
                <InputField label="County" value={formData.county} onChangeKey={(val) => updateField('county', val)} placeholder="Enter County" />

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
        padding: 10,
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
    }
});
