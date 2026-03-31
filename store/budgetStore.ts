import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type TransactionType = 'income' | 'expense' | 'savings_withdrawal';

export type Currency = 'AUD' | 'USD' | 'GBP' | 'EUR' | 'JPY' | 'INR';

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  label: string;
  currency: Currency;
  date: string;
};

type BudgetState = {
  transactions: Transaction[];
  currency: Currency;
  spendingBalance: number;
  savingsBalance: number;
  checkedInToday: boolean;

  addTransaction: (t: Omit<Transaction, 'id' | 'date'>) => void;
  moveToSavings: (amount: number) => void;
  setCurrency: (c: Currency) => void;
  loadFromStorage: () => Promise<void>;
  resetBudgetData: () => Promise<void>;
};

const STORAGE_KEY = 'budget_store_v1';

export const useBudgetStore = create<BudgetState>((set, get) => ({
  transactions: [],
  currency: 'AUD',
  spendingBalance: 0,
  savingsBalance: 0,
  checkedInToday: false,

  addTransaction: (t) => {
    const newTx: Transaction = {
      ...t,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };

    set((state) => {
      let spending = state.spendingBalance;
      let savings = state.savingsBalance;

      if (t.type === 'income') spending += t.amount;
      else if (t.type === 'expense') spending -= t.amount;
      else if (t.type === 'savings_withdrawal') savings -= t.amount;

      const today = new Date().toDateString();
      const checkedInToday = true;

      const next = {
        transactions: [newTx, ...state.transactions],
        spendingBalance: spending,
        savingsBalance: savings,
        checkedInToday,
      };

      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
        transactions: next.transactions,
        spendingBalance: next.spendingBalance,
        savingsBalance: next.savingsBalance,
        currency: state.currency,
        lastCheckInDate: today,
      }));

      return next;
    });
  },

  moveToSavings: (amount) => {
    set((state) => {
      const spending = Math.max(0, state.spendingBalance - amount);
      const savings = state.savingsBalance + amount;

      const moveTx: Transaction = {
        id: Date.now().toString(),
        type: 'income',
        amount,
        label: 'Moved to savings',
        currency: state.currency,
        date: new Date().toISOString(),
      };

      const next = {
        transactions: [moveTx, ...state.transactions],
        spendingBalance: spending,
        savingsBalance: savings,
      };

      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...next,
        currency: state.currency,
        lastCheckInDate: new Date().toDateString(),
      }));

      return next;
    });
  },

  setCurrency: (currency) => {
    set({ currency });
    const state = get();
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
      transactions: state.transactions,
      spendingBalance: state.spendingBalance,
      savingsBalance: state.savingsBalance,
      currency,
      lastCheckInDate: new Date().toDateString(),
    }));
  },

  loadFromStorage: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);

      const today = new Date().toDateString();
      const checkedInToday = data.lastCheckInDate === today;

      set({
        transactions: data.transactions ?? [],
        spendingBalance: data.spendingBalance ?? 0,
        savingsBalance: data.savingsBalance ?? 0,
        currency: data.currency ?? 'AUD',
        checkedInToday,
      });
    } catch (e) {
      console.warn('Failed to load budget store', e);
    }
  },

  resetBudgetData: async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    set({
      transactions: [],
      spendingBalance: 0,
      savingsBalance: 0,
      checkedInToday: false,
      currency: 'AUD',
    });
  },
}));

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  AUD: 'A$',
  USD: '$',
  GBP: '£',
  EUR: '€',
  JPY: '¥',
  INR: '₹',
};

export const formatAmount = (amount: number, currency: Currency) => {
  const symbol = CURRENCY_SYMBOLS[currency];
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${amount < 0 ? '-' : ''}${symbol}${formatted}`;
};

export const groupByWeek = (transactions: Transaction[]) => {
  const groups: { label: string; transactions: Transaction[] }[] = [];
  const seen = new Map<string, number>();

  transactions.forEach((tx) => {
    const date = new Date(tx.date);
    const day = date.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    const monday = new Date(date);
    monday.setDate(date.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    const key = monday.toDateString();

    if (!seen.has(key)) {
      seen.set(key, groups.length);
      const isThisWeek = monday.toDateString() === (() => {
        const now = new Date();
        const d = now.getDay();
        const diff2 = (d === 0 ? -6 : 1) - d;
        const m = new Date(now);
        m.setDate(now.getDate() + diff2);
        return m.toDateString();
      })();
      groups.push({
        label: isThisWeek ? 'This week' : `Week of ${monday.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`,
        transactions: [],
      });
    }

    groups[seen.get(key)!].transactions.push(tx);
  });

  return groups;
};