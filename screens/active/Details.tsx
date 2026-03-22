import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { WorkoutSession } from '../../store';

export default function WorkoutDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const session: WorkoutSession = route.params?.session;

  const allExercises = session.blocks.flatMap(b => b.exercises);
  const allSets = allExercises.flatMap(e => e.sets);
  const totalWeight = allSets.reduce((s, set) =>
    s + (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0), 0
  );
  const totalReps = allSets.reduce((s, set) => s + (parseInt(set.reps) || 0), 0);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' });
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
        <Text style={styles.heading}>{session.label}</Text>
        <Text style={styles.date}>{formatDate(session.date)}</Text>

        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{allExercises.filter(e => e.name.trim()).length}</Text>
            <Text style={styles.summaryLabel}>exercises</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{allSets.length}</Text>
            <Text style={styles.summaryLabel}>total sets</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{totalWeight > 0 ? totalWeight : '—'}</Text>
            <Text style={styles.summaryLabel}>kg lifted</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{totalReps > 0 ? totalReps : '—'}</Text>
            <Text style={styles.summaryLabel}>total reps</Text>
          </View>
        </View>

        {/* Full breakdown */}
        <Text style={styles.sectionLabel}>Exercises</Text>
        {session.blocks.map((block, bi) => (
          <View key={block.id} style={styles.block}>
            <Text style={styles.blockLabel}>
              {block.isSuperset ? 'Superset' : `Exercise ${bi + 1}`}
            </Text>
            {block.exercises.map((ex, ei) => (
              <View key={ex.id}>
                {block.isSuperset && ei > 0 && (
                  <View style={styles.supersetDivider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.plusSign}>+</Text>
                    <View style={styles.dividerLine} />
                  </View>
                )}
                <Text style={styles.exName}>{ex.name || 'Unnamed exercise'}</Text>
                <View style={styles.setHeader}>
                  <Text style={styles.setHeaderText}>Set</Text>
                  <Text style={styles.setHeaderText}>Reps</Text>
                  <Text style={styles.setHeaderText}>kg</Text>
                </View>
                {ex.sets.map((set, si) => (
                  <View key={set.id} style={styles.setRow}>
                    <Text style={styles.setNum}>{si + 1}</Text>
                    <Text style={styles.setValue}>{set.reps || '—'}</Text>
                    <Text style={styles.setValue}>{set.weight || '—'}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: '#000' },
  header:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#1c1c1c' },
  backBtn:         { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backArrow:       { fontSize: 28, color: '#FF375F', lineHeight: 32 },
  backText:        { fontSize: 16, color: '#FF375F' },
  scroll:          { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 60 },
  heading:         { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 4 },
  date:            { fontSize: 14, color: '#555', marginBottom: 24 },
  summaryRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 32 },
  summaryCard:     { flex: 1, minWidth: '45%', backgroundColor: '#111', borderRadius: 12, padding: 16 },
  summaryValue:    { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 4 },
  summaryLabel:    { fontSize: 12, color: '#555' },
  sectionLabel:    { fontSize: 13, color: '#555', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },
  block:           { backgroundColor: '#111', borderRadius: 12, padding: 16, marginBottom: 12 },
  blockLabel:      { fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },
  exName:          { fontSize: 17, fontWeight: '600', color: '#fff', paddingBottom: 8, borderBottomWidth: 0.5, borderBottomColor: '#1c1c1c', marginBottom: 10 },
  setHeader:       { flexDirection: 'row', marginBottom: 6 },
  setHeaderText:   { flex: 1, fontSize: 11, color: '#444', textTransform: 'uppercase', letterSpacing: 0.8 },
  setRow:          { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: '#1a1a1a' },
  setNum:          { flex: 1, fontSize: 14, color: '#555' },
  setValue:        { flex: 1, fontSize: 15, color: '#fff' },
  supersetDivider: { flexDirection: 'row', alignItems: 'center', marginVertical: 12, gap: 10 },
  dividerLine:     { flex: 1, height: 0.5, backgroundColor: '#1c1c1c' },
  plusSign:        { fontSize: 18, color: '#FF375F', fontWeight: '700' },
});