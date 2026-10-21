import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet } from 'react-native';

import { AuthProvider } from './lib/AuthContext';
import RootNavigator from './lib/RootNavigator';

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaView style={styles.root}>
        <StatusBar style="dark" />
        <RootNavigator />
      </SafeAreaView>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4ECD8' },
});
