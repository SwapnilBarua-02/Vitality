import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../store';

function formatTime(secs: number) {
  const m = Math.floor(Math.abs(secs) / 60).toString().padStart(2, '0');
  const s = (Math.abs(secs) % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function LiveTimerBanner() {
  const navigation = useNavigation<any>();
  const { timer, stopTimer } = useStore();
  const [elapsed, setElapsed] = useState(0);

  const hasTimer = timer.running || timer.pausedElapsed > 0;

  useEffect(() => {
    if (!hasTimer) {
      setElapsed(0);
      return;
    }

    const update = () => {
      if (timer.running && timer.startTime) {
        const live = Math.floor((Date.now() - timer.startTime) / 1000) + timer.pausedElapsed;
        setElapsed(live);
      } else {
        setElapsed(timer.pausedElapsed);
      }
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [hasTimer, timer.running, timer.startTime, timer.pausedElapsed]);

  const goalSecs = timer.goalSecs || 3600;
  const pct = Math.max(0, Math.min(100, Math.round((elapsed / goalSecs) * 100)));
  const remaining = Math.max(goalSecs - elapsed, 0);

  const subtitle = useMemo(() => {
    if (elapsed >= goalSecs) return 'Past goal';
    if (timer.running) return `${formatTime(remaining)} left`;
    return 'Paused';
  }, [elapsed, goalSecs, remaining, timer.running]);

  if (!hasTimer) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.left}>
        <Text style={styles.kicker}>Live session</Text>
        <Text style={styles.title}>{timer.methodName || 'Focus session'}</Text>
        <Text style={styles.sub}>{formatTime(elapsed)} · {subtitle} · {pct}%</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() =>
            navigation.navigate('Timer', {
              continueExisting: true,
            })
          }
        >
          <Text style={styles.secondaryText}>Continue</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.stopBtn}
          onPress={stopTimer}
        >
          <Text style={styles.stopText}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#101114',
    borderWidth: 1,
    borderColor: '#1F2125',
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flex: 1,
    paddingRight: 12,
  },
  kicker: {
    color: '#8B5CF6',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 3,
  },
  sub: {
    color: '#7A7A7A',
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  secondaryBtn: {
    backgroundColor: '#8B5CF6',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
  },
  secondaryText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  stopBtn: {
    backgroundColor: '#1A1C20',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  stopText: {
    color: '#C6C6C6',
    fontSize: 13,
    fontWeight: '600',
  },
});