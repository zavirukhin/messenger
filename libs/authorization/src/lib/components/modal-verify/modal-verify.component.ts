import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiHeader } from '@taiga-ui/layout';

import {
  TuiButton,
  TuiIcon,
  TuiTextfield,
  TuiTitle
} from '@taiga-ui/core';

import {
  FormControl, 
  FormGroup, 
  ReactiveFormsModule, 
  Validators 
} from '@angular/forms';

@Component({
  selector: 'lib-modal-verify',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TuiHeader,
    TuiTitle,
    TuiTextfield,
    TuiButton,
    TuiIcon
  ],
  templateUrl: './modal-verify.component.html',
  styleUrl: './modal-verify.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalVerifyComponent {
  public readonly form = new FormGroup({
    code: new FormControl('', [Validators.required, Validators.maxLength(6)])
  });
}
