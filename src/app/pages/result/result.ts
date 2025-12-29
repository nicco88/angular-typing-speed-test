import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'tst-result',
  imports: [],
  templateUrl: './result.html',
  styleUrl: './result.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Result { }
