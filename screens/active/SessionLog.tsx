import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';

export default function SessionLog() {
  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View>
      <TouchableOpacity onPress={handleSave}>
        <Text>Save Workout</Text>
      </TouchableOpacity>
    </View>
  );
}