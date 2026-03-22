import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, TextInput, TouchableOpacity, Modal
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { useStore } from '../../store';

export default function SessionLog() {
  const navigation = useNavigation<any>();
  const {
    blocks, addBlock, addSuperset, deleteBlock,
    updateExerciseName, addSet, deleteSet, updateSet,
    saveWorkoutSession,
  } = useStore();

  // ─── Save modal state ─────────────────────────────────────────────────────
  // Controls the name-your-session popup
  const [showModal, setShowModal] = useState(false);
  const [sessionLabel, setSessionLabel] = useState('Workout session');

  const handleSavePress = () => {
    setShowModal(true);
  };

  const handleConfirmSave = () => {
    saveWorkoutSession(sessionLabel || 'Workout session');
    setShowModal(false);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe}>

      {/* ─── Header — back button + save button ──────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSavePress} style={styles.saveBtn}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* ─── Page title ──────────────────────────────────────────────── */}
        <Text style={styles.heading}>Log session</Text>

        {/* ─── Exercise blocks ─────────────────────────────────────────── */}
        {/* Each block is either a single exercise or a superset */}
        {blocks.map((block, bi) => (
          <View key={block.id} style={styles.block}>

            {/* Block header — label + remove button */}
            <View style={styles.blockHeader}>
              <Text style={styles.blockLabel}>
                {block.isSuperset ? 'Superset' : `Exercise ${bi + 1}`}
              </Text>
              <TouchableOpacity onPress={() => deleteBlock(block.id)}>
                <Text style={styles.deleteText}>Remove</Text>
              </TouchableOpacity>
            </View>

            {/* Exercises inside the block */}
            {block.exercises.map((ex, ei) => (
              <View key={ex.id}>

                {/* + divider between exercises in a superset */}
                {block.isSuperset && ei > 0 && (
                  <View style={styles.supersetDivider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.plusSign}>+</Text>
                    <View style={styles.dividerLine} />
                  </View>
                )}

                {/* Exercise name input */}
                <TextInput
                  style={styles.exerciseName}
                  placeholder="Exercise name"
                  placeholderTextColor="#333"
                  value={ex.name}
                  onChangeText={v => updateExerciseName(block.id, ex.id, v)}
                />

                {/* Set column headers */}
                <View style={styles.setHeader}>
                  <Text style={styles.setHeaderText}>Set</Text>
                  <Text style={styles.setHeaderText}>Reps</Text>
                  <Text style={styles.setHeaderText}>kg</Text>
                  <View style={{ width: 28 }} />
                </View>

                {/* Individual sets for this exercise */}
                {ex.sets.map((set, si) => (
                  <View key={set.id} style={styles.setRow}>
                    <Text style={styles.setNum}>{si + 1}</Text>
                    <TextInput
                      style={styles.setInput}
                      placeholder="0"
                      placeholderTextColor="#333"
                      keyboardType="numeric"
                      value={set.reps}
                      onChangeText={v => updateSet(block.id, ex.id, set.id, 'reps', v)}
                    />
                    <TextInput
                      style={styles.setInput}
                      placeholder="0"
                      placeholderTextColor="#333"
                      keyboardType="numeric"
                      value={set.weight}
                      onChangeText={v => updateSet(block.id, ex.id, set.id, 'weight', v)}
                    />
                    {/* Delete set button */}
                    <TouchableOpacity
                      onPress={() => deleteSet(block.id, ex.id, set.id)}
                      style={styles.deleteSetBtn}
                    >
                      <Text style={styles.deleteSetText}>−</Text>
                    </TouchableOpacity>
                  </View>
                ))}

                {/* Add another set to this exercise */}
                <TouchableOpacity
                  style={styles.addSetBtn}
                  onPress={() => addSet(block.id, ex.id)}
                >
                  <Text style={styles.addSetText}>+ Add set</Text>
                </TouchableOpacity>

              </View>
            ))}
          </View>
        ))}

        {/* ─── Add exercise / superset buttons ─────────────────────────── */}
        <View style={styles.addRow}>
          <TouchableOpacity style={styles.addBtn} onPress={addBlock}>
            <Text style={styles.addBtnText}>+ Exercise</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.addBtn, styles.addBtnOutline]} onPress={addSuperset}>
            <Text style={styles.addBtnOutlineText}>+ Superset</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* ─── Save modal — name your session before saving ─────────────── */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Name this session</Text>
            <Text style={styles.modalSub}>e.g. Morning strength, Evening run</Text>
            <TextInput
              style={styles.modalInput}
              value={sessionLabel}
              onChangeText={setSessionLabel}
              autoFocus
              selectTextOnFocus
              placeholderTextColor="#555"
            />
            {/* Modal action buttons */}
            <View style={styles.modalBtns}>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={styles.modalCancel}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmSave}
                style={styles.modalSave}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Layout
  safe:              { flex: 1, backgroundColor: '#000' },
  scroll:            { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 80 },

  // Header
  header:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#1c1c1c' },
  backBtn:           { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backArrow:         { fontSize: 28, color: '#FF375F', lineHeight: 32 },
  backText:          { fontSize: 16, color: '#FF375F' },
  saveBtn:           { backgroundColor: '#FF375F', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  saveText:          { fontSize: 15, fontWeight: '600', color: '#fff' },

  // Page title
  heading:           { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 24 },

  // Exercise block card
  block:             { backgroundColor: '#111', borderRadius: 12, padding: 16, marginBottom: 16 },
  blockHeader:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  blockLabel:        { fontSize: 12, color: '#555', textTransform: 'uppercase', letterSpacing: 0.8 },
  deleteText:        { fontSize: 13, color: '#FF375F' },

  // Exercise name input
  exerciseName:      { fontSize: 17, fontWeight: '600', color: '#fff', paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: '#1c1c1c', marginBottom: 12 },

  // Set rows
  setHeader:         { flexDirection: 'row', marginBottom: 6 },
  setHeaderText:     { flex: 1, fontSize: 11, color: '#444', textTransform: 'uppercase', letterSpacing: 0.8 },
  setRow:            { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: '#1a1a1a' },
  setNum:            { flex: 1, fontSize: 14, color: '#555' },
  setInput:          { flex: 1, fontSize: 15, color: '#fff', paddingHorizontal: 4 },
  deleteSetBtn:      { width: 28, alignItems: 'center' },
  deleteSetText:     { fontSize: 20, color: '#333' },
  addSetBtn:         { paddingVertical: 12 },
  addSetText:        { fontSize: 14, color: '#FF375F' },

  // Superset divider
  supersetDivider:   { flexDirection: 'row', alignItems: 'center', marginVertical: 16, gap: 10 },
  dividerLine:       { flex: 1, height: 0.5, backgroundColor: '#1c1c1c' },
  plusSign:          { fontSize: 18, color: '#FF375F', fontWeight: '700' },

  // Add exercise / superset buttons
  addRow:            { flexDirection: 'row', gap: 10, marginTop: 8 },
  addBtn:            { flex: 1, backgroundColor: '#FF375F', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  addBtnText:        { fontSize: 15, fontWeight: '600', color: '#fff' },
  addBtnOutline:     { backgroundColor: 'transparent', borderWidth: 0.5, borderColor: '#FF375F' },
  addBtnOutlineText: { fontSize: 15, fontWeight: '600', color: '#FF375F' },

  // Save modal
  modalOverlay:      { flex: 1, backgroundColor: '#000000aa', justifyContent: 'center', alignItems: 'center' },
  modalBox:          { backgroundColor: '#1c1c1c', borderRadius: 16, padding: 28, width: '80%' },
  modalTitle:        { fontSize: 18, fontWeight: '600', color: '#fff', marginBottom: 4 },
  modalSub:          { fontSize: 13, color: '#555', marginBottom: 16 },
  modalInput:        { fontSize: 16, color: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#333', paddingVertical: 10, marginBottom: 24 },
  modalBtns:         { flexDirection: 'row', gap: 10 },
  modalCancel:       { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#111', alignItems: 'center' },
  modalCancelText:   { fontSize: 15, color: '#555' },
  modalSave:         { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#FF375F', alignItems: 'center' },
  modalSaveText:     { fontSize: 15, fontWeight: '600', color: '#fff' },
});