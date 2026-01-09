import { Directive, input } from '@angular/core';

@Directive({
  selector: 'label[data-tstSettingsOption],button[data-tstSettingsOption]',
  host: {
    "[attr.tabindex]": "0",
    "[attr.aria-description]": "'Press enter to select this option'",
    "class": "cursor-pointer px-2 py-1 rounded-lg border transition-all duration-200 inline-flex justify-center items-center gap-x-2.5 focus:outline-2 focus:outline-offset-2 focus:outline-blue-400",
    "[class]": "active() ? classes.active : classes.inactive",
    "(keydown.enter)": "onEnter($event)"
  }
})
export class SettingsOption {
  active = input.required<boolean>();
  classes = {
    active: "border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-blue-900",
    inactive: "border-neutral-400 hover:bg-neutral-0 hover:text-neutral-800",
  }

  onEnter(event: Event) {
    event.preventDefault();

    const target = event.target as HTMLElement;

    target.click();
    target.focus();
  }
}
