import Constants from 'expo-constants';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Keyboard, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const API_KEY = Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

// Custom hook for Google Places API search
const usePlacesSearch = (query: string, location: { latitude: number; longitude: number; } | null) => {
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const searchPlaces = async (searchQuery: string) => {
        if (searchQuery.length < 3) {
            setResults([]);
            return;
        }
        if (!location) {
            console.log("Search is waiting for your location to be available.");
            return;
        }
        if (!API_KEY) {
            console.error("API key is missing. Make sure it's defined in your app.config.js extra section.");
            return;
        }

        setLoading(true);
        try {
            const endpoint = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(searchQuery)}&key=${API_KEY}&location=${location.latitude}%2C${location.longitude}&radius=20000`;
            console.log('Fetching from Google Places API:', endpoint);

            const response = await fetch(endpoint);
            const data = await response.json();
            
            console.log('Google Places API response:', JSON.stringify(data, null, 2));

            if (data.predictions) {
                setResults(data.predictions);
            } else {
                console.warn('Google Places API returned an error:', data.error_message || data.status);
                setResults([]);
            }
        } catch (error) {
            console.error('Google Places API request failed:', error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const debouncedSearch = useCallback(debounce(searchPlaces, 500), [location]);

    useEffect(() => {
        if (query) {
            debouncedSearch(query);
        } else {
            setResults([]);
        }
    }, [query, debouncedSearch]);

    return { results, loading, setResults, searchPlaces };
};

interface GooglePlacesAutocompleteProps {
    onPlaceSelect: (details: { lat: number; lng: number; }) => void;
    currentLocation: { latitude: number; longitude: number; } | null;
}

const GooglePlacesAutocomplete: React.FC<GooglePlacesAutocompleteProps> = ({ onPlaceSelect, currentLocation }) => {
    const [query, setQuery] = useState('');
    const { results, loading, setResults, searchPlaces } = usePlacesSearch(query, currentLocation);

    const handleSelect = async (place: any) => {
        Keyboard.dismiss();
        setQuery(place.description);
        setResults([]); // Clear results list

        try {
            const endpoint = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&key=${API_KEY}&fields=geometry`;
            const response = await fetch(endpoint);
            const data = await response.json();
            if (data.result?.geometry?.location) {
                onPlaceSelect(data.result.geometry.location);
            }
        } catch (error) {
            console.error('Failed to fetch place details:', error);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.resultItem} onPress={() => handleSelect(item)}>
            <Text style={styles.resultText}>{item.description}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Search for a business or place..."
                placeholderTextColor="#888"
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={() => searchPlaces(query)}
            />
            {loading && <ActivityIndicator style={styles.loader} />}
            {results.length > 0 && (
                <FlatList
                    data={results}
                    keyExtractor={(item) => item.place_id}
                    renderItem={renderItem}
                    style={styles.resultsList}
                    keyboardShouldPersistTaps="handled"
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 40,
        left: 16,
        right: 16,
        zIndex: 10,
    },
    input: {
        height: 44,
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ddd',
        color: '#000', // Explicitly set text color
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    loader: {
        position: 'absolute',
        top: 12,
        right: 12,
    },
    resultsList: {
        backgroundColor: '#fff',
        borderRadius: 8,
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        maxHeight: 240,
    },
    resultItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    resultText: {
        fontSize: 16,
        color: '#000', // Ensure text is black and readable
    },
});

export default GooglePlacesAutocomplete;