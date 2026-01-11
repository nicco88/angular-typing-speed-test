import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { resultGuard } from './result.guard';

describe('resultGuard', () => {
  let routerSpy: { navigateByUrl: Mock; currentNavigation: Mock };

  beforeEach(() => {
    routerSpy = {
      navigateByUrl: vi.fn(),
      currentNavigation: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: routerSpy }],
    });
  });

  const executeGuard = () => TestBed.runInInjectionContext(() => resultGuard({} as any, {} as any));

  it('should allow activation when finished state is present', () => {
    routerSpy.currentNavigation.mockReturnValue({
      extras: { state: { finished: true } },
    });

    const result = executeGuard();

    expect(result).toBe(true);
    expect(routerSpy.navigateByUrl).not.toHaveBeenCalled();
  });

  it('should redirect to root and deny activation when finished state is missing', () => {
    routerSpy.currentNavigation.mockReturnValue({
      extras: { state: {} },
    });

    const result = executeGuard();

    expect(result).toBe(false);
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('should redirect to root and deny activation when currentNavigation is null', () => {
    routerSpy.currentNavigation.mockReturnValue(null);

    const result = executeGuard();

    expect(result).toBe(false);
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/');
  });
});
