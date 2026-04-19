// app/(tabs)/_layout.tsx
//
// Tab navigator shell for the main app experience.
// Owns the visual treatment of the tab bar (colors, height, typography)
// and declares the three tab screens (Today, Insights, Profile).
//
// The route group folder (tabs) is invisible in URLs — it groups the
// three screens under the same Stack entry without adding a URL segment.
//
// RULE: Strict TypeScript, no any types. All values from theme tokens.

import React from 'react';
import { Tabs }  from 'expo-router';
import Feather   from '@expo/vector-icons/Feather';
import { t, Colors, Layout } from '../../src/theme';

// ─── Icon name type ───────────────────────────────────────────────────────
// Derived from Feather's own component props — avoids importing from
// internal build paths that may change between @expo/vector-icons versions.
type FeatherName = React.ComponentProps<typeof Feather>['name'];

// ─── Tab icon configuration ───────────────────────────────────────────────
// Centralised so icon choices are visible and changeable in one place.
// 'sun'         — Today: morning/circadian, daily rhythm.
// 'bar-chart-2' — Insights: analytics, patterns, trends.
// 'user'        — Profile: identity, settings, intention.
const ICONS: Record<'today' | 'insights' | 'profile', FeatherName> = {
  today:    'sun',
  insights: 'bar-chart-2',
  profile:  'user',
} as const;

// ─── Tab icon renderer ────────────────────────────────────────────────────
// Typed explicitly to satisfy strict TypeScript — react-navigation infers
// this automatically in JSX, but the explicit type documents the contract.
type TabIconProps = { focused: boolean; color: string; size: number };

function tabIcon(name: FeatherName) {
  return ({ color, size }: TabIconProps): React.ReactElement => (
    <Feather name={name} size={size} color={color} />
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────

export default function TabLayout(): React.ReactElement {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        // ── Tab bar colours ─────────────────────────────────────────
        tabBarActiveTintColor:   Colors.silverHi,  // active icon + label
        tabBarInactiveTintColor: Colors.silverLo,  // inactive icon + label

        // ── Tab bar surface ─────────────────────────────────────────
        tabBarStyle: {
          backgroundColor: Colors.void,            // deepest background
          borderTopWidth:  0,                       // no separator line
          height:          Layout.tabBarHeight,     // 64 — from Layout token
        },

        // ── Tab label typography ────────────────────────────────────
        // t('heading-s') → Syne Bold, 11px — renders label in ALL-CAPS
        // because the title strings are already uppercase ("TODAY" etc.)
        // No fontWeight added — Syne_700Bold is encoded in the family.
        tabBarLabelStyle: t('heading-s'),
      }}
    >
      {/* ── TODAY ──────────────────────────────────────────────────── */}
      <Tabs.Screen
        name="today"
        options={{
          title:      'TODAY',
          tabBarIcon: tabIcon(ICONS.today),
        }}
      />

      {/* ── INSIGHTS ───────────────────────────────────────────────── */}
      <Tabs.Screen
        name="insights"
        options={{
          title:      'INSIGHTS',
          tabBarIcon: tabIcon(ICONS.insights),
        }}
      />

      {/* ── PROFILE ────────────────────────────────────────────────── */}
      <Tabs.Screen
        name="profile"
        options={{
          title:      'PROFILE',
          tabBarIcon: tabIcon(ICONS.profile),
        }}
      />
    </Tabs>
  );
}
