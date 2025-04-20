// components/FilterControls.js
import React from 'react';
import { View, Text, Picker, Button } from 'react-native';

export default function FilterControls({
  tempMonth,
  tempYear,
  tempFuelType,
  tempUnit,
  availableMonths,
  availableYears,
  uniqueUnits,
  setTempMonth,
  setTempYear,
  setTempFuelType,
  setTempUnit,
  handleSeeData,
}) {
  const monthName = (month) => new Date(2000, month - 1).toLocaleString('default', { month: 'long' });

  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Select Month:</Text>
      <Picker selectedValue={tempMonth} onValueChange={setTempMonth}>
        {availableMonths.map(m => (
          <Picker.Item key={m} label={monthName(m)} value={m} />
        ))}
      </Picker>

      <Text style={{ fontWeight: 'bold', marginTop: 8 }}>Select Year:</Text>
      <Picker selectedValue={tempYear} onValueChange={setTempYear}>
        {availableYears.map(y => (
          <Picker.Item key={y} label={`${y}`} value={y} />
        ))}
      </Picker>

      <Text style={{ fontWeight: 'bold', marginTop: 8 }}>Select Fuel Type:</Text>
      <Picker selectedValue={tempFuelType} onValueChange={setTempFuelType}>
        {['All', 'CLEAR GASOLINE', 'DYED GASOLINE', 'CLEAR DIESEL', 'DYED DIESEL', 'DEF'].map(fuel => (
          <Picker.Item key={fuel} label={fuel} value={fuel} />
        ))}
      </Picker>

      <Text style={{ fontWeight: 'bold', marginTop: 8 }}>Select Unit:</Text>
      <Picker selectedValue={tempUnit} onValueChange={setTempUnit}>
        <Picker.Item label="All" value="All" />
        {uniqueUnits.map(u => (
          <Picker.Item key={u} label={u} value={u} />
        ))}
      </Picker>

      <Button title="See Data" onPress={handleSeeData} color="#1CA84D" />
    </View>
  );
}