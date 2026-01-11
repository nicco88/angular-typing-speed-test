import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, it, expect, beforeEach } from 'vitest';
import { Button } from './button';

@Component({
  template: `
    <button data-tstButton>Default</button>
    <button data-tstButton variant="secondary">Secondary</button>
    <a data-tstButton variant="tertiary">Tertiary Link</a>
  `,
  imports: [Button],
})
class TestHostComponent {}

describe('Button Directive', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should apply base classes', () => {
    const debugElement = fixture.debugElement.query(By.css('button'));
    const classes = debugElement.nativeElement.className;

    expect(classes).toContain('cursor-pointer');
    expect(classes).toContain('px-6');
    expect(classes).toContain('py-4');
    expect(classes).toContain('rounded-[12px]');
  });

  it('should apply primary variant classes by default', () => {
    const debugElement = fixture.debugElement.queryAll(By.directive(Button))[0];
    const classes = debugElement.nativeElement.className;

    expect(classes).toContain('bg-blue-600');
    expect(classes).toContain('hover:bg-blue-400');
  });

  it('should apply secondary variant classes', () => {
    const debugElement = fixture.debugElement.queryAll(By.directive(Button))[1];
    const classes = debugElement.nativeElement.className;

    expect(classes).toContain('bg-neutral-0');
    expect(classes).toContain('text-neutral-900');
  });

  it('should apply tertiary variant classes on anchor element', () => {
    const debugElement = fixture.debugElement.query(By.css('a'));
    const classes = debugElement.nativeElement.className;

    expect(classes).toContain('bg-neutral-800');
    expect(classes).toContain('hover:bg-neutral-700');
  });
});
