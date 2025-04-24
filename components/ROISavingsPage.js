import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet } from 'react-native';

const TIME_SAVED_PER_UNIT_HOURS = 0.33;

export default function ROISavingsPage({ deliveryData }) {
  const [chargeOutRate, setChargeOutRate] = useState(200);
  const [employeeWage, setEmployeeWage] = useState(30);

  const { allDates, unitsPerDate, timePerDate, moneyPerDate } = useMemo(() => {
    const units = {};

    deliveryData.forEach(unit => {
      unit.deliveries.forEach(delivery => {
        const value = parseFloat(delivery.value);
        if (!isNaN(value)) {
          units[delivery.date] = (units[delivery.date] || 0) + 1;
        }
      });
    });

    const time = {};
    const money = {};

    Object.keys(units).forEach(date => {
      const u = units[date];
      const t = u * TIME_SAVED_PER_UNIT_HOURS;
      const m = t * (chargeOutRate + employeeWage);
      time[date] = t;
      money[date] = m;
    });

    const sortedDates = Object.keys(units).sort();
    return { allDates: sortedDates, unitsPerDate: units, timePerDate: time, moneyPerDate: money };
  }, [deliveryData, chargeOutRate, employeeWage]);

  const formatMoney = (num) => {
    return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const renderRow = (label, data, isMoney = false, isBold = false) => {
    const total = Object.values(data).reduce((sum, val) => sum + val, 0);
    return (
      <View style={styles.row}>
        <View style={styles.totalCell}>
          <Text style={styles.totalLabel}>{label}</Text>
          <Text style={styles.totalValue}>
            {isMoney ? formatMoney(total) : Math.round(total)}
          </Text>
        </View>
        {allDates.map(date => (
          <View key={date} style={styles.cell}>
            <Text style={[styles.cellText, isBold && { fontWeight: 'bold' }]}> 
              {isMoney ? formatMoney(data[date] || 0) : Math.round(data[date] || 0)}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView horizontal style={{ padding: 20 }}>
      <View style={{ minWidth: 900 }}>
        <Text style={styles.header}>Time and Money Savings w. Mobile Fueling</Text>

        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Charge Out Rate ($/hr)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={chargeOutRate.toString()}
              onChangeText={(val) => setChargeOutRate(Number(val))}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Employee Wage ($/hr)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={employeeWage.toString()}
              onChangeText={(val) => setEmployeeWage(Number(val))}
            />
          </View>
          <View style={styles.messageBubble}>
            <Text style={styles.messageText}>
              *Mobile fueling assumes a 20-minute gas station visit was eliminated, creating useable charge-out time for your business
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.totalCell, { backgroundColor: 'transparent' }]}> 
            <Text style={styles.dateHeader}>Date</Text>
          </View>
          {allDates.map(date => (
            <View key={date} style={styles.cell}>
              <Text style={styles.dateHeader}>{date}</Text>
            </View>
          ))}
        </View>

        {renderRow('Units Filled', unitsPerDate)}
        {renderRow('Time Saved (hrs)', timePerDate)}
        {renderRow('Financial Potential ($)', moneyPerDate, true, true)}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  inputRow: { flexDirection: 'row', gap: 20, marginBottom: 20, alignItems: 'center' },
  inputGroup: { width: 180 },
  inputLabel: { fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, fontSize: 16, borderRadius: 6 },
  messageBubble: {
    backgroundColor: '#1CA84D',
    borderRadius: 12,
    padding: 10,
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  messageText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  totalCell: { width: 160, padding: 10, backgroundColor: '#1CA84D', borderRadius: 12, marginRight: 6 },
  totalLabel: { color: 'white', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  totalValue: { color: 'white', fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginTop: 4 },
  cell: { width: 100, padding: 6 },
  cellText: { fontSize: 14, textAlign: 'center' },
  dateHeader: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
});
