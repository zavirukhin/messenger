import { CommonModule } from '@angular/common';
import { TuiHeader } from '@taiga-ui/layout';
import { TuiCountryIsoCode } from '@taiga-ui/i18n';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { catchError, defer, of } from 'rxjs';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
  signal
} from '@angular/core';
import {
  TuiAlertService,
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
  TUI_VALIDATION_ERRORS,
  TuiFieldErrorPipe,
  TuiInputPhoneInternational,
  tuiInputPhoneInternationalOptionsProvider,
  TuiSkeleton
} from '@taiga-ui/kit';
import { RequestError } from '@social/shared';
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
    TuiFieldErrorPipe,
    TuiSkeleton
  ],
  templateUrl: './modal-telephone-number.component.html',
  styleUrl: './modal-telephone-number.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    tuiInputPhoneInternationalOptionsProvider({
      metadata: defer(async () => 
        import('libphonenumber-js/min/metadata').then((m) => m.default)
      )
    }),
    {
      provide: TUI_VALIDATION_ERRORS,
      deps: [TranslocoService],
      useFactory: (translocoService: TranslocoService) => ({
        required: translocoService.translate('required'),
        phoneNumber: translocoService.translate('phoneNumber')
      })
    }
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

  private readonly alerts = inject(TuiAlertService);

  private readonly translocoService = inject(TranslocoService);

  public readonly isLoading = signal(false);

  public onSubmit(): void {
    if (this.form.valid) {
      this.isLoading.set(true);
      this.form.disable();

      const phone = this.form.get('phone')?.value ?? '';
      this.authorizationService.sendCode(phone)
        .pipe(
          catchError((error: RequestError) => {
            this.isLoading.set(false);
            this.form.enable();

            this.alerts.open(error.message, {
              label: this.translocoService.translate('error'),
              appearance: 'error'
            })
            .subscribe();

            return of();
          })
        )
        .subscribe((nextAttempt: NextAttempt) => {
          this.isLoading.set(false);
          this.form.enable();

          this.phoneChanged.emit({...nextAttempt, phone});
        });
    }
    else {
      this.form.markAllAsTouched();
    }
  }
}
