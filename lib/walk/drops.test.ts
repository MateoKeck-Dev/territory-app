import { dropCountForSummary, rollDropsForWalk } from './drops';
import { WALK_CONFIG } from './config';

describe('dropCountForSummary', () => {
  it('gives nothing under the minimum', () => {
    expect(dropCountForSummary({ activeMinutes: 0 })).toBe(0);
    expect(dropCountForSummary({ activeMinutes: 4 })).toBe(0);
  });

  it('gives exactly one drop right at the minimum', () => {
    expect(dropCountForSummary({ activeMinutes: 5 })).toBe(1);
  });

  it('still gives one drop just under the next bonus threshold', () => {
    expect(dropCountForSummary({ activeMinutes: 14 })).toBe(1);
  });

  it('gives a bonus drop every configured interval past the minimum', () => {
    expect(dropCountForSummary({ activeMinutes: 15 })).toBe(2);
    expect(dropCountForSummary({ activeMinutes: 24 })).toBe(2);
    expect(dropCountForSummary({ activeMinutes: 25 })).toBe(3);
    expect(dropCountForSummary({ activeMinutes: 65 })).toBe(7);
  });

  it('respects a custom config', () => {
    const config = { ...WALK_CONFIG, minActiveMinutesForFirstDrop: 10, activeMinutesPerBonusDrop: 20 };
    expect(dropCountForSummary({ activeMinutes: 9 }, config)).toBe(0);
    expect(dropCountForSummary({ activeMinutes: 10 }, config)).toBe(1);
    expect(dropCountForSummary({ activeMinutes: 30 }, config)).toBe(2);
  });
});

describe('rollDropsForWalk', () => {
  it('rolls exactly as many items as the count formula says', () => {
    expect(rollDropsForWalk({ activeMinutes: 3 })).toHaveLength(0);
    expect(rollDropsForWalk({ activeMinutes: 5 })).toHaveLength(1);
    expect(rollDropsForWalk({ activeMinutes: 25 })).toHaveLength(3);
  });

  it('gives every rolled item a unique id', () => {
    const drops = rollDropsForWalk({ activeMinutes: 65 });
    const ids = new Set(drops.map((d) => d.id));
    expect(ids.size).toBe(drops.length);
  });
});
