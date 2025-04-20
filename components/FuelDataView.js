// FuelDataView.js — Corrected: moved useMemo for fullChartData to top level
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Animated } from 'react-native';
import FilterControls from './FilterControls';
import SummaryBox from './SummaryBox';
import FuelDataTabs from './FuelDataTabs';
import FuelDeliveryTable from './FuelDeliveryTable';
import FuelDeliveryChart from './FuelDeliveryChart';
import InsightsView from './InsightsView';

export default function FuelDataView({ sheetId, sheetName, email }) {
  const [fuelData, setFuelData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [tempMonth, setTempMonth] = useState(1);
  const [tempYear, setTempYear] = useState(new Date().getFullYear());
  const [selectedFuelType, setSelectedFuelType] = useState('All');
  const [selectedUnit, setSelectedUnit] = useState('All');
  const [availableMonths, setAvailableMonths] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [summary, setSummary] = useState({ deliveries: 0, volume: 0, average: 0 });
  const [loading, setLoading] = useState(false);
  const [tempFuelType, setTempFuelType] = useState('All');
  const [tempUnit, setTempUnit] = useState('All');
  const [fuelTab, setFuelTab] = useState('Tabular Data');

  const fullChartData = useMemo(() => {
    const totals = {};
    allData.forEach(unit => {
      unit.deliveries.forEach(delivery => {
        if (!delivery.date) return;
        const date = delivery.date;
        const type = (unit.fuelType || '').toUpperCase();
        const value = parseFloat(delivery.value);
        if (isNaN(value)) return;

        if (!totals[date]) {
          totals[date] = {
            date,
            total: 0,
            'CLEAR GASOLINE': 0,
            'DYED GASOLINE': 0,
            'CLEAR DIESEL': 0,
            'DYED DIESEL': 0,
            'DEF': 0,
          };
        }

        if (type !== 'DEF') {
          totals[date].total += value;
        }

        if (totals[date][type] !== undefined) {
          totals[date][type] += value;
        }
      });
    });

    return Object.values(totals).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [allData]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://us-central1-fuelsrv-dashboard.cloudfunctions.net/getFuelData', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sheetId, sheetName })
        });
        const text = await response.text();
        const json = JSON.parse(text);
        setAllData(json.fuelData || []);
        extractFilterOptions(json.fuelData || [], json.dateHeaders || []);
      } catch (err) {
        console.error('Failed to fetch fuel data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [sheetId, sheetName]);

  const extractFilterOptions = (data, dateHeaders) => {
    const monthSet = new Set();
    const yearSet = new Set();
    const allDates = [];
    const normalizeDate = (dateStr) => {
      const parsed = new Date(dateStr);
      return isNaN(parsed) ? null : parsed;
    };
    for (const dateStr of dateHeaders) {
      const parsed = normalizeDate(dateStr);
      if (parsed) {
        const m = parsed.getMonth() + 1;
        const y = parsed.getFullYear();
        allDates.push({ m, y });
        monthSet.add(m);
        yearSet.add(y);
      }
    }
    const sortedDates = allDates.sort((a, b) => (b.y - a.y) || (b.m - a.m));
    const latest = sortedDates[0];
    if (latest) {
      setCurrentMonth(latest.m);
      setCurrentYear(latest.y);
      setTempMonth(latest.m);
      setTempYear(latest.y);
      setAvailableMonths([...monthSet].sort((a, b) => a - b));
      setAvailableYears([...yearSet].sort((a, b) => b - a));
      const filtered = filterData(data, latest.m, latest.y, 'All', 'All');
      setFuelData(filtered);
      setSummary(generateSummary(filtered));
    }
  };

  const filterData = (data, month, year, fuelType, unitFilter) => {
    return data.map(unit => {
      const filtered = unit.deliveries.filter(d => {
        const parts = d.date?.split('/') || [];
        const m = parseInt(parts[0], 10);
        const y = parseInt(parts[2], 10);
        const fuelMatch = fuelType === 'All' || (unit.fuelType || '').toLowerCase() === fuelType.toLowerCase();
        return m === month && y === year && fuelMatch;
      });
      return { ...unit, deliveries: filtered };
    }).filter(unit =>
      unit.deliveries.length > 0 &&
      (unitFilter === 'All' || `${unit.unit} - ${unit.plate}` === unitFilter)
    );
  };

  const generateSummary = (data) => {
    let totalDeliveries = 0;
    let totalVolume = 0;
    data.forEach(unit => {
      unit.deliveries.forEach(d => {
        const value = parseFloat(d.value);
        if (!isNaN(value)) {
          totalDeliveries++;
          totalVolume += value;
        }
      });
    });
    return {
      deliveries: totalDeliveries,
      volume: totalVolume.toFixed(1),
      average: totalDeliveries ? (totalVolume / totalDeliveries).toFixed(1) : '0.0'
    };
  };

  const handleSeeData = () => {
    setLoading(true);
    const safeMonth = parseInt(tempMonth ?? currentMonth, 10);
    const safeYear = parseInt(tempYear ?? currentYear, 10);
    const filtered = filterData(allData, safeMonth, safeYear, tempFuelType, tempUnit);
    setCurrentMonth(safeMonth);
    setCurrentYear(safeYear);
    setSelectedFuelType(tempFuelType);
    setSelectedUnit(tempUnit);
    setFuelData(filtered);
    setSummary(generateSummary(filtered));
    setLoading(false);
  };

  const exportToCSV = () => {
    if (!fuelData || fuelData.length === 0) return;

    const dateSet = new Set();
    fuelData.forEach(unit => {
      unit.deliveries.forEach(d => {
        if (d.date) dateSet.add(d.date);
      });
    });
    const allDates = Array.from(dateSet).sort();

    const headers = ['Unit #', 'License Plate', 'Fuel Type', ...allDates];

    const rows = fuelData.map(unit => {
      const dateMap = Object.fromEntries(unit.deliveries.map(d => [d.date, d.value]));
      const values = allDates.map(date => dateMap[date] ?? '');
      return [unit.unit, unit.plate, unit.fuelType, ...values];
    });

    const totals = ['TOTAL', '', ''].concat(
      allDates.map(date => {
        let sum = 0;
        fuelData.forEach(unit => {
          const val = parseFloat(unit.deliveries.find(d => d.date === date)?.value);
          if (!isNaN(val)) sum += val;
        });
        return sum.toFixed(1);
      })
    );

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(val => `"${val}"`).join(',')),
      totals.map(val => `"${val}"`).join(',')
    ].join('\n');

    const filename = `FuelData-${currentMonth}_${currentYear}.csv`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatNumber = (value) =>
    isNaN(value) ? value : value.toFixed(1).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const uniqueUnits = Array.from(new Set(allData.map(u => `${u.unit} - ${u.plate}`)));

  const chartData = useMemo(() => {
    const totals = {};
    fuelData.forEach(unit => {
      unit.deliveries.forEach(delivery => {
        if (!delivery.date) return;
        const date = delivery.date;
        const type = (unit.fuelType || '').toUpperCase();
        const value = parseFloat(delivery.value);
        if (isNaN(value)) return;

        if (!totals[date]) {
          totals[date] = {
            date,
            total: 0,
            'CLEAR GASOLINE': 0,
            'DYED GASOLINE': 0,
            'CLEAR DIESEL': 0,
            'DYED DIESEL': 0,
            'DEF': 0,
          };
        }

        if (type !== 'DEF') {
          totals[date].total += value;
        }

        if (totals[date][type] !== undefined) {
          totals[date][type] += value;
        }
      });
    });

    return Object.values(totals).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [fuelData]);

  if (loading) {
    return <ActivityIndicator size="large" color="#1CA84D" style={{ marginTop: 24 }} />;
  }

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
      <View style={{ padding: 16 }}>
        <FuelDataTabs fuelTab={fuelTab} setFuelTab={setFuelTab} />
        <FilterControls
          tempMonth={tempMonth}
          tempYear={tempYear}
          tempFuelType={tempFuelType}
          tempUnit={tempUnit}
          availableMonths={availableMonths}
          availableYears={availableYears}
          uniqueUnits={uniqueUnits}
          setTempMonth={setTempMonth}
          setTempYear={setTempYear}
          setTempFuelType={setTempFuelType}
          setTempUnit={setTempUnit}
          handleSeeData={handleSeeData}
        />
        <SummaryBox summary={summary} />

        {fuelTab === 'Tabular Data' ? (
          <>
            <View style={{ alignItems: 'center', marginBottom: 12 }}>
              <TouchableOpacity
                onPress={exportToCSV}
                style={{
                  backgroundColor: '#2e7d32',
                  paddingVertical: 10,
                  paddingHorizontal: 24,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
                  Export CSV
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
              Individual Driver Submissions:
            </Text>
            <FuelDeliveryTable fuelData={fuelData} formatNumber={formatNumber} />
          </>
        ) : fuelTab === 'Chart View' ? (
          <FuelDeliveryChart
            chartData={chartData}
            fullChartData={fullChartData}
            selectedMonth={currentMonth.toString().padStart(2, '0')}
            selectedYear={currentYear.toString()}
          />
        ) : (
  <InsightsView
    fuelData={fuelData}
	allData={allData}
    currentMonth={currentMonth}
    currentYear={currentYear}
  />
)}
      </View>
    </ScrollView>
  );
}