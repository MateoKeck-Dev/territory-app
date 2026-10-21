import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { CenterWalkButton } from './CenterWalkButton';
import { ChallengesStackNavigator } from './ChallengesStackNavigator';
import { HomeStackNavigator } from './HomeStackNavigator';
import { PlayStackNavigator } from './PlayStackNavigator';
import { SocialStackNavigator } from './SocialStackNavigator';
import type { AppStackParamList, MainTabParamList } from './types';
import { WalkStackNavigator } from './WalkStackNavigator';
import { useTheme } from '../lib/theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<keyof MainTabParamList, string> = {
  Home: '🏠',
  Play: '🎮',
  Walk: '🐾',
  Challenges: '🏆',
  Social: '👥',
};

function TabIcon({ name, focused }: { name: keyof MainTabParamList; focused: boolean }) {
  return <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{TAB_ICONS[name]}</Text>;
}

export function MainTabs() {
  const { colors } = useTheme();
  const rootNavigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 64 },
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Play" component={PlayStackNavigator} options={{ tabBarLabel: 'Play' }} />
      <Tab.Screen
        name="Walk"
        component={WalkStackNavigator}
        options={{ tabBarLabel: '', tabBarButton: (props) => <CenterWalkButton {...props} /> }}
        listeners={{
          // The big center button starts the walk flow as its own stack
          // over the tabs, rather than switching to a "Walk" tab whose
          // content would otherwise never really be seen.
          tabPress: (e) => {
            e.preventDefault();
            rootNavigation.navigate('WalkFlow');
          },
        }}
      />
      <Tab.Screen name="Challenges" component={ChallengesStackNavigator} options={{ tabBarLabel: 'Challenges' }} />
      <Tab.Screen name="Social" component={SocialStackNavigator} options={{ tabBarLabel: 'Social' }} />
    </Tab.Navigator>
  );
}
