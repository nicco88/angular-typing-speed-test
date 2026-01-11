import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Home } from './home';
import { TypingSpeedService } from '../../services/typing-speed.service';
import { UtilsService } from '../../services/utils.service';
import { of } from 'rxjs';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  let typingSpeedServiceMock: any;
  let utilsServiceMock: any;
  let routerMock: any;

  beforeEach(async () => {
    typingSpeedServiceMock = {
      getTestText$: vi.fn().mockReturnValue(of([])),
      getTestStarted$: vi.fn().mockReturnValue(of(false)),
      countdown$: of('60'),
      infiniteTimer$: of('0'),
      time$: of('60'),
      getWpm$: vi.fn().mockReturnValue(of(0)),
      accuracy$: of(100),
      updateTestStarted: vi.fn(),
      updateTestText: vi.fn(),
      updateWpm: vi.fn(),
      getCharsState: vi.fn().mockReturnValue([]),
      updateMode: vi.fn(),
      isCharAllowed: vi.fn().mockReturnValue(true),
      getResultState: vi.fn(),
      getCompletedChars: vi.fn(),
      calculateWpm: vi.fn(),
      calculateNetWpm: vi.fn(),
    };

    utilsServiceMock = {
      getRandomIndex: vi.fn().mockReturnValue(0),
    };

    routerMock = {
      navigateByUrl: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: {} },
        { provide: TypingSpeedService, useValue: typingSpeedServiceMock },
        { provide: UtilsService, useValue: utilsServiceMock },
      ],
    })
    .overrideComponent(Home, {
      set: { template: '' }
    })
    .compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start challenge', () => {
    component.onStartChallenge();

    expect(typingSpeedServiceMock.updateTestStarted).toHaveBeenCalledWith(true);
  });

  it('should restart challenge', () => {
    component.onRestartChallenge('easy');

    expect(utilsServiceMock.getRandomIndex).toHaveBeenCalled();
    expect(typingSpeedServiceMock.getCharsState).toHaveBeenCalled();
    expect(typingSpeedServiceMock.updateTestText).toHaveBeenCalled();
    expect(typingSpeedServiceMock.updateTestStarted).toHaveBeenCalledWith(false);
    expect(typingSpeedServiceMock.updateWpm).toHaveBeenCalledWith(0);
  });
});
