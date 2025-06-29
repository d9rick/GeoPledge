// app/pledges.tsx

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';

interface Pledge {
    id: string;
    name?: string;
    nextScheduledRun?: string;
    stakeCents: number;
    lastStatus?: 'MET' | 'VIOLATED' | 'PENDING';
}

export default function PledgeListScreen() {
    const { userToken, isLoading, signOut } = useAuth();
    const router = useRouter();
    const [pledges, setPledges] = useState<Pledge[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /* 1. Redirect if auth finished but no token */
    useEffect(() => {
        if (!isLoading && !userToken) {
            router.replace('/login');
        }
    }, [isLoading, userToken]);

    /* 2. Fetch data once we have a valid token */
    useEffect(() => {
        if (!userToken) return;
        const fetch = async () => {
            try {
                setLoading(true);
                const { data } = await api.get<Pledge[]>('/api/pledges', {
                    headers: { Authorization: `Bearer ${userToken}` },
                });
                setPledges(data);
            } catch (err: any) {
                if (err.response?.status === 401 || err.response?.status === 403) {
                    await signOut();
                    router.replace('/login');
                } else {
                    setError('Failed to load pledges');
                }
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [userToken]);

    /* 3. UI branches (pure rendering, no hooks here) */
    if (isLoading || loading) return <ActivityIndicator />;
    if (error) {
        return (
            <View style={styles.center}>
                <Text>{error}</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            {/* Log out */}
            <TouchableOpacity
                style={styles.logout}
                onPress={async () => {
                    await signOut();
                    router.replace('/login');
                }}
            >
                <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>

            {/* Admin Test Link */}
            <TouchableOpacity
                style={styles.adminLink}
                onPress={() => router.push('/admin')}
            >
                <Text style={styles.adminText}>Admin Test</Text>
            </TouchableOpacity>

            <FlatList
                data={pledges}
                keyExtractor={item => item.id}
                renderItem={({ item }) => <PledgeCard pledge={item} />}
                contentContainerStyle={pledges.length === 0 && styles.center}
                ListEmptyComponent={<Text>No pledges found. Create one to get started!</Text>}
            />

            {/* Floating Add Button */}
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('/map')}
            >
                <MaterialIcons name="add" size={32} color="white" />
            </TouchableOpacity>
        </View>
    );
}

const PledgeCard: React.FC<{ pledge: Pledge }> = ({ pledge }) => {
    const status = pledge.lastStatus ?? 'PENDING';
    const iconName =
        status === 'MET' ? 'check-circle'
            : status === 'VIOLATED' ? 'cancel'
                : 'hourglass-empty';
    const color =
        status === 'MET' ? 'green'
            : status === 'VIOLATED' ? 'red'
                : 'gray';
    const stake = `$${(pledge.stakeCents / 100).toFixed(2)}`;
    const nextRun = pledge.nextScheduledRun
        ? new Date(pledge.nextScheduledRun).toLocaleString()
        : 'No scheduled run';

    return (
        <TouchableOpacity style={styles.card}>
            <MaterialIcons name={iconName} size={24} color={color} />
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{pledge.name}</Text>
                <Text style={styles.cardText}>Next: {nextRun}</Text>
                <Text style={styles.cardText}>Stake: {stake}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logout: {
        padding: 16,
        backgroundColor: '#fff',
        alignItems: 'flex-end',
    },
    logoutText: {
        color: 'red',
        fontWeight: '600',
    },
    adminLink: {
        padding: 16,
        backgroundColor: '#fff',
        alignItems: 'flex-end',
    },
    adminText: {
        color: '#007AFF',
        fontWeight: '600',
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
