import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  TextInput, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useBudgetStore, TransactionType } from '../../store/budgetStore';

const QUICK_LABELS: Record<TransactionType, string[]> = {
  income:              ['Pay cheque', 'Freelance', 'Transfer in', 'Gift', 'Other'],
  expense:             ['Groceries', 'Eating out', 'Transport', 'Shopping', 'Rent', 'Bills', 'Entertainment', 'Health', 'Other'],
  savings_withdrawal:  ['Big purchase', 'Emergency', 'Transfer out', 'Other'],
};

const TYPE_CONFIG = {
  income:              { color: '#30D158', label: 'Add Income',             icon: '+', bg: '#0d1f0d' },
  expense:             { color: '#FF375F', label: 'Add Expense',            icon: '−', bg: '#1f0d0d' },
  savings_withdrawal:  { color: '#0A84FF', label: 'Savings Withdrawal',     icon: '↑', bg: '#0d0d1f' },
};

export default function AddTransactionScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { addTransaction, currency } = useBudgetStore();

  const type: TransactionType = route.params?.type ?? 'expense';
  const config = TYPE_CONFIG[type];
  const labels = QUICK_LABELS[type];

  const [amount, setAmount] = useState('');
  const [label, setLabel] = useState('');

  const handleAdd = () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return;

    addTransaction({
      type,
      amount: amt,
      label: label || labels[0],
      currency,
    });

    nav.goBack();
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: '#000' }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <View style={s.header}>
            <TouchableOpacity onPress={() => nav.goBack()} style={s.backBtn}>
              <Text style={s.backText}>‹ Back</Text>
            </TouchableOpacity>
            <Text style={s.heading}>{config.label}</Text>
            <View style={{ width: 60 }} />
          </View>

          {/* Amount input */}
          <View style={[s.amountCard, { backgroundColor: config.bg }]}>
            <Text style={s.amountPrefix}>{config.icon}</Text>
            <TextInput
              style={[s.amountInput, { color: config.color }]}
              placeholder="0.00"
              placeholderTextColor="#333"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
              autoFocus
            />
          </View>

          {/* Label input */}
          <TextInput
            style={s.labelInput}
            placeholder="Label (optional)"
            placeholderTextColor="#444"
            value={label}
            onChangeText={setLabel}
          />

          {/* Quick labels */}
          <Text style={s.quickTitle}>Quick labels</Text>
          <View style={s.quickGrid}>
            {labels.map((l) => (
              <TouchableOpacity
                key={l}
                style={[s.quickBtn, label === l && { backgroundColor: config.color }]}
                onPress={() => setLabel(l)}
              >
                <Text style={[s.quickBtnText, label === l && { color: '#000' }]}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Confirm */}
          <TouchableOpacity
            style={[s.confirmBtn, { backgroundColor: config.color }, !amount && s.confirmBtnDisabled]}
            onPress={handleAdd}
            disabled={!amount}
          >
            <Text style={s.confirmBtnText}>Add {config.label.replace('Add ', '')}</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:              { flex: 1 },
  scroll:            { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 48 },

  header:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  backBtn:           { width: 60 },
  backText:          { fontSize: 17, color: '#888' },
  heading:           { fontSize: 17, fontWeight: '600', color: '#fff' },

  amountCard:        { borderRadius: 20, padding: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  amountPrefix:      { fontSize: 40, color: '#555', marginRight: 8, fontWeight: '300' },
  amountInput:       { fontSize: 52, fontWeight: '700', minWidth: 120, textAlign: 'center' },

  labelInput:        { backgroundColor: '#111', borderRadius: 14, padding: 16, fontSize: 16, color: '#fff', marginBottom: 24 },

  quickTitle:        { fontSize: 12, color: '#444', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },
  quickGrid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 32 },
  quickBtn:          { backgroundColor: '#111', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  quickBtnText:      { fontSize: 13, color: '#888' },

  confirmBtn:        { borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
  confirmBtnDisabled:{ opacity: 0.35 },
  confirmBtnText:    { fontSize: 17, fontWeight: '700', color: '#000' },
});