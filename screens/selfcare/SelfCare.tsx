import { View, Text, StyleSheet } from 'react-native';

export default function SelfCare() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Being active</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  text: { color: '#fff', fontSize: 24, fontWeight: '700' },
});