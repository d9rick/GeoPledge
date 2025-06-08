import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import api from "@/utils/api";

// Pledge data interface
interface Pledge {
    id: string;
    name?: string;
    nextScheduledRun?: string;
    stakeCents: number;
    lastStatus?: 'MET' | 'VIOLATED' | null;
}

const PledgeListScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp<any>>();
    const { userToken } = useAuth();
    const router = useRouter();
    const [pledges, setPledges] = useState<Pledge[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPledges = async () => {
        try {
            setLoading(true);
            const response = await api.get<Pledge[]>('/api/pledges', {
                headers: { Authorization: `Bearer ${userToken}` },
            });
            setPledges(response.data);
        } catch {
            setError('Failed to load pledges');
        } finally {
            setLoading(false);
        }
    };

    // load once on component mount
    useEffect(() => {
        fetchPledges();
    }, []);

    const onPledgePress = (pledgeId: string) => {
        navigation.navigate('PledgeDetail', { pledgeId });
    };

    const renderItem = ({ item }: { item: Pledge }) => (
        <PledgeCard pledge={item} onPress={() => onPledgePress(item.id)} />
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <Text>{error}</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <FlatList
                data={pledges}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={pledges.length === 0 && styles.center}
                ListEmptyComponent={<Text>No pledges found. Create one to get started!</Text>}
            />
            {/* Floating “Add” button */}
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('/map')}
            >
                <MaterialIcons name="add" size={32} color="white" />
            </TouchableOpacity>
        </View>
    );
};

// each of the little cards
const PledgeCard: React.FC<{ pledge: Pledge; onPress: () => void }> = ({ pledge, onPress }) => {
    // Normalize status
    const status = pledge.lastStatus ?? 'PENDING';
    const statusIconName =
        status === 'MET'
            ? 'check-circle'
            : status === 'VIOLATED'
                ? 'cancel'
                : 'hourglass-empty';
    const statusColor = status === 'MET' ? 'green' : status === 'VIOLATED' ? 'red' : 'gray';

    // Format money and date (guard against missing data)
    const formattedStake = `$${(pledge.stakeCents / 100).toFixed(2)}`;
    const formattedNext = pledge.nextScheduledRun
        ? new Date(pledge.nextScheduledRun).toLocaleString()
        : 'No scheduled run';

    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>
                    {pledge.name?.trim() || 'Unnamed Pledge'}
                </Text>
                <Text style={styles.cardText}>Next: {formattedNext}</Text>
                <Text style={styles.cardText}>Stake: {formattedStake}</Text>
            </View>
            <MaterialIcons name={statusIconName} size={24} color={statusColor} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#fff',
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    cardText: {
        fontSize: 14,
    },
    addButton: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#007AFF',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
    },
});

export default PledgeListScreen;
