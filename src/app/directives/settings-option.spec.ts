import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SettingsOption } from './settings-option';

@Component({
  template: `
    <label data-tstSettingsOption [active]="isActive()">Option 1</label>
    <button data-tstSettingsOption [active]="false">Option 2</button>
  `,
  imports: [SettingsOption],
})
class TestHostComponent {
  isActive = signal(true);
}

describe('SettingsOption Directive', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should apply base attributes and classes', () => {
    const debugElement = fixture.debugElement.query(By.css('label'));
    const element = debugElement.nativeElement as HTMLElement;

    expect(element.getAttribute('tabindex')).toBe('0');
    expect(element.getAttribute('aria-description')).toBe('Press enter to select this option');
    expect(element.className).toContain('cursor-pointer');
    expect(element.className).toContain('inline-flex');
  });

  it('should apply active classes when active is true', () => {
    const debugElement = fixture.debugElement.query(By.css('label'));
    const element = debugElement.nativeElement as HTMLElement;

    expect(element.className).toContain('border-blue-400');
    expect(element.className).toContain('text-blue-400');
    expect(element.className).not.toContain('border-neutral-400');
  });

  it('should apply inactive classes when active is false', () => {
    const debugElement = fixture.debugElement.query(By.css('button'));
    const element = debugElement.nativeElement as HTMLElement;

    expect(element.className).toContain('border-neutral-400');
    expect(element.className).not.toContain('border-blue-400');
  });

  it('should toggle classes when input changes', () => {
    const debugElement = fixture.debugElement.query(By.css('label'));
    const element = debugElement.nativeElement as HTMLElement;

    // Initially active
    expect(element.className).toContain('border-blue-400');

    // Change to inactive
    component.isActive.set(false);

    fixture.detectChanges();

    expect(element.className).not.toContain('border-blue-400');
    expect(element.className).toContain('border-neutral-400');
  });

  it('should trigger click and focus on Enter key', () => {
    const debugElement = fixture.debugElement.query(By.css('label'));
    const element = debugElement.nativeElement as HTMLElement;

    const clickSpy = vi.spyOn(element, 'click');
    const focusSpy = vi.spyOn(element, 'focus');
    const preventDefaultSpy = vi.fn();

    debugElement.triggerEventHandler('keydown.enter', { preventDefault: preventDefaultSpy, target: element });

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(focusSpy).toHaveBeenCalled();
  });
});
