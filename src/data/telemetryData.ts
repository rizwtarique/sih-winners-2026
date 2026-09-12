import { Hive, TelemetryPoint, TelemetryDateRange } from '../types';

/**
 * Generates realistic telemetry records for a hive based on selected date range:
 * - '24h': 24 hourly data points showing diurnal fluctuation
 * - '7d': 7 daily aggregated data points over the past week
 * - '30d': 30 daily data points showing monthly colony progression & nectar accumulation
 */
export function generateTelemetryForRange(
  hive: Hive,
  range: TelemetryDateRange = '24h'
): TelemetryPoint[] {
  const points: TelemetryPoint[] = [];
  const now = new Date();

  // Characteristic profiles based on hive ID and health state
  const isHeatStressHive = hive.id === 'hive-02';
  const isTemperateHive = hive.id === 'hive-03';

  if (range === '24h') {
    for (let i = 23; i >= 0; i--) {
      const pointDate = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hour = pointDate.getHours();
      const isNow = i === 0;

      // Format hour display: e.g. "04:00", "14:00", or "Now"
      const timeLabel = isNow
        ? 'Now'
        : `${hour.toString().padStart(2, '0')}:00`;

      const monthName = pointDate.toLocaleString('en-US', { month: 'short' });
      const dayNum = pointDate.getDate();
      const fullLabel = isNow
        ? `Today (${monthName} ${dayNum}, Live)`
        : `${monthName} ${dayNum}, ${hour.toString().padStart(2, '0')}:00`;

      // Ambient diurnal temperature cycle (coolest at 05:00, hottest at 14:00)
      const solarFactor = Math.sin(((hour - 8) / 24) * 2 * Math.PI);
      const ambientTemp = Number((30 + solarFactor * 8).toFixed(1));

      let temp: number;
      let humidity: number;
      let weight: number;
      let sound: number;
      let isThermalSpike = false;
      let isHumidityAlert = false;

      if (isHeatStressHive) {
        // Hive-02: Suffers afternoon thermal runaway (12:00 - 16:00)
        if (hour >= 11 && hour <= 17) {
          temp = Number((35.8 + (hour === 14 || hour === 15 ? 2.0 : 1.2) + Math.sin(hour) * 0.2).toFixed(1));
          humidity = Number((66.0 + (hour === 14 ? 3.4 : 2.0)).toFixed(1));
          sound = Number((55.0 + Math.random() * 5).toFixed(0));
          isThermalSpike = true;
          isHumidityAlert = true;
        } else if (hour >= 18 && hour <= 21) {
          temp = Number((36.2 - (hour - 18) * 0.3).toFixed(1));
          humidity = Number((64.0 - (hour - 18) * 0.5).toFixed(1));
          sound = 48;
        } else {
          temp = Number((33.8 + Math.sin(hour) * 0.6).toFixed(1));
          humidity = Number((62.0 + Math.cos(hour) * 2.0).toFixed(1));
          sound = 42;
        }
        weight = Number((41.8 - (23 - i) * 0.025).toFixed(1));
      } else if (isTemperateHive) {
        // Hive-03: Nashik - Tightest homeostasis (33.2°C - 34.4°C)
        temp = Number((33.5 + Math.sin((hour / 24) * 2 * Math.PI) * 0.6).toFixed(1));
        humidity = Number((54.5 + Math.cos((hour / 24) * 2 * Math.PI) * 2.5).toFixed(1));
        weight = Number((51.6 + ((23 - i) / 23) * 0.8).toFixed(1));
        sound = 38;
      } else {
        // Hive-01: Bhilwara - Healthy colony with gentle diurnal ripple
        temp = Number((34.2 + Math.sin(((hour - 6) / 24) * 2 * Math.PI) * 0.8).toFixed(1));
        humidity = Number((58.0 - Math.sin(((hour - 6) / 24) * 2 * Math.PI) * 3.5).toFixed(1));
        weight = Number((46.2 + ((23 - i) / 23) * 0.6).toFixed(1));
        sound = 42;
      }

      // Sync latest point with live reading
      if (isNow && hive.currentReading) {
        temp = hive.currentReading.temperature;
        humidity = hive.currentReading.humidity;
        weight = hive.currentReading.weightKg;
        sound = hive.currentReading.soundDb;
        isThermalSpike = temp > 36.5;
        isHumidityAlert = humidity > 68.0 || humidity < 48.0;
      }

      points.push({
        time: timeLabel,
        hour,
        fullLabel,
        temperature: temp,
        humidity,
        weightKg: weight,
        soundDb: sound,
        ambientTemp,
        isThermalSpike,
        isHumidityAlert,
      });
    }

    return points;
  }

  if (range === '7d') {
    // 7 days of daily records (past 6 days + today)
    for (let i = 6; i >= 0; i--) {
      const pointDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const isToday = i === 0;
      const dayOfWeek = pointDate.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = pointDate.getDate().toString().padStart(2, '0');
      const monthName = pointDate.toLocaleDateString('en-US', { month: 'short' });
      
      const timeLabel = isToday ? 'Today' : `${dayOfWeek} ${dayNum}`;
      const fullLabel = isToday ? `Today (${dayOfWeek}, ${monthName} ${dayNum})` : `${dayOfWeek}, ${monthName} ${dayNum}, 2026`;

      let temp: number;
      let humidity: number;
      let weight: number;
      let ambient: number;
      let isThermalSpike = false;
      let isHumidityAlert = false;

      // Ambient temperature baseline over the week
      const dayWeatherOffset = Math.sin(i * 0.9) * 2.2;
      ambient = Number((34.5 + dayWeatherOffset).toFixed(1));

      if (isHeatStressHive) {
        // Days -3, -2, -1 were peak hot days in Pushkar apiary
        const heatWaveSeverity = i >= 1 && i <= 4 ? 2.5 : 0.8;
        temp = Number((34.8 + heatWaveSeverity + (i === 2 ? 0.6 : 0)).toFixed(1));
        humidity = Number((63.0 + (i <= 3 ? 4.5 : 1.0)).toFixed(1));
        weight = Number((41.2 + (6 - i) * 0.08).toFixed(1));
        isThermalSpike = temp > 36.5;
        isHumidityAlert = humidity > 68.0;
      } else if (isTemperateHive) {
        // High steady nectar accumulation (+0.4kg/day), calm thermoregulation
        temp = Number((33.7 + Math.sin(i) * 0.3).toFixed(1));
        humidity = Number((54.0 + Math.cos(i) * 1.5).toFixed(1));
        weight = Number((50.1 + (6 - i) * 0.38).toFixed(1));
      } else {
        // Bhilwara: healthy steady gain (+0.25kg/day), 34.3°C homeostatic average
        temp = Number((34.3 + Math.sin(i * 0.5) * 0.4).toFixed(1));
        humidity = Number((57.5 + Math.cos(i * 0.7) * 2.0).toFixed(1));
        weight = Number((44.7 + (6 - i) * 0.25).toFixed(1));
      }

      // On the current day, anchor to current live reading
      if (isToday && hive.currentReading) {
        temp = hive.currentReading.temperature;
        humidity = hive.currentReading.humidity;
        weight = hive.currentReading.weightKg;
        isThermalSpike = temp > 36.5;
        isHumidityAlert = humidity > 68.0 || humidity < 48.0;
      }

      points.push({
        time: timeLabel,
        fullLabel,
        date: pointDate.toISOString().split('T')[0],
        temperature: temp,
        humidity,
        weightKg: weight,
        soundDb: isHeatStressHive ? 52 : 40,
        ambientTemp: ambient,
        isThermalSpike,
        isHumidityAlert,
      });
    }

    return points;
  }

  // range === '30d' (30 daily data points)
  for (let i = 29; i >= 0; i--) {
    const pointDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const isToday = i === 0;
    const dayNum = pointDate.getDate().toString().padStart(2, '0');
    const monthName = pointDate.toLocaleDateString('en-US', { month: 'short' });
    
    // Clean label e.g. "Aug 14" or "Sep 02"
    const timeLabel = isToday ? 'Today' : `${monthName} ${dayNum}`;
    const fullLabel = isToday ? `Today (${monthName} ${dayNum})` : `${monthName} ${dayNum}, 2026`;

    let temp: number;
    let humidity: number;
    let weight: number;
    let ambient: number;
    let isThermalSpike = false;
    let isHumidityAlert = false;

    // Monthly ambient weather cycle
    ambient = Number((33.0 + Math.sin(i * 0.25) * 3.5).toFixed(1));

    if (isHeatStressHive) {
      // Days 20-28 had rising temperatures in Rajasthan, leading to heat stress onset
      const heatWaveOnset = i <= 8 ? 2.2 : (i <= 14 ? 1.4 : 0.4);
      temp = Number((34.2 + heatWaveOnset + Math.sin(i) * 0.4).toFixed(1));
      humidity = Number((59.0 + (i <= 10 ? 6.5 : 2.0)).toFixed(1));
      weight = Number((39.8 + (29 - i) * 0.07).toFixed(1)); // sluggish weight gain due to fanning metabolic cost
      isThermalSpike = temp > 36.5;
      isHumidityAlert = humidity > 68.0;
    } else if (isTemperateHive) {
      // Steady monsoon floral nectar inflow (Nashik)
      temp = Number((33.6 + Math.sin(i * 0.2) * 0.5).toFixed(1));
      humidity = Number((53.5 + Math.cos(i * 0.3) * 2.2).toFixed(1));
      weight = Number((43.5 + (29 - i) * 0.31).toFixed(1)); // strong honey accumulation from 43.5kg to 52.4kg
    } else {
      // Bhilwara: healthy steady progression
      temp = Number((34.1 + Math.sin(i * 0.15) * 0.4).toFixed(1));
      humidity = Number((56.8 + Math.cos(i * 0.2) * 2.5).toFixed(1));
      weight = Number((41.0 + (29 - i) * 0.18).toFixed(1)); // from 41.0kg to 46.2kg
    }

    if (isToday && hive.currentReading) {
      temp = hive.currentReading.temperature;
      humidity = hive.currentReading.humidity;
      weight = hive.currentReading.weightKg;
      isThermalSpike = temp > 36.5;
      isHumidityAlert = humidity > 68.0 || humidity < 48.0;
    }

    points.push({
      time: timeLabel,
      fullLabel,
      date: pointDate.toISOString().split('T')[0],
      temperature: temp,
      humidity,
      weightKg: weight,
      soundDb: isHeatStressHive ? 50 : 39,
      ambientTemp: ambient,
      isThermalSpike,
      isHumidityAlert,
    });
  }

  return points;
}

/**
 * Backward compatible alias for 24-hour telemetry
 */
export function generate24HourTelemetry(hive: Hive): TelemetryPoint[] {
  return generateTelemetryForRange(hive, '24h');
}

/**
 * Computes descriptive statistical summary for readings across any date range
 */
export function computeTelemetryStats(data: TelemetryPoint[]) {
  if (!data || data.length === 0) {
    return {
      minTemp: 0,
      maxTemp: 0,
      avgTemp: 0,
      tempDelta: 0,
      minHumidity: 0,
      maxHumidity: 0,
      avgHumidity: 0,
      humidityDelta: 0,
      optimalTempPct: 0,
      thermalSpikeCount: 0,
      humidityAlertCount: 0,
      startWeight: 0,
      endWeight: 0,
      weightDelta: 0,
    };
  }

  const temps = data.map((d) => d.temperature);
  const humidities = data.map((d) => d.humidity);
  const weights = data.map((d) => d.weightKg);

  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const avgTemp = Number((temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1));
  const tempDelta = Number((maxTemp - minTemp).toFixed(1));

  const minHumidity = Math.min(...humidities);
  const maxHumidity = Math.max(...humidities);
  const avgHumidity = Number((humidities.reduce((a, b) => a + b, 0) / humidities.length).toFixed(1));
  const humidityDelta = Number((maxHumidity - minHumidity).toFixed(1));

  // Optimal brood temperature is 32.0°C to 36.0°C (Apis mellifera standard)
  const inOptimalCount = temps.filter((t) => t >= 32.0 && t <= 36.0).length;
  const optimalTempPct = Math.round((inOptimalCount / temps.length) * 100);

  const thermalSpikeCount = data.filter((d) => d.isThermalSpike).length;
  const humidityAlertCount = data.filter((d) => d.isHumidityAlert).length;

  const startWeight = weights[0] || 0;
  const endWeight = weights[weights.length - 1] || 0;
  const weightDelta = Number((endWeight - startWeight).toFixed(1));

  return {
    minTemp,
    maxTemp,
    avgTemp,
    tempDelta,
    minHumidity,
    maxHumidity,
    avgHumidity,
    humidityDelta,
    optimalTempPct,
    thermalSpikeCount,
    humidityAlertCount,
    startWeight,
    endWeight,
    weightDelta,
  };
}
