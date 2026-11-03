const calculateFare = (
  distanceKm,
  durationMinutes,
  surgeMultiplier = 1
) => {
  const baseFare =
    Number(process.env.BASE_FARE) || 50;

  const perKm =
    Number(process.env.PER_KM_RATE) || 12;

  const perMinute =
    Number(process.env.PER_MINUTE_RATE) || 2;

  const normalFare =
    baseFare +
    distanceKm * perKm +
    durationMinutes * perMinute;

  return Math.round(normalFare * surgeMultiplier);
};

const getSurgeMultiplier = () => {
  const hour = new Date().getHours();

  // Example peak hours
  if (
    (hour >= 8 && hour <= 10) ||
    (hour >= 17 && hour <= 20)
  ) {
    return 1.5;
  }

  return 1;
};

module.exports = {
  calculateFare,
  getSurgeMultiplier
};