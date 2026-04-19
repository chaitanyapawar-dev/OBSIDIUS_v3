// app/dimension/_layout.tsx
import React from 'react';
import { Stack, router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { Colors } from '../../src/theme/colors';
import { ObsidiusLogo } from '../../src/components/ObsidiusLogo';

export default function DimensionLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.void, // Matches primary background
        },
        headerTintColor: Colors.silverHi,
        headerTitle: '', // Keep center clear
        headerShadowVisible: false, // Flat deep design
        headerLeft: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Pressable 
              onPress={() => router.back()} 
              style={{ padding: 8, marginRight: 8, marginLeft: -8 }} // Expand hit area, nudge left
            >
              <ArrowLeft size={24} color={Colors.silverHi} />
            </Pressable>
            <ObsidiusLogo />
          </View>
        ),
      }}
    />
  );
}
