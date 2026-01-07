import { Directive, input } from '@angular/core';

@Directive({
  selector: 'label[data-tstSettingsOption],button[data-tstSettingsOption]',
  host: {
    "class": "cursor-pointer px-2 py-1 rounded-lg border transition-all duration-300",
    "[class.border-neutral-400]": "!active()",
    "[class.border-blue-400]": "active()",
    "[class.text-blue-400]": "active()",
  }
})
export class SettingsOption {
  active = input.required<boolean>();
}
