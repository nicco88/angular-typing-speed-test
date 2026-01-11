import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { Confetti } from '../../components/confetti/confetti';
import { ResultMetricsWrapper } from '../../components/result-metrics-wrapper/result-metrics-wrapper';
import { TypingSpeedService } from '../../services/typing-speed.service';
import { Result } from './result';

describe('Result', () => {
  let component: Result;
  let fixture: ComponentFixture<Result>;
  let routerMock: any;
  let typingSpeedServiceMock: any;

  const setup = async (state = { isFirstTime: false, isPersonalBest: false }) => {
    routerMock = {
      navigate: vi.fn(),
      navigateByUrl: vi.fn(),
      currentNavigation: vi.fn().mockReturnValue({ extras: { state } }),
      createUrlTree: vi.fn().mockReturnValue('/'),
      serializeUrl: vi.fn(),
      parseUrl: vi.fn(),
      events: new Observable(),
    };

    // Mock history.state as fallback/alternative
    Object.defineProperty(window.history, 'state', {
      value: state,
      writable: true,
    });

    typingSpeedServiceMock = {
      getWpm$: vi.fn().mockReturnValue(of(60)),
      accuracy$: of(95),
      rightVsWrongChars$: of({ correctChars: 100, wrongChars: 5 }),
    };

    await TestBed.configureTestingModule({
      imports: [Result],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: {} },
        { provide: TypingSpeedService, useValue: typingSpeedServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Result);
    component = fixture.componentInstance;

    fixture.detectChanges();
  };

  it('should create', async () => {
    await setup();

    expect(component).toBeTruthy();
  });

  it('should render metrics', async () => {
    await setup();

    const metrics = fixture.debugElement.queryAll(By.directive(ResultMetricsWrapper));

    expect(metrics.length).toBeGreaterThan(0);
  });

  it('should show "Baseline Established!" when isFirstTime is true', async () => {
    await setup({ isFirstTime: true, isPersonalBest: false });

    const header = fixture.nativeElement.querySelector('h1');

    expect(header.textContent).toContain('Baseline Established!');
  });

  it('should show "High Score Smashed!" when isPersonalBest is true', async () => {
    await setup({ isFirstTime: false, isPersonalBest: true });

    const header = fixture.nativeElement.querySelector('h1');

    expect(header.textContent).toContain('High Score Smashed!');
  });

  it('should show confetti when isPersonalBest is true', async () => {
    await setup({ isFirstTime: false, isPersonalBest: true });

    const confetti = fixture.debugElement.query(By.directive(Confetti));

    expect(confetti).toBeTruthy();
  });

  it('should not show confetti when isPersonalBest is false', async () => {
    await setup({ isFirstTime: false, isPersonalBest: false });

    const confetti = fixture.debugElement.query(By.directive(Confetti));

    expect(confetti).toBeFalsy();
  });

  it('should navigate to home on play again', async () => {
    await setup();

    const a = fixture.debugElement.query(By.css('a'));

    a.triggerEventHandler('click', { button: 0, ctrlKey: false, metaKey: false, shiftKey: false });

    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/', expect.anything());
  });
});
