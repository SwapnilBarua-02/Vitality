import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';

export default function AddTransactionScreen() {
  const handleAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <View>
      <TouchableOpacity onPress={handleAdd}>
        <Text>Add Transaction</Text>
      </TouchableOpacity>
    </View>
  );
}