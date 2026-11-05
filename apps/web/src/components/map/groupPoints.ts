/** Anything with a position. */
export interface Positioned {
  lat: number;
  lng: number;
}

export interface PointGroup<T extends Positioned> {
  lat: number;
  lng: number;
  points: T[];
}

/**
 * Groups points that sit at the same place, so a kitchen with three listings shows one pin with a
 * count instead of three pins stacked out of sight. Four decimal places is about 11 metres,
 * close enough to count as the same address. Groups keep the order points first appear in.
 */
export function groupByPosition<T extends Positioned>(points: T[], decimals = 4): PointGroup<T>[] {
  const groups = new Map<string, PointGroup<T>>();
  for (const point of points) {
    const key = `${point.lat.toFixed(decimals)},${point.lng.toFixed(decimals)}`;
    const group = groups.get(key);
    if (group) group.points.push(point);
    else groups.set(key, { lat: point.lat, lng: point.lng, points: [point] });
  }
  return [...groups.values()];
}
