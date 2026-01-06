import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'tst-metrics-data',
  imports: [],
  template: `
    <div class="text-center flex flex-col md:flex-row md:items-center md:gap-x-3 ">
      <dt class="text-neutral-400 text-lg">{{ dataTitle() }}:</dt>
      <dd
        class="font-bold text-xl tabular-nums"
        [class.text-yellow-400]="dataIsYellow()"
        [class.text-red-500]="dataIsRed()"
      >
        {{ dataValue() }}
      </dd>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricsData {
  dataTitle = input.required<string>();
  dataValue = input.required<number | string>();
  dataIsYellow = input<boolean>();
  dataIsRed = input<boolean>();
}
