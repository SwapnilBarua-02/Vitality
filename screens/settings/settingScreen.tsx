import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';

export default function SettingsScreen() {
  const handleReset = () => {
    Alert.alert('Reset?', 'This will delete everything', [
      { text: 'Cancel' },
      {
        text: 'Reset',
        onPress: () => {
          Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Warning
          );
        },
      },
    ]);
  };

  return (
    <View>
      <TouchableOpacity onPress={handleReset}>
        <Text>Reset All Data</Text>
      </TouchableOpacity>
    </View>
  );
}