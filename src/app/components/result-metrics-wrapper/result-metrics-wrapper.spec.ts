import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, it, expect, beforeEach } from 'vitest';
import { ResultMetricsWrapper } from './result-metrics-wrapper';

@Component({
  template: `
    <tst-result-metrics-wrapper [title]="title()">
      <span class="projected-content">Content</span>
    </tst-result-metrics-wrapper>
  `,
  imports: [ResultMetricsWrapper],
})
class TestHostComponent {
  title = signal('Test Title');
}

describe('ResultMetricsWrapper', () => {
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

  it('should render title', () => {
    const dt = fixture.debugElement.query(By.css('dt')).nativeElement;

    expect(dt.textContent).toContain('Test Title:');
  });

  it('should render projected content', () => {
    const content = fixture.debugElement.query(By.css('.projected-content'));

    expect(content).toBeTruthy();
    expect(content.nativeElement.textContent).toContain('Content');
  });

  it('should update title when input changes', () => {
    component.title.set('New Title');

    fixture.detectChanges();

    const dt = fixture.debugElement.query(By.css('dt')).nativeElement;

    expect(dt.textContent).toContain('New Title:');
  });
});
