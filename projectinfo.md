# Obsidius — Complete Development & UI/UX Plan
## Behavioral Self-Knowledge Tracker

> *Six things your phone already knows about you — presented honestly, so you can know yourself better.*

---

## 01 — What The App Is

A personal behavioral data tracker built on six scientifically defensible dimensions.
No scores. No targets. No judgment. Just your data, presented clearly, so you can
draw your own conclusions about yourself.

**Three screens. Six dimensions. One daily check-in. Built on behavioral science.**

---

## 02 — Design Philosophy

**Minimal but not empty.**
Every element on screen earns its place. If it does not carry information or
enable an action, it does not exist. Empty space is deliberate — it signals
confidence, not incompleteness.

**Data without judgment.**
Numbers are shown as numbers. The app never tells the user if a number is
good or bad. No green for good, no red for bad. No targets imposed. The user
decides what their data means.

**Dark by default. Always.**
The interface lives on a near-black surface. This is not aesthetic preference —
it is intentional. A dark, quiet surface communicates that this is a space for
serious self-reflection, not entertainment.

**Typography carries the weight.**
Two font families do all the work. The serif handles emotion and data heroes.
The sans-serif handles everything structural. No decorative elements needed
when typography is doing its job properly.

---

## 03 — Design System

---

### Fonts

| Role | Family | Weight / Style | Used For |
|---|---|---|---|
| Display | Cormorant Garamond | Italic 400 | Large numbers, screen titles, hero moments |
| UI | Syne | Bold 700 | Section labels, navigation, uppercase labels |
| Body | Plus Jakarta Sans | Regular 400 / Medium 500 | Descriptions, body copy, card text |
| Data | JetBrains Mono | Regular 400 | All numbers, timestamps, raw data values |

**Font loading:** All four loaded via @expo-google-fonts before splash dismisses.
Never use fontWeight on custom font families — weight is encoded in the family name.

---

### Typography Scale

| Token | Size | Font | Line Height | Letter Spacing | Used For |
|---|---|---|---|---|---|
| display-xl | 72px | Cormorant Garamond Italic | 72 | 0 | Onboarding hero |
| display-l | 56px | Cormorant Garamond Italic | 58 | 0 | Screen titles |
| display-m | 40px | Cormorant Garamond Italic | 44 | 0 | Card hero numbers |
| display-s | 28px | Cormorant Garamond Italic | 32 | 0 | Secondary heroes |
| heading-l | 18px | Syne Bold | 24 | 0.5 | Section headers |
| heading-m | 13px | Syne Bold | 18 | 1.5 | Labels, tab names, uppercase tags |
| heading-s | 11px | Syne Bold | 16 | 2.0 | Micro labels, pill text |
| body-l | 15px | Plus Jakarta Sans Regular | 24 | 0 | Card descriptions |
| body-m | 14px | Plus Jakarta Sans Regular | 22 | 0 | Standard body copy |
| body-s | 13px | Plus Jakarta Sans Regular | 20 | 0 | Secondary text, helper text |
| data-l | 28px | JetBrains Mono | 32 | 0 | Primary data values in cards |
| data-m | 14px | JetBrains Mono | 20 | 0 | Secondary data values |
| data-s | 11px | JetBrains Mono | 16 | 0.5 | Timestamps, metadata, labels |

---

### Colour Palette

```
Background System
─────────────────────────────────────────────
void          #000000     Primary background — every screen
plum          #0A000A     Card surface — slightly lifted
plumMid       #140014     Modal and sheet surfaces
plumBorder    #1E001E     Subtle borders on dark surfaces

Silver Text Scale
─────────────────────────────────────────────
silverHi      #EDEEF2     Primary text — titles, heroes, key data
silver        #C2CBD6     Body text — descriptions, card copy
silverMid     #8C95A0     Secondary text — labels, helper text
silverLo      #565E68     Tertiary text — timestamps, disabled states

Dimension Accent (used only as left-border indicators — never fills)
─────────────────────────────────────────────
d-circadian   #6B7FA3     Muted blue-grey — wake and time
d-nutrition   #7A9B7A     Muted sage — digital diet
d-physical    #9B8B6B     Muted amber — movement
d-recovery    #7A6B9B     Muted lavender — rest
d-social      #9B6B7A     Muted rose — connection
d-consistency #6B9B8B     Muted teal — routine

Semantic
─────────────────────────────────────────────
reset         #8B5E5E     Muted red — reset/restart only, never bright
```

**Rules:**
- Dimension accents appear ONLY as 2px left borders on insight cards
- Never use them as backgrounds, fills, or icon colors
- No bright colors anywhere — every color is deliberately muted
- No green/red to signal good/bad — the app does not make that judgment

---

### Gradient Tokens

```
background      rgba(0,0,0,1) → rgba(10,0,10,1) → rgba(20,0,20,0.97)
                → rgba(50,58,68,0.15) → rgba(140,152,164,0.18)
                → rgba(180,190,200,0.12)
                angle: 121deg — used on every screen as fixed background

silverEdge      #EDEEF2 → #C2CBD6
                angle: 135deg — CTA buttons only

silverFade      #EDEEF2 → #A8B2BC → #565E68
                angle: 180deg — hero number gradient text only

ghostSurface    rgba(20,0,20,0.5) → rgba(10,0,10,0.7)
                angle: 135deg — card inner surface
```

---

### Spacing System

```
xs    4px
sm    8px
md    16px
lg    24px
xl    40px
xxl   64px
xxxl  96px
```

---

### Border Radius

```
sm    6px    — pills, small chips
md    10px   — buttons, inputs
lg    16px   — cards, sheets
xl    24px   — large modals
pill  999px  — fully round
```

---

### Component Specs

**DimensionCard (horizontal scroll card on Today)**
- Width: 72% of screen width (so next card peeks)
- Height: 140px
- Background: rgba(14,0,14,0.7)
- Border: 1px rgba(194,203,214,0.07)
- Left border accent: 2px solid dimension color
- Border radius: lg (16px)
- Padding: 20px all sides
- Contains: dimension name (heading-s), primary value (data-l or display-s),
  secondary value or label (data-s), one-line description (body-s)

**GhostCard (general purpose)**
- Background: rgba(14,0,14,0.6)
- Border: 1px rgba(194,203,214,0.07)
- Border radius: lg (16px)
- No left border accent (that is DimensionCard only)

**SilverButton (primary CTA)**
- Height: 52px
- Width: 100%
- Background: LinearGradient silverEdge horizontal
- Text: Syne Bold 14px #000000
- Border radius: md (10px)
- Press: Reanimated spring scale 0.97

**OutlineButton (secondary action)**
- Height: 44px
- Border: 1px rgba(194,203,214,0.2)
- Background: transparent
- Text: Syne Bold 13px silverHi
- Border radius: md (10px)

**TabBar**
- Background: rgba(0,0,0,0.9) with blur
- Border top: 1px rgba(194,203,214,0.05)
- Height: 56px + safe area
- Active: Syne Bold 11px silverHi + icon filled
- Inactive: Syne Bold 11px silverLo 40% opacity + icon outline
- Icons: Lucide, size 22, stroke 1.5

**InsightCard (pattern intelligence)**
- GhostCard base
- Left border: 2px solid dimension accent color
- MonoLabel: dimension name
- Body: Plus Jakarta Sans 14px silver, one sentence
- Data footnote: JetBrains Mono 11px silverLo — "based on N days"

---

## 04 — File Architecture

```
src/
  theme/
    fonts.ts
    colors.ts
    spacing.ts
    typography.ts
    index.ts

  components/
    DimensionCard.tsx
    GhostCard.tsx
    SilverButton.tsx
    OutlineButton.tsx
    MonoLabel.tsx
    GraphLine.tsx          ← reusable SVG line chart
    GraphBar.tsx           ← reusable SVG bar chart
    InsightCard.tsx
    PauseTimer.tsx         ← urge surfing timer component

  components/sheets/
    MorningCheckinSheet.tsx
    EveningDebriefSheet.tsx
    ResetSheet.tsx

  store/
    mmkv.ts
    useOnboardingStore.ts
    useDimensionStore.ts      ← all six dimension data + mock data
    useCheckinStore.ts
    usePauseStore.ts          ← pause/urge surfing log

app/
  _layout.tsx               ← fonts, splash, hydration, root stack
  index.tsx                 ← redirect logic

  onboarding/
    _layout.tsx
    welcome.tsx             ← step 1
    baseline.tsx            ← step 2: implementation intention
    permissions.tsx         ← step 3: usage access + activity recognition

  (tabs)/
    _layout.tsx             ← Today · Insights · Profile tab bar
    today.tsx               ← main home screen
    insights.tsx            ← analytics and patterns
    profile.tsx             ← settings and personal setup

  modals/
    pause.tsx               ← full screen urge surfing timer
    reset.tsx               ← full screen reset/restart flow
```

Total: 32 files

---

## 05 — Screen Specifications

---

### SCREEN 1 — Today

**Purpose:** A single honest snapshot of the current day across all six dimensions.

**Layout:** ScrollView, gradient background fixed, safe area handled.

---

**Header (sticky, transparent)**
- Left: ◆ symbol (SVG, 14px, silverFade gradient) + "OBSIDIUS" Syne Bold 11px
  letter-spacing 3 silverLo
- Right: Full date in JetBrains Mono 11px silverLo — "SAT · 18 APR"
- No border. No background. Floats over content.

---

**Date hero**
- Cormorant Garamond Italic 40px silverHi — today's day name: "Saturday"
- JetBrains Mono 12px silverLo below — "18 April 2026"
- Padding top: 80px (header clearance + breathing room)

---

**Six dimension cards — horizontal scroll**
- Horizontal ScrollView, pagingEnabled false, showsHorizontalScrollIndicator false
- Snap to interval: card width + gap
- Cards are 72% screen width so the next card always peeks by ~12%
  giving a clear visual affordance that more cards exist
- Gap between cards: 12px
- Left padding: 24px, right padding: 24px
- No section header above — the cards speak for themselves

**Card 1 — Circadian**
- Left accent: d-circadian (#6B7FA3)
- Top label: "CIRCADIAN" Syne Bold 11px letter-spacing 2 silverMid
- Primary value: first unlock time today — JetBrains Mono 36px silverHi
  e.g. "07:42"
- Secondary: "first unlock" JetBrains Mono 11px silverLo
- Bottom: one-line context body-s silverMid
  e.g. "14 min earlier than your average"

**Card 2 — Digital Nutrition**
- Left accent: d-nutrition (#7A9B7A)
- Top label: "NUTRITION"
- Two values side by side:
  Left: passive hours — JetBrains Mono 28px silverHi e.g. "3.2h"
         label below: "passive" data-s silverLo
  Right: active hours — JetBrains Mono 28px silver e.g. "1.4h"
          label below: "active" data-s silverLo
- Thin vertical divider between the two values: 1px rgba(194,203,214,0.1)
- Bottom: one-line context — e.g. "70% of screen time was passive today"

**Card 3 — Physical**
- Left accent: d-physical (#9B8B6B)
- Top label: "PHYSICAL"
- Primary value: step count — JetBrains Mono 36px silverHi e.g. "6,240"
- Secondary: "steps" JetBrains Mono 11px silverLo
- Bottom: distribution tag — e.g. "Mostly before 10am" or "Evenly distributed"

**Card 4 — Recovery**
- Left accent: d-recovery (#7A6B9B)
- Top label: "RECOVERY"
- Primary value: longest screen-off break — JetBrains Mono 36px silverHi
  e.g. "52 min"
- Secondary: "longest break today" data-s silverLo
- Bottom: break count — e.g. "3 breaks over 20 minutes"

**Card 5 — Social**
- Left accent: d-social (#9B6B7A)
- Top label: "SOCIAL"
- Two values side by side (same layout as Nutrition card):
  Left: active communication — e.g. "28m"
  Right: passive social — e.g. "2.1h"
- Bottom: one-line context — e.g. "More passive browsing than direct contact today"

**Card 6 — Consistency**
- Left accent: d-consistency (#6B9B8B)
- Top label: "CONSISTENCY"
- Primary value: check-in timing accuracy — JetBrains Mono 28px silverHi
  e.g. "6 of 7"
- Secondary: "check-ins on time this week" data-s silverLo
- Bottom: restart velocity — e.g. "Avg restart: 4 hours" (after first reset)
  or "No resets yet" if clean

---

**Today's check-ins (below cards)**
- Section label: "TODAY" Syne Bold 11px silverLo letter-spacing 2
- Two rows stacked, each in a GhostCard (full width):

  Morning row:
  - Left: ◆ symbol sm + "Morning" Plus Jakarta Sans Medium 14px silverHi
  - Right: if not done → OutlineButton "Check in" small
           if done → JetBrains Mono 11px silverLo "Done · 08:03"
  
  Evening row:
  - Same structure
  - Only becomes interactive after 5pm
  - Before 5pm: opacity 0.4, no button

---

**Pause button (fixed, bottom of scroll)**
- A single quiet row — not a floating button, not a tab
- Full width GhostCard at the bottom of the ScrollView:
  - Left: "PAUSE" Syne Bold 11px letter-spacing 2 silverMid
  - Right: "5 min breathing timer" Plus Jakarta Sans 13px silverLo
  - Tap: opens pause.tsx modal (full screen)

---

### SCREEN 2 — Insights

**Purpose:** Your data over time. Patterns you cannot see day to day.

**Layout:** ScrollView, same gradient background.

---

**Header**
- "Insights" Cormorant Garamond Italic 40px silverHi left-aligned
- JetBrains Mono 11px silverLo below — "Your data · last 14 days"

---

**Dimension filter pills (horizontal scroll)**
- Pills: All · Circadian · Nutrition · Physical · Recovery · Social · Consistency
- Active: SilverEdge gradient bg, Syne Bold 11px #000000
- Inactive: GhostCard border style, Syne Bold 11px silverMid
- Selecting a pill filters the charts and insight cards below

---

**Chart section (changes based on selected dimension)**

When "All" is selected: show all six charts stacked, each with its dimension label
When single dimension selected: show one full-width expanded chart + insight cards

**Circadian chart:**
- Type: Scatter/dot chart — 7 dots on a timeline axis (midnight to noon)
  showing first unlock time each day
- X axis: days (MON TUE WED...) in JetBrains Mono 10px silverLo
- Y axis: time from 5am to 11am, labels on left in Mono
- Dots: 6px circles filled silverHi
- A thin horizontal dashed line at the user's 7-day average wake time
- Variance annotation: "2.3h variance this week" Mono 11px silverLo

**Digital Nutrition chart:**
- Type: Stacked horizontal bar chart — one bar per day
- Each bar split into passive (plum tinted) and active (silver tinted) segments
- X axis: hours (0 to 8h)
- Day labels on left: Mono 10px silverLo
- Legend: two dots with labels "passive" and "active" in Mono 10px

**Physical chart:**
- Type: Vertical bar chart — 7 bars, one per day
- Bar fill: single color — silver at 30% opacity, with the top portion
  at 70% opacity giving a depth effect
- X axis: day labels Mono 10px
- Y axis: step count in thousands (0k, 4k, 8k, 12k) Mono 10px
- Distribution annotation per bar: a small tag below each bar
  "AM" or "PM" or "–" indicating when most movement occurred

**Recovery chart:**
- Type: Dot + line chart — dots represent longest break duration each day
- Line connects the dots to show trend
- X axis: days
- Y axis: minutes (0, 30, 60, 90) in Mono 10px
- A subtle band shaded between 20min and 45min — labeled "research suggests
  this range" in Mono 10px silverLo (no judgment, just context)

**Social chart:**
- Type: Same stacked horizontal bar as Nutrition
- Active communication vs passive social per day
- Same color logic

**Consistency chart:**
- Type: Dot grid — 7 columns (days) × 1 row
- Each dot: 10px circle
  - Checked in on time: filled silverHi
  - Checked in late: filled silverMid
  - Missed: filled plumMid with silverLo border
- Below: JetBrains Mono 12px silverHi — "6 of 7 on time this week"

---

**Pattern Intelligence (unlocks at 14 days)**
- Section label: "PATTERNS" Syne Bold 11px silverLo letter-spacing 2
- Subtext: Plus Jakarta Sans 13px silverLo "From your data · 14 days"
- Stacked InsightCards — one per cross-dimension pattern detected
- Examples:
  - Left border: d-circadian
    "On days you wake within 30 minutes of your average, you take 40% more steps."
    "Based on 18 days"
  - Left border: d-recovery
    "Days with 2+ screen breaks show 0.8 higher evening energy scores on average."
    "Based on 14 days"
  - Left border: d-social
    "Your passive social time peaks on Sundays — 2.8x your weekly average."
    "Based on 21 days"
- If under 14 days: placeholder card
  "Patterns unlock at 14 days. N days to go."
  Plus Jakarta Sans 13px silverLo. No urgency framing.

---

**Restart Intelligence (appears after first reset)**
- Section label: "RESTARTS"
- GhostCard with:
  - "Restart velocity" Syne Bold 13px silverHi
  - Chart: dot per restart event on a timeline, with duration-to-restart annotated
  - "Your average restart time" JetBrains Mono 24px silverHi — e.g. "6h"
  - Trend note: "Down from 3 days at your first reset" body-s silverMid
- Framed entirely as self-knowledge, not achievement

---

### SCREEN 3 — Profile

**Purpose:** Personal setup and data ownership. Nothing else.

**Layout:** ScrollView, same gradient.

---

**Header**
- "Profile" Cormorant Garamond Italic 40px silverHi

---

**Implementation Intention (top card — most important)**
- GhostCard
- Label: "YOUR INTENTION" Syne Bold 11px silverLo
- Content: the user's "When X happens I will Y" statement
  Cormorant Garamond Italic 22px silverHi — e.g.
  "When I feel bored at night, I will do 10 minutes of reading."
- Subtext: "Set at [date]" Mono 11px silverLo
- Edit button: OutlineButton "Edit" right-aligned, small

---

**Daily rhythm**
- Label: "DAILY RHYTHM" Syne Bold 11px silverLo
- GhostCard with two rows, hairline divider between:
  - Morning check-in: "Morning" body-m silverHi left · time Mono 14px silverHi right
    Tap: time picker
  - Evening debrief: "Evening" body-m silverHi left · time Mono 14px silverHi right
    Tap: time picker

---

**Permissions**
- Label: "DATA ACCESS" Syne Bold 11px silverLo
- GhostCard with two rows:
  - Usage Access: "Screen time" left · "Granted" Mono 11px d-nutrition OR
    OutlineButton "Grant" if not granted
  - Activity Recognition: "Step count" left · same pattern

---

**Your data**
- Label: "YOUR DATA" Syne Bold 11px silverLo
- GhostCard with two rows:
  - "Export as CSV" body-m silverHi left · Lucide download icon right
  - "Delete all data" body-m silverHi in reset color left · Lucide trash icon right
    Tap: confirmation dialog before action

---

**About**
- Label: "ABOUT" Syne Bold 11px silverLo
- GhostCard single row:
  - "Version" left · Mono 11px silverLo "1.0.0" right

---

## 06 — Supporting Flows

---

### Morning Check-in (bottom sheet)
- Sheet height: 65% screen
- Handle bar: 4px × 36px, rounded, rgba(194,203,214,0.15)
- Background: plumMid

**Content:**
- "Good morning." Cormorant Garamond Italic 28px silverHi
- "How are you starting today?" body-m silverMid
- Gap: 32px

- Label: "ENERGY" Syne Bold 11px silverLo
- 5 circles (52px, spaced evenly):
  Default: plumMid bg, 1px rgba(194,203,214,0.2) border, Cormorant Italic 20px silverMid
  Selected: silverEdge gradient bg, Cormorant Italic 20px #000000
  Reanimated spring press: scale 0.94

- Label: "ONE WORD"
- TextInput: no border box, only bottom border 1px rgba(194,203,214,0.15)
  focused: border silver. Font: Plus Jakarta Sans 16px silverHi
  Placeholder: "Today feels..." silverLo

- SilverButton: "Start Today"
- Plain text: "Skip" Plus Jakarta Sans 13px silverLo center

---

### Evening Debrief (bottom sheet)
- Sheet height: 80%
- Background: plumMid

**Content:**
- "How did today go?" Cormorant Garamond Italic 28px silverHi
- Gap: 28px

- Label: "CONSISTENCY" Syne Bold 11px silverLo
- Two GhostCards side by side:
  Left: "Maintained" — ◆ symbol + label
  Right: "Reset" — reset color label (muted, not alarming)
  Selected state: 1px silverHi border

- Label: "ENERGY" — same 5 circles as morning

- Label: "REFLECTION"
- TextInput: "One line. How did today actually feel?" placeholder

- Contextual insight (auto-generated from today's data):
  GhostCard with left border d-color of most notable dimension today
  One sentence observation in body-m silverMid
  e.g. "Your screen time was 40% lower than your weekly average today."

- SilverButton: "Close the Day"
- If Reset selected: pressing CTA dismisses sheet and opens reset modal

---

### Pause Timer (full screen modal)
- Full screen, gradient background, fade transition

- ◆ DiamondSymbol lg centered
- "Pause." Cormorant Garamond Italic 56px silverHi
- "Sit with it for 5 minutes." body-l silverMid
- Gap: 48px

- Circular countdown display:
  SVG circle, 160px diameter
  Track: rgba(194,203,214,0.08) stroke
  Progress: silver stroke, stroke-dashoffset animating over 300 seconds
  Center: JetBrains Mono 36px silverHi showing MM:SS countdown

- After timer completes:
  "Did it pass?" Cormorant Garamond Italic 28px silverHi
  5 circles (same as check-in) — 1 = still strong, 5 = fully passed
  SilverButton: "Log and continue"
  Entry saved: timestamp + rating + optional trigger tag

---

### Reset Flow (full screen modal)
- Full screen, gradient background, fade transition

- ◆ DiamondSymbol lg
- "It's data." Cormorant Garamond Italic 44px silverHi
- "Not failure. What happened?" body-l silverMid
- Gap: 32px

- Three questions (stacked, each with underline TextInput):
  "What were you doing in the hour before?"
  "What would have changed the outcome?"
  "What do you want tomorrow to look like?"
  All optional. All private. body-m silverHi placeholder silverLo

- Implementation intention prompt (GhostCard):
  "Update your intention?"
  Shows current intention text
  OutlineButton: "Edit" inline

- SilverButton: "Restart"
- Plain text: "Just restart" body-s silverLo — resets without saving answers

---

### Onboarding (4 steps, Stack)

**Step 1 — Welcome**
- ◆ DiamondSymbol xl animated (fade + translateY on mount)
- "OBSIDIUS" Syne Bold 11px letter-spacing 4 silverLo
- Staggered three lines Cormorant Garamond Italic 64px:
  Line 1: "Know yourself." silverHi
  Line 2: "Learn from your data." silver
  Line 3: "Grow." silverLo
- body-m: "Six behavioral dimensions. Tracked daily. Backed by science."
- SilverButton: "Get Started"
- Progress: 1 of 4 dots

**Step 2 — Your Intention**
- "Set your intention." Cormorant Garamond Italic 36px silverHi
- body-m silverMid: "Research shows specific plans are 2-3x more likely to work
  than goals. Fill in the blanks."
- Two TextInputs in GhostCards:
  "When [trigger/situation] happens..."
  "I will [specific action]..."
- Combined into one intention sentence shown as preview below
- SilverButton: "Continue"
- Progress: 2 of 4

**Step 3 — Permissions**
- "What Obsidius needs." Cormorant Garamond Italic 36px silverHi
- Two GhostCards:
  Card 1: "Screen time access"
  body-s silverMid: "Reads daily app usage from Android to measure
  Digital Nutrition, Recovery, and Social dimensions."
  OutlineButton: "Grant access" → opens Android usage access settings
  
  Card 2: "Movement access"
  body-s silverMid: "Reads your step count from the device sensor
  to measure Physical Activation."
  OutlineButton: "Grant access" → requests ACTIVITY_RECOGNITION permission
- Note: Mono 11px silverLo "Data stays on your device. Always."
- SilverButton: "Continue" (available even if not granted)
- Progress: 3 of 4

**Step 4 — Daily Rhythm**
- "Your daily rhythm." Cormorant Garamond Italic 36px silverHi
- Two GhostCards (time display, tap to edit):
  Morning check-in time — default 08:00
  Evening debrief time — default 21:00
- body-s silverLo: "You can change these anytime in Profile."
- SilverButton: "Enter Obsidius" → marks onboarding complete → navigates to tabs

---

## 07 — State Architecture

---

### useOnboardingStore
```
hasHydrated: boolean
isComplete: boolean
intention: string          ← "When X happens I will Y"
morningTime: string        ← "08:00"
eveningTime: string        ← "21:00"
usageAccessGranted: boolean
activityAccessGranted: boolean
```

---

### useDimensionStore
```
Circadian
  dailyFirstUnlock: Record<dateString, string>   ← "07:42"

Nutrition
  dailyPassive: Record<dateString, number>       ← minutes
  dailyActive: Record<dateString, number>        ← minutes

Physical
  dailySteps: Record<dateString, number>
  dailyStepDistribution: Record<dateString, 'AM' | 'PM' | 'EVEN' | 'NONE'>

Recovery
  dailyLongestBreak: Record<dateString, number>  ← minutes
  dailyBreakCount: Record<dateString, number>    ← breaks over 20 min

Social
  dailyActiveComm: Record<dateString, number>    ← minutes
  dailyPassiveSocial: Record<dateString, number> ← minutes

Consistency (derived — no raw data stored separately)

IS_MOCK: true  ← on all dimension data until native phase
All seeded with 21 days of realistic mock data on first install
```

---

### useCheckinStore
```
date: string               ← YYYY-MM-DD, resets daily
morningDone: boolean
morningEnergy?: number     ← 1-5
morningWord?: string
eveningDone: boolean
eveningStatus?: 'maintained' | 'reset'
eveningEnergy?: number
eveningReflection?: string
resetIfNewDay()            ← called on every app open
```

---

### usePauseStore
```
pauseLog: PauseEntry[]
  id: string
  timestamp: number
  durationCompleted: number  ← seconds actually sat with
  rating?: number            ← 1-5 did urge pass
  trigger?: string           ← optional tag

resetLog: ResetEntry[]
  id: string
  timestamp: number
  q1?: string
  q2?: string
  q3?: string
  intentionUpdated: boolean
```

---

## 08 — Build Order

32 files built in this sequence, one at a time, each confirmed before next begins.

```
Phase 1 — Foundation (no UI yet)
  01  src/theme/fonts.ts
  02  src/theme/colors.ts
  03  src/theme/spacing.ts
  04  src/theme/typography.ts
  05  src/theme/index.ts
  06  src/store/mmkv.ts
  07  src/store/useOnboardingStore.ts
  08  src/store/useDimensionStore.ts
  09  src/store/useCheckinStore.ts
  10  src/store/usePauseStore.ts

Phase 2 — Shared components
  11  src/components/MonoLabel.tsx
  12  src/components/GhostCard.tsx
  13  src/components/SilverButton.tsx
  14  src/components/OutlineButton.tsx
  15  src/components/DimensionCard.tsx
  16  src/components/InsightCard.tsx
  17  src/components/GraphBar.tsx
  18  src/components/GraphLine.tsx
  19  src/components/GraphDotGrid.tsx
  20  src/components/PauseTimer.tsx

Phase 3 — Navigation root
  21  app/_layout.tsx
  22  app/index.tsx

Phase 4 — Onboarding
  23  app/onboarding/_layout.tsx
  24  app/onboarding/welcome.tsx
  25  app/onboarding/baseline.tsx
  26  app/onboarding/permissions.tsx

Phase 5 — Main screens
  27  app/(tabs)/_layout.tsx
  28  app/(tabs)/today.tsx
  29  app/(tabs)/insights.tsx
  30  app/(tabs)/profile.tsx

Phase 6 — Modals and sheets
  31  src/components/sheets/MorningCheckinSheet.tsx
  32  src/components/sheets/EveningDebriefSheet.tsx
  33  src/components/sheets/ResetSheet.tsx  ← bottom sheet trigger
  34  app/modals/pause.tsx
  35  app/modals/reset.tsx
```

---

## 09 — Dependencies

```
Core
  expo SDK 51
  expo-router
  react-native-reanimated
  react-native-safe-area-context
  react-native-gesture-handler

Fonts
  @expo-google-fonts/cormorant-garamond
  @expo-google-fonts/syne
  @expo-google-fonts/plus-jakarta-sans
  @expo-google-fonts/jetbrains-mono

State
  zustand
  react-native-mmkv

UI
  expo-linear-gradient
  @react-native-masked-view/masked-view
  react-native-svg
  @gorhom/bottom-sheet
  lucide-react-native

Utilities
  expo-haptics
  expo-splash-screen
  expo-notifications
  date-fns
```

---

## 10 — Native Phase (after all 35 UI files confirmed)

Switch to Expo dev build (expo-dev-client).
Build two custom native modules:

**Module 1 — UsageStatsManager**
- Android UsageStatsManager API
- Returns per-app usage time, first unlock time, screen-off periods
- Feeds: Circadian, Nutrition, Recovery, Social dimensions
- Requires: Special app access — Usage Access permission

**Module 2 — StepCounter**
- Android SensorManager TYPE_STEP_COUNTER
- Returns daily step count + hour-by-hour distribution
- Feeds: Physical Activation dimension
- Requires: ACTIVITY_RECOGNITION runtime permission

Both modules replace `IS_MOCK = true` data in useDimensionStore.
Every mock data point is marked with:
`// MOCK — replace with native module in native phase`

---

## 11 — Rules For Building

- Review-Driven mode: plan artifact first, await approval, then execute
- Every file pasted as plain text in chat — no canvas, no external links
- One file at a time — next file only after current confirmed
- No fontWeight on any custom font Text element
- No hardcoded hex values — theme tokens only
- TypeScript strict — no any types
- All mock data marked with MOCK comment
- No new dependencies without declaring in plan first
- No features not listed in this document