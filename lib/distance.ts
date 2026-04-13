export async function geocode(
  place: string
): Promise<{ lat: number; lon: number } | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}&limit=1`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "ChauffeurBookingApp/1.0" },
    });
    const data = await res.json();
    if (data.length === 0) return null;
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

export async function getDistance(
  from: string,
  to: string
): Promise<number | null> {
  const fromCoords = await geocode(from);
  const toCoords = await geocode(to);

  if (!fromCoords || !toCoords) return null;

  const url = `https://router.project-osrm.org/route/v1/driving/${fromCoords.lon},${fromCoords.lat};${toCoords.lon},${toCoords.lat}?overview=false`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.code !== "Ok" || !data.routes?.length) return null;
    return Math.round(data.routes[0].distance / 1000);
  } catch {
    return null;
  }
}
