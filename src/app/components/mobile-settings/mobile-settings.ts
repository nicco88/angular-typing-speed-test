import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { SettingsOption } from '../../directives/settings-option';
import { BaseOption } from '../../models/typing-speed.models';

@Component({
  selector: 'tst-mobile-settings',
  imports: [SettingsOption],
  templateUrl: './mobile-settings.html',
  styleUrl: './mobile-settings.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileSettings<T extends BaseOption> {
  label = input.required<string>();
  options = input.required<T[]>();
  value = input.required<T["value"]>();
  id = input.required<string>();

  valueChange = output<T["value"]>();

  popoverOpen = signal(false);

  onPopoverToggle(e: ToggleEvent) {
    this.popoverOpen.set(e.newState === "open");
  }

  updateValue(value: string) {
    this.valueChange.emit(value);
  }
}
