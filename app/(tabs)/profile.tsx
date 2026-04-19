// app/(tabs)/profile.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Linking, PermissionsAndroid, Alert } from 'react-native';
import { router } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { ChevronRight, Trash2 } from 'lucide-react-native';
import { parse, format } from 'date-fns';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { Colors } from '../../src/theme/colors';
import { Typography, t, Spacing, Radius } from '../../src/theme';
import { GhostCard } from '../../src/components/GhostCard';
import { ObsidiusLogo } from '../../src/components/ObsidiusLogo';
import { useDimensionStore } from '../../src/store/useDimensionStore';
import { useCheckinStore } from '../../src/store/useCheckinStore';
import { usePauseStore } from '../../src/store/usePauseStore';
import { useOnboardingStore } from '../../src/store/useOnboardingStore';
import { getLastNDates } from '../../src/utils/formatters';

function OutlineButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.outlineButton}
    >
      <Text style={[t('heading-s'), { color: Colors.silverHi }]}>{label}</Text>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const morningTime = useOnboardingStore(s => s.morningTime);
  const eveningTime = useOnboardingStore(s => s.eveningTime);
  const usageAccessGranted = useOnboardingStore(s => s.usageAccessGranted);
  const activityAccessGranted = useOnboardingStore(s => s.activityAccessGranted);
  const setMorningTime = useOnboardingStore(s => s.setMorningTime);
  const setEveningTime = useOnboardingStore(s => s.setEveningTime);

  const [showMorningPicker, setShowMorningPicker] = useState(false);
  const [showEveningPicker, setShowEveningPicker] = useState(false);

  const handleExportData = async () => {
    try {
      const dates = getLastNDates(21);
      const dimState = useDimensionStore.getState();
      const checkinHistory = useCheckinStore.getState().checkinHistory;

      const rows = ['Date,Circadian,Nutrition,Physical,Recovery,Social,Consistency'];
      for (const d of dates) {
        const circ = dimState.circadian.dailyFirstUnlock[d] || '';
        const nutPass = dimState.nutrition.dailyPassiveMinutes[d] || 0;
        const phys = dimState.physical.dailySteps[d] || 0;
        const rec = dimState.recovery.dailyBreakCount[d] || 0;
        const socAct = dimState.social.dailyActiveCommMinutes[d] || 0;
        const chk = checkinHistory.find(c => c.date === d);
        const cons = chk && chk.eveningDone && chk.eveningStatus ? chk.eveningStatus : '';

        rows.push(`${d},${circ},${nutPass},${phys},${rec},${socAct},${cons}`);
      }

      const csvStr = rows.join('\n');
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      // @ts-ignore - documentDirectory exists at runtime
      const fileUri = `${FileSystem.documentDirectory}obsidius-${todayStr}.csv`;
      
      await FileSystem.writeAsStringAsync(fileUri, csvStr);
      await Sharing.shareAsync(fileUri);
    } catch (e) {
      console.warn('Failed to export data:', e);
    }
  };

  const handleDeleteData = () => {
    Alert.alert(
      'Delete all data',
      'This action is destructive and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => {
            useDimensionStore.getState().reset();
            useCheckinStore.getState().reset();
            usePauseStore.getState().reset();
            useOnboardingStore.getState().reset();
            
            // @ts-ignore - typed routes not regenerated yet
            router.replace('/onboarding/welcome');
          }
        }
      ]
    );
  };

  const requestActivityAccess = async () => {
    try {
      const result = await PermissionsAndroid.request('android.permission.ACTIVITY_RECOGNITION');
      useOnboardingStore.getState().setActivityAccessGranted(result === 'granted');
    } catch (e) {
      console.warn('Failed to request activity permission:', e);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        bounces={false} 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ObsidiusLogo />
        </View>
        <Text style={[t('display-m'), styles.pageTitle]}>
          Profile
        </Text>

        <View style={styles.section}>
          <Text style={[t('heading-s'), styles.sectionTitle]}>DAILY RHYTHM</Text>
          <GhostCard>
            <Pressable onPress={() => setShowMorningPicker(true)} style={styles.row}>
              <Text style={[t('body-m'), { color: Colors.silverHi }]}>Morning check-in</Text>
              <View style={styles.rowRight}>
                <Text style={[t('data-l'), { color: Colors.silverHi, marginRight: Spacing.xs }]}>
                  {morningTime}
                </Text>
                <ChevronRight size={20} color={Colors.silverLo} />
              </View>
            </Pressable>
            <View style={styles.divider} />
            <Pressable onPress={() => setShowEveningPicker(true)} style={styles.row}>
              <Text style={[t('body-m'), { color: Colors.silverHi }]}>Evening debrief</Text>
              <View style={styles.rowRight}>
                <Text style={[t('data-l'), { color: Colors.silverHi, marginRight: Spacing.xs }]}>
                  {eveningTime}
                </Text>
                <ChevronRight size={20} color={Colors.silverLo} />
              </View>
            </Pressable>
          </GhostCard>
        </View>

        <View style={styles.section}>
          <Text style={[t('heading-s'), styles.sectionTitle]}>DATA ACCESS</Text>
          <GhostCard>
            <View style={styles.row}>
              <Text style={[t('body-m'), { color: Colors.silverHi }]}>Screen time reading</Text>
              {usageAccessGranted ? (
                <Text style={[t('data-s'), { color: Colors.dNutrition }]}>✓ Granted</Text>
              ) : (
                <OutlineButton label="Grant" onPress={() => Linking.openSettings()} />
              )}
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={[t('body-m'), { color: Colors.silverHi }]}>Step counting</Text>
              {activityAccessGranted ? (
                <Text style={[t('data-s'), { color: Colors.dNutrition }]}>✓ Granted</Text>
              ) : (
                <OutlineButton label="Grant" onPress={requestActivityAccess} />
              )}
            </View>
          </GhostCard>
        </View>

        <View style={styles.section}>
          <Text style={[t('heading-s'), styles.sectionTitle]}>YOUR DATA</Text>
          <GhostCard>
            <Pressable onPress={handleExportData} style={styles.row}>
              <Text style={[t('body-m'), { color: Colors.silverHi }]}>Export all data</Text>
              <ChevronRight size={20} color={Colors.silverLo} />
            </Pressable>
            <View style={styles.divider} />
            <Pressable onPress={handleDeleteData} style={styles.row}>
              <Text style={[t('body-m'), { color: Colors.reset }]}>Delete all data</Text>
              <Trash2 size={20} color={Colors.reset} />
            </Pressable>
          </GhostCard>
        </View>

        <View style={styles.section}>
          <Text style={[t('heading-s'), styles.sectionTitle]}>ABOUT</Text>
          <GhostCard style={styles.row}>
            <Text style={[t('body-m'), { color: Colors.silverHi }]}>Version</Text>
            <Text style={[t('data-s'), { color: Colors.silverLo }]}>1.0.0</Text>
          </GhostCard>
        </View>
      </ScrollView>

      {showMorningPicker && (
        <DateTimePicker
          value={parse(morningTime, 'HH:mm', new Date())}
          mode="time"
          is24Hour={true}
          display="spinner"
          onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
            setShowMorningPicker(false);
            if (selectedDate) {
              setMorningTime(format(selectedDate, 'HH:mm'));
            }
          }}
        />
      )}

      {showEveningPicker && (
        <DateTimePicker
          value={parse(eveningTime, 'HH:mm', new Date())}
          mode="time"
          is24Hour={true}
          display="spinner"
          onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
            setShowEveningPicker(false);
            if (selectedDate) {
              setEveningTime(format(selectedDate, 'HH:mm'));
            }
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.void,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  header: {
    marginBottom: Spacing.md,
  },
  pageTitle: {
    color: Colors.silverHi,
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    color: Colors.silverLo,
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.plumBorder,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: Colors.silverLo,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
});
