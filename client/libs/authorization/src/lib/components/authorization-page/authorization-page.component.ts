import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiCardLarge } from '@taiga-ui/layout';
import { ModalTelephoneNumberComponent } from '../modal-telephone-number/modal-telephone-number.component';
import { Step } from '../../types/step.type';

@Component({
  selector: 'lib-authorization-page',
  standalone: true,
  imports: [
    CommonModule,
    TuiCardLarge,
    ModalTelephoneNumberComponent
  ],
  templateUrl: './authorization-page.component.html',
  styleUrl: './authorization-page.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthorizationPageComponent {
  public phone = '';

  public step: Step = 'phone';

  public onPhoneChanged(phone: string) {
    this.phone = phone;
    this.step = 'verify';
  }
}
