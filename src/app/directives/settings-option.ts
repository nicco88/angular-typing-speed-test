import { Directive, input } from '@angular/core';

@Directive({
  selector: 'label[data-tstSettingsOption],button[data-tstSettingsOption]',
  host: {
    "[attr.tabindex]": "0",
    "class": "cursor-pointer px-2 py-1 rounded-lg border transition-all duration-200 inline-flex justify-center items-center gap-x-2.5 focus:outline-2 focus:outline-neutral-0",
    "[class.border-neutral-400]": "!active()",
    "[class.hover:bg-neutral-0]": "!active()",
    "[class.hover:text-neutral-800]": "!active()",
    "[class.focus:outline-neutral-0]": "!active()",

    "[class.border-blue-400]": "active()",
    "[class.text-blue-400]": "active()",
    "[class.hover:bg-blue-400]": "active()",
    "[class.hover:text-blue-900]": "active()",
    "[class.focus:outline-blue-400]": "active()",
  }
})
export class SettingsOption {
  active = input.required<boolean>();
}
