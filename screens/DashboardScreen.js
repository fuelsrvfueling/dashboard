import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Image } from 'react-native';
import FuelSrvLogo from '../assets/Logo-Website.png';
import Sidebar from '../components/Sidebar';
import FuelDataView from '../components/FuelDataView';
import ROISavingsPage from '../components/ROISavingsPage';


const pages = ['Home', 'Fuel Data', 'ROI', 'Carbon Savings', 'Invoices', 'Contact Us'];

export default function DashboardScreen({ route }) {
  const { email, sheetId, sheetName } = route.params;
  const [activePage, setActivePage] = useState('Fuel Data');

const renderPageContent = () => {
  if (activePage === 'Fuel Data') {
    return <FuelDataView sheetId={sheetId} sheetName={sheetName} email={email} />;
  } else if (activePage === 'ROI') {
    // TEMP: Replace with real deliveryData later
    const sampleDeliveryData = [
      { date: '4/2', unitsFilled: 10 },
      { date: '4/5', unitsFilled: 8 },
      { date: '4/8', unitsFilled: 15 },
    ];
    return <ROISavingsPage deliveryData={sampleDeliveryData} />;
  }

  return <Text style={styles.contentText}>Welcome to your dashboard!</Text>;
};


  return (
    <View style={styles.container}>
      <Sidebar pages={pages} activePage={activePage} setActivePage={setActivePage} />
      <View style={styles.mainContent}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>FuelSrv Dashboard</Text>
          <Image source={FuelSrvLogo} style={styles.logoImage} resizeMode="contain" />
        </View>
        <Text style={styles.userInfo}>Logged in as: {email}</Text>
        <Text style={styles.userInfo}>Fuel Data for: {sheetName}</Text>
        <ScrollView style={styles.pageContent} contentContainerStyle={{ flexGrow: 1 }}>
          {renderPageContent()}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', flex: 1 },
  mainContent: { flex: 1, backgroundColor: '#fff', padding: 24 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 8, color: '#1CA84D' },
  logoImage: { width: 100, height: 40, marginLeft: 'auto' },
  userInfo: { fontSize: 14, color: '#333', marginBottom: 4 },
  pageContent: { flex: 1, marginTop: 12 },
  contentText: { fontSize: 16, color: '#444' },
});
