import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Modal, TextInput, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useBudgetStore, formatAmount, groupByWeek, Currency, CURRENCY_SYMBOLS } from '../../store/budgetStore';

const CURRENCIES: Currency[] = ['AUD', 'USD', 'GBP', 'EUR', 'JPY', 'INR'];

const TX_COLORS = {
  income:              '#30D158',
  expense:             '#FF375F',
  savings_withdrawal:  '#FF9F0A',
};

const TX_LABELS = {
  income:             'Income',
  expense:            'Expense',
  savings_withdrawal: 'Savings withdrawal',
};

export default function BudgetScreen() {
  const nav = useNavigation<any>();
  const {
    transactions, currency, spendingBalance, savingsBalance,
    moveToSavings, setCurrency, loadFromStorage,
  } = useBudgetStore();

  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [moveAmount, setMoveAmount] = useState('');

  useEffect(() => { loadFromStorage(); }, []);

  const handleMove = () => {
    const amt = parseFloat(moveAmount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Invalid amount');
      return;
    }
    if (amt > spendingBalance) {
      Alert.alert('Not enough in spending balance');
      return;
    }
    moveToSavings(amt);
    setMoveAmount('');
    setShowMoveModal(false);
  };

  const weeks = groupByWeek(transactions);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.heading}>Budget</Text>
          <TouchableOpacity onPress={() => setShowCurrencyPicker(true)} style={s.currencyBtn}>
            <Text style={s.currencyBtnText}>{currency} ↓</Text>
          </TouchableOpacity>
        </View>

        {/* Balance cards */}
        <View style={s.balanceRow}>
          <View style={[s.balanceCard, { borderColor: '#1a3a1a' }]}>
            <Text style={s.balanceLabel}>Spending</Text>
            <Text style={[s.balanceAmount, { color: spendingBalance >= 0 ? '#30D158' : '#FF375F' }]}>
              {formatAmount(spendingBalance, currency)}
            </Text>
            <Text style={s.balanceSub}>This week</Text>
          </View>

          <View style={[s.balanceCard, { borderColor: '#1a2a3a' }]}>
            <Text style={s.balanceLabel}>Savings</Text>
            <Text style={[s.balanceAmount, { color: '#0A84FF' }]}>
              {formatAmount(savingsBalance, currency)}
            </Text>
            <Text style={s.balanceSub}>Accumulated</Text>
          </View>
        </View>

        {/* Action buttons */}
        <View style={s.actions}>
          <TouchableOpacity
            style={[s.actionBtn, { backgroundColor: '#1a3a1a' }]}
            onPress={() => nav.navigate('AddTransaction', { type: 'income' })}
          >
            <Text style={[s.actionIcon, { color: '#30D158' }]}>+</Text>
            <Text style={[s.actionText, { color: '#30D158' }]}>Income</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.actionBtn, { backgroundColor: '#3a1a1a' }]}
            onPress={() => nav.navigate('AddTransaction', { type: 'expense' })}
          >
            <Text style={[s.actionIcon, { color: '#FF375F' }]}>−</Text>
            <Text style={[s.actionText, { color: '#FF375F' }]}>Expense</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.actionBtn, { backgroundColor: '#1a1a2a' }]}
            onPress={() => nav.navigate('AddTransaction', { type: 'savings_withdrawal' })}
          >
            <Text style={[s.actionIcon, { color: '#0A84FF' }]}>↑</Text>
            <Text style={[s.actionText, { color: '#0A84FF' }]}>Savings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.actionBtn, { backgroundColor: '#2a2a1a' }]}
            onPress={() => setShowMoveModal(true)}
          >
            <Text style={[s.actionIcon, { color: '#FF9F0A' }]}>→</Text>
            <Text style={[s.actionText, { color: '#FF9F0A' }]}>Move</Text>
          </TouchableOpacity>
        </View>

        {/* Transaction history */}
        {transactions.length === 0 ? (
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>💸</Text>
            <Text style={s.emptyText}>No transactions yet</Text>
            <Text style={s.emptySub}>Add your first income or expense above</Text>
          </View>
        ) : (
          weeks.map((week, wi) => (
            <View key={wi} style={s.weekGroup}>
              <Text style={s.weekLabel}>{week.label}</Text>
              {week.transactions.map((tx) => (
                <View key={tx.id} style={s.txRow}>
                  <View style={[s.txDot, { backgroundColor: TX_COLORS[tx.type] }]} />
                  <View style={s.txInfo}>
                    <Text style={s.txLabel}>{tx.label || TX_LABELS[tx.type]}</Text>
                    <Text style={s.txDate}>
                      {new Date(tx.date).toLocaleDateString('en-AU', {
                        weekday: 'short', day: 'numeric', month: 'short',
                      })}
                    </Text>
                  </View>
                  <Text style={[s.txAmount, { color: TX_COLORS[tx.type] }]}>
                    {tx.type === 'income' ? '+' : '−'}{formatAmount(tx.amount, tx.currency)}
                  </Text>
                </View>
              ))}
            </View>
          ))
        )}

      </ScrollView>

      {/* Currency picker modal */}
      <Modal visible={showCurrencyPicker} transparent animationType="slide">
        <TouchableOpacity style={s.modalBg} onPress={() => setShowCurrencyPicker(false)} activeOpacity={1}>
          <View style={s.sheet}>
            <Text style={s.sheetTitle}>Select Currency</Text>
            {CURRENCIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={[s.currencyRow, currency === c && s.currencyRowActive]}
                onPress={() => { setCurrency(c); setShowCurrencyPicker(false); }}
              >
                <Text style={s.currencyRowSymbol}>{CURRENCY_SYMBOLS[c]}</Text>
                <Text style={s.currencyRowCode}>{c}</Text>
                {currency === c && <Text style={s.currencyRowCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Move to savings modal */}
      <Modal visible={showMoveModal} transparent animationType="slide">
        <TouchableOpacity style={s.modalBg} onPress={() => setShowMoveModal(false)} activeOpacity={1}>
          <View style={s.sheet}>
            <Text style={s.sheetTitle}>Move to Savings</Text>
            <Text style={s.sheetSub}>Available: {formatAmount(spendingBalance, currency)}</Text>
            <TextInput
              style={s.input}
              placeholder="Amount"
              placeholderTextColor="#444"
              keyboardType="decimal-pad"
              value={moveAmount}
              onChangeText={setMoveAmount}
              autoFocus
            />
            <TouchableOpacity style={s.confirmBtn} onPress={handleMove}>
              <Text style={s.confirmBtnText}>Move to Savings</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:             { flex: 1, backgroundColor: '#000' },
  scroll:           { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 48 },
  header:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  heading:          { fontSize: 32, fontWeight: '700', color: '#fff' },
  currencyBtn:      { backgroundColor: '#1c1c1c', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  currencyBtnText:  { color: '#aaa', fontSize: 13 },

  balanceRow:       { flexDirection: 'row', gap: 12, marginBottom: 20 },
  balanceCard:      { flex: 1, backgroundColor: '#0d0d0d', borderWidth: 1, borderRadius: 18, padding: 18 },
  balanceLabel:     { fontSize: 12, color: '#555', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 },
  balanceAmount:    { fontSize: 24, fontWeight: '700' },
  balanceSub:       { fontSize: 11, color: '#333', marginTop: 6 },

  actions:          { flexDirection: 'row', gap: 10, marginBottom: 28 },
  actionBtn:        { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  actionIcon:       { fontSize: 20, fontWeight: '600', marginBottom: 2 },
  actionText:       { fontSize: 11, fontWeight: '500' },

  weekGroup:        { marginBottom: 24 },
  weekLabel:        { fontSize: 12, color: '#444', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },
  txRow:            { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: '#111' },
  txDot:            { width: 8, height: 8, borderRadius: 4, marginRight: 14 },
  txInfo:           { flex: 1 },
  txLabel:          { fontSize: 15, color: '#fff', marginBottom: 2 },
  txDate:           { fontSize: 12, color: '#444' },
  txAmount:         { fontSize: 15, fontWeight: '600' },

  emptyState:       { alignItems: 'center', paddingTop: 60, paddingBottom: 40 },
  emptyIcon:        { fontSize: 40, marginBottom: 12 },
  emptyText:        { fontSize: 17, color: '#fff', fontWeight: '600', marginBottom: 6 },
  emptySub:         { fontSize: 14, color: '#444', textAlign: 'center' },

  modalBg:          { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet:            { backgroundColor: '#111', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 48 },
  sheetTitle:       { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 6 },
  sheetSub:         { fontSize: 13, color: '#555', marginBottom: 20 },

  currencyRow:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 0.5, borderBottomColor: '#1c1c1c' },
  currencyRowActive:{ backgroundColor: '#1a1a1a', borderRadius: 10, paddingHorizontal: 8 },
  currencyRowSymbol:{ fontSize: 16, color: '#fff', width: 32 },
  currencyRowCode:  { flex: 1, fontSize: 15, color: '#aaa' },
  currencyRowCheck: { fontSize: 16, color: '#30D158' },

  input:            { backgroundColor: '#1c1c1c', color: '#fff', fontSize: 28, fontWeight: '700', borderRadius: 14, padding: 18, marginBottom: 16, textAlign: 'center' },
  confirmBtn:       { backgroundColor: '#FF9F0A', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  confirmBtnText:   { fontSize: 16, fontWeight: '700', color: '#000' },
});