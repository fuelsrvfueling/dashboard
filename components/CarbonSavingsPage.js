import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';

const invoiceFunctionUrl = 'https://us-central1-fuelsrv-dashboard.cloudfunctions.net/getInvoiceData';

export default function CarbonSavingsPage({ customerName, invoiceSheetId }) {
  const [invoiceData, setInvoiceData] = useState([]);
  const [loading, setLoading] = useState(true);

  const isValid = (value) => {
    if (typeof value === 'string') {
      return value.trim() !== '' && value.trim() !== '0';
    }
    return value !== null && value !== undefined && value !== 0 && !isNaN(value);
  };

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const result = await fetch(invoiceFunctionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName,
            sheetId: invoiceSheetId,
          }),
        });

        const data = await result.json();
        if (Array.isArray(data)) {
          setInvoiceData(data);
        } else {
          console.warn('⚠️ Unexpected response type:', data);
        }
      } catch (error) {
        console.error('❌ Error fetching carbon report:', error);
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


  const anyDiesel = invoiceData.some(
    (inv) => isValid(inv.clearDiesel) || isValid(inv.dyedDiesel)
  );

  if (!anyDiesel) {
    return (
      <View style={{ padding: 16 }}>
        <Text style={styles.header}>Carbon Report for Hydrogenation-Derived Renewable Diesel (HDRD)</Text>
        <Text style={{ fontStyle: 'italic' }}>
          It appears you do not make use of FuelSrv's Hydrogenation-Derived Renewable Diesel (HDRD) fuel; please reach out to us if you're interested in exploring that!
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={styles.header}>Carbon Report for Hydrogenation-Derived Renewable Diesel (HDRD)</Text>
	  <View style={styles.messageBubble}>
  <Text style={styles.messageText}>
    The below Carbon Reporting is defined by the following:{"\n"}
	{"\n"}
    ○ Carbon Intensity [gCO2e/MJ] for Fossil Diesel is 90.00 compared to only 20.00 for HDRD. The emission reduction with HDRD is thus 70 gCO2e/MJ{"\n"}
	{"\n"}
    ○ The Energy Intensity of Diesel [MJ/L] is 35.80; as a result, the Emission Reduction Per Liter [kg CO2e] using HDRD is the Energy Intensity * Emission Reduction (70.00), being 2.51 kg{"\n"}
	{"\n"}
    ○ The Total Emission Reduction [tonnes CO2e] is thus each Invoice Total Volume (Diesel, Dyed Diesel) multiplied by 2.51 and divided by 1,000{"\n"}
	{"\n"}
    ○ The Carbon Credit Price [$ per tonne CO2e] is $300{"\n"}
	{"\n"}
    ⦿ Your Revenue From Credits [$] value is your Total Emission Reduction multiplied by $300, as shown for each invoice on this page
  </Text>
</View>

      {invoiceData.map((inv, idx) => {
        const clearDiesel = parseFloat((inv.clearDiesel || "0").replace(/,/g, ""));
		const dyedDiesel = parseFloat((inv.dyedDiesel || "0").replace(/,/g, ""));
		const totalDiesel = clearDiesel + dyedDiesel;

        if (totalDiesel === 0) return null;

        const emissionReduction = (totalDiesel) * 2.51/1000;
        const carbonCreditPrice = 300;
        const revenue = emissionReduction * carbonCreditPrice;

        return (
          <View key={idx} style={styles.card}>
            <Text style={styles.date}>{inv.invoiceDate}</Text>
            <Text>ID: {inv.invoiceId}</Text>
            {clearDiesel > 0 && <Text>Clear Diesel: {clearDiesel.toFixed(2)} L</Text>}
            {dyedDiesel > 0 && <Text>Dyed Diesel: {dyedDiesel.toFixed(2)} L</Text>}
			<Text>
  Total Emission Reduction [tonnes CO₂e]: {emissionReduction.toLocaleString(undefined, { minimumFractionDigits: 1 })} tonnes CO₂e
</Text>
            <Text>Carbon Credit Price [$ per tonne CO₂e]: ${carbonCreditPrice}</Text>
			<Text style={{ fontWeight: 'bold' }}>
  Total Revenue from Credits [$]: ${revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
</Text>
            <Text style={{ fontStyle: 'italic' }}>Invoice Log: {inv.sheet}</Text>
          </View>
        );
      })}
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
    borderWidth: 1,
  },
  date: { fontWeight: 'bold', marginBottom: 4 },
  messageBubble: {
    backgroundColor: '#1CA84D',
	marginBottom: 12,
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
infoText: {
  fontSize: 13,
  color: '#1a472a',           // dark green text
  lineHeight: 18,
},

});
