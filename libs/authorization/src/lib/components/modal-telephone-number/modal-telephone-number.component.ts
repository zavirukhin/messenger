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
  TuiIcon,
  TuiLoader,
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
import { Router } from '@angular/router';

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
    TuiIcon,
    TuiError,
    TuiFieldErrorPipe,
    TuiLoader,
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
      useFactory: (translocoService: TranslocoService) => {
        return {
          required: translocoService.translate('required')
        }
      }
    },
    DestroyService
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

  public readonly phoneForm = new FormGroup({
    phone: new FormControl('', [Validators.required])
  });

  private readonly authorizationService = inject(AuthorizationService);

  private readonly alerts = inject(TuiAlertService);

  private readonly translocoService = inject(TranslocoService);

  private readonly router = inject(Router);

  public readonly isLoading = signal(false);

  public readonly isLoading = signal(false);

  public onSubmit(): void {
    if (this.phoneForm.valid) {
      this.isLoading.set(true);
      this.phoneForm.disable();

      const phone = this.phoneForm.get('phone')?.value ?? '';
      this.authorizationService.sendCode(phone)
        .pipe(
          catchError((error: RequestError) => {
            this.isLoading.set(false);
            this.phoneForm.enable();

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
          this.phoneForm.enable();

          this.router.navigate(['/messenger']);

          this.phoneChanged.emit({...nextAttempt, phone});
        });
    }
    else {
      this.phoneForm.markAllAsTouched();
    }
  }
}
