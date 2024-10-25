import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { defer, Observable } from 'rxjs';
import { TuiHeader } from '@taiga-ui/layout';
import { TuiCountryIsoCode } from '@taiga-ui/i18n';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { PlatformService, Screen } from '@social/shared';

import {
  TuiButton,
  TuiError,
  TuiIcon,
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
  tuiInputPhoneInternationalOptionsProvider
} from '@taiga-ui/kit';

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
    TuiFieldErrorPipe
  ],
  templateUrl: './modal-telephone-number.component.html',
  styleUrl: './modal-telephone-number.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    tuiInputPhoneInternationalOptionsProvider({
      metadata: defer(async () => 
        import('libphonenumber-js/max/metadata').then((m) => m.default)
      )
    }),
    {
      provide: TUI_VALIDATION_ERRORS,
      deps: [TranslocoService],
      useFactory: (translocoService: TranslocoService) => {
        return {
          required: translocoService.translate('authorization.required'),
          minlength: translocoService.translate('authorization.minlength')
        }
      }
    }
  ]
})
export class ModalTelephoneNumberComponent {
  public readonly countries: ReadonlyArray<TuiCountryIsoCode> = [
    'RU',
    'KZ',
    'UA',
    'BY'
  ];

  public readonly phoneForm = new FormGroup({
    phone: new FormControl('', [
      Validators.required, 
      Validators.minLength(15)
    ])
  });

  private readonly platformService = inject(PlatformService);

  public readonly screen$: Observable<Screen> = this.platformService.getScreenType();

  public readonly Screen = Screen;

  public onSubmit(): void {
    console.log(this.phoneForm.controls.phone.errors);
    if (this.phoneForm.invalid) {
      this.phoneForm.markAllAsTouched();
    }
  }
}
