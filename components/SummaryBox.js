// components/SummaryBox.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SummaryBox({ summary }) {
  return (
    <View style={styles.summaryBox}>
      <Text style={styles.summaryText}>Fills: {summary.deliveries}</Text>
      <Text style={styles.summaryText}>
        Month Volume: {Number(summary.volume).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </Text>
      <Text style={styles.summaryText}>Avg L/Fill: {summary.average}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryBox: {
    backgroundColor: '#1CA84D',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
