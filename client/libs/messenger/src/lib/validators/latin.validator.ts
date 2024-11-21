import { AbstractControl, ValidationErrors } from '@angular/forms';

export function latinValidator(control: AbstractControl): ValidationErrors | null {
  try {
    if (control.value === '') {
      return null;
    }

    if (control.value && control.value.match(/^[a-zA-Z]+$/)) {
      return null;
    }
  }
  catch { /* empty */ };

  return { latinValidator: { value: control.value } };
}