import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseOption } from '../../models/typing-speed.models';
import { SettingsOption } from '../../directives/settings-option';

@Component({
  selector: 'tst-desktop-settings',
  imports: [SettingsOption],
  templateUrl: './desktop-settings.html',
  styleUrl: './desktop-settings.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DesktopSettings),
      multi: true,
    },
  ],
})
export class DesktopSettings<T extends BaseOption> implements ControlValueAccessor {
  label = input.required<string>();
  options = input.required<T[]>();
  name = input.required<string>();

  value = signal<T["value"] | null>(null);

  onChange: (value: T["value"]) => void = () => {};
  onTouched: () => void = () => {};

  updateValue(value: string) {
    this.value.set(value);
    this.onChange(value);
    this.onTouched();
  }

  writeValue(value: T["value"]): void {
    this.value.set(value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
