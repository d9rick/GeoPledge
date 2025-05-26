import React, { useState, useEffect } from 'react'
import {
    View,
    StyleSheet,
    ActivityIndicator,
    Text,
    Modal,
    TextInput,
    TouchableOpacity,
    Platform,
} from 'react-native'
import MapView, { Region } from 'react-native-maps'
import * as Location from 'expo-location'
import { Stack } from 'expo-router'
import { Picker } from '@react-native-picker/picker'
import DateTimePicker from '@react-native-community/datetimepicker'

export default function MapScreen() {
    const [loading, setLoading] = useState(true)
    const [region, setRegion] = useState<Region>({
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    })

    const [modalVisible, setModalVisible] = useState(false)
    const [selectedCharity, setSelectedCharity] = useState<string>('Charity A')
    const [donationAmount, setDonationAmount] = useState<string>('')
    const [date, setDate] = useState<Date>(new Date())
    const [showPicker, setShowPicker] = useState(false)

    // 1. get user location
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

    const onSubmit = () => {
        console.log({
            charity: selectedCharity,
            amount: donationAmount,
            time: date.toISOString(),
            coords: { lat: region.latitude, lng: region.longitude },
        })
        setModalVisible(false)
    }

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
            <Stack.Screen options={{ title: 'Pick a Location' }} />

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
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Confirm Details</Text>

                        <Text>
                            Coordinates:{' '}
                            {region.latitude.toFixed(6)},{' '}
                            {region.longitude.toFixed(6)}
                        </Text>

                        <Text style={styles.label}>Charity Selection</Text>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={selectedCharity}
                                onValueChange={v => setSelectedCharity(v)}
                            >
                                <Picker.Item label="Charity A" value="Charity A" />
                                <Picker.Item label="Charity B" value="Charity B" />
                                <Picker.Item label="Charity C" value="Charity C" />
                            </Picker>
                        </View>

                        <Text style={styles.label}>Donation Amount</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            placeholder="Enter amount"
                            value={donationAmount}
                            onChangeText={setDonationAmount}
                        />

                        <Text style={styles.label}>Select Time</Text>
                        <TouchableOpacity
                            onPress={() => setShowPicker(true)}
                            style={styles.input}
                        >
                            <Text>{date.toLocaleTimeString()}</Text>
                        </TouchableOpacity>

                        {showPicker && (
                            <DateTimePicker
                                value={date}
                                mode="time"
                                is24Hour={false}
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={(_, newDate) => {
                                    setShowPicker(false)
                                    if (newDate) setDate(newDate)
                                }}
                            />
                        )}

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.button, { flex: 1, marginRight: 8 }]}
                                onPress={onSubmit}
                            >
                                <Text style={styles.buttonText}>Submit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, { flex: 1, backgroundColor: '#aaa' }]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
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
        flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center', alignItems: 'center',
    },
    modalContent: {
        width: '85%', backgroundColor: 'white',
        borderRadius: 12, padding: 16,
    },
    modalTitle: {
        fontSize: 18, fontWeight: '600', marginBottom: 12,
    },
    label: { marginTop: 12, fontWeight: '500' },
    pickerWrapper: {
        borderWidth: 1, borderColor: '#ccc',
        borderRadius: 6, marginTop: 4,
    },
    input: {
        borderWidth: 1, borderColor: '#ccc',
        borderRadius: 6, padding: 8, marginTop: 4,
    },
    modalButtons: {
        flexDirection: 'row', marginTop: 16,
    },
})
