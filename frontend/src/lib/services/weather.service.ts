export interface WeatherData {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  forecast: { day: string; high: number; low: number; description: string; icon: string }[];
}

export async function getWeatherData(_lat: number, _lon: number): Promise<WeatherData> {
  await new Promise((r) => setTimeout(r, 400));
  return {
    temp: -2, feelsLike: -8, humidity: 65, windSpeed: 12,
    description: 'Light Snow', icon: '13d',
    forecast: [
      { day: 'Today',    high: 2,  low: -8,  description: 'Light Snow',    icon: '13d' },
      { day: 'Tomorrow', high: 5,  low: -5,  description: 'Partly Cloudy', icon: '02d' },
      { day: 'Day 3',    high: 8,  low: -2,  description: 'Clear Sky',     icon: '01d' },
      { day: 'Day 4',    high: 4,  low: -6,  description: 'Overcast',      icon: '04d' },
      { day: 'Day 5',    high: -1, low: -12, description: 'Heavy Snow',    icon: '13d' },
    ],
  };
}

export function getWeatherEmoji(description: string): string {
  const d = description.toLowerCase();
  if (d.includes('snow'))    return '❄️';
  if (d.includes('rain'))    return '🌧️';
  if (d.includes('cloud'))   return '☁️';
  if (d.includes('clear'))   return '☀️';
  if (d.includes('thunder')) return '⛈️';
  if (d.includes('mist'))    return '🌫️';
  return '🌤️';
}
