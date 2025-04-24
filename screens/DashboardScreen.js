import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';

import FuelSrvLogo from '../assets/Logo-Website.png';
import Sidebar from '../components/Sidebar';
import FuelDataView from '../components/FuelDataView';
import InvoicesPage from '../components/InvoicesPage';
import CarbonSavingsPage from '../components/CarbonSavingsPage';
import ContactPage from '../components/ContactPage';
import HomePage from '../components/HomePage';

const pages = ['Home', 'Fuel Data', 'Carbon Reporting', 'Invoices', 'Contact & Users'];

export default function DashboardScreen({ route }) {
  const { email, sheetId, sheetName } = route.params;
  const [activePage, setActivePage] = useState('Fuel Data');
  const [fuelData, setFuelData] = useState([]);

  const renderPageContent = () => {
    if (activePage === 'Fuel Data') {
      return (
        <FuelDataView
          sheetId={sheetId}
          sheetName={sheetName}
          email={email}
          onDataLoaded={setFuelData}
        />
      );
} else if (activePage === 'Invoices') {
  return (
    <InvoicesPage
      customerName={sheetName}  // ✅ passed down from login
      invoiceSheetId="146m1_yNXfLHC4k_rM1OFYxDln9FWpqcWK3gYiVwC1Tk"  // ✅ the Invoice Log sheet ID
    />
  );
} else if (activePage === 'Carbon Reporting') {
  return (
    <CarbonSavingsPage
      customerName={sheetName}  // ✅ passed down from login
      invoiceSheetId="146m1_yNXfLHC4k_rM1OFYxDln9FWpqcWK3gYiVwC1Tk"  // ✅ the Invoice Log sheet ID
    />
  );
} else if (activePage === 'Contact & Users') {
  return (
    <ContactPage
      customerName={sheetName}  // ✅ passed down from login
      invoiceSheetId="146m1_yNXfLHC4k_rM1OFYxDln9FWpqcWK3gYiVwC1Tk"  // ✅ the Invoice Log sheet ID
    />
  );
} else if (activePage === 'Home') {
  return (
    <HomePage
      customerName={sheetName}  // ✅ passed down from login
    />
  );
}
    return <Text style={styles.contentText}>Welcome to your dashboard!</Text>;
  };

return (
  <View style={styles.container}>
    <Sidebar pages={pages} activePage={activePage} setActivePage={setActivePage} />
    <View style={styles.mainContent}>
      
      {/* Top Bar: Logo and Log Out */}
      <View style={styles.topBar}>
        <Image
          source={FuelSrvLogo}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.logoutButton}>Log Out</Text>
        </TouchableOpacity>
      </View>

      {/* Header Title */}
      <Text style={styles.header}>FuelSrv Dashboard</Text>

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
topBar: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 4
},
header: {
  fontSize: 22,
  fontWeight: 'bold',
  color: '#1CA84D',
  marginBottom: 4
},
logoImage: {
  width: 100,
  height: 40
},


  userInfo: { fontSize: 14, color: '#333', marginBottom: 4 },
  pageContent: { flex: 1, marginTop: 12 },
  contentText: { fontSize: 16, color: '#444' },
  logoutButton: {
  color: '#1CA84D',
  fontWeight: 'bold',
  fontSize: 14,
  borderWidth: 1,
  borderColor: '#1CA84D',
  borderRadius: 6,
  paddingVertical: 6,
  paddingHorizontal: 12
}

});
