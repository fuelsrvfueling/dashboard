import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';

const HomePage = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.flexRow}>
        {/* Left Column */}
        <View style={styles.leftColumn}>
          <Text style={styles.header}>Welcome to your Fuel Dashboard created by FuelSrv!</Text>
          <Text style={styles.subheader}>
            Your business is <Text style={styles.bold}>tremendously</Text> important to us, and we are dedicated to creating novel,
            meaningful service and software products to support you.
          </Text>
          <Text style={styles.subheader}>We encourage you to explore the following Dashboard sections:</Text>

          <View style={styles.bulletContainer}>
            <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Fuel Data:</Text></Text>
            <Text style={styles.arrow}>→ <Text style={styles.bold}>Tabular Data Tab:</Text> View your fuel volume data, broken down by date and volume for selected months/years. See monthly unit totals in the left-most column, and total daily volume values in the bottom row</Text>
            <Text style={styles.arrow}>→ <Text style={styles.bold}>Chart View Tab:</Text> Visualize your monthly or all-time volume consumption with various line types and see your 7-Day Moving Average to look ahead</Text>
            <Text style={styles.arrow}>→ <Text style={styles.bold}>ROI Tab:</Text> Explore your savings with mobile fueling by FuelSrv; simply input your Charge-Out Rate and Employee Rate values to see the monetary potential made available by eliminating the gas station chore</Text>
            <Text style={styles.arrow}>→ <Text style={styles.bold}>Insights Tab (NEW):</Text> Get instant insights into your most- and least-filled tanks, highest volume dates, statistical insights, and more - valuable for high-level views of your monthly operations, including Month-Over-Month analytics</Text>
          </View>

          <View style={styles.bulletContainer}>
            <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Carbon Reporting:</Text> For our Diesel users, we are proud to be a full-time supplier of Hydrogenation-Derived Renewable Diesel (HDRD) - a more emission-friendly diesel product. Explore your Total Emissions Reduction and Total Carbon Credits Revenue made possible with HDRD supplied by FuelSrv</Text>
          </View>

          <View style={styles.bulletContainer}>
            <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Invoices:</Text> View a summarization of the invoices sent to you by FuelSrv with a simplified view of all invoice details to-date</Text>
          </View>

          <View style={styles.bulletContainer}>
            <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Contact & Users:</Text> Send us a message for immediate support or request a New User for your Dashboard - we promise to reply to all messages within 24 hours!</Text>
          </View>
        </View>

        {/* Right Column */}
        <View style={styles.rightColumn}>
          <Image
            source={require('../assets/dashboard-image.png')} // Update this path to your actual image
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16
  },
  flexRow: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  leftColumn: {
    flex: 1,
    paddingRight: 12,
    minWidth: '50%'
  },
  rightColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '50%'
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },
  subheader: {
    fontSize: 14,
    marginBottom: 8
  },
  bulletContainer: {
    marginBottom: 12
  },
  bulletPoint: {
    fontSize: 14,
    marginBottom: 4
  },
  arrow: {
    fontSize: 13,
    marginLeft: 12,
    marginBottom: 2
  },
  bold: {
    fontWeight: 'bold'
  },
  image: {
    width: '100%',
    height: 250,
    marginTop: 12
  }
});

export default HomePage;
