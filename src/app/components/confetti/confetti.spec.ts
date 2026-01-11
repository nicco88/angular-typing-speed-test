import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { Confetti } from './confetti';

describe('Confetti', () => {
  let component: Confetti;
  let fixture: ComponentFixture<Confetti>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Confetti],
    })
    .overrideComponent(Confetti, {
      set: {
        template: `
          <svg #confettiWrapper>
            <path class="valid-path"></path>
            <defs>
              <clipPath>
                <path class="clip-path"></path>
              </clipPath>
            </defs>
          </svg>
        `
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(Confetti);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply animation styles to valid paths', () => {
    const path = fixture.nativeElement.querySelector('.valid-path') as HTMLElement;

    expect(path.style.animation).toContain('confetti');
    expect(path.style.animation).toContain('linear infinite');
    expect(path.style.animationDelay).toBeTruthy();
    expect(path.style.getPropertyValue('--drift')).toBeTruthy();
  });

  it('should not apply styles to paths inside clipPath', () => {
    const path = fixture.nativeElement.querySelector('.clip-path') as HTMLElement;

    expect(path.style.animation).toBe('');
    expect(path.style.animationDelay).toBe('');
    expect(path.style.getPropertyValue('--drift')).toBe('');
  });
});
