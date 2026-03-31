import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

export default function ProdScreen() {
  const navigation = useNavigation<any>();

  const methods = [
    { key: 'pomodoro', title: 'Pomodoro' },
    { key: 'deep', title: 'Deep Work' },
    { key: 'custom', title: 'Custom' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.title}>Focus</Text>

      {methods.map((m) => (
        <TouchableOpacity
          key={m.key}
          style={styles.card}
          onPress={() => {
            Haptics.selectionAsync();
            navigation.navigate('Method', { method: m.key });
          }}
        >
          <Text style={styles.text}>{m.title}</Text>
        </TouchableOpacity>
      ))}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000', padding: 20 },

  title: { color: '#fff', fontSize: 28, marginBottom: 20 },

  card: {
    backgroundColor: '#111',
    padding: 20,
    borderRadius: 16,
    marginBottom: 10,
  },

  text: { color: '#fff' },
});