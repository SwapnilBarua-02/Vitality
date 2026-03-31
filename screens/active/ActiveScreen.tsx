import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, TouchableOpacity, Animated, Easing
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useRef } from 'react';
import Svg, { Circle } from 'react-native-svg';
import { useStore } from '../../store';

const MONTH_DAYS = 31;
const TODAY = new Date().getDate();
const MONTH = new Date().toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });

const mockProgress: Record<number, number> = {
  1: 1.0, 2: 0.6, 3: 0.3, 4: 1.0, 5: 0.8,
  6: 0.0, 7: 0.5, 8: 1.0, 9: 0.9, 10: 0.4,
  11: 1.0, 12: 0.7, 13: 0.2, 14: 1.0, 15: 0.6,
  16: 0.9, 17: 1.0, 18: 0.3, 19: 0.8, 20: 1.0,
  21: 0.5, 22: 0.4,
};

const RING_SIZE = 36;
const RING_STROKE = 4;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRC = 2 * Math.PI * RING_RADIUS;

function MiniRing({ progress, isToday }: { progress: number; isToday: boolean }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isToday) return;

    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
      ])
    ).start();
  }, [anim, isToday]);

  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1] });
  const filled = RING_CIRC * progress;

  return (
    <Animated.View style={{ opacity: isToday ? opacity : 1 }}>
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
            stroke="#FF5A5F"
            strokeWidth={RING_STROKE}
            strokeOpacity={progress >= 1 ? 1 : 0.45 + progress * 0.45}
            strokeDasharray={`${filled} ${RING_CIRC - filled}`}
            strokeDashoffset={RING_CIRC * 0.25}
            strokeLinecap="round"
          />
        )}
      </Svg>
      {isToday && <View style={styles.todayDot} />}
    </Animated.View>
  );
}

export default function ActiveScreen() {
  const navigation = useNavigation<any>();
  const { blocks, workoutSessions } = useStore();

  const allExercises = blocks.flatMap(b => b.exercises);
  const allSets = allExercises.flatMap(e => e.sets);

  const totalWeight = allSets.reduce((s, set) =>
    s + (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0), 0
  );
  const totalReps = allSets.reduce((s, set) => s + (parseInt(set.reps) || 0), 0);
  const totalExercises = allExercises.filter(e => e.name.trim() !== '').length;
  const totalSets = allSets.length;

  const days = Array.from({ length: MONTH_DAYS }, (_, i) => i + 1);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
          <Text style={styles.backText}>Today</Text>
        </TouchableOpacity>
        <View style={[styles.dot, { backgroundColor: '#FF5A5F' }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Activity</Text>

        <Text style={styles.sectionLabel}>{MONTH}</Text>
        <View style={styles.calendarCard}>
          <View style={styles.calendarGrid}>
            {days.map(day => (
              <View key={`day-${day}`} style={styles.dayCell}>
                <MiniRing progress={mockProgress[day] ?? 0} isToday={day === TODAY} />
                <Text style={[styles.dayNum, day === TODAY && { color: '#FF5A5F' }]}>
                  {day}
                </Text>
              </View>
            ))}
          </View>
        </View>

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

        <TouchableOpacity
          style={styles.logBtn}
          onPress={() => navigation.navigate('LogSession')}
        >
          <Text style={styles.logBtnText}>+ Log session</Text>
        </TouchableOpacity>

        {workoutSessions.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.sectionLabel}>Past sessions</Text>

            {workoutSessions.map(session => {
              const allEx = session.blocks.flatMap(b => b.exercises);
              const allSt = allEx.flatMap(e => e.sets);
              const totalWt = allSt.reduce((s, set) =>
                s + (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0), 0
              );

              return (
                <TouchableOpacity
                  key={session.id}
                  style={styles.historyCard}
                  activeOpacity={0.75}
                  onPress={() => navigation.navigate('WorkoutDetail', { session })}
                >
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#050505' },
  scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 50 },

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
  backBtn: { flexDirection: 'row', alignItems: 'center' },
  backArrow: { fontSize: 28, color: '#FF5A5F', lineHeight: 32, marginRight: 4 },
  backText: { fontSize: 16, color: '#FF5A5F' },
  dot: { width: 10, height: 10, borderRadius: 5 },

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
    backgroundColor: '#FF5A5F',
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

  logBtn: {
    backgroundColor: '#FF5A5F',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  logBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },

  historySection: { marginTop: 24 },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#101114',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1F2125',
    padding: 16,
    marginBottom: 10,
  },
  historyLeft: { flex: 1 },
  historyLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    color: '#7A7A7A',
    marginBottom: 6,
  },
  historyStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyStat: {
    fontSize: 12,
    color: '#9A9EA5',
  },
  historyDot: {
    fontSize: 12,
    color: '#3A3E45',
    marginHorizontal: 6,
  },
  historyChevron: {
    fontSize: 20,
    color: '#4A4E55',
  },
});