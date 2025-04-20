// components/ROISavingsPage.js — Updated with filtering and real deliveryData use
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, Picker, TouchableOpacity } from 'react-native';

const TIME_SAVED_PER_UNIT_HOURS = 0.33;
const DEFAULT_WAGE = 30;
const DEFAULT_CHARGE_OUT = 200;

export default function ROISavingsPage({ deliveryData }) {
  const [employeeWage, setEmployeeWage] = useState(DEFAULT_WAGE);
  const [chargeOutRate, setChargeOutRate] = useState(DEFAULT_CHARGE_OUT);
  const [timeSavings, setTimeSavings] = useState(null);
  const [moneySavings, setMoneySavings] = useState(null);
  const [unitsFilled, setUnitsFilled] = useState(null);

  const [selectedMonth, setSelectedMonth] = useState('04');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedFuelType, setSelectedFuelType] = useState('ALL');

  const calculateSavings = () => {
    const filteredData = deliveryData.filter(({ date, fuelType }) => {
      const [month, day, year] = date.split('/');
      const matchesMonth = selectedMonth === 'ALL' || month === selectedMonth;
      const matchesYear = selectedYear === 'ALL' || year === selectedYear;
      const matchesFuel = selectedFuelType === 'ALL' || fuelType === selectedFuelType;
      return matchesMonth && matchesYear && matchesFuel;
    });

    const resultTime = {};
    const resultMoney = {};
    const resultUnits = {};
    // let totalTime = 0; (removed duplicate declaration)
    // let totalMoney = 0; (removed duplicate declaration)

    filteredData.forEach(({ date, fuelType, value }) => {
      if (fuelType === 'DEF') return; // skip DEF
      const volume = parseFloat(value);
      if (isNaN(volume)) return;

      resultUnits[date] = (resultUnits[date] || 0) + 1;
    });

    Object.keys(resultUnits).forEach((date) => {
      const units = resultUnits[date];
      const time = units * TIME_SAVED_PER_UNIT_HOURS;
      const money = time * (employeeWage + chargeOutRate);

      resultTime[date] = time;
      resultMoney[date] = money;
    });

    const totalTimeFinal = Object.values(resultTime).reduce((a, b) => a + b, 0);
    const totalMoneyFinal = Object.values(resultMoney).reduce((a, b) => a + b, 0);
    const totalUnits = Object.values(resultUnits).reduce((a, b) => a + b, 0);

    setUnitsFilled({ total: totalUnits, byDate: resultUnits });
    setTimeSavings({ total: totalTimeFinal, byDate: resultTime });
    setMoneySavings({ total: totalMoneyFinal, byDate: resultMoney });
  };

  useEffect(() => {
    if (deliveryData?.length) {
      calculateSavings();
    }
  }, [deliveryData]);

  const formatDisplayDate = (rawDate) => {
  const [month, day, year] = rawDate.split('/');
  return `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year}`;
};

const renderDateHeaderRow = (byDate) => (
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <View style={{ width: 120 }} />
    {Object.keys(byDate).map((date) => (
      <Text
        key={date + '-header'}
        style={{ width: 100, textAlign: 'center', fontSize: 14, fontWeight: '600' }}
      >
        {formatDisplayDate(date)}
      </Text>
    ))}
  </View>
);

  const formatNumber = (val, isMoney = false) => {
    const formatted = Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return isMoney ? `$${formatted}` : formatted;
  };

  const renderSavingsRow = (label, total, byDate, isMoney) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
      <View style={{ width: 120, backgroundColor: 'green', padding: 8, borderRadius: 8, justifyContent: 'center' }}>
        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14, textAlign: 'center' }}>Total Savings</Text>
        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>
          {isMoney ? `${formatNumber(total, true)}` : `${formatNumber(total)} hr`}
        </Text>
      </View>
      {Object.keys(byDate).map((date) => (
        <Text
          key={date + label}
          style={{ width: 100, textAlign: 'center', fontWeight: 'bold', fontSize: 15 }}
        >
          {formatNumber(byDate[date], isMoney)}
        </Text>
      ))}
    </View>
  );

  const renderUnitsFilledRow = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
      <View style={{ width: 120 }}>
        <Text style={{ fontSize: 14, fontWeight: 'bold', textAlign: 'center' }}>Units Filled</Text>
        <Text style={{ fontSize: 14, textAlign: 'center' }}>{unitsFilled.total}</Text>
      </View>
      {Object.keys(unitsFilled.byDate).map((date) => (
        <Text
          key={date + '-units'}
          style={{ width: 100, textAlign: 'center', fontSize: 14 }}
        >
          {unitsFilled.byDate[date]}
        </Text>
      ))}
    </View>
  );

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
        Time and Money Savings with Mobile Fueling
      </Text>

      {/* Month / Year / Fuel Type Selectors */}
      <View style={{ flexDirection: 'row', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <View style={{ marginRight: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '500' }}>Month:</Text>
          <Picker selectedValue={selectedMonth} onValueChange={(val) => setSelectedMonth(val)} style={{ width: 100 }}>
            <Picker.Item label="Jan" value="01" />
            <Picker.Item label="Feb" value="02" />
            <Picker.Item label="Mar" value="03" />
            <Picker.Item label="Apr" value="04" />
            <Picker.Item label="May" value="05" />
            <Picker.Item label="Jun" value="06" />
            <Picker.Item label="Jul" value="07" />
            <Picker.Item label="Aug" value="08" />
            <Picker.Item label="Sep" value="09" />
            <Picker.Item label="Oct" value="10" />
            <Picker.Item label="Nov" value="11" />
            <Picker.Item label="Dec" value="12" />
          </Picker>
        </View>

        <View style={{ marginRight: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '500' }}>Year:</Text>
          <Picker selectedValue={selectedYear} onValueChange={(val) => setSelectedYear(val)} style={{ width: 100 }}>
            <Picker.Item label="2024" value="2024" />
            <Picker.Item label="2025" value="2025" />
          </Picker>
        </View>

        <View style={{ marginRight: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '500' }}>Fuel Type:</Text>
          <Picker selectedValue={selectedFuelType} onValueChange={(val) => setSelectedFuelType(val)} style={{ width: 150 }}>
            <Picker.Item label="All" value="ALL" />
            <Picker.Item label="Clear Gasoline" value="CLEAR GASOLINE" />
            <Picker.Item label="Dyed Gasoline" value="DYED GASOLINE" />
            <Picker.Item label="Clear Diesel" value="CLEAR DIESEL" />
            <Picker.Item label="Dyed Diesel" value="DYED DIESEL" />
          </Picker>
        </View>
      </View>

      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 6 }}>Charge Out Rate ($/hr):</Text>
      <TextInput
        keyboardType="numeric"
        value={chargeOutRate.toString()}
        onChangeText={(val) => setChargeOutRate(Number(val))}
        style={{ borderWidth: 1, marginBottom: 10, padding: 6, fontSize: 16 }}
      />

      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 6 }}>Employee Wage ($/hr):</Text>
      <TextInput
        keyboardType="numeric"
        value={employeeWage.toString()}
        onChangeText={(val) => setEmployeeWage(Number(val))}
        style={{ borderWidth: 1, marginBottom: 16, padding: 6, fontSize: 16 }}
      />

      <TouchableOpacity
        onPress={calculateSavings}
        style={{ backgroundColor: '#1CA84D', padding: 12, borderRadius: 6, marginBottom: 20 }}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600', fontSize: 16 }}>
          CALCULATE SAVINGS
        </Text>
      </TouchableOpacity>

      {unitsFilled && timeSavings && (
        <View style={{ marginTop: 30 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>Time Savings (hours)</Text>
          <ScrollView horizontal>
            <View>
              {renderDateHeaderRow(timeSavings.byDate)}
              {renderUnitsFilledRow()}
              {renderSavingsRow('time', timeSavings.total, timeSavings.byDate, false)}
            </View>
          </ScrollView>
        </View>
      )}

      {unitsFilled && moneySavings && (
        <View style={{ marginTop: 30 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>Money Savings ($)</Text>
          <ScrollView horizontal>
            <View>
              {renderDateHeaderRow(moneySavings.byDate)}
              {renderUnitsFilledRow()}
              {renderSavingsRow('money', moneySavings.total, moneySavings.byDate, true)}
            </View>
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
}
