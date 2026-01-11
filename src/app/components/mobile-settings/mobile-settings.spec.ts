import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MobileSettings } from './mobile-settings';
import { BaseOption } from '../../models/typing-speed.models';

@Component({
  template: `
    <tst-mobile-settings
      [label]="label"
      [options]="options"
      [id]="id"
      [formControl]="control"
    />
  `,
  imports: [MobileSettings, ReactiveFormsModule],
})
class TestHostComponent {
  label = 'Difficulty';
  id = 'difficulty';
  options: BaseOption[] = [
    { label: 'Easy', value: 'easy', id: 'easy' },
    { label: 'Medium', value: 'medium', id: 'medium' },
  ];
  control = new FormControl('easy');
}

describe('MobileSettings', () => {
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

  it('should render label', () => {
    const button = fixture.debugElement.query(By.css('button[data-tstSettingsOption]'));

    expect(button.nativeElement.textContent).toContain('Difficulty');
  });

  it('should render options in popover', () => {
    const popover = fixture.debugElement.query(By.css('.settings-popover'));
    const options = popover.queryAll(By.css('button.group'));

    expect(options.length).toBe(2);
    expect(options[0].nativeElement.textContent).toContain('Easy');
    expect(options[1].nativeElement.textContent).toContain('Medium');
  });

  it('should initialize with control value', () => {
    const settings = fixture.debugElement.query(By.directive(MobileSettings)).componentInstance;

    expect(settings.value()).toBe('easy');
  });

  it('should update control when option is clicked', () => {
    const popover = fixture.debugElement.query(By.css('.settings-popover'));
    const options = popover.queryAll(By.css('button.group'));

    options[1].triggerEventHandler('click', null);

    fixture.detectChanges();

    expect(component.control.value).toBe('medium');
  });

  it('should update view when control changes', () => {
    const settings = fixture.debugElement.query(By.directive(MobileSettings)).componentInstance;

    component.control.setValue('medium');

    fixture.detectChanges();

    expect(settings.value()).toBe('medium');
  });

  it('should handle popover toggle and touch status', () => {
    const settings = fixture.debugElement.query(By.directive(MobileSettings)).componentInstance;
    const popoverElement = fixture.debugElement.query(By.css('.settings-popover'));
    const onTouchedSpy = vi.spyOn(settings, 'onTouched');

    // Simulate open
    popoverElement.triggerEventHandler('toggle', { newState: 'open' });

    expect(settings.popoverOpen()).toBe(true);

    // Simulate close
    popoverElement.triggerEventHandler('toggle', { newState: 'closed' });

    expect(settings.popoverOpen()).toBe(false);
    expect(onTouchedSpy).toHaveBeenCalled();
  });
});
