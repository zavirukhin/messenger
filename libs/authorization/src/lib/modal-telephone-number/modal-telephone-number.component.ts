import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { defer } from 'rxjs';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { TuiCountryIsoCode } from '@taiga-ui/i18n';

import {
  TuiAppearance,
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
    TuiInputPhoneInternational,
    TuiCardLarge,
    TuiAppearance,
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
    })
  ]
})
export class ModalTelephoneNumberComponent {
  readonly countries: ReadonlyArray<TuiCountryIsoCode> = [
    'RU',
    'KZ',
    'UA',
    'BY'
  ];

  public readonly phoneForm = new FormGroup({
    phone: new FormControl('')
  });
}
