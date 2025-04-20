// Sidebar.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const Sidebar = ({ pages, activePage, setActivePage }) => {
  return (
    <View style={styles.sidebar}>
      <Text style={styles.logo}>FuelSrv</Text>
      {pages.map((page) => (
        <TouchableOpacity key={page} onPress={() => setActivePage(page)}>
          <Text style={[styles.menuItem, activePage === page && styles.activeMenu]}>{page}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 200,
    backgroundColor: '#1CA84D',
    padding: 20,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
  },
  menuItem: {
    fontSize: 16,
    color: '#fff',
    paddingVertical: 10,
  },
  activeMenu: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default Sidebar;