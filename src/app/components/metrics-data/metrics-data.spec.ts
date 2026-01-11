import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, it, expect, beforeEach } from 'vitest';
import { MetricsData } from './metrics-data';

describe('MetricsData', () => {
  let fixture: ComponentFixture<MetricsData>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetricsData],
    }).compileComponents();

    fixture = TestBed.createComponent(MetricsData);
  });

  it('should render title and value', () => {
    fixture.componentRef.setInput('dataTitle', 'WPM');
    fixture.componentRef.setInput('dataValue', 60);

    fixture.detectChanges();

    const dt = fixture.debugElement.query(By.css('dt')).nativeElement;
    const dd = fixture.debugElement.query(By.css('dd')).nativeElement;

    expect(dt.textContent).toContain('WPM:');
    expect(dd.textContent).toContain('60');
  });

  it('should apply yellow class when dataIsYellow is true', () => {
    fixture.componentRef.setInput('dataTitle', 'Accuracy');
    fixture.componentRef.setInput('dataValue', '90%');
    fixture.componentRef.setInput('dataIsYellow', true);

    fixture.detectChanges();

    const dd = fixture.debugElement.query(By.css('dd')).nativeElement;

    expect(dd.className).toContain('text-yellow-400');
  });

  it('should apply red class when dataIsRed is true', () => {
    fixture.componentRef.setInput('dataTitle', 'Errors');
    fixture.componentRef.setInput('dataValue', 5);
    fixture.componentRef.setInput('dataIsRed', true);

    fixture.detectChanges();

    const dd = fixture.debugElement.query(By.css('dd')).nativeElement;
    
    expect(dd.className).toContain('text-red-500');
  });
});
