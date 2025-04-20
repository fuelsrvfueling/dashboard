import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

function getWeekday(dateStr) {
  const [month, day, year] = dateStr.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

function getWeeksInMonth(month, year) {
  const first = new Date(year, month - 1, 1);
  const last = new Date(year, month, 0);
  return Math.ceil((first.getDay() + last.getDate()) / 7);
}

function getFullWeeks(deliveryDates) {
  const weeks = new Map();
  const today = new Date();

  deliveryDates.forEach(dateStr => {
    const [month, day, year] = dateStr.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    const monday = new Date(date);
    monday.setDate(date.getDate() - ((dayOfWeek + 6) % 7));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    if (sunday < today) {
      const key = monday.toISOString().slice(0, 10);
      if (!weeks.has(key)) weeks.set(key, new Set());
      weeks.get(key).add(dateStr);
    }
  });

  return weeks;
}

function getFuelColor(type) {
  switch (type.toUpperCase()) {
    case 'CLEAR GASOLINE': return '#228B22';
    case 'DYED GASOLINE': return '#90EE90';
    case 'CLEAR DIESEL': return '#cc5c24';
    case 'DYED DIESEL': return '#e99863';
    case 'DEF': return '#4B9CD3';
    default: return '#888';
  }
}

function formatNumber(value) {
  return isNaN(value) ? value : value.toFixed(1).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export default function InsightsView({ fuelData, allData, currentMonth, currentYear }) {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start();
  }, []);

  const insights = useMemo(() => {

    if (!Array.isArray(fuelData) || !Array.isArray(allData)) {
      return {
        top5: [], least5: [], highestDate: null, bestWeekday: null,
        avgPerFillDay: 0, avgPerVehicle: null, avgPerBulk: null,
        exceptions: {}, avgPerWeek: 0, fuelVolumes: {}, totalVolume: 0,
        allUnitsThisMonth: new Set(), prevMonthTotal: 0, prevMonthUnits: new Set()
      };
    }

    const unitVolumes = {};
    const dateVolumes = {};
    const exceptions = { MISSED: [], LOCKED: [], ABSENT: [], FULL: [] };
    const fuelVolumes = {};
    const uniqueDates = new Set();
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    const allUnitsThisMonth = new Set();
    let volUnder400 = 0, countUnder400 = 0;
    let volOver400 = 0, countOver400 = 0;
    let totalVolume = 0;
    let prevMonthTotal = 0;
    const prevMonthUnits = new Set();

    fuelData.forEach(unit => {
      const unitKey = `${unit.unit} - ${unit.plate}`;
      allUnitsThisMonth.add(unitKey);
      let unitTotal = 0;

      unit.deliveries.forEach(d => {
        const val = parseFloat(d.value);
        const [month, day, year] = d.date.split('/').map(Number);
        const date = new Date(year, month - 1, day);
        const dMonth = date.getMonth() + 1;
        const dYear = date.getFullYear();

        if (!isNaN(val)) {
          totalVolume += val;
          unitTotal += val;

          if (val < 400) {
            volUnder400 += val;
            countUnder400++;
          } else {
            volOver400 += val;
            countOver400++;
          }

          uniqueDates.add(d.date);
          dateVolumes[d.date] = (dateVolumes[d.date] || 0) + val;
          fuelVolumes[unit.fuelType] = (fuelVolumes[unit.fuelType] || 0) + val;
        } else {
          const upper = (d.value || '').toUpperCase();
          if (exceptions[upper]) {
            exceptions[upper].push(`${d.date} - Unit ${unitKey}`);
          }
        }
      });

      unitVolumes[unitKey] = unitTotal;
    });

allData.forEach(unit => {
  const unitKey = `${unit.unit} - ${unit.plate}`;
  unit.deliveries.forEach(d => {
    const val = parseFloat(d.value);
    if (!isNaN(val) && d.date) {
      const [month, day, year] = d.date.split('/').map(Number);
      if (!month || !day || !year) return; // skip if malformed
      const date = new Date(year, month - 1, day);
      const dMonth = date.getMonth() + 1;
      const dYear = date.getFullYear();

      if (dMonth === prevMonth && dYear === prevYear) {
        prevMonthTotal += val;
        prevMonthUnits.add(unitKey);
      }
    }
  });
});



    const sortedUnits = Object.entries(unitVolumes).sort((a, b) => b[1] - a[1]);
    const top5 = sortedUnits.slice(0, 5);
    const least5 = sortedUnits.filter(u => u[1] > 0).slice(-5).reverse();
    const highestDate = Object.entries(dateVolumes).sort((a, b) => b[1] - a[1])[0];

    const weekdayMap = {};
    Object.keys(dateVolumes).forEach(date => {
      const day = getWeekday(date);
      weekdayMap[day] = (weekdayMap[day] || 0) + dateVolumes[date];
    });
    const bestWeekday = Object.entries(weekdayMap).sort((a, b) => b[1] - a[1])[0];

    const avgPerFillDay = totalVolume / uniqueDates.size;
    const avgPerVehicle = countUnder400 ? volUnder400 / countUnder400 : null;
    const avgPerBulk = countOver400 ? volOver400 / countOver400 : null;

    const fullWeeks = getFullWeeks([...uniqueDates]);
    const avgPerWeek = fullWeeks.size > 0
      ? [...fullWeeks.values()].reduce((sum, week) => sum + week.size, 0) / fullWeeks.size
      : 0;

    return {
      top5,
      least5,
      highestDate,
      bestWeekday,
      avgPerFillDay,
      avgPerVehicle,
      avgPerBulk,
      exceptions,
      avgPerWeek,
      fuelVolumes,
      totalVolume,
      allUnitsThisMonth,
      prevMonthTotal,
      prevMonthUnits
    };
  }, [fuelData, allData, currentMonth, currentYear]);
  console.log('💡 FINAL prevMonthTotal:', insights.prevMonthTotal);
console.log('📆 FINAL prevMonthUnits:', Array.from(insights.prevMonthUnits));
console.log('🆕 FINAL thisMonthUnits:', Array.from(insights.allUnitsThisMonth));


  const pieData = Object.entries(insights.fuelVolumes).map(([type, vol]) => ({
    name: type.toUpperCase(),
    volume: vol,
    color: getFuelColor(type)
  }));

  const pieLegend = Object.entries(insights.fuelVolumes).map(([type, vol], i) => {
    const percentage = ((vol / insights.totalVolume) * 100).toFixed(1);
    return (
      <View key={i} style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: getFuelColor(type) }]} />
        <Text style={styles.legendLabel}>{`${percentage}% ${type.toUpperCase()}`}</Text>
      </View>
    );
  });

  return (
    <Animated.View style={[styles.pageContainer, { opacity: fadeAnim }]}>  
      <View style={styles.leftColumn}>
        <MaterialCommunityIcons
          name="star-four-points"
          size={24}
          color="#1CA84D"
          style={styles.iconLeft}
        />
        <Text style={[styles.section, styles.sectionOffset1]}>Top 5 Most-Filled Units</Text>
        {insights.top5.map(([unit], i) => <Text key={i}>{i+1}. {unit}</Text>)}

        <Text style={styles.section}>Top 5 Least-Filled Units</Text>
        {insights.least5.map(([unit], i) => <Text key={i}>{i+1}. {unit}</Text>)}

        <Text style={styles.section}>Highest Volume Date</Text>
        <Text>{insights.highestDate?.[0]} - {formatNumber(insights.highestDate?.[1])} L</Text>

        <Text style={styles.section}>Weekday Most Filled</Text>
        <Text>{insights.bestWeekday?.[0]}</Text>

        <Text style={styles.section}>Avg Volume Per Fill Day</Text>
        <Text>{formatNumber(insights.avgPerFillDay)} L</Text>

        <Text style={styles.section}>{'Avg Volume Per Unit'}</Text>
        <Text>{insights.avgPerVehicle ? formatNumber(insights.avgPerVehicle) + ' L' : '—'}</Text>

        {insights.avgPerBulk && (
          <>
            <Text style={styles.section}>{'Avg Volume Per Bulk Tank'}</Text>
            <Text>{formatNumber(insights.avgPerBulk)} L</Text>
          </>
        )}

        <Text style={styles.section}>Avg Deliveries Per Week</Text>
        <Text>{formatNumber(insights.avgPerWeek)}</Text>

<Text style={styles.section}>Delivery Exceptions</Text>
{Object.values(insights.exceptions).flat().length > 0 ? (
  Object.entries(insights.exceptions).map(([key, entries]) =>
    entries.length > 0 && <Text key={key}>{key}: {entries.join(', ')}</Text>
  )
) : (
  <Text>No units identified as MISSED, LOCKED, ABSENT, etc.</Text>
)}

      </View>

      <View style={styles.rightColumn}>
        <MaterialCommunityIcons
          name="star-four-points"
          size={24}
          color="white"
          style={styles.icon}
        />
        <Text style={[styles.section, styles.sectionOffset2, { color: 'white' }]}>Fuel Type Breakdown</Text>
        <View style={styles.pieRow}>
<View style={styles.chartWrapper}>
  <PieChart
    data={pieData}
    width={250}  // wider than 160
    height={250}
    accessor="volume"
    backgroundColor="transparent"
    paddingLeft="50"
    hasLegend={false}
    chartConfig={{
      backgroundColor: '#fff',
      backgroundGradientFrom: '#fff',
      backgroundGradientTo: '#fff',
      decimalPlaces: 1,
      color: () => `#fff`,
      labelColor: () => '#fff',
      propsForLabels: {
        fontSize: 14,
        fontFamily: 'Segoe UI',
        fontWeight: 'bold'
      }
    }}
  />
</View>
<View style={styles.legendContainer}>
  {pieLegend}
</View>
<View style={styles.monthlyInsights}>
  <Text style={[styles.section2, { color: 'white', marginTop: 10 }]}>Month-over-Month</Text>
  {(() => {
    const today = new Date();
    const isCurrentMonth =
      currentMonth === today.getMonth() + 1 &&
      currentYear === today.getFullYear();

    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const currentDay = today.getDate();

    const projectedVolume = isCurrentMonth
      ? (insights.totalVolume / currentDay) * daysInMonth
      : insights.totalVolume;

    const volumeChangePct = ((projectedVolume - insights.prevMonthTotal) / insights.prevMonthTotal) * 100;
    const isPositive = volumeChangePct >= 0;
    const arrow = isPositive ? '↑' : '↓';
    const arrowColor = isPositive ? 'lightgreen' : 'red';

    if (insights.prevMonthTotal > 0) {
      const newUnits = [...insights.allUnitsThisMonth].filter(unit => !insights.prevMonthUnits.has(unit));

      console.log('📅 Days passed:', currentDay, '/', daysInMonth);
      console.log('📊 Projected Volume:', projectedVolume);
      console.log('💡 prevMonthTotal', insights.prevMonthTotal);

      return (
        <>
          <Text style={styles.momentumText}>
            {isCurrentMonth ? 'Projected % Change in Total Volume' : '% Change in Total Volume'}:{' '}
            <Text style={{ color: arrowColor }}>{arrow} {Math.abs(volumeChangePct).toFixed(1)}%</Text>
          </Text>

          <Text style={styles.momentumSub}>
            Last Month ({new Date(currentYear, currentMonth - 2).toLocaleString('en-US', { month: 'long' })}) Volume: {insights.prevMonthTotal.toLocaleString()} L{'\n'}
            This Month: {isCurrentMonth
              ? `${Math.round(projectedVolume).toLocaleString()} L (projected)`
              : `${insights.totalVolume.toLocaleString()} L`}
          </Text>
{/* Gap between summary and new units */}
          <View style={{ height: 10 }} />
          {newUnits.length > 0 ? (
            <>
              <Text style={styles.momentumText}>New Units This Month:</Text>
              {newUnits.map((u, idx) => (
                <Text key={idx} style={styles.momentumSub}>{u}</Text>
              ))}
            </>
          ) : (
            <Text style={styles.momentumText}>No new units added since the previous month.</Text>
          )}
        </>
      );
    } else {
      console.log('💡 FINAL prevMonthTotal:', insights.prevMonthTotal);
      console.log('📆 FINAL prevMonthUnits:', Array.from(insights.prevMonthUnits));
      console.log('🆕 FINAL thisMonthUnits:', Array.from(insights.allUnitsThisMonth));
      return (
        <Text style={styles.momentumText}>
          No data from the previous month - check back next month!
        </Text>
      );
    }
  })()}
</View>






        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 32,
    marginHorizontal: 12,
    justifyContent: 'space-between'
  },
  leftColumn: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f4f4f4',
    borderRadius: 20,
    position: 'relative'
  },
  rightColumn: {
    flex: 1,
    backgroundColor: '#1CA84D',
    borderRadius: 40,
    padding: 20,
    marginLeft: 16,
    position: 'relative'
  },
  section: {
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 20,
    fontFamily: 'Segoe UI'
  },
    section2: {
    fontWeight: 'bold',
    fontSize: 26,
    marginTop: 20,
    fontFamily: 'Segoe UI'
  },
  sectionOffset1: {
    marginTop: 48
  },
  sectionOffset2: {
    marginTop: 43
  },
  icon: {
    position: 'absolute',
    top: 16,
    left: 16
  },
  iconLeft: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 1
  },
  pieRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 16
  },
  chartWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 200, // match chart width to center properly
    alignSelf: 'center' // extra safeguard for centering
  },
  legendContainer: {
    paddingLeft: 16,
    flexShrink: 1,
    flexWrap: 'wrap',
    maxWidth: 160
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8
  },
  legendLabel: {
    fontSize: 18,
    fontFamily: 'Segoe UI',
    color: 'white',
    flexShrink: 1
  },
  monthlyInsights: {
  backgroundColor: '#144d3d',
  padding: 15,
  borderRadius: 15,
  marginTop: 10,
  marginBottom: 10,
  marginLeft: 6,
  marginRight: 6,
  alignItems: 'center' // ✅ This aligns children horizontally to center
},

  momentumText: {
    color: 'white',
    fontFamily: 'Segoe UI',
    fontSize: 22,
    marginTop: 8,
	alignItems: 'center'
  },
  momentumSub: {
    color: 'white',
    fontFamily: 'Segoe UI',
    fontSize: 18,
    marginLeft: 12,
    flexWrap: 'wrap',
	alignItems: 'center'
  }
});
