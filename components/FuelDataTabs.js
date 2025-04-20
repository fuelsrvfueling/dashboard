import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function FuelDataTabs({ fuelTab, setFuelTab }) {
  const tabs = ['Tabular Data', 'Chart View', 'Insights'];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = fuelTab === tab;
        const backgroundColor =
          tab === 'Insights' && isActive ? '#0366fc' : isActive ? '#1CA84D' : '#ccc';

        return (
          <TouchableOpacity
            key={tab}
            onPress={() => setFuelTab(tab)}
            style={[styles.tab, { backgroundColor }]}
          >
            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginRight: 10,
  },
  tabText: {
    color: '#000',
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#fff',
  },
});
