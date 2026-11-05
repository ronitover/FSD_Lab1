import { describe, expect, it } from 'vitest';
import { groupByPosition } from '../src/components/map/groupPoints.ts';

describe('groupByPosition', () => {
  it('puts points at the same address in one group', () => {
    const groups = groupByPosition([
      { id: 'a', lat: 12.97161, lng: 77.59461 },
      { id: 'b', lat: 12.97162, lng: 77.59459 },
      { id: 'c', lat: 12.9352, lng: 77.6245 },
    ]);
    expect(groups.map((group) => group.points.map((point) => point.id))).toEqual([
      ['a', 'b'],
      ['c'],
    ]);
  });

  it('keeps points a street apart separate', () => {
    const groups = groupByPosition([
      { id: 'a', lat: 12.9716, lng: 77.5946 },
      { id: 'b', lat: 12.9726, lng: 77.5946 },
    ]);
    expect(groups).toHaveLength(2);
  });

  it('returns nothing for no points', () => {
    expect(groupByPosition([])).toEqual([]);
  });
});
