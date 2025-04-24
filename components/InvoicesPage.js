import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
const invoiceFunctionUrl = 'https://us-central1-fuelsrv-dashboard.cloudfunctions.net/getInvoiceData';


export default function InvoicesPage({ customerName, invoiceSheetId }) {
  const [invoiceData, setInvoiceData] = useState([]);
  const [loading, setLoading] = useState(true);
console.log("📨 Received props:", customerName, invoiceSheetId);
	const isValid = (value) => {
  if (typeof value === 'string') {
    return value.trim() !== '' && value.trim() !== '0';
  }
  return value !== null && value !== undefined && value !== 0 && !isNaN(value);
};

useEffect(() => {
  const fetchInvoices = async () => {
    try {
      console.log('📦 Sending to Firebase:', { customerName, sheetId: invoiceSheetId });

      const result = await fetch(invoiceFunctionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          sheetId: invoiceSheetId
        }),
      });

      const data = await result.json();
      console.log('✅ Invoice function result:', data);

      if (Array.isArray(data)) {
        setInvoiceData(data);
      } else {
        console.warn('⚠️ Unexpected response type:', data);
      }
    } catch (error) {
      console.error('❌ Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchInvoices();
}, [customerName, invoiceSheetId]);

if (loading) {
  return (
    <View style={{ marginTop: 24, alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#1CA84D" />
      <Text style={{ marginTop: 12, fontSize: 14, color: '#555' }}>
        Please wait – your data is loading, it may take a moment
      </Text>
    </View>
  );
}


return (
  <ScrollView style={{ padding: 16 }}>
    <Text style={styles.header}>Invoices for {customerName}</Text>
    {invoiceData.length > 0 ? (
      invoiceData.map((inv, idx) => (
        <View key={idx} style={styles.card}>
          <Text style={styles.date}>{inv.invoiceDate}</Text>
          <Text>ID: {inv.invoiceId}</Text>

          {isValid(inv.clearGas) && <Text>Clear Gasoline: {inv.clearGas} L</Text>}
          {isValid(inv.dyedGas) && <Text>Dyed Gasoline: {inv.dyedGas} L</Text>}
          {isValid(inv.clearDiesel) && <Text>Clear Diesel: {inv.clearDiesel} L</Text>}
          {isValid(inv.dyedDiesel) && <Text>Dyed Diesel: {inv.dyedDiesel} L</Text>}
          {isValid(inv.defVolume) && <Text>DEF: {inv.defVolume} L</Text>}

          {isValid(inv.totalFuelCost) && <Text>Total Fuel Cost: {inv.totalFuelCost}</Text>}
          {isValid(inv.deliveryFee) && <Text>Delivery Fee: {inv.deliveryFee}</Text>}
          {isValid(inv.otherCharges) && <Text>Other Charges: {inv.otherCharges}</Text>}
          {isValid(inv.subtotal) && <Text>Subtotal: {inv.subtotal}</Text>}
          {isValid(inv.pst) && <Text>PST: {inv.pst}</Text>}
          {isValid(inv.gst) && <Text>GST: {inv.gst}</Text>}
          {isValid(inv.total) && (
            <Text style={{ fontWeight: 'bold' }}>
              Invoice Total: {inv.total}
            </Text>
          )}
          {isValid(inv.unitsFilled) && <Text>Units Filled: {inv.unitsFilled}</Text>}

          <Text style={{ fontStyle: 'italic' }}>Month: {inv.sheet}</Text>
        </View>
      ))
    ) : (
      <Text>No invoices found.</Text>
    )}
  </ScrollView>
);

}

const styles = StyleSheet.create({
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  card: {
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#f4f4f4',
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1
  },
  date: { fontWeight: 'bold', marginBottom: 4 }
});
