import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, TouchableOpacity
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useStore } from '../../store';

type Method = {
  name: string;
  focus: number;
  break: number;
  longBreak?: number;
  cycles?: number;
  description: string;
  best: string;
};

const METHODS: Record<string, Method> = {
  pomodoro: {
    name: 'Pomodoro',
    focus: 25,
    break: 5,
    longBreak: 20,
    cycles: 4,
    description: '25 mins focus, 5 min break. Every 4 cycles take a longer 20 min break.',
    best: 'Best for daily tasks, studying, and building consistency.',
  },
  deep: {
    name: 'Deep work',
    focus: 50,
    break: 10,
    description: '50 mins of focused work followed by a 10 min break.',
    best: 'Best for medium-complexity tasks needing extended concentration.',
  },
  ultradian: {
    name: 'Ultradian',
    focus: 90,
    break: 20,
    description: '90 mins focus, 20 min break. Matches your natural energy cycles.',
    best: 'Best for creative work, research, and deep problem solving.',
  },
  custom: {
    name: 'Custom',
    focus: 60,
    break: 10,
    description: 'Set your own focus and break duration.',
    best: 'Best when you know exactly how long you can sustain focus.',
  },
};

export default function MethodScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { timer, stopTimer } = useStore();
  const method = METHODS[route.params?.method ?? 'pomodoro'];

  const isThisTimerRunning = timer.running && timer.methodName === method.name;

  const navigateToTimer = () => {
    navigation.navigate('Timer', {
      goalMins: method.focus,
      breakMins: method.break,
      longBreakMins: method.longBreak,
      cycles: method.cycles,
      methodName: method.name,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>{method.name}</Text>
        <Text style={styles.desc}>{method.description}</Text>
        <Text style={styles.best}>{method.best}</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{method.focus}</Text>
            <Text style={styles.statLabel}>focus mins</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{method.break}</Text>
            <Text style={styles.statLabel}>break mins</Text>
          </View>
          {method.longBreak && (
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{method.longBreak}</Text>
              <Text style={styles.statLabel}>long break</Text>
            </View>
          )}
          {method.cycles && (
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{method.cycles}</Text>
              <Text style={styles.statLabel}>cycles</Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionLabel}>Session flow</Text>
        <View style={styles.flowWrap}>
          {Array.from({ length: method.cycles ?? 2 }).map((_, i) => (
            <View key={i} style={styles.flowRow}>
              <View style={styles.flowBlock}>
                <View style={[styles.flowBar, { backgroundColor: '#BF5AF2', flex: method.focus }]} />
                <Text style={styles.flowLabel}>Focus {method.focus}m</Text>
              </View>
              <View style={styles.flowBlock}>
                <View style={[styles.flowBar, {
                  backgroundColor: method.longBreak && i === (method.cycles ?? 0) - 1
                    ? '#FF375F'
                    : '#1c1c1c',
                  flex: method.longBreak && i === (method.cycles ?? 0) - 1
                    ? method.longBreak
                    : method.break,
                }]} />
                <Text style={styles.flowLabel}>
                  {method.longBreak && i === (method.cycles ?? 0) - 1
                    ? `Long break ${method.longBreak}m`
                    : `Break ${method.break}m`}
                </Text>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>

      <View style={styles.footer}>
        {isThisTimerRunning && (
          <TouchableOpacity
            style={[styles.startBtn, styles.continueBtn]}
            onPress={navigateToTimer}
          >
            <Text style={styles.continueBtnText}>Continue session</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.startBtn}
          onPress={() => {
            if (isThisTimerRunning) {
              stopTimer();
            }
            navigateToTimer();
          }}
        >
          <Text style={styles.startBtnText}>
            {isThisTimerRunning ? 'Start new session' : 'Start session'}
          </Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#000' },
  header:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#1c1c1c' },
  backBtn:       { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backArrow:     { fontSize: 28, color: '#BF5AF2', lineHeight: 32 },
  backText:      { fontSize: 16, color: '#BF5AF2' },
  scroll:        { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 120 },
  heading:       { fontSize: 34, fontWeight: '700', color: '#fff', marginBottom: 12 },
  desc:          { fontSize: 15, color: '#888', lineHeight: 22, marginBottom: 8 },
  best:          { fontSize: 13, color: '#555', lineHeight: 20, marginBottom: 32 },
  statsGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 32 },
  statCard:      { flex: 1, minWidth: '45%', backgroundColor: '#111', borderRadius: 12, padding: 16 },
  statValue:     { fontSize: 36, fontWeight: '700', color: '#BF5AF2', marginBottom: 4 },
  statLabel:     { fontSize: 12, color: '#555' },
  sectionLabel:  { fontSize: 13, color: '#555', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },
  flowWrap:      { gap: 12 },
  flowRow:       { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  flowBlock:     { flex: 1, gap: 4 },
  flowBar:       { height: 6, borderRadius: 3 },
  flowLabel:     { fontSize: 11, color: '#444' },
  footer:        { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 12, borderTopWidth: 0.5, borderTopColor: '#1c1c1c' },
  continueBtn:   { backgroundColor: '#1a0a2a', borderWidth: 0.5, borderColor: '#BF5AF2', marginBottom: 10 },
  continueBtnText: { fontSize: 16, fontWeight: '600', color: '#BF5AF2' },
  startBtn:      { backgroundColor: '#BF5AF2', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  startBtnText:  { fontSize: 16, fontWeight: '600', color: '#fff' },
});