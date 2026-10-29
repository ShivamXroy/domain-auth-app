import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
export default function Index() { const { user, loading } = useAuth(); if (loading) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator size="large" /></View>; return <Redirect href={user ? '/dashboard' : '/login'} />; }
