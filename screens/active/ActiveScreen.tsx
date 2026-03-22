import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, TouchableOpacity, Animated, Easing
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useRef } from 'react';
import Svg, { Circle } from 'react-native-svg';
import { useStore } from '../../store';

// ─── Constants ───────────────────────────────────────────────────────────────
const MONTH_DAYS = 31;
const TODAY = new Date().getDate();
const MONTH = new Date().toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });

// Mock progress data for the calendar (replace with real data later)
const mockProgress: Record<number, number> = {
  1: 1.0, 2: 0.6, 3: 0.3, 4: 1.0, 5: 0.8,
  6: 0.0, 7: 0.5, 8: 1.0, 9: 0.9, 10: 0.4,
  11: 1.0, 12: 0.7, 13: 0.2, 14: 1.0, 15: 0.6,
  16: 0.9, 17: 1.0, 18: 0.3, 19: 0.8, 20: 1.0,
  21: 0.5, 22: 0.4,
};

// ─── Mini Ring (used in calendar) ────────────────────────────────────────────
// Each small circle in the calendar grid showing daily progress
const RING_SIZE = 28;
const RING_STROKE = 3;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRC = 2 * Math.PI * RING_RADIUS;

function MiniRing({ progress, isToday }: { progress: number; isToday: boolean }) {
  // Pulse animation — only runs on today's ring
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });
  const filled = RING_CIRC * progress;

  return (
    <Animated.View style={{ opacity: isToday ? opacity : 1 }}>
      <Svg width={RING_SIZE} height={RING_SIZE}>
        {/* Background track */}
        <Circle
          cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_RADIUS}
          fill="none" stroke="#1c1c1c" strokeWidth={RING_STROKE}
        />
        {/* Progress arc */}
        {progress > 0 && (
          <Circle
            cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_RADIUS}
            fill="none"
            stroke="#FF375F"
            strokeWidth={RING_STROKE}
            strokeOpacity={progress >= 1 ? 1 : 0.4 + progress * 0.5}
            strokeDasharray={`${filled} ${RING_CIRC - filled}`}
            strokeDashoffset={RING_CIRC * 0.25}
            strokeLinecap="round"
          />
        )}
      </Svg>
      {/* Small red dot under today's ring */}
      {isToday && <View style={styles.todayDot} />}
    </Animated.View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function ActiveScreen() {
  const navigation = useNavigation<any>();

  // Pull data from global store
  const { blocks, workoutSessions } = useStore();

  // ─── Metric calculations (used in Today's stats cards) ───────────────────
  const allExercises = blocks.flatMap(b => b.exercises);
  const allSets = allExercises.flatMap(e => e.sets);
  const totalWeight = allSets.reduce((s, set) =>
    s + (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0), 0
  );
  const totalReps = allSets.reduce((s, set) => s + (parseInt(set.reps) || 0), 0);
  const totalExercises = allExercises.filter(e => e.name.trim() !== '').length;
  const totalSets = allSets.length;

  // Array of day numbers [1, 2, 3, ... 31] for the calendar grid
  const days = Array.from({ length: MONTH_DAYS }, (_, i) => i + 1);

  return (
    <SafeAreaView style={styles.safe}>

      {/* ─── Header — back button + red dot ─────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
          <Text style={styles.backText}>Today</Text>
        </TouchableOpacity>
        <View style={[styles.dot, { backgroundColor: '#FF375F' }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* ─── Page title ──────────────────────────────────────────────── */}
        <Text style={styles.heading}>Being active</Text>

        {/* ─── Calendar section ────────────────────────────────────────── */}
        {/* Shows a grid of mini rings, one per day of the month */}
        <Text style={styles.sectionLabel}>{MONTH}</Text>
        <View style={styles.calendar}>
          {days.map(day => (
            <View key={day} style={styles.dayCell}>
              <MiniRing progress={mockProgress[day] ?? 0} isToday={day === TODAY} />
              <Text style={[styles.dayNum, day === TODAY && { color: '#FF375F' }]}>
                {day}
              </Text>
            </View>
          ))}
        </View>

        {/* ─── Today's metrics section ─────────────────────────────────── */}
        {/* 4 stat cards showing live data from the current session */}
        <Text style={styles.sectionLabel}>Today</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{totalWeight > 0 ? totalWeight : '—'}</Text>
            <Text style={styles.metricLabel}>kg lifted</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{totalSets > 0 ? totalSets : '—'}</Text>
            <Text style={styles.metricLabel}>total sets</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{totalExercises > 0 ? totalExercises : '—'}</Text>
            <Text style={styles.metricLabel}>exercises</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{totalReps > 0 ? totalReps : '—'}</Text>
            <Text style={styles.metricLabel}>total reps</Text>
          </View>
        </View>

        {/* ─── Log session button ──────────────────────────────────────── */}
        {/* Tapping this opens SessionLog screen to add exercises */}
        <TouchableOpacity
          style={styles.logBtn}
          onPress={() => navigation.navigate('LogSession')}
        >
          <Text style={styles.logBtnText}>+ Log session</Text>
        </TouchableOpacity>

        {/* ─── Past sessions history section ───────────────────────────── */}
        {/* Shows all previously saved workout sessions */}
        {/* Only renders if there are saved sessions */}
        {workoutSessions.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.sectionLabel}>Past sessions</Text>

            {workoutSessions.map(session => {
              // Calculate summary stats for each past session
              const allEx = session.blocks.flatMap(b => b.exercises);
              const allSt = allEx.flatMap(e => e.sets);
              const totalWt = allSt.reduce((s, set) =>
                s + (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0), 0
              );

              return (
                // Tapping a session card navigates to WorkoutDetail screen
                <TouchableOpacity
                  key={session.id}
                  style={styles.historyCard}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('WorkoutDetail', { session })}
                >
                  {/* Session name + date + stats */}
                  <View style={styles.historyLeft}>
                    <Text style={styles.historyLabel}>{session.label}</Text>
                    <Text style={styles.historyDate}>
                      {new Date(session.date).toLocaleDateString('en-AU', {
                        weekday: 'short', day: 'numeric', month: 'short'
                      })}
                    </Text>
                    <View style={styles.historyStats}>
                      <Text style={styles.historyStat}>
                        {allEx.filter(e => e.name.trim()).length} exercises
                      </Text>
                      <Text style={styles.historyDot}>·</Text>
                      <Text style={styles.historyStat}>{allSt.length} sets</Text>
                      {totalWt > 0 && (
                        <>
                          <Text style={styles.historyDot}>·</Text>
                          <Text style={styles.historyStat}>{totalWt}kg</Text>
                        </>
                      )}
                    </View>
                  </View>
                  {/* Chevron arrow pointing right */}
                  <Text style={styles.historyChevron}>›</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Layout
  safe:           { flex: 1, backgroundColor: '#000' },
  scroll:         { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 60 },

  // Header
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#1c1c1c' },
  backBtn:        { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backArrow:      { fontSize: 28, color: '#FF375F', lineHeight: 32 },
  backText:       { fontSize: 16, color: '#FF375F' },
  dot:            { width: 10, height: 10, borderRadius: 5 },

  // Typography
  heading:        { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 20 },
  sectionLabel:   { fontSize: 13, color: '#555', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },

  // Calendar grid
  calendar:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 32 },
  dayCell:        { alignItems: 'center', gap: 3, width: 36 },
  dayNum:         { fontSize: 10, color: '#444' },
  todayDot:       { width: 4, height: 4, borderRadius: 2, backgroundColor: '#FF375F', position: 'absolute', bottom: -6, alignSelf: 'center' },

  // Metrics cards grid
  metricsGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 32 },
  metricCard:     { flex: 1, minWidth: '45%', backgroundColor: '#111', borderRadius: 12, padding: 16 },
  metricValue:    { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 4 },
  metricLabel:    { fontSize: 12, color: '#555' },

  // Log session button
  logBtn:         { backgroundColor: '#FF375F', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 8 },
  logBtnText:     { fontSize: 16, fontWeight: '600', color: '#fff' },

  // Past sessions history
  historySection: { marginTop: 32 },
  historyCard:    { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', borderRadius: 12, padding: 16, marginBottom: 10 },
  historyLeft:    { flex: 1 },
  historyLabel:   { fontSize: 15, fontWeight: '600', color: '#fff', marginBottom: 4 },
  historyDate:    { fontSize: 12, color: '#555', marginBottom: 6 },
  historyStats:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  historyStat:    { fontSize: 12, color: '#888' },
  historyDot:     { fontSize: 12, color: '#333' },
  historyChevron: { fontSize: 20, color: '#333' },
});