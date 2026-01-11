import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TypingSpeedService } from './typing-speed.service';
import { CharState } from '../models/typing-speed.models';

describe('TypingSpeedService', () => {
  let service: TypingSpeedService;
  let routerSpy: { navigateByUrl: any };

  beforeEach(() => {
    routerSpy = { navigateByUrl: vi.fn() };

    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn(),
      removeItem: vi.fn(),
      key: vi.fn(),
      length: 0,
    };

    vi.stubGlobal('localStorage', localStorageMock);

    TestBed.configureTestingModule({
      providers: [
        TypingSpeedService,
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(TypingSpeedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('WPM', () => {
    it('should update and get WPM', () => {
      let currentWpm = 0;
      const subscription = service.getWpm$().subscribe(wpm => currentWpm = wpm);

      service.updateWpm(50);

      expect(currentWpm).toBe(50);

      subscription.unsubscribe();
    });
  });

  describe('Test Text', () => {
    it('should update and get test text', () => {
      const testText: CharState[] = [{ value: 'a', state: 'PENDING', historicalError: false }];
      let currentText: CharState[] = [];
      const subscription = service.getTestText$().subscribe(text => currentText = text);

      service.updateTestText(testText);

      expect(currentText).toEqual(testText);

      subscription.unsubscribe();
    });

    it('should generate chars state from string', () => {
      const text = "Hi how are you?";
      const result = service.getCharsState(text);

      expect(result).toEqual([
        { value: 'H', state: 'PENDING', historicalError: false },
        { value: 'i', state: 'PENDING', historicalError: false },
        { value: ' ', state: 'PENDING', historicalError: false },
        { value: 'h', state: 'PENDING', historicalError: false },
        { value: 'o', state: 'PENDING', historicalError: false },
        { value: 'w', state: 'PENDING', historicalError: false },
        { value: ' ', state: 'PENDING', historicalError: false },
        { value: 'a', state: 'PENDING', historicalError: false },
        { value: 'r', state: 'PENDING', historicalError: false },
        { value: 'e', state: 'PENDING', historicalError: false },
        { value: ' ', state: 'PENDING', historicalError: false },
        { value: 'y', state: 'PENDING', historicalError: false },
        { value: 'o', state: 'PENDING', historicalError: false },
        { value: 'u', state: 'PENDING', historicalError: false },
        { value: '?', state: 'PENDING', historicalError: false },
      ]);
    });
  });

  describe('Calculations', () => {
    it('should calculate WPM correctly', () => {
      // 5 chars = 1 word - 1 minute (60000ms) -> 1 WPM.
      expect(service.calculateWpm(5, 0, 60000)).toBe(1);

      // 25 chars = 5 words - 0.5 minute (30000ms) -> 10 WPM.
      expect(service.calculateWpm(25, 0, 30000)).toBe(10);
    });

    it('should calculate Net WPM correctly', () => {
      expect(service.calculateNetWpm(10, 100)).toBe(10);
      expect(service.calculateNetWpm(10, 50)).toBe(5);
      expect(service.calculateNetWpm(10, 0)).toBe(0);
    });

    it('should get completed chars count', () => {
      const text: CharState[] = [
        { value: 'a', state: 'CORRECT', historicalError: false },
        { value: 'b', state: 'CORRECT', historicalError: false },
        { value: 'c', state: 'PENDING', historicalError: false }
      ];

      expect(service.getCompletedChars(text)).toBe(2);
    });
  });

  describe('Formatting', () => {
    it('should format seconds to string time', () => {
      expect(service.secondsToStringTime(60)).toBe('1:00');
      expect(service.secondsToStringTime(65)).toBe('1:05');
      expect(service.secondsToStringTime(9)).toBe('0:09');
      expect(service.secondsToStringTime(0)).toBe('0:00');
    });
  });

  describe('Character Validation', () => {
    it('should allow valid characters', () => {
      const validEvent = { key: 'a', code: 'KeyA', charCode: 97, length: 1 } as unknown as KeyboardEvent;

      expect(service.isCharAllowed(validEvent)).toBe(true);
    });

    it('should allow backspace', () => {
      const backspaceEvent = { key: 'Backspace', code: 'Backspace', charCode: 0, length: 9 } as unknown as KeyboardEvent;

      expect(service.isCharAllowed(backspaceEvent)).toBe(true);
    });

    it('should allow space', () => {
      const spaceEvent = { key: ' ', code: 'Space', charCode: 32, length: 1 } as unknown as KeyboardEvent;

      expect(service.isCharAllowed(spaceEvent)).toBe(true);
    });

    it('should not allow modifier keys', () => {
      const shiftEvent = { key: 'Shift', code: 'ShiftLeft', charCode: 0, length: 5 } as unknown as KeyboardEvent;

      expect(service.isCharAllowed(shiftEvent)).toBe(false);
    });
  });

  describe('Result State', () => {
    it('should return default result if wpm is null', () => {
      expect(service.getResultState(undefined)).toEqual({ isFirstTime: false, isPersonalBest: false });
    });

    it('should set personal best if first time (current is 0)', () => {
      service.personalBest.set(0);

      const result = service.getResultState(50);

      expect(result).toEqual({ isFirstTime: true, isPersonalBest: false });
      expect(service.personalBest()).toBe(50);
    });

    it('should set personal best if higher than current', () => {
      service.personalBest.set(40);

      const result = service.getResultState(50);

      expect(result).toEqual({ isFirstTime: false, isPersonalBest: true });
      expect(service.personalBest()).toBe(50);
    });
  });
});
