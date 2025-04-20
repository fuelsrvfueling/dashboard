// components/FuelDeliveryTable.js
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView,  Animated } from 'react-native';

export default function FuelDeliveryTable({ fuelData, formatNumber }) {
  // Get full list of unique dates from all deliveries
  const allDatesSet = new Set();
  fuelData.forEach(unit => {
    unit.deliveries.forEach(d => {
      if (d.date) allDatesSet.add(d.date);
    });
  });
  const allDates = Array.from(allDatesSet).sort();

const [fadeAnim] = useState(new Animated.Value(0));

useEffect(() => {
  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 500,
    useNativeDriver: true
  }).start();
}, []);

  return (
  <Animated.View style={{ opacity: fadeAnim }}>
    <ScrollView horizontal>
      <View style={{ paddingBottom: 12 }}>
        {fuelData.map((unit, idx) => {
          const dateMap = Object.fromEntries(unit.deliveries.map(d => [d.date, d.value]));
          const totalVolume = Object.values(dateMap).reduce((sum, val) => {
            const v = parseFloat(val);
            return !isNaN(v) && v !== 0 ? sum + v : sum;
          }, 0);

          return (
            <View key={idx} style={{ marginBottom: 10 }}>
              <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>
                {unit.unit} - {unit.plate} ({unit.fuelType})
              </Text>
              <View style={{ flexDirection: 'row' }}>
                <View
                  style={{
                    backgroundColor: '#1CA84D',
                    borderRadius: 8,
                    paddingVertical: 4,
                    paddingHorizontal: 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                    minWidth: 70,
                  }}
                >
                  <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#000' }}>
                    Total Volume
                  </Text>
                  <Text style={{ fontWeight: 'bold', color: '#fff', textDecorationLine: 'underline' }}>
                    {totalVolume.toFixed(1)}
                  </Text>
                </View>

                {allDates.map((date, i) => (
                  <View
                    key={i}
                    style={{ width: 80, alignItems: 'center', marginRight: 8 }}
                  >
                    <Text style={{ fontSize: 10 }}>{date}</Text>
                    <Text style={{ fontWeight: 'bold' }}>
                      {!isNaN(parseFloat(dateMap[date])) ? formatNumber(parseFloat(dateMap[date])) : dateMap[date] || ''}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}

        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          <View
            style={{
              width: 80,
              alignItems: 'center',
              marginRight: 8,
            }}
          />

          {allDates.map((date, i) => {
            let sum = 0;
            fuelData.forEach(unit => {
              const val = parseFloat(unit.deliveries.find(d => d.date === date)?.value);
              if (!isNaN(val)) sum += val;
            });
            return (
              <View
                key={i}
                style={{ width: 80, alignItems: 'center', marginRight: 8 }}
              >
                <Text style={{ fontSize: 10, color: 'green' }}>Total</Text>
                <Text style={{ fontWeight: 'bold', color: 'green' }}>
                  {formatNumber(sum)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
	</Animated.View>
  );
}
