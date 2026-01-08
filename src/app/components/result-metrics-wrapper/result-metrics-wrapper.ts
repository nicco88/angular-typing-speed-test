import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'tst-result-metrics-wrapper',
  imports: [],
  template: `
  <div class="border border-neutral-400 rounded-xl px-6 py-4 bg-neutral-900/90">
    <dt class="text-neutral-400 text-xl mb-3">{{ title() }}:</dt>

    <ng-content />
  </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultMetricsWrapper {
  title = input.required<string>();
}
