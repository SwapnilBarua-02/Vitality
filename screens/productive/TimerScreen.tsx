import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import * as Haptics from 'expo-haptics';

export default function TimerScreen() {
  const [running, setRunning] = useState(false);

  const handlePause = () => {
    Haptics.selectionAsync();
    setRunning(false);
  };

  const handleResume = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRunning(true);
  };

  const handleEnd = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setRunning(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.timer}>25:00</Text>

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.btn}
          onPress={running ? handlePause : handleResume}
        >
          <Text style={styles.text}>{running ? 'Pause' : 'Start'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btn} onPress={handleEnd}>
          <Text style={styles.text}>End</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },

  timer: { color: '#fff', fontSize: 60 },

  row: { flexDirection: 'row', marginTop: 20 },

  btn: {
    backgroundColor: '#111',
    padding: 20,
    margin: 10,
    borderRadius: 16,
  },

  text: { color: '#fff' },
});