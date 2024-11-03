import { ChangeDetectionStrategy, Component, input, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiHeader } from '@taiga-ui/layout';
import {
  TuiLink,
  TuiTextfield,
  TuiTitle
} from '@taiga-ui/core';
import {
  FormControl, 
  FormGroup, 
  ReactiveFormsModule, 
  Validators 
} from '@angular/forms';
import { PhoneVerify } from '../../interfaces/phone-verify.interface';

@Component({
  selector: 'lib-modal-verify',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TuiHeader,
    TuiTitle,
    TuiTextfield,
    TuiLink
  ],
  templateUrl: './modal-verify.component.html',
  styleUrl: './modal-verify.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalVerifyComponent {
  public readonly phoneVerify = input.required<Signal<PhoneVerify>>();

  public readonly form = new FormGroup({
    code: new FormControl('', [Validators.required, Validators.maxLength(6)])
  });
}
