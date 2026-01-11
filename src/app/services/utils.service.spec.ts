import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UtilsService } from './utils.service';

describe('UtilsService', () => {
  let service: UtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UtilsService],
    });
    service = TestBed.inject(UtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getRandomIndex', () => {
    it('should return a number within the range [0, max])', () => {
      const max = 10;
      const index = service.getRandomIndex(max);

      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(max);
    });

    it('should return an integer', () => {
      const index = service.getRandomIndex(5);

      expect(Number.isInteger(index)).toBe(true);
    });

    it('should return a deterministic value when Math.random is mocked', () => {
      // Mock Math.random to return 0.5
      const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5);
      const max = 10;

      // Math.floor(0.5 * 10) should be 5
      expect(service.getRandomIndex(max)).toBe(5);

      randomSpy.mockRestore();
    });
  });
});
