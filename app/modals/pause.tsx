// app/modals/pause.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useNavigation, router } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';
import Animated, { 
  useSharedValue, 
  useAnimatedProps, 
  useAnimatedStyle, 
  withTiming, 
  withSpring, 
  Easing 
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { Colors, Gradients } from '../../src/theme/colors';
import { Typography, t, Spacing, Radius } from '../../src/theme';
import { SilverButton } from '../../src/components/SilverButton';
import { usePauseStore } from '../../src/store/usePauseStore';

type PauseState = 'ready' | 'running' | 'complete' | 'rating';

const CIRCUMFERENCE = 2 * Math.PI * 70;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function RatingOption({ value, selected, onSelect }: { value: number; selected: boolean; onSelect: () => void }) {
  const scale = useSharedValue(1);
  const handlePressIn = () => { scale.value = withSpring(0.9) };
  const handlePressOut = () => { scale.value = withSpring(1) };
  
  const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }]
  }));
  
  return (
      <AnimatedPressable 
         onPressIn={handlePressIn}
         onPressOut={handlePressOut}
         onPress={onSelect}
         style={[styles.ratingCircle, selected && styles.ratingCircleSelected, animatedStyle]}
      >
          {selected && (
              <LinearGradient
                  colors={[...Gradients.silverEdge.colors]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFillObject}
              />
          )}
          <Text style={[t('heading-s'), { color: selected ? Colors.void : Colors.silverHi, zIndex: 2 }]}>
            {value}
          </Text>
      </AnimatedPressable>
  );
}

export default function PauseModal() {
  const [state, setState] = useState<PauseState>('ready');
  const [secondsLeft, setSecondsLeft] = useState(300);
  const [rating, setRating] = useState<number | undefined>(undefined);
  
  const actualDuration = useRef(0);
  const progress = useSharedValue(0);
  
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (state !== 'running') {
          return;
      }
      
      e.preventDefault();
      Alert.alert('Stop the timer?', 'The urge is still passing.', [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Stop', 
          style: 'destructive', 
          onPress: () => {
             usePauseStore.getState().logPause({
                 timestamp: Date.now(),
                 durationSeconds: actualDuration.current,
                 completedFully: false,
             });
             navigation.dispatch(e.data.action);
          }
        }
      ]);
    });
    return unsubscribe;
  }, [navigation, state]);

  useEffect(() => {
      if (state === 'running') {
         progress.value = withTiming(1, { duration: 300000, easing: Easing.linear });
         
         const int = setInterval(() => {
             setSecondsLeft(prev => {
                 if (prev <= 1) {
                     clearInterval(int);
                     handleComplete();
                     return 0;
                 }
                 actualDuration.current += 1;
                 return prev - 1;
             });
         }, 1000);
         return () => clearInterval(int);
      }
  }, [state, progress]);

  const handleComplete = async () => {
      setState('complete');
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setState('rating');
  };

  const animatedProps = useAnimatedProps(() => ({
      strokeDashoffset: CIRCUMFERENCE * (1 - progress.value)
  }));

  if (state === 'ready') {
     return (
        <View style={styles.centerContainer}>
            <View style={styles.iconWrapper}>
               <Svg width={64} height={64} viewBox="0 0 24 24" fill="none">
                  <Path d="M12 2L2 12L12 22L22 12L12 2Z" fill={Colors.silverHi} />
               </Svg>
            </View>
            <Text style={[t('display-xl'), styles.titleReady]}>Pause.</Text>
            <Text style={[t('body-l'), styles.bodyReady]}>Sit with it for 5 minutes.</Text>
            <Text style={[t('body-s'), styles.subReady]}>The urge will peak and pass.</Text>
            
            <SilverButton 
                label="Start Timer"
                onPress={() => setState('running')}
                style={styles.fullWidthBtn}
            />
        </View>
     );
  }

  if (state === 'rating') {
      return (
         <View style={styles.centerContainer}>
            <Text style={[t('display-s'), styles.titleRating]}>Did it pass?</Text>
            
            <View style={styles.ratingRow}>
               {[1, 2, 3, 4, 5].map(v => (
                   <RatingOption 
                     key={v} 
                     value={v} 
                     selected={rating === v} 
                     onSelect={() => setRating(v)} 
                   />
               ))}
            </View>
            
            <Text style={[t('data-s'), styles.ratingLabels]}>
               1 = Still strong  ·  5 = Completely passed
            </Text>
            
            <SilverButton 
                label="Log and continue"
                disabled={rating === undefined}
                onPress={() => {
                    usePauseStore.getState().logPause({
                        timestamp: Date.now(),
                        durationSeconds: actualDuration.current,
                        completedFully: actualDuration.current >= 290,
                        rating: rating
                    });
                    router.back();
                }}
                style={styles.fullWidthBtn}
            />
         </View>
      );
  }

  // Running and Complete states
  const m = Math.floor(secondsLeft / 60);
  const s = secondsLeft % 60;
  const mmss = `${m}:${s < 10 ? '0' : ''}${s}`;

  return (
      <View style={styles.centerContainer}>
         <View style={styles.timerWrapper}>
             <Svg width={160} height={160} style={styles.timerSvg}>
                 <Circle 
                   cx={80} cy={80} r={70} 
                   stroke="rgba(194,203,214,0.08)" 
                   strokeWidth={8} 
                   fill="transparent" 
                 />
                 <AnimatedCircle 
                    cx={80} cy={80} r={70} 
                    stroke={Colors.silverHi} 
                    strokeWidth={8} 
                    fill="transparent" 
                    strokeDasharray={CIRCUMFERENCE}
                    animatedProps={animatedProps}
                    strokeLinecap="round"
                 />
             </Svg>
             <Text style={[t('data-l'), styles.timerText]}>{mmss}</Text>
         </View>
         
         <Text style={[t('body-l'), styles.breathingText]}>Breathe slowly. In for 4, out for 6.</Text>
         
         <Pressable onPress={() => router.back()} style={styles.stopArea}>
             <Text style={[t('body-s'), styles.stopText]}>Tap to stop early</Text>
         </Pressable>
      </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
     flex: 1,
     backgroundColor: Colors.void,
     justifyContent: 'center',
     alignItems: 'center',
     padding: Spacing.xl,
  },
  iconWrapper: {
     marginBottom: Spacing.xxl,
  },
  titleReady: {
     marginBottom: Spacing.md,
     textAlign: 'center',
     color: Colors.silverHi,
  },
  bodyReady: {
     color: Colors.silverHi,
     textAlign: 'center',
     marginBottom: Spacing.xs,
  },
  subReady: {
     color: Colors.silverMid,
     textAlign: 'center',
     marginBottom: Spacing.xxxl * 2,
  },
  fullWidthBtn: {
     width: '100%',
     marginTop: 'auto',
     marginBottom: Spacing.xl,
  },
  titleRating: {
     color: Colors.silverHi,
     marginBottom: Spacing.xxxl,
     textAlign: 'center',
  },
  ratingRow: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     width: '100%',
     paddingHorizontal: Spacing.sm,
     marginBottom: Spacing.xl,
  },
  ratingCircle: {
     width: 48,
     height: 48,
     borderRadius: 24,
     borderWidth: 1,
     borderColor: Colors.silverLo,
     justifyContent: 'center',
     alignItems: 'center',
     overflow: 'hidden',
  },
  ratingCircleSelected: {
     borderWidth: 0,
  },
  ratingLabels: {
     fontSize: 10,
     color: Colors.silverLo,
     marginBottom: Spacing.xxxl * 2,
     textAlign: 'center',
  },
  timerWrapper: {
     width: 160,
     height: 160,
     justifyContent: 'center',
     alignItems: 'center',
     marginBottom: Spacing.xl,
  },
  timerSvg: {
     position: 'absolute',
     transform: [{ rotate: '-90deg' }],
  },
  timerText: {
     fontSize: 32,
     color: Colors.silverHi,
  },
  breathingText: {
     color: Colors.silverHi,
     textAlign: 'center',
     marginBottom: Spacing.xxxl,
  },
  stopArea: {
     padding: Spacing.sm,
  },
  stopText: {
     color: Colors.silverLo,
  },
});
