import { AbstractControl, ValidationErrors } from '@angular/forms';
import { parsePhoneNumber } from 'libphonenumber-js/max';

export function phoneNumberValidator(control: AbstractControl): ValidationErrors | null {
  try {
    const phone = parsePhoneNumber(control.value);

    if (phone && phone.isValid()) {
      return null;
    }
  }
  catch { /* empty */ };

  return { phoneNumber: { value: control.value } };
}