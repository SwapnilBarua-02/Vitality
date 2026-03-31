import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../../store';
import { useBudgetStore } from '../../store/budgetStore';

const SLEEP_KEY = 'sleep_entries_v1';
const SELFCARE_KEY = 'selfcare_entries_v1';
const HOME_BASELINE_KEY = 'home_baseline_v1';

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const { resetWorkoutData, resetTimerData, resetAllMainStoreData, stopTimer } = useStore();
  const { resetBudgetData } = useBudgetStore();

  const [baseline, setBaseline] = useState(60);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(HOME_BASELINE_KEY);
      if (raw) {
        const parsed = parseInt(raw, 10);
        if (!Number.isNaN(parsed)) setBaseline(parsed);
      }
    })();
  }, []);

  const saveBaseline = async (next: number) => {
    const clamped = Math.max(0, Math.min(100, next));
    setBaseline(clamped);
    await AsyncStorage.setItem(HOME_BASELINE_KEY, String(clamped));
  };

  const clearSleepData = async () => {
    await AsyncStorage.removeItem(SLEEP_KEY);
    Alert.alert('Done', 'Sleep data cleared.');
  };

  const clearSelfCareData = async () => {
    await AsyncStorage.removeItem(SELFCARE_KEY);
    Alert.alert('Done', 'Self care data cleared.');
  };

  const resetAll = () => {
    Alert.alert(
      'Reset all data?',
      'This will clear workouts, focus sessions, budget, sleep, self care, timer state, and baseline.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            stopTimer();
            resetAllMainStoreData();
            await resetBudgetData();
            await AsyncStorage.multiRemove([SLEEP_KEY, SELFCARE_KEY, HOME_BASELINE_KEY]);
            setBaseline(60);
            Alert.alert('Done', 'All app data has been reset.');
          },
        },
      ]
    );
  };

  const confirmAction = (
    title: string,
    message: string,
    action: () => void | Promise<void>
  ) => {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        style: 'destructive',
        onPress: async () => {
          await action();
        },
      },
    ]);
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
        <Text style={styles.heading}>Settings</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Weekly baseline</Text>
          <Text style={styles.cardSub}>Used by the main momentum graph</Text>

          <View style={styles.baselineRow}>
            <TouchableOpacity
              style={styles.circleBtn}
              onPress={() => saveBaseline(baseline - 5)}
            >
              <Text style={styles.circleBtnText}>−</Text>
            </TouchableOpacity>

            <Text style={styles.baselineValue}>{baseline}%</Text>

            <TouchableOpacity
              style={styles.circleBtn}
              onPress={() => saveBaseline(baseline + 5)}
            >
              <Text style={styles.circleBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Data controls</Text>
          <Text style={styles.cardSub}>Manage each section separately</Text>

          <TouchableOpacity
            style={styles.rowBtn}
            onPress={() =>
              confirmAction(
                'Reset activity data?',
                'This clears current exercise blocks and all saved workout sessions.',
                () => {
                  resetWorkoutData();
                  Alert.alert('Done', 'Activity data cleared.');
                }
              )
            }
          >
            <Text style={styles.rowBtnText}>Reset activity</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.rowBtn}
            onPress={() =>
              confirmAction(
                'Reset focus data?',
                'This clears timer sessions and the current timer state.',
                () => {
                  resetTimerData();
                  Alert.alert('Done', 'Focus data cleared.');
                }
              )
            }
          >
            <Text style={styles.rowBtnText}>Reset focus</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.rowBtn}
            onPress={() =>
              confirmAction(
                'Reset money data?',
                'This clears transactions, balances, and budget state.',
                async () => {
                  await resetBudgetData();
                  Alert.alert('Done', 'Money data cleared.');
                }
              )
            }
          >
            <Text style={styles.rowBtnText}>Reset money</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.rowBtn}
            onPress={() =>
              confirmAction(
                'Reset sleep data?',
                'This clears all saved sleep entries.',
                clearSleepData
              )
            }
          >
            <Text style={styles.rowBtnText}>Reset sleep</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.rowBtn}
            onPress={() =>
              confirmAction(
                'Reset care data?',
                'This clears all saved self care entries.',
                clearSelfCareData
              )
            }
          >
            <Text style={styles.rowBtnText}>Reset care</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Danger zone</Text>
          <Text style={styles.cardSub}>Clear everything in one go</Text>

          <TouchableOpacity style={styles.resetAllBtn} onPress={resetAll}>
            <Text style={styles.resetAllText}>Reset all app data</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#181A1E',
    backgroundColor: '#050505',
  },

  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  backArrow: {
    fontSize: 28,
    color: '#fff',
    lineHeight: 32,
    marginRight: 4,
  },

  backText: {
    fontSize: 16,
    color: '#fff',
  },

  scroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },

  heading: {
    fontSize: 30,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
    letterSpacing: -0.5,
  },

  card: {
    backgroundColor: '#101114',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#1F2125',
    padding: 16,
    marginBottom: 14,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },

  cardSub: {
    fontSize: 13,
    color: '#7A7A7A',
    marginBottom: 14,
  },

  baselineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1A1C20',
    alignItems: 'center',
    justifyContent: 'center',
  },

  circleBtnText: {
    color: '#fff',
    fontSize: 20,
    lineHeight: 22,
  },

  baselineValue: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    minWidth: 90,
    textAlign: 'center',
  },

  rowBtn: {
    backgroundColor: '#0B0C0F',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1A1C20',
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
  },

  rowBtnText: {
    color: '#F3F4F6',
    fontSize: 15,
    fontWeight: '500',
  },

  resetAllBtn: {
    backgroundColor: '#2A0F14',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4A1B24',
    paddingVertical: 15,
    alignItems: 'center',
  },

  resetAllText: {
    color: '#FF7A8A',
    fontSize: 15,
    fontWeight: '700',
  },
});