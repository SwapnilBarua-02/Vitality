import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

export default function SettingsScreen() {
  const navigation = useNavigation<any>();

  const handleResetAll = () => {
    Alert.alert(
      'Reset everything?',
      'This will delete all your data permanently.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Warning
            );
          },
        },
      ]
    );
  };

  const handleResetBaseline = async () => {
    await AsyncStorage.removeItem('home_baseline_v1');
    Haptics.selectionAsync();
  };

  return (
    <SafeAreaView style={styles.safe}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            Haptics.selectionAsync();
            navigation.goBack();
          }}
        >
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Settings</Text>

        <View style={{ width: 60 }} />
      </View>

      {/* BODY */}
      <View style={styles.container}>

        {/* SECTION */}
        <Text style={styles.section}>General</Text>

        <TouchableOpacity style={styles.row} onPress={handleResetBaseline}>
          <Text style={styles.label}>Reset baseline</Text>
          <Text style={styles.sub}>Set baseline back to default</Text>
        </TouchableOpacity>

        {/* DANGER */}
        <Text style={styles.section}>Danger</Text>

        <TouchableOpacity style={styles.row} onPress={handleResetAll}>
          <Text style={[styles.label, { color: '#F87171' }]}>
            Reset all data
          </Text>
          <Text style={styles.sub}>
            This will remove everything permanently
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#050505',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },

  back: {
    color: '#fff',
    fontSize: 16,
  },

  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },

  container: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  section: {
    color: '#6B7280',
    fontSize: 12,
    marginBottom: 8,
    marginTop: 20,
    textTransform: 'uppercase',
  },

  row: {
    backgroundColor: '#101114',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1F2125',
    marginBottom: 10,
  },

  label: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },

  sub: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4,
  },
});