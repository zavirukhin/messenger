import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { defer, Observable } from 'rxjs';
import { TuiHeader } from '@taiga-ui/layout';
import { TuiCountryIsoCode } from '@taiga-ui/i18n';
import { provideTranslocoScope, TranslocoDirective } from '@jsverse/transloco';
import { PlatformService, Screen } from '@social/shared';
import { loader } from '../../transloco-loader';

import {
  TuiButton,
  TuiIcon,
  TuiTitle
} from '@taiga-ui/core';

import {
  FormControl,
  FormGroup,
  ReactiveFormsModule 
} from '@angular/forms';

import { 
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
    TuiIcon
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
    provideTranslocoScope({
      scope: 'authorization',
      loader
    })
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
    phone: new FormControl('')
  });

  private readonly platformService = inject(PlatformService);

  public readonly screen$: Observable<Screen> = this.platformService.getScreenType();

  public readonly Screen = Screen;
}
