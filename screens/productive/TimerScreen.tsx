import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, Alert
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useState, useEffect, useRef, useCallback } from 'react';
import Svg, { Circle } from 'react-native-svg';
import * as Notifications from 'expo-notifications';
import { useStore } from '../../store';

const SIZE = 280;
const STROKE = 12;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function TimerScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { timer, startTimer, pauseTimer, resumeTimer, stopTimer, addTimerSession } = useStore();

  const goalMins = route.params?.goalMins ?? 60;
  const breakMins = route.params?.breakMins ?? 5;
  const methodName = route.params?.methodName ?? 'Custom';
  const goalSecs = goalMins * 60;

  const [elapsed, setElapsed] = useState(0);
  const [overtime, setOvertime] = useState(false);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);

  useEffect(() => {
    if (!timer.running || timer.startTime === null) {
      startTimer(goalSecs, methodName);
    }
  }, []);

  const scheduleNotification = async (secsRemaining: number) => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${methodName} complete`,
        body: `Your ${goalMins} min session is done. Take a ${breakMins} min break.`,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: secsRemaining,
      },
    });
  };

  useFocusEffect(
    useCallback(() => {
      if (timer.running && timer.startTime !== null) {
        intervalRef.current = setInterval(() => {
          const totalElapsed = Math.floor((Date.now() - timer.startTime!) / 1000) + timer.pausedElapsed;
          setElapsed(totalElapsed);
          if (totalElapsed >= goalSecs) setOvertime(true);
        }, 1000);

        const remaining = goalSecs - Math.floor((Date.now() - timer.startTime) / 1000);
        if (remaining > 0) scheduleNotification(remaining);
      } else if (!timer.running) {
        setElapsed(timer.pausedElapsed);
      }

      return () => clearInterval(intervalRef.current);
    }, [timer.running, timer.startTime, timer.pausedElapsed])
  );

  const handlePause = () => {
    clearInterval(intervalRef.current);
    pauseTimer(elapsed);
    Notifications.cancelAllScheduledNotificationsAsync();
  };

  const handleResume = () => {
    resumeTimer();
  };

  const handleEnd = () => {
    clearInterval(intervalRef.current);
    Notifications.cancelAllScheduledNotificationsAsync();
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    addTimerSession({ methodName, goalSecs, elapsedSecs: elapsed });
    stopTimer();
    Alert.alert(
      'Session complete',
      `You studied for ${mins} min${mins !== 1 ? 's' : ''} ${secs} secs.`,
      [{ text: 'Done', onPress: () => navigation.goBack() }]
    );
  };

  const handleBack = () => {
    clearInterval(intervalRef.current);
    navigation.goBack();
  };

  const progress = Math.min(elapsed / goalSecs, 1);
  const filled = CIRCUMFERENCE * progress;

  const formatTime = (secs: number) => {
    const display = overtime ? secs - goalSecs : secs;
    const m = Math.floor(Math.abs(display) / 60).toString().padStart(2, '0');
    const s = (Math.abs(display) % 60).toString().padStart(2, '0');
    return `${overtime && display >= 0 ? '+' : ''}${m}:${s}`;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.methodLabel}>{methodName}</Text>
        {overtime && (
          <View style={styles.overtimeBadge}>
            <Text style={styles.overtimeText}>Overtime</Text>
          </View>
        )}
      </View>

      <View style={styles.center}>
        <Svg width={SIZE} height={SIZE}>
          <Circle
            cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
            fill="none" stroke="#1c1c1c" strokeWidth={STROKE}
          />
          <Circle
            cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
            fill="none"
            stroke={overtime ? '#FF375F' : '#BF5AF2'}
            strokeWidth={STROKE}
            strokeDasharray={`${filled} ${CIRCUMFERENCE - filled}`}
            strokeDashoffset={CIRCUMFERENCE * 0.25}
            strokeLinecap="round"
          />
        </Svg>

        <View style={styles.timerCenter}>
          <Text style={[styles.timerText, overtime && { color: '#FF375F' }]}>
            {formatTime(elapsed)}
          </Text>
          <Text style={styles.timerSub}>
            {overtime ? 'past goal' : timer.running ? 'focusing' : 'paused'}
          </Text>
          <Text style={styles.goalSub}>goal: {goalMins} mins</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlBtn}
          onPress={timer.running ? handlePause : handleResume}
        >
          <Text style={styles.controlBtnText}>
            {timer.running ? 'Pause' : 'Resume'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlBtn, styles.endBtn]}
          onPress={handleEnd}
        >
          <Text style={[styles.controlBtnText, { color: '#FF375F' }]}>End</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: '#000' },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, borderBottomWidth: 0.5, borderBottomColor: '#1c1c1c' },
  backBtn:        { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backArrow:      { fontSize: 28, color: '#BF5AF2', lineHeight: 32 },
  backText:       { fontSize: 16, color: '#BF5AF2' },
  methodLabel:    { fontSize: 14, color: '#555' },
  overtimeBadge:  { backgroundColor: '#FF375F22', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  overtimeText:   { fontSize: 12, color: '#FF375F', fontWeight: '600' },
  center:         { flex: 1, alignItems: 'center', justifyContent: 'center' },
  timerCenter:    { position: 'absolute', alignItems: 'center' },
  timerText:      { fontSize: 64, fontWeight: '200', color: '#fff', letterSpacing: -2 },
  timerSub:       { fontSize: 14, color: '#555', marginTop: 8 },
  goalSub:        { fontSize: 12, color: '#333', marginTop: 4 },
  controls:       { flexDirection: 'row', gap: 16, paddingHorizontal: 28, paddingBottom: 48 },
  controlBtn:     { flex: 1, backgroundColor: '#1c1c1c', borderRadius: 50, paddingVertical: 20, alignItems: 'center' },
  controlBtnText: { fontSize: 17, fontWeight: '500', color: '#fff' },
  endBtn:         { backgroundColor: '#1c0000' },
});