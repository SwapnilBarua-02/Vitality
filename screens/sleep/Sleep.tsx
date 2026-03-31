import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Svg, { Circle } from 'react-native-svg';

const STORAGE_KEY = 'sleep_entries_v1';
const MONTH_DAYS = 31;
const TODAY = new Date().getDate();
const MONTH = new Date().toLocaleDateString('en-AU', {
  month: 'long',
  year: 'numeric',
});

const RING_SIZE = 28;
const RING_STROKE = 3;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRC = 2 * Math.PI * RING_RADIUS;

type SleepEntry = {
  id: number;
  date: string;
  hours: number;
};

function MiniRing({ progress, isToday }: { progress: number; isToday: boolean }) {
  const filled = RING_CIRC * progress;
  return (
    <View>
      <Svg width={RING_SIZE} height={RING_SIZE}>
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          fill="none"
          stroke="#1c1c1c"
          strokeWidth={RING_STROKE}
        />
        {progress > 0 && (
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            stroke="#0A84FF"
            strokeWidth={RING_STROKE}
            strokeOpacity={progress >= 1 ? 1 : 0.45 + progress * 0.45}
            strokeDasharray={`${filled} ${RING_CIRC - filled}`}
            strokeDashoffset={RING_CIRC * 0.25}
            strokeLinecap="round"
          />
        )}
      </Svg>
      {isToday && <View style={styles.todayDot} />}
    </View>
  );
}

export default function Sleep() {
  const navigation = useNavigation<any>();
  const [entries, setEntries] = useState<SleepEntry[]>([]);
  const [hours, setHours] = useState('');

  const todayISO = new Date().toISOString().split('T')[0];

  const loadEntries = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const data: SleepEntry[] = raw ? JSON.parse(raw) : [];
      setEntries(data);
    } catch (e) {
      console.warn('Failed to load sleep entries', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [loadEntries])
  );

  const saveEntries = async (next: SleepEntry[]) => {
    setEntries(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const todayEntry = entries.find((e) => e.date === todayISO);

  const handleSave = async () => {
    const parsed = parseFloat(hours);

    if (isNaN(parsed) || parsed <= 0 || parsed > 24) {
      Alert.alert('Invalid value', 'Enter a sleep value between 0 and 24 hours.');
      return;
    }

    const nextEntry: SleepEntry = {
      id: Date.now(),
      date: todayISO,
      hours: parsed,
    };

    const withoutToday = entries.filter((e) => e.date !== todayISO);
    const next = [nextEntry, ...withoutToday];
    await saveEntries(next);
    setHours('');
  };

  const last7 = useMemo(() => {
    const arr = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      arr.push(entries.find((e) => e.date === key));
    }
    return arr;
  }, [entries]);

  const avgSleep =
    last7.filter(Boolean).length > 0
      ? (
          last7.reduce((sum, e) => sum + (e?.hours ?? 0), 0) /
          last7.filter(Boolean).length
        ).toFixed(1)
      : null;

  const days = Array.from({ length: MONTH_DAYS }, (_, i) => i + 1);

  const progressMap: Record<number, number> = {};
  entries.forEach((entry) => {
    const day = new Date(entry.date).getDate();
    progressMap[day] = Math.min(entry.hours / 8, 1);
  });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
          <Text style={styles.backText}>Today</Text>
        </TouchableOpacity>
        <View style={[styles.dot, { backgroundColor: '#0A84FF' }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Sleep</Text>

        <Text style={styles.sectionLabel}>{MONTH}</Text>
        <View style={styles.calendar}>
          {days.map((day) => (
            <View key={day} style={styles.dayCell}>
              <MiniRing progress={progressMap[day] ?? 0} isToday={day === TODAY} />
              <Text style={[styles.dayNum, day === TODAY && { color: '#0A84FF' }]}>
                {day}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Today</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>
              {todayEntry ? todayEntry.hours.toFixed(1) : '—'}
            </Text>
            <Text style={styles.metricLabel}>hours slept</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>
              {avgSleep ? avgSleep : '—'}
            </Text>
            <Text style={styles.metricLabel}>7 day average</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Log sleep</Text>
        <View style={styles.inputCard}>
          <TextInput
            style={styles.input}
            placeholder="e.g. 7.5"
            placeholderTextColor="#333"
            keyboardType="decimal-pad"
            value={hours}
            onChangeText={setHours}
          />
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>
              {todayEntry ? 'Update sleep' : 'Save sleep'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>Last 7 nights</Text>
        <View style={styles.list}>
          {last7.map((entry, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const label = d.toLocaleDateString('en-AU', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            });

            return (
              <View key={label} style={styles.row}>
                <Text style={styles.rowDate}>{label}</Text>
                <Text style={styles.rowHours}>
                  {entry ? `${entry.hours.toFixed(1)} hrs` : '—'}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#1c1c1c',
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backArrow: { fontSize: 28, color: '#0A84FF', lineHeight: 32 },
  backText: { fontSize: 16, color: '#0A84FF' },
  dot: { width: 10, height: 10, borderRadius: 5 },

  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 60 },
  heading: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 20 },
  sectionLabel: {
    fontSize: 13,
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },

  calendar: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 32 },
  dayCell: { alignItems: 'center', gap: 3, width: 36 },
  dayNum: { fontSize: 10, color: '#444' },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#0A84FF',
    position: 'absolute',
    bottom: -6,
    alignSelf: 'center',
  },

  metricsGrid: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  metricCard: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  metricLabel: { fontSize: 12, color: '#555' },

  inputCard: {
    backgroundColor: '#111',
    borderRadius: 14,
    padding: 16,
    marginBottom: 32,
  },
  input: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#1c1c1c',
    paddingBottom: 12,
    marginBottom: 16,
  },
  saveBtn: {
    backgroundColor: '#0A84FF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },

  list: {
    backgroundColor: '#111',
    borderRadius: 14,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#1c1c1c',
  },
  rowDate: {
    fontSize: 14,
    color: '#aaa',
  },
  rowHours: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
});