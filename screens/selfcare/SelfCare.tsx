import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Svg, { Circle } from 'react-native-svg';

const STORAGE_KEY = 'selfcare_entries_v1';
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

type Habits = {
  skincare: boolean;
  walk: boolean;
  journal: boolean;
  meditate: boolean;
  water: boolean;
};

type SelfCareEntry = {
  date: string;
  habits: Habits;
};

const EMPTY_HABITS: Habits = {
  skincare: false,
  walk: false,
  journal: false,
  meditate: false,
  water: false,
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
            stroke="#30D158"
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

export default function SelfCare() {
  const navigation = useNavigation<any>();
  const [entries, setEntries] = useState<SelfCareEntry[]>([]);

  const todayISO = new Date().toISOString().split('T')[0];

  const loadEntries = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const data: SelfCareEntry[] = raw ? JSON.parse(raw) : [];
      setEntries(data);
    } catch (e) {
      console.warn('Failed to load self care entries', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [loadEntries])
  );

  const saveEntries = async (next: SelfCareEntry[]) => {
    setEntries(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const todayEntry = entries.find((e) => e.date === todayISO) ?? {
    date: todayISO,
    habits: EMPTY_HABITS,
  };

  const completedToday = Object.values(todayEntry.habits).filter(Boolean).length;
  const todayProgress = completedToday / 5;

  const toggleHabit = async (key: keyof Habits) => {
    const updatedEntry: SelfCareEntry = {
      ...todayEntry,
      habits: {
        ...todayEntry.habits,
        [key]: !todayEntry.habits[key],
      },
    };

    const withoutToday = entries.filter((e) => e.date !== todayISO);
    const next = [updatedEntry, ...withoutToday];
    await saveEntries(next);
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

  const avgProgress =
    last7.filter(Boolean).length > 0
      ? Math.round(
          (last7.reduce((sum, e) => {
            const done = e ? Object.values(e.habits).filter(Boolean).length : 0;
            return sum + done / 5;
          }, 0) /
            last7.length) *
            100
        )
      : 0;

  const days = Array.from({ length: MONTH_DAYS }, (_, i) => i + 1);

  const progressMap: Record<number, number> = {};
  entries.forEach((entry) => {
    const day = new Date(entry.date).getDate();
    const done = Object.values(entry.habits).filter(Boolean).length;
    progressMap[day] = done / 5;
  });

  const habitItems: { key: keyof Habits; title: string; sub: string }[] = [
    { key: 'skincare', title: 'Skincare', sub: 'AM or PM routine' },
    { key: 'walk', title: 'Walk', sub: 'Move your body a bit' },
    { key: 'journal', title: 'Journal', sub: 'Clear your head' },
    { key: 'meditate', title: 'Meditate', sub: 'Even just 5 minutes' },
    { key: 'water', title: 'Hydration', sub: 'Stayed on top of water' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
          <Text style={styles.backText}>Today</Text>
        </TouchableOpacity>
        <View style={[styles.dot, { backgroundColor: '#30D158' }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Self care</Text>

        <Text style={styles.sectionLabel}>{MONTH}</Text>
        <View style={styles.calendar}>
          {days.map((day) => (
            <View key={day} style={styles.dayCell}>
              <MiniRing progress={progressMap[day] ?? 0} isToday={day === TODAY} />
              <Text style={[styles.dayNum, day === TODAY && { color: '#30D158' }]}>
                {day}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Today</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{completedToday}/5</Text>
            <Text style={styles.metricLabel}>habits done</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{avgProgress}%</Text>
            <Text style={styles.metricLabel}>7 day average</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Check in</Text>
        <View style={styles.toggleList}>
          {habitItems.map((item) => {
            const active = todayEntry.habits[item.key];
            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.toggleRow, active && styles.toggleRowActive]}
                onPress={() => toggleHabit(item.key)}
                activeOpacity={0.75}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.toggleTitle}>{item.title}</Text>
                  <Text style={styles.toggleSub}>{item.sub}</Text>
                </View>
                <View style={[styles.checkCircle, active && styles.checkCircleActive]}>
                  <Text style={[styles.checkText, active && styles.checkTextActive]}>
                    {active ? '✓' : '○'}
                  </Text>
                </View>
              </TouchableOpacity>
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
  backArrow: { fontSize: 28, color: '#30D158', lineHeight: 32 },
  backText: { fontSize: 16, color: '#30D158' },
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
    backgroundColor: '#30D158',
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

  toggleList: {
    gap: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 14,
    padding: 16,
  },
  toggleRowActive: {
    backgroundColor: '#0d1a0f',
    borderWidth: 0.5,
    borderColor: '#30D15855',
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  toggleSub: {
    fontSize: 12,
    color: '#666',
  },
  checkCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1c1c1c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleActive: {
    backgroundColor: '#30D158',
  },
  checkText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '700',
  },
  checkTextActive: {
    color: '#000',
  },
});