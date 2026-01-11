import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { TypingSpeedService } from './services/typing-speed.service';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';

describe('App', () => {
  const personalBest = signal(0);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        {
          provide: TypingSpeedService,
          useValue: { personalBest },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);

    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('h1')?.textContent).toContain('Typing Speed Test');
  });

  it('should render personal best', () => {
    const fixture = TestBed.createComponent(App);

    personalBest.set(42);

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('dd')?.textContent).toContain('42 WPM');
  });
});
