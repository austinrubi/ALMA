import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import { useTheme, ALMA_FONTS } from '../../lib/theme';
import { Icon } from '../../components/ui';

const TAB_ICON_MAP: Record<string, string> = {
  index: 'home',
  schedule: 'calendar',
  standings: 'chart',
  team: 'users',
  resources: 'book',
  profile: 'profile',
};

const TAB_LABELS: Record<string, string> = {
  index: 'Home',
  schedule: 'Schedule',
  standings: 'Standings',
  team: 'Team',
  resources: 'Resources',
  profile: 'Profile',
};

export default function TabLayout() {
  const T = useTheme();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: T.surface,
          borderTopColor: T.border,
          borderTopWidth: 1,
          paddingTop: 6,
          paddingBottom: 28,
          height: 82,
        },
        tabBarActiveTintColor: T.brand,
        tabBarInactiveTintColor: T.inkMute,
        tabBarLabelStyle: {
          fontFamily: ALMA_FONTS.uiSemiBold,
          fontSize: 10,
          letterSpacing: 0.5,
          marginTop: 2,
        },
        tabBarIcon: ({ color, focused }) => {
          const iconName = TAB_ICON_MAP[route.name] || 'home';
          return (
            <View style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: focused ? T.brand : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Icon name={iconName} size={20} color={focused ? T.inkOnDeep : color} />
            </View>
          );
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="schedule" options={{ title: 'Schedule' }} />
      <Tabs.Screen name="standings" options={{ title: 'Standings' }} />
      <Tabs.Screen name="team" options={{ title: 'Team' }} />
      <Tabs.Screen name="resources" options={{ title: 'Resources' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
