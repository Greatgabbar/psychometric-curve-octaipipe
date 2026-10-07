import { describe, expect, it } from 'vitest';
import { createScales } from './scales';

describe('createScales', () => {
  const scales = createScales(500, 400);

  it('maps the temperature range onto the full width', () => {
    expect(scales.x(15)).toBe(0);
    expect(scales.x(40)).toBe(500);
    expect(scales.x(27.5)).toBe(250);
  });

  it('flips the y axis because SVG y grows downward', () => {
    expect(scales.y(0)).toBe(400); // bottom
    expect(scales.y(20)).toBe(0); // top
  });
});
