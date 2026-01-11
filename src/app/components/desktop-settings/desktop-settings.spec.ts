import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { describe, it, expect, beforeEach } from 'vitest';
import { DesktopSettings } from './desktop-settings';
import { BaseOption } from '../../models/typing-speed.models';

@Component({
  template: `
    <tst-desktop-settings
      [label]="label"
      [options]="options"
      [name]="name"
      [formControl]="control"
    />
  `,
  imports: [DesktopSettings, ReactiveFormsModule],
})
class TestHostComponent {
  label = 'Difficulty';
  name = 'difficulty';
  options: BaseOption[] = [
    { label: 'Easy', value: 'easy', id: 'easy' },
    { label: 'Medium', value: 'medium', id: 'medium' },
  ];
  control = new FormControl('easy');
}

describe('DesktopSettings', () => {
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
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('Difficulty');
  });

  it('should render options', () => {
    const options = fixture.debugElement.queryAll(By.css('[data-tstSettingsOption]'));

    expect(options.length).toBe(2);
    expect(options[0].nativeElement.textContent).toContain('Easy');
    expect(options[1].nativeElement.textContent).toContain('Medium');
  });

  it('should initialize with control value', () => {
    const settings = fixture.debugElement.query(By.directive(DesktopSettings)).componentInstance;
    expect(settings.value()).toBe('easy');
  });

  it('should update control when option is clicked', () => {
    const inputs = fixture.debugElement.queryAll(By.css('input[type="radio"]'));

    inputs[1].triggerEventHandler('change', null);

    fixture.detectChanges();

    expect(component.control.value).toBe('medium');
  });

  it('should update view when control changes', () => {
    const settings = fixture.debugElement.query(By.directive(DesktopSettings)).componentInstance;

    component.control.setValue('medium');

    fixture.detectChanges();

    expect(settings.value()).toBe('medium');
  });
});
