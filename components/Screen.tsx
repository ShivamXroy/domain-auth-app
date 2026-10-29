import { type ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';
export function Screen({ children }: { children: ReactNode }) { return <SafeAreaView style={styles.safe}><View style={styles.content}>{children}</View></SafeAreaView>; }
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: '#F5F7FB' }, content: { flex: 1, width: '100%', maxWidth: 720, alignSelf: 'center', padding: 24 } });
