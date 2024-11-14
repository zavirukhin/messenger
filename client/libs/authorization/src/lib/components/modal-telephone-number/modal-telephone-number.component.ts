import { CommonModule } from '@angular/common';
import { TuiHeader } from '@taiga-ui/layout';
import { TuiCountryIsoCode } from '@taiga-ui/i18n';
import { TranslocoDirective } from '@jsverse/transloco';
import { defer, finalize } from 'rxjs';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output
} from '@angular/core';
import {
  TuiButton,
  TuiError,
  TuiTitle
} from '@taiga-ui/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule, 
  Validators
} from '@angular/forms';
import { 
  TuiFieldErrorPipe,
  TuiInputPhoneInternational,
  tuiInputPhoneInternationalOptionsProvider,
  TuiSkeleton
} from '@taiga-ui/kit';
import { AuthorizationService } from '../../services/authorization/authorization.service';
import { NextAttempt } from '../../interfaces/next-attempt.interface';
import { PhoneVerify } from '../../interfaces/phone.interface';
import { phoneNumberValidator } from '../../validators/phone.validator';

@Component({
  selector: 'lib-modal-telephone-number',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslocoDirective,
    TuiInputPhoneInternational,
    TuiHeader,
    TuiTitle,
    TuiButton,
    TuiError,
    TuiSkeleton,
    TuiFieldErrorPipe
  ],
  templateUrl: './modal-telephone-number.component.html',
  styleUrl: './modal-telephone-number.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    tuiInputPhoneInternationalOptionsProvider({
      metadata: defer(async () => 
        import('libphonenumber-js/min/metadata').then((m) => m.default)
      )
    })
  ]
})
export class ModalTelephoneNumberComponent {
  public phoneChanged = output<PhoneVerify>();

  public readonly countries: ReadonlyArray<TuiCountryIsoCode> = [
    'RU',
    'KZ',
    'UA',
    'BY'
  ];

  public readonly form = new FormGroup({
    phone: new FormControl('', [Validators.required, phoneNumberValidator])
  });

  private readonly authorizationService = inject(AuthorizationService);

  public onSubmit(): void {
    if (this.form.valid) {
      this.form.disable();

      const phone = this.form.get('phone')?.value ?? '';
      this.authorizationService.sendCode(phone).pipe(
        finalize(() => {
          this.form.enable();
        })
      ).subscribe((nextAttempt: NextAttempt) => {
        this.phoneChanged.emit({...nextAttempt, phone});
      });
    }
    else {
      this.form.markAllAsTouched();
    }
  }
}
