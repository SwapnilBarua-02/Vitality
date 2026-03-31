import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Circle } from 'react-native-svg';
import { useStore } from '../../store';
import LiveTimerBanner from '../../Components/LiveTimerBanner';

const MONTH_DAYS = 31;
const TODAY = new Date().getDate();
const MONTH = new Date().toLocaleDateString('en-AU', {
  month: 'long',
  year: 'numeric',
});

const mockProgress: Record<number, number> = {
  1: 1.0, 2: 0.5, 3: 0.8, 4: 1.0, 5: 0.3,
  6: 0.9, 7: 1.0, 8: 0.6, 9: 0.2, 10: 1.0,
  11: 0.7, 12: 1.0, 13: 0.4, 14: 0.9, 15: 1.0,
  16: 0.6, 17: 0.3, 18: 1.0, 19: 0.8, 20: 0.5,
  21: 1.0, 22: 0.4,
};

const RING_SIZE = 36;
const RING_STROKE = 4;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRC = 2 * Math.PI * RING_RADIUS;

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
          stroke="#23252B"
          strokeWidth={RING_STROKE}
        />
        {progress > 0 && (
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            stroke="#8B5CF6"
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

export default function ProdScreen() {
  const navigation = useNavigation<any>();
  const { timerSessions } = useStore();

  const todayISO = new Date().toISOString().split('T')[0];

  const todaySessions = timerSessions.filter(
    (s) => s.date === todayISO
  );

  const totalMins = Math.floor(
    todaySessions.reduce((sum, session) => sum + session.elapsedSecs, 0) / 60
  );

  const longestMins = Math.floor(
    Math.max(0, ...todaySessions.map((s) => s.elapsedSecs)) / 60
  );

  const goalProgress =
    totalMins > 0 ? Math.min(Math.round((totalMins / 60) * 100), 100) : 0;

  const days = Array.from({ length: MONTH_DAYS }, (_, i) => i + 1);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
          <Text style={styles.backText}>Today</Text>
        </TouchableOpacity>
        <View style={[styles.dot, { backgroundColor: '#8B5CF6' }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Focus</Text>

        <LiveTimerBanner />

        <Text style={styles.sectionLabel}>{MONTH}</Text>
        <View style={styles.calendarCard}>
          <View style={styles.calendarGrid}>
            {days.map((day) => (
              <View key={`focus-day-${day}`} style={styles.dayCell}>
                <MiniRing progress={mockProgress[day] ?? 0} isToday={day === TODAY} />
                <Text style={[styles.dayNum, day === TODAY && { color: '#8B5CF6' }]}>
                  {day}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.sectionLabel}>Today</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{totalMins > 0 ? totalMins : '—'}</Text>
            <Text style={styles.metricLabel}>mins focused</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>
              {todaySessions.length > 0 ? todaySessions.length : '—'}
            </Text>
            <Text style={styles.metricLabel}>sessions</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{longestMins > 0 ? longestMins : '—'}</Text>
            <Text style={styles.metricLabel}>longest session</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>
              {goalProgress > 0 ? `${goalProgress}%` : '—'}
            </Text>
            <Text style={styles.metricLabel}>goal progress</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Choose method</Text>
        <View style={styles.methodGrid}>
          {[
            { key: 'pomodoro', title: 'Pomodoro', sub: '25 / 5 min', detail: 'Consistency' },
            { key: 'deep', title: 'Deep work', sub: '50 / 10 min', detail: 'Longer blocks' },
            { key: 'ultradian', title: 'Ultradian', sub: '90 / 20 min', detail: 'Deep sessions' },
            { key: 'custom', title: 'Custom', sub: 'Your pace', detail: 'Flexible timer' },
          ].map((m) => (
            <TouchableOpacity
              key={m.key}
              style={styles.methodCard}
              activeOpacity={0.78}
              onPress={() => navigation.navigate('Method', { method: m.key })}
            >
              <Text style={styles.methodTitle}>{m.title}</Text>
              <Text style={styles.methodSub}>{m.sub}</Text>
              <Text style={styles.methodDetail}>{m.detail}</Text>
              <Text style={styles.methodArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#050505',
  },

  scroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 50,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#181A1E',
    backgroundColor: '#050505',
  },

  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  backArrow: {
    fontSize: 28,
    color: '#8B5CF6',
    lineHeight: 32,
    marginRight: 4,
  },

  backText: {
    fontSize: 16,
    color: '#8B5CF6',
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  heading: {
    fontSize: 30,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 18,
    letterSpacing: -0.5,
  },

  sectionLabel: {
    fontSize: 12,
    color: '#7A7A7A',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },

  calendarCard: {
    backgroundColor: '#101114',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#1F2125',
    padding: 14,
    marginBottom: 26,
  },

  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },

  dayCell: {
    width: '14.28%',
    alignItems: 'center',
    marginBottom: 16,
  },

  dayNum: {
    fontSize: 11,
    color: '#6A6E75',
    marginTop: 6,
  },

  todayDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#8B5CF6',
    position: 'absolute',
    bottom: -7,
    alignSelf: 'center',
  },

  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 22,
  },

  metricCard: {
    width: '48.2%',
    backgroundColor: '#101114',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1F2125',
    padding: 16,
    marginBottom: 12,
  },

  metricValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },

  metricLabel: {
    fontSize: 12,
    color: '#7A7A7A',
  },

  methodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  methodCard: {
    width: '48.2%',
    backgroundColor: '#101114',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1F2125',
    padding: 16,
    marginBottom: 12,
    minHeight: 140,
    justifyContent: 'space-between',
  },

  methodTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },

  methodSub: {
    fontSize: 22,
    fontWeight: '700',
    color: '#8B5CF6',
    marginTop: 4,
  },

  methodDetail: {
    fontSize: 12,
    color: '#7A7A7A',
    marginTop: 6,
  },

  methodArrow: {
    fontSize: 20,
    color: '#5C5F66',
    marginTop: 8,
  },
});