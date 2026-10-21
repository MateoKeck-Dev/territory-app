import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './lib/AuthContext';
import { useTheme } from './lib/theme';
import { GameDataProvider } from './hooks/GameDataProvider';
import { RootNavigator } from './navigation/RootNavigator';

function AppContent() {
  const { scheme } = useTheme();
  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <RootNavigator />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <GameDataProvider>
          <AppContent />
        </GameDataProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
