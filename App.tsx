import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop, Line } from 'react-native-svg';

const HABITS = [
  { name: 'Being active',     color: '#FF375F', progress: 0.8 },
  { name: 'Being productive', color: '#BF5AF2', progress: 0.6 },
  { name: 'Cleaning',         color: '#30D158', progress: 1.0 },
  { name: 'Self care',        color: '#FF9F0A', progress: 0.4 },
  { name: 'Sleep',            color: '#0A84FF', progress: 0.9 },
];

const SIZE = 220;
const STROKE = 16;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SEGMENT = CIRCUMFERENCE / HABITS.length;
const GAP = 2;

const totalScore = Math.round(
  (HABITS.reduce((sum, h) => sum + h.progress, 0) / HABITS.length) * 100
);
const isComplete = totalScore === 100;

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <Text style={styles.heading}>Today</Text>
        <Text style={styles.date}>
          {new Date().toLocaleDateString('en-AU', { weekday: 'long', month: 'long', day: 'numeric' })}
        </Text>

        <View style={styles.ringContainer}>
          <Svg width={SIZE} height={SIZE}>
            <Defs>
              <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
                <Stop offset="60%" stopColor="#FF375F" stopOpacity="0" />
                <Stop offset="100%" stopColor="#FF375F" stopOpacity="0.35" />
              </RadialGradient>
            </Defs>

            {/* Track */}
            <Circle
              cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
              fill="none" stroke="#1c1c1c" strokeWidth={STROKE}
            />

            {/* Glow when complete */}
            {isComplete && (
              <Circle
                cx={SIZE / 2} cy={SIZE / 2} r={RADIUS + STROKE}
                fill="url(#glow)"
              />
            )}

            {/* Segments */}
            {HABITS.map((habit, i) => {
              const filled = (SEGMENT - GAP) * habit.progress;
              const offset = -(i * SEGMENT) + GAP / 2;
              return (
                <Circle
                  key={i}
                  cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
                  fill="none"
                  stroke={isComplete ? '#FF375F' : habit.color}
                  strokeWidth={STROKE}
                  strokeDasharray={`${filled} ${CIRCUMFERENCE - filled}`}
                  strokeDashoffset={offset}
                  strokeLinecap="square"
                  rotation={-90}
                  origin={`${SIZE / 2}, ${SIZE / 2}`}
                />
              );
            })}

            {/* Segment separators */}
            {HABITS.map((_, i) => {
              const angle = (i * (360 / HABITS.length) - 90) * (Math.PI / 180);
              const x1 = SIZE / 2 + (RADIUS - STROKE / 2) * Math.cos(angle);
              const y1 = SIZE / 2 + (RADIUS - STROKE / 2) * Math.sin(angle);
              const x2 = SIZE / 2 + (RADIUS + STROKE / 2) * Math.cos(angle);
              const y2 = SIZE / 2 + (RADIUS + STROKE / 2) * Math.sin(angle);
              return (
                <Line
                  key={`sep-${i}`}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="#ffffff"
                  strokeWidth={2.5}
                  strokeOpacity={1}
                />
              );
            })}

          </Svg>

          <View style={styles.ringCenter}>
            <Text style={[styles.scoreText, isComplete && { color: '#FF375F' }]}>
              {totalScore}%
            </Text>
            <Text style={styles.scoreLabel}>
              {isComplete ? 'Perfect day' : 'Keep going'}
            </Text>
          </View>
        </View>

        <View style={styles.habitList}>
          {HABITS.map((habit, i) => (
            <TouchableOpacity key={i} style={styles.habitRow} activeOpacity={0.6}>
              <View style={[styles.habitDot, { backgroundColor: habit.color }]} />
              <Text style={styles.habitName}>{habit.name}</Text>
              <Text style={styles.habitPct}>{Math.round(habit.progress * 100)}%</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#000' },
  scroll:        { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },
  heading:       { fontSize: 32, fontWeight: '700', color: '#fff', marginBottom: 4 },
  date:          { fontSize: 14, color: '#555', marginBottom: 24 },
  ringContainer: { alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  ringCenter:    { position: 'absolute', alignItems: 'center' },
  scoreText:     { fontSize: 44, fontWeight: '700', color: '#fff' },
  scoreLabel:    { fontSize: 13, color: '#555', marginTop: 4 },
  habitList:     { borderTopWidth: 0.5, borderTopColor: '#1c1c1c' },
  habitRow:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 0.5, borderBottomColor: '#1c1c1c' },
  habitDot:      { width: 10, height: 10, borderRadius: 5, marginRight: 14 },
  habitName:     { flex: 1, fontSize: 15, color: '#fff' },
  habitPct:      { fontSize: 14, color: '#555', marginRight: 8 },
  chevron:       { fontSize: 20, color: '#333' },
});