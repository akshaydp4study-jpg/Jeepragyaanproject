import { describe, expect, it } from 'vitest';
import appThemesData from '../data/appThemes.json';

describe('theme registry data', () => {
  it('has unique theme ids including original racing themes', () => {
    const ids = appThemesData.themes.map((theme) => theme.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual(expect.arrayContaining([
      'verstappen-rb1',
      'scuderia-red',
      'silver-arrow',
      'papaya-racing',
      'british-racing-green',
      'retro-grand-prix',
      'neon-night-race',
    ]));
  });
});
