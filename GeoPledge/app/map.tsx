import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    StyleSheet,
    ActivityIndicator,
    Text,
    Modal,
    TextInput,
    TouchableOpacity,
    Platform,
    TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Animated,
} from 'react-native';
import MapView, { Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {AuthContext, useAuth} from '@/contexts/AuthContext';
import { useRouter } from "expo-router";
import api from "@/utils/api";
import ScrollView = Animated.ScrollView;

export const screenOptions = {
    headerShown: true,
    title: 'Pick a Location',
};

export default function MapScreen() {
    const { signOut } = useContext(AuthContext);
    const { userToken } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true)
    const [region, setRegion] = useState<Region>({
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    })

    const [modalVisible, setModalVisible] = useState(false)
    const [charities, setCharities] = useState<{ id: string, name: string }[]>([]);
    const [selectedCharity, setSelectedCharity] = useState<string>('');
    const [donationAmount, setDonationAmount] = useState<string>('')
    const [date, setDate] = useState<Date>(new Date())
    const [showPicker, setShowPicker] = useState(false)
    const [pledgeName, setPledgeName] = useState('');

    // Redirect to login if user not logged in
    useEffect(() => {
        if (!userToken) {
            router.replace('/login');
        }
    });

    // load charities on mount
    useEffect(() => {
        api.get('/api/charities', {
            headers: { Authorization: `Bearer ${userToken}` }
        })
            .then(res => {
                setCharities(res.data);
                if (res.data.length) {
                    setSelectedCharity(res.data[0].id);
                }
            })
            .catch(console.error);
    }, [userToken]);

    // Get user location
    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync()
            if (status !== 'granted') {
                console.warn('Location permission denied')
                setLoading(false)
                return
            }
            const loc = await Location.getCurrentPositionAsync({})
            const { latitude, longitude } = loc.coords
            setRegion(r => ({ ...r, latitude, longitude }))
            setLoading(false)
        })()
    }, [])

    const onSelectLocation = () => {
        setModalVisible(true)
    }

    const onSubmit = async () => {
        const payload = {
            name: pledgeName.trim() || 'Untitled Pledge',
            targetLatitude: region.latitude,
            targetLongitude: region.longitude,
            radiusMeters: 100,
            stakeCents: Math.round(parseFloat(donationAmount) * 100),
            charityId: selectedCharity,
            daysOfWeek: [date.getDay()],
            timeHour: date.getHours(),
            timeMinute: date.getMinutes(),
        };

        try {
            const res = await api.post('/api/pledges', payload, {
                headers: { 'Authorization': `Bearer ${userToken}` }
            });
            console.log('Pledge created:', res.data);
            setModalVisible(false);
            router.push('/pledges');
        } catch (err) {
            console.error('Failed to create pledge', err);
            // TODO: show user‐facing error message
        }
    };

    if (loading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" />
                <Text>Fetching your location…</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>

            {/* Log out button */}
            <TouchableOpacity
                style={{ position: 'absolute', top: Platform.OS === 'ios' ? 60 : 30, right: 16, zIndex: 20 }}
                onPress={async () => {
                    await signOut();
                    router.replace('/login'); // Redirect to login after signing out
                }}
            >
                <Text style={{ color: 'red', fontWeight: '600' }}>Log Out</Text>
            </TouchableOpacity>

            <MapView
                style={styles.map}
                region={region}
                onRegionChangeComplete={r => setRegion(r)}
            />

            {/* Center pin */}
            <Text style={styles.pin}>📍</Text>

            {/* Select button */}
            <TouchableOpacity
                style={styles.button}
                onPress={onSelectLocation}
                activeOpacity={0.7}
            >
                <Text style={styles.buttonText}>Select Location</Text>
            </TouchableOpacity>

            {/* Modal Form */}
            {/* Modal Form */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalOverlay}>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                            style={styles.modalContainer}
                        >
                            <ScrollView
                                contentContainerStyle={styles.modalContent}
                                keyboardShouldPersistTaps="handled"
                            >
                                <Text style={styles.modalTitle}>New Pledge</Text>

                                {/* Pledge Name */}
                                <Text style={styles.label}>Pledge Name</Text>
                                <TextInput
                                    style={[styles.input, styles.inputText]}
                                    placeholder="Name this pledge (e.g., Morning Run)"
                                    placeholderTextColor="#888"
                                    value={pledgeName}
                                    onChangeText={setPledgeName}
                                    returnKeyType="done"
                                />

                                {/* Coordinates */}
                                <Text style={styles.coordinates}>
                                    Coordinates: {region.latitude.toFixed(6)}, {region.longitude.toFixed(6)}
                                </Text>

                                {/* Charity Picker */}
                                <Text style={styles.label}>Charity Selection</Text>
                                <View style={styles.pickerWrapper}>
                                    <Picker
                                        selectedValue={selectedCharity}
                                        onValueChange={setSelectedCharity}
                                        dropdownIconColor="#000"
                                        style={{ color: '#000' }} // selected item color
                                    >
                                        {charities.map(c => (
                                            <Picker.Item
                                                key={c.id}
                                                label={c.name}
                                                value={c.id}
                                                color="#000"
                                            />
                                        ))}
                                    </Picker>
                                </View>

                                {/* Stake */}
                                <Text style={styles.label}>Stake Amount (USD)</Text>
                                <TextInput
                                    style={[styles.input, styles.inputText]}
                                    keyboardType="numeric"
                                    placeholder="Amount in USD"
                                    placeholderTextColor="#888"
                                    value={donationAmount}
                                    onChangeText={setDonationAmount}
                                    returnKeyType="done"
                                />

                                {/* Time */}
                                <Text style={styles.label}>Select Time</Text>
                                <TouchableOpacity
                                    onPress={() => setShowPicker(true)}
                                    style={[styles.input]}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.timeText}>
                                        {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </TouchableOpacity>
                                {showPicker && (
                                    <DateTimePicker
                                        value={date}
                                        mode="time"
                                        is24Hour={false}
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        onChange={(_, newDate) => {
                                            setShowPicker(false);
                                            if (newDate) setDate(newDate);
                                        }}
                                        textColor={Platform.OS === 'ios' ? '#000' : undefined} // iOS only
                                    />
                                )}

                                {/* Submit + Cancel */}
                                <View style={styles.buttonRow}>
                                    <TouchableOpacity
                                        style={styles.submitButton}
                                        onPress={onSubmit}
                                    >
                                        <Text style={styles.submitText}>Submit</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.cancelButton}
                                        onPress={() => setModalVisible(false)}
                                    >
                                        <Text style={styles.cancelText}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        </KeyboardAvoidingView>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>

    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
    loading: {
        flex: 1, justifyContent: 'center', alignItems: 'center'
    },
    pin: {
        position: 'absolute',
        top: '50%', left: '50%',
        marginLeft: -12, marginTop: -24, // adjust for pin size
        fontSize: 36,
        zIndex: 10,
    },
    button: {
        position: 'absolute',
        bottom: 40, alignSelf: 'center',
        backgroundColor: '#007AFF',
        paddingVertical: 12, paddingHorizontal: 24,
        borderRadius: 24,
    },
    buttonText: { color: 'white', fontWeight: '600' },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '90%',
        maxHeight: '80%',
    },
    modalContent: {
        backgroundColor: '#fefefe', // slight contrast from full white
        borderRadius: 10,
        padding: 20,
        width: '100%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        textAlign: 'center',
    },
    coordinates: {
        marginBottom: 12,
        color: '#555',
    },
    label: {
        color: '#333',
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
        marginTop: 10,
    },
    pickerWrapper: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        marginBottom: 10,
    },
    picker: {
        width: '100%',
    },
    pickerItem: {
        color: '#000', // ensures dropdown item text is visible
    },
    input: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        paddingVertical: 10,
        paddingHorizontal: 12,
        color: '#000', // ensure black text
        marginBottom: 10,
    },
    inputText: {
        color: '#000',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    submitButton: {
        flex: 1,
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 4,
        alignItems: 'center',
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#ccc',
        padding: 12,
        borderRadius: 4,
        alignItems: 'center',
        marginLeft: 10,
    },
    submitText: {
        color: '#fff',
        fontWeight: '600',
    },
    cancelText: {
        color: '#333',
        fontWeight: '600',
    },
    timeText: {
        color: '#000',
        fontSize: 16,
    },
});