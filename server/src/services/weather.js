export async function getWeather(lat = 40.7128, lon = -74.006) {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.search = new URLSearchParams({ latitude: lat, longitude: lon, current: 'temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m', daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max', timezone: 'auto', forecast_days: '2' })
  const response = await fetch(url)
  if (!response.ok) throw new Error('Weather service unavailable')
  return response.json()
}
