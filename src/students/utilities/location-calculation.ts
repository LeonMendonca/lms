export function isWithin30Meters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): boolean {
    console.log(lat1, lon1, lat2, lon2)
  const R = 6371e3; // Earth's radius in meters
  const toRadians = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in meters

  return distance <= 30; // Returns true if within 30 meters
}
