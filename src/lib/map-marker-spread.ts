/** Pixel gap between markers that share the same coordinates. */
const MARKER_GAP_PX = 24;

/** Supercluster radius (px); spread stays below this so colocated points still cluster when zoomed out. */
const CLUSTER_RADIUS_PX = 56;

function degreesPerPixelLat(zoom: number): number {
  return 360 / (256 * 2 ** zoom);
}

function degreesPerPixelLng(lat: number, zoom: number): number {
  const latRad = (lat * Math.PI) / 180;
  const cosLat = Math.cos(latRad);
  if (cosLat < 1e-6) return degreesPerPixelLat(zoom);
  return degreesPerPixelLat(zoom) / cosLat;
}

function pixelsToDegreesLat(zoom: number, pixels: number): number {
  return pixels * degreesPerPixelLat(zoom);
}

function pixelsToDegreesLng(lat: number, zoom: number, pixels: number): number {
  return pixels * degreesPerPixelLng(lat, zoom);
}

export function coordKey(longitude: number, latitude: number, precision = 5): string {
  return `${longitude.toFixed(precision)},${latitude.toFixed(precision)}`;
}

type Locatable = {
  id: string;
  longitude: number;
  latitude: number;
};

/** Spread markers that share coordinates so each stays clickable at high zoom. */
export function spreadColocatedCoordinates(
  items: Locatable[],
  zoom: number,
): Map<string, { longitude: number; latitude: number }> {
  const groups = new Map<string, Locatable[]>();

  for (const item of items) {
    const key = coordKey(item.longitude, item.latitude);
    const group = groups.get(key) ?? [];
    group.push(item);
    groups.set(key, group);
  }

  const positions = new Map<string, { longitude: number; latitude: number }>();

  for (const group of groups.values()) {
    if (group.length === 1) {
      const only = group[0];
      positions.set(only.id, {
        longitude: only.longitude,
        latitude: only.latitude,
      });
      continue;
    }

    const centerLng = group[0].longitude;
    const centerLat = group[0].latitude;

    const gapLat = pixelsToDegreesLat(zoom, MARKER_GAP_PX);
    const gapLng = pixelsToDegreesLng(centerLat, zoom, MARKER_GAP_PX);
    const capLat = pixelsToDegreesLat(zoom, CLUSTER_RADIUS_PX * 0.42);
    const capLng = pixelsToDegreesLng(centerLat, zoom, CLUSTER_RADIUS_PX * 0.42);

    const latRadius = Math.min(gapLat, capLat);
    const lngRadius = Math.min(gapLng, capLng);

    group.forEach((item, index) => {
      const angle = (2 * Math.PI * index) / group.length - Math.PI / 2;
      positions.set(item.id, {
        latitude: centerLat + latRadius * Math.sin(angle),
        longitude: centerLng + lngRadius * Math.cos(angle),
      });
    });
  }

  return positions;
}
