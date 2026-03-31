import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import Svg, { Line, Path, Circle, Text as SvgText } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useStore } from '../store';
import { useBudgetStore, formatAmount } from '../store/budgetStore';
import LiveTimerBanner from '../Components/LiveTimerBanner';
<LiveTimerBanner/>

type Series = {
  name: string;
  color: string;
  points: number[];
  pct: number;
  screen?: string;
};

type SleepEntry = {
  id: number;
  date: string;
  hours: number;
};

type SelfCareHabits = {
  skincare: boolean;
  walk: boolean;
  journal: boolean;
  meditate: boolean;
  water: boolean;
};

type SelfCareEntry = {
  date: string;
  habits: SelfCareHabits;
};

const SLEEP_KEY = 'sleep_entries_v1';
const SELFCARE_KEY = 'selfcare_entries_v1';
const HOME_BASELINE_KEY = 'home_baseline_v1';

const CATEGORY_COLORS = {
  overall: '#FFFFFF',
  activity: '#FF5A5F',
  focus: '#8B5CF6',
  care: '#FF4FA3',
  sleep: '#38BDF8',
  money: '#30D158',
};

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function isoDay(date: Date) {
  return date.toISOString().split('T')[0];
}

function lastNDates(n: number) {
  const out: Date[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    out.push(d);
  }
  return out;
}

function clamp(num: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, num));
}

function buildPath(points: number[], width: number, height: number, padding: number) {
  return points
    .map((p, i) => {
      const x = padding + (i / (points.length - 1)) * (width - padding * 2);
      const y = height - padding - (p / 100) * (height - padding * 2);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
}

function getLastPoint(points: number[], width: number, height: number, padding: number) {
  const i = points.length - 1;
  const x = padding + (i / (points.length - 1)) * (width - padding * 2);
  const y = height - padding - (points[i] / 100) * (height - padding * 2);
  return { x, y };
}

function dailyActivityDelta(workoutCount: number): number {
  if (workoutCount > 0) return 10;
  return -4;
}

function dailyFocusDelta(minutes: number): number {
  if (minutes >= 90) return 10;
  if (minutes >= 60) return 8;
  if (minutes >= 30) return 5;
  if (minutes > 0) return 2;
  return -4;
}

function dailyCareDelta(score: number): number {
  if (score >= 0.8) return 9;
  if (score >= 0.6) return 6;
  if (score >= 0.4) return 3;
  if (score > 0) return 1;
  return -4;
}

function dailySleepDelta(hours: number | null): number {
  if (hours === null) return -4;
  if (hours >= 8) return 9;
  if (hours >= 7) return 6;
  if (hours >= 6) return 2;
  return -5;
}

function dailyMoneyDelta(spending: number, income: number): number {
  if (income > 0 && spending === 0) return 8;
  if (income > spending) return 7;
  if (spending === 0) return 3;
  if (spending <= 30) return 1;
  if (spending <= 80) return -2;
  return -6;
}

function buildMomentumPoints(deltas: number[], start = 0): number[] {
  const points: number[] = [start];
  let current = start;

  deltas.forEach((delta) => {
    const smallMove = clamp(current + delta * 0.55);
    const end = clamp(current + delta);
    points.push(smallMove, end);
    current = end;
  });

  return points;
}

function MainStocksChart({
  lines,
  baseline,
  width,
}: {
  lines: Series[];
  baseline: number;
  width: number;
}) {
  const height = 240;
  const padding = 22;
  const baselineY = height - padding - (baseline / 100) * (height - padding * 2);

  return (
    <View style={styles.chartWrap}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {[0, 25, 50, 75, 100].map((v) => {
          const y = height - padding - (v / 100) * (height - padding * 2);
          return (
            <Line
              key={`grid-${v}`}
              x1={padding}
              x2={width - padding}
              y1={y}
              y2={y}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={1}
            />
          );
        })}

        <Line
          x1={padding}
          x2={width - padding}
          y1={baselineY}
          y2={baselineY}
          stroke="rgba(255,255,255,0.65)"
          strokeWidth={1.2}
          strokeDasharray="7 6"
        />

        <SvgText
          x={width - padding}
          y={baselineY - 6}
          fontSize="10"
          fill="rgba(255,255,255,0.72)"
          textAnchor="end"
        >
          {`Baseline ${baseline}%`}
        </SvgText>

        {lines.map((line, idx) => {
          const d = buildPath(line.points, width, height, padding);
          const last = getLastPoint(line.points, width, height, padding);

          return (
            <React.Fragment key={line.name}>
              <Path
                d={d}
                fill="none"
                stroke={line.color}
                strokeWidth={idx === 0 ? 3.4 : 2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={idx === 0 ? 1 : 0.96}
              />
              <Circle
                cx={last.x}
                cy={last.y}
                r={idx === 0 ? 4 : 3}
                fill={line.color}
              />
            </React.Fragment>
          );
        })}
      </Svg>

      <View style={styles.chartBottomLabels}>
        {DAY_LABELS.map((d, i) => (
          <Text key={`${d}-${i}`} style={styles.chartDay}>
            {d}
          </Text>
        ))}
      </View>
    </View>
  );
}

function MiniLine({
  color,
  points,
  width,
}: {
  color: string;
  points: number[];
  width: number;
}) {
  const height = 78;
  const padding = 4;
  const d = buildPath(points, width, height, padding);

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = screenWidth - 64;

  const { workoutSessions, timerSessions } = useStore();
  const {
    transactions,
    spendingBalance,
    savingsBalance,
    currency,
    loadFromStorage,
  } = useBudgetStore();

  const [baseline, setBaseline] = useState(60);
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([]);
  const [selfCareEntries, setSelfCareEntries] = useState<SelfCareEntry[]>([]);
  const [ready, setReady] = useState(false);

  const loadExtras = useCallback(async () => {
    try {
      const [sleepRaw, selfCareRaw, baselineRaw] = await Promise.all([
        AsyncStorage.getItem(SLEEP_KEY),
        AsyncStorage.getItem(SELFCARE_KEY),
        AsyncStorage.getItem(HOME_BASELINE_KEY),
      ]);

      setSleepEntries(sleepRaw ? JSON.parse(sleepRaw) : []);
      setSelfCareEntries(selfCareRaw ? JSON.parse(selfCareRaw) : []);

      if (baselineRaw) {
        const parsed = parseInt(baselineRaw, 10);
        if (!Number.isNaN(parsed)) setBaseline(clamp(parsed));
      }
    } catch (e) {
      console.warn('Failed loading home extras', e);
    } finally {
      setReady(true);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFromStorage();
      loadExtras();
    }, [loadFromStorage, loadExtras])
  );

  useEffect(() => {
    AsyncStorage.setItem(HOME_BASELINE_KEY, String(baseline));
  }, [baseline]);

  const weeklyDates = useMemo(() => lastNDates(7), []);
  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString('en-AU', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }),
    []
  );

  const series = useMemo(() => {
    const activityDeltas: number[] = [];
    const focusDeltas: number[] = [];
    const careDeltas: number[] = [];
    const sleepDeltas: number[] = [];
    const moneyDeltas: number[] = [];

    weeklyDates.forEach((dateObj) => {
      const dayKey = isoDay(dateObj);

      const dayWorkoutCount = workoutSessions.filter((s) => s.date === dayKey).length;
      const dayFocusMinutes = Math.floor(
        timerSessions
          .filter((s) => s.date === dayKey)
          .reduce((sum, s) => sum + s.elapsedSecs, 0) / 60
      );

      const sleep = sleepEntries.find((e) => e.date === dayKey) ?? null;
      const selfCare = selfCareEntries.find((e) => e.date === dayKey) ?? null;

      const careScore = selfCare
        ? Object.values(selfCare.habits).filter(Boolean).length / 5
        : 0;

      const dayTransactions = transactions.filter(
        (t) => t.date && t.date.startsWith(dayKey)
      );

      const daySpending = dayTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const dayIncome = dayTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      activityDeltas.push(dailyActivityDelta(dayWorkoutCount));
      focusDeltas.push(dailyFocusDelta(dayFocusMinutes));
      careDeltas.push(dailyCareDelta(careScore));
      sleepDeltas.push(dailySleepDelta(sleep ? sleep.hours : null));
      moneyDeltas.push(dailyMoneyDelta(daySpending, dayIncome));
    });

    const activityPoints = buildMomentumPoints(activityDeltas);
    const focusPoints = buildMomentumPoints(focusDeltas);
    const carePoints = buildMomentumPoints(careDeltas);
    const sleepPoints = buildMomentumPoints(sleepDeltas);
    const moneyPoints = buildMomentumPoints(moneyDeltas);

    const overallPoints = activityPoints.map((_, i) =>
      Math.round(
        (activityPoints[i] +
          focusPoints[i] +
          carePoints[i] +
          sleepPoints[i] +
          moneyPoints[i]) / 5
      )
    );

    return [
      {
        name: 'Overall',
        color: CATEGORY_COLORS.overall,
        points: overallPoints,
        pct: overallPoints[overallPoints.length - 1],
      },
      {
        name: 'Activity',
        color: CATEGORY_COLORS.activity,
        points: activityPoints,
        pct: activityPoints[activityPoints.length - 1],
        screen: 'Active',
      },
      {
        name: 'Focus',
        color: CATEGORY_COLORS.focus,
        points: focusPoints,
        pct: focusPoints[focusPoints.length - 1],
        screen: 'Productive',
      },
      {
        name: 'Care',
        color: CATEGORY_COLORS.care,
        points: carePoints,
        pct: carePoints[carePoints.length - 1],
        screen: 'SelfCare',
      },
      {
        name: 'Sleep',
        color: CATEGORY_COLORS.sleep,
        points: sleepPoints,
        pct: sleepPoints[sleepPoints.length - 1],
        screen: 'Sleep',
      },
      {
        name: 'Money',
        color: CATEGORY_COLORS.money,
        points: moneyPoints,
        pct: moneyPoints[moneyPoints.length - 1],
        screen: 'Budget',
      },
    ] as Series[];
  }, [weeklyDates, workoutSessions, timerSessions, sleepEntries, selfCareEntries, transactions]);

  const overall = series[0];
  const topCards = series.slice(1, 5);
  const moneyCard = series[5];

  if (!ready) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingText}>Loading momentum...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerBlock}>
          <View>
            <Text style={styles.heading}>Momentum</Text>
            <Text style={styles.subheading}>{todayLabel}</Text>
          </View>

          <View style={styles.headerRight}>
            <View style={styles.baselinePill}>
              <Text style={styles.baselinePillText}>Baseline {baseline}%</Text>
            </View>

            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={() => navigation.navigate('Settings')}
            >
              <Text style={styles.settingsIcon}>⚙</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.mainCard}>
          <View style={styles.mainTopRow}>
            <View>
              <Text style={styles.mainLabel}>Overall</Text>
              <Text style={styles.mainValue}>{overall.pct}%</Text>
            </View>
            <Text style={styles.mainSub}>Last 7 days</Text>
          </View>

          <MainStocksChart lines={series} baseline={baseline} width={chartWidth} />

          <View style={styles.baselineControl}>
            <View>
              <Text style={styles.controlLabel}>Set baseline</Text>
              <Text style={styles.controlSub}>Main reference line for the week</Text>
            </View>

            <View style={styles.controlBtns}>
              <TouchableOpacity
                style={styles.circleBtn}
                onPress={() => setBaseline((b) => Math.max(0, b - 5))}
              >
                <Text style={styles.circleBtnText}>−</Text>
              </TouchableOpacity>

              <Text style={styles.baselineValue}>{baseline}%</Text>

              <TouchableOpacity
                style={styles.circleBtn}
                onPress={() => setBaseline((b) => Math.min(100, b + 5))}
              >
                <Text style={styles.circleBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.gridWrap}>
          {topCards.map((item) => {
            const belowBaseline = item.pct < baseline;

            return (
              <TouchableOpacity
                key={item.name}
                activeOpacity={0.85}
                style={styles.gridCard}
                onPress={() => item.screen && navigation.navigate(item.screen)}
              >
                <View style={styles.gridCardTop}>
                  <View style={styles.gridCardTitleWrap}>
                    <View style={[styles.dot, { backgroundColor: item.color }]} />
                    <Text style={styles.gridCardTitle}>{item.name}</Text>
                  </View>
                  <Text style={styles.gridCardPct}>{item.pct}%</Text>
                </View>

                <Text
                  style={[
                    styles.baselineStatus,
                    belowBaseline ? styles.belowText : styles.aboveText,
                  ]}
                >
                  {belowBaseline ? 'Below baseline' : 'Above baseline'}
                </Text>

                <MiniLine color={item.color} points={item.points} width={chartWidth / 2 - 22} />
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.moneyCard}
            onPress={() => moneyCard.screen && navigation.navigate(moneyCard.screen)}
          >
            <View style={styles.moneyLeft}>
              <View style={styles.gridCardTitleWrap}>
                <View style={[styles.dot, { backgroundColor: moneyCard.color }]} />
                <Text style={styles.gridCardTitle}>Money</Text>
              </View>

              <Text style={styles.moneyMain}>{moneyCard.pct}%</Text>
              <Text style={styles.moneySub}>Weekly direction</Text>

              <View style={styles.moneyAmounts}>
                <View style={styles.moneyBlock}>
                  <Text style={styles.moneyLabel}>Spending</Text>
                  <Text style={styles.moneyAmount}>{formatAmount(spendingBalance, currency)}</Text>
                </View>

                <View style={styles.moneyBlock}>
                  <Text style={styles.moneyLabel}>Savings</Text>
                  <Text style={styles.moneyAmount}>{formatAmount(savingsBalance, currency)}</Text>
                </View>
              </View>
            </View>

            <View style={styles.moneyRight}>
              <MiniLine color={moneyCard.color} points={moneyCard.points} width={chartWidth / 2 - 10} />
            </View>
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

  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    color: '#777',
    fontSize: 15,
  },

  scroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },

  headerBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },

  heading: {
    fontSize: 30,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.5,
  },

  subheading: {
    fontSize: 13,
    color: '#7A7A7A',
    marginTop: 4,
  },

  baselinePill: {
    backgroundColor: '#111214',
    borderWidth: 1,
    borderColor: '#1F2125',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  baselinePillText: {
    color: '#CFCFCF',
    fontSize: 12,
    fontWeight: '500',
  },

  mainCard: {
    backgroundColor: '#101114',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#1F2125',
    padding: 16,
    marginBottom: 16,
  },

  mainTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },

  mainLabel: {
    fontSize: 13,
    color: '#80838A',
    marginBottom: 2,
  },

  mainValue: {
    fontSize: 42,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -1,
  },

  mainSub: {
    fontSize: 13,
    color: '#80838A',
    marginBottom: 8,
  },

  chartWrap: {
    marginTop: 8,
  },

  chartBottomLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    marginTop: 2,
  },

  chartDay: {
    color: '#666B73',
    fontSize: 11,
    width: 24,
    textAlign: 'center',
  },

  baselineControl: {
    marginTop: 16,
    backgroundColor: '#0B0C0F',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1A1C20',
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  controlLabel: {
    fontSize: 14,
    color: '#E5E7EB',
    marginBottom: 2,
  },

  controlSub: {
    fontSize: 12,
    color: '#666B73',
  },

  controlBtns: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  circleBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
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
    fontSize: 18,
    fontWeight: '600',
    minWidth: 60,
    textAlign: 'center',
    marginHorizontal: 10,
  },

  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  gridCard: {
    width: '48.2%',
    backgroundColor: '#101114',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#1F2125',
    padding: 14,
    marginBottom: 12,
    minHeight: 185,
  },

  gridCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  gridCardTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },

  gridCardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  gridCardPct: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },

  baselineStatus: {
    fontSize: 12,
    marginTop: 10,
    marginBottom: 8,
  },

  belowText: {
    color: '#F87171',
  },

  aboveText: {
    color: '#7A7A7A',
  },

  moneyCard: {
    width: '100%',
    backgroundColor: '#101114',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#1F2125',
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 190,
  },

  moneyLeft: {
    width: '46%',
    justifyContent: 'space-between',
  },

  moneyRight: {
    width: '50%',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },

  moneyMain: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '700',
    marginTop: 10,
  },

  moneySub: {
    color: '#7A7A7A',
    fontSize: 12,
    marginTop: 2,
  },

  moneyAmounts: {
    marginTop: 14,
  },

  moneyBlock: {
    marginBottom: 10,
  },

  moneyLabel: {
    color: '#7A7A7A',
    fontSize: 12,
    marginBottom: 3,
  },

  moneyAmount: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },

  headerRight: {
  flexDirection: 'row',
  alignItems: 'center',
},

  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#111214',
    borderWidth: 1,
    borderColor: '#1F2125',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  settingsIcon: {
    color: '#fff',
    fontSize: 16,
  },
});