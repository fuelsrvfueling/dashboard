import React, { useState, useEffect } from 'react';
import { ScrollView, View, Dimensions, Platform, TouchableOpacity, Text, Switch, Animated } from 'react-native';

const {
  VictoryChart,
  VictoryLine,
  VictoryScatter,
  VictoryAxis,
  VictoryLegend,
  VictoryTheme,
  VictoryTooltip,
  VictoryVoronoiContainer,
} = Platform.OS === 'web' ? require('victory') : require('victory-native');

const colorMap = {
  'CLEAR GASOLINE': 'green',
  'DYED GASOLINE': 'lightgreen',
  'CLEAR DIESEL': 'darkorange',
  'DYED DIESEL': 'coral',
  'DEF': 'blue',
  TOTAL: 'black',
};

const formatLabel = (label) => {
  if (label === 'DEF') return 'DEF';
  return label
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const toISODate = (mdy) => {
  if (!mdy || typeof mdy !== 'string') return null;
  const [month, day, year] = mdy.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

const normalizeDate = (rawDate) => {
  if (!rawDate) return null;
  if (rawDate instanceof Date && !isNaN(rawDate)) return rawDate;
  if (typeof rawDate === 'string') {
    const iso = toISODate(rawDate);
    return new Date(iso + 'T00:00:00Z');
  }
  return null;
};

export default function FuelDeliveryChart({ chartData, fullChartData, selectedMonth, selectedYear }) {
  const fuelTypes = ['TOTAL', 'CLEAR GASOLINE', 'DYED GASOLINE', 'CLEAR DIESEL', 'DYED DIESEL', 'DEF'];
  const screenWidth = Dimensions.get('window').width;
  const [showMovingAvg, setShowMovingAvg] = useState(true);
  const [interpolationType, setInterpolationType] = useState('catmullRom');
  const [viewAllDates, setViewAllDates] = useState(false);

  const filteredChartData = viewAllDates ? fullChartData : chartData;
	// Build a lookup table of unit count per date for visible fuel types

  const allYValues = fuelTypes.flatMap((type) =>
    filteredChartData.map((d) => d[type] ?? 0)
  );
  const maxY = Math.max(...allYValues);
  const yMax = Math.ceil(maxY * 1.15);

  const xTickValues = filteredChartData
    .map((d) => normalizeDate(d.date))
    .filter((x) => x && !isNaN(x));

  const visibleTypes = fuelTypes.filter((type) =>
    filteredChartData.some((d) => d[type] !== undefined && d[type] !== null && !isNaN(d[type]) && d[type] > 0)
  );
const unitCountByDate = {};

filteredChartData.forEach((entry) => {
  const date = normalizeDate(entry.date)?.toISOString();
  if (!date) return;

  fuelTypes.forEach((type) => {
    const value = entry[type];
    if (value !== undefined && value !== null && !isNaN(value) && value > 0) {
      if (!unitCountByDate[date]) unitCountByDate[date] = {};
      if (!unitCountByDate[date][type]) unitCountByDate[date][type] = 0;
      unitCountByDate[date][type] += 1;
    }
  });
});

  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start();
  }, []);

  const movingAverages = {};
  if (showMovingAvg) {
    visibleTypes.forEach((type) => {
      const dataPoints = filteredChartData
        .map((d) => ({ x: normalizeDate(d.date), y: d[type] ?? 0 }))
        .filter((point) => point.x && !isNaN(point.x) && point.y > 0);

      const avgData = [];
      for (let i = 0; i < dataPoints.length; i++) {
        if (i < 6) continue;
        const slice = dataPoints.slice(i - 6, i + 1);
        const avg = slice.reduce((sum, pt) => sum + pt.y, 0) / 7;
        avgData.push({ x: dataPoints[i].x, y: avg });
      }
      movingAverages[type] = avgData;
    });
  }

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 100,
          minHeight: 700,
        }}
      >
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ marginRight: 8, fontSize: 14, fontWeight: '500' }}>View all Months and Years</Text>
            <Switch value={viewAllDates} onValueChange={setViewAllDates} />
          </View>
<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
  <Text style={{ marginRight: 8, fontSize: 14, fontWeight: '500' }}>7-Day Moving Average</Text>
  <Switch
    value={showMovingAvg}
    onValueChange={setShowMovingAvg}
    trackColor={{ false: '#767577', true: '#81b0ff' }}
    thumbColor={showMovingAvg ? '#2e7d32' : '#f4f3f4'}
  />
</View>

          <View style={{
            flexDirection: 'row',
            borderRadius: 8,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: '#ccc'
          }}>
            {['linear', 'catmullRom', 'monotoneX'].map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => setInterpolationType(type)}
                style={{
                  backgroundColor: interpolationType === type ? '#2e7d32' : 'white',
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderRightWidth: type !== 'monotoneX' ? 1 : 0,
                  borderRightColor: '#ccc',
                }}
              >
                <Text style={{
                  color: interpolationType === type ? 'white' : '#333',
                  fontSize: 14,
                  fontWeight: '600',
                  fontFamily: 'Segoe UI',
                }}>
                  {type === 'catmullRom' ? 'Smooth Corners' : type === 'monotoneX' ? 'Fully Smoothed' : 'Linear'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ width: '100%' }}>
          {visibleTypes.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 100 }}>
              <Text style={{ fontSize: 16, fontFamily: 'Segoe UI', color: '#666' }}>
                No Data For This Fuel Type and Period
              </Text>
            </View>
          ) : (
            <>
              <VictoryChart
                theme={VictoryTheme.material}
                width={screenWidth - 40}
                height={550}
                domain={{ y: [0, yMax] }}
                domainPadding={{ x: [40, 40] }}
                padding={{ left: 90, right: 40, top: 40, bottom: 60 }}
                containerComponent={<VictoryVoronoiContainer />}
              >
                <VictoryAxis
                  scale="time"
                  fixLabelOverlap
                  tickValues={xTickValues}
                  tickFormat={(d) => {
                    const date = new Date(d);
                    return isNaN(date) ? '' : `${date.getUTCMonth() + 1}/${date.getUTCDate()}`;
                  }}
                  style={{
                    tickLabels: {
                      angle: -30,
                      fontSize: 16,
                      padding: 12,
                      fontFamily: 'Segoe UI',
                    },
                  }}
                />
                <VictoryAxis
                  dependentAxis
                  tickFormat={(x) => `${x}`}
                  style={{
                    tickLabels: { fontSize: 16, fontFamily: 'Segoe UI' },
                    axisLabel: { fontSize: 18, padding: 60, fontFamily: 'Segoe UI' },
                  }}
                  label="Volume (L)"
                />

                {visibleTypes.flatMap((type) => {
                  const dataPoints = filteredChartData
                    .map((d) => ({ x: normalizeDate(d.date), y: d[type] ?? 0 }))
                    .filter((point) => point.x && !isNaN(point.x) && point.y > 0);

                  return [
                    <VictoryLine
                      key={`${type}-line`}
                      interpolation={interpolationType}
                      data={dataPoints}
                      style={{
                        data: {
                          stroke: colorMap[type],
                          strokeWidth: type === 'TOTAL' ? 6 : 5,
                        },
                      }}
labels={({ datum }) => {
  const isoDate = datum.x?.toISOString?.();
  const dateEntry = filteredChartData.find(d => normalizeDate(d.date)?.toISOString() === datum.x?.toISOString?.());
const unitCount = dateEntry?.unitCounts?.[type] || 0;

  const avgPerUnit = unitCount > 0 ? (datum.y / unitCount).toFixed(2) : 'N/A';
  return `${formatLabel(type)}: ${datum.y.toFixed(2)} L\nUnits: ${unitCount}\nAvg/Unit: ${avgPerUnit} L`;

}}


                      labelComponent={
                        <VictoryTooltip
  style={{ fontSize: 16, fontWeight: 'bold', fontFamily: 'Segoe UI' }}
  flyoutStyle={{
  fill: '#fff',
  stroke: '#333',
  strokeWidth: 1,
  padding: 12, // or increase to 16 if needed
}}


                          constrainToVisibleArea
                        />
                      }
                    />,
                    <VictoryScatter
                      key={`${type}-scatter`}
                      data={dataPoints}
                      size={12}
                      style={{
                        data: {
                          fill: colorMap[type],
                        },
                      }}
                      symbol="triangleUp"
                    />,
                    showMovingAvg && movingAverages[type] && (
                      <VictoryLine
                        key={`${type}-movingAvg`}
                        data={movingAverages[type]}
                        interpolation="monotoneX"
                        style={{
                          data: {
                            stroke: 'black',
                            strokeWidth: 3,
                            strokeDasharray: '5,5',
                          },
                        }}
                        labels={({ datum }) => `7DMA (${formatLabel(type)}): ${datum.y.toFixed(1)}`}
                        labelComponent={
                          <VictoryTooltip
  style={{ fontSize: 16, fontWeight: 'bold', fontFamily: 'Segoe UI' }}
  flyoutStyle={{
  fill: '#fff',
  stroke: '#333',
  strokeWidth: 1,
  padding: 12, // or increase to 16 if needed
}}


                            constrainToVisibleArea
                          />
                        }
                      />
                    )
                  ];
                })}
              </VictoryChart>

              <View style={{ alignItems: 'center', width: '100%', marginTop: 10 }}>
                <VictoryLegend
                  orientation="horizontal"
                  gutter={16}
                  style={{
                    labels: {
                      fontSize: 8,
                      fontWeight: '400',
                      fill: '#333',
                      padding: 4,
                    },
                    data: {
                      symbol: {
                        type: 'circle',
                        size: 3,
                      },
                    },
                  }}
                  data={visibleTypes.map((type) => ({
                    name: formatLabel(type),
                    symbol: {
                      fill: colorMap[type],
                      type: 'circle',
                      size: 3,
                    },
                  }))}
                />
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </Animated.View>
  );
}
