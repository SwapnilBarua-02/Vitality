import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, TouchableOpacity
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Circle } from 'react-native-svg';
import { useStore } from '../../store';

const MONTH_DAYS = 31;
const TODAY = new Date().getDate();
const MONTH = new Date().toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });

const mockProgress: Record<number, number> = {
  1: 1.0, 2: 0.5, 3: 0.8, 4: 1.0, 5: 0.3,
  6: 0.9, 7: 1.0, 8: 0.6, 9: 0.2, 10: 1.0,
  11: 0.7, 12: 1.0, 13: 0.4, 14: 0.9, 15: 1.0,
  16: 0.6, 17: 0.3, 18: 1.0, 19: 0.8, 20: 0.5,
  21: 1.0, 22: 0.4,
};

const RING_SIZE = 28;
const RING_STROKE = 3;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRC = 2 * Math.PI * RING_RADIUS;

function MiniRing({ progress, isToday }: { progress: number; isToday: boolean }) {
  const filled = RING_CIRC * progress;
  return (
    <View>
      <Svg width={RING_SIZE} height={RING_SIZE}>
        <Circle
          cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_RADIUS}
          fill="none" stroke="#1c1c1c" strokeWidth={RING_STROKE}
        />
        {progress > 0 && (
          <Circle
            cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_RADIUS}
            fill="none"
            stroke="#BF5AF2"
            strokeWidth={RING_STROKE}
            strokeOpacity={progress >= 1 ? 1 : 0.4 + progress * 0.5}
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

  const todaySessions = timerSessions.filter(
    s => s.date === new Date().toISOString().split('T')[0]
  );
  const totalMins = Math.floor(todaySessions.reduce((s, t) => s + t.elapsedSecs, 0) / 60);
  const longestMins = Math.floor(Math.max(0, ...todaySessions.map(t => t.elapsedSecs)) / 60);
  const goalProgress = totalMins > 0 ? Math.min(Math.round((totalMins / 60) * 100), 100) : 0;

  const days = Array.from({ length: MONTH_DAYS }, (_, i) => i + 1);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
          <Text style={styles.backText}>Today</Text>
        </TouchableOpacity>
        <View style={[styles.dot, { backgroundColor: '#BF5AF2' }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Being productive</Text>

        <Text style={styles.sectionLabel}>{MONTH}</Text>
        <View style={styles.calendar}>
          {days.map(day => (
            <View key={day} style={styles.dayCell}>
              <MiniRing progress={mockProgress[day] ?? 0} isToday={day === TODAY} />
              <Text style={[styles.dayNum, day === TODAY && { color: '#BF5AF2' }]}>
                {day}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Today</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{totalMins > 0 ? totalMins : '—'}</Text>
            <Text style={styles.metricLabel}>mins studied</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{todaySessions.length > 0 ? todaySessions.length : '—'}</Text>
            <Text style={styles.metricLabel}>sessions</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{longestMins > 0 ? longestMins : '—'}</Text>
            <Text style={styles.metricLabel}>longest session</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{goalProgress > 0 ? `${goalProgress}%` : '—'}</Text>
            <Text style={styles.metricLabel}>goal progress</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Choose method</Text>
        <View style={styles.methodGrid}>
          {[
            { key: 'pomodoro',  title: 'Pomodoro',   sub: '25 / 5 min',  detail: '4 cycles + long break' },
            { key: 'deep',      title: 'Deep work',  sub: '50 / 10 min', detail: 'Extended concentration' },
            { key: 'ultradian', title: 'Ultradian',  sub: '90 / 20 min', detail: 'Natural energy cycles' },
            { key: 'custom',    title: 'Custom',     sub: 'Your pace',   detail: 'Set your own rhythm' },
          ].map(m => (
            <TouchableOpacity
              key={m.key}
              style={styles.methodCard}
              activeOpacity={0.7}
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
  safe:         { flex: 1, backgroundColor: '#000' },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#1c1c1c' },
  backBtn:      { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backArrow:    { fontSize: 28, color: '#BF5AF2', lineHeight: 32 },
  backText:     { fontSize: 16, color: '#BF5AF2' },
  dot:          { width: 10, height: 10, borderRadius: 5 },
  scroll:       { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 60 },
  heading:      { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 20 },
  sectionLabel: { fontSize: 13, color: '#555', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },
  calendar:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 32 },
  dayCell:      { alignItems: 'center', gap: 3, width: 36 },
  dayNum:       { fontSize: 10, color: '#444' },
  todayDot:     { width: 4, height: 4, borderRadius: 2, backgroundColor: '#BF5AF2', position: 'absolute', bottom: -6, alignSelf: 'center' },
  metricsGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 32 },
  metricCard:   { flex: 1, minWidth: '45%', backgroundColor: '#111', borderRadius: 12, padding: 16 },
  metricValue:  { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 4 },
  metricLabel:  { fontSize: 12, color: '#555' },
  methodGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 32 },
  methodCard:   { flex: 1, minWidth: '45%', backgroundColor: '#111', borderRadius: 12, padding: 16, gap: 4 },
  methodTitle:  { fontSize: 15, fontWeight: '600', color: '#fff' },
  methodSub:    { fontSize: 20, fontWeight: '700', color: '#BF5AF2' },
  methodDetail: { fontSize: 11, color: '#555', marginTop: 4 },
  methodArrow:  { fontSize: 20, color: '#333', marginTop: 8 },
});