// react-native-mmkv v4.3.1
// src/store/mmkv.ts
//
// Creates the single MMKV storage instance for the entire app and
// exports the Zustand-compatible storage adapter.
//
// RULES:
//   - This is the ONLY file that instantiates MMKV directly.
//     All stores import `zustandMMKVStorage` from here — never
//     call `new MMKV()` anywhere else.
//   - No any types.
//   - No logic other than the adapter wiring.

import { createMMKV } from 'react-native-mmkv';

// ─── MMKV instance ────────────────────────────────────────────────────────
// One instance, shared across all Zustand stores via the adapter below.
// The default MMKV instance uses the app's bundle ID as its storage ID
// and stores data in the app's private directory — no additional config
// required for a single-user app.
export const storage = createMMKV();

// ─── Zustand persist storage adapter ─────────────────────────────────────
// Zustand's `persist` middleware expects a storage object with three
// methods matching the StateStorage interface:
//
//   getItem(name)        → string | null | Promise<string | null>
//   setItem(name, value) → void   | Promise<void>
//   removeItem(name)     → void   | Promise<void>
//
// MMKV's getString() returns `string | undefined` — the `?? null`
// coercion satisfies Zustand's expectation of `string | null`.
// All three methods are synchronous; Zustand handles both sync and
// async adapters transparently.

export const zustandMMKVStorage = {
  getItem:    (name: string): string | null =>
                storage.getString(name) ?? null,

  setItem:    (name: string, value: string): void =>
                storage.set(name, value),

  removeItem: (name: string): void => {
                storage.remove(name);
              },
};
