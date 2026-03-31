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

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  const items = [
    { name: 'Activity', screen: 'Active' },
    { name: 'Focus', screen: 'Productive' },
    { name: 'Sleep', screen: 'Sleep' },
    { name: 'Care', screen: 'SelfCare' },
    { name: 'Money', screen: 'Budget' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Momentum</Text>

        <TouchableOpacity
          onPress={() => {
            Haptics.selectionAsync();
            navigation.navigate('Settings');
          }}
        >
          <Text style={styles.settings}>⚙</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.name}
            style={styles.card}
            onPress={() => {
              Haptics.selectionAsync();
              navigation.navigate(item.screen);
            }}
          >
            <Text style={styles.cardText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },

  title: { color: '#fff', fontSize: 28, fontWeight: '700' },

  settings: { color: '#fff', fontSize: 20 },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
  },

  card: {
    width: '48%',
    height: 120,
    backgroundColor: '#111',
    margin: '1%',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardText: { color: '#fff', fontSize: 16 },
});